import asyncio
import numpy as np
from typing import List, Optional
from datetime import datetime
from pathlib import Path
from PIL import Image
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.models.item import Item, ItemType, ItemStatus
from app.models.match import Match, MatchStatus
from app.services.scoring import ScoringEngine
from app.utils.validators import extract_ocr_tokens

settings = get_settings()

# Optional ML loader with graceful fallback
_siglip_model = None
_siglip_processor = None
_siglip_tokenizer = None

def get_siglip_models():
    """Lazy-load SigLIP model and processor"""
    global _siglip_model, _siglip_processor, _siglip_tokenizer
    if _siglip_model is None:
        try:
            from transformers import AutoProcessor, AutoModel
            import torch
            _siglip_processor = AutoProcessor.from_pretrained(settings.SIGLIP_MODEL)
            _siglip_model = AutoModel.from_pretrained(settings.SIGLIP_MODEL)
            _siglip_model.eval()
        except Exception as e:
            # Fallback will generate normalized deterministic embeddings
            _siglip_model = "FALLBACK"
    return _siglip_model, _siglip_processor

def compute_text_embedding(text: str) -> List[float]:
    """Compute 768-d text embedding using SigLIP or deterministic hashing fallback"""
    if not text:
        return [0.0] * 768
    
    model, processor = get_siglip_models()
    if model != "FALLBACK" and model is not None and processor is not None:
        try:
            import torch
            inputs = processor(text=[text], return_tensors="pt", padding=True)
            with torch.no_grad():
                text_features = model.get_text_features(**inputs)
                # Normalize
                text_features = text_features / text_features.norm(dim=-1, keepdim=True)
                return text_features[0].tolist()
        except Exception:
            pass

    # High-quality deterministic fallback embedding (768-dim) for offline/lightweight testing
    vec = np.zeros(768, dtype=np.float32)
    words = text.lower().split()
    for idx, word in enumerate(words):
        for char_idx, char in enumerate(word):
            pos = (ord(char) * 31 + idx * 17 + char_idx * 7) % 768
            vec[pos] += 1.0 / (char_idx + 1)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()

def compute_image_embedding(image_path: str) -> Optional[List[float]]:
    """Compute 768-d image embedding using SigLIP or deterministic fallback"""
    try:
        abs_path = Path(image_path)
        if not abs_path.is_absolute():
            # If path is URL like /uploads/...
            clean_rel = image_path.lstrip("/").replace("uploads/", "")
            abs_path = Path(settings.UPLOAD_DIR) / clean_rel

        if not abs_path.exists():
            return None

        img = Image.open(abs_path).convert("RGB")
        model, processor = get_siglip_models()

        if model != "FALLBACK" and model is not None and processor is not None:
            try:
                import torch
                inputs = processor(images=img, return_tensors="pt")
                with torch.no_grad():
                    image_features = model.get_image_features(**inputs)
                    image_features = image_features / image_features.norm(dim=-1, keepdim=True)
                    return image_features[0].tolist()
            except Exception:
                pass

        # Deterministic color/structural embedding fallback
        resized = img.resize((32, 24))
        arr = np.array(resized, dtype=np.float32) / 255.0
        vec = arr.flatten()[:768]
        if len(vec) < 768:
            vec = np.pad(vec, (0, 768 - len(vec)))
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()
    except Exception:
        return None

def extract_ocr_from_image(image_path: str) -> List[str]:
    """Extract OCR tokens from an image using pytesseract if available"""
    try:
        import pytesseract
        abs_path = Path(image_path)
        if not abs_path.is_absolute():
            clean_rel = image_path.lstrip("/").replace("uploads/", "")
            abs_path = Path(settings.UPLOAD_DIR) / clean_rel
        if abs_path.exists():
            img = Image.open(abs_path)
            raw_text = pytesseract.image_to_string(img)
            return extract_ocr_tokens(raw_text)
    except Exception:
        pass
    return []

