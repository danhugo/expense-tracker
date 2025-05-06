# utils/token.py
from jose import jwt
from datetime import datetime, timedelta
from ..config import SECRET_KEY, ALGORITHM  # import securely

def create_email_token(email: str):
    expire = datetime.utcnow() + timedelta(hours=1)
    payload = {"sub": email, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_email_token(token: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload.get("sub")

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

