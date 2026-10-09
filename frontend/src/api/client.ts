// Central API client for LMIS backend
import axios from 'axios';

const API_BASE = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lmis_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lmis_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Taxonomy ───────────────────────────────────────────────────────────────
export const taxonomyApi = {
  getStates: () => api.get('/taxonomy/states'),
  getDistricts: (state_code?: string) => api.get('/taxonomy/districts', { params: { state_code } }),
  getSectors: () => api.get('/taxonomy/sectors'),
  getOccupations: (params?: { sector_code?: string; is_emerging?: boolean; is_legacy_at_risk?: boolean }) =>
    api.get('/taxonomy/occupations', { params }),
  matchJob: (query_text: string, top_k = 5) =>
    api.post('/taxonomy/match-job', { query_text, top_k }),
};

// ─── Demand ──────────────────────────────────────────────────────────────────
export const demandApi = {
  getSignals: (params?: { district_code?: string; nco_code?: string; period?: string; skip?: number; limit?: number }) =>
    api.get('/demand/signals', { params }),
  getCapex: (params?: { district_code?: string; sector_code?: string }) =>
    api.get('/demand/capex', { params }),
  getCDI: (params?: { district_code?: string; nco_code?: string; period?: string }) =>
    api.get('/demand/cdi', { params }),
  getSummary: (period = '2026-03') => api.get('/demand/summary', { params: { period } }),
};

// ─── Supply ──────────────────────────────────────────────────────────────────
export const supplyApi = {
  getCenters: (params?: { district_code?: string; center_type?: string }) =>
    api.get('/supply/centers', { params }),
  getEffective: (params?: { district_code?: string; nco_code?: string; period?: string }) =>
    api.get('/supply/effective', { params }),
  getSummary: (period = '2026-03') => api.get('/supply/summary', { params: { period } }),
};

// ─── Forecasting ─────────────────────────────────────────────────────────────
export const forecastingApi = {
  getTrajectory: (district_code: string, nco_code: string, horizon_months = 12) =>
    api.get('/forecasting/trajectory', { params: { district_code, nco_code, horizon_months } }),
  getModelMetrics: () => api.get('/forecasting/model-metrics'),
};

// ─── Mismatch ────────────────────────────────────────────────────────────────
export const mismatchApi = {
  getDashboard: (params?: { period?: string; state_code?: string }) =>
    api.get('/mismatch/dashboard', { params }),
  getDistrictDrilldown: (district_code: string, period = '2026-03') =>
    api.get(`/mismatch/district/${district_code}`, { params: { period } }),
};

// ─── Skills / Bridge ─────────────────────────────────────────────────────────
export const skillsApi = {
  getBridgeRecommendations: (source_nco_code: string, surplus_candidates = 500) =>
    api.get('/skills/bridge-recommendations', { params: { source_nco_code, surplus_candidates } }),
  getNetwork: () => api.get('/skills/network'),
};

// ─── Simulation ──────────────────────────────────────────────────────────────
export const simulationApi = {
  runWhatIf: (payload: Record<string, unknown>) =>
    api.post('/simulation/what-if', payload),
  getPresets: () => api.get('/simulation/presets'),
};

// ─── Optimizer ───────────────────────────────────────────────────────────────
export const optimizerApi = {
  optimize: (payload: Record<string, unknown>) =>
    api.post('/optimizer/optimize', payload),
};

// ─── Curriculum ──────────────────────────────────────────────────────────────
export const curriculumApi = {
  auditCurriculum: (nco_code: string) => api.get(`/curriculum/audit/${nco_code}`),
  getHighRiskTrades: (min_obsolescence_pct = 25.0) =>
    api.get('/curriculum/high-risk-trades', { params: { min_obsolescence_pct } }),
  generateRevisionAddendum: (nco_code: string) =>
    api.post('/curriculum/generate-revision-addendum', null, { params: { nco_code } }),
};

// ─── Mobility ────────────────────────────────────────────────────────────────
export const mobilityApi = {
  getCorridors: (min_gravity_score = 10.0) =>
    api.get('/mobility/corridors', { params: { min_gravity_score } }),
  simulateRelocation: (payload: Record<string, unknown>) =>
    api.post('/mobility/simulate-relocation-policy', payload),
};

// ─── Obsolescence ────────────────────────────────────────────────────────────
export const obsolescenceApi = {
  getTradeRiskMatrix: () => api.get('/obsolescence/trade-risk-matrix'),
  getDistrictVulnerability: (district_code: string, district_name: string) =>
    api.get('/obsolescence/district-vulnerability', { params: { district_code, district_name } }),
  generatePreemptivePathway: (source_nco_code: string) =>
    api.post('/obsolescence/generate-preemptive-pathway', null, { params: { source_nco_code } }),
};

// ─── CSR ─────────────────────────────────────────────────────────────────────
export const csrApi = {
  getOpportunities: () => api.get('/csr/opportunities'),
  generateBankableDPR: (params: { district_code: string; corporate_partner: string; target_nco_code: string }) =>
    api.post('/csr/generate-bankable-dpr', null, { params }),
  calculateSROI: (params: Record<string, number>) =>
    api.get('/csr/sroi-calculator', { params }),
};

// ─── Gati Shakti ─────────────────────────────────────────────────────────────
export const gatiShaktiApi = {
  getCorridors: () => api.get('/gati-shakti/corridors'),
  getCatchmentAudit: (node_id_or_district: string, catchment_radius_km = 50.0) =>
    api.get('/gati-shakti/catchment-audit', { params: { node_id_or_district, catchment_radius_km } }),
  simulateExpansion: (params: Record<string, unknown>) =>
    api.post('/gati-shakti/simulate-corridor-expansion', null, { params }),
};

// ─── Tenders ─────────────────────────────────────────────────────────────────
export const tendersApi = {
  getPipeline: () => api.get('/tenders/pipeline'),
  parseBoq: (payload: Record<string, unknown>) =>
    api.post('/tenders/parse-and-extract-boq', payload),
};

// ─── Proxies ─────────────────────────────────────────────────────────────────
export const proxiesApi = {
  getMaterialConsumption: () => api.get('/proxies/material-consumption'),
};

// ─── Lego / Micro-credentials ────────────────────────────────────────────────
export const legoApi = {
  getPivotRecommendation: (params?: Record<string, unknown>) =>
    api.get('/lego/pivot-recommendation', { params }),
};

// ─── Exports ─────────────────────────────────────────────────────────────────
export const exportsApi = {
  getSanctionPlanCsv: (params?: { target_cycle?: string; max_seat_variation_pct?: number; state_code?: string }) =>
    api.get('/exports/sanction-plan-csv', { params, responseType: 'blob' }),
  getExecutivePolicyBrief: (period = '2026-03') =>
    api.get('/exports/executive-policy-brief', { params: { period } }),
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) => {
    const form = new URLSearchParams();
    form.append('username', username);
    form.append('password', password);
    return api.post('/auth/token', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  me: () => api.get('/auth/me'),
};

// ─── Health ──────────────────────────────────────────────────────────────────
export const healthApi = {
  check: () => api.get('/health', { baseURL: '' }),
};

// ─── Migration Heatmaps ──────────────────────────────────────────────────────
export const migrationApi = {
  getRailwayTransitFlows: () => api.get('/migration-heatmaps/railway-transit-flows'),
};

// ─── WhatsApp Gig Signal ─────────────────────────────────────────────────────
export const whatsappApi = {
  ingestGigSignal: (payload: Record<string, unknown>) =>
    api.post('/whatsapp/ingest-gig-signal', payload),
};
