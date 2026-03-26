from pydantic import BaseModel, ConfigDict
from datetime import datetime
import uuid
from app.schemas.resource import ResourceResponse

class ReferralRequest(BaseModel):
    risk_level: str
    state: str | None = None

class ReferralResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: uuid.UUID
    assessment_id: uuid.UUID | None
    risk_level: str
    resources_json: list[dict]
    created_at: datetime
