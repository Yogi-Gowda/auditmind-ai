"""
AI Narrative Generator
Generates auditor-friendly compliance narratives.
Supports mock mode (template-based) and OpenAI mode.
"""

import asyncio
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from models.requirement import ComplianceRequirement
from models.evidence import EvidenceArtifact
from models.mapping import EvidenceMapping
from core.config import AI_MODE, OPENAI_API_KEY


# --- Narrative templates ---
COMPLIANT_TEMPLATES = [
    "The organization {action} using {standard}. Evidence was verified on {date}. "
    "This satisfies {framework} {category} requirements. Status: COMPLIANT. Confidence: {confidence}%.",

    "{framework} requirement for {category} is met. The control implements {standard} "
    "as evidenced by {evidence_title}, collected on {date}. "
    "Audit assessment: COMPLIANT with {confidence}% confidence.",

    "Compliance verification confirms that {category} controls are in place per {framework} standards. "
    "{evidence_title} demonstrates adherence to {standard} specifications. "
    "Last verified: {date}. Assessment: COMPLIANT ({confidence}% confidence).",
]

PARTIAL_TEMPLATES = [
    "Partial compliance detected for {framework} {category} requirement. "
    "While {evidence_title} provides supporting evidence (confidence: {confidence}%), "
    "additional evidence may be needed to fully satisfy {standard} requirements. "
    "Status: PARTIAL. Recommendation: Strengthen evidence coverage.",

    "{framework} {category} controls show partial implementation. "
    "Current evidence ({evidence_title}) has {confidence}% confidence. "
    "Assessment: PARTIAL COMPLIANCE. Consider collecting additional verification data.",
]

NON_COMPLIANT_TEMPLATES = [
    "Non-compliance identified for {framework} {category} requirement. "
    "No valid supporting evidence found for {standard} implementation. "
    "Status: NON_COMPLIANT. Immediate action required: Collect and upload relevant evidence artifacts.",

    "{framework} {category} requirement is currently unmet. "
    "Missing evidence for {standard} controls. Risk level: HIGH. "
    "Recommendation: Implement required controls and document compliance evidence.",
]

CATEGORY_ACTIONS = {
    "encryption": "encrypts sensitive data at rest and in transit",
    "access_control": "implements role-based access controls and authentication mechanisms",
    "data_protection": "maintains data protection and privacy safeguards",
    "logging_monitoring": "maintains comprehensive logging and monitoring capabilities",
    "incident_response": "has established incident response and breach notification procedures",
    "network_security": "maintains network security controls including firewalls and segmentation",
    "risk_management": "conducts regular risk assessments and vulnerability management",
    "compliance": "maintains compliance governance and policy controls",
    "physical_security": "implements physical security controls for facilities",
    "training": "conducts security awareness training programs",
}


def _generate_mock_narrative(
    requirement: ComplianceRequirement,
    evidences: List[EvidenceArtifact],
    confidence: float,
) -> dict:
    """Generate a narrative using templates (mock mode)."""
    import random

    action = CATEGORY_ACTIONS.get(requirement.category, "implements required controls")
    standard = requirement.control_standard or requirement.category.replace("_", " ").title()
    framework = requirement.framework

    if evidences:
        best_evidence = max(evidences, key=lambda e: e.confidence_score)
        evidence_title = best_evidence.title
        date = best_evidence.collected_at.strftime("%d-%b-%Y") if best_evidence.collected_at else "N/A"
    else:
        evidence_title = "N/A"
        date = "N/A"

    conf_pct = round(confidence * 100)

    if confidence >= 0.80 and evidences:
        templates = COMPLIANT_TEMPLATES
        status = "COMPLIANT"
    elif confidence >= 0.50 and evidences:
        templates = PARTIAL_TEMPLATES
        status = "PARTIAL"
    else:
        templates = NON_COMPLIANT_TEMPLATES
        status = "NON_COMPLIANT"

    template = random.choice(templates)
    narrative = template.format(
        action=action,
        standard=standard,
        framework=framework,
        category=requirement.category.replace("_", " "),
        evidence_title=evidence_title,
        date=date,
        confidence=conf_pct,
    )

    return {
        "requirement_id": requirement.id,
        "requirement_text": requirement.requirement_text,
        "framework": framework,
        "narrative": narrative,
        "status": status,
        "confidence": confidence,
    }


