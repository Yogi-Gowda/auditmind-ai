"""
Report Generator Service
Generates PDF and JSON audit reports.
"""

import io
import json
import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from models.audit import AuditReport, RiskFinding
from services.compliance_analyzer import get_overall_compliance, get_compliance_gaps
from services.risk_scorer import calculate_risk_score, get_risk_distribution, calculate_requirement_risk
from services.ai_narrator import generate_bulk_narratives


def generate_report(db: Session, title: str, report_type: str = "full", framework: str = None) -> AuditReport:
    """Generate a comprehensive audit report and save to DB."""
    compliance = get_overall_compliance(db)
    gaps = get_compliance_gaps(db, framework)
    risk_dist = get_risk_distribution(db)

    # Generate narratives
    narratives = generate_bulk_narratives(db, framework)

    # Build recommendations
    recommendations = _build_recommendations(gaps, compliance)

    # Build summary
    summary = _build_summary(compliance, gaps, risk_dist)

    # Create risk findings
    for gap in gaps:
        req_risk = calculate_requirement_risk(db, gap["requirement_id"])
        finding = RiskFinding(
            requirement_id=gap["requirement_id"],
            finding_type=gap["gap_type"],
            severity=gap["severity"],
            risk_score=req_risk["risk_score"],
            description=gap["details"],
            recommendation=_get_gap_recommendation(gap),
        )
        db.add(finding)

    # Create report record
    report = AuditReport(
        title=title,
        report_type=report_type,
        overall_compliance=compliance["overall_compliance"],
        coverage=compliance["coverage"],
        audit_readiness=compliance["audit_readiness"],
        risk_score=compliance["risk_score"],
        framework_scores=compliance["framework_scores"],
        summary=summary,
        recommendations=recommendations,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Update risk findings with report_id
    db.query(RiskFinding).filter(RiskFinding.report_id == None).update({"report_id": report.id})
    db.commit()

    return report


def _build_summary(compliance: dict, gaps: list, risk_dist: dict) -> str:
    """Build an executive summary."""
    return (
        f"AuditMind AI Compliance Assessment Summary\n"
        f"==========================================\n\n"
        f"Overall Compliance Score: {compliance['overall_compliance']}%\n"
        f"Evidence Coverage: {compliance['coverage']}%\n"
        f"Audit Readiness: {compliance['audit_readiness']}\n"
        f"Risk Score: {compliance['risk_score']}\n\n"
        f"Total Compliance Gaps: {len(gaps)}\n"
        f"  - Missing Evidence: {sum(1 for g in gaps if g['gap_type'] == 'missing')}\n"
        f"  - Stale Evidence: {sum(1 for g in gaps if g['gap_type'] == 'stale')}\n"
        f"  - Low Confidence: {sum(1 for g in gaps if g['gap_type'] == 'low_confidence')}\n"
        f"  - Rejected Evidence: {sum(1 for g in gaps if g['gap_type'] == 'rejected')}\n\n"
        f"Risk Distribution:\n"
        f"  - Critical: {risk_dist.get('critical', 0)}\n"
        f"  - High: {risk_dist.get('high', 0)}\n"
        f"  - Medium: {risk_dist.get('medium', 0)}\n"
        f"  - Low: {risk_dist.get('low', 0)}\n"
    )


def _build_recommendations(gaps: list, compliance: dict) -> str:
    """Build recommendations based on gaps."""
    recs = []
    missing = sum(1 for g in gaps if g["gap_type"] == "missing")
    stale = sum(1 for g in gaps if g["gap_type"] == "stale")
    low_conf = sum(1 for g in gaps if g["gap_type"] == "low_confidence")
    rejected = sum(1 for g in gaps if g["gap_type"] == "rejected")

    if missing > 0:
        recs.append(f"1. CRITICAL: Collect evidence for {missing} requirements with no supporting evidence.")
    if stale > 0:
        recs.append(f"2. HIGH: Refresh {stale} evidence artifacts that are older than 90 days.")
    if low_conf > 0:
        recs.append(f"3. MEDIUM: Strengthen {low_conf} evidence artifacts with low confidence scores.")
    if rejected > 0:
        recs.append(f"4. HIGH: Address {rejected} rejected evidence artifacts and re-collect.")
    if compliance["coverage"] < 90:
        recs.append(f"5. Increase evidence coverage from {compliance['coverage']}% to target 90%+.")
    if compliance["overall_compliance"] < 85:
        recs.append(f"6. Improve overall compliance from {compliance['overall_compliance']}% to target 85%+.")

    if not recs:
        recs.append("No critical recommendations. Continue monitoring compliance status.")

    return "\n".join(recs)


def _get_gap_recommendation(gap: dict) -> str:
    """Get specific recommendation for a gap."""
    recs = {
        "missing": "Collect and upload supporting evidence for this requirement immediately.",
        "stale": "Refresh the evidence artifact with a current version.",
        "low_confidence": "Strengthen evidence quality or collect additional supporting artifacts.",
        "rejected": "Review the rejection reason and collect new valid evidence.",
    }
    return recs.get(gap["gap_type"], "Review and address this compliance gap.")


def generate_pdf_report(db: Session, report_id: str) -> bytes:
    """Generate a PDF version of the audit report."""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.colors import HexColor
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    )

    report = db.query(AuditReport).filter(AuditReport.id == report_id).first()
    if not report:
        return None

    findings = db.query(RiskFinding).filter(RiskFinding.report_id == report_id).all()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.75 * inch, bottomMargin=0.75 * inch)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=24,
        textColor=HexColor("#1a1a2e"),
        spaceAfter=20,
    )
    heading_style = ParagraphStyle(
        "CustomHeading",
        parent=styles["Heading1"],
        fontSize=16,
        textColor=HexColor("#16213e"),
        spaceAfter=12,
    )
    subheading_style = ParagraphStyle(
        "CustomSubHeading",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=HexColor("#0f3460"),
        spaceAfter=8,
    )
    body_style = ParagraphStyle(
        "CustomBody",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        spaceAfter=8,
    )

    elements = []

    # Title
    elements.append(Paragraph("AuditMind AI", title_style))
    elements.append(Paragraph("Automated Compliance Audit Report", heading_style))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(f"Report: {report.title}", body_style))
    elements.append(Paragraph(f"Generated: {report.generated_at.strftime('%d %B %Y, %H:%M UTC') if report.generated_at else 'N/A'}", body_style))
    elements.append(Paragraph(f"Type: {report.report_type.title()}", body_style))
    elements.append(Spacer(1, 20))

    # Executive Summary
    elements.append(Paragraph("Executive Summary", heading_style))
    score_data = [
        ["Metric", "Value"],
        ["Overall Compliance", f"{report.overall_compliance}%"],
        ["Evidence Coverage", f"{report.coverage}%"],
        ["Audit Readiness", report.audit_readiness],
        ["Risk Score", f"{report.risk_score}"],
    ]
    score_table = Table(score_data, colWidths=[3 * inch, 3 * inch])
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#1a1a2e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#f8f9fa"), HexColor("#ffffff")]),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
    ]))
    elements.append(score_table)
    elements.append(Spacer(1, 20))

    # Framework Status
    if report.framework_scores:
        elements.append(Paragraph("Framework Compliance Status", heading_style))
        fw_data = [["Framework", "Score", "Coverage", "Status"]]
        for fw, data in report.framework_scores.items():
            if isinstance(data, dict):
                fw_data.append([
                    fw,
                    f"{data.get('compliance_score', 0)}%",
                    f"{data.get('coverage_pct', 0)}%",
                    data.get("status", "N/A"),
                ])
        if len(fw_data) > 1:
            fw_table = Table(fw_data, colWidths=[2 * inch, 1.5 * inch, 1.5 * inch, 1.5 * inch])
            fw_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), HexColor("#0f3460")),
                ("TEXTCOLOR", (0, 0), (-1, 0), HexColor("#ffffff")),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cccccc")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#f8f9fa"), HexColor("#ffffff")]),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ]))
            elements.append(fw_table)
            elements.append(Spacer(1, 20))

    # Risk Findings
    if findings:
        elements.append(Paragraph("Risk Findings", heading_style))
        for i, f in enumerate(findings[:20], 1):  # Limit to top 20
            elements.append(Paragraph(
                f"<b>{i}. [{f.severity.upper()}]</b> {f.finding_type.replace('_', ' ').title()} — {f.description or 'No description'}",
                body_style,
            ))
        elements.append(Spacer(1, 15))

    # Recommendations
    if report.recommendations:
        elements.append(Paragraph("Recommendations", heading_style))
        for line in report.recommendations.split("\n"):
            if line.strip():
                elements.append(Paragraph(line.strip(), body_style))
        elements.append(Spacer(1, 15))

    # Footer
    elements.append(Spacer(1, 30))
    elements.append(Paragraph(
        "This report was generated by AuditMind AI — Automated Compliance Evidence Collection & Audit Intelligence.",
        ParagraphStyle("Footer", parent=body_style, fontSize=8, textColor=HexColor("#888888")),
    ))

    doc.build(elements)
    return buffer.getvalue()


def generate_json_report(db: Session, report_id: str) -> dict:
    """Generate a JSON version of the audit report."""
    report = db.query(AuditReport).filter(AuditReport.id == report_id).first()
    if not report:
        return None

    findings = db.query(RiskFinding).filter(RiskFinding.report_id == report_id).all()

    return {
        "report": report.to_dict(),
        "findings": [f.to_dict() for f in findings],
        "narratives": generate_bulk_narratives(db),
    }


def get_all_reports(db: Session) -> list:
    """Get all generated reports."""
    return db.query(AuditReport).order_by(AuditReport.generated_at.desc()).all()


def get_report_by_id(db: Session, report_id: str) -> Optional[AuditReport]:
    """Get a specific report."""
    return db.query(AuditReport).filter(AuditReport.id == report_id).first()
