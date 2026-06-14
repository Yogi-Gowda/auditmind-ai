import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, AlertCircle, Info, ExternalLink, CheckCircle, Clock } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const severityConfig = {
  critical: { icon: ShieldAlert, color: "#f43f5e", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.2)", badge: "sev-critical" },
  high:     { icon: AlertTriangle, color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)", badge: "sev-high" },
  medium:   { icon: AlertCircle, color: "#eab308", bg: "rgba(234,179,8,0.08)", border: "rgba(234,179,8,0.2)", badge: "sev-medium" },
  low:      { icon: Info, color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", badge: "sev-low" },
};

const statusConfig = {
  open:       { label: "Open", icon: AlertCircle, color: "#f43f5e" },
  "in-review":{ label: "In Review", icon: Clock, color: "#eab308" },
  resolved:   { label: "Resolved", icon: CheckCircle, color: "#22c55e" },
};

export default function FindingsPanel({ data }) {
  const { findings } = data;

  const summary = {
    critical: findings.filter(f => f.severity === "critical").length,
    high: findings.filter(f => f.severity === "high").length,
    medium: findings.filter(f => f.severity === "medium").length,
    low: findings.filter(f => f.severity === "low").length,
    open: findings.filter(f => f.status === "open").length,
    resolved: findings.filter(f => f.status === "resolved").length,
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Critical", count: summary.critical, config: severityConfig.critical },
          { label: "High", count: summary.high, config: severityConfig.high },
          { label: "Medium", count: summary.medium, config: severityConfig.medium },
          { label: "Low", count: summary.low, config: severityConfig.low },
        ].map((item, i) => {
          const Icon = item.config.icon;
          return (
            <motion.div
              key={item.label}
              variants={itemVariants}
              whileHover={{ y: -3 }}
              className="card card-glow p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: item.config.bg, border: `1px solid ${item.config.border}` }}>
                <Icon className="w-5 h-5" style={{ color: item.config.color }} />
              </div>
              <div>
                <div className="font-outfit text-2xl font-bold text-white">{item.count}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{item.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Findings List */}
      <div className="space-y-3">
        {findings.length === 0 ? (
          <div className="card card-glow p-8 text-center text-slate-400">
            No active findings detected in the current data.
          </div>
        ) : (
          findings.map((finding, i) => {
            const sevConfig = severityConfig[finding.severity] || severityConfig.medium;
            const statConfig = statusConfig[finding.status] || statusConfig.open;
            const SevIcon = sevConfig.icon;
            const StatIcon = statConfig.icon;

            return (
              <motion.div
                key={finding.id}
                variants={itemVariants}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
                className="card card-glow p-5 cursor-pointer"
                style={{ borderLeft: `3px solid ${sevConfig.color}` }}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge ${sevConfig.badge} text-[10px]`}>
                        <SevIcon className="w-3 h-3" />{finding.severity.toUpperCase()}
                      </span>
                      <span className="badge badge-slate text-[10px]">{finding.framework}</span>
                      <div className="flex items-center gap-1 text-[10px]" style={{ color: statConfig.color }}>
                        <StatIcon className="w-3 h-3" />
                        <span className="font-semibold">{statConfig.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 ml-auto">{finding.id}</span>
                    </div>
                    
                    <h4 className="text-sm font-semibold text-white">{finding.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{finding.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span>Detected: <span className="text-slate-300">{finding.detected}</span></span>
                      <span>Assigned: <span className="text-slate-300">{finding.assignee}</span></span>
                      {finding.requirement !== "N/A" && (
                        <span>Req: <span className="text-slate-100">{finding.requirement}</span></span>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 space-y-2 md:w-72 md:border-l md:border-white/[0.06] md:pl-4">
                    <div>
                      <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Impact</span>
                      <p className="text-xs text-slate-400 mt-0.5">{finding.impact}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Recommendation</span>
                      <p className="text-xs text-emerald-400/80 mt-0.5">{finding.recommendation}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
