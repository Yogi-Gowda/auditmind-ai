// src/utils/dataEngine.js

export function generateDashboardData(policies, evidence) {
  // 1. Core Metrics
  const totalReqs = policies.reduce((acc, p) => acc + (p.requirements?.length || 0), 0);
  const totalEv = evidence.length;
  
  const approved = evidence.filter(e => e.status === 'approved').length;
  const pending = evidence.filter(e => e.status === 'pending' || e.status === 'pending_review').length;
  const rejected = evidence.filter(e => e.status === 'rejected').length;
  const needsUpdate = evidence.filter(e => e.status === 'needs_update').length;
  
  const staleCount = evidence.filter(e => e.anomaly_marker === 'STALE_EVIDENCE').length;
  
  // Simulated mapping (evidence items mapping to reqs)
  // For a real app, this would be a join. Here we just estimate coverage.
  const coveredCount = Math.min(approved, totalReqs); 
  const gapCount = Math.max(0, totalReqs - coveredCount);
  const compScore = totalReqs > 0 ? Math.round((coveredCount / totalReqs) * 100) : 0;

  let riskValue = 15;
  if (gapCount > 0) riskValue += gapCount * 5;
  if (staleCount > 0) riskValue += staleCount * 4;
  if (rejected > 0) riskValue += rejected * 8;
  if (needsUpdate > 0) riskValue += needsUpdate * 5;
  const overallRisk = Math.min(Math.max(riskValue, 5), 100);

  const metrics = {
    totalReqs, totalEv, coveredCount, compScore,
    approved, pending, rejected, needsUpdate,
    staleCount, gapCount, overallRisk
  };

  // 2. Framework Scores & Coverage
  const frameworksMap = {};
  evidence.forEach(e => {
    const fw = e.framework || 'Custom';
    if (!frameworksMap[fw]) frameworksMap[fw] = { total: 0, approved: 0 };
    frameworksMap[fw].total++;
    if (e.status === 'approved') frameworksMap[fw].approved++;
  });

  const frameworkScores = Object.entries(frameworksMap).map(([name, counts]) => {
    const score = counts.total > 0 ? Math.round((counts.approved / counts.total) * 100) : 0;
    return {
      name,
      desc: `${counts.total} artifacts`,
      score,
      color: score > 80 ? 'from-emerald-500 to-emerald-600' : score > 60 ? 'from-amber-500 to-amber-600' : 'from-rose-500 to-rose-600'
    };
  }).sort((a, b) => b.score - a.score).slice(0, 6);

  if (frameworkScores.length === 0) {
    frameworkScores.push({ name: 'N/A', desc: 'No data', score: 0, color: 'from-slate-500 to-slate-600' });
  }

  const frameworkCoverage = frameworkScores.map(fw => ({
    name: fw.name,
    reports: frameworksMap[fw.name]?.total || 0,
    coverage: fw.score
  }));

  // 3. Severity Distribution (from anomalies / rejections)
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  evidence.forEach(e => {
    if (e.status === 'rejected') criticalCount++;
    else if (e.anomaly_marker) highCount++;
    else if (e.status === 'needs_update') mediumCount++;
    else if (e.status === 'pending' || e.status === 'pending_review') lowCount++;
  });

  const severityDistribution = [
    { name: "Critical", value: criticalCount || 1, color: "#f43f5e" },
    { name: "High", value: highCount || 2, color: "#f97316" },
    { name: "Medium", value: mediumCount || 3, color: "#eab308" },
    { name: "Low", value: lowCount || 4, color: "#22c55e" },
  ];

  // 4. Findings
  const findings = [];
  evidence.filter(e => e.status === 'rejected' || e.status === 'needs_update' || e.anomaly_marker).forEach((e, idx) => {
    let severity = 'medium';
    if (e.status === 'rejected') severity = 'critical';
    else if (e.anomaly_marker) severity = 'high';

    findings.push({
      id: `FND-${Date.now()}-${idx}`,
      severity,
      title: e.anomaly_marker ? `Anomaly Detected: ${e.anomaly_marker.replace('_', ' ')}` : `Evidence ${e.status.replace('_', ' ')}`,
      description: `Artifact "${e.title}" mapped to ${e.framework} requires attention.`,
      framework: e.framework,
      requirement: e.id,
      evidence: e.id,
      status: 'open',
      assignee: e.collected_by || 'System',
      detected: new Date().toLocaleDateString(),
      impact: severity === 'critical' ? 'High risk of compliance failure.' : 'Potential gap in audit trail.',
      recommendation: 'Review and update the evidence artifact.'
    });
  });

  // 5. AI Insights
  const aiInsights = findings.slice(0, 4).map((f, i) => ({
    id: i,
    type: f.severity === 'critical' ? 'urgent' : f.severity === 'high' ? 'warning' : 'info',
    title: f.title,
    description: f.description,
    action: "Review Finding",
    impact: f.severity === 'critical' ? 'High' : 'Medium'
  }));
  
  if (approved > 0 && aiInsights.length < 4) {
    aiInsights.push({
      id: 99, type: "success", title: "Strong Coverage", 
      description: `${approved} artifacts have been successfully approved.`,
      action: "View Evidence", impact: "Positive"
    });
  }

  // 6. Reports
  const reports = frameworkScores.map((fw, i) => ({
    id: `REP-100${i}`,
    title: `${fw.name} Compliance Report`,
    type: i % 2 === 0 ? "external" : "internal",
    framework: fw.name,
    score: fw.score,
    created_at: new Date().toISOString(),
    risk_score: 100 - fw.score
  }));

  // 7. Timeline
  const activityFeed = evidence.slice(-8).reverse().map((e, i) => {
    let type = 'info';
    let action = `Evidence "${e.title}" uploaded.`;
    if (e.status === 'approved') { type = 'success'; action = `Evidence "${e.title}" was approved.`; }
    else if (e.status === 'rejected') { type = 'critical'; action = `Evidence "${e.title}" was rejected.`; }
    else if (e.anomaly_marker) { type = 'warning'; action = `Anomaly ${e.anomaly_marker} detected on "${e.title}".`; }
    
    return {
      id: i,
      action,
      type,
      time: e.collection_date || 'Just now',
      user: e.collected_by || 'System'
    };
  });

  // Mocking trends for visual charts based on current score
  const complianceTrendData = [
    { month: "Jan", "Score": Math.max(0, compScore - 15) },
    { month: "Feb", "Score": Math.max(0, compScore - 10) },
    { month: "Mar", "Score": Math.max(0, compScore - 5) },
    { month: "Apr", "Score": compScore }
  ];

  return {
    metrics,
    frameworkScores,
    severityDistribution,
    findings,
    aiInsights,
    reports,
    activityFeed,
    frameworkCoverage,
    complianceTrendData
  };
}
