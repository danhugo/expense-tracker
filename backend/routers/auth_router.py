import os

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from models import (
    SessionLocal,
    User,
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    Category,
)

from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
)

from google.oauth2 import id_token
from google.auth.transport import requests
from currency_utils import get_currency_from_ip, get_currency_symbol

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

@router.post("/signup", response_model=UserResponse)
async def signup(user: UserCreate, request: Request, db: Session = Depends(get_db)):
    # Detect currency based on IP
    detected_currency = await get_currency_from_ip(request)
    currency_symbol = get_currency_symbol(detected_currency)
    
    if user.google_id:
        db_user = db.query(User).filter(User.google_id == user.google_id).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Google account already registered")
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered with another account")
        
        db_user = User(
            name=user.name, 
            email=user.email, 
            google_id=user.google_id, 
            hashed_password="",
            currency=detected_currency,
            currency_symbol=currency_symbol
        )
    else:
        db_user = db.query(User).filter(User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        if not user.password:
            raise HTTPException(status_code=400, detail="Password is required for non-Google signups")
        
        hashed_password = get_password_hash(user.password)
        db_user = User(
            name=user.name, 
            email=user.email, 
            hashed_password=hashed_password,
            currency=detected_currency,
            currency_symbol=currency_symbol
        )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create default categories for new user
    create_default_categories(db_user.id, db)
    
    return db_user

class GoogleLoginRequest(BaseModel):
    id_token_str: str

@router.post("/google-login", response_model=Token)
async def google_login(payload: GoogleLoginRequest, request: Request, db: Session = Depends(get_db)):
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
            
            # Detect currency for new user
            detected_currency = await get_currency_from_ip(request)
            currency_symbol = get_currency_symbol(detected_currency)
            
            user = User(
                name=name, 
                email=email, 
                google_id=google_id, 
                profile_picture_url=profile_picture_url, 
                hashed_password="",
                currency=detected_currency,
                currency_symbol=currency_symbol
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Create default categories for new user
            create_default_categories(user.id, db)
        else:
            # Update user info if changed
            if user.email != email:
                user.email = email
            # Only update profile picture from Google if user doesn't have a custom uploaded one
            # Custom uploaded images start with the BASE_URL/uploads pattern
            if profile_picture_url and (not user.profile_picture_url or 
                                       not user.profile_picture_url.startswith(f"{BASE_URL}/uploads/")):
                user.profile_picture_url = profile_picture_url
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

def create_default_categories(user_id: int, db: Session):
    """Create default categories for a new user"""
    # Default expense categories
    expense_categories = [
        {"name": "Food & Dining", "icon": "🍽️", "color": "#FF6B6B"},
        {"name": "Transportation", "icon": "🚗", "color": "#4ECDC4"},
        {"name": "Shopping", "icon": "🛍️", "color": "#FFE66D"},
        {"name": "Entertainment", "icon": "🎬", "color": "#A8E6CF"},
        {"name": "Bills & Utilities", "icon": "📱", "color": "#C7CEEA"},
        {"name": "Healthcare", "icon": "🏥", "color": "#FFDAB9"},
        {"name": "Education", "icon": "📚", "color": "#98D8C8"},
        {"name": "Travel", "icon": "✈️", "color": "#F7DC6F"},
        {"name": "Personal Care", "icon": "💅", "color": "#BB8FCE"},
        {"name": "Gifts & Donations", "icon": "🎁", "color": "#85C1E2"},
        {"name": "Investments", "icon": "📈", "color": "#52BE80"},
        {"name": "Insurance", "icon": "🛡️", "color": "#F8B739"},
        {"name": "Rent/Mortgage", "icon": "🏠", "color": "#EC7063"},
        {"name": "Other", "icon": "📌", "color": "#BDC3C7"}
    ]
    
    # Default income categories
    income_categories = [
        {"name": "Salary", "icon": "💰", "color": "#27AE60"},
        {"name": "Freelance", "icon": "💼", "color": "#3498DB"},
        {"name": "Business", "icon": "🏢", "color": "#9B59B6"},
        {"name": "Investments", "icon": "📊", "color": "#F39C12"},
        {"name": "Rental Income", "icon": "🏘️", "color": "#E74C3C"},
        {"name": "Gifts", "icon": "🎁", "color": "#1ABC9C"},
        {"name": "Refunds", "icon": "💵", "color": "#34495E"},
        {"name": "Other", "icon": "💸", "color": "#95A5A6"}
    ]
    
    # Create expense categories
    for cat_data in expense_categories:
        category = Category(
            user_id=user_id,
            type="expense",
            **cat_data
        )
        db.add(category)
    
    # Create income categories
    for cat_data in income_categories:
        category = Category(
            user_id=user_id,
            type="income",
            **cat_data
        )
        db.add(category)
    
    db.commit()