# Media Storage Guide for HUFI Expense Tracker

## Current Implementation (Local Storage)
Currently using `/backend/uploads/` folder. This works for development but has limitations:
- ❌ Not scalable across multiple servers
- ❌ No CDN support
- ❌ Risk of data loss if server fails
- ❌ Limited backup options
- ✅ Simple to implement
- ✅ No external dependencies

## Recommended Approaches

### 1. **Cloud Object Storage (Recommended)**

#### AWS S3
```python
# backend/storage/s3_storage.py
import boto3
from botocore.exceptions import ClientError
import os
from typing import Optional

class S3Storage:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.bucket_name = os.getenv('S3_BUCKET_NAME', 'hufi-expense-tracker')
        
    def upload_file(self, file_data: bytes, key: str, content_type: str) -> str:
        """Upload file to S3 and return the URL"""
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_data,
                ContentType=content_type,
                ACL='public-read'  # Or use presigned URLs for private files
            )
            return f"https://{self.bucket_name}.s3.amazonaws.com/{key}"
        except ClientError as e:
            raise Exception(f"Failed to upload to S3: {str(e)}")
```

#### Google Cloud Storage
```python
# backend/storage/gcs_storage.py
from google.cloud import storage
import os

class GCSStorage:
    def __init__(self):
        self.client = storage.Client()
        self.bucket_name = os.getenv('GCS_BUCKET_NAME', 'hufi-expense-tracker')
        self.bucket = self.client.bucket(self.bucket_name)
        
    def upload_file(self, file_data: bytes, blob_name: str, content_type: str) -> str:
        """Upload file to GCS and return the URL"""
        blob = self.bucket.blob(blob_name)
        blob.upload_from_string(file_data, content_type=content_type)
        blob.make_public()  # Or use signed URLs
        return blob.public_url
```

### 2. **Cloudinary (Specialized for Images)**
```python
# backend/storage/cloudinary_storage.py
import cloudinary
import cloudinary.uploader
import os

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

class CloudinaryStorage:
    def upload_image(self, file_data: bytes, public_id: str) -> dict:
        """Upload image to Cloudinary with automatic optimization"""
        result = cloudinary.uploader.upload(
            file_data,
            public_id=public_id,
            folder="profile_pictures",
            transformation=[
                {'width': 200, 'height': 200, 'crop': 'fill', 'gravity': 'face'},
                {'quality': 'auto:best'},
                {'fetch_format': 'auto'}
            ]
        )
        return {
            'url': result['secure_url'],
            'thumbnail_url': result['eager'][0]['secure_url'] if result.get('eager') else None
        }
```

### 3. **Hybrid Approach with Local Cache**
```python
# backend/storage/hybrid_storage.py
import os
import hashlib
from typing import Optional
from datetime import datetime, timedelta

class HybridStorage:
    def __init__(self, primary_storage, cache_dir="./cache"):
        self.primary = primary_storage  # S3, GCS, etc.
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        
    def get_file(self, key: str) -> Optional[bytes]:
        # Check local cache first
        cache_path = os.path.join(self.cache_dir, self._hash_key(key))
        if os.path.exists(cache_path):
            # Check if cache is still valid (e.g., 24 hours)
            if self._is_cache_valid(cache_path):
                with open(cache_path, 'rb') as f:
                    return f.read()
        
        # Fetch from primary storage
        data = self.primary.download_file(key)
        if data:
            # Cache locally
            with open(cache_path, 'wb') as f:
                f.write(data)
        return data
```

## Implementation Strategy

### 1. **Update User Model**
```python
# backend/models.py
class User(Base):
    __tablename__ = "users"
    
    # ... existing fields ...
    profile_picture_key = Column(String, nullable=True)  # Storage key/path
    profile_picture_url = Column(String, nullable=True)  # Public URL
    profile_picture_provider = Column(String, nullable=True)  # 'google', 's3', 'cloudinary', etc.
```

