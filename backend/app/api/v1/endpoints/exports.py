"""
exports.py
----------
Admin-only endpoint to download anonymized evaluation datasets.

GET /v1/admin/exports?from=YYYY-MM-DD&to=YYYY-MM-DD

Returns:
  - assessments: anonymized (session_id only, no tokens or IPs)
  - risk_summary: counts by severity
  - chat_stats: total sessions, avg messages, sentiment distribution
  - crisis_events: count by type
  - sentiment_trends: overall rolling stats

Strict anonymization:
  - Session IDs are included (needed for thesis linkage)
  - NO raw tokens, NO IPs, NO names, NO free text
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone
from typing import Any

from app.db.session import get_db
from app.api.admin_deps import get_current_admin
from app.models.assessment import Assessment
from app.models.chat import ChatSession, ChatMessage
from app.models.safety import SafetyEvent
from app.models.sentiment import SentimentEvent
from app.services import sentiment_service
from app.services.cleanup_service import delete_expired_sessions

router = APIRouter()


def _parse_dt(date_str: str | None, default: datetime) -> datetime:
    if not date_str:
        return default
    try:
        return datetime.fromisoformat(date_str).replace(tzinfo=timezone.utc)
    except ValueError:
        return default


@router.get("", response_model=dict)
async def get_exports(
    from_date: str | None = Query(None, alias="from", description="ISO date e.g. 2025-01-01"),
    to_date: str | None = Query(None, alias="to", description="ISO date e.g. 2025-12-31"),
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
) -> Any:
    """Admin-only: Export anonymized evaluation data for thesis / audit."""
    now = datetime.now(timezone.utc)
    start = _parse_dt(from_date, datetime(2020, 1, 1, tzinfo=timezone.utc))
    end = _parse_dt(to_date, now)

    # --- Assessments (anonymized) ---
    assess_result = await db.execute(
        select(
            Assessment.session_id,
            Assessment.tool,
            Assessment.score,
            Assessment.severity,
            Assessment.created_at,
        ).where(
            Assessment.created_at >= start,
            Assessment.created_at <= end,
        ).order_by(Assessment.created_at)
    )
    assessments = [
        {
            "session_id": str(row.session_id),
            "tool": row.tool,
            "score": row.score,
            "severity": row.severity,
            "created_at": row.created_at.isoformat(),
        }
        for row in assess_result.all()
    ]

    # --- Risk distribution ---
    risk_result = await db.execute(
        select(Assessment.severity, func.count(Assessment.id))
        .where(Assessment.created_at >= start, Assessment.created_at <= end)
        .group_by(Assessment.severity)
    )
    risk_distribution = {row[0]: row[1] for row in risk_result.all()}

    # --- Chat stats ---
    total_chats = await db.scalar(
        select(func.count(ChatSession.id)).where(
            ChatSession.created_at >= start, ChatSession.created_at <= end
        )
    )
    total_messages = await db.scalar(
        select(func.count(ChatMessage.id))
    )
    avg_messages = round((total_messages or 0) / max(total_chats or 1, 1), 2)

    # --- Crisis events ---
    crisis_result = await db.execute(
        select(SafetyEvent.event_type, func.count(SafetyEvent.id))
        .where(SafetyEvent.created_at >= start, SafetyEvent.created_at <= end)
        .group_by(SafetyEvent.event_type)
    )
    crisis_stats = {row[0]: row[1] for row in crisis_result.all()}

    # --- Sentiment distribution + rolling stats ---
    sent_result = await db.execute(
        select(SentimentEvent.score)
        .where(SentimentEvent.created_at >= start, SentimentEvent.created_at <= end)
        .order_by(SentimentEvent.created_at)
    )
    sentiment_scores = [row[0] for row in sent_result.all()]

    sent_label_result = await db.execute(
        select(SentimentEvent.label, func.count(SentimentEvent.id))
        .where(SentimentEvent.created_at >= start, SentimentEvent.created_at <= end)
        .group_by(SentimentEvent.label)
    )
    sentiment_labels = {row[0]: row[1] for row in sent_label_result.all()}

    return {
        "export_range": {"from": start.isoformat(), "to": end.isoformat()},
        "generated_at": now.isoformat(),
        "assessments": assessments,
        "risk_summary": {
            "distribution": risk_distribution,
            "total": len(assessments),
        },
        "chat_stats": {
            "total_sessions": total_chats or 0,
            "total_messages": total_messages or 0,
            "avg_messages_per_session": avg_messages,
        },
        "crisis_events": {
            "by_type": crisis_stats,
            "total": sum(crisis_stats.values()),
        },
        "sentiment": {
            "label_distribution": sentiment_labels,
            "rolling_stats": sentiment_service.rolling_stats(sentiment_scores),
        },
    }


@router.post("/cleanup", response_model=dict)
async def trigger_cleanup(
    db: AsyncSession = Depends(get_db),
    admin: str = Depends(get_current_admin),
) -> Any:
    """Admin-only: Delete all expired sessions and linked data (NDPR compliance)."""
    return await delete_expired_sessions(db)
