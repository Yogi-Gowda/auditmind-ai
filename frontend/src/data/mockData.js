// ─────────────────────────────────────────────
//  MOCK DATA – Centralized data store
// ─────────────────────────────────────────────

export const initialPolicies = [
  {
    id: "POL-ENC-001", name: "Data Encryption and Protection Policy",
    framework: "GDPR", version: "2.1", status: "Active", last_updated: "2026-03-15",
    content: `POLICY: Data Encryption and Protection\nPOLICY_ID: POL-ENC-001\nVERSION: 2.1\n\nREQUIREMENT 1: All data at rest must be encrypted using AES-256 or stronger.\nREQUIREMENT 2: Encryption keys must be rotated at least annually.\nREQUIREMENT 3: Data in transit must use TLS 1.2 or higher.`,
    requirements: [
      { id: "REQ-ENC-01", policy_id: "POL-ENC-001", framework: "GDPR", requirement_text: "All data at rest must be encrypted using AES-256 or stronger", category: "encryption", control_standard: "AES-256", severity: "critical", status: "active" },
      { id: "REQ-ENC-02", policy_id: "POL-ENC-001", framework: "NIST", requirement_text: "Encryption keys must be rotated at least annually", category: "encryption", control_standard: "Key Rotation", severity: "high", status: "active" },
      { id: "REQ-ENC-03", policy_id: "POL-ENC-001", framework: "GDPR", requirement_text: "Data in transit must use TLS 1.2 or higher", category: "encryption", control_standard: "TLS 1.2", severity: "critical", status: "active" }
    ]
  },
  {
    id: "POL-AC-001", name: "Access Control and Identity Management Policy",
    framework: "NIST", version: "3.0", status: "Active", last_updated: "2026-02-01",
    content: `POLICY: Access Control and Identity Management\nPOLICY_ID: POL-AC-001\n\nREQUIREMENT 1: Administrative access requires multi-factor authentication.\nREQUIREMENT 2: Access must follow principle of least privilege.\nREQUIREMENT 3: Privileged accounts must have no personal use.`,
    requirements: [
      { id: "REQ-AC-01", policy_id: "POL-AC-001", framework: "NIST", requirement_text: "Administrative access requires multi-factor authentication", category: "access_control", control_standard: "MFA", severity: "critical", status: "active" },
      { id: "REQ-AC-02", policy_id: "POL-AC-001", framework: "SOX", requirement_text: "Access must follow principle of least privilege", category: "access_control", control_standard: "RBAC", severity: "high", status: "active" },
      { id: "REQ-AC-03", policy_id: "POL-AC-001", framework: "NIST", requirement_text: "Privileged accounts must have no personal use", category: "access_control", control_standard: "Least Privilege", severity: "medium", status: "active" }
    ]
  },
  {
    id: "POL-AUD-001", name: "Audit Logging and Monitoring Policy",
    framework: "ISO 27001", version: "2.5", status: "Active", last_updated: "2026-01-30",
    content: `POLICY: Audit Logging and Monitoring\nPOLICY_ID: POL-AUD-001\n\nREQUIREMENT 1: All access to sensitive data must be logged.\nREQUIREMENT 2: Logs must be retained for minimum 90 days.\nREQUIREMENT 3: Log access must be restricted and monitored.`,
    requirements: [
      { id: "REQ-AUD-01", policy_id: "POL-AUD-001", framework: "ISO 27001", requirement_text: "All access to sensitive data must be logged", category: "logging_monitoring", control_standard: "Audit Trail", severity: "high", status: "active" },
      { id: "REQ-AUD-02", policy_id: "POL-AUD-001", framework: "PCI-DSS", requirement_text: "Logs must be retained for minimum 90 days", category: "logging_monitoring", control_standard: "90 Days Retention", severity: "high", status: "active" },
      { id: "REQ-AUD-03", policy_id: "POL-AUD-001", framework: "ISO 27001", requirement_text: "Log access must be restricted and monitored", category: "logging_monitoring", control_standard: "Access Control", severity: "medium", status: "active" }
    ]
  }
];

