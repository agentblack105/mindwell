from typing import Annotated
from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from app.db.session import get_db
from app.core.security import hash_token
from app.models.session import Session

async def get_current_session(
    x_session_token: Annotated[str | None, Header(description="The active session token")] = None,
    db: AsyncSession = Depends(get_db),
) -> Session:
    """
    Dependency to get the current session based on the provided X-Session-Token header.
    Validates existence and expiration.
    """
    if not x_session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-Session-Token header",
        )

    token_hash = hash_token(x_session_token)
    
    result = await db.execute(select(Session).where(Session.token_hash == token_hash))
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token",
        )

    # Check expiration (ensure tz-aware comparison)
    now = datetime.now(timezone.utc)
    # Timezone awareness might vary based on DB driver settings. Asyncpg often returns timezone-naive datetimes
    # if the column is TIMESTAMP without time zone. But we defined it with DateTime(timezone=True).
    # Ensuring robust comparison:
    if session.expires_at.tzinfo is None:
        session_expires_at = session.expires_at.replace(tzinfo=timezone.utc)
    else:
        session_expires_at = session.expires_at

    if session_expires_at < now:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired",
        )

    return session

SessionDep = Annotated[Session, Depends(get_current_session)]
