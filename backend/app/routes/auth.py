from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, database, schemas
from ..utils.token import create_email_token, verify_email_token, create_access_token
from ..utils.email import send_verification_email
from ..utils.hashing import hash_password, verify_password
import uuid

router = APIRouter()

@router.post("/register")
async def register(user: schemas.UserRegister, db: Session = Depends(database.get_db)):
    if db.query(models.User).filter_by(email=user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if db.query(models.User).filter_by(username=user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    new_user = models.User(
        id=str(uuid.uuid4()),
        email=user.email,
        username=user.username,
        hashed_password=hash_password(user.password),
        is_verified=False
    )
    db.add(new_user)
    db.commit()

    token = create_email_token(user.email)
    await send_verification_email(user.email, token)

    return {"msg": "Check your email to verify your account"}

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(database.get_db)):
    try:
        email = verify_email_token(token)
    except:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    user = db.query(models.User).filter_by(email=email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    db.commit()
    return {"msg": "Email verified successfully. You can now log in."}

@router.post("/resend-verification")
async def resend_verification(email: str, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter_by(email=email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    token = create_email_token(user.email)
    await send_verification_email(user.email, token)
    return {"msg": "Verification email resent."}

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter_by(email=user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    access_token = create_access_token({"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}



