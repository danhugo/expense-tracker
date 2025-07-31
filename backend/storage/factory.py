import os
from typing import Optional
from .base import StorageService
from .local import LocalStorageService


# Lazy imports to avoid importing unnecessary dependencies
_storage_instance: Optional[StorageService] = None


def get_storage_service() -> StorageService:
    """
    Factory function to get the appropriate storage service based on configuration
    """
    global _storage_instance
    
    if _storage_instance is None:
        storage_provider = os.getenv('STORAGE_PROVIDER', 'local').lower()
        
        if storage_provider == 'local':
            base_url = os.getenv('BASE_URL', 'http://localhost:8060')
            upload_dir = os.getenv('UPLOAD_DIRECTORY', 'uploads')
            _storage_instance = LocalStorageService(upload_dir=upload_dir, base_url=base_url)
            
        elif storage_provider == 's3':
            # Import only when needed to avoid dependency issues
            from .s3 import S3StorageService
            _storage_instance = S3StorageService()
            
        elif storage_provider == 'gcs':
            # Future implementation
            raise NotImplementedError("Google Cloud Storage provider not yet implemented")
            
        elif storage_provider == 'cloudinary':
            # Future implementation
            raise NotImplementedError("Cloudinary provider not yet implemented")
            
        else:
            raise ValueError(f"Unknown storage provider: {storage_provider}")
    
    return _storage_instance