async def _generate_openai_narrative(
    requirement: ComplianceRequirement,
    evidences: List[EvidenceArtifact],
    confidence: float,
) -> dict:
    """Generate a narrative using OpenAI API."""
    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=OPENAI_API_KEY)

        evidence_summary = "\n".join([
            f"- {e.title} (Source: {e.source}, Confidence: {e.confidence_score:.0%}, "
            f"Collected: {e.collected_at}, Status: {e.review_status})"
            for e in evidences
        ]) if evidences else "No evidence found."

        prompt = f"""You are a compliance auditor writing a professional audit narrative.

Requirement: {requirement.requirement_text}
Framework: {requirement.framework}
Category: {requirement.category}
Control Standard: {requirement.control_standard or 'N/A'}

Supporting Evidence:
{evidence_summary}

Overall Confidence: {confidence:.0%}

Write a concise, professional audit narrative (2-3 sentences) that:
1. Describes the compliance status for this requirement
2. References the evidence found
3. Provides the compliance status (COMPLIANT, PARTIAL, or NON_COMPLIANT)
4. States the confidence level

Be factual and auditor-friendly."""

        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
            temperature=0.3,
        )

        narrative = response.choices[0].message.content.strip()

        if confidence >= 0.80 and evidences:
            status = "COMPLIANT"
        elif confidence >= 0.50 and evidences:
            status = "PARTIAL"
        else:
            status = "NON_COMPLIANT"

        return {
            "requirement_id": requirement.id,
            "requirement_text": requirement.requirement_text,
            "framework": requirement.framework,
            "narrative": narrative,
            "status": status,
            "confidence": confidence,
        }
    except Exception as e:
        # Fallback to mock on error
        return _generate_mock_narrative(requirement, evidences, confidence)


def generate_narrative(db: Session, requirement_id: str) -> dict:
    """Generate a compliance narrative for a requirement."""
    requirement = db.query(ComplianceRequirement).filter(
        ComplianceRequirement.id == requirement_id
    ).first()

    if not requirement:
        return {"error": "Requirement not found"}

    # Get mapped evidence
    mappings = db.query(EvidenceMapping).filter(
        EvidenceMapping.requirement_id == requirement_id
    ).all()

    evidences = []
    confidence = 0.0
    if mappings:
        evidence_ids = [m.evidence_id for m in mappings]
        evidences = db.query(EvidenceArtifact).filter(
            EvidenceArtifact.id.in_(evidence_ids)
        ).all()
        # Filter valid evidence
        valid = [e for e in evidences if e.review_status != "rejected" and e.freshness_status != "red"]
        if valid:
            confidence = sum(e.confidence_score for e in valid) / len(valid)
        evidences = valid if valid else evidences

    if AI_MODE.lower() == "openai" and OPENAI_API_KEY:
        try:
            return asyncio.run(_generate_openai_narrative(requirement, evidences, confidence))
        except RuntimeError:
            return _generate_mock_narrative(requirement, evidences, confidence)

    return _generate_mock_narrative(requirement, evidences, confidence)


def generate_bulk_narratives(db: Session, framework: str = None) -> List[dict]:
    """Generate narratives for all requirements (optionally filtered by framework)."""
    query = db.query(ComplianceRequirement)
    if framework:
        query = query.filter(ComplianceRequirement.framework == framework)
    requirements = query.all()

    narratives = []
    for req in requirements:
        narrative = generate_narrative(db, req.id)
        narratives.append(narrative)

    return narratives
