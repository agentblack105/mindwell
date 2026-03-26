from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any

from app.db.session import get_db
from app.api.deps import SessionDep
from app.schemas.referral import ReferralRequest, ReferralResponse
from app.models.resource import Referral
from app.services.referral_service import generate_referrals

router = APIRouter()

@router.post("/generate", response_model=ReferralResponse, status_code=status.HTTP_201_CREATED)
async def create_referral(
    request: ReferralRequest,
    current_session: SessionDep,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Generates a list of targeted resources based on risk level and state.
    Requires an active anonymous session.
    """
    # Use the referral engine to fetch resources
    resources_data = await generate_referrals(
        db=db,
        risk_level=request.risk_level,
        state=request.state
    )
    
    # Store the referral interaction for telemetry
    referral = Referral(
        session_id=current_session.id,
        assessment_id=None, # Optionally linked if they just took a test
        risk_level=request.risk_level,
        resources_json=resources_data
    )
    
    db.add(referral)
    await db.commit()
    await db.refresh(referral)
    
    return referral
