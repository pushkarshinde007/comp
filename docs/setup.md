# CivicSignal AI — Environment Setup Guide

This guide describes how to bootstrap, configure, and verify the CivicSignal AI monorepo on macOS.

---

## 1. Prerequisites

Ensure the following tools are available on your system:
- **Git**: 2.50+
- **Node.js**: v20+ (Audited with v24.12.0)
- **NPM**: 11+
- **Python**: 3.12 (Audited with Python 3.12.13 at `~/.local/bin/python3.12`)

> **Note on Python 3.14**: macOS system Python in this environment has Python 3.14.6 installed. Python 3.14 is currently pre-release/experimental. While core libraries like FastAPI install, production and cloud integrations (Firestore, Gemini SDK) strongly recommend Python 3.12 or 3.13 for long-term wheel stability. We explicitly configure Python 3.12 for `backend/.venv`.

---

## 2. Backend Setup

### A. Initialize Virtual Environment
From the repository root:
```bash
# Create Python 3.12 virtual environment
python3.12 -m venv backend/.venv

# Activate virtual environment
source backend/.venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install dependencies (runtime + dev/testing)
pip install -r backend/requirements-dev.txt
```

### B. Configure Environment
```bash
cp backend/.env.example backend/.env
```
To enable Google Gemini intelligence:
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/) or Google Cloud Console.
2. In `backend/.env`, set:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
> **Important Note on API Key Permissions**:
> If using a Google Cloud project API key, ensure the `generativelanguage.googleapis.com` API is enabled on that Google Cloud project (and the key is not restricted only to Google Maps or Firebase). If you encounter `API_KEY_SERVICE_BLOCKED` (HTTP 403), create a dedicated Gemini API key at [Google AI Studio](https://aistudio.google.com/).

If `GEMINI_API_KEY` is omitted, the application remains fully functional in safe fallback mode: the frontend displays a clear unconfigured notice and the backend returns HTTP 503 with configuration instructions rather than failing or returning fabricated data.

### C. Run Backend Tests
```bash
cd backend
.venv/bin/pytest tests -v
```

### D. Run Backend Development Server
```bash
cd backend
.venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Visit: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) or [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## 3. Frontend Setup

### A. Install Dependencies
From the repository root:
```bash
cd frontend
npm install
```

> **macOS NPM Cache Tip**: If npm fails with `EACCES: permission denied` on `~/.npm/_cacache`, run with a local or temporary cache:
> ```bash
> npm install --cache /tmp/npm-cache
> ```
> Or permanently fix the permissions of your personal cache folder:
> ```bash
> sudo chown -R $(id -u):$(id -g) ~/.npm
> ```

### B. Configure Environment
```bash
cp frontend/.env.example frontend/.env.local
```

### C. Run Linting
```bash
cd frontend
npm run lint
```

### D. Run Production Build
```bash
cd frontend
npm run build
```

### E. Run Development Server
```bash
cd frontend
npm run dev
```
Visit: [http://localhost:3000](http://localhost:3000).

---

## 4. Verification Checklist

Run these commands to verify the complete repository state:
```bash
# 1. Backend tests
cd backend && .venv/bin/pytest tests -v

# 2. Frontend lint
cd ../frontend && npm run lint

# 3. Frontend production build
npm run build
```
