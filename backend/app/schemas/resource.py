from pydantic import BaseModel, ConfigDict
from datetime import datetime
import uuid

class ResourceBase(BaseModel):
    name: str
    type: str  # clinic, hotline, education
    state: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    url: str | None = None
    hours: str | None = None
    tags_json: list[str] = []
    verified: bool = False

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(ResourceBase):
    name: str | None = None
    type: str | None = None

class ResourceResponse(ResourceBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    updated_at: datetime
