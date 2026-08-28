from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.database import get_db
from app.core.security import create_qr_token, verify_token
from app.models.match import Match, Claim
from app.models.item import Item, ItemStatus
from app.models.user import User
from app.schemas.match import ClaimCreate, ClaimResponse, QRHandshakeResponse

router = APIRouter()

@router.post("/challenge/create", response_model=ClaimResponse)
async def create_challenge(
    claim: ClaimCreate,
    db: Session = Depends(get_db)
):
    """Create a claim with verification challenge"""
    
    match = db.query(Match).filter(Match.id == claim.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Create claim
    db_claim = Claim(
        match_id=claim.match_id,
        claimant_id=claim.match_id,  # In production, get from JWT
        challenge_question=claim.challenge_question,
        claimant_answer=claim.claimant_answer,
        is_challenge_approved=False
    )
    
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    
    return ClaimResponse.from_orm(db_claim)

@router.post("/challenge/respond", response_model=ClaimResponse)
async def respond_to_challenge(
    claim_id: int,
    answer: str,
    db: Session = Depends(get_db)
):
    """Submit answer to verification challenge"""
    
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    claim.claimant_answer = answer
    db.commit()
    db.refresh(claim)
    
    return ClaimResponse.from_orm(claim)

@router.post("/challenge/approve", response_model=QRHandshakeResponse)
async def approve_challenge(
    claim_id: int,
    db: Session = Depends(get_db)
):
    """Approve claim and issue QR handshake token"""
    
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Generate time-bound QR token (15 minutes)
    qr_token = create_qr_token(
        data={
            "claim_id": claim_id,
            "match_id": claim.match_id,
            "claimant_id": claim.claimant_id
        }
    )
    
    claim.is_challenge_approved = True
    claim.handshake_qr_token = qr_token
    
    db.commit()
    db.refresh(claim)
    
    # Get found item for response
    match = db.query(Match).filter(Match.id == claim.match_id).first()
    
    return QRHandshakeResponse(
        qr_token=qr_token,
        expires_in_minutes=15,
        item_id=match.found_item_id if match else 0
    )

@router.post("/handshake/verify")
async def verify_handshake(
    qr_token: str,
    admin_user_id: int,
    db: Session = Depends(get_db)
):
    """Verify QR handshake token and complete handover"""
    
    # Verify token
    payload = verify_token(qr_token)
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired QR token")
    
    claim_id = payload.get("claim_id")
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Update claim
    claim.handover_by_user_id = admin_user_id
    claim.resolved_at = datetime.utcnow()
    
    # Update match
    match = db.query(Match).filter(Match.id == claim.match_id).first()
    if match:
        # Update item statuses
        found_item = db.query(Item).filter(Item.id == match.found_item_id).first()
        lost_item = db.query(Item).filter(Item.id == match.lost_item_id).first()
        
        if found_item:
            found_item.status = ItemStatus.RESOLVED
        if lost_item:
            lost_item.status = ItemStatus.RESOLVED
        
        # Award karma to finder
        finder = db.query(User).filter(User.id == found_item.user_id).first()
        if finder:
            finder.karma_score += 25
    
    db.commit()
    
    return {
        "status": "success",
        "message": "Item handover verified",
        "claim_id": claim_id,
        "resolved_at": claim.resolved_at
    }
