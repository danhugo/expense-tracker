from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from .. import crud, schemas
from ..database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/reports/summary", response_model=schemas.ReportSummary)
def read_report_summary(db: Session = Depends(get_db)):
    return crud.get_report_summary(db)

@router.get("/reports/daily", response_model=list[schemas.DailySummary])
def read_daily_summary(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db)
):
    return crud.get_daily_summary(db, start_date, end_date)