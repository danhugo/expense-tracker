import os
import shutil
from typing import Tuple, Optional
from fastapi import UploadFile
from .base import StorageService


class LocalStorageService(StorageService):
    """Local file system storage implementation"""
    
    def __init__(self, upload_dir: str = "uploads", base_url: str = "http://localhost:8060"):
        self.upload_dir = upload_dir
        self.base_url = base_url
        # Create upload directory if it doesn't exist
        os.makedirs(upload_dir, exist_ok=True)
    
    async def upload(self, file: UploadFile, key: str) -> Tuple[str, str]:
        """Upload file to local filesystem"""
        # Ensure directory structure exists
        file_path = os.path.join(self.upload_dir, key)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return storage key and public URL
        public_url = f"{self.base_url}/{self.upload_dir}/{key}"
        return key, public_url
    
    async def delete(self, key: str) -> bool:
        """Delete file from local filesystem"""
        file_path = os.path.join(self.upload_dir, key)
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                # Clean up empty directories
                parent_dir = os.path.dirname(file_path)
                if os.path.exists(parent_dir) and not os.listdir(parent_dir):
                    os.rmdir(parent_dir)
                return True
            return False
        except Exception:
            return False
    
    def get_url(self, key: str, expires_in: Optional[int] = None) -> str:
        """Get public URL for file (expires_in is ignored for local storage)"""
        return f"{self.base_url}/{self.upload_dir}/{key}"
    
    async def exists(self, key: str) -> bool:
        """Check if file exists in local filesystem"""
        file_path = os.path.join(self.upload_dir, key)
        return os.path.exists(file_path)