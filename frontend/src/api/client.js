import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Taxonomy & Geography APIs
export const fetchStates = async () => {
  const response = await apiClient.get('/api/v1/taxonomy/states');
  return response.data;
};

export const fetchDistricts = async (stateCode = null) => {
  const url = stateCode ? `/api/v1/taxonomy/districts?state_code=${stateCode}` : '/api/v1/taxonomy/districts';
  const response = await apiClient.get(url);
  return response.data;
};

export const fetchSectors = async () => {
  const response = await apiClient.get('/api/v1/taxonomy/sectors');
  return response.data;
};

export const fetchOccupations = async (sectorCode = null) => {
  const url = sectorCode ? `/api/v1/taxonomy/occupations?sector_code=${sectorCode}` : '/api/v1/taxonomy/occupations';
  const response = await apiClient.get(url);
  return response.data;
};

// Page 3: AI Forecasting Engine APIs
export const fetchTradeForecastTrajectory = async ({
  districtCode = 'MH_PUNE',
  ncoCode = '7411.0100',
  horizonMonths = 12,
  capexBoostCr = 0.0,
  inflationRatePct = 5.5,
  fdiInflowCr = 0.0,
  stipendBoostPct = 0.0,
  modelType = 'ENSEMBLE'
}) => {
  const response = await apiClient.get('/api/v1/forecasting/trajectory', {
    params: {
      district_code: districtCode,
      nco_code: ncoCode,
      horizon_months: horizonMonths,
      capex_boost_cr: capexBoostCr,
      inflation_rate_pct: inflationRatePct,
      fdi_inflow_cr: fdiInflowCr,
      stipend_boost_pct: stipendBoostPct,
      model_type: modelType,
    },
  });
  return response.data;
};

export const fetchModelMetrics = async () => {
  const response = await apiClient.get('/api/v1/forecasting/model-metrics');
  return response.data;
};

// Page 5: Skill Graph & Career Transition APIs
export const fetchSkillNetworkTopology = async () => {
  const response = await apiClient.get('/api/v1/skills/network');
  return response.data;
};

export const fetchBridgeRecommendations = async (sourceNcoCode, surplusCandidates = 500) => {
  const response = await apiClient.get('/api/v1/skills/bridge-recommendations', {
    params: {
      source_nco_code: sourceNcoCode,
      surplus_candidates: surplusCandidates,
    },
  });
  return response.data;
};

export const fetchCurriculumAudit = async (ncoCode) => {
  const response = await apiClient.get(`/api/v1/curriculum/audit/${ncoCode}`);
  return response.data;
};

export const fetchRevisionAddendum = async (ncoCode) => {
  const response = await apiClient.post(`/api/v1/curriculum/generate-revision-addendum?nco_code=${ncoCode}`);
  return response.data;
};

