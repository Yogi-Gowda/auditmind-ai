"""
Risk Scoring Engine
Calculates risk scores based on evidence gaps and compliance status.

Formula:
Risk Score = 40% Missing Evidence + 30% Stale Evidence + 20% Confidence Score + 10% Review Status

Severity Levels:
  0-30   → Low
  31-60  → Medium
  61-80  → High
  81-100 → Critical
"""

from sqlalchemy.orm import Session
from models.requirement import ComplianceRequirement
from models.evidence import EvidenceArtifact
from models.mapping import EvidenceMapping
from core.config import (
    RISK_WEIGHT_MISSING,
    RISK_WEIGHT_STALE,
    RISK_WEIGHT_CONFIDENCE,
    RISK_WEIGHT_REVIEW,
)


def get_severity_label(score: float) -> str:
    """Convert risk score to severity label."""
    if score <= 30:
        return "low"
    elif score <= 60:
        return "medium"
    elif score <= 80:
        return "high"
    return "critical"


def calculate_risk_score(db: Session) -> float:
    """
    Calculate overall risk score.
    """
    requirements = db.query(ComplianceRequirement).all()
    evidences = db.query(EvidenceArtifact).all()
    mappings = db.query(EvidenceMapping).all()

    total_reqs = len(requirements)
    total_evidence = len(evidences)

    if total_reqs == 0:
        return 0.0

    # 1. Missing Evidence Score (0-100)
    mapped_req_ids = set(m.requirement_id for m in mappings)
    unmapped = sum(1 for r in requirements if r.id not in mapped_req_ids)
    missing_score = (unmapped / total_reqs) * 100

    # 2. Stale Evidence Score (0-100)
    if total_evidence > 0:
        stale_count = sum(1 for e in evidences if e.freshness_status == "red")
        stale_score = (stale_count / total_evidence) * 100
    else:
        stale_score = 100  # No evidence = maximum stale risk

    # 3. Confidence Score (0-100, inverted — low confidence = high risk)
    if total_evidence > 0:
        avg_confidence = sum(e.confidence_score for e in evidences) / total_evidence
        confidence_risk = (1 - avg_confidence) * 100
    else:
        confidence_risk = 100

    # 4. Review Status Score (0-100)
    if total_evidence > 0:
        unreviewed = sum(1 for e in evidences if e.review_status == "pending")
        rejected = sum(1 for e in evidences if e.review_status == "rejected")
        review_risk = ((unreviewed * 0.5 + rejected) / total_evidence) * 100
    else:
        review_risk = 100

    # Weighted combination
    risk_score = (
        RISK_WEIGHT_MISSING * missing_score
        + RISK_WEIGHT_STALE * stale_score
        + RISK_WEIGHT_CONFIDENCE * confidence_risk
        + RISK_WEIGHT_REVIEW * review_risk
    )

    return round(min(risk_score, 100), 1)


def calculate_requirement_risk(db: Session, requirement_id: str) -> dict:
    """Calculate risk for a specific requirement."""
    mappings = db.query(EvidenceMapping).filter(
        EvidenceMapping.requirement_id == requirement_id
    ).all()

    if not mappings:
        return {
            "requirement_id": requirement_id,
            "risk_score": 85.0,
            "severity": "critical",
            "factors": {"missing_evidence": True},
        }

    evidence_ids = [m.evidence_id for m in mappings]
    evidences = db.query(EvidenceArtifact).filter(
        EvidenceArtifact.id.in_(evidence_ids)
    ).all()

    factors = {}
    risk = 0.0

    # Check for stale evidence
    stale = [e for e in evidences if e.freshness_status == "red"]
    if stale:
        factors["stale_evidence"] = len(stale)
        risk += 30

    # Check for low confidence
    low_conf = [e for e in evidences if e.confidence_score < 0.7]
    if low_conf:
        factors["low_confidence"] = len(low_conf)
        risk += 20

    # Check for rejected
    rejected = [e for e in evidences if e.review_status == "rejected"]
    if rejected:
        factors["rejected_evidence"] = len(rejected)
        risk += 25

    # Check for unreviewed
    pending = [e for e in evidences if e.review_status == "pending"]
    if pending:
        factors["unreviewed_evidence"] = len(pending)
        risk += 10

    return {
        "requirement_id": requirement_id,
        "risk_score": min(risk, 100),
        "severity": get_severity_label(risk),
        "factors": factors,
    }


def get_risk_distribution(db: Session) -> dict:
    """Get distribution of risk across severity levels."""
    requirements = db.query(ComplianceRequirement).all()

    distribution = {"low": 0, "medium": 0, "high": 0, "critical": 0}

    for req in requirements:
        req_risk = calculate_requirement_risk(db, req.id)
        severity = req_risk["severity"]
        distribution[severity] = distribution.get(severity, 0) + 1

    return distribution
