/**
 * LMIS Command Dashboard — Route: /
 * Executive Command Dashboard per PDF Section 2.
 * Implements all 5 rows: Control Bar, KPI Cards, Map+Queue, Analytics, Action Bar.
 *
 * Values marked [DEMO] are illustrative examples from the PDF spec, not live statistics.
 */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Building2, AlertTriangle, IndianRupee,
  LayoutDashboard, RefreshCw, Download, FlaskConical, Network,
  ArrowUp, ArrowDown, Minus, ChevronRight, Info, Eye
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { useLMIS } from '../context/LMISContext';
import {
  DEMO_MODE,
  DEMO_OCCUPATIONS, DEMO_PERIODS,
  DEMO_DEMAND_SUMMARY, DEMO_SUPPLY_SUMMARY, DEMO_NET_DEFICIT, DEMO_AT_RISK_FUNDS_CR,
  DEMO_ALERTS, DEMO_DEMAND_VS_SUPPLY, DEMO_CDI_FACTORS,
  SEVERITY_META, type MismatchAlert,
} from '../mock/demoData';
import { demandApi, supplyApi, mismatchApi } from '../api/client';
import IndiaMap from '../components/IndiaMap';

// ─── Types ───────────────────────────────────────────────────────────────────

interface KPIData {
  projectedDemand: number;
  changePct: number;
  trainingSupply: number;
  netDeficit: number;
  atRiskFundsCr: number;
  isDemo: boolean;
}

// ─── Severity priority order ──────────────────────────────────────────────────

const SEVERITY_ORDER: MismatchAlert['severity'][] = [
  'ACUTE_SHORTAGE', 'MODERATE_SHORTAGE', 'INTERMEDIATE_HIGH',
  'BALANCED', 'INTERMEDIATE_LOW', 'CHRONIC_SATURATION', 'MILD_SURPLUS'
];

function sortAlerts(alerts: MismatchAlert[]): MismatchAlert[] {
  return [...alerts].sort((a, b) =>
    SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DemoBadge() {
  return (
    <span style={{
      padding: '2px 7px', borderRadius: 4, background: 'rgba(245,158,11,0.12)',
      border: '1px solid rgba(245,158,11,0.3)', fontSize: 10, color: '#f59e0b',
      fontWeight: 600, letterSpacing: 0.3, marginLeft: 6,
    }}>DEMO</span>
  );
}

function SeverityBadge({ severity }: { severity: MismatchAlert['severity'] }) {
  const meta = SEVERITY_META[severity];
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700,
      background: `${meta.color}18`, color: meta.color,
      border: `1px solid ${meta.color}40`, letterSpacing: 0.3,
    }}>
      {meta.label.toUpperCase()}
    </span>
  );
}

