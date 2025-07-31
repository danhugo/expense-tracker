from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel
import asyncio
import uuid

from models import SessionLocal, User, Transaction, Budget, CurrencyConversion
from auth import get_current_user
from currency_utils import get_exchange_rates, convert_currency, get_currency_symbol
from currencies import CURRENCIES

router = APIRouter(prefix="/currency")

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
class CurrencyPreviewRequest(BaseModel):
    from_currency: str
    to_currency: str

class CurrencyPreviewResponse(BaseModel):
    from_currency: str
    to_currency: str
    exchange_rate: float
    rate_timestamp: datetime
    preview: Dict[str, Any]
    impact: Dict[str, Any]

class CurrencyConvertRequest(BaseModel):
    target_currency: str
    confirm_rate: float

class ConversionStatusResponse(BaseModel):
    id: int
    status: str
    progress: int
    items_converted: int
    total_items: int
    error_message: Optional[str] = None

# Global dictionary to track conversion progress (in production, use Redis)
conversion_progress = {}

@router.get("/preview", response_model=CurrencyPreviewResponse)
async def preview_currency_change(
    to_currency: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Preview currency conversion impact"""
    from_currency = current_user.currency
    
    # Get exchange rates
    rates = await get_exchange_rates()
    if not rates:
        raise HTTPException(status_code=503, detail="Unable to fetch exchange rates")
    
    # Calculate exchange rate
    from_rate = rates.get(from_currency, 1.0) if from_currency != "USD" else 1.0
    to_rate = rates.get(to_currency, 1.0) if to_currency != "USD" else 1.0
    exchange_rate = to_rate / from_rate if from_rate != 0 else 1.0
    
    # Get sample transactions for preview
    sample_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.date.desc()).limit(5).all()
    
    # Calculate preview data
    preview_transactions = []
    for tx in sample_transactions:
        original_amount = tx.original_amount if tx.original_amount else tx.amount
        original_currency = tx.original_currency if tx.original_currency else from_currency
        converted_amount = convert_currency(original_amount, original_currency, to_currency, rates)
        
        preview_transactions.append({
            "id": tx.id,
            "description": tx.description or f"{tx.category} transaction",
            "date": tx.date.isoformat(),
            "original_amount": tx.amount,
            "converted_amount": round(converted_amount, 2),
            "type": tx.type
        })
    
    # Calculate budget impact
    budgets = db.query(Budget).filter(
        and_(Budget.user_id == current_user.id, Budget.is_active == True)
    ).all()
    
    budget_preview = []
    for budget in budgets:
        converted_amount = convert_currency(budget.amount, from_currency, to_currency, rates)
        budget_preview.append({
            "id": budget.id,
            "name": budget.name,
            "original_amount": budget.amount,
            "converted_amount": round(converted_amount, 2)
        })
    
    # Calculate total balance impact
    all_transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).all()
    
    total_balance = sum(
        tx.amount if tx.type == "income" else -tx.amount 
        for tx in all_transactions
    )
    
    converted_balance = convert_currency(abs(total_balance), from_currency, to_currency, rates)
    
    # Count total items to convert
    total_items = len(all_transactions) + len(budgets)
    
    return CurrencyPreviewResponse(
        from_currency=from_currency,
        to_currency=to_currency,
        exchange_rate=round(exchange_rate, 6),
        rate_timestamp=datetime.utcnow(),
        preview={
            "transactions": preview_transactions,
            "budgets": budget_preview,
            "total_items": total_items
        },
        impact={
            "total_balance": {
                "before": round(total_balance, 2),
                "after": round(converted_balance * (1 if total_balance >= 0 else -1), 2),
                "currency_before": from_currency,
                "currency_after": to_currency
            },
            "from_symbol": get_currency_symbol(from_currency),
            "to_symbol": get_currency_symbol(to_currency)
        }
    )

async def process_currency_conversion(
    conversion_id: int,
    user_id: int,
    target_currency: str,
    exchange_rate: float,
    db: Session
):
    """Background task to process currency conversion"""
    try:
        # Get conversion record
        conversion = db.query(CurrencyConversion).filter(
            CurrencyConversion.id == conversion_id
        ).first()
        
        if not conversion:
            return
        
        # Update status to processing
        conversion.status = "processing"
        db.commit()
        
        # Get user and update currency
        user = db.query(User).filter(User.id == user_id).first()
        old_currency = user.currency
        user.currency = target_currency
        user.currency_symbol = get_currency_symbol(target_currency)
        db.commit()
        
        # Get exchange rates
        rates = await get_exchange_rates()
        
        # Convert transactions in batches
        batch_size = 50
        offset = 0
        
        transactions = db.query(Transaction).filter(
            Transaction.user_id == user_id
        ).all()
        
        total_items = len(transactions)
        conversion.total_items = total_items
        
        for i, tx in enumerate(transactions):
            # Store original values if not already stored
            if tx.original_amount is None:
                tx.original_amount = tx.amount
                tx.original_currency = old_currency
            
            # Use historical exchange rate if available
            if tx.exchange_rate_to_usd:
                # Convert using historical rate
                # First convert to USD using historical rate
                amount_in_usd = tx.original_amount * tx.exchange_rate_to_usd if tx.original_currency != "USD" else tx.original_amount
                
                # Then convert from USD to target currency using current rate
                if target_currency != "USD":
                    target_rate = rates.get(target_currency, 1.0)
                    tx.amount = amount_in_usd * target_rate
                else:
                    tx.amount = amount_in_usd
            else:
                # Fallback to current rates if no historical rate stored
                tx.amount = convert_currency(
                    tx.original_amount,
                    tx.original_currency,
                    target_currency,
                    rates
                )
            
            # Update progress
            if i % 10 == 0:
                conversion.items_converted = i + 1
                conversion.progress = int((i + 1) / total_items * 70)  # 70% for transactions
                db.commit()
                
                # Update global progress (for WebSocket)
                conversion_progress[conversion_id] = {
                    "progress": conversion.progress,
                    "items_converted": conversion.items_converted,
                    "total_items": total_items
                }
        
        # Convert budgets
        budgets = db.query(Budget).filter(
            Budget.user_id == user_id
        ).all()
        
        for budget in budgets:
            budget.amount = convert_currency(
                budget.amount,
                old_currency,
                target_currency,
                rates
            )
        
        # Mark as completed
        conversion.status = "completed"
        conversion.progress = 100
        conversion.items_converted = total_items
        conversion.completed_at = datetime.utcnow()
        conversion.revertable_until = datetime.utcnow() + timedelta(hours=24)
        db.commit()
        
        # Update global progress
        conversion_progress[conversion_id] = {
            "progress": 100,
            "items_converted": total_items,
            "total_items": total_items,
            "status": "completed"
        }
        
    except Exception as e:
        # Mark as failed
        if conversion:
            conversion.status = "failed"
            conversion.error_message = str(e)
            db.commit()
        
        conversion_progress[conversion_id] = {
            "status": "failed",
            "error": str(e)
        }

@router.post("/convert")
async def start_currency_conversion(
    request: CurrencyConvertRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start currency conversion process"""
    # Create conversion record
    conversion = CurrencyConversion(
        user_id=current_user.id,
        from_currency=current_user.currency,
        to_currency=request.target_currency,
        exchange_rate=request.confirm_rate,
        status="pending"
    )
    db.add(conversion)
    db.commit()
    db.refresh(conversion)
    
    # Start background conversion
    background_tasks.add_task(
        process_currency_conversion,
        conversion.id,
        current_user.id,
        request.target_currency,
        request.confirm_rate,
        db
    )
    
    return {
        "status": "processing",
        "conversion_id": conversion.id,
        "message": "Currency conversion started"
    }

@router.get("/conversion-status/{conversion_id}", response_model=ConversionStatusResponse)
def get_conversion_status(
    conversion_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get status of currency conversion"""
    conversion = db.query(CurrencyConversion).filter(
        and_(
            CurrencyConversion.id == conversion_id,
            CurrencyConversion.user_id == current_user.id
        )
    ).first()
    
    if not conversion:
        raise HTTPException(status_code=404, detail="Conversion not found")
    
    # Check global progress for real-time updates
    if conversion_id in conversion_progress:
        progress_data = conversion_progress[conversion_id]
        return ConversionStatusResponse(
            id=conversion.id,
            status=progress_data.get("status", conversion.status),
            progress=progress_data.get("progress", conversion.progress),
            items_converted=progress_data.get("items_converted", conversion.items_converted),
            total_items=progress_data.get("total_items", conversion.total_items),
            error_message=progress_data.get("error")
        )
    
    return ConversionStatusResponse(
        id=conversion.id,
        status=conversion.status,
        progress=conversion.progress,
        items_converted=conversion.items_converted,
        total_items=conversion.total_items,
        error_message=conversion.error_message
    )

@router.get("/history")
def get_conversion_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's currency conversion history"""
    conversions = db.query(CurrencyConversion).filter(
        CurrencyConversion.user_id == current_user.id
    ).order_by(CurrencyConversion.created_at.desc()).limit(10).all()
    
    return [{
        "id": c.id,
        "from_currency": c.from_currency,
        "to_currency": c.to_currency,
        "exchange_rate": c.exchange_rate,
        "status": c.status,
        "created_at": c.created_at,
        "completed_at": c.completed_at,
        "revertable": c.revertable_until and c.revertable_until > datetime.utcnow() if c.revertable_until else False
    } for c in conversions]

@router.post("/revert/{conversion_id}")
async def revert_conversion(
    conversion_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revert a currency conversion"""
    conversion = db.query(CurrencyConversion).filter(
        and_(
            CurrencyConversion.id == conversion_id,
            CurrencyConversion.user_id == current_user.id,
            CurrencyConversion.status == "completed"
        )
    ).first()
    
    if not conversion:
        raise HTTPException(status_code=404, detail="Conversion not found or not revertable")
    
    if not conversion.revertable_until or conversion.revertable_until < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Conversion revert period has expired")
    
    # Create a new conversion to revert
    revert_conversion = CurrencyConversion(
        user_id=current_user.id,
        from_currency=conversion.to_currency,
        to_currency=conversion.from_currency,
        exchange_rate=1 / conversion.exchange_rate,  # Inverse rate
        status="pending"
    )
    db.add(revert_conversion)
    db.commit()
    db.refresh(revert_conversion)
    
    # Start background reversion
    background_tasks.add_task(
        process_currency_conversion,
        revert_conversion.id,
        current_user.id,
        conversion.from_currency,
        1 / conversion.exchange_rate,
        db
    )
    
    # Mark original as reverted
    conversion.revertable_until = None
    db.commit()
    
    return {
        "status": "processing",
        "conversion_id": revert_conversion.id,
        "message": "Currency reversion started"
    }