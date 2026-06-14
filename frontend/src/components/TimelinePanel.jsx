import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, CheckCircle, Info, AlertTriangle, Clock } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

const typeConfig = {
  critical: { icon: ShieldAlert, color: "#f43f5e", bg: "rgba(244,63,94,0.15)" },
  warning:  { icon: AlertTriangle, color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  info:     { icon: Info, color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  success:  { icon: CheckCircle, color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
};

export default function TimelinePanel({ data }) {
  const { activityFeed } = data;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-6">
      <div className="card card-glow p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 border border-white/[0.10]">
            <Activity className="w-5 h-5 text-slate-100" />
          </div>
          <div>
            <h3 className="chart-title font-outfit m-0">Activity Timeline</h3>
            <p className="chart-subtitle m-0 mt-0.5">Real-time audit and compliance events</p>
          </div>
        </div>

        <div className="relative pl-6 border-l border-white/[0.08] space-y-8 pb-4">
          {activityFeed.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No recent activity logged.
            </div>
          ) : (
            activityFeed.map((event, i) => {
              const config = typeConfig[event.type] || typeConfig.info;
              const Icon = config.icon;

              return (
                <motion.div key={event.id} variants={itemVariants} className="relative">
                  {/* Timeline Dot */}
                  <div 
                    className="absolute -left-[35px] w-8 h-8 rounded-full flex items-center justify-center border border-slate-900"
                    style={{ background: config.bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>

                  <div className="card bg-white/[0.02] border-white/[0.05] p-4 hover:bg-white/[0.04] transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: config.color }}>
                        {event.type}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>
                        <span>·</span>
                        <span>{event.user}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200">{event.action}</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
