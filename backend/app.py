import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import (
    users, 
    transactions, 
    auth_router # Import your routers
)

load_dotenv()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID") 

app = FastAPI()

# Mount static files directory
app.mount("/uploads", StaticFiles(directory="./uploads"), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow your frontend origin
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8060)