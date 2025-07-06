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

# class Expense(Base):
#     __tablename__ = "expenses"

#     id = Column(Integer, primary_key=True, index=True)
#     amount = Column(Float, nullable=False)
#     date = Column(Date, nullable=False)
#     category = Column(String, nullable=False)
#     description = Column(String)

# class Income(Base):
#     __tablename__ = "income"

#     id = Column(Integer, primary_key=True, index=True)
#     amount = Column(Float, nullable=False)
#     date = Column(Date, nullable=False)
#     source = Column(String, nullable=False)

# class Budget(Base):
#     __tablename__ = "budgets"

#     id = Column(Integer, primary_key=True, index=True)
#     category = Column(String, nullable=False)
#     amount = Column(Float, nullable=False)
