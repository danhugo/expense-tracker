from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from models import (
    Category, CategoryCreate, CategoryUpdate, CategoryResponse,
    SessionLocal, User, Transaction
)
from auth import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(
    category_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all categories for the current user, optionally filtered by type."""
    query = db.query(Category).filter(Category.user_id == current_user.id)
    
    if category_type:
        if category_type not in ['income', 'expense']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category type must be 'income' or 'expense'"
            )
        query = query.filter(Category.type == category_type)
    
    return query.order_by(Category.name).all()

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific category by ID."""
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return category

@router.post("/", response_model=CategoryResponse)
async def create_category(
    category: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new category."""
    # Check if category with same name already exists for this user
    existing = db.query(Category).filter(
        Category.user_id == current_user.id,
        Category.name == category.name,
        Category.type == category.type
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category.name}' of type '{category.type}' already exists"
        )
    
    db_category = Category(
        user_id=current_user.id,
        **category.dict()
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    
    return db_category

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing category."""
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if new name conflicts with existing category
    if category_update.name:
        existing = db.query(Category).filter(
            Category.user_id == current_user.id,
            Category.name == category_update.name,
            Category.type == category.type,
            Category.id != category_id
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{category_update.name}' of type '{category.type}' already exists"
            )
    
    for field, value in category_update.dict(exclude_unset=True).items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    
    return category

@router.delete("/{category_id}")
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a category."""
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.user_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if category is in use by any transactions
    transaction_count = db.query(Transaction).filter(
        Transaction.category_id == category_id
    ).count()
    
    if transaction_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category. It is used by {transaction_count} transactions."
        )
    
    db.delete(category)
    db.commit()
    
    return {"message": "Category deleted successfully"}

@router.post("/initialize-defaults")
async def initialize_default_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initialize default categories for a user."""
    # Check if user already has categories
    existing_count = db.query(Category).filter(Category.user_id == current_user.id).count()
    
    if existing_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has categories"
        )
    
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
    
    created_categories = []
    
    # Create expense categories
    for cat_data in expense_categories:
        category = Category(
            user_id=current_user.id,
            type="expense",
            **cat_data
        )
        db.add(category)
        created_categories.append(category)
    
    # Create income categories
    for cat_data in income_categories:
        category = Category(
            user_id=current_user.id,
            type="income",
            **cat_data
        )
        db.add(category)
        created_categories.append(category)
    
    db.commit()
    
    return {
        "message": "Default categories created successfully",
        "count": len(created_categories)
    }