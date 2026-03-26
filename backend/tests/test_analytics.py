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
async def admin_token(async_client: AsyncClient):
    payload = {
        "username": "admin",
        "password": settings.SECRET_KEY[:10]
    }
    response = await async_client.post(
        "/api/v1/admin/auth/login",
        json=payload
    )
    assert response.status_code == 200
    return response.json()["access_token"]

@pytest.mark.asyncio
async def test_get_analytics(async_client: AsyncClient, admin_token: str):
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = await async_client.get("/api/v1/admin/analytics", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_sessions" in data
    assert "total_assessments" in data
    assert "conversion_rate" in data
    assert "severity_distribution" in data
    assert "total_flagged_assessments" in data
