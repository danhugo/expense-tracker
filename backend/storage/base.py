from abc import ABC, abstractmethod
from typing import Tuple, Optional
from fastapi import UploadFile


class StorageService(ABC):
    """Abstract base class for storage services"""
    
    @abstractmethod
    async def upload(self, file: UploadFile, key: str) -> Tuple[str, str]:
        """
        Upload a file to storage
        
        Args:
            file: The uploaded file object
            key: Unique key/path for the file
            
        Returns:
            Tuple of (storage_key, public_url)
        """
        pass
    
    @abstractmethod
    async def delete(self, key: str) -> bool:
        """
        Delete a file from storage
        
        Args:
            key: The storage key of the file to delete
            
        Returns:
            True if successful, False otherwise
        """
        pass
    
    @abstractmethod
    def get_url(self, key: str, expires_in: Optional[int] = None) -> str:
        """
        Get a publicly accessible URL for a file
        
        Args:
            key: The storage key of the file
            expires_in: Optional expiration time in seconds for the URL
            
        Returns:
            Public URL to access the file
        """
        pass
    
    @abstractmethod
    async def exists(self, key: str) -> bool:
        """
        Check if a file exists in storage
        
        Args:
            key: The storage key to check
            
        Returns:
            True if file exists, False otherwise
        """
        pass