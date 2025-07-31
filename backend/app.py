import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import (
    users, 
    transactions, 
    auth_router, # Import your routers
    categories,
    budgets,
    currency
)

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") 

app = FastAPI()

# Create uploads directory if it doesn't exist (for backward compatibility)
upload_dir = os.getenv("UPLOAD_DIRECTORY", "uploads")
os.makedirs(upload_dir, exist_ok=True)

# Mount static files directory
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# CORS middleware
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:8080,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Allow configured origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_coop_header(request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    return response

# Include routers
app.include_router(auth_router.router, tags=["Authentication"])
app.include_router(users.router, tags=["Users"])
app.include_router(transactions.router, tags=["Transactions"])
app.include_router(categories.router, tags=["Categories"])
app.include_router(budgets.router, tags=["Budgets"])
app.include_router(currency.router, tags=["Currency"])

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8060"))
    uvicorn.run(app, host=host, port=port)