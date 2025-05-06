from sqlalchemy import Column, String, Boolean
from .database import Base
# from sqlalchemy import Column, Integer, String, Float, Date, Boolean

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_verified = Column(Boolean, default=False)

