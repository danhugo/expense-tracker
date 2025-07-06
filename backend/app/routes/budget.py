from fastapi import APIRouter, Depends
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

@router.post("/budgets")
def create_budget(budget: schemas.BudgetCreate, db: Session = Depends(get_db)):
    return crud.create_budget(db, budget)

@router.get("/budgets/status", response_model=list[schemas.BudgetStatus])
def read_budget_status(db: Session = Depends(get_db)):
    return crud.get_budget_status(db)