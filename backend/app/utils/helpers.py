import re
from datetime import datetime, timezone
from typing import Optional

def normalize_text(text: str) -> str:
    """Normalize text by lowercasing and stripping special punctuation."""
    if not text:
        return ""
    text = text.lower().strip()
    text = re.sub(r'[\r\n\t]+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text

def parse_iso_datetime(date_str: Optional[str]) -> datetime:
    """Parse ISO formatted datetime string safely with fallback."""
    if not date_str:
        return datetime.now(timezone.utc)
    try:
        dt = datetime.fromisoformat(date_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return datetime.now(timezone.utc)

def format_datetime_iso(dt: Optional[datetime]) -> Optional[str]:
    """Format datetime to ISO string."""
    if not dt:
        return None
    return dt.isoformat()
