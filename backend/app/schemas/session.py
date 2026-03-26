from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
import uuid

class SessionCreate(BaseModel):
    language: str = Field("en", description="Preferred language for the session")
    client_meta: dict | None = Field(None, description="Optional metadata about the client environment")

class SessionResponse(BaseModel):
    session_token: str = Field(..., description="The unhashed session token. Store this securely on the client.")
    expires_at: datetime = Field(..., description="When the session expires")

class SessionInDB(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    language: str
    created_at: datetime
    expires_at: datetime
