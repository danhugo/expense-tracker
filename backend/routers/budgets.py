from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from dateutil.relativedelta import relativedelta

from models import (
    SessionLocal,
    Budget,
    BudgetCreate,
    BudgetUpdate,
    BudgetResponse,
    BudgetWithUsage,
    Transaction,
    Category,
    User
)
from auth import get_current_user

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def calculate_budget_period_dates(period: str, reference_date: datetime = None):
    """Calculate start and end dates for a budget period"""
    if reference_date is None:
        reference_date = datetime.utcnow()
    
    if period == "monthly":
        start_date = reference_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = (start_date + relativedelta(months=1)) - timedelta(seconds=1)
    elif period == "quarterly":
        quarter = (reference_date.month - 1) // 3
        start_date = datetime(reference_date.year, quarter * 3 + 1, 1)
        end_date = (start_date + relativedelta(months=3)) - timedelta(seconds=1)
    elif period == "yearly":
        start_date = reference_date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end_date = reference_date.replace(month=12, day=31, hour=23, minute=59, second=59, microsecond=999999)
    else:
        raise ValueError(f"Invalid period: {period}")
    
    return start_date, end_date

def calculate_budget_usage(budget: Budget, db: Session):
    """Calculate current spending and usage percentage for a budget"""
    # Use the budget's actual start and end dates
    start_date = budget.start_date
    
    # If budget has an end_date, use it; otherwise calculate based on period
    if budget.end_date:
        end_date = budget.end_date
    else:
        # Calculate end date based on period from start_date
        if budget.period == "monthly":
            end_date = start_date + relativedelta(months=1) - timedelta(seconds=1)
        elif budget.period == "quarterly":
            end_date = start_date + relativedelta(months=3) - timedelta(seconds=1)
        elif budget.period == "yearly":
            end_date = start_date + relativedelta(years=1) - timedelta(seconds=1)
        else:
            # Default to one month if period is unknown
            end_date = start_date + relativedelta(months=1) - timedelta(seconds=1)
    
    # Build query for transactions
    query = db.query(func.sum(Transaction.amount)).filter(
        and_(
            Transaction.user_id == budget.user_id,
            Transaction.type == 'expense',
            Transaction.date >= start_date,
            Transaction.date <= end_date
        )
    )
    
    # Filter by category if specified
    if budget.category_id and budget.category:
        query = query.filter(Transaction.category == budget.category.name)
    
    current_spent = query.scalar() or 0.0
    percentage_used = (current_spent / budget.amount * 100) if budget.amount > 0 else 0.0
    remaining_amount = budget.amount - current_spent
    
    # Calculate days remaining
    now = datetime.utcnow()
    if now > end_date:
        days_remaining = 0
    else:
        days_remaining = (end_date - now).days
    
    return {
        "current_spent": current_spent,
        "percentage_used": percentage_used,
        "remaining_amount": remaining_amount,
        "days_remaining": days_remaining
    }

@router.post("/budgets", response_model=BudgetResponse)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new budget"""
    # Validate category belongs to user if specified
    if budget.category_id:
        category = db.query(Category).filter(
            and_(
                Category.id == budget.category_id,
                Category.user_id == current_user.id
            )
        ).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
    
    # Create budget
    db_budget = Budget(
        **budget.dict(),
        user_id=current_user.id
    )
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    
    # Load category relationship
    if db_budget.category_id:
        db_budget.category = category
    
    # Calculate initial usage
    usage = calculate_budget_usage(db_budget, db)
    for key, value in usage.items():
        setattr(db_budget, key, value)
    
    return db_budget

@router.get("/budgets", response_model=List[BudgetWithUsage])
def get_budgets(
    is_active: Optional[bool] = Query(None),
    period: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all budgets for the current user with usage information"""
    query = db.query(Budget).filter(Budget.user_id == current_user.id)
    
    if is_active is not None:
        query = query.filter(Budget.is_active == is_active)
    
    if period:
        query = query.filter(Budget.period == period)
    
    budgets = query.all()
    
    # Calculate usage for each budget
    budget_responses = []
    for budget in budgets:
        # Load category if exists
        if budget.category_id:
            budget.category = db.query(Category).filter(Category.id == budget.category_id).first()
        
        # Calculate usage
        usage = calculate_budget_usage(budget, db)
        
        # Create response with usage
        budget_dict = budget.__dict__.copy()
        budget_dict.update(usage)
        budget_responses.append(BudgetWithUsage(**budget_dict))
    
    return budget_responses

