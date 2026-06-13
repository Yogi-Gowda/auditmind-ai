import axios from 'axios';

// Base API Configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Policies
export const fetchPolicies = async () => {
  const res = await client.get('/policies');
  return res.data;
};

export const uploadPolicy = async (name, framework, content) => {
  const res = await client.post('/policies/upload', { name, framework, content });
  return res.data;
};

export const fetchPolicyRequirements = async (policyId) => {
  const res = await client.get(`/policies/${policyId}/requirements`);
  return res.data;
};

export const fetchAllRequirements = async (framework = null, category = null) => {
  const params = {};
  if (framework) params.framework = framework;
  if (category) params.category = category;
  const res = await client.get('/policies/requirements/all', { params });
  return res.data;
};

// Evidence
export const fetchEvidence = async (framework = null, reviewStatus = null, source = null) => {
  const params = {};
  if (framework) params.framework = framework;
  if (reviewStatus) params.review_status = reviewStatus;
  if (source) params.source = source;
  const res = await client.get('/evidence', { params });
  return res.data;
};

export const fetchEvidenceStats = async () => {
  const res = await client.get('/evidence/stats');
  return res.data;
};

export const uploadSingleEvidence = async (evidenceData) => {
  const res = await client.post('/evidence/upload', evidenceData);
  return res.data;
};

export const uploadEvidenceCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await client.post('/evidence/upload/csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const reviewEvidence = async (evidenceId, status, notes = '') => {
  const res = await client.put(`/evidence/${evidenceId}/review`, { status, notes });
  return res.data;
};

// Compliance & Mapping
export const runAutoMapping = async () => {
  const res = await client.post('/compliance/map');
  return res.data;
};

export const createManualMapping = async (requirementId, evidenceId, notes = '') => {
  const res = await client.post('/compliance/map/manual', {
    requirement_id: requirementId,
    evidence_id: evidenceId,
    notes,
  });
  return res.data;
};

export const fetchMappings = async () => {
  const res = await client.get('/compliance/mappings');
  return res.data;
};

export const deleteMapping = async (mappingId) => {
  const res = await client.delete(`/compliance/mappings/${mappingId}`);
  return res.data;
};

export const fetchComplianceScore = async () => {
  const res = await client.get('/compliance/score');
  return res.data;
};

export const fetchComplianceGaps = async (framework = null) => {
  const params = {};
  if (framework) params.framework = framework;
  const res = await client.get('/compliance/gaps', { params });
  return res.data;
};

export const fetchRiskAssessment = async () => {
  const res = await client.get('/compliance/risk');
  return res.data;
};

// Narratives
export const generateNarrative = async (requirementId) => {
  const res = await client.post('/narratives/generate', { requirement_id: requirementId });
  return res.data;
};

export const fetchNarrative = async (requirementId) => {
  const res = await client.get(`/narratives/${requirementId}`);
  return res.data;
};

// Reports
export const generateReport = async (title, reportType, framework = null) => {
  const res = await client.post('/reports/generate', {
    title,
    report_type: reportType,
    framework,
  });
  return res.data;
};

export const fetchReportsList = async () => {
  const res = await client.get('/reports');
  return res.data;
};

export const getReportPdfUrl = (reportId) => {
  return `${API_BASE}/reports/${reportId}/pdf`;
};

export const getReportJsonUrl = (reportId) => {
  return `${API_BASE}/reports/${reportId}/json`;
};
