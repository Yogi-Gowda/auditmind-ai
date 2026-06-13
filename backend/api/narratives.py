"""Narratives API Routes"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.schemas import NarrativeRequest, NarrativeResponse, BulkNarrativeRequest
from services.ai_narrator import generate_narrative, generate_bulk_narratives

router = APIRouter(prefix="/api/narratives", tags=["Narratives"])


@router.post("/generate", response_model=NarrativeResponse)
def create_narrative(req: NarrativeRequest, db: Session = Depends(get_db)):
    """Generate an AI compliance narrative for a requirement."""
    result = generate_narrative(db, req.requirement_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return NarrativeResponse(**result)


@router.post("/bulk")
def create_bulk_narratives(req: BulkNarrativeRequest, db: Session = Depends(get_db)):
    """Generate narratives for all requirements."""
    narratives = generate_bulk_narratives(db, req.framework)
    return {
        "count": len(narratives),
        "narratives": narratives,
    }


@router.get("/{requirement_id}", response_model=NarrativeResponse)
def get_narrative(requirement_id: str, db: Session = Depends(get_db)):
    """Get a narrative for a specific requirement."""
    result = generate_narrative(db, requirement_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return NarrativeResponse(**result)
