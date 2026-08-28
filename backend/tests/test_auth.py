from app.core.security import hash_password, verify_password, create_access_token, verify_token, create_qr_token
from app.utils.validators import validate_campus_email, extract_ocr_tokens, validate_file_extension

def test_password_hashing():
    pwd = "SecretPassword123!"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token():
    payload = {"sub": "42", "role": "STUDENT"}
    token = create_access_token(payload)
    decoded = verify_token(token)
    assert decoded is not None
    assert decoded["sub"] == "42"
    assert decoded["role"] == "STUDENT"

def test_qr_token():
    payload = {"claim_id": 10, "match_id": 5}
    token = create_qr_token(payload)
    decoded = verify_token(token)
    assert decoded is not None
    assert decoded["claim_id"] == 10

def test_campus_email_validation():
    assert validate_campus_email("student@college.edu") is True
    assert validate_campus_email("prof.john@college.edu") is True
    assert validate_campus_email("hacker@gmail.com") is False
    assert validate_campus_email("test@other.org") is False

def test_ocr_token_extractor():
    text = "Found student ID 2024CS1042 and Dell Laptop SN: DL883492"
    tokens = extract_ocr_tokens(text)
    assert "2024CS1042" in tokens
    assert "DL883492" in tokens

def test_file_extension_validation():
    assert validate_file_extension("photo.jpg") is True
    assert validate_file_extension("image.PNG") is True
    assert validate_file_extension("script.exe") is False
    assert validate_file_extension("payload.sh") is False
