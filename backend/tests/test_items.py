from app.utils.helpers import normalize_text, parse_iso_datetime
from app.utils.validators import parse_campus_zone

def test_normalize_text():
    assert normalize_text("  Blue   Backpack \nwith LAPTOP  ") == "blue backpack with laptop"
    assert normalize_text("") == ""

def test_parse_iso_datetime():
    dt = parse_iso_datetime("2026-03-15T14:30:00")
    assert dt.year == 2026
    assert dt.month == 3
    assert dt.day == 15

def test_parse_campus_zone():
    assert parse_campus_zone("Central lib") == "Library Zone"
    assert parse_campus_zone("eng block 2") == "Engineering Block"
    assert parse_campus_zone("Main Cafeteria") == "Main Cafeteria"
