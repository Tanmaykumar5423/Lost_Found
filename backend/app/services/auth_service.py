from sqlalchemy.orm import Session
from datetime import timedelta
from fastapi import HTTPException, status

from app.core.config import get_settings
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.utils.validators import validate_campus_email

settings = get_settings()

class AuthService:
    @staticmethod
    def register_user(user_in: UserCreate, db: Session) -> TokenResponse:
        if not validate_campus_email(user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email must belong to campus domain: @{settings.CAMPUS_EMAIL_DOMAIN}"
            )
        
        existing = db.query(User).filter(User.email == user_in.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        db_user = User(
            email=user_in.email,
            hashed_password=hash_password(user_in.password),
            full_name=user_in.full_name,
            role=UserRole.STUDENT,
            karma_score=100
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        token = create_access_token(
            data={"sub": str(db_user.id), "role": str(db_user.role)},
            expires_delta=expires
        )
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(db_user)
        )

    @staticmethod
    def authenticate_user(credentials: UserLogin, db: Session) -> TokenResponse:
        user = db.query(User).filter(User.email == credentials.email).first()
        if not user or not verify_password(credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        token = create_access_token(
            data={"sub": str(user.id), "role": str(user.role)},
            expires_delta=expires
        )
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
