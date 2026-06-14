import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, User, Sparkles, Settings, HelpCircle } from 'lucide-react';

export default function TopBar({ activeTab }) {
  const tabLabels = {
    overview: "Executive Overview",
    analytics: "Report Analytics",
    findings: "Audit Findings",
    "ai-insights": "AI Insights",
    risk: "Risk Scoring",
    compliance: "Compliance Status",
    timeline: "Activity Timeline",
    reports: "Report Center",
    policies: "Policy Documents",
    evidence: "Evidence Vault",
    mappings: "Compliance Mapping",
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="topbar"
      style={{ justifyContent: 'space-between' }}
    >
      {/* Left: Page Title */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="font-outfit text-lg font-bold tracking-tight text-white">
            {tabLabels[activeTab] || "Dashboard"}
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time compliance monitoring · Last updated 2 min ago
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search policies, evidence, reports..."
            className="glass-input rounded-xl pl-9 pr-4 py-2 text-xs w-64 focus:w-80 transition-all duration-300"
          />
        </div>

        {/* AI Status */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-200" />
          <span className="text-[11px] text-slate-200 font-medium">AI Engine Active</span>
        </motion.div>

        {/* Notification Bell */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="btn-icon relative"
        >
          <Bell className="w-4 h-4" />
          <span className="notification-dot" />
        </motion.button>

        {/* Help */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="btn-icon hidden md:flex"
        >
          <HelpCircle className="w-4 h-4" />
        </motion.button>

        {/* User Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="avatar w-9 h-9 text-xs cursor-pointer"
        >
          YK
        </motion.div>
      </div>
    </motion.header>
  );
}
