from aiosmtplib import send
from email.message import EmailMessage
from ..config import SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER

async def send_verification_email(to_email: str, token: str):
    message = EmailMessage()
    message["From"] = "no-reply@expensetracker.hice"
    message["To"] = to_email
    message["Subject"] = "Verify your email"
    message.set_content(f"Click to verify: http://localhost:8000/verify-email?token={token}")
    
    await send(
        message,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        username=SMTP_USER,
        password=SMTP_PASS,
        start_tls=True
    )
