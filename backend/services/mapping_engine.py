"""
Evidence Mapping Engine
Automatically maps evidence artifacts to compliance requirements.
"""

import re
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from models.requirement import ComplianceRequirement
from models.evidence import EvidenceArtifact
from models.mapping import EvidenceMapping


# Keyword mappings between categories and evidence types
CATEGORY_EVIDENCE_KEYWORDS = {
    "encryption": [
        "encrypt", "kms", "key", "aes", "tls", "ssl", "cipher", "crypto",
        "certificate", "key rotation", "at rest", "in transit",
    ],
    "access_control": [
        "access", "iam", "role", "permission", "authentication", "mfa",
        "password", "login", "identity", "rbac", "sso", "privilege",
    ],
    "data_protection": [
        "data", "backup", "retention", "classification", "dlp",
        "privacy", "anonymi", "mask", "pii", "sensitive",
    ],
    "logging_monitoring": [
        "log", "monitor", "cloudtrail", "audit", "siem", "alert",
        "event", "detection", "watch", "metric",
    ],
    "incident_response": [
        "incident", "breach", "response", "recovery", "disaster",
        "notification", "forensic", "escalation",
    ],
    "network_security": [
        "network", "firewall", "vpc", "security group", "waf",
        "intrusion", "vpn", "segment", "ingress", "egress",
    ],
    "risk_management": [
        "risk", "vulnerability", "scan", "penetration", "assessment",
        "threat", "patch", "remediat",
    ],
    "compliance": [
        "compliance", "audit", "policy", "governance", "control",
        "framework", "regulation",
    ],
    "physical_security": [
        "physical", "facility", "badge", "camera", "visitor",
    ],
    "training": [
        "training", "awareness", "education", "phishing",
    ],
}


def _compute_keyword_score(text1: str, text2: str, keywords: List[str]) -> float:
    """Compute a keyword matching score between two texts."""
    t1 = text1.lower()
    t2 = text2.lower()
    combined = t1 + " " + t2

    matches = sum(1 for kw in keywords if kw in combined)
    if not keywords:
        return 0.0
    return min(matches / max(len(keywords) * 0.3, 1), 1.0)


def _compute_mapping_confidence(requirement: ComplianceRequirement, evidence: EvidenceArtifact) -> float:
    """
    Compute confidence score for a requirement-evidence mapping.
    Uses framework match, category keywords, and text similarity.
    """
    score = 0.0

    # Framework match (30%)
    if requirement.framework == evidence.framework:
        score += 0.30
    elif requirement.framework in (evidence.framework or "") or (evidence.framework or "") in requirement.framework:
        score += 0.15

    # Category keyword matching (40%)
    category = requirement.category
    if category in CATEGORY_EVIDENCE_KEYWORDS:
        keywords = CATEGORY_EVIDENCE_KEYWORDS[category]
        evidence_text = f"{evidence.title} {evidence.description or ''} {evidence.content or ''}"
        req_text = requirement.requirement_text
        kw_score = _compute_keyword_score(req_text, evidence_text, keywords)
        score += kw_score * 0.40

    # Control standard match (20%)
    if requirement.control_standard:
        std_lower = requirement.control_standard.lower()
        evidence_text = f"{evidence.title} {evidence.description or ''} {evidence.content or ''}".lower()
        if std_lower in evidence_text:
            score += 0.20
        elif any(part in evidence_text for part in std_lower.split("-")):
            score += 0.10

    # Evidence quality bonus (10%)
    if evidence.review_status == "approved":
        score += 0.05
    if evidence.confidence_score > 0.8:
        score += 0.05

    return round(min(score, 1.0), 2)


def auto_map_evidence(db: Session) -> List[EvidenceMapping]:
    """
    Automatically map all evidence to requirements.
    Clears existing auto-mappings and regenerates.
    """
    # Clear existing auto-mappings
    db.query(EvidenceMapping).filter(EvidenceMapping.mapping_type == "auto").delete()
    db.flush()

    requirements = db.query(ComplianceRequirement).all()
    evidences = db.query(EvidenceArtifact).all()

    mappings = []
    for req in requirements:
        for ev in evidences:
            confidence = _compute_mapping_confidence(req, ev)
            if confidence >= 0.25:  # Minimum threshold
                mapping = EvidenceMapping(
                    requirement_id=req.id,
                    evidence_id=ev.id,
                    confidence=confidence,
                    mapping_type="auto",
                    notes=f"Auto-mapped with {confidence:.0%} confidence",
                )
                db.add(mapping)
                mappings.append(mapping)

    db.commit()
    return mappings


def create_manual_mapping(
    db: Session,
    requirement_id: str,
    evidence_id: str,
    notes: str = None,
) -> EvidenceMapping:
    """Create a manual evidence-to-requirement mapping."""
    mapping = EvidenceMapping(
        requirement_id=requirement_id,
        evidence_id=evidence_id,
        confidence=1.0,
        mapping_type="manual",
        notes=notes or "Manually mapped by user",
    )
    db.add(mapping)
    db.commit()
    db.refresh(mapping)
    return mapping


def get_mappings_for_requirement(db: Session, requirement_id: str) -> List[EvidenceMapping]:
    """Get all evidence mappings for a requirement."""
    return db.query(EvidenceMapping).filter(
        EvidenceMapping.requirement_id == requirement_id
    ).all()


def get_mappings_for_evidence(db: Session, evidence_id: str) -> List[EvidenceMapping]:
    """Get all requirement mappings for an evidence."""
    return db.query(EvidenceMapping).filter(
        EvidenceMapping.evidence_id == evidence_id
    ).all()


def get_all_mappings(db: Session) -> List[EvidenceMapping]:
    """Get all mappings."""
    return db.query(EvidenceMapping).all()


def delete_mapping(db: Session, mapping_id: str) -> bool:
    """Delete a mapping."""
    mapping = db.query(EvidenceMapping).filter(EvidenceMapping.id == mapping_id).first()
    if not mapping:
        return False
    db.delete(mapping)
    db.commit()
    return True
