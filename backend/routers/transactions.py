from typing import List, Optional
import json
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, extract
from sqlalchemy.sql import text
import csv
import io

from models import (
    SessionLocal, 
    Transaction, 
    TransactionCreate,
    TransactionUpdate, 
    TransactionResponse, 
    TransactionFilter,
    TransactionStatistics,
    BulkTransactionOperation,
    PaginatedTransactionResponse,
    User
)
from auth import get_current_user
from currency_utils import get_historical_exchange_rate

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/transactions", response_model=TransactionResponse)
async def create_transaction(
    transaction: TransactionCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Create a new transaction for the current user."""
    # Convert tags list to JSON string for storage
    tags_json = json.dumps(transaction.tags) if transaction.tags else None
    
    # Get the exchange rate to USD at the time of transaction
    transaction_currency = current_user.currency
    exchange_rate_to_usd = 1.0
    
    if transaction_currency != "USD":
        # Fetch historical rate for the transaction date
        exchange_rate_to_usd = await get_historical_exchange_rate(
            transaction_currency, 
            "USD", 
            transaction.date if isinstance(transaction.date, datetime) else datetime.fromisoformat(transaction.date.replace('Z', '+00:00'))
        )
    
    # Store original amount and currency for future conversions
    db_transaction = Transaction(
        **transaction.dict(exclude={'tags'}),
        tags=tags_json,
        user_id=current_user.id,
        original_amount=transaction.amount,
        original_currency=transaction_currency,
        exchange_rate_to_usd=exchange_rate_to_usd
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    # Convert tags back to list for response
    if db_transaction.tags:
        db_transaction.tags = json.loads(db_transaction.tags)
    
    return db_transaction

@router.get("/transactions", response_model=List[TransactionResponse])
def read_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sort_by: str = Query("date", regex="^(date|amount|created_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    # Filter parameters
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    type: Optional[str] = None,
    category: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    payment_method: Optional[str] = None,
    search: Optional[str] = None,
    tags: Optional[str] = None,  # Comma-separated tags
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get filtered and paginated transactions for the current user."""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    # Apply filters
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if type:
        query = query.filter(Transaction.type == type)
    if category:
        query = query.filter(Transaction.category == category)
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)
    if payment_method:
        query = query.filter(Transaction.payment_method == payment_method)
    if search:
        query = query.filter(
            or_(
                Transaction.description.ilike(f"%{search}%"),
                Transaction.location.ilike(f"%{search}%"),
                Transaction.category.ilike(f"%{search}%")
            )
        )
    if tags:
        tag_list = tags.split(",")
        for tag in tag_list:
            query = query.filter(Transaction.tags.like(f'%"{tag.strip()}"%'))
    
    # Apply sorting
    order_column = getattr(Transaction, sort_by)
    if sort_order == "desc":
        query = query.order_by(order_column.desc())
    else:
        query = query.order_by(order_column.asc())
    
    # Execute query
    transactions = query.offset(skip).limit(limit).all()
    
    # Convert tags back to list for each transaction
    for transaction in transactions:
        if transaction.tags:
            transaction.tags = json.loads(transaction.tags)
    
    return transactions


