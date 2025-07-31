import os
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from models import SessionLocal, User, UserResponse, UserUpdate
from auth import get_password_hash, get_current_user
from storage.factory import get_storage_service
from storage.base import StorageService

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8060")

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.put("/users/me", response_model=UserResponse)
async def update_user(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Store old currency for conversion
    old_currency = user.currency
    
    if user_update.name:
        user.name = user_update.name
    if user_update.email:
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user and existing_user.id != user.id:
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = user_update.email
    if user_update.password:
        user.hashed_password = get_password_hash(user_update.password)
    if user_update.profile_picture_url is not None:
        user.profile_picture_url = user_update.profile_picture_url
    if user_update.currency is not None:
        from currencies import get_currency_info
        from currency_utils import get_exchange_rates, convert_currency
        from models import Transaction
        
        currency_info = get_currency_info(user_update.currency)
        new_currency = user_update.currency
        user.currency = new_currency
        user.currency_symbol = user_update.currency_symbol or currency_info["symbol"]
        
        # Convert all transactions to new currency if currency changed
        if old_currency != new_currency:
            # Get exchange rates
            rates = await get_exchange_rates()
            
            if rates:
                # Update all user's transactions
                transactions = db.query(Transaction).filter(Transaction.user_id == user.id).all()
                for transaction in transactions:
                    # Store original amount if not already stored
                    if transaction.original_amount is None:
                        transaction.original_amount = transaction.amount
                        transaction.original_currency = old_currency
                    
                    # Convert from original currency to new currency
                    transaction.amount = convert_currency(
                        transaction.original_amount,
                        transaction.original_currency,
                        new_currency,
                        rates
                    )
    
    db.commit()
    db.refresh(user)
    return user

@router.get("/users/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/users/me/profile-picture", response_model=UserResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    storage: StorageService = Depends(get_storage_service)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Validate file
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    if file.size and file.size > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")
    
    # Delete old profile picture if it exists and is not from Google
    if user.profile_picture_url and user.profile_picture_url.startswith(f"{BASE_URL}/uploads/"):
        old_key = user.profile_picture_url.replace(f"{BASE_URL}/uploads/", "")
        await storage.delete(old_key)
    
    # Generate unique key for the file
    file_extension = os.path.splitext(file.filename)[1] or '.png'
    timestamp = int(datetime.utcnow().timestamp())
    key = f"users/{user.id}/profile_{timestamp}{file_extension}"
    
    # Upload to storage
    storage_key, public_url = await storage.upload(file, key)
    
    # Update user profile
    user.profile_picture_url = public_url
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/me/profile-picture", response_model=UserResponse)
async def delete_profile_picture(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db),
    storage: StorageService = Depends(get_storage_service)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if user and user.profile_picture_url:
        # Only delete if it's a custom uploaded image
        if user.profile_picture_url.startswith(f"{BASE_URL}/uploads/"):
            key = user.profile_picture_url.replace(f"{BASE_URL}/uploads/", "")
            await storage.delete(key)
        
        # Set profile picture to None - frontend will show initials
        # Could also fetch Google profile picture here if user has google_id
        user.profile_picture_url = None
        db.commit()
        db.refresh(user)
    return user

@router.get("/currencies")
def get_supported_currencies():
    """Get all supported currencies"""
    from currencies import get_all_currencies
    return get_all_currencies()