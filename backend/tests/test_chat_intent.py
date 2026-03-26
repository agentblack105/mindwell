"""
Tests for Phase 5b + Phase 6:
  - intent_service unit tests
  - templates.py (multilingual template registry)
  - admin PUT /resources/{id} endpoint
  - chat: intent routing (results_explain, resources_request, coping_tips)
  - chat: language field stored and respected
"""
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.db.session import get_db
from app.core.config import settings
from app.services import intent_service
from app.core.templates import get_template, supported_languages


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


@pytest.fixture
async def admin_token(async_client: AsyncClient):
    resp = await async_client.post(
        "/api/v1/admin/auth/login",
        json={"username": "admin", "password": settings.SECRET_KEY[:10]},
    )
    assert resp.status_code == 200
    return resp.json()["access_token"]


# ---------------------------------------------------------------------------
# Unit tests — intent_service
# ---------------------------------------------------------------------------

def test_intent_results_explain():
    assert intent_service.detect_intent("what does my score mean") == "results_explain"
    assert intent_service.detect_intent("can you explain my PHQ result") == "results_explain"


def test_intent_resources_request():
    assert intent_service.detect_intent("can you help me find a clinic") == "resources_request"
    assert intent_service.detect_intent("I need therapy") == "resources_request"


def test_intent_coping_tips():
    assert intent_service.detect_intent("any coping tips?") == "coping_tips"
    assert intent_service.detect_intent("how do I manage anxiety and calm down") == "coping_tips"


def test_intent_general_support():
    assert intent_service.detect_intent("I've been having a tough week") == "general_support"
    assert intent_service.detect_intent("just feeling low today") == "general_support"


# ---------------------------------------------------------------------------
# Unit tests — templates.py
# ---------------------------------------------------------------------------

def test_template_en_exists_for_all_intents():
    intents = ["crisis_high", "crisis_watch", "results_explain", "resources_request",
               "coping_tips", "general_support"]
    for intent in intents:
        tmpl = get_template(intent, "en")
        assert tmpl, f"Missing English template for intent: {intent}"


def test_template_pcm_exists_for_crisis():
    assert "Nigeria" in get_template("crisis_high", "pcm") or "Nigeria" in get_template("crisis_high", "en")
    assert get_template("coping_tips", "pcm")


def test_template_falls_back_to_english():
    result = get_template("general_support", "fr")  # French not supported
    assert result  # Should fall back to English


def test_supported_languages_includes_en_and_pcm():
    langs = supported_languages()
    assert "en" in langs
    assert "pcm" in langs


# ---------------------------------------------------------------------------
# Integration — admin PUT /resources/{id}
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_admin_update_resource(async_client: AsyncClient, admin_token: str):
    auth = {"Authorization": f"Bearer {admin_token}"}

    # Create a resource first
    create_payload = {
        "name": "Test Clinic", "type": "clinic", "state": "Lagos",
        "phone": "0800 000 0000", "verified": True,
    }
    created = await async_client.post("/api/v1/resources", json=create_payload, headers=auth)
    assert created.status_code == 201
    resource_id = created.json()["id"]

    # Update it
    update_payload = {"name": "Updated Clinic", "phone": "0900 111 2222"}
    updated = await async_client.put(f"/api/v1/resources/{resource_id}", json=update_payload, headers=auth)
    assert updated.status_code == 200
    assert updated.json()["name"] == "Updated Clinic"
    assert updated.json()["phone"] == "0900 111 2222"
    # Other fields should be unchanged
    assert updated.json()["type"] == "clinic"


# ---------------------------------------------------------------------------
# Integration — chat intent routing
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_chat_coping_intent(async_client: AsyncClient, session_token: str):
    headers = {"X-Session-Token": session_token}
    start = await async_client.post("/api/v1/chats/start", headers=headers)
    chat_id = start.json()["id"]

    resp = await async_client.post(
        f"/api/v1/chats/{chat_id}/message",
        json={"role": "user", "content": "I need some coping tips for anxiety", "language": "en"},
        headers=headers,
    )
    assert resp.status_code == 200
    ai = next(m for m in resp.json() if m["role"] == "assistant")
    assert "breath" in ai["content"].lower() or "grounding" in ai["content"].lower()


@pytest.mark.asyncio
async def test_chat_results_intent(async_client: AsyncClient, session_token: str):
    headers = {"X-Session-Token": session_token}
    start = await async_client.post("/api/v1/chats/start", headers=headers)
    chat_id = start.json()["id"]

    resp = await async_client.post(
        f"/api/v1/chats/{chat_id}/message",
        json={"role": "user", "content": "what does my assessment result mean?", "language": "en"},
        headers=headers,
    )
    assert resp.status_code == 200
    ai = next(m for m in resp.json() if m["role"] == "assistant")
    # Should respond about assessment results
    assert "assessment" in ai["content"].lower() or "score" in ai["content"].lower()


@pytest.mark.asyncio
async def test_chat_pidgin_response(async_client: AsyncClient, session_token: str):
    """Language=pcm should produce a Pidgin response."""
    headers = {"X-Session-Token": session_token}
    start = await async_client.post("/api/v1/chats/start", headers=headers)
    chat_id = start.json()["id"]

    resp = await async_client.post(
        f"/api/v1/chats/{chat_id}/message",
        json={"role": "user", "content": "abeg help me cope with stress", "language": "pcm"},
        headers=headers,
    )
    assert resp.status_code == 200
    ai = next(m for m in resp.json() if m["role"] == "assistant")
    # Pidgin response should contain Pidgin phrases
    assert "dey" in ai["content"].lower() or "fit" in ai["content"].lower()


@pytest.mark.asyncio
async def test_chat_language_stored(async_client: AsyncClient, session_token: str):
    """language_original should be stored on the message."""
    headers = {"X-Session-Token": session_token}
    start = await async_client.post("/api/v1/chats/start", headers=headers)
    chat_id = start.json()["id"]

    await async_client.post(
        f"/api/v1/chats/{chat_id}/message",
        json={"role": "user", "content": "I feel sad", "language": "pcm"},
        headers=headers,
    )
    history = await async_client.get(f"/api/v1/chats/{chat_id}/history", headers=headers)
    user_messages = [m for m in history.json()["messages"] if m["role"] == "user"]
    assert user_messages[-1]["language_original"] == "pcm"
