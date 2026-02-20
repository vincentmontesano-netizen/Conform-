import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
def client():
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


async def test_health(client):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"
    assert data["rules_count"] == 4


async def test_evaluate_full(client):
    payload = {
        "company": {
            "company_id": "c1",
            "employee_count": 25,
            "has_physical_site": True,
            "sector": "bureau",
        },
        "risks": [
            {
                "risk_id": "r1",
                "category": "RPS",
                "severity": "eleve",
                "probability": "probable",
                "is_rps": True,
                "work_unit_name": "Bureau",
            }
        ],
        "actions": [
            {
                "action_id": "a1",
                "name": "Formation stress",
                "is_critical": True,
                "has_proof": False,
                "status": "a_faire",
            }
        ],
        "duerp_last_validated_at": None,
    }
    response = await client.post("/api/v1/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "compliance_score" in data
    assert data["compliance_score"]["total_rules"] == 4
    assert data["compliance_score"]["score"] < 100
    assert len(data["alerts"]) > 0
    assert "evaluated_at" in data


async def test_evaluate_clean_company(client):
    """A company with no issues should score 100."""
    from datetime import datetime, timezone, timedelta
    recent = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()

    payload = {
        "company": {
            "company_id": "c2",
            "employee_count": 5,
            "has_physical_site": False,
            "sector": "conseil",
        },
        "risks": [],
        "actions": [],
        "duerp_last_validated_at": recent,
    }
    response = await client.post("/api/v1/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["compliance_score"]["score"] == 100
    assert data["compliance_score"]["failed_rules"] == 0
    assert len(data["alerts"]) == 0


async def test_evaluate_invalid_payload(client):
    response = await client.post("/api/v1/evaluate", json={"bad": "data"})
    assert response.status_code == 422


async def test_evaluate_empty_company(client):
    """Missing required fields should return 422."""
    response = await client.post("/api/v1/evaluate", json={
        "company": {"company_id": "c1"},
        "risks": [],
        "actions": [],
    })
    assert response.status_code == 422
