import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, FileText, Download, Filter,
  ArrowUpRight, ArrowDownRight, Calendar, PieChart as PieChartIcon
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'rgba(15,23,42,0.95)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: 12, padding: '12px 16px',
      backdropFilter: 'blur(16px)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <p className="text-xs text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-xs font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPanel({ data }) {
  const [animateCharts, setAnimateCharts] = useState(false);
  const { metrics, frameworkCoverage, reports } = data;

  useEffect(() => {
    const t = setTimeout(() => setAnimateCharts(true), 300);
    return () => clearTimeout(t);
  }, []);

  const statsCards = [
    { label: "Total Reports", value: reports.length.toString(), delta: "+12%", icon: FileText, color: "#6366f1" },
    { label: "Avg Compliance Score", value: `${metrics.compScore}%`, delta: "+4.2%", icon: TrendingUp, color: "#10b981" },
    { label: "Reports This Month", value: Math.ceil(reports.length * 0.8).toString(), delta: "+18%", icon: BarChart3, color: "#06b6d4" },
    { label: "Export Downloads", value: "284", delta: "+32%", icon: Download, color: "#8b5cf6" },
  ];

  // Derive report type distribution dynamically
  let internalCount = 0;
  let externalCount = 0;
  reports.forEach(r => {
    if (r.type === 'internal') internalCount++;
    else externalCount++;
  });
  
  const reportTypeDistribution = [
    { name: "Internal Audit", value: internalCount || 1, color: "#6366f1" },
    { name: "External Audit", value: externalCount || 1, color: "#06b6d4" },
  ];

  // Mocking volume data for visuals
  const reportVolumeData = [
    { month: "Jan", internal: Math.floor(internalCount * 0.5), external: Math.floor(externalCount * 0.5) },
    { month: "Feb", internal: Math.floor(internalCount * 0.8), external: Math.floor(externalCount * 0.8) },
    { month: "Mar", internal: Math.floor(internalCount * 0.9), external: Math.floor(externalCount * 0.9) },
    { month: "Apr", internal: internalCount, external: externalCount }
  ];

  const reportScoresTrend = [
    { month: "Jan", avgScore: Math.max(0, metrics.compScore - 15), avgRisk: Math.min(100, metrics.overallRisk + 15) },
    { month: "Feb", avgScore: Math.max(0, metrics.compScore - 10), avgRisk: Math.min(100, metrics.overallRisk + 10) },
    { month: "Mar", avgScore: Math.max(0, metrics.compScore - 5), avgRisk: Math.min(100, metrics.overallRisk + 5) },
    { month: "Apr", avgScore: metrics.compScore, avgRisk: metrics.overallRisk }
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              whileHover={{ y: -3 }}
              className="card card-glow card-shine p-5"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</span>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-outfit text-3xl font-extrabold text-white">{stat.value}</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />{stat.delta}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="card card-glow p-6">
          <h3 className="chart-title font-outfit">Report Generation Volume</h3>
          <p className="chart-subtitle">Monthly report output by type</p>
          <div className="h-[280px] mt-4">
            {animateCharts && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportVolumeData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="internal" fill="#6366f1" radius={[6, 6, 0, 0]} animationDuration={1200} />
                  <Bar dataKey="external" fill="#06b6d4" radius={[6, 6, 0, 0]} animationDuration={1400} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card card-glow p-6">
          <h3 className="chart-title font-outfit">Score & Risk Trends</h3>
          <p className="chart-subtitle">Compliance score vs risk score over time</p>
          <div className="h-[280px] mt-4">
            {animateCharts && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportScoresTrend}>
                  <defs>
                    <linearGradient id="gradScoreTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRiskTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="avgScore" stroke="#10b981" strokeWidth={2.5} fill="url(#gradScoreTrend)" name="Avg Score" animationDuration={1500} />
                  <Area type="monotone" dataKey="avgRisk" stroke="#f43f5e" strokeWidth={2} fill="url(#gradRiskTrend)" name="Avg Risk" animationDuration={1700} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="card card-glow p-6">
          <h3 className="chart-title font-outfit">Report Types</h3>
          <p className="chart-subtitle">Distribution by audit category</p>
          <div className="h-[220px] mt-2">
            {animateCharts && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportTypeDistribution}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={75}
                    paddingAngle={4} dataKey="value"
                    animationBegin={400} animationDuration={1200}
                  >
                    {reportTypeDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-1.5 mt-2">
            {reportTypeDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-slate-400">{item.name}</span>
                <span className="text-slate-300 font-semibold ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card card-glow p-6 col-span-1 lg:col-span-2">
          <h3 className="chart-title font-outfit">Framework Coverage Analysis</h3>
          <p className="chart-subtitle">Report count and compliance coverage per framework</p>
          <div className="mt-4 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Framework</th>
                  <th>Reports</th>
                  <th>Coverage</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {frameworkCoverage.map((fw, i) => (
                  <motion.tr
                    key={fw.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <td className="font-semibold text-white">{fw.name}</td>
                    <td>{fw.reports}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="bar-track flex-1" style={{ maxWidth: 120 }}>
                          <motion.div
                            className="bar-fill"
                            style={{
                              background: fw.coverage > 80 ? 'linear-gradient(90deg, #10b981, #34d399)' :
                                fw.coverage > 60 ? 'linear-gradient(90deg, #eab308, #fbbf24)' :
                                'linear-gradient(90deg, #f43f5e, #f87171)'
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${fw.coverage}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-300 w-10">{fw.coverage}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        fw.coverage > 80 ? 'badge-green' :
                        fw.coverage > 60 ? 'badge-yellow' : 'badge-red'
                      }`}>
                        <span className="badge-dot" />
                        {fw.coverage > 80 ? 'Strong' : fw.coverage > 60 ? 'Fair' : 'At Risk'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
