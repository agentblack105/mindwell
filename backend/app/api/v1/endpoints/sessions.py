from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, timezone

from app.db.session import get_db
from app.api.deps import SessionDep
from app.models.session import Session
from app.models.consent import Consent
from app.schemas.session import SessionCreate, SessionResponse
from app.schemas.consent import ConsentCreate, ConsentResponse
from app.core.security import generate_session_token, hash_token

router = APIRouter()

# 24 hours default session
SESSION_DUR_HOURS = 24

@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session_in: SessionCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new anonymous session. Returns the raw session token to be stored
    client-side. The server only stores the cryptographic hash of the token.
    """
    raw_token = generate_session_token()
    hashed = hash_token(raw_token)
    
    expires = datetime.now(timezone.utc) + timedelta(hours=SESSION_DUR_HOURS)
    
    new_session = Session(
        token_hash=hashed,
        language=session_in.language,
        expires_at=expires,
        client_meta_json=session_in.client_meta
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    
    return SessionResponse(
        session_token=raw_token,
        expires_at=new_session.expires_at
    )

@router.post("/consent", response_model=ConsentResponse, status_code=status.HTTP_201_CREATED)
async def register_consent(
    consent_in: ConsentCreate,
    current_session: SessionDep,
    db: AsyncSession = Depends(get_db)
):
    """
    Registers consent for the current session. Requires a valid X-Session-Token.
    """
    # Create consent record linked to the session
    new_consent = Consent(
        session_id=current_session.id,
        policy_version=consent_in.policy_version,
        accepted_at=datetime.now(timezone.utc)
    )
    db.add(new_consent)
    await db.commit()
    await db.refresh(new_consent)
    
    return new_consent
