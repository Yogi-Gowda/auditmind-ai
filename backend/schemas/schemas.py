from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# --- Policy Schemas ---
class PolicyUploadRequest(BaseModel):
    name: str
    framework: str
    content: str


class PolicyResponse(BaseModel):
    id: str
    name: str
    framework: str
    content: str
    uploaded_at: Optional[str] = None
    requirement_count: int = 0


class RequirementResponse(BaseModel):
    id: str
    policy_id: str
    framework: str
    requirement_text: str
    category: str
    control_standard: Optional[str] = None
    severity: str = "medium"
    status: str = "active"
    created_at: Optional[str] = None
    evidence_count: int = 0


class ParseResponse(BaseModel):
    policy_id: str
    framework: str
    requirements_extracted: int
    requirements: List[RequirementResponse]


# --- Evidence Schemas ---
class EvidenceUploadRequest(BaseModel):
    title: str
    description: Optional[str] = None
    source: str
    framework: str
    evidence_type: str
    content: Optional[str] = None
    confidence_score: float = 0.85
    collected_at: Optional[str] = None
    review_status: str = "pending"


class EvidenceBulkUploadRequest(BaseModel):
    evidences: List[EvidenceUploadRequest]


class EvidenceResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    source: str
    framework: str
    evidence_type: str
    content: Optional[str] = None
    confidence_score: float
    review_status: str
    status: Optional[str] = None
    collected_at: Optional[str] = None
    collection_date: Optional[str] = None
    reviewed_at: Optional[str] = None
    reviewer_notes: Optional[str] = None
    anomaly_marker: Optional[str] = None
    location: Optional[str] = None
    freshness_days: int = 0
    freshness_status: str = "green"


class EvidenceReviewRequest(BaseModel):
    status: str  # approved, rejected
    notes: Optional[str] = None


# --- Compliance Schemas ---
class ComplianceScoreResponse(BaseModel):
    overall_compliance: float
    coverage: float
    missing_evidence_pct: float
    high_risk_findings: int
    audit_readiness: str
    risk_score: float
    framework_scores: dict


class GapResponse(BaseModel):
    requirement_id: str
    requirement_text: str
    framework: str
    category: str
    gap_type: str  # missing, stale, low_confidence, rejected
    severity: str
    details: Optional[str] = None


class MappingRequest(BaseModel):
    requirement_id: Optional[str] = None
    evidence_id: Optional[str] = None
    notes: Optional[str] = None


class MappingResponse(BaseModel):
    id: str
    requirement_id: str
    evidence_id: str
    requirement_text: Optional[str] = None
    evidence_title: Optional[str] = None
    confidence: float
    mapping_type: str
    notes: Optional[str] = None
    created_at: Optional[str] = None


# --- Narrative Schemas ---
class NarrativeRequest(BaseModel):
    requirement_id: str


class NarrativeResponse(BaseModel):
    requirement_id: str
    requirement_text: str
    framework: str
    narrative: str
    status: str  # COMPLIANT, NON_COMPLIANT, PARTIAL
    confidence: float


class BulkNarrativeRequest(BaseModel):
    framework: Optional[str] = None


# --- Report Schemas ---
class ReportGenerateRequest(BaseModel):
    title: str = "AuditMind AI Compliance Report"
    report_type: str = "full"  # full, executive, framework
    framework: Optional[str] = None


class ReportResponse(BaseModel):
    id: str
    title: str
    report_type: str
    overall_compliance: float
    coverage: float
    audit_readiness: str
    risk_score: float
    framework_scores: Optional[dict] = None
    summary: Optional[str] = None
    recommendations: Optional[str] = None
    generated_at: Optional[str] = None
