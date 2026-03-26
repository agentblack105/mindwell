from pydantic import BaseModel, ConfigDict
from datetime import datetime
import uuid


class AssessmentSubmit(BaseModel):
    answers: dict[str, int]


class AssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tool: str
    score: int
    severity: str
    flags_json: dict | None
    created_at: datetime
    # Safety fields — populated dynamically, not from DB columns
    crisis_recommended: bool = False
    crisis_level: str = "none"
    crisis_hotlines: list[dict] = []
