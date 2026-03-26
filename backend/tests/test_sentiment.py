"""Tests for Phase 7: Sentiment + Trends"""
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.db.session import get_db
from app.core.config import settings
from app.services import sentiment_service


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
    return resp.json()["access_token"]


# ---------------------------------------------------------------------------
# Unit tests — sentiment_service
# ---------------------------------------------------------------------------

def test_positive_sentiment():
    result = sentiment_service.analyse("I've been feeling really good and hopeful today")
    assert result["label"] == "positive"
    assert result["score"] > 0


def test_negative_sentiment():
    result = sentiment_service.analyse("I feel worthless and completely hopeless")
    assert result["label"] == "negative"
    assert result["score"] < 0


def test_negation_softening():
    positive = sentiment_service.analyse("I feel happy")
    negated = sentiment_service.analyse("I don't feel happy")
    # Negated should score lower
    assert negated["score"] < positive["score"]


def test_intensifier_amplification():
    base = sentiment_service.analyse("I feel sad")
    intense = sentiment_service.analyse("I feel extremely sad")
    assert intense["score"] < base["score"]


def test_neutral_empty():
    result = sentiment_service.analyse("the weather is fine today")
    # "fine" is in positive words but should be borderline neutral/positive
    assert result["label"] in ("neutral", "positive")


def test_rolling_stats_basic():
    stats = sentiment_service.rolling_stats([-0.8, -0.5, -0.9, -0.3, -0.7])
    assert stats["neg_streak"] == 5
    assert stats["average"] < 0
    assert stats["volatility"] >= 0


def test_rolling_stats_empty():
    stats = sentiment_service.rolling_stats([])
    assert stats["average"] == 0.0
    assert stats["neg_streak"] == 0


def test_rolling_stats_mixed():
    stats = sentiment_service.rolling_stats([0.8, 0.5, -0.2, -0.9])
    assert stats["neg_streak"] == 2  # last two are negative
    assert "recent_avg" in stats


# ---------------------------------------------------------------------------
# Integration — sentiment stored on chat message
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_sentiment_stored_on_message(async_client: AsyncClient, session_token: str):
    headers = {"X-Session-Token": session_token}
    start = await async_client.post("/api/v1/chats/start", headers=headers)
    chat_id = start.json()["id"]

    await async_client.post(
        f"/api/v1/chats/{chat_id}/message",
        json={"role": "user", "content": "I feel completely hopeless and sad", "language": "en"},
        headers=headers,
    )

    # Fetch session sentiment endpoint
    resp = await async_client.get("/api/v1/sentiment/session", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["message_count"] >= 1
    assert "negative" in data["label_distribution"]
    assert "trend" in data


@pytest.mark.asyncio
async def test_sentiment_positive_message(async_client: AsyncClient, session_token: str):
    headers = {"X-Session-Token": session_token}
    start = await async_client.post("/api/v1/chats/start", headers=headers)
    chat_id = start.json()["id"]

    await async_client.post(
        f"/api/v1/chats/{chat_id}/message",
        json={"role": "user", "content": "I feel great and hopeful today", "language": "en"},
        headers=headers,
    )

    resp = await async_client.get("/api/v1/sentiment/session", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["message_count"] >= 1


@pytest.mark.asyncio
async def test_admin_sentiment_overview(async_client: AsyncClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}
    resp = await async_client.get("/api/v1/sentiment/admin/overview", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_scored_messages" in data
    assert "label_distribution" in data
    assert "average_score" in data
    assert "sessions_with_persistent_negativity" in data
