from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Any

from app.db.session import get_db
from app.api.admin_deps import get_current_admin
from app.models.session import Session
from app.models.assessment import Assessment

router = APIRouter()

@router.get("", response_model=dict)
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin)
) -> Any:
    """Admin-only: Fetch anonymized telemetry metrics for dashboard."""
    
    # Total Sessions
    total_sessions = await db.scalar(select(func.count(Session.id)))
    
    # Total Assessments Completed
    total_assessments = await db.scalar(select(func.count(Assessment.id)))
    
    # Risk Severity Distribution
    severity_query = select(
        Assessment.severity, 
        func.count(Assessment.id)
    ).group_by(Assessment.severity)
    
    severity_result = await db.execute(severity_query)
    severity_distribution = {row[0]: row[1] for row in severity_result.all()}
    
    # Flags Triggered Count (e.g. self-harm)
    # A safer ORM agnostic way
    try:
        from sqlalchemy import String
        flags_query = select(func.count(Assessment.id)).where(
            func.cast(Assessment.flags_json, String) != '[]',
            Assessment.flags_json.is_not(None)
        )
        total_flagged = await db.scalar(flags_query)
    except Exception:
        # Fallback
        total_flagged = 0
    
    return {
        "total_sessions": total_sessions or 0,
        "total_assessments": total_assessments or 0,
        "conversion_rate": round((total_assessments / total_sessions * 100), 2) if total_sessions else 0,
        "severity_distribution": severity_distribution,
        "total_flagged_assessments": total_flagged
    }
