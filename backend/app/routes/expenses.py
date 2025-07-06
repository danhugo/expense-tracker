from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/expenses")
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    return crud.create_expense(db, expense)

@router.get("/expenses", response_model=list[schemas.ExpenseCreate])
def read_expenses(db: Session = Depends(get_db)):
    return crud.get_all_expenses(db)

@router.get("/expenses/{expense_id}", response_model=schemas.ExpenseCreate)
def read_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = crud.get_expense(db, expense_id)
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.put("/expenses/{expense_id}", response_model=schemas.ExpenseCreate)
def update_expense(expense_id: int, expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    updated = crud.update_expense(db, expense_id, expense)
    if updated is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return updated

@router.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_expense(db, expense_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"detail": "Expense deleted successfully"}

