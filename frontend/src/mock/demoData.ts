/**
 * LMIS Mock Data Provider
 * Provides realistic demo data when the backend is unavailable.
 * All values are illustrative examples from the PDF specification.
 * DEMO MODE — not verified statistics.
 */

export const DEMO_MODE = true; // Set to false when real backend is available

export const DEMO_OCCUPATIONS = [
  { code: 'EV-001', label: 'EV Technology Technician' },
  { code: 'SOL-002', label: 'Solar PV Installation Technician' },
  { code: 'DIES-003', label: 'Diesel Mechanic' },
  { code: 'WELD-004', label: 'Welder (SMAW)' },
  { code: 'HLTH-005', label: 'General Duty Assistant (Healthcare)' },
  { code: 'IT-006', label: 'Junior Software Developer' },
  { code: 'ELEC-007', label: 'Electrician (Industrial)' },
  { code: 'PLMB-008', label: 'Plumber' },
];

export const DEMO_PERIODS = ['2025-09', '2025-12', '2026-03', '2026-06', '2026-09'];

export interface MismatchAlert {
  id: string;
  trade: string;
  tradeCode: string;
  state: string;
  stateCode: string;
  district: string;
  districtCode: string;
  severity: 'ACUTE_SHORTAGE' | 'MODERATE_SHORTAGE' | 'BALANCED' | 'MILD_SURPLUS' | 'CHRONIC_SATURATION' | 'INTERMEDIATE_HIGH' | 'INTERMEDIATE_LOW';
  demand: number;
  supply: number;
  gap: number;
  ratio: number;
  action: string;
  capexCr?: number;
  capexSource?: string;
  itiSupply?: number;
  itiName?: string;
}

/** Priority Action Queue — PDF Section 2 illustrative examples */
export const DEMO_ALERTS: MismatchAlert[] = [
  {
    id: 'alert-1',
    trade: 'EV Technology Technician',
    tradeCode: 'EV-001',
    state: 'Maharashtra',
    stateCode: 'MH',
    district: 'Pune',
    districtCode: 'MH-020',
    severity: 'ACUTE_SHORTAGE',
    demand: 1200,
    supply: 320,
    gap: -880,
    ratio: 3.75,
    action: 'Double Intake',
    capexCr: 1300,
    capexSource: 'Tata Motors EV Plant (illustrative)',
    itiSupply: 120,
    itiName: 'ITI Aundh (illustrative)',
  },
  {
    id: 'alert-2',
    trade: 'Solar PV Installation Technician',
    tradeCode: 'SOL-002',
    state: 'Maharashtra',
    stateCode: 'MH',
    district: 'Nagpur',
    districtCode: 'MH-010',
    severity: 'MODERATE_SHORTAGE',
    demand: 680,
    supply: 260,
    gap: -420,
    ratio: 2.62,
    action: 'PMKK Mobile Unit',
    capexCr: 420,
    capexSource: 'Solar Park Phase II (illustrative)',
    itiSupply: 80,
    itiName: 'ITI Nagpur Central (illustrative)',
  },
  {
    id: 'alert-3',
    trade: 'Diesel Mechanic',
    tradeCode: 'DIES-003',
    state: 'Rajasthan',
    stateCode: 'RJ',
    district: 'Jodhpur',
    districtCode: 'RJ-012',
    severity: 'CHRONIC_SATURATION',
    demand: 200,
    supply: 850,
    gap: 650,
    ratio: 0.24,
    action: 'Freeze Intake',
    itiSupply: 320,
    itiName: 'ITI Jodhpur (illustrative)',
  },
  {
    id: 'alert-4',
    trade: 'Electrician (Industrial)',
    tradeCode: 'ELEC-007',
    state: 'Gujarat',
    stateCode: 'GJ',
    district: 'Surat',
    districtCode: 'GJ-008',
    severity: 'INTERMEDIATE_HIGH',
    demand: 900,
    supply: 620,
    gap: -280,
    ratio: 1.45,
    action: 'Increase Intake by 30%',
  },
  {
    id: 'alert-5',
    trade: 'General Duty Assistant (Healthcare)',
    tradeCode: 'HLTH-005',
    state: 'Uttar Pradesh',
    stateCode: 'UP',
    district: 'Lucknow',
    districtCode: 'UP-050',
    severity: 'BALANCED',
    demand: 450,
    supply: 400,
    gap: -50,
    ratio: 1.13,
    action: 'Monitor — No Action',
  },
];

