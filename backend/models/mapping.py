import uuid
from datetime import datetime, timezone
from sqlalchemy import ForeignKey, String, Text, DateTime, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


class EvidenceMapping(Base):
    __tablename__ = "evidence_mappings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requirement_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("compliance_requirements.id", ondelete="CASCADE"),
        nullable=False,
    )
    evidence_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("evidence_artifacts.id", ondelete="CASCADE"),
        nullable=False,
    )
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    mapping_type: Mapped[str] = mapped_column(String(20), default="auto")  # auto, manual
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    requirement = relationship("ComplianceRequirement", back_populates="mappings")
    evidence = relationship("EvidenceArtifact", back_populates="mappings")

    def to_dict(self):
        return {
            "id": self.id,
            "requirement_id": self.requirement_id,
            "evidence_id": self.evidence_id,
            "requirement_text": self.requirement.requirement_text if self.requirement else None,
            "evidence_title": self.evidence.title if self.evidence else None,
            "confidence": self.confidence,
            "mapping_type": self.mapping_type,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
