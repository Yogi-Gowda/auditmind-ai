import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import OverviewPanel from './components/OverviewPanel';
import AnalyticsPanel from './components/AnalyticsPanel';
import FindingsPanel from './components/FindingsPanel';
import AIInsightsPanel from './components/AIInsightsPanel';
import RiskPanel from './components/RiskPanel';
import CompliancePanel from './components/CompliancePanel';
import TimelinePanel from './components/TimelinePanel';
import ReportsPanel from './components/ReportsPanel';
import PoliciesPanel from './components/PoliciesPanel';
import EvidencePanel from './components/EvidencePanel';

// Data
import ComplianceMappingPanel from './components/ComplianceMappingPanel';
import { generateDashboardData } from './utils/dataEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");

  // Lifted state for uploaded data
  const [policies, setPolicies] = useState([]);
  const [evidence, setEvidence] = useState([]);

  // Dynamically generate all dashboard data based on current policies and evidence
  const dashboardData = useMemo(() => {
    return generateDashboardData(policies, evidence);
  }, [policies, evidence]);

  // Panel routing
  const renderPanel = () => {
    switch (activeTab) {
      case "overview": return <OverviewPanel data={dashboardData} />;
      case "analytics": return <AnalyticsPanel data={dashboardData} />;
      case "findings": return <FindingsPanel data={dashboardData} />;
      case "ai-insights": return <AIInsightsPanel data={dashboardData} />;
      case "risk": return <RiskPanel data={dashboardData} />;
      case "compliance": return <CompliancePanel policies={policies} />;
      case "timeline": return <TimelinePanel data={dashboardData} />;
      case "reports": return <ReportsPanel data={dashboardData} />;
      case "policies": return <PoliciesPanel policies={policies} setPolicies={setPolicies} />;
      case "evidence": return <EvidencePanel evidence={evidence} setEvidence={setEvidence} />;
      case "mappings": return <ComplianceMappingPanel policies={policies} evidence={evidence} />;
      default: return <OverviewPanel data={dashboardData} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-radial text-slate-100 overflow-hidden relative">
      
      {/* Ambient background effects */}
      <div className="bg-ambient pointer-events-none">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-orb bg-orb-4" />
      </div>

      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-10"
        style={{ marginLeft: '72px' }}
      >
        <div className="flex-1 flex flex-col md:ml-[72px] lg:ml-[240px] transition-all duration-300">
          <TopBar activeTab={activeTab} />
          
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto scroll-y">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderPanel()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
