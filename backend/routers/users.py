import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from models import SessionLocal, User, UserResponse, UserUpdate
from auth import get_password_hash, get_current_user

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
UPLOAD_DIRECTORY = "uploads"
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
def update_user(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
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
    
    db.commit()
    db.refresh(user)
    return user

@router.get("/users/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/users/me/profile-picture", response_model=UserResponse)
def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{user.id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIRECTORY, file_name)

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    user.profile_picture_url = f"{BASE_URL}/uploads/{file_name}"
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/me/profile-picture", response_model=UserResponse)
def delete_profile_picture(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user.id).first()
    if user and user.profile_picture_url:
        file_path = user.profile_picture_url.replace(f"{BASE_URL}/", "") # Adjust path for deletion
        if os.path.exists(file_path):
            os.remove(file_path)
        user.profile_picture_url = None
        db.commit()
        db.refresh(user)
    return user