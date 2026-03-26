from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.core.config import settings
from app.core.admin_auth import ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/admin/auth/login")

def get_current_admin(token: str = Depends(oauth2_scheme)) -> str:
    """
    Validates the admin JWT token.
    Raises 401 if invalid.
    Returns the admin subject (e.g. username).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # Standard check: only "admin" is allowed
    if username != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    return username
