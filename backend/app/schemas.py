from pydantic import BaseModel, EmailStr, field_validator
import re
class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str

    @field_validator("password")
    def strong_password(cls, v):
        if (len(v) < 8 or
            not re.search(r"[A-Z]", v) or
            not re.search(r"[a-z]", v) or
            not re.search(r"[0-9]", v) or
            not re.search(r"[\W_]", v)):  # \W matches any non-word character
            raise ValueError(
                "Password must be at least 8 characters long and include "
                "an uppercase letter, a lowercase letter, a number, and a special character"
            )
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmailVerification(BaseModel):
    email: EmailStr

