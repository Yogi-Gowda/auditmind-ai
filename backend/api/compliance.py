"""Compliance API Routes"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.schemas import (
    ComplianceScoreResponse,
    GapResponse,
    MappingRequest,
    MappingResponse,
)
from services.mapping_engine import (
    auto_map_evidence,
    create_manual_mapping,
    get_all_mappings,
    get_mappings_for_requirement,
    delete_mapping,
)
from services.compliance_analyzer import (
    get_overall_compliance,
    get_compliance_gaps,
    get_framework_compliance,
)
from services.risk_scorer import (
    calculate_risk_score,
    get_risk_distribution,
    calculate_requirement_risk,
)

router = APIRouter(prefix="/api/compliance", tags=["Compliance"])


@router.post("/map")
def run_auto_mapping(db: Session = Depends(get_db)):
    """Run the auto-mapping engine to link evidence to requirements."""
    mappings = auto_map_evidence(db)
    return {
        "mappings_created": len(mappings),
        "mappings": [MappingResponse(**m.to_dict()) for m in mappings[:50]],
    }


@router.post("/map/manual", response_model=MappingResponse)
def create_manual(req: MappingRequest, db: Session = Depends(get_db)):
    """Create a manual evidence-to-requirement mapping."""
    if not req.requirement_id or not req.evidence_id:
        raise HTTPException(status_code=400, detail="Both requirement_id and evidence_id are required")
    mapping = create_manual_mapping(db, req.requirement_id, req.evidence_id, req.notes)
    return MappingResponse(**mapping.to_dict())


@router.get("/mappings")
def list_mappings(db: Session = Depends(get_db)):
    """List all evidence-to-requirement mappings."""
    mappings = get_all_mappings(db)
    return [MappingResponse(**m.to_dict()) for m in mappings]


@router.get("/mappings/requirement/{requirement_id}")
def get_requirement_mappings(requirement_id: str, db: Session = Depends(get_db)):
    """Get mappings for a specific requirement."""
    mappings = get_mappings_for_requirement(db, requirement_id)
    return [MappingResponse(**m.to_dict()) for m in mappings]


@router.delete("/mappings/{mapping_id}")
def remove_mapping(mapping_id: str, db: Session = Depends(get_db)):
    """Delete a mapping."""
    success = delete_mapping(db, mapping_id)
    if not success:
        raise HTTPException(status_code=404, detail="Mapping not found")
    return {"message": "Mapping deleted"}


@router.get("/score", response_model=ComplianceScoreResponse)
def get_compliance_score(db: Session = Depends(get_db)):
    """Get overall compliance score and metrics."""
    return get_overall_compliance(db)


@router.get("/gaps", response_model=list[GapResponse])
def list_compliance_gaps(framework: str = None, db: Session = Depends(get_db)):
    """Get all compliance gaps."""
    gaps = get_compliance_gaps(db, framework)
    return [GapResponse(**g) for g in gaps]


@router.get("/framework/{framework_name}")
def get_single_framework(framework_name: str, db: Session = Depends(get_db)):
    """Get compliance details for a specific framework."""
    return get_framework_compliance(db, framework_name)


@router.get("/risk")
def get_risk_assessment(db: Session = Depends(get_db)):
    """Get overall risk assessment."""
    return {
        "risk_score": calculate_risk_score(db),
        "distribution": get_risk_distribution(db),
    }


@router.get("/risk/requirement/{requirement_id}")
def get_requirement_risk_assessment(requirement_id: str, db: Session = Depends(get_db)):
    """Get risk assessment for a specific requirement."""
    return calculate_requirement_risk(db, requirement_id)
