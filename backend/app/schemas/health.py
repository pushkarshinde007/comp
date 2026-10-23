from datetime import datetime, timezone
from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = Field(default="ok", description="Operational status of the API service")
    service: str = Field(default="civicsignal-api", description="Service identifier")
    version: str = Field(..., description="Application semantic version")
    environment: str = Field(..., description="Current running environment")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Current server timestamp in UTC"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "ok",
                "service": "civicsignal-api",
                "version": "0.1.0",
                "environment": "development",
                "timestamp": "2026-10-23T08:00:00Z"
            }
        }
    }
