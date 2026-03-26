import uuid
from datetime import datetime, timezone
from sqlalchemy import ForeignKey, DateTime, String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class SafetyEvent(Base):
    """
    Immutable audit log for every crisis trigger in the system.
    Written once, never updated — preserves full audit trail.
    """
    __tablename__ = "safety_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Enum-like string: "assessment_flag" | "chat_keyword" | "both"
    event_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    # Freeform context: {crisis_level, trigger_source, matched_keywords, assessment_id, message_id, ...}
    details_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
