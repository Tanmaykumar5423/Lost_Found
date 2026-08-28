from datetime import datetime, timedelta, timezone
from app.services.scoring import ScoringEngine

def test_visual_score_cosine():
    vec1 = [1.0, 0.0, 0.0]
    vec2 = [1.0, 0.0, 0.0]
    vec3 = [0.0, 1.0, 0.0]
    assert abs(ScoringEngine.calculate_visual_score(vec1, vec2) - 1.0) < 1e-5
    assert abs(ScoringEngine.calculate_visual_score(vec1, vec3) - 0.0) < 1e-5

def test_category_matching():
    assert ScoringEngine.calculate_category_score("ELECTRONICS", "ELECTRONICS") == 1.0
    assert ScoringEngine.calculate_category_score("ELECTRONICS", "KEYS") == 0.0

def test_temporal_decay():
    t0 = datetime(2026, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
    t1 = t0 + timedelta(days=2)
    decay = ScoringEngine.calculate_temporal_decay(t0, t1)
    assert 0.8 < decay < 1.0

    # Found before lost anomaly
    decay_anomaly = ScoringEngine.calculate_temporal_decay(t1, t0)
    assert decay_anomaly == 0.1

def test_spatial_decay_zones():
    # Same zone
    assert ScoringEngine.calculate_spatial_decay(None, None, None, None, "Library Zone", "Library Zone") == 1.0
    # Adjacent zone
    assert ScoringEngine.calculate_spatial_decay(None, None, None, None, "Library Zone", "Engineering Block B") == 0.8
    # Distant zone
    assert ScoringEngine.calculate_spatial_decay(None, None, None, None, "Library Zone", "Sports Complex") == 0.4

def test_ocr_bonus():
    tokens1 = ["ID1234", "MACBOOK", "A2338"]
    tokens2 = ["ID1234", "DELL"]
    tokens3 = ["SOMETHING", "ELSE"]
    assert ScoringEngine.calculate_ocr_bonus(tokens1, tokens2) == 0.25
    assert ScoringEngine.calculate_ocr_bonus(tokens1, tokens3) == 0.0

def test_total_score_calculation():
    score, status = ScoringEngine.calculate_total_score(
        visual_score=0.9,
        text_score=0.85,
        category_score=1.0,
        spatial_decay=1.0,
        temporal_decay=0.95,
        ocr_bonus=0.0,
        has_image_1=True,
        has_image_2=True
    )
    assert score >= 0.80
    assert status == "HIGH_CONFIDENCE"
