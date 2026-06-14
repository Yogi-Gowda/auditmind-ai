import React from 'react';
import { motion } from 'framer-motion';
import {
  Shield, CheckCircle, AlertTriangle, XCircle, Database, FileText
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function CompliancePanel({ policies = [] }) {
  const policyRequirements = policies.flatMap(p => p.requirements || []);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="card card-glow p-6 md:col-span-1">
          <h3 className="chart-title font-outfit flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-300" /> Policy Inventory
          </h3>
          <p className="chart-subtitle">Active compliance policies</p>
          
          <div className="mt-6 space-y-4">
            {policies.length === 0 ? (
              <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-6 text-center text-slate-400">
                <p className="text-sm font-medium">No policies loaded yet.</p>
                <p className="text-xs text-slate-500 mt-2">Upload a policy document to begin compliance analysis.</p>
              </div>
            ) : (
              policies.map((policy) => (
                <div key={policy.id} className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="badge badge-slate text-[10px]">{policy.framework}</span>
                    <span className="text-[10px] text-slate-500">{policy.id}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1 line-clamp-2">{policy.name}</h4>
                  <div className="flex justify-between items-center text-xs text-slate-400 mt-3">
                    <span>v{policy.version}</span>
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {policy.requirements.length} Reqs</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card card-glow p-6 md:col-span-2">
          <h3 className="chart-title font-outfit">Control Requirements</h3>
          <p className="chart-subtitle">Detailed mapping of policy requirements to controls</p>

          <div className="mt-6 overflow-x-auto">
            {policyRequirements.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.08] bg-black/30 p-10 text-center text-slate-400">
                <p className="text-sm font-medium">No control requirements available.</p>
                <p className="text-xs text-slate-500 mt-2">Load policy documents to extract requirements and view mappings.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Requirement</th>
                    <th>Framework</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {policyRequirements.map((req, i) => (
                    <motion.tr key={req.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                      <td className="max-w-md">
                        <div className="text-sm text-slate-200 font-medium mb-1 truncate" title={req.requirement_text}>
                          {req.requirement_text}
                        </div>
                        <div className="text-[10px] text-slate-500">{req.id} · {req.control_standard}</div>
                      </td>
                      <td>
                        <span className="badge badge-slate text-[10px]">{req.framework}</span>
                      </td>
                      <td>
                        <span className="text-xs text-slate-400 capitalize">{req.category.replace('_', ' ')}</span>
                      </td>
                      <td>
                        <span className={`badge ${req.status === 'active' ? 'badge-green' : 'badge-yellow'} text-[10px]`}>
                          {req.status === 'active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                          {req.status.toUpperCase()}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
