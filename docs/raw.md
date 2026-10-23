# CivicSignal AI — Phase 0: Foundation and Environment Audit

Act as the senior full-stack engineer for CivicSignal AI, an AI-powered civic issue intelligence platform being built for a competitive application development competition.

The development environment is macOS.

Known installed versions:
- Git 2.50.1
- Node.js 24.12.0
- npm 11.6.2
- Python 3.14.6

The product will eventually use Next.js, TypeScript, Tailwind CSS, Python FastAPI, Google Gemini, Firebase Authentication, Firestore, Google Maps Platform and Google Cloud Run.

IMPORTANT: This is Phase 0 only. Do not build the dashboard or implement Gemini integration yet.

## Step 1 — Inspect before changing

Inspect the current directory, existing files, Git status, installed tooling and available Python versions.

Do not overwrite existing work, delete files, create cloud resources, or assume that credentials are configured.

Report compatibility issues before choosing dependencies. Prefer Python 3.12 or 3.13 if already available; do not modify the system Python installation. If no compatible alternative is available, attempt a minimal setup with the installed Python 3.14 only if the chosen dependencies support it.

## Step 2 — Scaffold the application

Create this structure:

- frontend/: Next.js App Router, TypeScript, Tailwind CSS and ESLint
- backend/: Python FastAPI application
- docs/: architecture and setup documentation
- evaluation/: reserved for future labeled test fixtures and evaluation scripts
- .github/workflows/: CI workflows
- root .gitignore
- root README.md

Use a conventional and maintainable directory structure. Keep dependencies minimal.

## Step 3 — Implement the backend foundation

Create:
- GET /health endpoint
- Clear application startup and configuration
- Pydantic models where appropriate
- A testable FastAPI application
- pytest and FastAPI TestClient tests
- Correct CORS configuration using environment-based allowed origins, not unrestricted production access

The health endpoint must not reveal secrets, internal paths, or sensitive configuration.

## Step 4 — Frontend foundation

Create a minimal working Next.js landing page that identifies the product as CivicSignal AI.

Do not implement the final dashboard in this phase.

Ensure:
- TypeScript is enabled
- ESLint works
- Production build works
- No unnecessary dependencies
- No fake AI functionality or misleading integration claims

## Step 5 — Configuration and security

Provide suitable .gitignore rules and safe environment examples.

Use environment variables for future Gemini, Firebase and service configuration.

Never place real credentials in source code, README files, browser-exposed variables, screenshots or Git history.

Do not create Firebase projects or deploy anything automatically.

## Step 6 — CI and documentation

Add GitHub Actions checks for frontend lint/build and backend tests.

Write setup instructions based on the actual commands and files created.

Document current limitations honestly.

## Step 7 — Mandatory verification

Run the available checks and report actual outcomes:
1. Frontend dependencies install successfully.
2. Frontend lint passes.
3. Frontend production build passes.
4. Backend dependencies install successfully.
5. Backend tests pass.
6. The health endpoint returns HTTP 200.
7. No secret values are included in tracked files.
8. Git status and generated files are reviewed.

Do not claim a test passed unless you actually ran it. If a dependency is incompatible with the available Python version, report the exact failure and propose the smallest safe fix.

## Final deliverable: Phase 0 report

Return the following sections:

A. Environment and compatibility findings
B. Files created or changed
C. Commands executed and their actual results
D. Tests passed and failed
E. Security and Git review
F. Manual actions required from me
G. Known issues and blockers
H. Recommended next step

Stop after this report. Do not start Phase 1 until I approve the results.