@router.get("/transactions/paginated", response_model=PaginatedTransactionResponse)
def read_transactions_paginated(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("date", regex="^(date|amount|created_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    # Filter parameters
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    type: Optional[str] = None,
    category: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    payment_method: Optional[str] = None,
    search: Optional[str] = None,
    tags: Optional[str] = None,  # Comma-separated tags
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get paginated transactions with total count."""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    # Apply filters (same as above)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if type:
        query = query.filter(Transaction.type == type)
    if category:
        query = query.filter(Transaction.category == category)
    if min_amount is not None:
        query = query.filter(Transaction.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(Transaction.amount <= max_amount)
    if payment_method:
        query = query.filter(Transaction.payment_method == payment_method)
    if search:
        query = query.filter(
            or_(
                Transaction.description.ilike(f"%{search}%"),
                Transaction.location.ilike(f"%{search}%"),
                Transaction.category.ilike(f"%{search}%")
            )
        )
    if tags:
        tag_list = tags.split(",")
        for tag in tag_list:
            query = query.filter(Transaction.tags.like(f'%"{tag.strip()}"%'))
    
    # Get total count before pagination
    total = query.count()
    
    # Apply sorting
    order_column = getattr(Transaction, sort_by)
    if sort_order == "desc":
        query = query.order_by(order_column.desc())
    else:
        query = query.order_by(order_column.asc())
    
    # Calculate pagination
    skip = (page - 1) * page_size
    transactions = query.offset(skip).limit(page_size).all()
    
    # Convert tags back to list for each transaction
    for transaction in transactions:
        if transaction.tags:
            transaction.tags = json.loads(transaction.tags)
    
    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size
    
    return PaginatedTransactionResponse(
        items=transactions,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/transactions/search", response_model=List[TransactionResponse])
def search_transactions(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Quick search transactions by description, location, or category."""
    query = db.query(Transaction).filter(
        and_(
            Transaction.user_id == current_user.id,
            or_(
                Transaction.description.ilike(f"%{q}%"),
                Transaction.location.ilike(f"%{q}%"),
                Transaction.category.ilike(f"%{q}%")
            )
        )
    ).order_by(Transaction.date.desc()).limit(limit)
    
    transactions = query.all()
    
    # Convert tags back to list
    for transaction in transactions:
        if transaction.tags:
            transaction.tags = json.loads(transaction.tags)
    
    return transactions

@router.get("/transactions/statistics", response_model=TransactionStatistics)
def get_transaction_statistics(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get detailed statistics for transactions."""
    # Base query
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    transactions = query.all()
    
    if not transactions:
        return TransactionStatistics(
            total_income=0,
            total_expenses=0,
            balance=0,
            transaction_count=0,
            average_transaction=0,
            expenses_by_category={},
            income_by_category={},
            daily_average=0,
            monthly_trend=[]
        )
    
    # Calculate statistics
    total_income = sum(t.amount for t in transactions if t.type == "income")
    total_expenses = sum(t.amount for t in transactions if t.type == "expense")
    
    # Get largest transactions
    expense_transactions = [t for t in transactions if t.type == "expense"]
    income_transactions = [t for t in transactions if t.type == "income"]
    
    largest_expense = max(expense_transactions, key=lambda t: t.amount) if expense_transactions else None
    largest_income = max(income_transactions, key=lambda t: t.amount) if income_transactions else None
    
    # Convert tags for largest transactions
    if largest_expense and largest_expense.tags:
        largest_expense.tags = json.loads(largest_expense.tags)
    if largest_income and largest_income.tags:
        largest_income.tags = json.loads(largest_income.tags)
    
    # Calculate category breakdowns
    expenses_by_category = {}
    income_by_category = {}
    
    for t in transactions:
        if t.type == "expense":
            expenses_by_category[t.category] = expenses_by_category.get(t.category, 0) + t.amount
        else:
            income_by_category[t.category] = income_by_category.get(t.category, 0) + t.amount
    
    # Calculate daily average
    if transactions:
        date_range = (max(t.date for t in transactions) - min(t.date for t in transactions)).days + 1
        daily_average = (total_income - total_expenses) / date_range if date_range > 0 else 0
    else:
        daily_average = 0
    
    # Calculate monthly trend
    monthly_trend = []
    monthly_data = {}
    
    for t in transactions:
        month_key = t.date.strftime("%Y-%m")
        if month_key not in monthly_data:
            monthly_data[month_key] = {"income": 0, "expenses": 0}
        
        if t.type == "income":
            monthly_data[month_key]["income"] += t.amount
        else:
            monthly_data[month_key]["expenses"] += t.amount
    
    for month, data in sorted(monthly_data.items()):
        monthly_trend.append({
            "month": month,
            "income": data["income"],
            "expenses": data["expenses"],
            "balance": data["income"] - data["expenses"]
        })
    
    return TransactionStatistics(
        total_income=total_income,
        total_expenses=total_expenses,
        balance=total_income - total_expenses,
        transaction_count=len(transactions),
        average_transaction=(total_income + total_expenses) / len(transactions) if transactions else 0,
        largest_expense=largest_expense,
        largest_income=largest_income,
        expenses_by_category=expenses_by_category,
        income_by_category=income_by_category,
        daily_average=daily_average,
        monthly_trend=monthly_trend
    )

@router.get("/transactions/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific transaction by ID."""
    transaction = db.query(Transaction).filter(
        and_(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if transaction.tags:
        transaction.tags = json.loads(transaction.tags)
    
    return transaction

@router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: int,
    transaction_update: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a specific transaction."""
    db_transaction = db.query(Transaction).filter(
        and_(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
    ).first()
    
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update fields
    update_data = transaction_update.dict(exclude_unset=True)
    
    # Handle tags conversion
    if 'tags' in update_data and update_data['tags'] is not None:
        update_data['tags'] = json.dumps(update_data['tags'])
    
    # If amount or date is being updated, update exchange rate
    if 'amount' in update_data or 'date' in update_data:
        transaction_currency = current_user.currency
        transaction_date = update_data.get('date', db_transaction.date)
        
        # Convert date if needed
        if isinstance(transaction_date, str):
            transaction_date = datetime.fromisoformat(transaction_date.replace('Z', '+00:00'))
        
        # Update original amount and currency
        if 'amount' in update_data:
            db_transaction.original_amount = update_data['amount']
            db_transaction.original_currency = transaction_currency
        
        # Get new exchange rate
        if transaction_currency != "USD":
            db_transaction.exchange_rate_to_usd = await get_historical_exchange_rate(
                transaction_currency,
                "USD",
                transaction_date
            )
        else:
            db_transaction.exchange_rate_to_usd = 1.0
    
    for field, value in update_data.items():
        setattr(db_transaction, field, value)
    
    db.commit()
    db.refresh(db_transaction)
    
    # Convert tags back to list for response
    if db_transaction.tags:
        db_transaction.tags = json.loads(db_transaction.tags)
    
    return db_transaction

@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific transaction."""
    db_transaction = db.query(Transaction).filter(
        and_(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id
        )
    ).first()
    
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(db_transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}

@router.post("/transactions/bulk", response_model=dict)
def bulk_transaction_operations(
    operation: BulkTransactionOperation,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Perform bulk operations on multiple transactions."""
    # Verify all transactions belong to the current user
    transactions = db.query(Transaction).filter(
        and_(
            Transaction.id.in_(operation.transaction_ids),
            Transaction.user_id == current_user.id
        )
    ).all()
    
    if len(transactions) != len(operation.transaction_ids):
        raise HTTPException(
            status_code=403, 
            detail="Some transactions not found or don't belong to you"
        )
    
    if operation.operation == "delete":
        for transaction in transactions:
            db.delete(transaction)
        db.commit()
        return {"message": f"Deleted {len(transactions)} transactions"}
    
    elif operation.operation == "update_category":
        if not operation.data or "category" not in operation.data:
            raise HTTPException(status_code=400, detail="Category is required")
        
        for transaction in transactions:
            transaction.category = operation.data["category"]
        db.commit()
        return {"message": f"Updated category for {len(transactions)} transactions"}
    
    elif operation.operation == "add_tags":
        if not operation.data or "tags" not in operation.data:
            raise HTTPException(status_code=400, detail="Tags are required")
        
        new_tags = operation.data["tags"]
        for transaction in transactions:
            existing_tags = json.loads(transaction.tags) if transaction.tags else []
            # Add new tags without duplicates
            combined_tags = list(set(existing_tags + new_tags))
            transaction.tags = json.dumps(combined_tags)
        db.commit()
        return {"message": f"Added tags to {len(transactions)} transactions"}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid operation")

@router.post("/transactions/import/csv")
async def import_transactions_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Import transactions from a CSV file."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    content = await file.read()
    decoded = content.decode('utf-8')
    
    csv_reader = csv.DictReader(io.StringIO(decoded))
    
    imported_count = 0
    errors = []
    
    for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 to account for header
        try:
            # Parse the CSV row
            transaction_data = {
                'user_id': current_user.id,
                'amount': float(row.get('amount', 0)),
                'type': row.get('type', 'expense').lower(),
                'category': row.get('category', 'Other'),
                'description': row.get('description', ''),
                'date': datetime.strptime(row.get('date', datetime.now().strftime('%Y-%m-%d')), '%Y-%m-%d'),
                'payment_method': row.get('payment_method'),
                'location': row.get('location'),
                'tags': json.dumps(row.get('tags', '').split(',')) if row.get('tags') else None
            }
            
            # Validate transaction type
            if transaction_data['type'] not in ['income', 'expense']:
                raise ValueError(f"Invalid type: {transaction_data['type']}")
            
            # Add exchange rate for the transaction
            transaction_data['original_amount'] = transaction_data['amount']
            transaction_data['original_currency'] = current_user.currency
            
            # Get historical exchange rate
            if current_user.currency != "USD":
                transaction_data['exchange_rate_to_usd'] = await get_historical_exchange_rate(
                    current_user.currency,
                    "USD",
                    transaction_data['date']
                )
            else:
                transaction_data['exchange_rate_to_usd'] = 1.0
            
            # Create transaction
            db_transaction = Transaction(**transaction_data)
            db.add(db_transaction)
            imported_count += 1
            
        except Exception as e:
            errors.append(f"Row {row_num}: {str(e)}")
    
    if imported_count > 0:
        db.commit()
    
    return {
        "imported": imported_count,
        "errors": errors,
        "message": f"Successfully imported {imported_count} transactions"
    }

@router.get("/transactions/export/csv")
def export_transactions_csv(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export transactions to CSV format."""
    from fastapi.responses import StreamingResponse
    
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    transactions = query.order_by(Transaction.date.desc()).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'Date', 'Type', 'Category', 'Amount', 'Description', 
        'Payment Method', 'Location', 'Tags'
    ])
    
    # Write transactions
    for t in transactions:
        tags = ','.join(json.loads(t.tags)) if t.tags else ''
        writer.writerow([
            t.date.strftime('%Y-%m-%d'),
            t.type,
            t.category,
            t.amount,
            t.description or '',
            t.payment_method or '',
            t.location or '',
            tags
        ])
    
    # Reset file pointer
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type='text/csv',
        headers={
            'Content-Disposition': f'attachment; filename=transactions_{datetime.now().strftime("%Y%m%d")}.csv'
        }
    )

@router.get("/transactions/recurring", response_model=List[TransactionResponse])
def get_recurring_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all recurring transactions for the current user."""
    transactions = db.query(Transaction).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.is_recurring == True
        )
    ).order_by(Transaction.date.desc()).all()
    
    # Convert tags back to list
    for transaction in transactions:
        if transaction.tags:
            transaction.tags = json.loads(transaction.tags)
    
    return transactions