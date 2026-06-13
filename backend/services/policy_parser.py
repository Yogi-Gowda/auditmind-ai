"""
Policy Parser Service
Parses compliance policy documents and extracts structured requirements.
"""

import re
from typing import List, Tuple
from sqlalchemy.orm import Session
from models.requirement import PolicyDocument, ComplianceRequirement


# --- Framework detection patterns ---
FRAMEWORK_ALIASES = {
    "ISO27001": "ISO 27001",
    "ISO-27001": "ISO 27001",
    "PCI DSS": "PCI-DSS",
    "PCIDSS": "PCI-DSS",
}


FRAMEWORK_PATTERNS = {
    "GDPR": [
        r"gdpr", r"general data protection", r"data protection regulation",
        r"personal data", r"data subject", r"right to erasure", r"data portability",
        r"article\s+\d+", r"eu regulation",
    ],
    "SOX": [
        r"sox", r"sarbanes[- ]oxley", r"financial reporting", r"internal controls",
        r"section\s+404", r"audit trail", r"financial integrity",
    ],
    "HIPAA": [
        r"hipaa", r"health insurance portability", r"protected health information",
        r"phi\b", r"ephi", r"covered entity", r"business associate",
    ],
    "NIST": [
        r"nist", r"sp\s+800", r"cybersecurity framework", r"csf",
        r"nist\s+\w{2}-\d+", r"risk management framework",
    ],
    "ISO 27001": [
        r"iso\s*27001", r"isms", r"information security management",
        r"annex\s+a", r"iso\s*27002",
    ],
    "PCI-DSS": [
        r"pci[- ]?dss", r"payment card industry", r"cardholder data",
        r"card data environment", r"pci compliance",
    ],
}


METADATA_LINE_PATTERN = re.compile(
    r"^(responsible|scope|evidence source|audit frequency|compliance mapping|"
    r"policy_id|version|status|last_updated)\s*:",
    re.IGNORECASE,
)

# --- Category classification patterns ---
CATEGORY_PATTERNS = {
    "encryption": [
        r"encrypt", r"aes", r"rsa", r"tls", r"ssl", r"cipher",
        r"cryptograph", r"key management", r"kms", r"at rest", r"in transit",
    ],
    "access_control": [
        r"access control", r"authentication", r"authorization", r"rbac",
        r"mfa", r"multi[- ]factor", r"least privilege", r"password",
        r"identity", r"iam", r"single sign",
    ],
    "data_protection": [
        r"data protection", r"data privacy", r"data retention",
        r"data classification", r"data loss prevention", r"dlp",
        r"backup", r"data integrity", r"anonymi", r"pseudonymi",
    ],
    "logging_monitoring": [
        r"log", r"monitor", r"audit trail", r"siem", r"alert",
        r"detection", r"surveillance", r"tracking", r"event management",
    ],
    "incident_response": [
        r"incident", r"breach", r"notification", r"response plan",
        r"disaster recovery", r"business continuity", r"forensic",
    ],
    "network_security": [
        r"network", r"firewall", r"intrusion", r"vpn", r"segmentation",
        r"perimeter", r"dmz", r"ids", r"ips",
    ],
    "risk_management": [
        r"risk assessment", r"risk management", r"vulnerability",
        r"threat", r"penetration test", r"security assessment",
    ],
    "compliance": [
        r"compliance", r"audit", r"regulation", r"policy", r"governance",
        r"framework", r"control", r"assessment",
    ],
    "physical_security": [
        r"physical", r"facility", r"badge", r"cctv", r"visitor",
    ],
    "training": [
        r"training", r"awareness", r"education", r"phishing simulation",
    ],
}

# --- Control standard patterns ---
CONTROL_PATTERNS = {
    "AES-256": [r"aes[- ]?256"],
    "AES-128": [r"aes[- ]?128"],
    "TLS 1.2": [r"tls\s*1\.2"],
    "TLS 1.3": [r"tls\s*1\.3"],
    "RSA-2048": [r"rsa[- ]?2048"],
    "SHA-256": [r"sha[- ]?256"],
    "MFA": [r"multi[- ]factor authentication", r"\bmfa\b"],
    "RBAC": [r"role[- ]based access", r"\brbac\b"],
    "SOC 2": [r"soc\s*2"],
    "FIPS 140-2": [r"fips\s*140"],
}

# Severity keywords
SEVERITY_KEYWORDS = {
    "critical": [r"must", r"shall", r"mandatory", r"critical", r"immediately"],
    "high": [r"required", r"necessary", r"essential", r"important"],
    "medium": [r"should", r"recommended", r"expected"],
    "low": [r"may", r"optional", r"consider", r"suggested"],
}


def normalize_framework(framework: str) -> str:
    """Normalize common framework spelling variants used across seed files."""
    if not framework:
        return "General"
    cleaned = framework.strip()
    return FRAMEWORK_ALIASES.get(cleaned.upper(), cleaned)


def detect_framework(text: str) -> str:
    """Detect the compliance framework from text content."""
    text_lower = text.lower()
    scores = {}
    for framework, patterns in FRAMEWORK_PATTERNS.items():
        score = sum(1 for p in patterns if re.search(p, text_lower))
        if score > 0:
            scores[framework] = score
    if scores:
        return normalize_framework(max(scores, key=scores.get))
    return "General"


