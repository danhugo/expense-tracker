from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import os

from models import SessionLocal, User, UserCreate, UserLogin, UserResponse, Token, Transaction, TransactionCreate, TransactionResponse, UserUpdate
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from google.oauth2 import id_token
from google.auth.transport import requests

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")  # Load from environment variable

app = FastAPI()

# Mount static files directory
app.mount("/uploads", StaticFiles(directory="./uploads"), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_coop_header(request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    return response

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

UPLOAD_DIRECTORY = "uploads"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
BASE_URL = os.getenv("BASE_URL", "http://localhost:8060")

@app.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if user.google_id:
        db_user = db.query(User).filter(User.google_id == user.google_id).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Google account already registered")
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered with another account")
        
        db_user = User(name=user.name, email=user.email, google_id=user.google_id)
    else:
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        if not user.password:
            raise HTTPException(status_code=400, detail="Password is required for non-Google signups")
        
        hashed_password = get_password_hash(user.password)
        db_user = User(name=user.name, email=user.email, hashed_password=hashed_password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

class GoogleLoginRequest(BaseModel):
    id_token_str: str

@app.post("/google-login", response_model=Token)
async def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    id_token_str = payload.id_token_str
    try:
        idinfo = id_token.verify_oauth2_token(id_token_str, requests.Request(), GOOGLE_CLIENT_ID)
        
        email = idinfo['email']
        name = idinfo.get('name', email)
        google_id = idinfo['sub']
        profile_picture_url = idinfo.get('picture')

        user = db.query(User).filter(User.google_id == google_id).first()
        if not user:
            # Check if email already exists with a non-Google account
            existing_email_user = db.query(User).filter(User.email == email).first()
            if existing_email_user and not existing_email_user.google_id:
                raise HTTPException(status_code=400, detail="Email already registered with a non-Google account. Please login with password.")
            
            # Create new user
            user = User(name=name, email=email, google_id=google_id, profile_picture_url=profile_picture_url, hashed_password="")
            db.add(user)
            db.commit()
            db.refresh(user)
        elif user.email != email:
            # Update email if it changed (e.g., user changed primary email in Google)
            user.email = email
            db.commit()
            db.refresh(user)
        
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google ID token")


@app.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Check if account is Google-only
    if db_user.hashed_password == "" or db_user.hashed_password is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account was created with Google. Please use Google login.",
        )
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.put("/users/me", response_model=UserResponse)
def update_user(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Re-fetch the user from the session to ensure it's persistent
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

@app.get("/users/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/users/me/profile-picture", response_model=UserResponse)
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

    # Save full URL
    user.profile_picture_url = f"{BASE_URL}/uploads/{file_name}"
    db.commit()
    db.refresh(user)
    return user

@app.delete("/users/me/profile-picture", response_model=UserResponse)
def delete_profile_picture(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Re-fetch the user from the session to ensure it's persistent
    user = db.query(User).filter(User.id == current_user.id).first()
    if user and user.profile_picture_url:
        file_path = user.profile_picture_url.lstrip("/")
        if os.path.exists(file_path):
            os.remove(file_path)
        user.profile_picture_url = None
        db.commit()
        db.refresh(user)
    return user

@app.post("/transactions", response_model=TransactionResponse)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_transaction = Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions", response_model=list[TransactionResponse])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    transactions = db.query(Transaction).offset(skip).limit(limit).all()
    return transactions

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8060)