export const initialEvidence = [
  { id: "EVD00001", title: "AWS KMS Config Snapshot", description: "Audit snapshot of KMS key settings showing active automatic annual rotation.", source: "AWS KMS Configuration", framework: "NIST", evidence_type: "Configuration_Snapshot", collected_by: "Stephen Smith", collector_email: "stephen.smith@company.com", collection_date: "2026-06-01", confidence_score: 0.94, status: "approved", anomaly_marker: "", location: "Vault-1/Path-12", notes: "Verified rotation is active on main keys." },
  { id: "EVD00002", title: "Azure AD MFA Enrollment Report", description: "Login logs and MFA enforcement configuration showing 100% of admin accounts are configured.", source: "Azure AD Settings", framework: "NIST", evidence_type: "Access_Report", collected_by: "Nikhil Singh", collector_email: "nikhil.singh@company.com", collection_date: "2026-06-11", confidence_score: 0.98, status: "approved", anomaly_marker: "", location: "Vault-2/Path-45", notes: "MFA verified active on all accounts." },
  { id: "EVD00003", title: "SSL Certificate Inventory TLS 1.3", description: "SSL certification details showing all production gateways run TLS 1.3.", source: "SSL Certificate Inventory", framework: "GDPR", evidence_type: "Encryption_Cert", collected_by: "Priya Sharma", collector_email: "priya.sharma@company.com", collection_date: "2025-10-10", confidence_score: 0.90, status: "pending", anomaly_marker: "STALE_EVIDENCE", location: "Vault-3/Path-75", notes: "Evidence collected 246 days ago, exceeds 90 days limit." },
  { id: "EVD00004", title: "Elasticsearch Database Audit Trail", description: "ES log settings showing audit trail and access logs captured.", source: "Database Settings", framework: "ISO 27001", evidence_type: "Audit_Log", collected_by: "Michael Gupta", collector_email: "michael.gupta@company.com", collection_date: "2026-05-25", confidence_score: 0.85, status: "approved", anomaly_marker: "", location: "Vault-1/Path-80", notes: "Audit logging verified." },
  { id: "EVD00005", title: "S3 Bucket Encryption settings", description: "Configuration dump showing SSE-KMS with AES-256 enabled on all buckets.", source: "AWS Configuration", framework: "GDPR", evidence_type: "Configuration_Snapshot", collected_by: "Varun Lewis", collector_email: "varun.lewis@company.com", collection_date: "2026-06-05", confidence_score: 0.95, status: "approved", anomaly_marker: "", location: "Vault-1/Path-09", notes: "Full coverage." },
  { id: "EVD00006", title: "User Access Review Q1 2026", description: "Quarterly privilege review report showing revocation of stale admin roles.", source: "IAM Access Reviews", framework: "SOX", evidence_type: "Report", collected_by: "Edward Thompson", collector_email: "edward.thompson@company.com", collection_date: "2026-03-01", confidence_score: 0.76, status: "pending", anomaly_marker: "UNREVIEWED_EVIDENCE", location: "Vault-4/Path-11", notes: "Needs auditor sign-off." },
  { id: "EVD00007", title: "Security Group Firewall Policy", description: "Network security rules blocking direct DB access from external networks.", source: "Network Settings", framework: "PCI-DSS", evidence_type: "Configuration_Snapshot", collected_by: "Charles Bhat", collector_email: "charles.bhat@company.com", collection_date: "2026-06-12", confidence_score: 0.62, status: "pending", anomaly_marker: "INCOMPLETE_MAPPING", location: "Vault-5/Path-22", notes: "Auto-mapping confidence is low (62%)." },
  { id: "EVD00008", title: "Staff Security Training records", description: "Training dashboard showing 98% compliance in annual security courses.", source: "LMS Report", framework: "HIPAA", evidence_type: "Training_Record", collected_by: "Nisha Pillai", collector_email: "nisha.pillai@company.com", collection_date: "2026-05-01", confidence_score: 0.88, status: "approved", anomaly_marker: "", location: "Vault-8/Path-34", notes: "Training records validated." },
  { id: "EVD00009", title: "Splunk Audit Log Retention Config", description: "Configuration showing retention policy set to 60 days instead of required 90 days.", source: "Log Storage Config", framework: "PCI-DSS", evidence_type: "Configuration_Snapshot", collected_by: "Timothy Thomas", collector_email: "timothy.thomas@company.com", collection_date: "2026-06-03", confidence_score: 0.95, status: "rejected", anomaly_marker: "COMPLIANCE_GAP", location: "Vault-3/Path-91", notes: "Rejected because retention is 60 days, failing the 90 days requirement." }
];

