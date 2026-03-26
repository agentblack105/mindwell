from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
import uuid

class ConsentCreate(BaseModel):
    policy_version: str = Field(..., description="The version of the privacy policy agreed to", json_schema_extra={"example": "1.0"})

class ConsentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: uuid.UUID
    policy_version: str
    accepted_at: datetime
