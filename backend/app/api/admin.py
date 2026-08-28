from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import List
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_admin_user
from app.models.item import Item, ItemStatus, ItemType
from app.models.match import Match, Claim, MatchStatus
from app.models.user import User
from app.schemas.item import ItemResponse

router = APIRouter()

class VaultProcessRequest(BaseModel):
    action: str  # "donation" or "auction"

@router.get("/vault/unclaimed", response_model=List[ItemResponse])
async def get_unclaimed_items(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Retrieve items older than 45 days eligible for Unclaimed Asset Vault"""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=45)
    items = db.query(Item).filter(
        Item.status == ItemStatus.OPEN,
        Item.created_at < cutoff_date
    ).order_by(Item.created_at.asc()).all()
    return [ItemResponse.model_validate(item) for item in items]

@router.post("/vault/process")
async def process_vault_items(
    req: VaultProcessRequest,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Bulk move unclaimed items to UNCLAIMED_VAULT for charity/auction policy"""
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=45)
    items = db.query(Item).filter(
        Item.status == ItemStatus.OPEN,
        Item.created_at < cutoff_date
    ).all()

    for item in items:
        item.status = ItemStatus.UNCLAIMED_VAULT

    db.commit()

    return {
        "status": "success",
        "action": req.action,
        "processed_count": len(items),
        "message": f"Successfully processed {len(items)} items for {req.action}"
    }

@router.get("/qr-scans")
async def get_recent_scans(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Audit log of recent QR handshake handovers"""
    claims = db.query(Claim).filter(
        Claim.resolved_at != None
    ).order_by(Claim.resolved_at.desc()).limit(50).all()

    audit_logs = []
    for c in claims:
        admin_user = db.query(User).filter(User.id == c.handover_by_user_id).first() if c.handover_by_user_id else None
        claimant = db.query(User).filter(User.id == c.claimant_id).first()
        match = db.query(Match).filter(Match.id == c.match_id).first()
        
        audit_logs.append({
            "claim_id": c.id,
            "match_id": c.match_id,
            "claimant_name": claimant.full_name if claimant else "Unknown",
            "claimant_email": claimant.email if claimant else "Unknown",
            "verified_by": admin_user.full_name if admin_user else "Direct Finder",
            "resolved_at": c.resolved_at,
            "lost_item_id": match.lost_item_id if match else None,
            "found_item_id": match.found_item_id if match else None
        })

    return {
        "total_scans": len(audit_logs),
        "scans": audit_logs
    }

@router.get("/stats")
async def get_system_stats(db: Session = Depends(get_db)):
    """Public & admin metrics dashboard statistics"""
    total_items = db.query(Item).count()
    lost_items = db.query(Item).filter(Item.type == ItemType.LOST).count()
    found_items = db.query(Item).filter(Item.type == ItemType.FOUND).count()
    resolved = db.query(Item).filter(Item.status == ItemStatus.RESOLVED).count()
    vault_items = db.query(Item).filter(Item.status == ItemStatus.UNCLAIMED_VAULT).count()
    total_matches = db.query(Match).count()
    high_confidence_matches = db.query(Match).filter(Match.status == MatchStatus.HIGH_CONFIDENCE).count()

    rate = round((resolved / total_items * 100) if total_items > 0 else 0, 1)

    return {
        "total_items": total_items,
        "lost_items": lost_items,
        "found_items": found_items,
        "resolved_items": resolved,
        "vault_items": vault_items,
        "total_matches": total_matches,
        "high_confidence_matches": high_confidence_matches,
        "resolution_rate": rate
    }
