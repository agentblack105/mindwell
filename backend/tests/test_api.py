from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_session():
    response = client.post("/api/v1/sessions", json={"language": "en", "client_meta": {"browser": "test"}})
    assert response.status_code == 201
    data = response.json()
    assert "session_token" in data
    assert "expires_at" in data

def test_create_consent_without_session_fails():
    response = client.post("/api/v1/sessions/consent", json={"policy_version": "1.0"})
    assert response.status_code == 401
    assert response.json() == {"detail": "Missing X-Session-Token header"}

