#!/usr/bin/env python3
"""
Storage migration script to move existing files to new storage provider
"""
import os
import sys
import asyncio
from pathlib import Path

# Add parent directory to path to import our modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from models import SessionLocal, User
from storage.factory import get_storage_service
from fastapi import UploadFile


async def migrate_profile_pictures():
    """Migrate existing profile pictures to new storage system"""
    db = SessionLocal()
    storage = get_storage_service()
    base_url = os.getenv("BASE_URL", "http://localhost:8060")
    
    try:
        # Find all users with local profile pictures
        users = db.query(User).filter(
            User.profile_picture_url.like(f"{base_url}/uploads/%")
        ).all()
        
        print(f"Found {len(users)} users with local profile pictures")
        
        for user in users:
            old_url = user.profile_picture_url
            old_path = old_url.replace(f"{base_url}/", "")
            
            if os.path.exists(old_path):
                print(f"Migrating profile picture for {user.email}...")
                
                # Extract the old filename
                old_filename = os.path.basename(old_path)
                
                # Create new key with user directory structure
                new_key = f"users/{user.id}/{old_filename}"
                
                # Check if already migrated
                if await storage.exists(new_key):
                    print(f"  Already migrated: {new_key}")
                    continue
                
                # Create a fake UploadFile object for the storage service
                with open(old_path, 'rb') as f:
                    file = UploadFile(
                        filename=old_filename,
                        file=f
                    )
                    file.file = f  # Ensure file handle is set
                    
                    # Upload to new storage
                    storage_key, public_url = await storage.upload(file, new_key)
                    
                    print(f"  Uploaded to: {public_url}")
                    
                    # Update user record only if upload successful
                    user.profile_picture_url = public_url
                    db.commit()
                    
                    print(f"  ✓ Successfully migrated {user.email}")
            else:
                print(f"  ⚠ File not found: {old_path}")
        
        print("\nMigration completed!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Run migration
    asyncio.run(migrate_profile_pictures())