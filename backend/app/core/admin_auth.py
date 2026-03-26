import os
from datetime import datetime, timedelta, timezone
from jose import jwt

# We use the same SECRET_KEY from BaseSettings, but here we read it directly from env
# to keep it simple or we can import from settings. Let's use config.
from app.core.config import settings

ALGORITHM = "HS256"
ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day for admin sessions

def create_admin_access_token(data: dict) -> str:
    """Creates a JWT token for admin authentication."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # We use the project secret key for signing
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
