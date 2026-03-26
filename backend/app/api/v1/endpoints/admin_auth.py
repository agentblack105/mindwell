from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any
from pydantic import BaseModel

from app.core.config import settings
from app.core.admin_auth import create_admin_access_token

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str

class AdminLogin(BaseModel):
    username: str
    password: str

@router.post("/login", response_model=Token)
async def login_admin(login_data: AdminLogin) -> Any:
    """
    Simple token login, getting an access token for admin.
    For this thesis MVP, we hardcode the check. In production, check DB.
    """
    if login_data.username != "admin" or login_data.password != settings.SECRET_KEY[:10]:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    access_token = create_admin_access_token(data={"sub": login_data.username})
    return {"access_token": access_token, "token_type": "bearer"}
