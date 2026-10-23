"""Main ASGI entrypoint for CivicSignal AI Backend.
Exports FastAPI application instance for Uvicorn, Vercel, and Cloud Run.
"""
from app.main import app

__all__ = ["app"]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
