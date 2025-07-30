from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from models import (
    SessionLocal, 
    Transaction, 
    TransactionCreate, 
    TransactionResponse, 
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

@router.post("/transactions", response_model=TransactionResponse)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_transaction = Transaction(**transaction.dict())
    # You might want to associate the transaction with the user here
    # db_transaction.user_id = current_user.id
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.get("/transactions", response_model=List[TransactionResponse])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # You might want to filter transactions by user here
    transactions = db.query(Transaction).offset(skip).limit(limit).all()
    return transactions

@router.put("/transactions/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    transaction_update: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Optional: Add authorization check if transaction belongs to current_user
    # if db_transaction.user_id != current_user.id:
    #     raise HTTPException(status_code=403, detail="Not authorized to update this transaction")

    for field, value in transaction_update.dict(exclude_unset=True).items():
        setattr(db_transaction, field, value)

    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Optional: Add authorization check if transaction belongs to current_user
    # if db_transaction.user_id != current_user.id:
    #     raise HTTPException(status_code=403, detail="Not authorized to delete this transaction")

    db.delete(db_transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}