def classify_category(text: str) -> str:
    """Classify a requirement into a category."""
    text_lower = text.lower()
    scores = {}
    for category, patterns in CATEGORY_PATTERNS.items():
        score = sum(1 for p in patterns if re.search(p, text_lower))
        if score > 0:
            scores[category] = score
    if scores:
        return max(scores, key=scores.get)
    return "compliance"


def detect_control_standard(text: str) -> str:
    """Detect specific control standards mentioned."""
    text_lower = text.lower()
    for standard, patterns in CONTROL_PATTERNS.items():
        for p in patterns:
            if re.search(p, text_lower):
                return standard
    return None


def assess_severity(text: str) -> str:
    """Assess severity based on keywords."""
    text_lower = text.lower()
    for severity, keywords in SEVERITY_KEYWORDS.items():
        for kw in keywords:
            if re.search(kw, text_lower):
                return severity
    return "medium"


def split_requirements_legacy(text: str) -> List[str]:
    """Split policy text into individual requirement statements."""
    requirements = []

    # Split by numbered items (1., 2., etc.)
    numbered = re.split(r'\n\s*\d+[\.\)]\s+', text)
    if len(numbered) > 1:
        requirements.extend([r.strip() for r in numbered[1:] if r.strip()])
    else:
        # Split by bullet points
        bulleted = re.split(r'\n\s*[\-\*\•]\s+', text)
        if len(bulleted) > 1:
            requirements.extend([r.strip() for r in bulleted[1:] if r.strip()])
        else:
            # Split by sentences ending with period
            sentences = re.split(r'(?<=[.!])\s+', text)
            requirements.extend([s.strip() for s in sentences if len(s.strip()) > 20])

    # Filter out very short or header-like items
    requirements = [r for r in requirements if len(r) > 15 and not r.isupper()]

    # Deduplicate
    seen = set()
    unique = []
    for r in requirements:
        key = r.lower()[:50]
        if key not in seen:
            seen.add(key)
            unique.append(r)

    return unique if unique else [text.strip()]


def _clean_requirement_block(block: str) -> str:
    """Keep the requirement statement and drop owner/scope/evidence metadata."""
    lines = []
    for raw_line in block.splitlines():
        line = raw_line.strip().strip("-*").strip()
        if not line:
            continue
        if METADATA_LINE_PATTERN.match(line):
            break
        lines.append(line)

    if not lines:
        return ""

    return " ".join(lines).strip(" .")


def split_requirements(text: str) -> List[str]:
    """Split policy text into individual requirement statements."""
    requirement_blocks = re.findall(
        r"(?ims)^\s*(?:requirement|req)\s*[\w.-]*\s*[:\-]\s*(.*?)(?=^\s*(?:requirement|req)\s*[\w.-]*\s*[:\-]|\Z)",
        text,
    )

    if requirement_blocks:
        requirements = [
            cleaned
            for cleaned in (_clean_requirement_block(block) for block in requirement_blocks)
            if cleaned
        ]
    else:
        requirements = split_requirements_legacy(text)

    requirements = [r for r in requirements if r and len(r) > 15 and not r.isupper()]

    seen = set()
    unique = []
    for requirement in requirements:
        key = requirement.lower()[:50]
        if key not in seen:
            seen.add(key)
            unique.append(requirement)

    return unique if unique else [text.strip()]


def parse_policy_document(db: Session, name: str, framework: str, content: str) -> Tuple[PolicyDocument, List[ComplianceRequirement]]:
    """
    Parse a policy document and extract structured requirements.
    Returns the created PolicyDocument and list of ComplianceRequirements.
    """
    # Detect framework if not specified or "auto"
    if not framework or framework.lower() == "auto":
        framework = detect_framework(content)
    else:
        framework = normalize_framework(framework)

    # Create policy document
    policy = PolicyDocument(
        name=name,
        framework=framework,
        content=content,
    )
    db.add(policy)
    db.flush()  # Get the ID

    # Split content into requirements
    req_texts = split_requirements(content)

    requirements = []
    for req_text in req_texts:
        category = classify_category(req_text)
        control = detect_control_standard(req_text)
        severity = assess_severity(req_text)

        requirement = ComplianceRequirement(
            policy_id=policy.id,
            framework=framework,
            requirement_text=req_text,
            category=category,
            control_standard=control,
            severity=severity,
        )
        db.add(requirement)
        requirements.append(requirement)

    db.commit()
    db.refresh(policy)

    return policy, requirements


def get_all_policies(db: Session) -> List[PolicyDocument]:
    """Get all policy documents."""
    return db.query(PolicyDocument).all()


def get_policy_by_id(db: Session, policy_id: str) -> PolicyDocument:
    """Get a specific policy document."""
    return db.query(PolicyDocument).filter(PolicyDocument.id == policy_id).first()


def get_requirements(db: Session, framework: str = None, category: str = None) -> List[ComplianceRequirement]:
    """Get requirements with optional filters."""
    query = db.query(ComplianceRequirement)
    if framework:
        query = query.filter(ComplianceRequirement.framework == normalize_framework(framework))
    if category:
        query = query.filter(ComplianceRequirement.category == category)
    return query.all()


def get_requirement_by_id(db: Session, req_id: str) -> ComplianceRequirement:
    """Get a specific requirement."""
    return db.query(ComplianceRequirement).filter(ComplianceRequirement.id == req_id).first()
