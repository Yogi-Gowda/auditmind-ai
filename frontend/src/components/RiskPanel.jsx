import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gauge, ShieldAlert, AlertTriangle, Shield, TrendingDown,
  ArrowRight, AlertCircle, MapPin
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { useCountUp } from '../hooks/useCountUp';
import { fetchRiskAssessment } from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <p className="text-xs text-slate-400 mb-2">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

const riskTrendData = [
  { month: "Jan", risk: 62, critical: 8, mitigated: 4 },
  { month: "Feb", risk: 55, critical: 6, mitigated: 7 },
  { month: "Mar", risk: 48, critical: 5, mitigated: 10 },
  { month: "Apr", risk: 45, critical: 4, mitigated: 12 },
  { month: "May", risk: 38, critical: 3, mitigated: 15 },
  { month: "Jun", risk: 33, critical: 2, mitigated: 18 },
];

const riskFactors = [
  { label: "Missing Evidence", weight: 35, score: 28, color: "#f43f5e", description: "Gaps where requirements lack mapped evidence artifacts" },
  { label: "Stale Evidence", weight: 20, score: 12, color: "#f97316", description: "Evidence artifacts exceeding freshness threshold" },
  { label: "Failed Controls", weight: 25, score: 18, color: "#eab308", description: "Controls with rejected or non-compliant evidence" },
  { label: "Policy Drift", weight: 10, score: 5, color: "#8b5cf6", description: "Policies not updated within required timeframes" },
  { label: "Vendor Risk", weight: 10, score: 8, color: "#06b6d4", description: "Third-party dependency security assessment gaps" },
];

const heatmapColors = ['rgba(34,197,94,0.15)', 'rgba(34,197,94,0.35)', 'rgba(234,179,8,0.4)', 'rgba(249,115,22,0.5)', 'rgba(244,63,94,0.6)'];
const heatmapLabels = ['None', 'Low', 'Medium', 'High', 'Critical'];

// Generate dynamic 5x7 heatmap
function generateDynamicHeatmap() {
  const data = [];
  for (let r = 0; r < 5; r++) {
    const row = [];
    for (let c = 0; c < 7; c++) {
      // Create some visual clustering based on typical risk densities
      let val = 0;
      if (r > 2 && c < 3) val = Math.floor(Math.random() * 3) + 2; // Higher risk bottom-left
      else if (r < 2 && c > 4) val = Math.floor(Math.random() * 2); // Lower risk top-right
      else val = Math.floor(Math.random() * 4); // Medium spread
      row.push(val);
    }
    data.push(row);
  }
  return data;
}

