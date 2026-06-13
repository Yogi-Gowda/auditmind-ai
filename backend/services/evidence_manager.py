"""
Evidence Manager Service
Handles evidence upload, tracking, freshness, and review status.
"""

import csv
import io
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from models.evidence import EvidenceArtifact, EvidenceReview
from services.policy_parser import normalize_framework


STATUS_ALIASES = {
    "approved": "approved",
    "rejected": "rejected",
    "pending": "pending",
    "pending_review": "pending",
    "needs_update": "pending",
    "needs review": "pending",
}


def normalize_review_status(status: str) -> str:
    """Normalize review status variants from CSV/UI/API input."""
    if not status:
        return "pending"
    return STATUS_ALIASES.get(status.strip().lower(), "pending")


def parse_datetime(value: str) -> datetime:
    """Parse ISO or YYYY-MM-DD timestamps, falling back to current UTC."""
    if not value:
        return datetime.now(timezone.utc)
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        try:
            return datetime.strptime(value, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except (ValueError, TypeError):
            return datetime.now(timezone.utc)


def parse_confidence(value, default: float = 0.85) -> float:
    """Parse confidence and keep it within a 0-1 range."""
    try:
        confidence = float(value)
    except (TypeError, ValueError):
        confidence = default
    return max(0.0, min(confidence, 1.0))


def upload_evidence(
    db: Session,
    title: str,
    source: str,
    framework: str,
    evidence_type: str,
    description: str = None,
    content: str = None,
    confidence_score: float = 0.85,
    collected_at: str = None,
    review_status: str = "pending",
    evidence_id: str = None,
) -> EvidenceArtifact:
    """Upload a single evidence artifact."""
    evidence_data = {
        "title": title,
        "description": description,
        "source": source,
        "framework": normalize_framework(framework),
        "evidence_type": evidence_type,
        "content": content,
        "confidence_score": parse_confidence(confidence_score),
        "review_status": normalize_review_status(review_status),
        "collected_at": parse_datetime(collected_at),
    }
    if evidence_id:
        evidence_data["id"] = evidence_id

    evidence = EvidenceArtifact(**evidence_data)
    db.add(evidence)
    db.commit()
    db.refresh(evidence)
    return evidence


def upload_evidence_bulk(db: Session, evidences: list) -> List[EvidenceArtifact]:
    """Upload multiple evidence artifacts."""
    results = []
    for ev in evidences:
        result = upload_evidence(
            db=db,
            title=ev.title,
            source=ev.source,
            framework=ev.framework,
            evidence_type=ev.evidence_type,
            description=ev.description,
            content=ev.content,
            confidence_score=ev.confidence_score,
            collected_at=ev.collected_at,
            review_status=getattr(ev, "review_status", "pending"),
        )
        results.append(result)
    return results


def upload_evidence_csv(db: Session, csv_content: str) -> List[EvidenceArtifact]:
    """Parse CSV content and upload evidence artifacts."""
    reader = csv.DictReader(io.StringIO(csv_content))
    results = []
    for row in reader:
        evidence_id = row.get("evidence_id") or None
        existing = get_evidence_by_id(db, evidence_id) if evidence_id else None
        evidence_type = row.get("evidence_type") or row.get("type") or "Report"

        evidence_data = dict(
            title=row.get("title") or f"{evidence_type.replace('_', ' ')} ({evidence_id or 'CSV'})",
            source=row.get("source") or row.get("evidence_location") or "CSV Import",
            framework=normalize_framework(row.get("framework", "General")),
            evidence_type=evidence_type,
            description=row.get("description") or row.get("evidence_summary") or "",
            content=row.get("content") or (
                f"Requirement linked: {row.get('requirement_description', 'N/A')}\n"
                f"Collected by: {row.get('collected_by', 'Unknown')} ({row.get('collector_email', 'N/A')})"
            ),
            confidence_score=parse_confidence(row.get("confidence_score", row.get("confidence", 0.85))),
            review_status=normalize_review_status(row.get("status")),
            collected_at=parse_datetime(row.get("collected_at") or row.get("collection_date") or row.get("timestamp")),
            reviewed_at=parse_datetime(row.get("review_date")) if row.get("review_date") else None,
            reviewer_notes=row.get("anomaly_marker") or None,
        )

        if existing:
            for field, value in evidence_data.items():
                setattr(existing, field, value)
            evidence = existing
        else:
            if evidence_id:
                evidence_data["id"] = evidence_id
            evidence = EvidenceArtifact(**evidence_data)
            db.add(evidence)

        results.append(evidence)

    db.commit()
    for evidence in results:
        db.refresh(evidence)
    return results


def get_all_evidence(
    db: Session,
    framework: str = None,
    review_status: str = None,
    freshness: str = None,
    source: str = None,
) -> List[EvidenceArtifact]:
    """Get evidence artifacts with optional filters."""
    query = db.query(EvidenceArtifact)
    if framework:
        query = query.filter(EvidenceArtifact.framework == normalize_framework(framework))
    if review_status:
        query = query.filter(EvidenceArtifact.review_status == normalize_review_status(review_status))
    if source:
        query = query.filter(EvidenceArtifact.source == source)

    results = query.all()

    # Filter by freshness status after query (computed property)
    if freshness:
        results = [e for e in results if e.freshness_status == freshness]

    return results


def get_evidence_by_id(db: Session, evidence_id: str) -> Optional[EvidenceArtifact]:
    """Get a specific evidence artifact."""
    return db.query(EvidenceArtifact).filter(EvidenceArtifact.id == evidence_id).first()


def review_evidence(
    db: Session,
    evidence_id: str,
    status: str,
    notes: str = None,
) -> Optional[EvidenceArtifact]:
    """Review an evidence artifact (approve or reject)."""
    evidence = get_evidence_by_id(db, evidence_id)
    if not evidence:
        return None

    evidence.review_status = normalize_review_status(status)
    evidence.reviewed_at = datetime.now(timezone.utc)
    evidence.reviewer_notes = notes

    # Create review record
    review = EvidenceReview(
        evidence_id=evidence_id,
        status=evidence.review_status,
        notes=notes,
    )
    db.add(review)
    db.commit()
    db.refresh(evidence)
    return evidence


def delete_evidence(db: Session, evidence_id: str) -> bool:
    """Delete an evidence artifact."""
    evidence = get_evidence_by_id(db, evidence_id)
    if not evidence:
        return False
    db.delete(evidence)
    db.commit()
    return True


def get_evidence_stats(db: Session) -> dict:
    """Get aggregate evidence statistics."""
    all_evidence = db.query(EvidenceArtifact).all()
    total = len(all_evidence)
    if total == 0:
        return {
            "total": 0,
            "approved": 0,
            "rejected": 0,
            "pending": 0,
            "fresh": 0,
            "aging": 0,
            "stale": 0,
            "avg_confidence": 0,
        }

    approved = sum(1 for e in all_evidence if e.review_status == "approved")
    rejected = sum(1 for e in all_evidence if e.review_status == "rejected")
    pending = sum(1 for e in all_evidence if e.review_status == "pending")
    fresh = sum(1 for e in all_evidence if e.freshness_status == "green")
    aging = sum(1 for e in all_evidence if e.freshness_status == "yellow")
    stale = sum(1 for e in all_evidence if e.freshness_status == "red")
    avg_conf = sum(e.confidence_score for e in all_evidence) / total

    return {
        "total": total,
        "approved": approved,
        "rejected": rejected,
        "pending": pending,
        "fresh": fresh,
        "aging": aging,
        "stale": stale,
        "avg_confidence": round(avg_conf, 2),
    }