@router.get("/budgets/by-period", response_model=List[BudgetWithUsage])
def get_budgets_by_period(
    year: int = Query(..., description="Year for the budget period"),
    month: int = Query(..., ge=1, le=12, description="Month for the budget period"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all budgets that are active for a specific month/year"""
    # Create date range for the specified month
    period_start = datetime(year, month, 1)
    period_end = period_start + relativedelta(months=1) - timedelta(seconds=1)
    
    # Query budgets that overlap with this period
    budgets = db.query(Budget).filter(
        and_(
            Budget.user_id == current_user.id,
            Budget.is_active == True,
            Budget.start_date <= period_end,
            or_(
                Budget.end_date == None,
                Budget.end_date >= period_start
            )
        )
    ).all()
    
    # Calculate usage for each budget
    budget_responses = []
    for budget in budgets:
        # Load category if exists
        if budget.category_id:
            budget.category = db.query(Category).filter(Category.id == budget.category_id).first()
        
        # Calculate usage
        usage = calculate_budget_usage(budget, db)
        
        # Create response with usage
        budget_dict = budget.__dict__.copy()
        budget_dict.update(usage)
        budget_responses.append(BudgetWithUsage(**budget_dict))
    
    return budget_responses

@router.get("/budgets/{budget_id}", response_model=BudgetWithUsage)
def get_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific budget with usage information"""
    budget = db.query(Budget).filter(
        and_(
            Budget.id == budget_id,
            Budget.user_id == current_user.id
        )
    ).first()
    
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    # Load category if exists
    if budget.category_id:
        budget.category = db.query(Category).filter(Category.id == budget.category_id).first()
    
    # Calculate usage
    usage = calculate_budget_usage(budget, db)
    
    # Create response with usage
    budget_dict = budget.__dict__.copy()
    budget_dict.update(usage)
    
    return BudgetWithUsage(**budget_dict)

@router.put("/budgets/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    budget_update: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a budget"""
    budget = db.query(Budget).filter(
        and_(
            Budget.id == budget_id,
            Budget.user_id == current_user.id
        )
    ).first()
    
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    # Validate category if being updated
    if budget_update.category_id is not None:
        if budget_update.category_id:  # If not None and not 0
            category = db.query(Category).filter(
                and_(
                    Category.id == budget_update.category_id,
                    Category.user_id == current_user.id
                )
            ).first()
            if not category:
                raise HTTPException(status_code=404, detail="Category not found")
    
    # Update fields
    update_data = budget_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(budget, field, value)
    
    db.commit()
    db.refresh(budget)
    
    # Load category relationship
    if budget.category_id:
        budget.category = db.query(Category).filter(Category.id == budget.category_id).first()
    
    # Calculate usage
    usage = calculate_budget_usage(budget, db)
    for key, value in usage.items():
        setattr(budget, key, value)
    
    return budget

@router.delete("/budgets/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a budget"""
    budget = db.query(Budget).filter(
        and_(
            Budget.id == budget_id,
            Budget.user_id == current_user.id
        )
    ).first()
    
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    
    db.delete(budget)
    db.commit()
    
    return {"message": "Budget deleted successfully"}

@router.get("/budgets/alerts")
def get_budget_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get budgets that have exceeded their alert threshold"""
    active_budgets = db.query(Budget).filter(
        and_(
            Budget.user_id == current_user.id,
            Budget.is_active == True
        )
    ).all()
    
    alerts = []
    for budget in active_budgets:
        usage = calculate_budget_usage(budget, db)
        
        if usage["percentage_used"] >= budget.alert_threshold:
            # Load category if exists
            if budget.category_id:
                budget.category = db.query(Category).filter(Category.id == budget.category_id).first()
            
            alerts.append({
                "budget_id": budget.id,
                "budget_name": budget.name,
                "category": budget.category.name if budget.category else None,
                "amount": budget.amount,
                "current_spent": usage["current_spent"],
                "percentage_used": usage["percentage_used"],
                "alert_threshold": budget.alert_threshold,
                "days_remaining": usage["days_remaining"]
            })
    
    return alerts