class MatchingService:
    @staticmethod
    def process_new_item_sync(item_id: int):
        """Synchronous task to compute embeddings and run matching against opposite items"""
        db: Session = SessionLocal()
        try:
            item = db.query(Item).filter(Item.id == item_id).first()
            if not item:
                return

            # 1. Generate text embedding
            combined_text = f"{item.title} {item.description} {item.campus_zone} {item.category.value if hasattr(item.category, 'value') else item.category}"
            item.text_embedding = compute_text_embedding(combined_text)

            # 2. Generate image embedding if images exist
            all_ocr_tokens = list(item.ocr_tokens or [])
            if item.image_urls and len(item.image_urls) > 0:
                first_img = item.image_urls[0]
                item.image_embedding = compute_image_embedding(first_img)
                # OCR from images
                for img_url in item.image_urls:
                    tokens = extract_ocr_from_image(img_url)
                    for t in tokens:
                        if t not in all_ocr_tokens:
                            all_ocr_tokens.append(t)
                item.ocr_tokens = all_ocr_tokens

            db.commit()

            # 3. Match against opposite category
            opposite_type = ItemType.FOUND if item.type == ItemType.LOST else ItemType.LOST
            candidate_items = db.query(Item).filter(
                Item.type == opposite_type,
                Item.status == ItemStatus.OPEN
            ).all()

            for candidate in candidate_items:
                lost_item = item if item.type == ItemType.LOST else candidate
                found_item = candidate if item.type == ItemType.LOST else item

                visual_score = ScoringEngine.calculate_visual_score(
                    lost_item.image_embedding,
                    found_item.image_embedding
                )
                text_score = ScoringEngine.calculate_text_score(
                    lost_item.text_embedding,
                    found_item.text_embedding
                )
                category_score = ScoringEngine.calculate_category_score(
                    lost_item.category.value if hasattr(lost_item.category, 'value') else str(lost_item.category),
                    found_item.category.value if hasattr(found_item.category, 'value') else str(found_item.category)
                )
                spatial_decay = ScoringEngine.calculate_spatial_decay(
                    lost_item.latitude, lost_item.longitude,
                    found_item.latitude, found_item.longitude,
                    lost_item.campus_zone, found_item.campus_zone
                )
                temporal_decay = ScoringEngine.calculate_temporal_decay(
                    lost_item.incident_time,
                    found_item.incident_time
                )
                ocr_bonus = ScoringEngine.calculate_ocr_bonus(
                    lost_item.ocr_tokens or [],
                    found_item.ocr_tokens or []
                )

                total_score, match_status_str = ScoringEngine.calculate_total_score(
                    visual_score=visual_score,
                    text_score=text_score,
                    category_score=category_score,
                    spatial_decay=spatial_decay,
                    temporal_decay=temporal_decay,
                    ocr_bonus=ocr_bonus,
                    has_image_1=bool(lost_item.image_urls and len(lost_item.image_urls) > 0),
                    has_image_2=bool(found_item.image_urls and len(found_item.image_urls) > 0)
                )

                if match_status_str != "REJECTED":
                    # Check if match already exists
                    existing = db.query(Match).filter(
                        Match.lost_item_id == lost_item.id,
                        Match.found_item_id == found_item.id
                    ).first()

                    if existing:
                        existing.visual_score = visual_score
                        existing.text_score = text_score
                        existing.category_score = category_score
                        existing.spatial_decay = spatial_decay
                        existing.temporal_decay = temporal_decay
                        existing.ocr_bonus = ocr_bonus
                        existing.total_score = total_score
                        existing.status = MatchStatus[match_status_str]
                    else:
                        new_match = Match(
                            lost_item_id=lost_item.id,
                            found_item_id=found_item.id,
                            visual_score=visual_score,
                            text_score=text_score,
                            category_score=category_score,
                            spatial_decay=spatial_decay,
                            temporal_decay=temporal_decay,
                            ocr_bonus=ocr_bonus,
                            total_score=total_score,
                            status=MatchStatus[match_status_str]
                        )
                        db.add(new_match)

            db.commit()
        finally:
            db.close()

    @staticmethod
    async def process_new_item_async(item_id: int):
        """Asynchronous wrapper for background execution"""
        await asyncio.to_thread(MatchingService.process_new_item_sync, item_id)
