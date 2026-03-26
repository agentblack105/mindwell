"""Tests for Phase 8: Risk Prediction (rules_v1 + logreg_v1)"""
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.db.session import get_db
from app.core.config import settings
from app.services import risk_service


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
# Unit tests — risk_service
# ---------------------------------------------------------------------------

def test_rules_v1_minimal():
    result = risk_service.rules_v1({"tool": "phq9", "score": 3, "severity": "minimal", "flags_json": {}})
    assert result["predicted_risk"] == "low"
    assert result["confidence"] > 0.9


def test_rules_v1_severe():
    result = risk_service.rules_v1({"tool": "phq9", "score": 24, "severity": "severe", "flags_json": {}})
    assert result["predicted_risk"] == "high"


def test_rules_v1_self_harm_override():
    result = risk_service.rules_v1({
        "tool": "phq9", "score": 5, "severity": "mild",
        "flags_json": {"self_harm": True}
    })
    assert result["predicted_risk"] == "high"
    assert result["confidence"] == 0.99
    assert result["explanation"]["rule"] == "self_harm_flag_override"


def test_rules_v1_moderate():
    result = risk_service.rules_v1({"tool": "phq9", "score": 12, "severity": "moderate", "flags_json": {}})
    assert result["predicted_risk"] == "moderate"


def test_logreg_falls_back_to_rules_when_unfitted():
    """An un-trained model must fall back to rules_v1."""
    fresh_model = risk_service.LogRegRiskModel()
    result = fresh_model.predict({"tool": "phq9", "score": 20, "severity": "severe", "flags_json": {}})
    assert result["predicted_risk"] in ("low", "moderate", "high")
    assert "fallback" in result["explanation"]


def test_logreg_trains_and_predicts():
    """Given enough training data, LogReg should produce a valid prediction."""
    training_data = [
        {"tool": "phq9", "score": 3, "severity": "minimal", "flags_json": {}},
        {"tool": "phq9", "score": 5, "severity": "mild", "flags_json": {}},
        {"tool": "phq9", "score": 12, "severity": "moderate", "flags_json": {}},
        {"tool": "phq9", "score": 18, "severity": "moderately severe", "flags_json": {}},
        {"tool": "phq9", "score": 24, "severity": "severe", "flags_json": {}},
        {"tool": "gad7", "score": 4, "severity": "mild", "flags_json": {}},
        {"tool": "gad7", "score": 15, "severity": "severe", "flags_json": {}},
    ]
    model = risk_service.LogRegRiskModel()
    model.fit(training_data)
    assert model.is_fitted

    result = model.predict({"tool": "phq9", "score": 22, "severity": "severe", "flags_json": {}})
    assert result["predicted_risk"] in ("low", "moderate", "high")
    assert 0.0 <= result["confidence"] <= 1.0
    assert "class_probabilities" in result["explanation"]


def test_feature_building_normalisation():
    """Feature vector is normalised correctly."""
    feats = risk_service._build_features({"tool": "phq9", "score": 27, "flags_json": {}})
    assert feats[0] == pytest.approx(1.0)  # max PHQ-9 score
    assert feats[1] == 1.0  # is_phq9
    assert feats[2] == 0.0  # is_gad7


# ---------------------------------------------------------------------------
# Integration — predict endpoint
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_predict_risk_for_assessment(async_client: AsyncClient, session_token: str):
    headers = {"X-Session-Token": session_token}

    # First submit a consent + assessment
    await async_client.post("/api/v1/sessions/consent", json={"policy_version": "1.0"}, headers=headers)
    answers = {f"phq9_q{i}": (2 if i == 9 else 1) for i in range(1, 10)}
    assess_resp = await async_client.post("/api/v1/assessments/phq9", json={"answers": answers}, headers=headers)
    assert assess_resp.status_code == 201
    assessment_id = assess_resp.json()["id"]

    # Now predict
    pred_resp = await async_client.get(f"/api/v1/risk/predict/{assessment_id}", headers=headers)
    assert pred_resp.status_code == 200
    data = pred_resp.json()
    assert "predictions" in data
    assert "rules_v1" in data["predictions"]
    assert "logreg_v1" in data["predictions"]
    assert "agreement" in data
    assert data["predictions"]["rules_v1"]["predicted_risk"] in ("low", "moderate", "high")


# ---------------------------------------------------------------------------
# Integration — admin train + compare
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_admin_train_and_compare(async_client: AsyncClient, admin_token: str):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Train
    train_resp = await async_client.post("/api/v1/risk/train", headers=admin_headers)
    assert train_resp.status_code == 200
    data = train_resp.json()
    assert "status" in data  # "trained" or "insufficient_data"

    # Compare
    compare_resp = await async_client.get("/api/v1/risk/compare", headers=admin_headers)
    assert compare_resp.status_code == 200
    data = compare_resp.json()
    # Either a comparison result or "no predictions yet"
    assert "agreement_rate" in data or "message" in data
