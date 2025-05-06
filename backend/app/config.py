# config.py
from dotenv import load_dotenv
import os

load_dotenv()  # loads from .env

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = os.getenv("SMTP_PORT")
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
