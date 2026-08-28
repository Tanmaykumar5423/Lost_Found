from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from datetime import datetime
from pathlib import Path

from app.core.database import get_db
from app.core.config import get_settings
from app.models.item import Item, ItemType, ItemCategory, ItemStatus
from app.schemas.item import ItemCreate, ItemResponse, ItemListResponse
from app.utils.validators import validate_file_extension, extract_ocr_tokens
from app.core.security import get_current_user_id

router = APIRouter()
settings = get_settings()

@router.post("/report", response_model=ItemResponse)
async def report_item(
    type: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    campus_zone: str = Form(...),
    incident_time: str = Form(...),
    is_high_value: bool = Form(False),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Report a lost or found item with up to 3 images"""
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Validate input
    if type not in [e.value for e in ItemType]:
        raise HTTPException(status_code=400, detail=f"Invalid type: {type}")
    
    if category not in [e.value for e in ItemCategory]:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")
    
    # Process images
    image_urls = []
    if images and len(images) <= 3:
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        for i, image in enumerate(images):
            if not validate_file_extension(image.filename):
                raise HTTPException(status_code=400, detail=f"Invalid file type: {image.filename}")
            
            # Save file
            timestamp = datetime.utcnow().timestamp()
            filename = f"{user_id}_{timestamp}_{i}_{image.filename}"
            filepath = upload_dir / filename
            
            content = await image.read()
            with open(filepath, "wb") as f:
                f.write(content)
            
            image_urls.append(f"/uploads/{filename}")
    
    # Parse incident time
    try:
        incident_dt = datetime.fromisoformat(incident_time)
    except:
        incident_dt = datetime.utcnow()
    
    # Extract OCR tokens from description
    ocr_tokens = extract_ocr_tokens(description)
    
    # Create item
    db_item = Item(
        user_id=user_id,
        type=ItemType[type.upper()],
        title=title,
        description=description,
        category=ItemCategory[category.upper()],
        campus_zone=campus_zone,
        incident_time=incident_dt,
        image_urls=image_urls,
        ocr_tokens=ocr_tokens,
        is_high_value=is_high_value,
        latitude=latitude,
        longitude=longitude
    )
    
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    
    return ItemResponse.from_orm(db_item)

@router.get("/feed", response_model=List[ItemListResponse])
async def get_feed(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    campus_zone: Optional[str] = None,
    type: Optional[str] = None,
    current_user_id: int = None,
    db: Session = Depends(get_db)
):
    """Get paginated feed of open items with masking for sensitive items"""
    
    query = db.query(Item).filter(Item.status == ItemStatus.OPEN)
    
    # Apply filters
    if category:
        query = query.filter(Item.category == category)
    if campus_zone:
        query = query.filter(Item.campus_zone == campus_zone)
    if type:
        query = query.filter(Item.type == type)
    
    items = query.order_by(Item.created_at.desc()).offset(skip).limit(limit).all()
    
    # Mask high-value items for non-owners
    results = []
    for item in items:
        if item.is_high_value and item.user_id != current_user_id:
            # Mask image URLs for sensitive items
            item.image_urls = []
        results.append(ItemListResponse.from_orm(item))
    
    return results

@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int, db: Session = Depends(get_db)):
    """Get single item details"""
    
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return ItemResponse.from_orm(item)

@router.get("/", response_model=List[ItemResponse])
async def get_user_items(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get user's items"""
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    items = db.query(Item).filter(Item.user_id == user_id).all()
    return [ItemResponse.from_orm(item) for item in items]
