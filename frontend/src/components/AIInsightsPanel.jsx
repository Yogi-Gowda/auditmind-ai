import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, ArrowRight, ShieldAlert, AlertTriangle, Lightbulb, CheckCircle, Zap, TrendingUp } from 'lucide-react';
import { generateBulkNarratives } from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const typeConfig = {
  urgent:  { icon: ShieldAlert, color: "#f43f5e", bg: "rgba(244,63,94,0.06)", border: "rgba(244,63,94,0.15)", borderLeft: "#f43f5e", gradient: "from-rose-500/10 to-transparent" },
  warning: { icon: AlertTriangle, color: "#eab308", bg: "rgba(234,179,8,0.06)", border: "rgba(234,179,8,0.15)", borderLeft: "#eab308", gradient: "from-amber-500/10 to-transparent" },
  info:    { icon: Lightbulb, color: "#06b6d4", bg: "rgba(6,182,212,0.06)", border: "rgba(6,182,212,0.15)", borderLeft: "#06b6d4", gradient: "from-cyan-500/10 to-transparent" },
  success: { icon: CheckCircle, color: "#22c55e", bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.15)", borderLeft: "#22c55e", gradient: "from-emerald-500/10 to-transparent" },
};

export default function AIInsightsPanel({ data }) {
  const { aiInsights = [], metrics = {} } = data || {};
  const [insights, setInsights] = React.useState(aiInsights || []);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const refreshInsights = async () => {
    setIsRefreshing(true);
    try {
      const result = await generateBulkNarratives();
      setInsights(result.narratives || []);
    } catch (err) {
      console.error('Bulk narrative refresh failed', err);
      alert('Failed to refresh AI insights.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header Card */}
      <motion.div
        variants={itemVariants}
        className="card card-glow p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-slate-900/60" />
        <div className="relative z-10 flex items-start gap-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
              border: '1px solid rgba(99,102,241,0.2)',
              boxShadow: '0 0 30px rgba(99,102,241,0.15)',
            }}
          >
            <Brain className="w-7 h-7 text-slate-100" />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-outfit text-lg font-bold text-white">AI Compliance Engine</h3>
              <Sparkles className="w-4 h-4 text-slate-100" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              Continuously analyzing your compliance posture across frameworks. 
              The AI engine has processed {metrics.totalEv} evidence artifacts, and {metrics.totalReqs} policy requirements to generate actionable intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-3">
              <div className="flex items-center gap-4 flex-wrap">
                {[
                  { label: "Insights Generated", value: insights.length, icon: Zap },
                  { label: "Overall Risk", value: `${metrics.overallRisk}%`, icon: TrendingUp },
                  { label: "Accuracy Score", value: "96.2%", icon: Brain },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-slate-100" />
                      <span className="text-xs text-slate-500">{stat.label}:</span>
                      <span className="text-xs text-white font-semibold">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={refreshInsights}
                disabled={isRefreshing}
                className="btn-ghost text-xs font-semibold px-4 py-2 border border-white/[0.12]"
              >
                {isRefreshing ? 'Refreshing...' : 'Regenerate Narratives'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.length === 0 ? (
          <div className="col-span-full card card-glow p-8 text-center text-slate-400">
            No intelligence insights generated yet.
          </div>
        ) : (
          insights.map((insight, i) => {
            const config = typeConfig[insight.type] || typeConfig.info;
            const Icon = config.icon;

            return (
              <motion.div
                key={insight.id}
                variants={itemVariants}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
                className="ai-insight cursor-pointer group"
                style={{ borderLeftColor: config.borderLeft }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: config.bg, border: `1px solid ${config.border}` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`ai-badge ${insight.type}`}>{insight.type}</span>
                      <span className="text-[10px] text-slate-600">
                        Impact: <span className="font-semibold" style={{ color: config.color }}>{insight.impact}</span>
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1">{insight.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{insight.description}</p>
                    {insight.details && (
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{insight.details}</p>
                    )}
                    <motion.button
                      whileHover={{ x: 4 }}
                      className="ai-cta mt-2"
                    >
                      <Sparkles className="w-3 h-3" />
                      {insight.action}
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </motion.button>
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