export const complianceTrendData = [
  { month: "Jan", GDPR: 72, NIST: 65, SOX: 58, "ISO 27001": 70, "PCI-DSS": 45, HIPAA: 60 },
  { month: "Feb", GDPR: 76, NIST: 68, SOX: 60, "ISO 27001": 73, "PCI-DSS": 48, HIPAA: 64 },
  { month: "Mar", GDPR: 80, NIST: 72, SOX: 63, "ISO 27001": 76, "PCI-DSS": 50, HIPAA: 68 },
  { month: "Apr", GDPR: 83, NIST: 74, SOX: 65, "ISO 27001": 78, "PCI-DSS": 52, HIPAA: 72 },
  { month: "May", GDPR: 88, NIST: 76, SOX: 66, "ISO 27001": 80, "PCI-DSS": 54, HIPAA: 78 },
  { month: "Jun", GDPR: 94, NIST: 78, SOX: 68, "ISO 27001": 82, "PCI-DSS": 56, HIPAA: 85 },
];

export const threatTimelineData = [
  { day: "Mon", critical: 2, high: 5, medium: 12, low: 18 },
  { day: "Tue", critical: 1, high: 7, medium: 9, low: 22 },
  { day: "Wed", critical: 3, high: 4, medium: 14, low: 16 },
  { day: "Thu", critical: 0, high: 6, medium: 11, low: 20 },
  { day: "Fri", critical: 2, high: 3, medium: 8, low: 24 },
  { day: "Sat", critical: 1, high: 2, medium: 6, low: 14 },
  { day: "Sun", critical: 0, high: 1, medium: 4, low: 10 },
];

export const severityDistribution = [
  { name: "Critical", value: 4, color: "#f43f5e" },
  { name: "High", value: 12, color: "#f97316" },
  { name: "Medium", value: 18, color: "#eab308" },
  { name: "Low", value: 8, color: "#22c55e" },
];

export const riskHeatmapData = [
  [1, 2, 3, 1, 2, 4, 1], [2, 3, 2, 1, 3, 2, 1], [1, 1, 4, 3, 2, 1, 2],
  [3, 2, 1, 2, 1, 3, 1], [1, 2, 2, 1, 3, 2, 2], [2, 1, 3, 2, 1, 1, 3],
];

export const frameworkScores = [
  { name: "GDPR", desc: "General Data Protection", score: 94, color: "from-indigo-500 to-indigo-600", gradient: ["#6366f1", "#818cf8"] },
  { name: "SOX", desc: "Financial Security Controls", score: 68, color: "from-purple-500 to-purple-600", gradient: ["#a855f7", "#c084fc"] },
  { name: "HIPAA", desc: "Healthcare Records Security", score: 85, color: "from-cyan-500 to-cyan-600", gradient: ["#06b6d4", "#22d3ee"] },
  { name: "NIST", desc: "Cybersecurity Framework", score: 78, color: "from-emerald-500 to-emerald-600", gradient: ["#10b981", "#34d399"] },
  { name: "ISO 27001", desc: "Information Security Mgmt", score: 82, color: "from-pink-500 to-pink-600", gradient: ["#ec4899", "#f472b6"] },
  { name: "PCI-DSS", desc: "Cardholder Data Standard", score: 56, color: "from-orange-500 to-orange-600", gradient: ["#f97316", "#fb923c"] },
];

