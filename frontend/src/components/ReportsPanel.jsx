import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Play,
  Search,
  Filter,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export default function ReportsPanel() {
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);

    setTimeout(() => {
      const newReport = {
        id: `REP${Math.floor(100 + Math.random() * 900)}`,
        title: "On-Demand Full Stack Audit",
        type: "internal",
        framework: "All",
        score: Math.floor(Math.random() * 20) + 75,
        created_at: new Date().toISOString(),
        risk_score: Math.floor(Math.random() * 30) + 10,
      };

      setReports((prev) => [newReport, ...prev]);
      setGenerating(false);
    }, 2000);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            placeholder="Search reports..."
            className="glass-input rounded-xl pl-9 pr-4 py-2 text-sm w-full sm:w-72"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="btn-ghost flex-1 sm:flex-none flex items-center justify-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Generate Report
              </>
            )}

            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {reports.length === 0 ? (
            <motion.div
              className="card card-glow p-8 col-span-full text-center text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="font-medium mb-2">
                No reports have been generated yet.
              </p>

              <p className="text-sm text-slate-500">
                Generate a report after uploading policies and evidence.
              </p>
            </motion.div>
          ) : (
            reports.map((report) => (
              <motion.div
                key={report.id}
                layout
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.2 },
                }}
                className="card card-glow p-5 flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/[0.10] flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-100" />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {report.id}
                      </span>

                      <div className="flex gap-1 mt-0.5">
                        <span className="badge badge-slate text-[9px]">
                          {report.framework}
                        </span>

                        <span
                          className={`badge text-[9px] ${
                            report.type === "external"
                              ? "badge-orange"
                              : "badge-cyan"
                          }`}
                        >
                          {report.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2 flex-1">
                  {report.title}
                </h4>

                <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-2 text-center">
                    <div className="text-lg font-outfit font-bold text-emerald-400">
                      {report.score}%
                    </div>

                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
                      Score
                    </div>
                  </div>

                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-2 text-center">
                    <div className="text-lg font-outfit font-bold text-rose-400">
                      {report.risk_score}
                    </div>

                    <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
                      Risk
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/[0.06]">
                  <span className="text-[10px] text-slate-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>

                  <button
                    className="text-slate-200 hover:text-white transition-colors p-1"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}