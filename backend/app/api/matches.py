from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.item import Item, ItemType, ItemStatus
from app.models.match import Match, MatchStatus
from app.schemas.match import MatchResponse, MatchDetailResponse
from app.schemas.item import ItemListResponse
from app.services.matching_service import MatchingService

router = APIRouter()

def _enrich_match(match: Match, db: Session) -> MatchDetailResponse:
    lost = db.query(Item).filter(Item.id == match.lost_item_id).first()
    found = db.query(Item).filter(Item.id == match.found_item_id).first()
    
    return MatchDetailResponse(
        id=match.id,
        lost_item_id=match.lost_item_id,
        found_item_id=match.found_item_id,
        visual_score=match.visual_score,
        text_score=match.text_score,
        category_score=match.category_score,
        spatial_decay=match.spatial_decay,
        temporal_decay=match.temporal_decay,
        ocr_bonus=match.ocr_bonus,
        total_score=match.total_score,
        status=match.status.value if hasattr(match.status, "value") else str(match.status),
        created_at=match.created_at,
        lost_item=ItemListResponse.model_validate(lost) if lost else None,
        found_item=ItemListResponse.model_validate(found) if found else None
    )

@router.post("/find/{lost_item_id}", response_model=List[MatchDetailResponse])
async def trigger_find_matches(
    lost_item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger candidate matching evaluation for a specific lost item"""
    lost_item = db.query(Item).filter(Item.id == lost_item_id).first()
    if not lost_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    MatchingService.process_new_item_sync(lost_item_id)

    matches = db.query(Match).filter(Match.lost_item_id == lost_item_id).order_by(Match.total_score.desc()).all()
    return [_enrich_match(m, db) for m in matches]

@router.get("/user/matches", response_model=List[MatchDetailResponse])
async def get_user_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all candidate matches related to items reported by the current user"""
    user_item_ids = [item.id for item in db.query(Item).filter(Item.user_id == current_user.id).all()]
    if not user_item_ids:
        return []

    matches = db.query(Match).filter(
        (Match.lost_item_id.in_(user_item_ids)) | (Match.found_item_id.in_(user_item_ids))
    ).order_by(Match.total_score.desc()).all()

    return [_enrich_match(m, db) for m in matches]

@router.get("/{match_id}", response_model=MatchDetailResponse)
async def get_match(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed scores for a single match"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return _enrich_match(match, db)

@router.get("/item/{item_id}", response_model=List[MatchDetailResponse])
async def get_item_matches(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all matches for a specific item"""
    matches = db.query(Match).filter(
        (Match.lost_item_id == item_id) | (Match.found_item_id == item_id)
    ).order_by(Match.total_score.desc()).all()
    return [_enrich_match(m, db) for m in matches]
