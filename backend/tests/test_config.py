from app.config import Settings


def test_cors_origins_parsing():
    settings = Settings(ALLOWED_ORIGINS="http://localhost:3000, https://civicsignal.org, ")
    origins = settings.cors_origins
    assert len(origins) == 2
    assert "http://localhost:3000" in origins
    assert "https://civicsignal.org" in origins


def test_cors_origins_empty():
    settings = Settings(ALLOWED_ORIGINS="")
    assert settings.cors_origins == []


def test_default_settings():
    settings = Settings(_env_file=None)
    assert settings.PROJECT_NAME == "CivicSignal AI API"
    assert settings.VERSION == "0.1.0"
    assert settings.ENVIRONMENT == "development"
    assert settings.GEMINI_API_KEY is None
    assert settings.FIREBASE_PROJECT_ID is None
