import uuid
from datetime import datetime, timezone
from sqlalchemy import ForeignKey, DateTime, String, Float, JSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class RiskPrediction(Base):
    """
    Stores a risk prediction for a given assessment.
    Supports both rules-based (method='rules_v1') and ML predictions (method='logreg_v1').
    Enables thesis evaluation: compare rules vs ML accuracy on your dataset.
    """
    __tablename__ = "risk_predictions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    assessment_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # "rules_v1" | "logreg_v1" | "rf_v1"
    method: Mapped[str] = mapped_column(String, nullable=False, index=True)
    model_version: Mapped[str] = mapped_column(String, nullable=False, default="1.0")
    # "low" | "moderate" | "high"
    predicted_risk: Mapped[str] = mapped_column(String, nullable=False)
    # 0.0–1.0 confidence in the predicted class
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    # Human-readable explanation of how the prediction was made
    explanation_json: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
    )
