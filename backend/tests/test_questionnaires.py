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

@pytest.mark.asyncio
async def test_get_questionnaires(async_client: AsyncClient):
    response = await async_client.get("/api/v1/questionnaires")
    assert response.status_code == 200
    data = response.json()
    assert "phq9" in data
    assert "gad7" in data

@pytest.mark.asyncio
async def test_get_phq9(async_client: AsyncClient):
    response = await async_client.get("/api/v1/questionnaires/phq9")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Patient Health Questionnaire (PHQ-9)"
    assert len(data["questions"]) == 9
    assert len(data["options"]) == 4

@pytest.mark.asyncio
async def test_submit_assessment_requires_session(async_client: AsyncClient):
    response = await async_client.post("/api/v1/assessments/phq9", json={"answers": {}})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_submit_assessment_success(async_client: AsyncClient):
    session_response = await async_client.post("/api/v1/sessions", json={"language": "en"})
    token = session_response.json()["session_token"]
    headers = {"X-Session-Token": token}
    
    answers = {
        "phq9_q1": 3, "phq9_q2": 3, "phq9_q3": 3, "phq9_q4": 3,
        "phq9_q5": 3, "phq9_q6": 3, "phq9_q7": 3, "phq9_q8": 3,
        "phq9_q9": 1
    }
    response = await async_client.post(
        "/api/v1/assessments/phq9", 
        json={"answers": answers},
        headers=headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["score"] == 25
    assert data["severity"] == "severe"
    assert data["flags_json"]["self_harm"] is True

    history_response = await async_client.get("/api/v1/assessments/history", headers=headers)
    assert history_response.status_code == 200
    history_data = history_response.json()
    assert len(history_data) >= 1
    assert history_data[0]["tool"] == "phq9"
    assert history_data[0]["score"] == 25
