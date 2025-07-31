# Storage Abstraction Layer

This storage module provides a flexible abstraction for file storage, making it easy to switch between different storage providers without changing application code.

## Current Implementation

The system currently uses **Local Storage** but is designed to easily switch to cloud providers.

## Architecture

```
storage/
├── base.py          # Abstract base class defining the storage interface
├── local.py         # Local filesystem implementation
├── s3.py           # AWS S3 implementation (ready for future use)
├── factory.py      # Factory pattern for getting the right storage service
└── README.md       # This file
```

## How to Switch Storage Providers

### 1. Local Storage (Current Default)
```env
STORAGE_PROVIDER=local
UPLOAD_DIRECTORY=uploads
```

### 2. Switch to AWS S3
```env
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

Then install boto3:
```bash
pip install boto3
```

### 3. Add a New Storage Provider

1. Create a new file in `storage/` (e.g., `gcs.py` for Google Cloud Storage)
2. Implement the `StorageService` abstract class
3. Update `factory.py` to include your provider
4. Add configuration to `.env`

Example:
```python
# storage/gcs.py
from .base import StorageService

class GCSStorageService(StorageService):
    async def upload(self, file: UploadFile, key: str) -> Tuple[str, str]:
        # Implementation here
        pass
    
    # Implement other required methods...
```

## Storage Interface Methods

All storage providers must implement:

- `upload(file, key)` - Upload a file and return (storage_key, public_url)
- `delete(key)` - Delete a file by its storage key
- `get_url(key, expires_in)` - Get a public URL for the file
- `exists(key)` - Check if a file exists

## Migration

To migrate existing files to a new storage provider:

```bash
python scripts/migrate_storage.py
```

This script will:
1. Find all users with local profile pictures
2. Upload them to the new storage provider
3. Update database records with new URLs

## Benefits

✅ **Provider Agnostic**: Switch storage without changing application code
✅ **Type Safe**: Full type hints for better IDE support
✅ **Async Support**: All operations are async-ready
✅ **Testable**: Easy to mock for unit tests
✅ **Extensible**: Add new providers easily

## Testing

To test with different providers:

```python
# In your tests
from storage.local import LocalStorageService

async def test_upload():
    storage = LocalStorageService(upload_dir="test_uploads")
    # ... run tests
```