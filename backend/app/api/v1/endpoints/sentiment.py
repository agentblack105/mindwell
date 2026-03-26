from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Any
import uuid

from app.db.session import get_db
from app.api.admin_deps import get_current_admin
from app.api.deps import SessionDep
from app.models.sentiment import SentimentEvent
from app.services import sentiment_service

router = APIRouter()


@router.get("/session", response_model=dict)
async def get_session_sentiment(
    current_session: SessionDep,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get sentiment trends for the current session.
    Returns rolling stats: average, recent_avg, neg_streak, volatility.
    """
    result = await db.execute(
        select(SentimentEvent)
        .where(SentimentEvent.session_id == current_session.id)
        .order_by(SentimentEvent.created_at.asc())
    )
    events = result.scalars().all()

    if not events:
        return {
            "message_count": 0,
            "label_distribution": {},
            "trend": sentiment_service.rolling_stats([]),
        }

    scores = [e.score for e in events]
    label_counts: dict[str, int] = {}
    for e in events:
        label_counts[e.label] = label_counts.get(e.label, 0) + 1

    return {
        "message_count": len(events),
        "label_distribution": label_counts,
        "trend": sentiment_service.rolling_stats(scores),
    }


@router.get("/admin/overview", response_model=dict)
async def get_admin_sentiment_overview(
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
) -> Any:
    """
    Admin-only: Aggregate sentiment metrics across all sessions.
    Useful for population-level wellbeing monitoring.
    """
    # Total events
    total = await db.scalar(select(func.count(SentimentEvent.id)))

    # Distribution across entire system
    dist_result = await db.execute(
        select(SentimentEvent.label, func.count(SentimentEvent.id))
        .group_by(SentimentEvent.label)
    )
    distribution = {row[0]: row[1] for row in dist_result.all()}

    # Average score across all messages
    avg_score = await db.scalar(select(func.avg(SentimentEvent.score)))

    # Sessions with sustained negative streaks (neg_streak insight via count of negative-labeled events per session)
    neg_sessions_result = await db.execute(
        select(SentimentEvent.session_id, func.count(SentimentEvent.id).label("neg_count"))
        .where(SentimentEvent.label == "negative")
        .group_by(SentimentEvent.session_id)
        .having(func.count(SentimentEvent.id) >= 3)  # 3+ consecutive negative signals
    )
    high_risk_session_count = len(neg_sessions_result.all())

    return {
        "total_scored_messages": total or 0,
        "label_distribution": distribution,
        "average_score": round(float(avg_score or 0), 4),
        "sessions_with_persistent_negativity": high_risk_session_count,
    }
