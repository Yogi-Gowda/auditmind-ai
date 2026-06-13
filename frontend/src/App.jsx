import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  BookOpen, 
  Database, 
  GitMerge, 
  AlertTriangle, 
  FileText, 
  Award, 
  TrendingUp, 
  ShieldAlert, 
  PlusCircle, 
  Check, 
  X, 
  Sparkles, 
  Download, 
  Upload, 
  FileSpreadsheet 
} from 'lucide-react';

// ==========================================
// MOCK DATA (Fallback for local/Vite mode)
// ==========================================
const initialPolicies = [
  {
    id: "POL-ENC-001",
    name: "Data Encryption and Protection Policy",
    framework: "GDPR",
    version: "2.1",
    status: "Active",
    last_updated: "2026-03-15",
    content: `POLICY: Data Encryption and Protection
POLICY_ID: POL-ENC-001
VERSION: 2.1
STATUS: Active
LAST_UPDATED: 2026-03-15

REQUIREMENT 1: All data at rest must be encrypted using AES-256 or stronger.
- Responsible: Infrastructure Security
- Scope: Databases, file storage, backups
- Evidence Source: AWS KMS Configuration, Database Settings
- Audit Frequency: Monthly
- Compliance Mapping: GDPR Article 32, NIST SC-7, PCI-DSS 3.4

REQUIREMENT 2: Encryption keys must be rotated at least annually.
- Responsible: Key Management Team
- Scope: All encryption keys
- Evidence Source: Key Management System Audit Logs
- Audit Frequency: Quarterly
- Compliance Mapping: NIST SC-7, ISO 27001 A.10.1.1

REQUIREMENT 3: Data in transit must use TLS 1.2 or higher.
- Responsible: Network Security
- Scope: All network communications involving sensitive data
- Evidence Source: Network Configuration, SSL Certificate Inventory
- Audit Frequency: Continuous
- Compliance Mapping: GDPR Article 32, NIST SC-7`,
    requirements: [
      { id: "REQ-ENC-01", policy_id: "POL-ENC-001", framework: "GDPR", requirement_text: "All data at rest must be encrypted using AES-256 or stronger", category: "encryption", control_standard: "AES-256", severity: "critical", status: "active" },
      { id: "REQ-ENC-02", policy_id: "POL-ENC-001", framework: "NIST", requirement_text: "Encryption keys must be rotated at least annually", category: "encryption", control_standard: "Key Rotation", severity: "high", status: "active" },
      { id: "REQ-ENC-03", policy_id: "POL-ENC-001", framework: "GDPR", requirement_text: "Data in transit must use TLS 1.2 or higher", category: "encryption", control_standard: "TLS 1.2", severity: "critical", status: "active" }
    ]
  },
  {
    id: "POL-AC-001",
    name: "Access Control and Identity Management Policy",
    framework: "NIST",
    version: "3.0",
    status: "Active",
    last_updated: "2026-02-01",
    content: `POLICY: Access Control and Identity Management
POLICY_ID: POL-AC-001
VERSION: 3.0
STATUS: Active
LAST_UPDATED: 2026-02-01

REQUIREMENT 1: Administrative access requires multi-factor authentication.
- Responsible: IT Operations
- Scope: All administrative accounts
- Evidence Source: Azure AD Configuration, Login Logs
- Audit Frequency: Daily
- Compliance Mapping: NIST IA-2, CIS 5.3.1

REQUIREMENT 2: Access must follow principle of least privilege.
- Responsible: Access Control Board
- Scope: All user access rights
- Evidence Source: IAM Systems, Access Reviews
- Audit Frequency: Quarterly
- Compliance Mapping: NIST AC-2, NIST AC-3, SOX 302

REQUIREMENT 3: Privileged accounts must have no personal use.
- Responsible: Security Operations
- Scope: Admin, root, service accounts
- Evidence Source: Activity Logs, Browser History (if applicable)
- Audit Frequency: Monthly
- Compliance Mapping: NIST AC-3, CIS 4.1`,
    requirements: [
      { id: "REQ-AC-01", policy_id: "POL-AC-001", framework: "NIST", requirement_text: "Administrative access requires multi-factor authentication", category: "access_control", control_standard: "MFA", severity: "critical", status: "active" },
      { id: "REQ-AC-02", policy_id: "POL-AC-001", framework: "SOX", requirement_text: "Access must follow principle of least privilege", category: "access_control", control_standard: "RBAC", severity: "high", status: "active" },
      { id: "REQ-AC-03", policy_id: "POL-AC-001", framework: "NIST", requirement_text: "Privileged accounts must have no personal use", category: "access_control", control_standard: "Least Privilege", severity: "medium", status: "active" }
    ]
  },
  {
    id: "POL-AUD-001",
    name: "Audit Logging and Monitoring Policy",
    framework: "ISO 27001",
    version: "2.5",
    status: "Active",
    last_updated: "2026-01-30",
    content: `POLICY: Audit Logging and Monitoring
POLICY_ID: POL-AUD-001
VERSION: 2.5
STATUS: Active
LAST_UPDATED: 2026-01-30

REQUIREMENT 1: All access to sensitive data must be logged.
- Responsible: Security Operations
- Scope: Databases, file systems, APIs
- Evidence Source: Application Logs, Database Audit Trails
- Audit Frequency: Daily
- Compliance Mapping: GDPR Article 32, NIST AU-2, SOX 302

REQUIREMENT 2: Logs must be retained for minimum 90 days.
- Responsible: Log Management Team
- Scope: All security-relevant logs
- Evidence Source: Log Storage Configuration, Retention Policies
- Audit Frequency: Monthly
- Compliance Mapping: NIST AU-4, PCI-DSS 3.4

REQUIREMENT 3: Log access must be restricted and monitored.
- Responsible: Security Operations
- Scope: All log files and systems
- Evidence Source: Access Control Lists, Log Access Logs
- Audit Frequency: Weekly
- Compliance Mapping: NIST AU-5, ISO 27001 A.10.2.3`,
    requirements: [
      { id: "REQ-AUD-01", policy_id: "POL-AUD-001", framework: "ISO 27001", requirement_text: "All access to sensitive data must be logged", category: "logging_monitoring", control_standard: "Audit Trail", severity: "high", status: "active" },
      { id: "REQ-AUD-02", policy_id: "POL-AUD-001", framework: "PCI-DSS", requirement_text: "Logs must be retained for minimum 90 days", category: "logging_monitoring", control_standard: "90 Days Retention", severity: "high", status: "active" },
      { id: "REQ-AUD-03", policy_id: "POL-AUD-001", framework: "ISO 27001", requirement_text: "Log access must be restricted and monitored", category: "logging_monitoring", control_standard: "Access Control", severity: "medium", status: "active" }
    ]
  }
];

