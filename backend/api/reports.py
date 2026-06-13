"""Reports API Routes"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from core.database import get_db
from schemas.schemas import ReportGenerateRequest, ReportResponse
from services.report_generator import (
    generate_report,
    generate_pdf_report,
    generate_json_report,
    get_all_reports,
    get_report_by_id,
)

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.post("/generate", response_model=ReportResponse)
def create_report(req: ReportGenerateRequest, db: Session = Depends(get_db)):
    """Generate a new audit report."""
    report = generate_report(db, req.title, req.report_type, req.framework)
    return ReportResponse(**report.to_dict())


@router.get("/", response_model=list[ReportResponse])
def list_reports(db: Session = Depends(get_db)):
    """List all generated reports."""
    reports = get_all_reports(db)
    return [ReportResponse(**r.to_dict()) for r in reports]


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(report_id: str, db: Session = Depends(get_db)):
    """Get a specific report."""
    report = get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return ReportResponse(**report.to_dict())


@router.get("/{report_id}/pdf")
def download_pdf_report(report_id: str, db: Session = Depends(get_db)):
    """Download the audit report as PDF."""
    pdf_bytes = generate_pdf_report(db, report_id)
    if not pdf_bytes:
        raise HTTPException(status_code=404, detail="Report not found")
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=audit_report_{report_id[:8]}.pdf"},
    )


@router.get("/{report_id}/json")
def download_json_report(report_id: str, db: Session = Depends(get_db)):
    """Download the audit report as JSON."""
    json_data = generate_json_report(db, report_id)
    if not json_data:
        raise HTTPException(status_code=404, detail="Report not found")
    return json_data
