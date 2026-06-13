import uuid
from datetime import datetime, timezone
from sqlalchemy import ForeignKey, String, Text, DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


class EvidenceArtifact(Base):
    __tablename__ = "evidence_artifacts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(100), nullable=False)  # AWS Config, CloudTrail, CSV, etc.
    framework: Mapped[str] = mapped_column(String(50), nullable=False)
    evidence_type: Mapped[str] = mapped_column(String(50), nullable=False)  # config, log, report, certificate
    content: Mapped[str] = mapped_column(Text, nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    review_status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, approved, rejected
    collected_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    reviewed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    reviewer_notes: Mapped[str] = mapped_column(Text, nullable=True)

    mappings = relationship("EvidenceMapping", back_populates="evidence", cascade="all, delete-orphan")
    reviews = relationship("EvidenceReview", cascade="all, delete-orphan")

    @property
    def freshness_days(self):
        if not self.collected_at:
            return 999
        delta = datetime.now(timezone.utc) - self.collected_at.replace(tzinfo=timezone.utc) if self.collected_at.tzinfo is None else datetime.now(timezone.utc) - self.collected_at
        return delta.days

    @property
    def freshness_status(self):
        days = self.freshness_days
        if days <= 30:
            return "green"
        elif days <= 90:
            return "yellow"
        return "red"

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "source": self.source,
            "framework": self.framework,
            "evidence_type": self.evidence_type,
            "content": self.content[:200] + "..." if self.content and len(self.content) > 200 else self.content,
            "confidence_score": self.confidence_score,
            "review_status": self.review_status,
            "status": self.review_status,
            "collected_at": self.collected_at.isoformat() if self.collected_at else None,
            "collection_date": self.collected_at.date().isoformat() if self.collected_at else None,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "reviewer_notes": self.reviewer_notes,
            "anomaly_marker": self.reviewer_notes,
            "location": self.source,
            "freshness_days": self.freshness_days,
            "freshness_status": self.freshness_status,
        }


class EvidenceReview(Base):
    __tablename__ = "evidence_reviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    evidence_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("evidence_artifacts.id", ondelete="CASCADE"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # approved, rejected
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "evidence_id": self.evidence_id,
            "status": self.status,
            "notes": self.notes,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
        }
