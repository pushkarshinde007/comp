from functools import lru_cache
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicSignal AI API"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # CORS configuration - comma-separated list of origins
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Google Gemini AI Integration (Loaded strictly on backend, never exposed to client)
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_TIMEOUT_SECONDS: float = 30.0
    MAX_UPLOAD_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB max image upload

    # Future Firebase / Firestore Configuration (Phase 3+)
    FIREBASE_PROJECT_ID: str | None = None
    FIRESTORE_DATABASE_ID: str | None = "(default)"

    model_config = SettingsConfigDict(
        env_file=(str(BASE_DIR / ".env"), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        if not self.ALLOWED_ORIGINS:
            return []
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def is_gemini_configured(self) -> bool:
        return bool(self.GEMINI_API_KEY and self.GEMINI_API_KEY.strip())


@lru_cache()
def get_settings() -> Settings:
    return Settings()