### 2. **Storage Service Interface**
```python
# backend/storage/base.py
from abc import ABC, abstractmethod
from typing import Tuple

class StorageService(ABC):
    @abstractmethod
    def upload(self, file_data: bytes, key: str, content_type: str) -> Tuple[str, str]:
        """Upload file and return (storage_key, public_url)"""
        pass
    
    @abstractmethod
    def delete(self, key: str) -> bool:
        """Delete file by key"""
        pass
    
    @abstractmethod
    def get_url(self, key: str, expires_in: int = 3600) -> str:
        """Get accessible URL for file"""
        pass
```

### 3. **Updated Upload Endpoint**
```python
# backend/routers/users.py
from storage import get_storage_service

@router.post("/users/me/profile-picture", response_model=UserResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    storage: StorageService = Depends(get_storage_service)
):
    # Validate file
    if file.content_type not in ['image/jpeg', 'image/png', 'image/gif']:
        raise HTTPException(400, "Invalid file type")
    
    if file.size > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(400, "File too large")
    
    # Generate unique key
    file_ext = file.filename.split('.')[-1]
    key = f"users/{current_user.id}/profile_{datetime.utcnow().timestamp()}.{file_ext}"
    
    # Upload to storage
    file_data = await file.read()
    storage_key, public_url = await storage.upload(file_data, key, file.content_type)
    
    # Update user record
    user = db.query(User).filter(User.id == current_user.id).first()
    
    # Delete old profile picture if exists
    if user.profile_picture_key and user.profile_picture_provider != 'google':
        await storage.delete(user.profile_picture_key)
    
    user.profile_picture_key = storage_key
    user.profile_picture_url = public_url
    user.profile_picture_provider = 'custom'
    
    db.commit()
    db.refresh(user)
    return user
```

## Environment Configuration

### For S3
```env
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=hufi-expense-tracker
```

### For Google Cloud Storage
```env
STORAGE_PROVIDER=gcs
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
GCS_BUCKET_NAME=hufi-expense-tracker
```

### For Cloudinary
```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Migration Strategy

1. **Keep existing local storage working**
2. **Add new storage service alongside**
3. **Migrate existing files gradually**
4. **Update new uploads to use cloud storage**

```python
# backend/scripts/migrate_storage.py
async def migrate_to_cloud():
    """Migrate existing local files to cloud storage"""
    users = db.query(User).filter(
        User.profile_picture_url.like('%/uploads/%')
    ).all()
    
    for user in users:
        local_path = user.profile_picture_url.replace(BASE_URL, '.')
        if os.path.exists(local_path):
            with open(local_path, 'rb') as f:
                file_data = f.read()
            
            # Upload to new storage
            key = f"users/{user.id}/profile_{os.path.basename(local_path)}"
            storage_key, public_url = await storage.upload(
                file_data, key, 'image/png'
            )
            
            # Update user record
            user.profile_picture_key = storage_key
            user.profile_picture_url = public_url
            user.profile_picture_provider = STORAGE_PROVIDER
            
            print(f"Migrated {user.email} profile picture")
    
    db.commit()
```

## Recommendations

1. **For Small Projects**: Start with Cloudinary (free tier, automatic optimization)
2. **For Growing Projects**: Use AWS S3 or Google Cloud Storage
3. **For Enterprise**: Implement hybrid approach with CDN

## Benefits of Cloud Storage

✅ **Scalability**: Handle millions of files
✅ **Reliability**: 99.999999999% durability (S3)
✅ **Performance**: Global CDN distribution
✅ **Security**: Encryption at rest and in transit
✅ **Backup**: Automatic replication
✅ **Cost-effective**: Pay only for what you use
✅ **Features**: Image optimization, transformations

## Security Considerations

1. **Use presigned URLs** for sensitive content
2. **Implement file type validation**
3. **Set size limits**
4. **Scan for malware** (using services like AWS Macie)
5. **Enable versioning** for important files
6. **Set up lifecycle policies** to archive/delete old files