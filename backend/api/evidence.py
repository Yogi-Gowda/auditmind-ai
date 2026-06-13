"""Evidence API Routes"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.schemas import (
    EvidenceUploadRequest,
    EvidenceBulkUploadRequest,
    EvidenceResponse,
    EvidenceReviewRequest,
)
from services.evidence_manager import (
    upload_evidence,
    upload_evidence_bulk,
    upload_evidence_csv,
    get_all_evidence,
    get_evidence_by_id,
    review_evidence,
    delete_evidence,
    get_evidence_stats,
)

router = APIRouter(prefix="/api/evidence", tags=["Evidence"])


@router.post("/upload", response_model=EvidenceResponse)
def upload_single_evidence(req: EvidenceUploadRequest, db: Session = Depends(get_db)):
    """Upload a single evidence artifact."""
    evidence = upload_evidence(
        db=db,
        title=req.title,
        source=req.source,
        framework=req.framework,
        evidence_type=req.evidence_type,
        description=req.description,
        content=req.content,
        confidence_score=req.confidence_score,
        collected_at=req.collected_at,
        review_status=req.review_status,
    )
    return EvidenceResponse(**evidence.to_dict())


@router.post("/upload/bulk", response_model=list[EvidenceResponse])
def upload_bulk_evidence(req: EvidenceBulkUploadRequest, db: Session = Depends(get_db)):
    """Upload multiple evidence artifacts."""
    results = upload_evidence_bulk(db, req.evidences)
    return [EvidenceResponse(**e.to_dict()) for e in results]


@router.post("/upload/csv")
async def upload_csv_evidence(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload evidence from a CSV file."""
    content = await file.read()
    csv_text = content.decode("utf-8")
    results = upload_evidence_csv(db, csv_text)
    return {
        "uploaded": len(results),
        "evidence": [EvidenceResponse(**e.to_dict()) for e in results],
    }


@router.get("/", response_model=list[EvidenceResponse])
def list_evidence(
    framework: str = None,
    review_status: str = None,
    freshness: str = None,
    source: str = None,
    db: Session = Depends(get_db),
):
    """List evidence with optional filters."""
    results = get_all_evidence(db, framework, review_status, freshness, source)
    return [EvidenceResponse(**e.to_dict()) for e in results]


@router.get("/stats")
def evidence_statistics(db: Session = Depends(get_db)):
    """Get aggregate evidence statistics."""
    return get_evidence_stats(db)


@router.get("/{evidence_id}", response_model=EvidenceResponse)
def get_single_evidence(evidence_id: str, db: Session = Depends(get_db)):
    """Get a specific evidence artifact."""
    evidence = get_evidence_by_id(db, evidence_id)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return EvidenceResponse(**evidence.to_dict())


@router.put("/{evidence_id}/review", response_model=EvidenceResponse)
def review_single_evidence(
    evidence_id: str,
    req: EvidenceReviewRequest,
    db: Session = Depends(get_db),
):
    """Review an evidence artifact (approve/reject)."""
    evidence = review_evidence(db, evidence_id, req.status, req.notes)
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return EvidenceResponse(**evidence.to_dict())


@router.delete("/{evidence_id}")
def delete_single_evidence(evidence_id: str, db: Session = Depends(get_db)):
    """Delete an evidence artifact."""
    success = delete_evidence(db, evidence_id)
    if not success:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return {"message": "Evidence deleted successfully"}
