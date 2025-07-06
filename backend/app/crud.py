from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
from datetime import date, timedelta

# expense
def create_expense(db: Session, expense: schemas.ExpenseCreate):
    db_expense = models.Expense(**expense.dict())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def get_expense(db: Session, expense_id: int):
    return db.query(models.Expense).filter(models.Expense.id == expense_id).first()

def get_all_expenses(db: Session):
    return db.query(models.Expense).order_by(models.Expense.date.desc()).all()

def update_expense(db: Session, expense_id: int, expense_update: schemas.ExpenseCreate):
    db_expense = get_expense(db, expense_id)
    if db_expense:
        for key, value in expense_update.dict().items():
            setattr(db_expense, key, value)
        db.commit()
        db.refresh(db_expense)
    return db_expense

def delete_expense(db: Session, expense_id: int):
    db_expense = get_expense(db, expense_id)
    if db_expense:
        db.delete(db_expense)
        db.commit()
    return db_expense

# income
def create_income(db: Session, income: schemas.IncomeCreate):
    db_income = models.Income(**income.dict())
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

# budget
def create_budget(db: Session, budget: schemas.BudgetCreate):
    db_budget = models.Budget(**budget.dict())
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

def get_budget_status(db: Session):
    results = []
    budgets = db.query(models.Budget).all()
    for budget in budgets:
        spent = db.query(func.sum(models.Expense.amount)).filter(
            models.Expense.category == budget.category
        ).scalar() or 0
        remaining = budget.amount - spent
        results.append(schemas.BudgetStatus(
            category=budget.category,
            budget=budget.amount,
            spent=spent,
            remaining=remaining
        ))
    return results

def get_report_summary(db: Session):
    total_expense = db.query(func.sum(models.Expense.amount)).scalar() or 0
    total_income = db.query(func.sum(models.Income.amount)).scalar() or 0
    net_savings = total_income - total_expense
    return schemas.ReportSummary(
        total_expense=total_expense,
        total_income=total_income,
        net_savings=net_savings
    )

def get_daily_summary(db: Session, start_date: date, end_date: date):
    current_date = start_date
    summaries = []
    while current_date <= end_date:
        total_expense = db.query(func.sum(models.Expense.amount)).filter(
            models.Expense.date == current_date
        ).scalar() or 0
        total_income = db.query(func.sum(models.Income.amount)).filter(
            models.Income.date == current_date
        ).scalar() or 0
        net_savings = total_income - total_expense
        summaries.append(schemas.DailySummary(
            date=current_date,
            total_expense=total_expense,
            total_income=total_income,
            net_savings=net_savings
        ))
        current_date += timedelta(days=1)
    return summaries
