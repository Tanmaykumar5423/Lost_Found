from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.security import get_current_user, get_current_user_optional
from app.models.user import User
from app.models.item import Item
from app.schemas.item import ItemResponse, ItemListResponse
from app.services.item_service import ItemService
from app.services.matching_service import MatchingService

router = APIRouter()

@router.post("/report", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def report_item(
    background_tasks: BackgroundTasks,
    type: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    campus_zone: str = Form(...),
    incident_time: str = Form(...),
    is_high_value: bool = Form(False),
    private_details: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    images: Optional[List[UploadFile]] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Report a lost or found item with up to 3 images and trigger background ML matching"""
    db_item = await ItemService.create_item(
        user=current_user,
        item_type=type,
        title=title,
        description=description,
        category=category,
        campus_zone=campus_zone,
        incident_time=incident_time,
        is_high_value=is_high_value,
        private_details=private_details,
        latitude=latitude,
        longitude=longitude,
        images=images,
        db=db
    )

    # Dispatch non-blocking embedding calculation and matching pipeline in background
    background_tasks.add_task(MatchingService.process_new_item_async, db_item.id)

    return ItemResponse.model_validate(db_item)

@router.get("/feed", response_model=List[ItemListResponse])
async def get_feed(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    campus_zone: Optional[str] = None,
    type: Optional[str] = None,
    search: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get paginated feed of open items with Zero-Knowledge masking for sensitive items"""
    return ItemService.get_feed(
        db=db,
        current_user=current_user,
        skip=skip,
        limit=limit,
        category=category,
        campus_zone=campus_zone,
        item_type=type,
        search_query=search
    )

@router.get("/user/items", response_model=List[ItemResponse])
@router.get("/", response_model=List[ItemResponse])
async def get_user_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all items reported by the authenticated user"""
    items = db.query(Item).filter(Item.user_id == current_user.id).order_by(Item.created_at.desc()).all()
    return [ItemResponse.model_validate(item) for item in items]

@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: int,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get details for a single item"""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Hide private details if not owner/admin
    is_owner = current_user and current_user.id == item.user_id
    is_admin = current_user and current_user.role in ["SECURITY_ADMIN", "STAFF"]
    if not is_owner and not is_admin:
        item.private_details = None
        if item.is_high_value:
            item.image_urls = []

    return ItemResponse.model_validate(item)
