from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.item import ItemResponse, ItemListResponse

class MatchResponse(BaseModel):
    id: int
    lost_item_id: int
    found_item_id: int
    visual_score: float
    text_score: float
    category_score: float
    spatial_decay: float
    temporal_decay: float
    ocr_bonus: float
    total_score: float
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class MatchDetailResponse(MatchResponse):
    lost_item: Optional[ItemListResponse] = None
    found_item: Optional[ItemListResponse] = None

class ClaimCreate(BaseModel):
    match_id: int
    challenge_question: str
    claimant_answer: str

class ClaimResponse(BaseModel):
    id: int
    match_id: int
    claimant_id: int
    challenge_question: str
    claimant_answer: str
    is_challenge_approved: bool
    handshake_qr_token: Optional[str] = None
    handover_by_user_id: Optional[int] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class QRHandshakeResponse(BaseModel):
    qr_token: str
    expires_in_minutes: int
    item_id: int
    claim_id: int
