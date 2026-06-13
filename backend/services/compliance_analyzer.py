"""
Compliance Analyzer Service
Analyzes compliance status, detects gaps, calculates scores.
"""

from typing import List, Dict
from sqlalchemy.orm import Session
from models.requirement import ComplianceRequirement
from models.evidence import EvidenceArtifact
from models.mapping import EvidenceMapping
from services.risk_scorer import calculate_risk_score, get_severity_label
from core.config import CONFIDENCE_LOW


FRAMEWORKS = ["GDPR", "SOX", "HIPAA", "NIST", "ISO 27001", "PCI-DSS"]


def get_compliance_gaps(db: Session, framework: str = None) -> List[dict]:
    """Detect all compliance gaps across requirements."""
    query = db.query(ComplianceRequirement)
    if framework:
        query = query.filter(ComplianceRequirement.framework == framework)
    requirements = query.all()

    gaps = []
    for req in requirements:
        mappings = db.query(EvidenceMapping).filter(
            EvidenceMapping.requirement_id == req.id
        ).all()

        if not mappings:
            # Missing evidence
            gaps.append({
                "requirement_id": req.id,
                "requirement_text": req.requirement_text,
                "framework": req.framework,
                "category": req.category,
                "gap_type": "missing",
                "severity": "high",
                "details": "No supporting evidence found for this requirement.",
            })
            continue

        # Check each mapped evidence
        evidence_ids = [m.evidence_id for m in mappings]
        evidences = db.query(EvidenceArtifact).filter(
            EvidenceArtifact.id.in_(evidence_ids)
        ).all()

        has_valid = False
        for ev in evidences:
            if ev.freshness_status == "red":
                gaps.append({
                    "requirement_id": req.id,
                    "requirement_text": req.requirement_text,
                    "framework": req.framework,
                    "category": req.category,
                    "gap_type": "stale",
                    "severity": "medium",
                    "details": f"Evidence '{ev.title}' is {ev.freshness_days} days old (stale).",
                })
            elif ev.confidence_score < CONFIDENCE_LOW:
                gaps.append({
                    "requirement_id": req.id,
                    "requirement_text": req.requirement_text,
                    "framework": req.framework,
                    "category": req.category,
                    "gap_type": "low_confidence",
                    "severity": "medium",
                    "details": f"Evidence '{ev.title}' has low confidence ({ev.confidence_score:.0%}).",
                })
            elif ev.review_status == "rejected":
                gaps.append({
                    "requirement_id": req.id,
                    "requirement_text": req.requirement_text,
                    "framework": req.framework,
                    "category": req.category,
                    "gap_type": "rejected",
                    "severity": "high",
                    "details": f"Evidence '{ev.title}' was rejected during review.",
                })
            else:
                has_valid = True

        if not has_valid and not any(g["requirement_id"] == req.id and g["gap_type"] == "missing" for g in gaps):
            # All evidence for this requirement has issues
            if not any(g["requirement_id"] == req.id for g in gaps):
                gaps.append({
                    "requirement_id": req.id,
                    "requirement_text": req.requirement_text,
                    "framework": req.framework,
                    "category": req.category,
                    "gap_type": "missing",
                    "severity": "high",
                    "details": "No valid evidence found (all evidence has issues).",
                })

    return gaps


def get_framework_compliance(db: Session, framework: str) -> dict:
    """Calculate compliance score for a specific framework."""
    requirements = db.query(ComplianceRequirement).filter(
        ComplianceRequirement.framework == framework
    ).all()

    total = len(requirements)
    if total == 0:
        return {
            "framework": framework,
            "total_requirements": 0,
            "covered": 0,
            "coverage_pct": 0,
            "compliance_score": 0,
            "status": "NOT_ASSESSED",
        }

    covered = 0
    compliance_scores = []

    for req in requirements:
        mappings = db.query(EvidenceMapping).filter(
            EvidenceMapping.requirement_id == req.id
        ).all()

        if mappings:
            # Get best evidence for this requirement
            evidence_ids = [m.evidence_id for m in mappings]
            evidences = db.query(EvidenceArtifact).filter(
                EvidenceArtifact.id.in_(evidence_ids)
            ).all()

            valid_evidence = [
                e for e in evidences
                if e.review_status != "rejected" and e.freshness_status != "red"
            ]

            if valid_evidence:
                covered += 1
                best_conf = max(e.confidence_score for e in valid_evidence)
                compliance_scores.append(best_conf)
            else:
                compliance_scores.append(0.0)
        else:
            compliance_scores.append(0.0)

    coverage_pct = round((covered / total) * 100, 1) if total > 0 else 0
    avg_compliance = round(sum(compliance_scores) / len(compliance_scores) * 100, 1) if compliance_scores else 0

    # Determine status
    if avg_compliance >= 90:
        status = "COMPLIANT"
    elif avg_compliance >= 70:
        status = "PARTIAL"
    elif avg_compliance > 0:
        status = "NON_COMPLIANT"
    else:
        status = "NOT_ASSESSED"

    return {
        "framework": framework,
        "total_requirements": total,
        "covered": covered,
        "coverage_pct": coverage_pct,
        "compliance_score": avg_compliance,
        "status": status,
    }


def get_overall_compliance(db: Session) -> dict:
    """Calculate overall compliance scores across all frameworks."""
    all_requirements = db.query(ComplianceRequirement).all()
    all_evidence = db.query(EvidenceArtifact).all()
    all_mappings = db.query(EvidenceMapping).all()

    total_reqs = len(all_requirements)
    if total_reqs == 0:
        return {
            "overall_compliance": 0,
            "coverage": 0,
            "missing_evidence_pct": 100,
            "high_risk_findings": 0,
            "audit_readiness": "LOW",
            "risk_score": 100,
            "framework_scores": {},
        }

    # Coverage calculation
    mapped_req_ids = set(m.requirement_id for m in all_mappings)
    covered = sum(1 for r in all_requirements if r.id in mapped_req_ids)
    coverage = round((covered / total_reqs) * 100, 1)
    missing_pct = round(100 - coverage, 1)

    # Framework scores
    framework_scores = {}
    active_frameworks = set(r.framework for r in all_requirements)
    for fw in active_frameworks:
        fw_score = get_framework_compliance(db, fw)
        framework_scores[fw] = fw_score

    # Overall compliance (weighted average of framework scores)
    fw_compliances = [fs["compliance_score"] for fs in framework_scores.values()]
    overall = round(sum(fw_compliances) / len(fw_compliances), 1) if fw_compliances else 0

    # Gaps & risk
    gaps = get_compliance_gaps(db)
    high_risk = sum(1 for g in gaps if g["severity"] in ("high", "critical"))

    # Risk score
    risk = calculate_risk_score(db)

    # Audit readiness
    if overall >= 85 and coverage >= 90:
        readiness = "HIGH"
    elif overall >= 70 and coverage >= 75:
        readiness = "MEDIUM"
    else:
        readiness = "LOW"

    return {
        "overall_compliance": overall,
        "coverage": coverage,
        "missing_evidence_pct": missing_pct,
        "high_risk_findings": high_risk,
        "audit_readiness": readiness,
        "risk_score": risk,
        "framework_scores": framework_scores,
    }
