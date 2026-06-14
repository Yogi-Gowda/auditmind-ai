import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Upload, FileText, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function PoliciesPanel({ policies, setPolicies }) {
  const [policyForm, setPolicyForm] = useState({ name: "", framework: "GDPR", content: "" });
  const [dragActive, setDragActive] = useState(false);

  const parsePolicyText = (content, name, framework) => {
    const lines = content.split("\n");
    const parsedReqs = [];
    let reqNum = 1;
    const newPolicyId = `POL-CUST-${Date.now()}`;

    lines.forEach(line => {
      // Look for lines starting with "REQUIREMENT X:" or similar
      if (line.trim().toLowerCase().includes("requirement")) {
        const text = line.replace(/requirement\s*\d*[:\-]?\s*/gi, "").trim();
        if (text) {
          parsedReqs.push({
            id: `REQ-${Date.now()}-${reqNum++}`,
            policy_id: newPolicyId,
            framework: framework,
            requirement_text: text,
            category: "compliance",
            control_standard: "Custom",
            severity: "high",
            status: "active"
          });
        }
      }
    });

    // Fallback if no specific requirements found
    if (parsedReqs.length === 0) {
      parsedReqs.push({
        id: `REQ-${Date.now()}-1`,
        policy_id: newPolicyId,
        framework: framework,
        requirement_text: content.substring(0, 150) + "...",
        category: "compliance",
        control_standard: "Custom",
        severity: "medium",
        status: "active"
      });
    }

    const newPolicy = {
      id: newPolicyId,
      name: name || "Uploaded Custom Policy",
      framework: framework,
      version: "1.0",
      status: "Active",
      last_updated: new Date().toISOString().split("T")[0],
      content: content,
      requirements: parsedReqs
    };

    // Replace or prepend? The user requested "analysis to be done only on those files"
    // Let's replace the policies to focus purely on the uploaded ones
    setPolicies([newPolicy]);
    setPolicyForm({ name: "", framework: "GDPR", content: "" });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/plain" && !file.name.toLowerCase().endsWith(".txt")) {
      alert("Please upload a valid .txt policy file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const fileName = file.name.replace(/\.[^.]+$/, "");
      parsePolicyText(content, fileName, policyForm.framework);
      alert(`Policy "${fileName}" parsed successfully!`);
    };
    reader.readAsText(file);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!policyForm.content) return;
    parsePolicyText(policyForm.content, policyForm.name || "Manual Policy Entry", policyForm.framework);
    alert("Manual policy added successfully!");
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Section */}
        <motion.div variants={itemVariants} className="card card-glow p-6 lg:col-span-1 h-fit">
          <h3 className="chart-title font-outfit flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-100" /> Ingest Policy Document
          </h3>
          <p className="chart-subtitle">Upload .txt files to run analysis exclusively on your documents.</p>

          <div 
            className={`mt-6 border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              dragActive ? 'border-slate-200 bg-white/[0.08]' : 'border-slate-700 bg-white/[0.02] hover:border-slate-500'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileUpload({ target: { files: [file] } });
            }}
          >
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6 text-slate-200" />
            </div>
            <p className="text-sm text-slate-300 font-medium mb-1">Drag & Drop .txt policy file</p>
            <p className="text-[11px] text-slate-500 mb-4">or click to browse from your computer</p>
            
            <label className="btn-primary cursor-pointer inline-flex">
              Browse Files
              <input type="file" accept=".txt,text/plain" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="divider-glow my-6"></div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1 block">Framework Focus</label>
              <select
                value={policyForm.framework}
                onChange={(e) => setPolicyForm({ ...policyForm, framework: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg glass-input"
              >
                <option value="GDPR">GDPR (Privacy)</option>
                <option value="SOX">SOX (Financial)</option>
                <option value="HIPAA">HIPAA (Healthcare)</option>
                <option value="NIST">NIST (Cybersecurity)</option>
                <option value="ISO 27001">ISO 27001 (Security)</option>
                <option value="PCI-DSS">PCI-DSS (Payments)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1 block">Manual Policy Text</label>
              <textarea
                rows="4"
                value={policyForm.content}
                onChange={(e) => setPolicyForm({ ...policyForm, content: e.target.value })}
                placeholder="REQUIREMENT 1: Data must be encrypted..."
                className="w-full px-3 py-2 text-xs rounded-lg glass-input font-mono"
              ></textarea>
            </div>
            <button type="submit" className="w-full btn-ghost border border-white/[0.12] text-slate-100">
              Parse Manual Entry
            </button>
          </form>
        </motion.div>

        {/* Loaded Policies Display */}
        <motion.div variants={itemVariants} className="card card-glow p-6 lg:col-span-2">
          <h3 className="chart-title font-outfit flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-200" /> Active Policies
          </h3>
          <p className="chart-subtitle">Currently active policies driving the dashboard analysis</p>

          <div className="mt-4 space-y-4 max-h-[600px] overflow-y-auto pr-2 scroll-y">
            {policies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-800 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-slate-600 mb-3" />
                <p className="text-sm text-slate-400 font-medium">No policies loaded.</p>
                <p className="text-xs text-slate-500">Upload a policy to begin analysis.</p>
              </div>
            ) : (
              policies.map(policy => (
                <motion.div key={policy.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-500/60" />
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-base font-semibold text-white">{policy.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">ID: {policy.id} &bull; v{policy.version}</p>
                    </div>
                    <span className="badge badge-slate text-xs">{policy.framework}</span>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap line-clamp-3 group-hover:line-clamp-none transition-all">
                      {policy.content}
                    </p>
                  </div>

                  <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Extracted Requirements ({policy.requirements.length})</h5>
                  <div className="space-y-2">
                    {policy.requirements.map(req => (
                      <div key={req.id} className="flex gap-3 items-start bg-slate-800/30 p-2 rounded border border-slate-800/50">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200">{req.requirement_text}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
