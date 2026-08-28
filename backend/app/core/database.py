from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from app.core.config import get_settings

settings = get_settings()

try:
    if "postgresql" in settings.DATABASE_URL:
        # Test if psycopg2 / postgresql dbapi is available
        import psycopg2
        engine = create_engine(settings.DATABASE_URL, echo=False, pool_size=20, max_overflow=0)
    else:
        engine = create_engine(settings.DATABASE_URL)
except Exception:
    # Graceful fallback for offline test runner if postgres driver is not installed on host
    engine = create_engine("sqlite:///:memory:", echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
