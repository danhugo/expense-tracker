import os

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from models import (
    SessionLocal,
    User,
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
)

from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
)

from google.oauth2 import id_token
from google.auth.transport import requests

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if user.google_id:
        db_user = db.query(User).filter(User.google_id == user.google_id).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Google account already registered")
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered with another account")
        
        db_user = User(name=user.name, email=user.email, google_id=user.google_id, hashed_password="") # Google users don't need password
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

@router.post("/google-login", response_model=Token)
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
            existing_email_user = db.query(User).filter(User.email == email).first()
            if existing_email_user and not existing_email_user.google_id:
                raise HTTPException(status_code=400, detail="Email already registered with a non-Google account. Please login with password.")
            
            user = User(name=name, email=email, google_id=google_id, profile_picture_url=profile_picture_url, hashed_password="")
            db.add(user)
            db.commit()
            db.refresh(user)
        elif user.email != email:
            user.email = email
            db.commit()
            db.refresh(user)
        
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google ID token")

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
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