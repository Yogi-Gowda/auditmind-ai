"""Policy API Routes"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.schemas import PolicyUploadRequest, PolicyResponse, RequirementResponse, ParseResponse
from services.policy_parser import (
    parse_policy_document,
    get_all_policies,
    get_policy_by_id,
    get_requirements,
    get_requirement_by_id,
)

router = APIRouter(prefix="/api/policies", tags=["Policies"])


@router.post("/upload", response_model=ParseResponse)
def upload_and_parse_policy(req: PolicyUploadRequest, db: Session = Depends(get_db)):
    """Upload a policy document and extract compliance requirements."""
    policy, requirements = parse_policy_document(
        db=db,
        name=req.name,
        framework=req.framework,
        content=req.content,
    )
    return ParseResponse(
        policy_id=policy.id,
        framework=policy.framework,
        requirements_extracted=len(requirements),
        requirements=[
            RequirementResponse(**r.to_dict()) for r in requirements
        ],
    )


@router.get("/", response_model=list[PolicyResponse])
def list_policies(db: Session = Depends(get_db)):
    """List all uploaded policy documents."""
    policies = get_all_policies(db)
    return [PolicyResponse(**p.to_dict()) for p in policies]


@router.get("/{policy_id}", response_model=PolicyResponse)
def get_policy(policy_id: str, db: Session = Depends(get_db)):
    """Get a specific policy document."""
    policy = get_policy_by_id(db, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return PolicyResponse(**policy.to_dict())


@router.get("/{policy_id}/requirements", response_model=list[RequirementResponse])
def get_policy_requirements(policy_id: str, db: Session = Depends(get_db)):
    """Get requirements for a specific policy."""
    policy = get_policy_by_id(db, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return [RequirementResponse(**r.to_dict()) for r in policy.requirements]


@router.get("/requirements/all", response_model=list[RequirementResponse])
def list_all_requirements(
    framework: str = None,
    category: str = None,
    db: Session = Depends(get_db),
):
    """List all requirements with optional filters."""
    reqs = get_requirements(db, framework=framework, category=category)
    return [RequirementResponse(**r.to_dict()) for r in reqs]


@router.get("/requirements/{req_id}", response_model=RequirementResponse)
def get_single_requirement(req_id: str, db: Session = Depends(get_db)):
    """Get a specific requirement."""
    req = get_requirement_by_id(db, req_id)
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    return RequirementResponse(**req.to_dict())
