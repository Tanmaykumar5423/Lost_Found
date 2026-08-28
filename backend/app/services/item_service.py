from typing import List, Optional
from datetime import datetime
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.models.item import Item, ItemType, ItemCategory, ItemStatus
from app.models.user import User, UserRole
from app.schemas.item import ItemResponse, ItemListResponse
from app.services.storage_service import StorageService
from app.utils.validators import extract_ocr_tokens
from app.utils.helpers import parse_iso_datetime

class ItemService:
    @staticmethod
    async def create_item(
        user: User,
        item_type: str,
        title: str,
        description: str,
        category: str,
        campus_zone: str,
        incident_time: str,
        is_high_value: bool,
        latitude: Optional[float],
        longitude: Optional[float],
        private_details: Optional[str],
        images: Optional[List[UploadFile]],
        db: Session
    ) -> Item:
        # Validate type
        try:
            enum_type = ItemType[item_type.upper()]
        except KeyError:
            raise HTTPException(status_code=400, detail=f"Invalid item type: {item_type}")

        # Validate category
        try:
            enum_category = ItemCategory[category.upper()]
        except KeyError:
            raise HTTPException(status_code=400, detail=f"Invalid category: {category}")

        # Save uploaded images
        image_urls = []
        if images:
            for img in images[:3]:  # max 3 images
                if img.filename:
                    url = await StorageService.save_upload_file(img, prefix=item_type.lower())
                    image_urls.append(url)

        # Parse time
        parsed_time = parse_iso_datetime(incident_time)

        # OCR extraction from description
        ocr_tokens = extract_ocr_tokens(description)

        db_item = Item(
            user_id=user.id,
            type=enum_type,
            title=title.strip(),
            description=description.strip(),
            category=enum_category,
            campus_zone=campus_zone.strip(),
            incident_time=parsed_time,
            image_urls=image_urls,
            ocr_tokens=ocr_tokens,
            is_high_value=is_high_value,
            private_details=private_details,
            latitude=latitude,
            longitude=longitude,
            status=ItemStatus.OPEN
        )

        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item

    @staticmethod
    def get_feed(
        db: Session,
        current_user: Optional[User] = None,
        skip: int = 0,
        limit: int = 20,
        category: Optional[str] = None,
        campus_zone: Optional[str] = None,
        item_type: Optional[str] = None,
        search_query: Optional[str] = None
    ) -> List[ItemListResponse]:
        query = db.query(Item).filter(Item.status == ItemStatus.OPEN)

        if category:
            try:
                query = query.filter(Item.category == ItemCategory[category.upper()])
            except KeyError:
                pass

        if campus_zone:
            query = query.filter(Item.campus_zone == campus_zone)

        if item_type:
            try:
                query = query.filter(Item.type == ItemType[item_type.upper()])
            except KeyError:
                pass

        if search_query:
            pattern = f"%{search_query}%"
            query = query.filter((Item.title.ilike(pattern)) | (Item.description.ilike(pattern)))

        items = query.order_by(Item.created_at.desc()).offset(skip).limit(limit).all()

        is_admin = current_user is not None and (
            current_user.role in [UserRole.SECURITY_ADMIN, UserRole.STAFF, "SECURITY_ADMIN", "STAFF"]
        )

        results = []
        for item in items:
            image_urls = list(item.image_urls or [])
            is_owner = current_user is not None and item.user_id == current_user.id
            if item.is_high_value and not is_owner and not is_admin:
                image_urls = []  # Redact images for zero-knowledge preview

            results.append(
                ItemListResponse(
                    id=item.id,
                    title=item.title,
                    category=item.category.value if hasattr(item.category, "value") else str(item.category),
                    campus_zone=item.campus_zone,
                    type=item.type.value if hasattr(item.type, "value") else str(item.type),
                    is_high_value=item.is_high_value,
                    image_urls=image_urls,
                    created_at=item.created_at
                )
            )

        return results
