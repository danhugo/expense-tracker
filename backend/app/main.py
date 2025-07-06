from fastapi import FastAPI
from .database import Base, engine
from .routes import auth
# from .models import Expense, Income, Budget
# from .routes import expenses, income, budget, reports

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# app.include_router(expenses.router)
# app.include_router(income.router)
# app.include_router(budget.router)
# app.include_router(reports.router)