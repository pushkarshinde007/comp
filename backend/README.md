# CivicSignal AI — Backend API

FastAPI service powering the CivicSignal AI platform.

## Features

- **FastAPI Application**: Modular application structure with application factory pattern.
- **Pydantic Configuration**: Strict environment loading using `pydantic-settings`.
- **Health Check**: `GET /health` responding with service uptime status, environment, version, and UTC timestamp.
- **Gemini AI Intelligence (Phase 2)**: `POST /api/v1/analyze-issue` endpoint powered by Google's official `google-genai` Python SDK with structured JSON output and prompt injection defenses.
- **Security & CORS**: Environment-controlled CORS headers; strict sanitization preventing internal path or credential disclosure.
- **Hermetic Testing**: Comprehensive 19-test `pytest` test suite with `TestClient` fixtures and mocked AI provider calls.

## Quick Start

```bash
# From repository root
cd backend

# Create virtual environment with Python 3.12
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt

# Run test suite
pytest tests -v

# Run local development server
uvicorn app.main:app --reload --port 8000
```

## API Documentation & Endpoints

When the server is running locally in development mode:
- Interactive Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: `GET /health`
- Gemini AI Triage: `POST /api/v1/analyze-issue` (Accepts `multipart/form-data` with optional image file and description)
