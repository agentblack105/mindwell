from datetime import datetime, timezone
import uuid
from sqlalchemy import String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token_hash: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    language: Mapped[str] = mapped_column(String, default="en", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    client_meta_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    consents = relationship("Consent", back_populates="session", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="session", cascade="all, delete-orphan")
