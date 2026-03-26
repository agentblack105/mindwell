"""Tests for the Phase 4 Safety Layer.

Covers:
  - crisis_service unit tests (keyword + flag evaluation)
  - Assessment endpoint — PHQ-9 Q9 flag triggers crisis response + safety_event
  - Chat endpoint — crisis keyword triggers hard-override response
"""
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.db.session import get_db
from app.core.config import settings
from app.services import crisis_service


# ---------------------------------------------------------------------------
# DB override fixture
# ---------------------------------------------------------------------------

async def override_get_db():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, future=True, echo=False)
    async_session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def session_token(async_client: AsyncClient):
    resp = await async_client.post("/api/v1/sessions", json={"language": "en"})
    assert resp.status_code == 201
    return resp.json()["session_token"]


# ---------------------------------------------------------------------------
# Unit tests — crisis_service
# ---------------------------------------------------------------------------

def test_no_crisis_on_empty():
    result = crisis_service.evaluate()
    assert result["crisis_level"] == "none"
    assert result["actions"] == []


def test_high_crisis_from_self_harm_flag():
    result = crisis_service.evaluate(assessment_flags={"self_harm": True})
    assert result["crisis_level"] == "high"
    assert "log_safety_event" in result["actions"]
    assert result["triggered_by"] == "assessment_flag"


def test_high_crisis_from_keyword():
    result = crisis_service.evaluate(user_text="I want to die and I feel suicidal")
    assert result["crisis_level"] == "high"
    assert "want to die" in result["matched_keywords"] or "suicidal" in result["matched_keywords"]


def test_watch_crisis_from_hopeless_keyword():
    result = crisis_service.evaluate(user_text="I feel completely hopeless and worthless")
    assert result["crisis_level"] == "watch"
    assert "hopeless" in result["matched_keywords"] or "worthless" in result["matched_keywords"]


def test_both_triggered():
    result = crisis_service.evaluate(
        assessment_flags={"self_harm": True},
        user_text="I feel suicidal",
    )
    assert result["crisis_level"] == "high"
    assert result["triggered_by"] == "both"


def test_crisis_helpers():
    high = {"crisis_level": "high"}
    watch = {"crisis_level": "watch"}
    none_ = {"crisis_level": "none"}

    assert crisis_service.is_high_crisis(high)
    assert not crisis_service.is_high_crisis(watch)
    assert crisis_service.is_any_crisis(watch)
    assert not crisis_service.is_any_crisis(none_)


# ---------------------------------------------------------------------------
# Integration — assessment self-harm flag triggers safety event + hotlines
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_phq9_q9_triggers_crisis(async_client: AsyncClient, session_token: str):
    """PHQ-9 item 9 > 0 must produce crisis_recommended=True and crisis_hotlines."""
    headers = {"X-Session-Token": session_token}

    # Minimal PHQ-9 where only Q9 is set to 2 (self-harm)
    answers = {f"phq9_q{i}": 0 for i in range(1, 10)}
    answers["phq9_q9"] = 2  # override Q9

    resp = await async_client.post("/api/v1/assessments/phq9", json={"answers": answers}, headers=headers)
    assert resp.status_code == 201
    data = resp.json()

    assert data["crisis_recommended"] is True
    assert data["crisis_level"] == "high"
    assert len(data["crisis_hotlines"]) > 0


@pytest.mark.asyncio
async def test_phq9_no_crisis_when_q9_zero(async_client: AsyncClient, session_token: str):
    """PHQ-9 where Q9 is 0 must NOT trigger crisis."""
    headers = {"X-Session-Token": session_token}
    answers = {f"phq9_q{i}": 0 for i in range(1, 10)}

    resp = await async_client.post("/api/v1/assessments/phq9", json={"answers": answers}, headers=headers)
    assert resp.status_code == 201
    data = resp.json()

    assert data["crisis_recommended"] is False
    assert data["crisis_level"] == "none"
    assert data["crisis_hotlines"] == []


# ---------------------------------------------------------------------------
# Integration — chat crisis keyword hard-override
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_chat_crisis_keyword_override(async_client: AsyncClient, session_token: str):
    """Sending a crisis keyword must return the hard-override safe response."""
    headers = {"X-Session-Token": session_token}

    # Start a chat
    start_resp = await async_client.post("/api/v1/chats/start", headers=headers)
    assert start_resp.status_code == 201
    chat_id = start_resp.json()["id"]

    # Send crisis message
    payload = {"role": "user", "content": "I want to kill myself tonight"}
    resp = await async_client.post(f"/api/v1/chats/{chat_id}/message", json=payload, headers=headers)
    assert resp.status_code == 200

    messages = resp.json()
    ai_response = next(m for m in messages if m["role"] == "assistant")

    # The response must contain crisis hotline info, not generic chat
    assert "0800" in ai_response["content"] or "741741" in ai_response["content"]


@pytest.mark.asyncio
async def test_chat_watch_keyword_gentle_response(async_client: AsyncClient, session_token: str):
    """Watch-level keywords should produce a supportive but not panic response."""
    headers = {"X-Session-Token": session_token}
    start_resp = await async_client.post("/api/v1/chats/start", headers=headers)
    chat_id = start_resp.json()["id"]

    payload = {"role": "user", "content": "I feel completely hopeless and I can't cope"}
    resp = await async_client.post(f"/api/v1/chats/{chat_id}/message", json=payload, headers=headers)
    assert resp.status_code == 200

    messages = resp.json()
    ai_response = next(m for m in messages if m["role"] == "assistant")
    # Should mention resources but not the full crisis hotline
    assert "resource" in ai_response["content"].lower() or "support" in ai_response["content"].lower()
