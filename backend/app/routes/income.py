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

@router.post("/income")
def create_income(income: schemas.IncomeCreate, db: Session = Depends(get_db)):
    return crud.create_income(db, income)
