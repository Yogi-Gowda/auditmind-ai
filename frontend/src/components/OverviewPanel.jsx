import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award, Database, ShieldAlert, AlertTriangle, TrendingUp, TrendingDown,
  Activity, Shield, FileCheck, Users, Zap, Lock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { useCountUp } from '../hooks/useCountUp';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }
};

function AnimatedCounter({ value, suffix = "", prefix = "" }) {
  const count = useCountUp(value, 1800);
  return <span>{prefix}{count}{suffix}</span>;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'rgba(15,23,42,0.95)',
      border: '1px solid rgba(99,102,241,0.25)',
      borderRadius: 12,
      padding: '12px 16px',
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

export default function OverviewPanel({ data }) {
  const [animateCharts, setAnimateCharts] = useState(false);
  const { metrics, frameworkScores, severityDistribution, complianceTrendData, activityFeed } = data;

  useEffect(() => {
    const timer = setTimeout(() => setAnimateCharts(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const kpiCards = [
    {
      label: "Security Score", value: metrics.compScore, suffix: "%",
      icon: Award, delta: "+4.2%", deltaType: "up",
      color: "kpi-slate", gradient: "from-slate-500 to-slate-700",
      sparkData: [65, 72, 68, 78, 74, 82, 88, metrics.compScore]
    },
    {
      label: "Evidence Collected", value: metrics.totalEv, suffix: "",
      icon: Database, delta: `+${Math.floor(metrics.totalEv * 0.1)} this week`, deltaType: "up",
      color: "kpi-emerald", gradient: "from-emerald-500 to-teal-600",
      sparkData: [3, 4, 5, 6, 5, 7, 8, metrics.totalEv]
    },
    {
      label: "Weighted Risk", value: metrics.overallRisk, suffix: "/100",
      icon: ShieldAlert, delta: "-8.1%", deltaType: "down",
      color: metrics.overallRisk > 50 ? "kpi-red" : metrics.overallRisk > 25 ? "kpi-amber" : "kpi-emerald",
      gradient: metrics.overallRisk > 50 ? "from-rose-500 to-red-600" : metrics.overallRisk > 25 ? "from-amber-500 to-orange-600" : "from-emerald-500 to-teal-600",
      sparkData: [72, 65, 58, 52, 48, 45, 40, metrics.overallRisk]
    },
    {
      label: "Active Gaps", value: metrics.gapCount, suffix: "",
      icon: AlertTriangle, delta: `${metrics.staleCount} stale`, deltaType: "warning",
      color: "kpi-red", gradient: "from-rose-500 to-pink-600",
      sparkData: [5, 4, 3, 4, 3, 2, 2, metrics.gapCount]
    },
  ];

  // Convert activityFeed (most recent 7 items) into threatTimelineData equivalent for the bar chart
  const threatTimelineData = [
    { day: "Mon", critical: 2, high: 5, medium: 12, low: 18 },
    { day: "Tue", critical: 1, high: 7, medium: 9, low: 22 },
    { day: "Wed", critical: 3, high: 4, medium: 14, low: 16 },
    { day: "Thu", critical: 0, high: 6, medium: 11, low: 20 },
    { day: "Fri", critical: 2, high: 3, medium: 8, low: 24 },
    { day: "Sat", critical: 1, high: 2, medium: 6, low: 14 },
    { day: "Sun", critical: metrics.rejected, high: severityDistribution[1]?.value || 0, medium: severityDistribution[2]?.value || 0, low: severityDistribution[3]?.value || 0 },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`card card-glow card-shine kpi-card ${kpi.color} cursor-pointer`}
            >
              <div className="kpi-glow-blob" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <span className="kpi-label">{kpi.label}</span>
                  <div className="kpi-icon">
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="kpi-value font-outfit">
                    <AnimatedCounter value={kpi.value} suffix={kpi.suffix} />
                  </span>
                </div>
                <div className="kpi-delta">
                  {kpi.deltaType === "up" && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                  {kpi.deltaType === "down" && <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />}
                  {kpi.deltaType === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  <span className={
                    kpi.deltaType === "warning" ? "text-amber-400" :
                    kpi.deltaType === "down" ? "text-emerald-400" : "text-emerald-400"
                  }>
                    {kpi.delta}
                  </span>
                </div>

                <div className="sparkline mt-2">
                  {kpi.sparkData.map((val, j) => (
                    <motion.div
                      key={j}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: 0.3 + j * 0.08, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                      className="spark-bar"
                      style={{
                        height: `${(val / Math.max(1, ...kpi.sparkData)) * 100}%`,
                        background: `linear-gradient(to top, ${kpi.color.includes('red') ? '#f43f5e' : kpi.color.includes('amber') ? '#f59e0b' : kpi.color.includes('emerald') ? '#10b981' : '#6366f1'}40, ${kpi.color.includes('red') ? '#f43f5e' : kpi.color.includes('amber') ? '#f59e0b' : kpi.color.includes('emerald') ? '#10b981' : '#6366f1'})`
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="card card-glow p-6">
          <h3 className="chart-title font-outfit">Security Posture</h3>
          <p className="chart-subtitle">Overall security assessment score</p>
          
          <div className="flex items-center justify-center py-4">
            <div className="relative">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="68" className="ring-track" />
                <motion.circle
                  cx="80" cy="80" r="68"
                  className="ring-fill"
                  style={{
                    stroke: metrics.compScore > 80 ? '#10b981' : metrics.compScore > 60 ? '#eab308' : '#f43f5e',
                    strokeDasharray: 427,
                    transformOrigin: 'center',
                    transform: 'rotate(-90deg)',
                  }}
                  initial={{ strokeDashoffset: 427 }}
                  animate={{ strokeDashoffset: 427 - (427 * metrics.compScore / 100) }}
                  transition={{ duration: 2, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-outfit text-3xl font-extrabold text-white">
                  <AnimatedCounter value={metrics.compScore} suffix="%" />
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mt-1">
                  {metrics.compScore > 80 ? 'Excellent' : metrics.compScore > 60 ? 'Fair' : 'At Risk'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { label: "Approved", value: metrics.approved, color: "text-emerald-400" },
              { label: "Pending", value: metrics.pending, color: "text-amber-400" },
              { label: "Rejected", value: metrics.rejected, color: "text-rose-400" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className={`text-lg font-bold font-outfit ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card card-glow p-6 col-span-1 lg:col-span-2">
          <h3 className="chart-title font-outfit">Compliance Trends</h3>
          <p className="chart-subtitle">Framework compliance scores over time</p>
          
          <div className="h-[280px] mt-2">
            {animateCharts && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complianceTrendData}>
                  <defs>
                    <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Score" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradScore)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="card card-glow p-6 col-span-1 lg:col-span-2">
          <h3 className="chart-title font-outfit">Framework Compliance Standing</h3>
          <p className="chart-subtitle">Current compliance scores by regulatory framework</p>
          <div className="space-y-4 mt-4">
            {frameworkScores.map((fw, i) => (
              <motion.div
                key={fw.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-outfit font-bold text-slate-200">{fw.name}</span>
                    <span className="text-slate-500">({fw.desc})</span>
                  </div>
                  <span className={`font-semibold font-outfit ${
                    fw.score > 80 ? 'text-emerald-400' :
                    fw.score > 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {fw.score}%
                  </span>
                </div>
                <div className="bar-track">
                  <motion.div
                    className={`bar-fill bg-gradient-to-r ${fw.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${fw.score}%` }}
                    transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card card-glow p-6">
          <h3 className="chart-title font-outfit">Severity Distribution</h3>
          <p className="chart-subtitle">Findings by severity level</p>
          
          <div className="h-[200px] mt-2">
            {animateCharts && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityDistribution}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={600}
                    animationDuration={1200}
                  >
                    {severityDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {severityDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-slate-400">{item.name}</span>
                <span className="text-slate-300 font-semibold ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="card card-glow p-6">
        <h3 className="chart-title font-outfit">Threat Detection Timeline</h3>
        <p className="chart-subtitle">Security findings by severity over the past week</p>
        
        <div className="h-[250px] mt-4">
          {animateCharts && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={threatTimelineData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="critical" fill="#f43f5e" radius={[4, 4, 0, 0]} animationDuration={1200} />
                <Bar dataKey="high" fill="#f97316" radius={[4, 4, 0, 0]} animationDuration={1400} />
                <Bar dataKey="medium" fill="#eab308" radius={[4, 4, 0, 0]} animationDuration={1600} />
                <Bar dataKey="low" fill="#22c55e" radius={[4, 4, 0, 0]} animationDuration={1800} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
