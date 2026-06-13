import uuid
from datetime import datetime, timezone
from sqlalchemy import ForeignKey, String, Text, DateTime, Float, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column
from core.database import Base


class AuditReport(Base):
    __tablename__ = "audit_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    report_type: Mapped[str] = mapped_column(String(20), default="full")  # full, executive, framework
    overall_compliance: Mapped[float] = mapped_column(Float, default=0.0)
    coverage: Mapped[float] = mapped_column(Float, default=0.0)
    audit_readiness: Mapped[str] = mapped_column(String(20), default="LOW")
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    framework_scores: Mapped[dict] = mapped_column(JSON, nullable=True)
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    recommendations: Mapped[str] = mapped_column(Text, nullable=True)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "report_type": self.report_type,
            "overall_compliance": self.overall_compliance,
            "coverage": self.coverage,
            "audit_readiness": self.audit_readiness,
            "risk_score": self.risk_score,
            "framework_scores": self.framework_scores,
            "summary": self.summary,
            "recommendations": self.recommendations,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
        }


class RiskFinding(Base):
    __tablename__ = "risk_findings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("audit_reports.id", ondelete="CASCADE"),
        nullable=True,
    )
    requirement_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("compliance_requirements.id", ondelete="CASCADE"),
        nullable=False,
    )
    finding_type: Mapped[str] = mapped_column(String(50), nullable=False)  # missing_evidence, stale_evidence, low_confidence, rejected
    severity: Mapped[str] = mapped_column(String(20), nullable=False)  # low, medium, high, critical
    risk_score: Mapped[float] = mapped_column(Float, default=0.0)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    recommendation: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "report_id": self.report_id,
            "requirement_id": self.requirement_id,
            "finding_type": self.finding_type,
            "severity": self.severity,
            "risk_score": self.risk_score,
            "description": self.description,
            "recommendation": self.recommendation,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
