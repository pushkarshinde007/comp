import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.health import router as health_router
from app.api.routes.analysis import router as analysis_router
from app.api.routes.intelligence import router as intelligence_router
from app.config import Settings, get_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("civicsignal-api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup lifecycle
    settings = get_settings()
    logger.info(
        f"Starting {settings.PROJECT_NAME} (v{settings.VERSION}) in [{settings.ENVIRONMENT}] mode"
    )
    logger.info(f"CORS allowed origins configured: {settings.cors_origins}")
    yield
    # Shutdown lifecycle
    logger.info("Shutting down CivicSignal AI API")


def create_app(settings: Settings | None = None) -> FastAPI:
    if settings is None:
        settings = get_settings()

    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="CivicSignal AI - Civic Issue Intelligence Platform Backend",
        docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
        redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
        lifespan=lifespan,
    )

    # Configure CORS with explicit, environment-controlled origins
    if settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            allow_headers=["*"],
        )

    # Register routes
    @app.get("/", tags=["Root"])
    def root():
        return {
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "operational",
            "health": "/health",
        }

    app.include_router(health_router)
    app.include_router(analysis_router)
    app.include_router(intelligence_router)

    return app


app = create_app()