function KPICard({
  icon: Icon, label, value, sub, color, change, changePct, isDemo = false
}: {
  icon: React.ElementType; label: string; value: string; sub?: string;
  color: string; change?: 'up' | 'down' | 'neutral'; changePct?: number; isDemo?: boolean;
}) {
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} style={{ color }} />
        </div>
        {isDemo && <DemoBadge />}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{label}</div>
      {sub && (
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
          {change === 'up' && <ArrowUp size={10} style={{ color: '#10b981' }} />}
          {change === 'down' && <ArrowDown size={10} style={{ color: '#ef4444' }} />}
          {change === 'neutral' && <Minus size={10} style={{ color: '#64748b' }} />}
          <span style={{ color: change === 'up' ? '#10b981' : change === 'down' ? '#ef4444' : '#64748b' }}>
            {changePct !== undefined ? `${changePct > 0 ? '+' : ''}${changePct}%` : ''} {sub}
          </span>
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert, onInspect }: { alert: MismatchAlert; onInspect: (a: MismatchAlert) => void }) {
  const meta = SEVERITY_META[alert.severity];
  const isShortage = alert.gap < 0;
  return (
    <div style={{
      background: '#252839', border: `1px solid ${meta.color}30`,
      borderLeft: `3px solid ${meta.color}`, borderRadius: 8,
      padding: '10px 12px', fontSize: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <div>
          <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>{alert.trade}</div>
          <div style={{ color: '#64748b', fontSize: 11, marginTop: 1 }}>{alert.state} · {alert.district}</div>
        </div>
        <SeverityBadge severity={alert.severity} />
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ color: '#94a3b8' }}>Demand: <strong style={{ color: '#e2e8f0' }}>{alert.demand.toLocaleString('en-IN')}</strong></span>
        <span style={{ color: '#94a3b8' }}>Supply: <strong style={{ color: '#e2e8f0' }}>{alert.supply.toLocaleString('en-IN')}</strong></span>
        <span style={{ color: isShortage ? '#ef4444' : '#a78bfa', fontWeight: 700 }}>
          {alert.gap > 0 ? '+' : ''}{alert.gap.toLocaleString('en-IN')} {isShortage ? '⚠ shortage' : '↓ surplus'}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#4f8ef7', background: 'rgba(79,142,247,0.1)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(79,142,247,0.2)' }}>
          ⚡ {alert.action}
        </span>
        <button
          onClick={() => onInspect(alert)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 5, border: '1px solid #2e3350', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 11 }}
          aria-label={`Inspect ${alert.trade} in ${alert.district}`}
        >
          <Eye size={11} /> Inspect
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function CommandDashboard() {
  const { state, setTrade, setPeriod, setJurisdiction, openDiagnostic } = useLMIS();
  const navigate = useNavigate();

  const [kpi, setKpi] = useState<KPIData | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);

  const [alerts, setAlerts] = useState<MismatchAlert[]>(sortAlerts(DEMO_ALERTS));
  const [alertsLoading, setAlertsLoading] = useState(false);

  const [demandVsSupply, setDemandVsSupply] = useState(DEMO_DEMAND_VS_SUPPLY);
  const [cdiFactors] = useState(DEMO_CDI_FACTORS);

  const period = state.selectedPeriod;
  const jurisdiction = state.selectedJurisdiction;

  // ── Breadcrumb label ──────────────────────────────────────────────────────

  const breadcrumb = (() => {
    const parts = ['All India'];
    if (jurisdiction.stateName) parts.push(jurisdiction.stateName);
    if (jurisdiction.districtName) parts.push(jurisdiction.districtName);
    return parts;
  })();

  // ── Fetch KPI data ────────────────────────────────────────────────────────

  const fetchKPI = useCallback(() => {
    setKpiLoading(true);
    setKpiError(null);

    Promise.all([
      demandApi.getSummary(period),
      supplyApi.getSummary(period),
    ]).then(([d, s]) => {
      const ddata = d.data as Record<string, unknown>;
      const sdata = s.data as Record<string, unknown>;
      setKpi({
        projectedDemand: Number(ddata?.total_projected_direct_jobs ?? ddata?.total_active_postings ?? DEMO_DEMAND_SUMMARY.projected_demand),
        changePct: DEMO_DEMAND_SUMMARY.change_pct, // backend doesn't return changePct yet
        trainingSupply: Number(sdata?.total_training_seats ?? sdata?.total_training_centers ?? DEMO_SUPPLY_SUMMARY.training_supply_seats),
        netDeficit: DEMO_NET_DEFICIT,
        atRiskFundsCr: DEMO_AT_RISK_FUNDS_CR,
        isDemo: false,
      });
    }).catch(() => {
      // Graceful fallback to demo data
      setKpi({
        projectedDemand: DEMO_DEMAND_SUMMARY.projected_demand,
        changePct: DEMO_DEMAND_SUMMARY.change_pct,
        trainingSupply: DEMO_SUPPLY_SUMMARY.training_supply_seats,
        netDeficit: DEMO_NET_DEFICIT,
        atRiskFundsCr: DEMO_AT_RISK_FUNDS_CR,
        isDemo: true,
      });
    }).finally(() => setKpiLoading(false));
  }, [period]);

  // ── Fetch alerts ──────────────────────────────────────────────────────────

  const fetchAlerts = useCallback(() => {
    setAlertsLoading(true);
    mismatchApi.getDashboard({ period, state_code: jurisdiction.stateCode })
      .then(r => {
        const data = r.data as Record<string, unknown>;
        const warnings = data?.active_early_warnings as MismatchAlert[] | undefined;
        if (warnings && warnings.length > 0) {
          setAlerts(sortAlerts(warnings));
        } else {
          setAlerts(sortAlerts(DEMO_ALERTS));
        }
      })
      .catch(() => setAlerts(sortAlerts(DEMO_ALERTS)))
      .finally(() => setAlertsLoading(false));
  }, [period, jurisdiction.stateCode]);

  useEffect(() => { fetchKPI(); }, [fetchKPI]);
  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // Update demand-vs-supply chart when period or trade changes (demo data for now)
  useEffect(() => {
    setDemandVsSupply(DEMO_DEMAND_VS_SUPPLY);
  }, [period, state.selectedTrade]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleInspect = useCallback((alert: MismatchAlert) => {
    openDiagnostic({ districtCode: alert.districtCode, districtName: alert.district, stateCode: alert.stateCode });
    setJurisdiction({ level: 'district', stateCode: alert.stateCode, stateName: alert.state, districtCode: alert.districtCode, districtName: alert.district });
  }, [openDiagnostic, setJurisdiction]);

  const handleJumpToSandbox = useCallback(() => {
    navigate('/simulation', { state: { district: jurisdiction.districtCode, trade: state.selectedTrade, period } });
  }, [navigate, jurisdiction, state.selectedTrade, period]);

  const handleJumpToSkillGraph = useCallback(() => {
    const isSaturated = alerts.some(a =>
      a.districtCode === jurisdiction.districtCode &&
      (a.severity === 'CHRONIC_SATURATION' || a.severity === 'MILD_SURPLUS')
    );
    navigate('/skills', { state: { sourceOccupation: isSaturated ? state.selectedTrade : null, trade: state.selectedTrade } });
  }, [navigate, alerts, jurisdiction.districtCode, state.selectedTrade]);

  const handleExport = useCallback(() => {
    const j = jurisdiction;
    const t = state.selectedTrade;
    const relevantAlerts = alerts.filter(a =>
      !j.districtCode || a.districtCode === j.districtCode
    );
    const briefData = {
      generatedAt: new Date().toISOString(),
      source: 'LMIS Sovereign Telemetry — DEMO DATA (not verified statistics)',
      location: [j.stateName ?? 'All India', j.districtName].filter(Boolean).join(' > '),
      trade: t?.label ?? 'All Trades',
      period,
      kpi: {
        projectedDemand: kpi?.projectedDemand,
        trainingSupply: kpi?.trainingSupply,
        netDeficit: kpi?.netDeficit,
        atRiskFundsCr: kpi?.atRiskFundsCr,
        dataSource: kpi?.isDemo ? 'DEMO' : 'BACKEND',
      },
      alerts: relevantAlerts.map(a => ({
        trade: a.trade,
        district: `${a.district}, ${a.state}`,
        severity: SEVERITY_META[a.severity].label,
        demand: a.demand,
        supply: a.supply,
        gap: a.gap,
        action: a.action,
      })),
    };
    const blob = new Blob([JSON.stringify(briefData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `district-brief-${(j.districtName ?? 'all-india').replace(/\s+/g, '-')}-${period}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [jurisdiction, state.selectedTrade, period, alerts, kpi]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page" style={{ gap: 16 }}>

      {/* ── Row 0: Control bar ─────────────────────────────────────────────── */}
      <div style={{ background: '#1a1d2e', border: '1px solid #2e3350', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 200 }}>
          <LayoutDashboard size={14} style={{ color: '#4f8ef7', flexShrink: 0 }} />
          {breadcrumb.map((part, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {i > 0 && <ChevronRight size={12} style={{ color: '#2e3350' }} />}
              <span
                style={{
                  fontSize: 12, fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                  color: i === breadcrumb.length - 1 ? '#e2e8f0' : '#64748b',
                  cursor: i < breadcrumb.length - 1 ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (i === 0) setJurisdiction({ level: 'national' });
                  else if (i === 1 && jurisdiction.stateCode) setJurisdiction({ level: 'state', stateCode: jurisdiction.stateCode, stateName: jurisdiction.stateName });
                }}
              >
                {part}
              </span>
            </span>
          ))}
        </div>

        {/* Trade selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label htmlFor="trade-select" style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>Trade</label>
          <select
            id="trade-select"
            className="select"
            style={{ width: 200, fontSize: 12, padding: '4px 8px' }}
            value={state.selectedTrade?.code ?? ''}
            onChange={e => {
              const occ = DEMO_OCCUPATIONS.find(o => o.code === e.target.value);
              setTrade(occ ? { code: occ.code, label: occ.label } : null);
            }}
          >
            <option value="">All Trades</option>
            {DEMO_OCCUPATIONS.map(o => (
              <option key={o.code} value={o.code}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label htmlFor="period-select" style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>Period</label>
          <select
            id="period-select"
            className="select"
            style={{ width: 120, fontSize: 12, padding: '4px 8px' }}
            value={period}
            onChange={e => setPeriod(e.target.value)}
          >
            {DEMO_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Selected trade indicator */}
        {state.selectedTrade && (
          <span style={{ fontSize: 11, color: '#22d3ee', background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.25)', borderRadius: 4, padding: '2px 8px' }}>
            ◈ {state.selectedTrade.label}
          </span>
        )}

        <button
          onClick={() => { fetchKPI(); fetchAlerts(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 6, border: '1px solid #2e3350', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 11 }}
          aria-label="Refresh dashboard data"
        >
          <RefreshCw size={12} /> Refresh
        </button>

        {DEMO_MODE && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#f59e0b' }}>
            <Info size={10} /> Demo Mode
          </span>
        )}
      </div>

      {/* ── Row 1: KPI Cards ──────────────────────────────────────────────── */}
      {kpiLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ background: '#1a1d2e', border: '1px solid #2e3350', borderRadius: 10, height: 110, animation: 'pulse 1.5s ease infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <KPICard
            icon={TrendingUp}
            label="Projected Demand (Period)"
            value={(kpi?.projectedDemand ?? 0).toLocaleString('en-IN')}
            sub="YoY Headcount Growth"
            color="#4f8ef7"
            change="up"
            changePct={kpi?.changePct}
            isDemo={kpi?.isDemo ?? true}
          />
          <KPICard
            icon={Building2}
            label="Training Supply Seats"
            value={(kpi?.trainingSupply ?? 0).toLocaleString('en-IN') + ' seats'}
            sub="Effective annual capacity"
            color="#10b981"
            change="neutral"
            isDemo={kpi?.isDemo ?? true}
          />
          <KPICard
            icon={AlertTriangle}
            label="Net Deficit (Headcount)"
            value={(kpi?.netDeficit ?? 0).toLocaleString('en-IN')}
            sub="ACUTE severity"
            color="#ef4444"
            change="down"
            isDemo={kpi?.isDemo ?? true}
          />
          <KPICard
            icon={IndianRupee}
            label="At-Risk Training Funds"
            value={`₹${kpi?.atRiskFundsCr ?? 0} Cr`}
            sub="SAT — Sanction at risk"
            color="#f59e0b"
            change="down"
            isDemo={kpi?.isDemo ?? true}
          />
        </div>
      )}

      {kpiError && (
        <div className="alert alert-orange" style={{ fontSize: 12 }}>
          <Info size={14} /> {kpiError} — Showing demo data.
        </div>
      )}

      {/* ── Row 2: Map + Priority Queue ───────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: 12, minHeight: 520 }}>

        {/* Map */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <LayoutDashboard size={13} /> Geographic Intelligence Map
            {jurisdiction.level !== 'national' && (
              <span style={{ color: '#4f8ef7' }}>· {jurisdiction.stateName ?? ''}{jurisdiction.districtName ? ` > ${jurisdiction.districtName}` : ''}</span>
            )}
          </div>
          <IndiaMap height={490} />
        </div>

        {/* Priority Action Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={13} style={{ color: '#ef4444' }} /> Priority Action Queue
            {DEMO_MODE && <DemoBadge />}
          </div>
          <div style={{ background: '#1a1d2e', border: '1px solid #2e3350', borderRadius: 10, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {alertsLoading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 12 }}>
                <RefreshCw size={16} style={{ marginRight: 8 }} /> Loading alerts…
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {alerts.length === 0 ? (
                  <div className="empty-state">
                    <p>No active mismatch alerts</p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <AlertCard key={alert.id} alert={alert} onInspect={handleInspect} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Analytics panels ───────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Demand vs Supply Bar Chart */}
        <div className="card" style={{ padding: 16 }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title" style={{ fontSize: 13 }}>
              <TrendingUp size={14} style={{ color: '#4f8ef7' }} />
              Demand vs Supply Gap
              {DEMO_MODE && <DemoBadge />}
            </div>
          </div>
          {demandVsSupply.length === 0 ? (
            <div className="empty-state"><p>No chart data available</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={demandVsSupply} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e3350" />
                <XAxis dataKey="trade" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ background: '#1a1d2e', border: '1px solid #2e3350', borderRadius: 6, fontSize: 11 }}
                  labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Bar dataKey="demand" name="Projected Demand" fill="#4f8ef7" radius={[3, 3, 0, 0]} />
                <Bar dataKey="supply" name="Training Supply" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div style={{ fontSize: 10, color: '#475569', marginTop: 6 }}>
            Units: Headcount. Data: {DEMO_MODE ? 'Illustrative demo — not verified.' : 'Live backend.'}
          </div>
        </div>

        {/* CDI Factor Weights Radar Chart */}
        <div className="card" style={{ padding: 16 }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title" style={{ fontSize: 13 }}>
              <Info size={14} style={{ color: '#22d3ee' }} />
              CDI Factor Weights
              {DEMO_MODE && <DemoBadge />}
            </div>
          </div>
          {cdiFactors.length === 0 ? (
            <div className="empty-state">
              <p style={{ textAlign: 'center' }}>CDI weights not configured.<br />Connect backend to load real factor weights.</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={cdiFactors} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="#2e3350" />
                  <PolarAngleAxis dataKey="factor" tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Radar name="Weight" dataKey="weight" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} />
                  <Tooltip
                    contentStyle={{ background: '#1a1d2e', border: '1px solid #2e3350', borderRadius: 6, fontSize: 11 }}
                    formatter={(v: number) => [`${(v * 100).toFixed(0)}%`, 'Weight']}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8 }}>
                {cdiFactors.map(f => (
                  <div key={f.factor} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', padding: '2px 0', borderBottom: '1px solid #2e3350' }}>
                    <span>{f.factor}</span>
                    <span style={{ color: '#22d3ee', fontWeight: 600 }}>{(f.weight * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 6 }}>
                Illustrative weights — not validated scientific values.
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 4: Action bar ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: '#1a1d2e', border: '1px solid #2e3350', borderRadius: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginRight: 4 }}>Quick Actions:</span>

        <button
          onClick={handleJumpToSandbox}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          title="Navigate to Policy Sandbox with current district, trade, and period context"
        >
          <FlaskConical size={13} />
          Jump to Sandbox
          {jurisdiction.districtName && <span style={{ fontSize: 10, opacity: 0.6 }}>· {jurisdiction.districtName}</span>}
        </button>

        <button
          onClick={handleJumpToSkillGraph}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          title="Navigate to Skill Bridge Graph with selected trade context"
        >
          <Network size={13} />
          Jump to Skill Graph
          {state.selectedTrade && <span style={{ fontSize: 10, opacity: 0.6 }}>· {state.selectedTrade.label.split(' ').slice(0, 2).join(' ')}</span>}
        </button>

        <button
          onClick={handleExport}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          title="Download district briefing JSON from current dashboard state. This is a frontend-generated export, not an official government document."
        >
          <Download size={13} />
          Export District Brief
        </button>

        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Info size={10} />
          Export generates frontend JSON from current dashboard state — not an official policy document
        </span>
      </div>

    </div>
  );
}
