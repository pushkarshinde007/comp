from fastapi.testclient import TestClient


def test_root_endpoint_returns_200(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert data["health"] == "/health"


def test_health_check_returns_200(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "civicsignal-api"
    assert "version" in data
    assert "environment" in data
    assert "timestamp" in data


def test_health_check_does_not_reveal_secrets(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()

    # List of prohibited sensitive substrings
    forbidden_tokens = [
        "secret",
        "key",
        "token",
        "password",
        "credential",
        "path",
        "database",
        "gemini",
        "firebase",
    ]

    for key, value in data.items():
        lowered_key = key.lower()
        for token in forbidden_tokens:
            assert token not in lowered_key, f"Sensitive term '{token}' found in health check response key: {key}"

        if isinstance(value, str):
            lowered_val = value.lower()
            # Ensure internal filesystem paths (/Users, /etc, /var, C:) are not leaked
            assert not lowered_val.startswith("/users"), f"Filesystem path leaked in {key}: {value}"
            assert not lowered_val.startswith("/home"), f"Filesystem path leaked in {key}: {value}"
            assert not lowered_val.startswith("/etc"), f"Filesystem path leaked in {key}: {value}"


def test_cors_headers_allowed_origin(client: TestClient):
    response = client.get(
        "/health",
        headers={"Origin": "http://localhost:3000"}
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_headers_disallowed_origin(client: TestClient):
    response = client.get(
        "/health",
        headers={"Origin": "http://malicious-site.example.com"}
    )
    assert response.status_code == 200
    # Disallowed origin must not receive Access-Control-Allow-Origin header matching its origin
    assert response.headers.get("access-control-allow-origin") != "http://malicious-site.example.com"
