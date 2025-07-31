import os
from typing import Tuple, Optional
from fastapi import UploadFile
import boto3
from botocore.exceptions import ClientError
from .base import StorageService


class S3StorageService(StorageService):
    """AWS S3 storage implementation (placeholder for future use)"""
    
    def __init__(self):
        # This will be implemented when switching to S3
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.bucket_name = os.getenv('S3_BUCKET_NAME', 'hufi-expense-tracker')
    
    async def upload(self, file: UploadFile, key: str) -> Tuple[str, str]:
        """Upload file to S3"""
        try:
            file_content = await file.read()
            await file.seek(0)  # Reset file pointer
            
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_content,
                ContentType=file.content_type or 'application/octet-stream'
            )
            
            public_url = f"https://{self.bucket_name}.s3.amazonaws.com/{key}"
            return key, public_url
        except ClientError as e:
            raise Exception(f"Failed to upload to S3: {str(e)}")
    
    async def delete(self, key: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError:
            return False
    
    def get_url(self, key: str, expires_in: Optional[int] = 3600) -> str:
        """Generate presigned URL for private objects"""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expires_in or 3600
            )
            return url
        except ClientError:
            return f"https://{self.bucket_name}.s3.amazonaws.com/{key}"
    
    async def exists(self, key: str) -> bool:
        """Check if object exists in S3"""
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=key)
            return True
        except ClientError:
            return False