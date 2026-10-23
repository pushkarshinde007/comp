import pytest
from fastapi.testclient import TestClient
from app.services.intelligence_service import calculate_priority_score, check_potential_duplicates
from app.schemas.intelligence import IncidentSummary


def test_calculate_priority_score_critical():
    result = calculate_priority_score(
        category="water_utility",
        severity="critical",
        upvotes=10,
        location_label="Main Expressway & 5th Ave",
        hours_unresolved=26.0,
    )
    # Severity 40 + Category 25 + Upvotes min(15, 25)=15 + Location 10 + Aging 10 = 100
    assert result.score == 100
    assert result.tier == "critical"
    assert "Base Severity (40/40)" in result.breakdown.explanation
    assert result.breakdown.severity_pts == 40
    assert result.breakdown.category_pts == 25
    assert result.breakdown.community_pts == 15
    assert result.breakdown.location_pts == 10
    assert result.breakdown.aging_pts == 10


def test_calculate_priority_score_routine():
    result = calculate_priority_score(
        category="parks_infrastructure",
        severity="low",
        upvotes=0,
        location_label="Quiet Park Path",
        hours_unresolved=0.5,
    )
    # Severity 5 + Category 10 + Upvotes 0 + Location 4 + Aging 1 = 20
    assert result.score == 20
    assert result.tier == "routine"
    assert result.breakdown.severity_pts == 5
    assert result.breakdown.category_pts == 10


def test_detect_duplicate_high_risk():
    existing = [
        IncidentSummary(
            id="inc-1",
            tracking_code="CIV-1001",
            title="Large water main leak flooding street",
            description="Water is pouring across Market Street near the central transit plaza",
            category="water_utility",
            location_label="Market Street & Transit Plaza",
            status="pending_review",
        )
    ]

    res = check_potential_duplicates(
        candidate_title="Burst water pipe flooding market st",
        candidate_description="Major water flow across market street by transit plaza",
        candidate_category="water_utility",
        candidate_location="Market St & Transit Plaza",
        active_incidents=existing,
    )

    assert res.duplicate_risk in ("high", "possible")
    assert res.matched_incident is not None
    assert res.matched_incident.tracking_code == "CIV-1001"
    assert "CIV-1001" in res.matched_incident.reason
    assert "not auto-merged" in res.matched_incident.reason


def test_detect_duplicate_no_match():
    existing = [
        IncidentSummary(
            id="inc-1",
            tracking_code="CIV-1001",
            title="Large water main leak flooding street",
            description="Water is pouring across Market Street near the central transit plaza",
            category="water_utility",
            location_label="Market Street & Transit Plaza",
            status="pending_review",
        )
    ]

    res = check_potential_duplicates(
        candidate_title="Fallen tree limb in north playground",
        candidate_description="Branch fell on swing set in Pine Park",
        candidate_category="parks_infrastructure",
        candidate_location="Pine Park Sector 4",
        active_incidents=existing,
    )

    assert res.duplicate_risk == "none"
    assert res.matched_incident is None


def test_api_calculate_priority_endpoint(client: TestClient):
    response = client.post(
        "/api/v1/calculate-priority",
        json={
            "category": "road_hazard",
            "severity": "high",
            "upvotes": 4,
            "location_label": "Downtown Highway 101",
            "hours_unresolved": 5.0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "tier" in data
    assert data["breakdown"]["severity_pts"] == 26
    assert data["breakdown"]["location_pts"] == 10


def test_api_detect_duplicate_endpoint(client: TestClient):
    response = client.post(
        "/api/v1/detect-duplicate",
        json={
            "candidate_title": "Damaged guardrail on Highway 9",
            "candidate_description": "Metal guardrail twisted after vehicle impact on Highway 9",
            "candidate_category": "road_hazard",
            "candidate_location": "Highway 9 Mile 12",
            "active_incidents": [
                {
                    "id": "inc-99",
                    "tracking_code": "CIV-9900",
                    "title": "Twisted guardrail Highway 9",
                    "description": "Guardrail damage on Highway 9 mile marker 12",
                    "category": "road_hazard",
                    "location_label": "Highway 9 Mile 12",
                    "status": "pending_review",
                }
            ],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["duplicate_risk"] in ("possible", "high")
    assert data["matched_incident"]["tracking_code"] == "CIV-9900"
