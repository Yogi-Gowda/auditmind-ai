"""
AuditMind AI - FastAPI Application
Automated Compliance Evidence Collection & Audit Intelligence
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import init_db
from core.config import APP_TITLE, APP_VERSION, APP_DESCRIPTION
from api.policies import router as policies_router
from api.evidence import router as evidence_router
from api.compliance import router as compliance_router
from api.narratives import router as narratives_router
from api.reports import router as reports_router

app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(policies_router)
app.include_router(evidence_router)
app.include_router(compliance_router)
app.include_router(narratives_router)
app.include_router(reports_router)


@app.on_event("startup")
def on_startup():
    """Initialize database tables on startup."""
    init_db()


@app.get("/")
def root():
    return {
        "name": APP_TITLE,
        "version": APP_VERSION,
        "description": APP_DESCRIPTION,
        "docs": "/docs",
        "endpoints": {
            "policies": "/api/policies",
            "evidence": "/api/evidence",
            "compliance": "/api/compliance",
            "narratives": "/api/narratives",
            "reports": "/api/reports",
        },
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "version": APP_VERSION}