export const activityFeed = [
  { id: 1, action: "AI flagged COMPLIANCE_GAP in Splunk Retention Config", type: "critical", time: "2 min ago", user: "AuditMind AI" },
  { id: 2, action: "Evidence EVD00002 approved by auditor Nikhil Singh", type: "success", time: "14 min ago", user: "Nikhil Singh" },
  { id: 3, action: "New policy POL-AC-001 v3.0 ingested and parsed", type: "info", time: "1 hour ago", user: "System" },
  { id: 4, action: "STALE_EVIDENCE detected: SSL Certificate Inventory", type: "warning", time: "2 hours ago", user: "AuditMind AI" },
  { id: 5, action: "Quarterly access review completed for SOX framework", type: "success", time: "3 hours ago", user: "Edward Thompson" },
  { id: 6, action: "Auto-mapping engine generated 24 requirement-evidence linkages", type: "info", time: "5 hours ago", user: "System" },
  { id: 7, action: "PCI-DSS Pre-Audit report REP001 generated", type: "info", time: "8 hours ago", user: "System" },
  { id: 8, action: "Security training compliance reached 98% organization-wide", type: "success", time: "12 hours ago", user: "Nisha Pillai" },
];

export const aiInsights = [
  { id: 1, type: "urgent", title: "Compliance Gap Detected", description: "Splunk log retention is configured at 60 days, below the required 90-day minimum for PCI-DSS. Immediate remediation recommended.", action: "View Finding", impact: "High" },
  { id: 2, type: "warning", title: "Stale Evidence Alert", description: "SSL Certificate Inventory was collected 246 days ago. Re-collection required to maintain GDPR Article 32 compliance.", action: "Schedule Collection", impact: "Medium" },
  { id: 3, type: "info", title: "Coverage Optimization", description: "3 requirements can be satisfied by existing approved evidence with minor mapping adjustments. Auto-fix available.", action: "Apply Auto-Fix", impact: "Low" },
  { id: 4, type: "success", title: "Encryption Posture Strong", description: "All AES-256 encryption requirements are met with approved evidence. Key rotation verified active across all production systems.", action: "View Details", impact: "Positive" },
];

export const initialReports = [
  { id: "REP001", title: "PCI-DSS Pre-Audit Evaluation", type: "external", framework: "PCI-DSS", score: 82, created_at: "2026-06-12T10:14:00Z", risk_score: 24 },
  { id: "REP002", title: "Overall GDPR Compliance Q2", type: "internal", framework: "GDPR", score: 94, created_at: "2026-06-13T11:00:00Z", risk_score: 12 },
  { id: "REP003", title: "NIST Cybersecurity Assessment", type: "external", framework: "NIST", score: 78, created_at: "2026-06-10T09:30:00Z", risk_score: 33 },
  { id: "REP004", title: "ISO 27001 Internal Audit", type: "internal", framework: "ISO 27001", score: 82, created_at: "2026-06-08T14:20:00Z", risk_score: 28 },
];

export const networkNodes = [
  { id: 1, label: "IAM", x: 15, y: 25, size: 48, color: "#6366f1" },
  { id: 2, label: "KMS", x: 35, y: 15, size: 40, color: "#06b6d4" },
  { id: 3, label: "VPC", x: 55, y: 35, size: 44, color: "#10b981" },
  { id: 4, label: "S3", x: 75, y: 20, size: 36, color: "#f97316" },
  { id: 5, label: "RDS", x: 25, y: 60, size: 42, color: "#8b5cf6" },
  { id: 6, label: "WAF", x: 65, y: 65, size: 38, color: "#f43f5e" },
  { id: 7, label: "CW", x: 45, y: 50, size: 34, color: "#eab308" },
  { id: 8, label: "EC2", x: 85, y: 50, size: 46, color: "#14b8a6" },
];

export const networkEdges = [
  [1, 2], [1, 3], [2, 4], [3, 5], [3, 6], [4, 8], [5, 7], [6, 7], [7, 8], [1, 5], [2, 7],
];
