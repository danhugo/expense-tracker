from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import Optional, List, Union
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://expense_user:expense_password@localhost:5433/expense_tracker_db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    google_id = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    profile_picture_url = Column(String, nullable=True)
    currency = Column(String, default="USD", nullable=False)
    currency_symbol = Column(String, default="$", nullable=False)
    
    # Relationships
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    currency_conversions = relationship("CurrencyConversion", back_populates="user", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # TODO: Make this nullable=False after data migration
    amount = Column(Float, nullable=False)  # Amount in user's display currency
    original_amount = Column(Float, nullable=True)  # Amount in transaction currency
    original_currency = Column(String, nullable=True)  # Transaction currency code
    exchange_rate_to_usd = Column(Float, nullable=True)  # Exchange rate to USD at time of transaction
    type = Column(String, nullable=False)  # income or expense
    category = Column(String, nullable=False)  # TODO: Will be migrated to category_id
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    description = Column(Text, nullable=True)
    date = Column(DateTime, nullable=False)
    payment_method = Column(String, nullable=True)  # cash, credit_card, debit_card, bank_transfer, etc.
    location = Column(String, nullable=True)
    tags = Column(Text, nullable=True)  # JSON string for multiple tags
    receipt_url = Column(String, nullable=True)
    is_recurring = Column(Boolean, default=False)
    recurring_frequency = Column(String, nullable=True)  # daily, weekly, monthly, yearly
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    category_rel = relationship("Category", foreign_keys=[category_id])

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # income or expense
    icon = Column(String, nullable=True)
    color = Column(String, nullable=True)
    budget_limit = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="categories")
    budgets = relationship("Budget", back_populates="category", cascade="all, delete-orphan")

class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    period = Column(String, nullable=False)  # monthly, quarterly, yearly
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    alert_threshold = Column(Float, default=80.0)  # Alert when X% of budget is used
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")

class CurrencyConversion(Base):
    __tablename__ = "currency_conversions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    from_currency = Column(String, nullable=False)
    to_currency = Column(String, nullable=False)
    exchange_rate = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending, processing, completed, failed
    progress = Column(Integer, default=0)
    total_items = Column(Integer, default=0)
    items_converted = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    revertable_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="currency_conversions")

# Pydantic models for API
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: Optional[str] = None
    google_id: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    profile_picture_url: Optional[str] = None
    currency: str
    currency_symbol: str

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    profile_picture_url: Optional[str] = None
    currency: Optional[str] = None
    currency_symbol: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class TransactionBase(BaseModel):
    amount: float
    type: str  # income or expense
    category: str
    description: Optional[str] = None
    date: Union[datetime, str]  # Accept both datetime and string
    payment_method: Optional[str] = None
    location: Optional[str] = None
    tags: Optional[List[str]] = []
    receipt_url: Optional[str] = None
    is_recurring: bool = False
    recurring_frequency: Optional[str] = None
    
    @field_validator('date', mode='before')
    def parse_date(cls, v):
        if isinstance(v, str):
            # Handle ISO format with or without timezone
            return datetime.fromisoformat(v.replace('Z', '+00:00'))
        return v

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[Union[datetime, str]] = None
    payment_method: Optional[str] = None
    location: Optional[str] = None
    tags: Optional[List[str]] = None
    receipt_url: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurring_frequency: Optional[str] = None
    
    @field_validator('date', mode='before')
    def parse_date(cls, v):
        if v is not None and isinstance(v, str):
            return datetime.fromisoformat(v.replace('Z', '+00:00'))
        return v

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    type: str
    category: str
    category_id: Optional[int] = None
    category_details: Optional['CategoryResponse'] = None
    description: Optional[str] = None
    date: str  # Changed to string
    payment_method: Optional[str] = None
    location: Optional[str] = None
    tags: Optional[List[str]] = []
    receipt_url: Optional[str] = None
    is_recurring: bool = False
    recurring_frequency: Optional[str] = None
    created_at: str  # Changed to string
    updated_at: str  # Changed to string

    model_config = ConfigDict(from_attributes=True)
    
    @field_validator('date', 'created_at', 'updated_at', mode='before')
    def datetime_to_string(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

class TransactionFilter(BaseModel):
    start_date: Optional[Union[datetime, str]] = None
    end_date: Optional[Union[datetime, str]] = None
    type: Optional[str] = None
    category: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    payment_method: Optional[str] = None
    search: Optional[str] = None
    tags: Optional[List[str]] = None
    
    @field_validator('start_date', 'end_date', mode='before')
    def parse_dates(cls, v):
        if v is not None and isinstance(v, str):
            return datetime.fromisoformat(v.replace('Z', '+00:00'))
        return v

class CategoryBase(BaseModel):
    name: str
    type: str  # income or expense
    icon: Optional[str] = None
    color: Optional[str] = None
    budget_limit: Optional[float] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    budget_limit: Optional[float] = None

class CategoryResponse(CategoryBase):
    id: int
    user_id: int
    created_at: str  # Changed to string

    model_config = ConfigDict(from_attributes=True)
    
    @field_validator('created_at', mode='before')
    def datetime_to_string(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

class TransactionStatistics(BaseModel):
    total_income: float
    total_expenses: float
    balance: float
    transaction_count: int
    average_transaction: float
    largest_expense: Optional[TransactionResponse] = None
    largest_income: Optional[TransactionResponse] = None
    expenses_by_category: dict
    income_by_category: dict
    daily_average: float
    monthly_trend: List[dict]

class BulkTransactionOperation(BaseModel):
    transaction_ids: List[int]
    operation: str  # delete, update_category, add_tags
    data: Optional[dict] = None

class PaginatedTransactionResponse(BaseModel):
    items: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class BudgetBase(BaseModel):
    name: str
    amount: float
    period: str  # monthly, quarterly, yearly
    category_id: Optional[int] = None
    start_date: Union[datetime, str]
    end_date: Optional[Union[datetime, str]] = None
    alert_threshold: float = 80.0
    
    @field_validator('start_date', 'end_date', mode='before')
    def parse_date(cls, v):
        if v is not None and isinstance(v, str):
            return datetime.fromisoformat(v.replace('Z', '+00:00'))
        return v

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    period: Optional[str] = None
    category_id: Optional[int] = None
    end_date: Optional[Union[datetime, str]] = None
    is_active: Optional[bool] = None
    alert_threshold: Optional[float] = None
    
    @field_validator('end_date', mode='before')
    def parse_date(cls, v):
        if v is not None and isinstance(v, str):
            return datetime.fromisoformat(v.replace('Z', '+00:00'))
        return v

class BudgetResponse(BaseModel):
    id: int
    user_id: int
    name: str
    amount: float
    period: str
    category_id: Optional[int] = None
    start_date: str
    end_date: Optional[str] = None
    is_active: bool
    alert_threshold: float
    created_at: str
    updated_at: str
    # Include category info if available
    category: Optional['CategoryResponse'] = None
    # Include current usage
    current_spent: Optional[float] = None
    percentage_used: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)
    
    @field_validator('start_date', 'end_date', 'created_at', 'updated_at', mode='before')
    def datetime_to_string(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

class BudgetWithUsage(BudgetResponse):
    current_spent: float
    percentage_used: float
    remaining_amount: float
    days_remaining: Optional[int] = None