import uuid
from datetime import datetime, timezone
from sqlalchemy import ForeignKey, String, Text, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base


class PolicyDocument(Base):
    __tablename__ = "policy_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    framework: Mapped[str] = mapped_column(String(50), nullable=False)  # GDPR, SOX, NIST, etc.
    content: Mapped[str] = mapped_column(Text, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    requirements = relationship("ComplianceRequirement", back_populates="policy", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "framework": self.framework,
            "content": self.content[:200] + "..." if len(self.content) > 200 else self.content,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "requirement_count": len(self.requirements) if self.requirements else 0,
        }


class ComplianceRequirement(Base):
    __tablename__ = "compliance_requirements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    policy_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("policy_documents.id", ondelete="CASCADE"),
        nullable=False,
    )
    framework: Mapped[str] = mapped_column(String(50), nullable=False)
    requirement_text: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)  # encryption, access_control, etc.
    control_standard: Mapped[str] = mapped_column(String(100), nullable=True)  # AES-256, TLS 1.2, etc.
    severity: Mapped[str] = mapped_column(String(20), default="medium")  # low, medium, high, critical
    status: Mapped[str] = mapped_column(String(20), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    policy = relationship("PolicyDocument", back_populates="requirements")
    mappings = relationship("EvidenceMapping", back_populates="requirement", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "policy_id": self.policy_id,
            "framework": self.framework,
            "requirement_text": self.requirement_text,
            "category": self.category,
            "control_standard": self.control_standard,
            "severity": self.severity,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "evidence_count": len(self.mappings) if self.mappings else 0,
        }
