import uuid
from datetime import datetime, timezone
from sqlalchemy import ForeignKey, DateTime, String, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class SentimentEvent(Base):
    """
    Stores a sentiment label + score for each chat message that is analysed.
    Written once per message asynchronously so it never slows down the chat response.
    """
    __tablename__ = "sentiment_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    message_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("chat_messages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # "positive" | "neutral" | "negative"
    label: Mapped[str] = mapped_column(String, nullable=False, index=True)
    # Continuous score: -1.0 (most negative) … +1.0 (most positive)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
