"""
AuditMind AI - Database Seeding Script
Parses local policy documents and evidence artifacts CSV and seeds the database.
"""

import os
import csv
import re
from pathlib import Path
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from core.database import SessionLocal, init_db
from models.requirement import PolicyDocument, ComplianceRequirement
from models.evidence import EvidenceArtifact
from models.mapping import EvidenceMapping
from models.audit import AuditReport, RiskFinding
from services.policy_parser import parse_policy_document, normalize_framework
from services.mapping_engine import auto_map_evidence
from services.evidence_manager import normalize_review_status, parse_confidence


BASE_DIR = Path(__file__).resolve().parents[1]


def parse_policies_file(file_path: str) -> list[tuple[str, str, str]]:
    """
    Parses policy_documents.txt.
    Returns a list of tuples: (policy_name, framework, content)
    """
    if not os.path.exists(file_path):
        print(f"Policy file not found: {file_path}")
        return []

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Split by policy separator ---
    policy_blocks = content.split("---")
    policies = []

    for block in policy_blocks:
        block = block.strip()
        if not block:
            continue

        # Extract Policy Name
        policy_name_match = re.search(r"POLICY:\s*(.*)", block)
        if not policy_name_match:
            continue
        policy_name = policy_name_match.group(1).strip()

        # Detect Framework from block content
        framework = "General"
        if "GDPR" in block or "General Data Protection" in block:
            framework = "GDPR"
        elif "SOX" in block or "Sarbanes" in block:
            framework = "SOX"
        elif "HIPAA" in block or "Health Insurance" in block:
            framework = "HIPAA"
        elif "NIST" in block or "National Institute" in block:
            framework = "NIST"
        elif "ISO 27001" in block or "ISMS" in block:
            framework = "ISO 27001"
        elif "PCI-DSS" in block or "Payment Card" in block:
            framework = "PCI-DSS"

        policies.append((policy_name, framework, block))

    return policies


def seed_database():
    print("Initializing Database...")
    init_db()
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(PolicyDocument).count() > 0:
            print("Database already contains data. Skipping seeding.")
            return

        # 1. Parse and seed Policy Documents
        policy_path = BASE_DIR / "data" / "policy_documents.txt"

        print(f"Reading policies from {policy_path}...")
        parsed_policies = parse_policies_file(policy_path)
        
        for name, framework, content in parsed_policies:
            print(f"Seeding Policy: {name} ({framework})...")
            parse_policy_document(db, name, framework, content)

        # 2. Parse and seed Evidence Artifacts from CSV
        csv_path = BASE_DIR / "data" / "evidence_artifacts.csv"

        print(f"Reading evidence from {csv_path}...")
        if os.path.exists(csv_path):
            with open(csv_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    # Parse dates
                    col_date = None
                    if row.get("collection_date"):
                        try:
                            col_date = datetime.strptime(row["collection_date"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
                        except ValueError:
                            col_date = datetime.now(timezone.utc)

                    rev_date = None
                    if row.get("review_date"):
                        try:
                            rev_date = datetime.strptime(row["review_date"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
                        except ValueError:
                            pass

                    status = normalize_review_status(row.get("status"))

                    # Create Evidence Artifact
                    # Title matches the requirement ID and type for clarity
                    evidence_type = row.get("evidence_type", "Report")
                    evidence_id = row.get("evidence_id", f"EVD{count:05d}")
                    title = f"{evidence_type.replace('_', ' ')} ({evidence_id})"
                    
                    evidence = EvidenceArtifact(
                        id=evidence_id,
                        title=title,
                        description=row.get("evidence_summary", ""),
                        source=row.get("evidence_location", "Vault"),
                        framework=normalize_framework(row.get("framework", "General")),
                        evidence_type=evidence_type,
                        content=f"Requirement linked: {row.get('requirement_description')}\nCollected by: {row.get('collected_by')} ({row.get('collector_email')})",
                        confidence_score=parse_confidence(row.get("confidence_score", 0.85)),
                        review_status=status,
                        collected_at=col_date,
                        reviewed_at=rev_date,
                        reviewer_notes=row.get("anomaly_marker") or None
                    )
                    db.add(evidence)
                    count += 1

                db.commit()
                print(f"Seeded {count} Evidence Artifacts successfully!")

        # 3. Run Mapping Engine to link evidence to requirements
        print("Running mapping engine to auto-map evidence...")
        mappings = auto_map_evidence(db)
        print(f"Generated {len(mappings)} automated compliance mappings!")

        print("Seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
