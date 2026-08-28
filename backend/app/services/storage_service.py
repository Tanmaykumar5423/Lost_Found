import os
from pathlib import Path
from datetime import datetime
from fastapi import UploadFile, HTTPException
from app.core.config import get_settings
from app.utils.validators import validate_file_extension

settings = get_settings()

class StorageService:
    @staticmethod
    def get_upload_dir() -> Path:
        upload_path = Path(settings.UPLOAD_DIR)
        upload_path.mkdir(parents=True, exist_ok=True)
        return upload_path

    @staticmethod
    async def save_upload_file(upload_file: UploadFile, prefix: str = "item") -> str:
        """Save uploaded file to disk and return public access URL path"""
        if not upload_file.filename:
            raise HTTPException(status_code=400, detail="Empty filename")
            
        if not validate_file_extension(upload_file.filename):
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file extension. Allowed: jpg, jpeg, png, gif, pdf"
            )

        content = await upload_file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB"
            )

        upload_dir = StorageService.get_upload_dir()
        timestamp = int(datetime.utcnow().timestamp() * 1000)
        # Sanitize filename
        clean_filename = "".join(c for c in upload_file.filename if c.isalnum() or c in "._-")
        saved_filename = f"{prefix}_{timestamp}_{clean_filename}"
        file_path = upload_dir / saved_filename

        with open(file_path, "wb") as f:
            f.write(content)

        return f"/uploads/{saved_filename}"

    @staticmethod
    def get_absolute_path(url_path: str) -> Path:
        """Resolve public URL path to local disk path"""
        filename = url_path.replace("/uploads/", "")
        return StorageService.get_upload_dir() / filename
