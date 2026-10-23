from fastapi import APIRouter, Depends
from app.config import Settings, get_settings
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Returns service health status without disclosing internal configuration or secrets."
)
def get_health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="civicsignal-api",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
    )
