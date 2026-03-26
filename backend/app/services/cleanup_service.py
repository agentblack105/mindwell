"""
cleanup_service.py
------------------
Data retention / NDPR compliance.

Deletes sessions (and all cascade-linked data: consents, assessments,
chat sessions, sentiment events, safety events) that have passed
their `expires_at` timestamp OR are older than SESSION_RETENTION_DAYS.

Run this as a scheduled job (cron, Celery beat, APScheduler, etc.).
For the thesis MVP the function is exposed via a protected admin endpoint
so it can be triggered manually or by an external cron.
"""
from __future__ import annotations
from datetime import datetime, timezone, timedelta
import logging

from sqlalchemy import delete, select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session import Session
from app.core.config import settings

logger = logging.getLogger("smart_mental.cleanup")


async def delete_expired_sessions(db: AsyncSession) -> dict:
    """
    Delete sessions that are:
      - past their expires_at, OR
      - older than settings.SESSION_RETENTION_DAYS

    All related rows (assessments, chats, events) cascade automatically
    via the FK ON DELETE CASCADE constraints.

    Returns a dict with the count of deleted sessions.
    """
    now = datetime.now(timezone.utc)
    retention_cutoff = now - timedelta(days=settings.SESSION_RETENTION_DAYS)

    # Find IDs first (safer than bulk-deleting with cascade through ORM)
    result = await db.execute(
        select(Session.id).where(
            or_(
                Session.expires_at < now,
                Session.created_at < retention_cutoff,
            )
        )
    )
    session_ids = [row[0] for row in result.all()]

    if not session_ids:
        logger.info("Cleanup: no expired sessions found.")
        return {"deleted": 0}

    await db.execute(delete(Session).where(Session.id.in_(session_ids)))
    await db.commit()

    logger.info(f"Cleanup: deleted {len(session_ids)} expired sessions.")
    return {"deleted": len(session_ids)}
