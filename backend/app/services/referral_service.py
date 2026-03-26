from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc
from app.models.resource import Resource
import uuid

async def generate_referrals(
    db: AsyncSession, 
    risk_level: str, 
    state: str | None = None
) -> list[dict]:
    """
    Core engine rule-set to fetch relevant Resource models based on assessed risk.
    """
    # Base query for verified resources only
    query = select(Resource).where(Resource.verified == True)
    
    # Apply type filtering based on psychiatric risk rules
    if risk_level == "severe":
        # Hotlines, Hospitals, Emergency Care
        query = query.where(Resource.type.in_(["hotline", "hospital", "clinic"]))
    elif risk_level in ["moderate", "moderately severe"]:
        # Therapy, Hotlines, Support groups
        query = query.where(Resource.type.in_(["clinic", "therapy", "hotline", "support_group"]))
    elif risk_level in ["mild", "minimal"]:
        # Education, self-guided, community
        query = query.where(Resource.type.in_(["education", "community", "self_guided"]))
    else:
        # Fallback to general hotlines
        query = query.where(Resource.type == "hotline")

    # Apply geographic filtering if available
    if state:
        # Match specific state or resources that are national (state is null or 'National')
        query = query.where(
            or_(
                Resource.state == state,
                Resource.state == "National",
                Resource.state.is_(None)
            )
        )

    # Order by name for consistency
    query = query.order_by(Resource.name.asc())
    
    # Execute query and limit to top 5 recommendations to avoid overwhelming the user
    result = await db.execute(query.limit(5))
    resources = result.scalars().all()
    
    # Serialize to dict for JSON storage in the Referral model
    serialized = []
    for r in resources:
        serialized.append({
            "id": str(r.id),
            "name": r.name,
            "type": r.type,
            "phone": r.phone,
            "url": r.url,
            "state": r.state
        })
        
    return serialized
