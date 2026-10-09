import { useEffect, useState } from 'react';
import { mismatchApi, taxonomyApi } from '../api/client';
import { AlertTriangle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const SEVERITY_COLORS: Record<string, string> = {
  RED: 'badge-red',
  ORANGE: 'badge-orange',
  GREEN: 'badge-green',
  YELLOW: 'badge-yellow',
  CRIMSON: 'badge-purple',
};

const MISMATCH_BADGE: Record<string, string> = {
  ACUTE_SHORTAGE: 'badge-red',
  MODERATE_SHORTAGE: 'badge-orange',
  BALANCED: 'badge-green',
  MILD_SURPLUS: 'badge-yellow',
  CHRONIC_SATURATION: 'badge-purple',
};

export default function MismatchPage() {
  const [dashboard, setDashboard] = useState<Record<string, unknown> | null>(null);
  const [drilldown, setDrilldown] = useState<Record<string, unknown> | null>(null);
  const [states, setStates] = useState<Record<string, unknown>[]>([]);
  const [districts, setDistricts] = useState<Record<string, unknown>[]>([]);
  const [stateFilter, setStateFilter] = useState('');
  const [districtDrillCode, setDistrictDrillCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [drillLoading, setDrillLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      mismatchApi.getDashboard(),
      taxonomyApi.getStates(),
      taxonomyApi.getDistricts(),
    ]).then(([m, s, d]) => {
      setDashboard(m.data);
      setStates(s.data);
      setDistricts(d.data);
    }).catch(() => toast.error('Failed to load mismatch data'))
      .finally(() => setLoading(false));
  }, []);

  const applyStateFilter = async () => {
    setLoading(true);
    try {
      const res = await mismatchApi.getDashboard({ state_code: stateFilter || undefined });
      setDashboard(res.data);
    } catch {
      toast.error('Filter failed');
    } finally {
      setLoading(false);
    }
  };

  const runDrilldown = async () => {
    if (!districtDrillCode) { toast.error('Select a district for drilldown'); return; }
    setDrillLoading(true);
    try {
      const res = await mismatchApi.getDistrictDrilldown(districtDrillCode);
      setDrilldown(res.data);
    } catch {
      toast.error('Drilldown failed');
    } finally {
      setDrillLoading(false);
    }
  };

  const warnings = (dashboard?.active_early_warnings as Record<string, unknown>[]) || [];
  const shortages = (dashboard?.top_undersupplied_trades as Record<string, unknown>[]) || [];
  const surpluses = (dashboard?.top_oversupplied_trades as Record<string, unknown>[]) || [];

  if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading mismatch dashboard...</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mismatch Diagnostic & Early Warning Dashboard</h1>
          <p className="page-subtitle">Real-time Red/Orange alerts, Top 10 shortage/surplus rankings for MSDE policy response</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-red">🔴 {warnings.filter(w => w.severity === 'RED').length} Red Alerts</span>
          <span className="badge badge-orange">🟠 {warnings.filter(w => w.severity === 'ORANGE').length} Orange Alerts</span>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid-4">
        <div className="stat-card red">
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{Number(dashboard?.total_shortage_headcount || 0).toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Shortage Headcount</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{Number(dashboard?.total_surplus_headcount || 0).toLocaleString('en-IN')}</div>
          <div className="stat-label">Chronic Surplus Headcount</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{Number(dashboard?.overall_system_balance_pct || 0).toFixed(1)}%</div>
          <div className="stat-label">System Balance Score</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-value" style={{ color: 'var(--color-orange)' }}>{warnings.length}</div>
          <div className="stat-label">Active Early Warnings</div>
        </div>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="form-label" style={{ margin: 0 }}>Filter by State:</label>
          <select className="select" style={{ width: 200 }} value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
            <option value="">All States</option>
            {states.map((s: Record<string, unknown>, i) => (
              <option key={i} value={String(s.code)}>{String(s.name)}</option>
            ))}
          </select>
          <button className="btn btn-primary btn-sm" onClick={applyStateFilter}>Apply</button>
        </div>
      </div>

      {/* Early Warnings */}
      <div className="card">
        <div className="card-header">
          <div className="card-title" style={{ color: 'var(--color-danger)' }}>
            <AlertTriangle size={16} /> Active Early Warning Alerts ({warnings.length})
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {warnings.map((w: Record<string, unknown>, i: number) => (
            <div key={i} className={`alert ${w.severity === 'RED' ? 'alert-red' : 'alert-orange'}`} style={{ fontSize: 12 }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <strong>{String(w.trade_title || '')}</strong>
                  <span className={`badge ${SEVERITY_COLORS[String(w.severity || '')] || 'badge-blue'}`}>{String(w.severity || '')}</span>
                  <span style={{ color: 'var(--color-text-dim)', fontSize: 11 }}>{String(w.district_name || '')}</span>
                </div>
                <div style={{ opacity: 0.85 }}>{String(w.alert_summary || '')}</div>
                <div style={{ marginTop: 4, opacity: 0.6, fontSize: 11 }}>
                  Mismatch Ratio: {Number(w.mismatch_ratio || 0).toFixed(2)}x | Gap: {Number(w.gap_headcount || 0).toLocaleString()} headcount
                </div>
              </div>
            </div>
          ))}
          {warnings.length === 0 && <div className="empty-state"><p>No active warnings</p></div>}
        </div>
      </div>

      {/* Shortage / Surplus Tables */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--color-danger)' }}>🔴 Top Undersupplied Trades</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Trade</th><th>District</th><th>Gap</th><th>Ratio</th><th>Severity</th></tr>
              </thead>
              <tbody>
                {shortages.slice(0, 10).map((r: Record<string, unknown>, i: number) => (
                  <tr key={i}>
                    <td style={{ fontSize: 11 }}><strong>{String(r.trade_title || '').slice(0, 35)}</strong></td>
                    <td style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>{String(r.district_name || '')}</td>
                    <td><span className="badge badge-red">{Number(r.gap_headcount || 0).toLocaleString()}</span></td>
                    <td style={{ fontWeight: 600 }}>{Number(r.mismatch_ratio || 0).toFixed(2)}x</td>
                    <td><span className={`badge ${MISMATCH_BADGE[String(r.severity_flag || '')] || 'badge-blue'}`} style={{ fontSize: 10 }}>{String(r.severity_flag || '')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--color-warning)' }}>🟡 Top Oversupplied Trades</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Trade</th><th>District</th><th>Surplus</th><th>Ratio</th><th>Severity</th></tr>
              </thead>
              <tbody>
                {surpluses.slice(0, 10).map((r: Record<string, unknown>, i: number) => (
                  <tr key={i}>
                    <td style={{ fontSize: 11 }}><strong>{String(r.trade_title || '').slice(0, 35)}</strong></td>
                    <td style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>{String(r.district_name || '')}</td>
                    <td><span className="badge badge-yellow">{Math.abs(Number(r.gap_headcount || 0)).toLocaleString()}</span></td>
                    <td style={{ fontWeight: 600 }}>{Number(r.mismatch_ratio || 0).toFixed(2)}x</td>
                    <td><span className={`badge ${MISMATCH_BADGE[String(r.severity_flag || '')] || 'badge-blue'}`} style={{ fontSize: 10 }}>{String(r.severity_flag || '')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* District Drilldown */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><Search size={16} /> District Deep-Dive Analysis</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 16 }}>
          <div className="form-group" style={{ flex: 1, maxWidth: 280 }}>
            <label className="form-label">Select District for Drilldown</label>
            <select className="select" value={districtDrillCode} onChange={e => setDistrictDrillCode(e.target.value)}>
              <option value="">Select district...</option>
              {districts.map((d: Record<string, unknown>, i) => (
                <option key={i} value={String(d.code)}>{String(d.name)} ({String(d.code)})</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={runDrilldown} disabled={drillLoading}>
            {drillLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Search size={14} />}
            Drill Down
          </button>
        </div>

        {drilldown && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{String(drilldown.district_name || '')}</div>
              <span className="badge badge-blue">{String(drilldown.state_code || '')}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{String(drilldown.industrial_focus || '')}</span>
            </div>
            {(drilldown.shortages as unknown[] || []).length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-danger)', marginBottom: 8 }}>Shortages in this district:</div>
                {(drilldown.shortages as Record<string, unknown>[]).map((s, i) => (
                  <div key={i} className="alert alert-red" style={{ fontSize: 12, marginBottom: 6 }}>
                    <strong>{String(s.trade_title || '')}</strong> — Gap: {Number(s.gap_headcount || 0).toLocaleString()} | Ratio: {Number(s.mismatch_ratio || 0).toFixed(2)}x
                  </div>
                ))}
              </div>
            )}
            {(drilldown.surpluses as unknown[] || []).length > 0 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-warning)', marginBottom: 8 }}>Surpluses in this district:</div>
                {(drilldown.surpluses as Record<string, unknown>[]).map((s, i) => (
                  <div key={i} className="alert alert-orange" style={{ fontSize: 12, marginBottom: 6 }}>
                    <strong>{String(s.trade_title || '')}</strong> — Surplus: {Math.abs(Number(s.gap_headcount || 0)).toLocaleString()}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
