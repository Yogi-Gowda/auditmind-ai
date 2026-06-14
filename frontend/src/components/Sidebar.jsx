import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Database, GitMerge, AlertTriangle,
  FileText, Shield, ChevronLeft, ChevronRight, Activity, Brain,
  Gauge, Clock, FileBarChart, Sparkles
} from 'lucide-react';

const navItems = [
  { id: "overview", label: "Executive Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Report Analytics", icon: FileBarChart },
  { id: "findings", label: "Audit Findings", icon: AlertTriangle },
  { id: "ai-insights", label: "AI Insights", icon: Brain },
  { id: "risk", label: "Risk Scoring", icon: Gauge },
  { id: "compliance", label: "Compliance Status", icon: Shield },
  { id: "timeline", label: "Activity Timeline", icon: Clock },
  { id: "reports", label: "Report Center", icon: FileText },
  { id: "policies", label: "Policy Documents", icon: BookOpen },
  { id: "evidence", label: "Evidence Vault", icon: Database },
  { id: "mappings", label: "Compliance Mapping", icon: GitMerge },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 h-screen z-50 flex flex-col"
      style={{
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(24px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo Section */}
      <div className="px-3 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-2">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            }}
          >
            <Shield className="w-5 h-5 text-white" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <h1 className="font-outfit text-[15px] font-bold tracking-tight text-white whitespace-nowrap">
                  AuditMind AI
                </h1>
                <p className="text-[9px] text-slate-500 tracking-[0.12em] uppercase font-semibold whitespace-nowrap">
                  Compliance Intelligence
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden scroll-y">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              onClick={() => setActiveTab(item.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 relative group
                ${collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'}
                ${isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
              style={isActive ? {
                background: 'rgba(255,255,255,0.08)',
                boxShadow: '0 0 20px rgba(255,255,255,0.08)',
              } : {}}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-[20%] w-[3px] h-[60%] rounded-r-full"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.70), rgba(203,213,225,0.70))' }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <motion.div
                whileHover={{ rotate: isActive ? 0 : 5 }}
                transition={{ duration: 0.15 }}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
              </motion.div>

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[13px] font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[100]"
                  style={{
                    background: 'rgba(15,23,42,0.95)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {item.label}
                </div>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Collapse Toggle + Status */}
      <div className="px-2 py-3 border-t border-white/[0.06] space-y-2">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${collapsed ? 'justify-center' : ''}`}
          style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" style={{ animation: 'pulse-live 2s ease-in-out infinite' }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[11px] text-emerald-400 font-medium whitespace-nowrap"
              >
                System Online
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}

export function getSidebarWidth(collapsed) {
  return collapsed ? 72 : 240;
}
