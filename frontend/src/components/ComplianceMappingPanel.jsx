import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GitMerge, ShieldCheck, Database, ArrowRight, CheckCircle, XCircle, AlertTriangle, Circle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

const computeMappingScore = (req, ev) => {
  let score = 0;
  const frameworksMatch = req.framework?.toLowerCase() === ev.framework?.toLowerCase();
  if (frameworksMatch) score += 0.35;
  if (req.framework?.toLowerCase().includes(ev.framework?.toLowerCase()) || ev.framework?.toLowerCase().includes(req.framework?.toLowerCase())) {
    score += 0.15;
  }

  const requirementText = `${req.requirement_text || ''} ${req.control_standard || ''}`.toLowerCase();
  const evidenceText = `${ev.title || ''} ${ev.description || ''}`.toLowerCase();
  const keywords = [
    'encrypt', 'access', 'log', 'monitor', 'audit', 'mfa', 'firewall', 'backup', 'privacy', 'certificate', 'policy', 'training', 'risk'
  ];

  const matchedKeywords = keywords.filter((keyword) => requirementText.includes(keyword) || evidenceText.includes(keyword));
  score += Math.min(matchedKeywords.length * 0.08, 0.35);

  if (ev.status === 'approved') score += 0.08;
  if (ev.confidence_score && ev.confidence_score > 0.8) score += 0.07;
  return Math.min(score, 1.0);
};

