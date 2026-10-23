import pytest
from fastapi.testclient import TestClient
from app.config import Settings, get_settings
from app.main import create_app


@pytest.fixture
def test_settings() -> Settings:
    return Settings(
        PROJECT_NAME="CivicSignal AI Test API",
        VERSION="0.1.0-test",
        ENVIRONMENT="testing",
        DEBUG=True,
        ALLOWED_ORIGINS="http://localhost:3000,http://testserver",
        GEMINI_API_KEY=None,
        FIREBASE_PROJECT_ID=None,
    )


@pytest.fixture
def app(test_settings: Settings):
    test_app = create_app(settings=test_settings)
    test_app.dependency_overrides[get_settings] = lambda: test_settings
    return test_app


@pytest.fixture
def client(app) -> TestClient:
    return TestClient(app)
