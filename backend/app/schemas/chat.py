from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
import uuid


class ChatMessageBase(BaseModel):
    role: str
    content: str


class ChatMessageCreate(ChatMessageBase):
    """Input: user sends a message. Language can be optionally specified."""
    language: Optional[str] = "en"


class ChatMessageResponse(ChatMessageBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    language_original: str
    created_at: datetime


class ChatSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    messages: list[ChatMessageResponse] = []
