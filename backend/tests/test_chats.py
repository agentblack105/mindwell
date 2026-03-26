import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.main import app
from app.db.session import get_db
from app.core.config import settings

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
async def active_session(async_client: AsyncClient):
    response = await async_client.post("/api/v1/sessions", json={"language": "en"})
    assert response.status_code == 201
    return response.json()["session_token"]

@pytest.mark.asyncio
async def test_start_chat_session(async_client: AsyncClient, active_session: str):
    headers = {"X-Session-Token": active_session}
    response = await async_client.post("/api/v1/chats/start", headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["is_active"] is True
    return data["id"]
    
@pytest.mark.asyncio
async def test_send_chat_message(async_client: AsyncClient, active_session: str):
    headers = {"X-Session-Token": active_session}
    # Start chat first
    start_resp = await async_client.post("/api/v1/chats/start", headers=headers)
    chat_id = start_resp.json()["id"]
    
    # Send message
    msg_payload = {"role": "user", "content": "I am feeling very overwhelmed lately."}
    response = await async_client.post(f"/api/v1/chats/{chat_id}/message", json=msg_payload, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2  # Should return both user message and AI response
    assert data[0]["role"] == "user"
    assert data[1]["role"] == "assistant"
    
@pytest.mark.asyncio
async def test_chat_history(async_client: AsyncClient, active_session: str):
    headers = {"X-Session-Token": active_session}
    start_resp = await async_client.post("/api/v1/chats/start", headers=headers)
    chat_id = start_resp.json()["id"]
    
    await async_client.post(f"/api/v1/chats/{chat_id}/message", json={"role": "user", "content": "Hello"}, headers=headers)
    
    # Get history
    response = await async_client.get(f"/api/v1/chats/{chat_id}/history", headers=headers)
    assert response.status_code == 200
    data = response.json()
    
    # Needs 3 messages: standard initial greeter + 1 user message + 1 ai message response
    assert len(data["messages"]) == 3
