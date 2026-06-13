# AuditMind AI Project Overview

## What This Project Is

AuditMind AI is a smart compliance assistant for audit teams. It helps turn a large and messy audit process into a simpler workflow by reading policy documents, collecting evidence, matching the two together, and showing where compliance is strong or weak.

In plain language, it answers questions like:

- What rules does this organization need to follow?
- What proof do we already have?
- What proof is missing or outdated?
- How risky is the current compliance position?
- What should an auditor see in a report?

## Why It Was Built

Audits usually take a long time because people manually read policies, search for supporting files, and compare everything by hand. This project speeds up that work by organizing the information automatically and presenting it in a dashboard that is easier to understand.

## What The User Sees

The project opens as a dashboard. A user can:

- Upload a policy document
- Upload evidence files or CSV data
- See extracted requirements
- See which evidence matches which requirement
- Check compliance gaps
- View risk and freshness warnings
- Generate an audit report
- Read AI-style explanations of compliance status

## How It Works At A High Level

1. A policy document is uploaded.
2. The system reads the document and pulls out the important rules.
3. Evidence records are uploaded from a CSV file or manually.
4. The system tries to match evidence to the rules using framework and keyword similarity.
5. It checks if the evidence is fresh, approved, or weak.
6. It calculates compliance coverage and risk.
7. It generates a report and dashboard view for auditors.

## Main Parts Of The System

### 1. Frontend Dashboard

This is the screen the user sees in the browser. It is built with React and Tailwind CSS.

What it does:

- Shows summary cards for compliance score, evidence count, risk, and gaps
- Lets the user upload policies and evidence
- Shows matched requirements and evidence
- Displays a report section
- Shows AI-generated narratives

### 2. Backend API

This is the hidden engine behind the dashboard. It is built with FastAPI.

What it does:

- Receives uploads from the browser
- Parses policy text
- Stores and reads evidence
- Runs compliance calculations
- Creates mappings between requirements and evidence
- Generates narratives and reports

### 3. Database

The database stores the project data in a structured way.

It keeps track of:

- Policy documents
- Extracted requirements
- Evidence artifacts
- Evidence-to-requirement mappings
- Risk findings
- Generated reports

By default the project uses SQLite so it can run easily on one machine. It can also be configured for PostgreSQL later.

### 4. Policy Parser

This part reads compliance policies and turns them into smaller, organized requirements.

For example, if a policy says:

- data must be encrypted
- access must be controlled
- logs must be retained

the parser converts that into separate items that the system can track individually.

### 5. Evidence Collector

This part brings in proof that controls are working.

Evidence can come from:

- CSV files
- manual uploads
- sample data provided in the project

Each evidence item stores details like source, date, confidence, and review status.

### 6. Mapping Engine

This part tries to connect each requirement with the right evidence.

It looks at:

- the compliance framework
- keywords in the requirement
- keywords in the evidence
- whether the evidence has been approved

If a match is strong enough, it creates a linkage.

### 7. Compliance Analyzer

This part answers the core audit question: how well are the rules covered?

It calculates:

- coverage score
- missing evidence
- stale evidence
- rejected evidence
- low-confidence evidence

### 8. Risk Scoring Engine

This part estimates how risky the current compliance situation is.

The score is based on:

- missing evidence
- stale evidence
- low confidence evidence
- review status

This gives auditors a quick sense of where to focus first.

### 9. AI Narrative Generator

This part writes short audit-friendly explanations.

The goal is to turn raw compliance data into plain-language statements such as:

- compliant
- partially compliant
- non-compliant

By default it uses a mock mode so the app works without an API key. It can also be connected to OpenAI for richer text generation.

### 10. Report Generator

This part creates auditor-ready reports in PDF and JSON format.

The report includes:

- summary of compliance
- framework breakdown
- risk findings
- recommendations
- evidence issues

## What Each Folder Is For

- `frontend/` holds the browser app
- `backend/` holds the API and logic
- `data/` holds the sample policy and evidence files
- `backend/models/` defines how data is stored
- `backend/services/` contains the business logic
- `backend/api/` exposes the API endpoints
- `backend/schemas/` defines request and response shapes

## What Happens During A Demo

1. The user uploads a policy.
2. The system extracts requirements.
3. The user uploads evidence.
4. The system maps evidence to requirements.
5. The dashboard highlights gaps and risks.
6. The system generates explanations.
7. A report can be downloaded.

## What Makes It Useful

AuditMind AI is useful because it reduces manual work and gives auditors a clearer picture faster. Instead of reading everything line by line, the user gets a structured view of what is covered, what is missing, and what action is needed.

## Short Version

AuditMind AI is a compliance dashboard that reads policies, organizes evidence, matches them together, and helps teams understand their audit readiness in minutes instead of hours.
