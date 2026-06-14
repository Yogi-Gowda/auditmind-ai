import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Database, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Clock, Filter } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function EvidencePanel({ evidence, setEvidence }) {
  const [dragActive, setDragActive] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const parseCSV = (csvText) => {
    const lines = csvText.split("\n");
    if (lines.length < 2) return;

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple split (handles basic CSV without commas in quotes)
      // More robust split to handle quotes if needed: line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, ''));
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] ? values[idx].trim() : "";
      });

      // Construct Evidence Object mapping actual CSV headers
      results.push({
        id: row.evidence_id || row.id || `EVD-CUST-${Date.now()}-${i}`,
        title: row.requirement_description || row.title || `Custom Evidence ${i}`,
        description: row.evidence_summary || row.description || "Imported from custom CSV",
        source: row.evidence_location || row.source || "CSV Import",
        framework: row.framework || "Custom",
        evidence_type: row.evidence_type || "Report",
        collected_by: row.collected_by || "Unknown",
        collection_date: row.collection_date || new Date().toISOString().split("T")[0],
        confidence_score: parseFloat(row.confidence_score) || 0.85,
        status: row.status ? row.status.toLowerCase() : "pending",
        anomaly_marker: row.anomaly_marker || ""
      });
    }

    if (results.length > 0) {
      setEvidence(results);
      setStatusFilter("All");
      alert(`Successfully imported ${results.length} evidence artifacts!`);
    } else {
      alert("No valid rows found in the CSV file.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv") && !file.name.toLowerCase().endsWith(".txt")) {
      alert("Please upload a .csv or .txt file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      parseCSV(event.target.result);
    };
    reader.readAsText(file);
  };

  const filteredEvidence = useMemo(() => {
    if (statusFilter === "All") return evidence;
    return evidence.filter(ev => ev.status === statusFilter.toLowerCase());
  }, [evidence, statusFilter]);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Section */}
        <motion.div variants={itemVariants} className="card card-glow p-6 lg:col-span-1 h-fit">
          <h3 className="chart-title font-outfit flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-100" /> Evidence Vault Import
          </h3>
          <p className="chart-subtitle">Upload .csv files to analyze your specific evidence data.</p>

          <div 
            className={`mt-6 border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              dragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700 bg-white/[0.02] hover:border-slate-500'
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
              <FileSpreadsheet className="w-6 h-6 text-slate-200" />
            </div>
            <p className="text-sm text-slate-300 font-medium mb-1">Drag & Drop .csv evidence file</p>
            <p className="text-[11px] text-slate-500 mb-4">Auto-maps evidence_id, requirement_description, etc.</p>
            
            <label className="btn-primary cursor-pointer inline-flex" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              Browse CSV File
              <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="mt-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <h4 className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Supported Columns
            </h4>
            <div className="text-[10px] text-slate-400 font-mono whitespace-pre overflow-x-auto">
              evidence_id, requirement_description,<br/>
              framework, status, confidence_score,<br/>
              evidence_summary, anomaly_marker
            </div>
          </div>
        </motion.div>

        {/* Loaded Evidence Display */}
        <motion.div variants={itemVariants} className="card card-glow p-6 lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
            <div>
              <h3 className="chart-title font-outfit flex items-center gap-2 mb-1">
                <Database className="w-5 h-5 text-emerald-400" /> Loaded Evidence
              </h3>
              <p className="chart-subtitle m-0">These artifacts are actively being mapped to requirements.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-1.5 border border-slate-700">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  className="bg-transparent text-xs text-slate-200 focus:outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending_Review">Pending Review</option>
                  <option value="Needs_Update">Needs Update</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <span className="badge badge-slate text-xs">{filteredEvidence.length} / {evidence.length}</span>
            </div>
          </div>

          <div className="mt-4 overflow-y-auto max-h-[600px] pr-2 scroll-y space-y-3">
            {filteredEvidence.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-800 rounded-xl">
                <Database className="w-8 h-8 text-slate-600 mb-3" />
                <p className="text-sm text-slate-400 font-medium">No evidence artifacts found.</p>
                <p className="text-xs text-slate-500">Try changing the filter or uploading a new CSV.</p>
              </div>
            ) : (
              filteredEvidence.map(ev => (
                <motion.div key={ev.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-4 hover:border-slate-600 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-semibold text-white truncate pr-4" title={ev.title}>{ev.title}</h4>
                      <span className={`badge text-[9px] flex-shrink-0 ${
                        ev.status === 'approved' ? 'badge-green' : 
                        ev.status === 'rejected' ? 'badge-red' : 
                        ev.status === 'needs_update' ? 'badge-orange' : 'badge-yellow'
                      }`}>
                        {ev.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {(ev.status === 'pending' || ev.status === 'pending_review') && <Clock className="w-3 h-3 mr-1" />}
                        {(ev.status === 'rejected' || ev.status === 'needs_update') && <AlertTriangle className="w-3 h-3 mr-1" />}
                        {ev.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-2">{ev.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                      <span className="font-medium text-slate-300">ID: {ev.id}</span>
                      <span>Framework: <span className="text-slate-300">{ev.framework}</span></span>
                      {ev.evidence_type && <span>Type: {ev.evidence_type.replace('_', ' ')}</span>}
                      <span>Score: {(ev.confidence_score * 100).toFixed(0)}%</span>
                      {ev.anomaly_marker && <span className="text-rose-400 border border-rose-500/20 px-1.5 rounded">{ev.anomaly_marker.replace('_', ' ')}</span>}
                    </div>
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
