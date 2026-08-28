import os
import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.models.item import Item, ItemType, ItemCategory, ItemStatus
from app.models.match import Match, MatchStatus
from app.services.scoring import ScoringEngine
from app.services.matching_service import compute_text_embedding

def seed():
    print("[INIT] Initializing Database Tables...")
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[WARN] Table creation notice: {e}")

    db = SessionLocal()

    try:
        print("[SEED] Seeding Campus Users...")
        users = [
            User(
                email="student@college.edu",
                hashed_password=hash_password("password123"),
                full_name="Alex Morgan",
                role=UserRole.STUDENT,
                karma_score=100
            ),
            User(
                email="finder@college.edu",
                hashed_password=hash_password("password123"),
                full_name="Samantha Chen",
                role=UserRole.STUDENT,
                karma_score=150
            ),
            User(
                email="admin@college.edu",
                hashed_password=hash_password("password123"),
                full_name="Campus Security Officer",
                role=UserRole.SECURITY_ADMIN,
                karma_score=500
            ),
        ]

        for u in users:
            existing = db.query(User).filter(User.email == u.email).first()
            if not existing:
                db.add(u)
        db.commit()

        u_student = db.query(User).filter(User.email == "student@college.edu").first()
        u_finder = db.query(User).filter(User.email == "finder@college.edu").first()

        now = datetime.now(timezone.utc)

        print("[SEED] Seeding Sample Lost & Found Items...")
        items_data = [
            {
                "user_id": u_student.id,
                "type": ItemType.LOST,
                "title": "Midnight Blue Dell XPS 15",
                "description": "Dell XPS 15 inch laptop with Python & GitHub stickers on top lid. Serial number DL992384. Lost on 3rd floor library study desk.",
                "category": ItemCategory.ELECTRONICS,
                "campus_zone": "Library Zone",
                "incident_time": now - timedelta(days=2),
                "is_high_value": True,
                "private_details": "Lock screen background is a green pine forest. Sticker on bottom says DevClub2025.",
                "ocr_tokens": ["DL992384", "DELL", "XPS"],
            },
            {
                "user_id": u_finder.id,
                "type": ItemType.FOUND,
                "title": "Dell Laptop in Library Reading Room",
                "description": "Found dark blue laptop left on table 14 in Central Library 3rd floor with coding stickers. Serial DL992384.",
                "category": ItemCategory.ELECTRONICS,
                "campus_zone": "Library Zone",
                "incident_time": now - timedelta(days=1),
                "is_high_value": True,
                "private_details": "Contains serial tag DL992384 and green forest wallpaper.",
                "ocr_tokens": ["DL992384", "DELL"],
            },
            {
                "user_id": u_student.id,
                "type": ItemType.LOST,
                "title": "Student ID Card & Blue Lanyard",
                "description": "Campus ID card for Alex Morgan, CS department, roll number CS2025-4491.",
                "category": ItemCategory.DOCUMENTS,
                "campus_zone": "Science Block",
                "incident_time": now - timedelta(days=3),
                "is_high_value": False,
                "ocr_tokens": ["CS20254491", "ALEX", "MORGAN"],
            },
            {
                "user_id": u_finder.id,
                "type": ItemType.FOUND,
                "title": "CS Student Smart ID Card",
                "description": "Found college ID card with lanyard near Physics lab 2.",
                "category": ItemCategory.DOCUMENTS,
                "campus_zone": "Science Block",
                "incident_time": now - timedelta(days=2),
                "is_high_value": False,
                "ocr_tokens": ["CS20254491"],
            },
            {
                "user_id": u_student.id,
                "type": ItemType.LOST,
                "title": "Unclaimed Dorm Key Bundle (Overdue Vault Test)",
                "description": "Set of brass keys with red plastic tag found in cafeteria 50 days ago.",
                "category": ItemCategory.KEYS,
                "campus_zone": "Hostel 3",
                "incident_time": now - timedelta(days=50),
                "is_high_value": False,
                "ocr_tokens": ["ROOM304"],
            }
        ]

        for idata in items_data:
            existing = db.query(Item).filter(Item.title == idata["title"]).first()
            if not existing:
                comb_text = f"{idata['title']} {idata['description']} {idata['campus_zone']} {idata['category'].value if hasattr(idata['category'], 'value') else idata['category']}"
                text_emb = compute_text_embedding(comb_text)
                new_item = Item(
                    user_id=idata["user_id"],
                    type=idata["type"],
                    title=idata["title"],
                    description=idata["description"],
                    category=idata["category"],
                    campus_zone=idata["campus_zone"],
                    incident_time=idata["incident_time"],
                    is_high_value=idata["is_high_value"],
                    private_details=idata.get("private_details"),
                    ocr_tokens=idata.get("ocr_tokens", []),
                    text_embedding=text_emb,
                    status=ItemStatus.OPEN,
                    created_at=idata["incident_time"]
                )
                db.add(new_item)

        db.commit()

        # Generate Match for Dell Laptop pair
        lost_laptop = db.query(Item).filter(Item.title.like("%Dell XPS%")).first()
        found_laptop = db.query(Item).filter(Item.title.like("%Dell Laptop in Library%")).first()

        if lost_laptop and found_laptop:
            existing_match = db.query(Match).filter(
                Match.lost_item_id == lost_laptop.id,
                Match.found_item_id == found_laptop.id
            ).first()

            if not existing_match:
                score, m_status = ScoringEngine.calculate_total_score(
                    visual_score=0.92,
                    text_score=0.88,
                    category_score=1.0,
                    spatial_decay=1.0,
                    temporal_decay=0.95,
                    ocr_bonus=0.25,
                    has_image_1=False,
                    has_image_2=False
                )

                demo_match = Match(
                    lost_item_id=lost_laptop.id,
                    found_item_id=found_laptop.id,
                    visual_score=0.92,
                    text_score=0.88,
                    category_score=1.0,
                    spatial_decay=1.0,
                    temporal_decay=0.95,
                    ocr_bonus=0.25,
                    total_score=score,
                    status=MatchStatus[m_status]
                )
                db.add(demo_match)
                db.commit()

        print("[SUCCESS] Database seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
