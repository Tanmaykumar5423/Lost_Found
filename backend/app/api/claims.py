from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import create_qr_token, verify_token, get_current_user
from app.models.match import Match, Claim, MatchStatus
from app.models.item import Item, ItemStatus
from app.models.user import User, UserRole
from app.schemas.match import ClaimCreate, ClaimResponse, QRHandshakeResponse

router = APIRouter()

class RespondChallengeRequest(BaseModel):
    claim_id: int
    answer: str

class ApproveChallengeRequest(BaseModel):
    claim_id: int

class VerifyHandshakeRequest(BaseModel):
    qr_token: str

@router.post("/challenge/create", response_model=ClaimResponse, status_code=status.HTTP_201_CREATED)
async def create_challenge(
    claim_in: ClaimCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initiate a Zero-Knowledge claim verification challenge for a match"""
    match = db.query(Match).filter(Match.id == claim_in.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Check if a claim already exists for this user and match
    existing_claim = db.query(Claim).filter(
        Claim.match_id == claim_in.match_id,
        Claim.claimant_id == current_user.id
    ).first()

    if existing_claim:
        existing_claim.challenge_question = claim_in.challenge_question
        existing_claim.claimant_answer = claim_in.claimant_answer
        db.commit()
        db.refresh(existing_claim)
        return ClaimResponse.model_validate(existing_claim)

    db_claim = Claim(
        match_id=claim_in.match_id,
        claimant_id=current_user.id,
        challenge_question=claim_in.challenge_question,
        claimant_answer=claim_in.claimant_answer,
        is_challenge_approved=False
    )
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)

    return ClaimResponse.model_validate(db_claim)

@router.post("/challenge/respond", response_model=ClaimResponse)
async def respond_to_challenge(
    req: RespondChallengeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Claimant submits/updates descriptive answer to the verification question"""
    claim = db.query(Claim).filter(Claim.id == req.claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    if claim.claimant_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this claim response")

    claim.claimant_answer = req.answer
    db.commit()
    db.refresh(claim)
    return ClaimResponse.model_validate(claim)

@router.post("/challenge/approve", response_model=QRHandshakeResponse)
async def approve_challenge(
    req: ApproveChallengeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Finder or Security Admin approves answer; issues signed 15-minute JWT QR Handshake Token"""
    claim = db.query(Claim).filter(Claim.id == req.claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    match = db.query(Match).filter(Match.id == claim.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Associated match not found")

    found_item = db.query(Item).filter(Item.id == match.found_item_id).first()
    is_finder = found_item and found_item.user_id == current_user.id
    is_admin = current_user.role in [UserRole.SECURITY_ADMIN, UserRole.STAFF, "SECURITY_ADMIN", "STAFF"]

    if not is_finder and not is_admin:
        raise HTTPException(status_code=403, detail="Only finder or admin can approve this claim")

    # Generate 15-minute time-bound cryptographic QR Token
    qr_token = create_qr_token(
        data={
            "claim_id": claim.id,
            "match_id": claim.match_id,
            "claimant_id": claim.claimant_id,
            "found_item_id": match.found_item_id,
            "lost_item_id": match.lost_item_id
        }
    )

    claim.is_challenge_approved = True
    claim.handshake_qr_token = qr_token
    db.commit()
    db.refresh(claim)

    return QRHandshakeResponse(
        qr_token=qr_token,
        expires_in_minutes=15,
        item_id=match.found_item_id,
        claim_id=claim.id
    )

@router.post("/handshake/verify")
async def verify_handshake(
    req: VerifyHandshakeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Scan and verify QR handshake token, award +25 Karma to finder, mark items RESOLVED"""
    payload = verify_token(req.qr_token)
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid or expired QR handshake token")

    claim_id = payload.get("claim_id")
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim record not found")

    if claim.resolved_at:
        return {
            "status": "already_resolved",
            "message": "This handshake has already been completed",
            "resolved_at": claim.resolved_at
        }

    now = datetime.now(timezone.utc)
    claim.handover_by_user_id = current_user.id
    claim.resolved_at = now

    match = db.query(Match).filter(Match.id == claim.match_id).first()
    if match:
        match.status = MatchStatus.VERIFIED
        
        found_item = db.query(Item).filter(Item.id == match.found_item_id).first()
        lost_item = db.query(Item).filter(Item.id == match.lost_item_id).first()

        if found_item:
            found_item.status = ItemStatus.RESOLVED
            # Award +25 Karma score to finder
            finder = db.query(User).filter(User.id == found_item.user_id).first()
            if finder:
                finder.karma_score = (finder.karma_score or 0) + 25

        if lost_item:
            lost_item.status = ItemStatus.RESOLVED

    db.commit()

    return {
        "status": "success",
        "message": "Physical handshake verified! +25 Karma awarded to finder.",
        "claim_id": claim.id,
        "resolved_at": claim.resolved_at
    }

@router.get("/{claim_id}", response_model=ClaimResponse)
async def get_claim(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return ClaimResponse.model_validate(claim)

@router.get("/by-match/{match_id}", response_model=List[ClaimResponse])
async def get_claims_by_match(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    claims = db.query(Claim).filter(Claim.match_id == match_id).all()
    return [ClaimResponse.model_validate(c) for c in claims]
