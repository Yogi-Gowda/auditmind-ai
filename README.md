# AuditMind AI

AI-powered compliance evidence collection and audit intelligence platform for Problem Statement 03.

AuditMind AI parses policy documents, extracts compliance requirements, ingests evidence artifacts, maps evidence to requirements, detects gaps, scores risk, generates AI-style narratives, and produces auditor-ready PDF/JSON reports.

For a non-technical explanation of the project, see [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md).

## Modules Covered

- Policy parser and requirement extraction
- Evidence ingestion from CSV or API upload
- Evidence freshness checker: 0-30 days green, 31-90 days yellow, 90+ days red
- Evidence-to-requirement mapping engine
- Compliance scoring and framework scoring
- Risk detection for missing, stale, low-confidence, and rejected evidence
- AI compliance narrative generator with mock mode and OpenAI-ready mode
- FastAPI backend with Swagger docs
- React + Tailwind dashboard
- Dynamic PDF and JSON report generation

## Project Structure

```text
AuditMindAI/
  backend/
    api/
    core/
    models/
    schemas/
    services/
    app.py
    seed.py
    requirements.txt
  data/
    policy_documents.txt
    evidence_artifacts.csv
  frontend/
    src/
    package.json
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn app:app --reload --port 8000
```

Open the API docs at:

```text
http://localhost:8000/docs
```

By default the backend uses SQLite at `backend/auditmind.db`. To use PostgreSQL, set `DATABASE_URL` in `backend/.env`.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The Vite dev server proxies `/api` requests to `http://localhost:8000`.

## Demo Flow

1. Upload or seed policy documents.
2. Confirm extracted requirements.
3. Upload evidence CSV or single evidence artifacts.
4. Run auto-mapping.
5. Review compliance score, gaps, and risk.
6. Generate compliance narratives.
7. Generate PDF/JSON audit reports.

## Useful API Endpoints

- `POST /api/policies/upload`
- `GET /api/policies`
- `GET /api/policies/{policy_id}/requirements`
- `POST /api/evidence/upload`
- `POST /api/evidence/upload/csv`
- `PUT /api/evidence/{evidence_id}/review`
- `POST /api/compliance/map`
- `GET /api/compliance/score`
- `GET /api/compliance/gaps`
- `POST /api/narratives/generate`
- `POST /api/reports/generate`
- `GET /api/reports/{report_id}/pdf`
- `GET /api/reports/{report_id}/json`

## AI Mode

The app defaults to deterministic mock narratives so the demo works without an API key.

Set these in `backend/.env` to use OpenAI-backed narrative generation later:

```text
AI_MODE=openai
OPENAI_API_KEY=your_api_key_here
```