export default function RiskPanel({ data }) {
  const [localMetrics, setLocalMetrics] = useState(data?.metrics || { overallRisk: 0 });
  const [frameworkScores, setFrameworkScores] = useState(data?.frameworkScores || []);
  const [animateCharts, setAnimateCharts] = useState(false);
  const riskScore = useCountUp(localMetrics.overallRisk || 0, 2000);

  useEffect(() => {
    const t = setTimeout(() => setAnimateCharts(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Try to fetch authoritative risk score from backend
    fetchRiskAssessment()
      .then((res) => {
        if (res && typeof res.risk_score !== 'undefined') {
          setLocalMetrics((prev) => ({ ...prev, overallRisk: res.risk_score }));
        }
      })
      .catch((err) => {
        // keep client-side metrics if backend unavailable
        console.debug('Risk API unavailable', err);
      });
  }, []);

  const radarData = (frameworkScores || []).map(fw => ({
    framework: fw.name,
    score: fw.score,
    target: 90,
  }));

  const riskHeatmapData = generateDynamicHeatmap();

  const getRiskGrade = (score) => {
    if (score <= 20) return { grade: "A", label: "Excellent", color: "#22c55e" };
    if (score <= 35) return { grade: "B", label: "Good", color: "#10b981" };
    if (score <= 50) return { grade: "C", label: "Fair", color: "#eab308" };
    if (score <= 70) return { grade: "D", label: "Poor", color: "#f97316" };
    return { grade: "F", label: "Critical", color: "#f43f5e" };
  };

  const grade = getRiskGrade(localMetrics.overallRisk);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Risk Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Risk Gauge */}
        <motion.div variants={itemVariants} className="card card-glow p-6 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 80%, ${grade.color}08, transparent 60%)` }} />
          <div className="relative z-10">
            <h3 className="chart-title font-outfit">Overall Risk Score</h3>
            <p className="chart-subtitle">Weighted composite risk assessment</p>

            <div className="flex flex-col items-center py-6">
              <div className="relative">
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="76" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
                  <motion.circle
                    cx="90" cy="90" r="76"
                    fill="none" strokeWidth="14" strokeLinecap="round"
                    style={{
                      stroke: grade.color,
                      strokeDasharray: 478,
                      transformOrigin: 'center',
                      transform: 'rotate(-90deg)',
                      filter: `drop-shadow(0 0 8px ${grade.color}40)`,
                    }}
                    initial={{ strokeDashoffset: 478 }}
                    animate={{ strokeDashoffset: 478 - (478 * localMetrics.overallRisk / 100) }}
                    transition={{ duration: 2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-outfit text-4xl font-extrabold" style={{ color: grade.color }}>
                    {riskScore}
                  </span>
                  <span className="text-xs text-slate-500 mt-1 uppercase tracking-wider">/100</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-2xl font-outfit font-bold" style={{ color: grade.color }}>{grade.grade}</span>
                <span className="text-sm text-slate-400">{grade.label}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Risk Trend */}
        <motion.div variants={itemVariants} className="card card-glow p-6 col-span-1 lg:col-span-2">
          <h3 className="chart-title font-outfit">Risk Score Trend</h3>
          <p className="chart-subtitle">Risk mitigation progress over time</p>
          <div className="h-[280px] mt-4">
            {animateCharts && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskTrendData}>
                  <defs>
                    <linearGradient id="gradRiskTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradMitigated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gradRiskTrend)" name="Risk Score" animationDuration={1500} />
                  <Area type="monotone" dataKey="mitigated" stroke="#22c55e" strokeWidth={2} fill="url(#gradMitigated)" name="Mitigated" animationDuration={1700} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Risk Factors + Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Factors */}
        <motion.div variants={itemVariants} className="card card-glow p-6">
          <h3 className="chart-title font-outfit">Risk Factor Breakdown</h3>
          <p className="chart-subtitle">Contributing factors to overall risk score</p>
          <div className="space-y-4 mt-4">
            {riskFactors.map((factor, i) => (
              <motion.div
                key={factor.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: factor.color }} />
                    <span className="text-xs font-semibold text-slate-200">{factor.label}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">{factor.score}</span>/{factor.weight} pts
                  </span>
                </div>
                <div className="bar-track">
                  <motion.div
                    className="bar-fill"
                    style={{ background: factor.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(factor.score / factor.weight) * 100}%` }}
                    transition={{ duration: 1, delay: 0.6 + i * 0.1 }}
                  />
                </div>
                <p className="text-[10px] text-slate-600 mt-0.5">{factor.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Risk Heatmap */}
        <motion.div variants={itemVariants} className="card card-glow p-6">
          <h3 className="chart-title font-outfit">Risk Heatmap</h3>
          <p className="chart-subtitle">Risk severity distribution across control domains</p>
          
          <div className="mt-4">
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['IAM', 'ENC', 'NET', 'LOG', 'ACC', 'TRN', 'VEN'].map(label => (
                <div key={label} className="text-[9px] text-slate-600 uppercase tracking-wider font-semibold">{label}</div>
              ))}
            </div>
            <div className="space-y-1">
              {riskHeatmapData.map((row, ri) => (
                <div key={ri} className="grid grid-cols-7 gap-1">
                  {row.map((val, ci) => (
                    <motion.div
                      key={ci}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + (ri * 7 + ci) * 0.03, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                      className="hm-cell"
                      style={{
                        background: heatmapColors[val],
                        aspectRatio: '1',
                        borderRadius: 6,
                      }}
                      data-tooltip={`${heatmapLabels[val]} Risk`}
                    />
                  ))}
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-3 mt-4">
              {heatmapLabels.slice(0, 4).map((label, i) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: heatmapColors[i + 1] }} />
                  <span className="text-[10px] text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Chart */}
          <div className="h-[200px] mt-6">
            {animateCharts && (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="framework" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 9 }} />
                  <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} animationDuration={1500} />
                  <Radar name="Target" dataKey="target" stroke="#22c55e" fill="transparent" strokeWidth={1} strokeDasharray="4 4" animationDuration={1700} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