export const DEMO_DEMAND_SUMMARY = {
  projected_demand: 20197,
  change_pct: 14,
  period: '2026-03',
};

export const DEMO_SUPPLY_SUMMARY = {
  training_supply_seats: 11400,
  period: '2026-03',
};

export const DEMO_NET_DEFICIT = -8797;

export const DEMO_AT_RISK_FUNDS_CR = 4.8;

export const DEMO_DEMAND_VS_SUPPLY = [
  { trade: 'EV Tech', demand: 1200, supply: 320 },
  { trade: 'Solar PV', demand: 680, supply: 260 },
  { trade: 'Electrician', demand: 900, supply: 620 },
  { trade: 'Healthcare GDA', demand: 450, supply: 400 },
  { trade: 'IT Dev', demand: 550, supply: 480 },
  { trade: 'Welder', demand: 310, supply: 390 },
];

/** CDI Factor Weights — illustrative, not validated scientific values */
export const DEMO_CDI_FACTORS = [
  { factor: 'Capex Signal', weight: 0.32 },
  { factor: 'Tender BoQ', weight: 0.22 },
  { factor: 'Job Portal', weight: 0.18 },
  { factor: 'EPFO Velocity', weight: 0.15 },
  { factor: 'Gig Signal', weight: 0.08 },
  { factor: 'Migration Flow', weight: 0.05 },
];

/**
 * India state GeoJSON data source documentation.
 * The map requires real GeoJSON boundary files for India states and districts.
 *
 * Required assets (not bundled — must be placed in /public/geo/):
 *   - /public/geo/india-states.geojson  (WGS84, state-level polygons)
 *   - /public/geo/india-districts.geojson (WGS84, district-level polygons)
 *
 * Recommended free source: https://github.com/geohacker/india (MIT license)
 * Alternative: Datameet India Maps (https://github.com/datameet/maps) (ODbL license)
 *
 * Properties expected on each feature:
 *   States:    { ST_NM: string, ST_CODE: string }
 *   Districts: { DISTRICT: string, ST_NM: string, DT_CODE: string, ST_CODE: string }
 */
export const GEO_DATA_DOCS = {
  statesUrl: '/geo/india-states.geojson',
  districtsUrl: '/geo/india-districts.geojson',
  note: 'GeoJSON boundary files are not bundled. See mock/demoData.ts for asset requirements.',
};

/** Severity classification per PDF spec */
export function classifySeverity(ratio: number): MismatchAlert['severity'] {
  if (ratio >= 1.60) return 'ACUTE_SHORTAGE';
  if (ratio >= 1.25) return 'INTERMEDIATE_HIGH';
  if (ratio >= 0.80) return 'BALANCED';
  if (ratio >= 0.50) return 'INTERMEDIATE_LOW';
  return 'CHRONIC_SATURATION';
}

export const SEVERITY_META: Record<MismatchAlert['severity'], { label: string; color: string; badgeClass: string }> = {
  ACUTE_SHORTAGE:    { label: 'Acute Shortage',       color: '#ef4444', badgeClass: 'badge-red'    },
  INTERMEDIATE_HIGH: { label: 'Elevated (1.25–1.60)', color: '#f97316', badgeClass: 'badge-orange' },
  BALANCED:          { label: 'Balanced',              color: '#10b981', badgeClass: 'badge-green'  },
  INTERMEDIATE_LOW:  { label: 'Emerging Surplus',      color: '#f59e0b', badgeClass: 'badge-yellow' },
  CHRONIC_SATURATION:{ label: 'Chronic Saturation',    color: '#a78bfa', badgeClass: 'badge-purple' },
  MODERATE_SHORTAGE: { label: 'Moderate Shortage',     color: '#fb923c', badgeClass: 'badge-orange' },
  MILD_SURPLUS:      { label: 'Mild Surplus',          color: '#facc15', badgeClass: 'badge-yellow' },
};