export default function ComplianceMappingPanel({ policies = [], evidence = [] }) {
  const [showMappings, setShowMappings] = useState(false);
  const [manualMappings, setManualMappings] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState('');

  const requirements = useMemo(() => policies.flatMap((p) => p.requirements || []), [policies]);

  const evidenceOptions = useMemo(() => evidence, [evidence]);

  const suggestedMappings = useMemo(() => {
    const items = [];
    requirements.forEach((req) => {
      evidenceOptions.forEach((ev) => {
        const score = computeMappingScore(req, ev);
        if (score >= 0.28) {
          items.push({ requirement: req, evidence: ev, score, type: 'auto' });
        }
      });
    });
    return items.sort((a, b) => b.score - a.score).slice(0, 18);
  }, [requirements, evidenceOptions]);

  const currentMappings = [...manualMappings, ...(showMappings ? suggestedMappings : [])];

  const selectedReq = requirements.find((req) => req.id === selectedRequirement);
  const selectedEv = evidenceOptions.find((ev) => ev.id === selectedEvidence);

  const handleAddManualMapping = () => {
    if (!selectedReq || !selectedEv) return;
    setManualMappings((existing) => [
      { requirement: selectedReq, evidence: selectedEv, score: 1.0, type: 'manual' },
      ...existing,
    ]);
    setSelectedRequirement('');
    setSelectedEvidence('');
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card card-glow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl border border-white/[0.10] bg-white/[0.06] flex items-center justify-center">
              <GitMerge className="w-5 h-5 text-slate-100" />
            </div>
            <div>
              <h3 className="chart-title font-outfit">Compliance Mapping</h3>
              <p className="chart-subtitle">Link evidence artifacts to extracted policy requirements.</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-black/20 p-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-200 font-medium">Auto-map evidence</p>
                <p className="text-xs text-slate-500">Generate suggested mappings from uploaded data.</p>
              </div>
              <button
                onClick={() => setShowMappings(true)}
                className="btn-primary text-sm px-4 py-2"
                disabled={requirements.length === 0 || evidenceOptions.length === 0}
              >
                Run Auto-Mapping
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs text-slate-400">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                <p className="font-semibold text-slate-100">Requirements</p>
                <p>{requirements.length} loaded</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                <p className="font-semibold text-slate-100">Evidence artifacts</p>
                <p>{evidenceOptions.length} loaded</p>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                <p className="font-semibold text-slate-100">Suggested mappings</p>
                <p>{showMappings ? suggestedMappings.length : 0}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/[0.08] bg-white/[0.03] p-5">
            <h4 className="text-sm font-semibold text-slate-100 mb-3">Manual mapping</h4>
            {requirements.length === 0 || evidenceOptions.length === 0 ? (
              <div className="text-sm text-slate-400">Upload policy and evidence data to enable manual mapping.</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <select
                    className="glass-input w-full"
                    value={selectedRequirement}
                    onChange={(e) => setSelectedRequirement(e.target.value)}
                  >
                    <option value="">Select requirement</option>
                    {requirements.map((req) => (
                      <option key={req.id} value={req.id}>{req.id} - {req.requirement_text.substring(0, 40)}...</option>
                    ))}
                  </select>
                  <select
                    className="glass-input w-full"
                    value={selectedEvidence}
                    onChange={(e) => setSelectedEvidence(e.target.value)}
                  >
                    <option value="">Select evidence</option>
                    {evidenceOptions.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.id} - {ev.title.substring(0, 40)}...</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={!selectedRequirement || !selectedEvidence}
                  onClick={handleAddManualMapping}
                  className="btn-primary w-full"
                >
                  Add Manual Mapping
                </button>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card card-glow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl border border-white/[0.10] bg-white/[0.06] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-slate-100" />
            </div>
            <div>
              <h3 className="chart-title font-outfit">Mapping Overview</h3>
              <p className="chart-subtitle">Review evidence-to-requirement connections and confidence.</p>
            </div>
          </div>

          {requirements.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/[0.08] bg-black/20 p-8 text-center text-slate-400">
              <AlertTriangle className="mx-auto mb-3 text-slate-400" size={26} />
              <p className="font-medium">No policy requirements loaded.</p>
              <p className="text-sm text-slate-500">Please upload a policy document to see mapping results.</p>
            </div>
          ) : evidenceOptions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/[0.08] bg-black/20 p-8 text-center text-slate-400">
              <Database className="mx-auto mb-3 text-slate-400" size={26} />
              <p className="font-medium">No evidence artifacts loaded.</p>
              <p className="text-sm text-slate-500">Upload evidence CSV to generate mapping suggestions.</p>
            </div>
          ) : currentMappings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/[0.08] bg-black/20 p-8 text-center text-slate-400">
              <ArrowRight className="mx-auto mb-3 text-slate-400" size={26} />
              <p className="font-medium">Auto-mapping is ready to run.</p>
              <p className="text-sm text-slate-500">Hit "Run Auto-Mapping" to generate recommended evidence links.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr>
                    <th>Requirement</th>
                    <th>Evidence</th>
                    <th>Framework</th>
                    <th>Confidence</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMappings.map((mapping, index) => (
                    <motion.tr key={`${mapping.requirement.id}-${mapping.evidence.id}-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}>
                      <td className="max-w-[280px] pr-4">
                        <div className="text-sm text-slate-200 font-medium truncate" title={mapping.requirement.requirement_text}>
                          {mapping.requirement.requirement_text}
                        </div>
                        <div className="text-[10px] text-slate-500">{mapping.requirement.id}</div>
                      </td>
                      <td className="max-w-[240px] pr-4">
                        <div className="text-sm text-slate-200 font-medium truncate" title={mapping.evidence.title}>
                          {mapping.evidence.title}
                        </div>
                        <div className="text-[10px] text-slate-500">{mapping.evidence.id}</div>
                      </td>
                      <td>
                        <span className="badge badge-slate text-[10px]">{mapping.requirement.framework || mapping.evidence.framework || 'Custom'}</span>
                      </td>
                      <td>
                        <span className="badge badge-green text-[10px]">{Math.round(mapping.score * 100)}%</span>
                      </td>
                      <td>
                        <span className={`badge ${mapping.type === 'manual' ? 'badge-green' : 'badge-yellow'} text-[10px]`}> {mapping.type} </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