const initialEvidence = [
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

const normalizeFramework = (framework = "General") => {
  const value = framework.trim();
  const aliases = {
    ISO27001: "ISO 27001",
    "ISO-27001": "ISO 27001",
    PCIDSS: "PCI-DSS",
    "PCI DSS": "PCI-DSS"
  };
  return aliases[value.toUpperCase()] || value;
};

const normalizeEvidenceStatus = (status = "pending") => {
  const value = status.trim().toLowerCase();
  if (value.includes("approved")) return "approved";
  if (value.includes("rejected")) return "rejected";
  return "pending";
};

function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [policies, setPolicies] = useState(initialPolicies);
  const [evidence, setEvidence] = useState(initialEvidence);
  const [mappings, setMappings] = useState([]);
  const [alertMsg, setAlertMsg] = useState(null);

  // Upload forms states
  const [policyForm, setPolicyForm] = useState({ name: "", framework: "GDPR", content: "" });
  const [evidenceForm, setEvidenceForm] = useState({
    title: "", source: "Manual Upload", framework: "GDPR",
    evidence_type: "Configuration_Snapshot", description: "",
    content: "", confidence_score: 0.90, status: "pending", location: "Vault-Manual"
  });

  // Narratives states
  const [narratives, setNarratives] = useState({});
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  // Report states
  const [reportTitle, setReportTitle] = useState("AuditMind Compliance Report");
  const [reportType, setReportType] = useState("internal");
  const [reportFramework, setReportFramework] = useState("All");
  const [reportsList, setReportsList] = useState([
    { id: "REP001", title: "PCI-DSS Pre-Audit Evaluation", type: "external", framework: "PCI-DSS", score: 82, created_at: "2026-06-12T10:14:00Z", risk_score: 24 },
    { id: "REP002", title: "Overall GDPR Compliance Q2", type: "internal", framework: "GDPR", score: 94, created_at: "2026-06-13T11:00:00Z", risk_score: 12 }
  ]);

  const runAutoMappingLocal = () => {
    const generated = [];
    let mapId = 1;
    
    policies.forEach(policy => {
      policy.requirements.forEach(req => {
        evidence.forEach(ev => {
          let confidence = 0.1;
          if (req.framework === ev.framework) confidence += 0.3;
          
          const keywords = {
            encryption: ["encrypt", "aes", "tls", "ssl", "kms", "key"],
            access_control: ["access", "mfa", "privilege", "role", "rbac", "auth"],
            logging_monitoring: ["log", "monitor", "audit", "splunk", "elastic", "trail"]
          }[req.category] || [];

          const evText = (ev.title + " " + ev.description + " " + ev.content).toLowerCase();
          const reqText = req.requirement_text.toLowerCase();
          
          let matchCount = 0;
          keywords.forEach(kw => {
            if (evText.includes(kw) || reqText.includes(kw)) matchCount++;
          });

          if (keywords.length > 0) {
            confidence += (matchCount / keywords.length) * 0.4;
          }

          if (req.control_standard && evText.includes(req.control_standard.toLowerCase())) {
            confidence += 0.2;
          }

          if (ev.status === "approved") confidence += 0.05;

          confidence = Math.min(confidence, 1.0);

          if (confidence >= 0.25) {
            generated.push({
              id: `MAP-${mapId++}`,
              requirement_id: req.id,
              requirement_text: req.requirement_text,
              evidence_id: ev.id,
              evidence_title: ev.title,
              confidence: parseFloat(confidence.toFixed(2)),
              mapping_type: "auto",
              created_at: new Date().toISOString()
            });
          }
        });
      });
    });

    setMappings(generated);
    showAlert("Success", `Auto-mapped ${generated.length} linkages successfully!`, "success");
  };

  useEffect(() => {
    runAutoMappingLocal();
  }, []);

  const showAlert = (title, message, type = "info") => {
    setAlertMsg({ title, message, type });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const metrics = useMemo(() => {
    const totalReqs = policies.reduce((acc, p) => acc + p.requirements.length, 0);
    const mappedReqIds = new Set(mappings.map(m => m.requirement_id));
    const coveredCount = mappedReqIds.size;
    
    const approvedReqIds = new Set(
      mappings
        .filter(m => {
          const ev = evidence.find(e => e.id === m.evidence_id);
          return ev && ev.status === "approved";
        })
        .map(m => m.requirement_id)
    );
    const compScore = totalReqs > 0 ? Math.round((approvedReqIds.size / totalReqs) * 100) : 0;

    const approved = evidence.filter(e => e.status === "approved").length;
    const pending = evidence.filter(e => e.status === "pending").length;
    const rejected = evidence.filter(e => e.status === "rejected").length;

    const staleCount = evidence.filter(e => e.anomaly_marker === "STALE_EVIDENCE").length;
    const gapCount = totalReqs - coveredCount;

    let riskValue = 10;
    if (gapCount > 0) riskValue += gapCount * 12;
    if (staleCount > 0) riskValue += staleCount * 8;
    if (rejected > 0) riskValue += rejected * 15;
    
    const overallRisk = Math.min(Math.max(riskValue, 5), 100);

    return {
      totalReqs,
      coveredCount,
      compScore,
      approved,
      pending,
      rejected,
      staleCount,
      gapCount,
      overallRisk
    };
  }, [policies, evidence, mappings]);

  const handlePolicyUpload = (e) => {
    e.preventDefault();
    if (!policyForm.name || !policyForm.content) {
      showAlert("Error", "Please provide a policy name and content", "error");
      return;
    }

    const lines = policyForm.content.split("\n");
    const parsedReqs = [];
    let reqNum = 1;
    const newPolicyId = `POL-NEW-${Date.now()}`;

    lines.forEach(line => {
      if (line.trim().toLowerCase().startsWith("requirement")) {
        const text = line.replace(/requirement\s+\d+:\s*/gi, "").trim();
        if (text) {
          parsedReqs.push({
            id: `REQ-NEW-${Date.now()}-${reqNum++}`,
            policy_id: newPolicyId,
            framework: policyForm.framework,
            requirement_text: text,
            category: "compliance",
            control_standard: null,
            severity: "high",
            status: "active"
          });
        }
      }
    });

    if (parsedReqs.length === 0) {
      parsedReqs.push({
        id: `REQ-NEW-${Date.now()}-1`,
        policy_id: newPolicyId,
        framework: policyForm.framework,
        requirement_text: policyForm.content.substring(0, 100),
        category: "compliance",
        control_standard: null,
        severity: "medium",
        status: "active"
      });
    }

    const newPolicy = {
      id: newPolicyId,
      name: policyForm.name,
      framework: policyForm.framework,
      version: "1.0",
      status: "Active",
      last_updated: new Date().toISOString().split("T")[0],
      content: policyForm.content,
      requirements: parsedReqs
    };

    setPolicies([...policies, newPolicy]);
    setPolicyForm({ name: "", framework: "GDPR", content: "" });
    showAlert("Success", `Policy parsed! Extracted ${parsedReqs.length} requirements.`, "success");
    
    setTimeout(() => runAutoMappingLocal(), 500);
  };

  const handleEvidenceUpload = (e) => {
    e.preventDefault();
    if (!evidenceForm.title || !evidenceForm.description) {
      showAlert("Error", "Please provide title and description", "error");
      return;
    }

    const newEv = {
      ...evidenceForm,
      id: `EVD${Math.floor(10000 + Math.random() * 90000)}`,
      collection_date: new Date().toISOString().split("T")[0],
      confidence_score: parseFloat(evidenceForm.confidence_score),
      anomaly_marker: ""
    };

    setEvidence([newEv, ...evidence]);
    setEvidenceForm({
      title: "", source: "Manual Upload", framework: "GDPR",
      evidence_type: "Configuration_Snapshot", description: "",
      content: "", confidence_score: 0.90, status: "pending", location: "Vault-Manual"
    });
    showAlert("Success", "Evidence artifact uploaded successfully!", "success");

    setTimeout(() => runAutoMappingLocal(), 500);
  };

  const handleCSVFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      const lines = csvText.split("\n");
      if (lines.length < 2) return;

      const headers = lines[0].split(",");
      const results = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(",");
        if (values.length < headers.length) continue;

        const row = {};
        headers.forEach((h, idx) => {
          row[h.trim()] = values[idx] ? values[idx].trim() : "";
        });

        results.push({
          id: row.evidence_id || `EVD${i + 1000}`,
          title: `${row.evidence_type || "Report"} (${row.evidence_id || i})`,
          description: row.evidence_summary || "Imported CSV evidence.",
          source: row.evidence_location || "CSV Import",
          framework: normalizeFramework(row.framework || "General"),
          evidence_type: row.evidence_type || "Report",
          content: `Collector: ${row.collected_by || "Unknown"} (${row.collector_email || "N/A"})`,
          confidence_score: parseFloat(row.confidence_score) || 0.8,
          status: normalizeEvidenceStatus(row.status || "pending"),
          collection_date: row.collection_date || new Date().toISOString().split("T")[0],
          anomaly_marker: row.anomaly_marker || ""
        });
      }

      setEvidence([...results, ...evidence]);
      showAlert("Success", `Imported ${results.length} evidence artifacts from CSV!`, "success");
      setTimeout(() => runAutoMappingLocal(), 500);
    };
    reader.readAsText(file);
  };

  const updateEvidenceStatus = (evId, newStatus) => {
    setEvidence(evidence.map(e => e.id === evId ? { ...e, status: newStatus } : e));
    showAlert("Status Updated", `Evidence ${evId} has been ${newStatus}.`, "info");
  };

  const removeMappingLocal = (mapId) => {
    setMappings(mappings.filter(m => m.id !== mapId));
    showAlert("Mapping Removed", "Mapping connection deleted.", "info");
  };

  const generateAINarrative = (reqId) => {
    setNarrativeLoading(true);
    const req = policies.flatMap(p => p.requirements).find(r => r.id === reqId);
    const linkedEvs = mappings.filter(m => m.requirement_id === reqId).map(m => evidence.find(e => e.id === m.evidence_id));
    
    setTimeout(() => {
      let text = "";
      if (linkedEvs.length === 0) {
        text = `WARNING: No evidence artifact is mapped to requirement "${req.requirement_text}". This constitutes a significant compliance gap. Immediate control deployment is required to fulfill the framework standard.`;
      } else {
        const ev = linkedEvs[0];
        text = `CONTROL COMPLIANCE NARRATIVE: Requirement "${req.requirement_text}" is mapped to Evidence "${ev.title}". The audit trail indicates evidence was collected on ${ev.collection_date} with a confidence score of ${(ev.confidence_score * 100).toFixed(0)}%. Evaluation shows status is currently [${ev.status.toUpperCase()}]. `;
        if (ev.status === "approved") {
          text += `The controls satisfy the required standard for framework ${req.framework} (${req.control_standard || "General Control"}). No corrective action required.`;
        } else {
          text += `Corrective action is pending. The status is [${ev.status.toUpperCase()}], flagged as ${ev.anomaly_marker || "unresolved"}. Auditor suggests a review of the configuration logs.`;
        }
      }
      
      setNarratives(prev => ({ ...prev, [reqId]: text }));
      setNarrativeLoading(false);
    }, 1200);
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    const newReport = {
      id: `REP${Math.floor(100 + Math.random() * 900)}`,
      title: reportTitle,
      type: reportType,
      framework: reportFramework,
      score: metrics.compScore,
      risk_score: metrics.overallRisk,
      created_at: new Date().toISOString()
    };
    setReportsList([newReport, ...reportsList]);
    showAlert("Report Generated", `Successfully compiled ${reportTitle}!`, "success");
  };

  return (
    <div className="flex min-h-screen bg-gradient-radial text-slate-100">
      
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-outfit text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">AuditMind AI</h1>
                <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">Compliance Intelligence</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            {[
              { id: "overview", label: "Overview", icon: Award },
              { id: "policies", label: "Policy Documents", icon: BookOpen },
              { id: "evidence", label: "Evidence Vault", icon: Database },
              { id: "mappings", label: "Compliance Mapping", icon: GitMerge },
              { id: "gaps", label: "Gaps & Risk", icon: AlertTriangle },
              { id: "reports", label: "Auditor Reports", icon: FileText }
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                    activeTab === item.id 
                      ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-slate-400 font-medium">Local Engine Mode</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen">
        
        {/* Top Bar */}
        <header className="h-16 glass-panel border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-50">
          <h2 className="font-outfit text-xl font-bold tracking-tight text-white capitalize">{activeTab} Dashboard</h2>

          <div className="flex items-center gap-4">
            {alertMsg && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
                alertMsg.type === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                alertMsg.type === "error" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
              }`}>
                <span>{alertMsg.message}</span>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Framework:</span>
              <select 
                onChange={(e) => setReportFramework(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="All">All Frameworks</option>
                <option value="GDPR">GDPR</option>
                <option value="SOX">SOX</option>
                <option value="HIPAA">HIPAA</option>
                <option value="NIST">NIST</option>
                <option value="ISO 27001">ISO 27001</option>
                <option value="PCI-DSS">PCI-DSS</option>
              </select>
            </div>
          </div>
        </header>

        {/* Dashboard Sections */}
        <div className="p-8 flex-grow">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Headline Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="glass-panel p-5 rounded-2xl glow-hover relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl animate-pulse-slow"></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Compliance Index</span>
                    <div className="bg-indigo-500/10 p-2 rounded-lg text-indigo-400">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-outfit text-4xl font-extrabold text-white">{metrics.compScore}%</span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />+4.2%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full" style={{ width: `${metrics.compScore}%` }}></div>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl glow-hover">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Evidence Collected</span>
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                      <Database className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-outfit text-4xl font-extrabold text-white">{evidence.length}</span>
                    <span className="text-xs text-slate-400">Artifacts</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-4">
                    <span className="text-emerald-400 font-semibold">{metrics.approved} Approved</span> &bull; <span>{metrics.pending} Pending</span>
                  </p>
                </div>

                <div className="glass-panel p-5 rounded-2xl glow-hover">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Weighted Risk</span>
                    <div className={`p-2 rounded-lg ${
                      metrics.overallRisk > 50 ? "bg-rose-500/10 text-rose-400" :
                      metrics.overallRisk > 25 ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-outfit text-4xl font-extrabold text-white">{metrics.overallRisk}/100</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      metrics.overallRisk > 50 ? "bg-rose-500/15 text-rose-400" :
                      metrics.overallRisk > 25 ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"
                    }`}>
                      {metrics.overallRisk > 50 ? "High" : metrics.overallRisk > 25 ? "Medium" : "Low"}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className={`h-full rounded-full ${
                      metrics.overallRisk > 50 ? "bg-rose-500" :
                      metrics.overallRisk > 25 ? "bg-amber-500" : "bg-emerald-500"
                    }`} style={{ width: `${metrics.overallRisk}%` }}></div>
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl glow-hover">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Gaps</span>
                    <div className="bg-rose-500/10 p-2 rounded-lg text-rose-400">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-outfit text-4xl font-extrabold text-white">{metrics.gapCount}</span>
                    <span className="text-xs text-rose-400 font-semibold">Missing Controls</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-4">
                    <span className="text-amber-500 font-semibold">{metrics.staleCount} Stale evidence</span>
                  </p>
                </div>
              </div>

              {/* Progress Standing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-2xl col-span-2 space-y-5">
                  <h3 className="font-outfit text-lg font-bold text-white">Compliance Framework Standing</h3>
                  <div className="space-y-4">
                    {[
                      { name: "GDPR", desc: "General Data Protection", color: "from-indigo-500 to-indigo-600", score: 94 },
                      { name: "SOX", desc: "Financial Security Controls", color: "from-purple-500 to-purple-600", score: 68 },
                      { name: "HIPAA", desc: "Healthcare Records Security", color: "from-cyan-500 to-cyan-600", score: 85 },
                      { name: "NIST", desc: "Cybersecurity Framework", color: "from-emerald-500 to-emerald-600", score: 78 },
                      { name: "ISO 27001", desc: "Information Security Management", color: "from-pink-500 to-pink-600", score: 82 },
                      { name: "PCI-DSS", desc: "Cardholder Data Standard", color: "from-orange-500 to-orange-600", score: 56 }
                    ].map(fw => (
                      <div key={fw.name} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-outfit font-bold text-slate-200">{fw.name}</span>
                            <span className="text-slate-500 ml-2">({fw.desc})</span>
                          </div>
                          <span className="font-semibold text-slate-300">{fw.score}%</span>
                        </div>
                        <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${fw.color} rounded-full`} style={{ width: `${fw.score}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <h3 className="font-outfit text-lg font-bold text-white">Critical Alerts</h3>
                  <div className="space-y-3 overflow-y-auto max-h-[300px]">
                    {evidence.filter(e => e.anomaly_marker || e.status === "rejected").map(ev => (
                      <div key={ev.id} className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-indigo-400 font-outfit uppercase tracking-wider">{ev.framework}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                            ev.status === "rejected" ? "bg-rose-500/20 text-rose-400 border border-rose-500/20" :
                            ev.anomaly_marker === "STALE_EVIDENCE" ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" :
                            "bg-orange-500/20 text-orange-400 border border-orange-500/20"
                          }`}>
                            {ev.status === "rejected" ? "REJECTED" : ev.anomaly_marker.replace("_", " ")}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-200 truncate">{ev.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{ev.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "policies" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-panel p-6 rounded-2xl space-y-5 h-fit">
                <h3 className="font-outfit text-lg font-bold text-white">Ingest Policy Document</h3>
                <form onSubmit={handlePolicyUpload} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Policy Name</label>
                    <input
                      type="text"
                      required
                      value={policyForm.name}
                      onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                      placeholder="e.g. Identity and Access Policy"
                      className="w-full px-3 py-2 text-sm rounded-lg glass-input text-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Primary Framework</label>
                    <select
                      value={policyForm.framework}
                      onChange={(e) => setPolicyForm({ ...policyForm, framework: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg glass-input text-slate-200"
                    >
                      <option value="GDPR">GDPR (Privacy)</option>
                      <option value="SOX">SOX (Financial)</option>
                      <option value="HIPAA">HIPAA (Healthcare)</option>
                      <option value="NIST">NIST (Cybersecurity)</option>
                      <option value="ISO 27001">ISO 27001 (Security)</option>
                      <option value="PCI-DSS">PCI-DSS (Payments)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Policy Content / Text</label>
                    <textarea
                      rows="8"
                      required
                      value={policyForm.content}
                      onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
                      placeholder="Paste policy document rules here... Use 'REQUIREMENT X: <text>' format for auto parsing."
                      className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-200 font-mono"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Parse & Ingest Policy
                  </button>
                </form>
              </div>

              <div className="col-span-2 space-y-6">
                <h3 className="font-outfit text-lg font-bold text-white">Uploaded Policies & Extracted Requirements</h3>
                <div className="space-y-4">
                  {policies.map(policy => (
                    <div key={policy.id} className="glass-panel p-5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">{policy.framework}</span>
                            <h4 className="font-outfit font-bold text-white text-base">{policy.name}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">ID: {policy.id} &bull; Version: {policy.version} &bull; Updated: {policy.last_updated}</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">Active</span>
                      </div>

                      <div className="border-t border-slate-800/80 pt-4 space-y-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Extracted Requirements ({policy.requirements.length})</h5>
                        <div className="space-y-2">
                          {policy.requirements.map(req => (
                            <div key={req.id} className="p-3 bg-slate-950/35 border border-slate-800/50 rounded-xl flex items-start justify-between gap-4">
                              <div className="space-y-1">
                                <p className="text-xs text-slate-200 font-medium">{req.requirement_text}</p>
                                <div className="flex gap-2">
                                  <span className="text-[9px] uppercase font-bold text-indigo-400">Category: {req.category.replace("_", " ")}</span>
                                  {req.control_standard && <span className="text-[9px] uppercase font-bold text-cyan-400">Standard: {req.control_standard}</span>}
                                </div>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                                req.severity === "critical" ? "bg-rose-500/20 text-rose-400 border border-rose-500/20" :
                                req.severity === "high" ? "bg-orange-500/20 text-orange-400 border border-orange-500/20" :
                                "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20"
                              }`}>
                                {req.severity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "evidence" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-panel p-6 rounded-2xl space-y-5 h-fit">
                <h3 className="font-outfit text-lg font-bold text-white">Upload New Evidence</h3>
                
                <div className="p-4 bg-slate-950/60 border border-dashed border-slate-800 rounded-xl text-center space-y-2">
                  <FileSpreadsheet className="w-8 h-8 mx-auto text-indigo-400" />
                  <p className="text-xs text-slate-300 font-medium">Bulk Upload via CSV</p>
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleCSVFile}
                    className="hidden" 
                    id="csv-file-input-modular" 
                  />
                  <label 
                    htmlFor="csv-file-input-modular"
                    className="inline-block px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-medium cursor-pointer transition-colors"
                  >
                    Select CSV File
                  </label>
                </div>

                <form onSubmit={handleEvidenceUpload} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Evidence Title</label>
                    <input
                      type="text"
                      required
                      value={evidenceForm.title}
                      onChange={(e) => setEvidenceForm({ ...evidenceForm, title: e.target.value })}
                      placeholder="e.g. database_backup_config_log"
                      className="w-full px-3 py-2 text-sm rounded-lg glass-input text-slate-200"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">Framework</label>
                      <select
                        value={evidenceForm.framework}
                        onChange={(e) => setEvidenceForm({ ...evidenceForm, framework: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-200"
                      >
                        <option value="GDPR">GDPR</option>
                        <option value="SOX">SOX</option>
                        <option value="HIPAA">HIPAA</option>
                        <option value="NIST">NIST</option>
                        <option value="ISO 27001">ISO 27001</option>
                        <option value="PCI-DSS">PCI-DSS</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">Evidence Type</label>
                      <select
                        value={evidenceForm.evidence_type}
                        onChange={(e) => setEvidenceForm({ ...evidenceForm, evidence_type: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-200"
                      >
                        <option value="Configuration_Snapshot">Config Snapshot</option>
                        <option value="Access_Report">Access Report</option>
                        <option value="Encryption_Cert">Encryption Cert</option>
                        <option value="Audit_Log">Audit Log</option>
                        <option value="Training_Record">Training Record</option>
                        <option value="Report">Report Document</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Evidence Summary</label>
                    <textarea
                      rows="3"
                      required
                      value={evidenceForm.description}
                      onChange={(e) => setEvidenceForm({ ...evidenceForm, description: e.target.value })}
                      placeholder="Summarize the audit trail captured in this evidence..."
                      className="w-full px-3 py-2 text-xs rounded-lg glass-input text-slate-200"
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Incorporate Evidence
                  </button>
                </form>
              </div>

              <div className="col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-outfit text-lg font-bold text-white">Evidence Vault</h3>
                </div>

                <div className="space-y-3">
                  {evidence.map(ev => (
                    <div key={ev.id} className="glass-panel p-4 rounded-xl flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-grow">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-500 font-outfit uppercase tracking-wider">{ev.id}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">{ev.framework}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800/80 text-slate-300 border border-slate-700/50">{ev.evidence_type.replace("_", " ")}</span>
                          {ev.anomaly_marker && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                              {ev.anomaly_marker.replace("_", " ")}
                            </span>
                          )}
                        </div>
                        <h4 className="font-outfit font-bold text-white text-sm">{ev.title}</h4>
                        <p className="text-xs text-slate-300 font-medium">{ev.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                          <span>Source: {ev.source}</span> &bull; 
                          <span>Confidence: {(ev.confidence_score * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between h-full gap-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                          ev.status === "approved" ? "badge-green" :
                          ev.status === "rejected" ? "badge-red" : "badge-yellow"
                        }`}>
                          {ev.status}
                        </span>

                        <div className="flex gap-1.5 mt-2">
                          {ev.status === "pending" && (
                            <>
                              <button 
                                onClick={() => updateEvidenceStatus(ev.id, "approved")}
                                className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => updateEvidenceStatus(ev.id, "rejected")}
                                className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 rounded transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "mappings" && (
            <div className="space-y-6">
              <div className="glass-panel p-5 rounded-2xl flex justify-between items-center">
                <div>
                  <h3 className="font-outfit text-lg font-bold text-white">Compliance Linkages (NLP Mappings)</h3>
                  <p className="text-xs text-slate-400 mt-1">Showing relationships between evidence artifacts and policy requirements.</p>
                </div>
                <button 
                  onClick={runAutoMappingLocal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all"
                >
                  Regenerate Linkages
                </button>
              </div>

              <div className="space-y-3">
                {mappings.map(map => {
                  const ev = evidence.find(e => e.id === map.evidence_id);
                  return (
                    <div key={map.id} className="glass-panel p-4 rounded-xl border border-slate-800/80 flex items-center justify-between gap-6 glow-hover">
                      <div className="flex-1 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-indigo-400 font-outfit">Requirement</span>
                        <h4 className="text-xs font-semibold text-slate-100 line-clamp-2">{map.requirement_text}</h4>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700/50">
                          {(map.confidence * 100).toFixed(0)}% Match
                        </div>
                        <div className="h-0.5 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                        <span className="text-[8px] text-slate-500 uppercase font-bold">{map.mapping_type}</span>
                      </div>

                      <div className="flex-1 space-y-1">
                        <span className="text-[9px] uppercase font-bold text-emerald-400 font-outfit">Linked Evidence</span>
                        <h4 className="text-xs font-semibold text-slate-300 truncate">{map.evidence_title}</h4>
                      </div>

                      <button
                        onClick={() => removeMappingLocal(map.id)}
                        className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 rounded text-[11px] font-semibold transition-all"
                      >
                        Disconnect
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "gaps" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-5 rounded-2xl border-l-4 border-rose-500">
                  <h4 className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Missing Evidence Gaps</h4>
                  <p className="font-outfit text-3xl font-extrabold text-white mt-2">{metrics.gapCount}</p>
                </div>
                <div className="glass-panel p-5 rounded-2xl border-l-4 border-amber-500">
                  <h4 className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Stale Evidence Files</h4>
                  <p className="font-outfit text-3xl font-extrabold text-white mt-2">{metrics.staleCount}</p>
                </div>
                <div className="glass-panel p-5 rounded-2xl border-l-4 border-indigo-500">
                  <h4 className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Unreviewed Controls</h4>
                  <p className="font-outfit text-3xl font-extrabold text-white mt-2">{evidence.filter(e => e.status === "pending").length}</p>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-2xl space-y-4">
                <h3 className="font-outfit text-lg font-bold text-white">Gap Identification</h3>
                <div className="space-y-4">
                  {policies.flatMap(p => p.requirements).filter(r => !mappings.some(m => m.requirement_id === r.id)).map(req => (
                    <div key={req.id} className="p-4 bg-rose-500/5 border border-rose-500/15 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-400 border border-rose-500/20 uppercase">MISSING_CONTROL</span>
                        <h4 className="text-xs font-semibold text-slate-200 mt-1">{req.requirement_text}</h4>
                      </div>
                      <button onClick={() => setActiveTab("evidence")} className="px-3 py-1.5 bg-rose-500 text-white rounded text-xs font-bold transition-all">Resolve</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-panel p-6 rounded-2xl space-y-5 h-fit">
                <h3 className="font-outfit text-lg font-bold text-white">Generate Auditor Report</h3>
                <form onSubmit={handleGenerateReport} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Report Title</label>
                    <input
                      type="text"
                      required
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      placeholder="e.g. Q2 HIPAA Compliance Audit"
                      className="w-full px-3 py-2 text-sm rounded-lg glass-input text-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-medium">Report Type</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg glass-input text-slate-200"
                    >
                      <option value="internal">Internal Preparedness Audit</option>
                      <option value="external">Official External Auditor Package</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Compile Report
                  </button>
                </form>
              </div>

              <div className="col-span-2 space-y-6">
                <h3 className="font-outfit text-lg font-bold text-white">AI Narratives</h3>
                <div className="space-y-4">
                  {policies.flatMap(p => p.requirements).map(req => {
                    const narrative = narratives[req.id];
                    return (
                      <div key={req.id} className="glass-panel p-5 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="text-xs font-semibold text-slate-200">{req.requirement_text}</h4>
                          <button
                            onClick={() => generateAINarrative(req.id)}
                            className="px-2.5 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded text-[11px] font-bold transition-all flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            {narrativeLoading ? "Narrating..." : "Narrate"}
                          </button>
                        </div>
                        {narrative && (
                          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                            <p className="text-xs text-indigo-300 font-mono leading-relaxed">{narrative}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
