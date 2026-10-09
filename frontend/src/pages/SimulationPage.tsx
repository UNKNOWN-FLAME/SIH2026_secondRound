import { useEffect, useState } from 'react';
import { simulationApi, taxonomyApi } from '../api/client';
import { FlaskConical, Play, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import toast from 'react-hot-toast';

export default function SimulationPage() {
  const [presets, setPresets] = useState<Record<string, unknown>[]>([]);
  const [sectors, setSectors] = useState<Record<string, unknown>[]>([]);
  const [districts, setDistricts] = useState<Record<string, unknown>[]>([]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  // Simulation params
  const [scenarioName, setScenarioName] = useState('Custom Policy Scenario');
  const [targetSector, setTargetSector] = useState('GREEN_ENERGY');
  const [targetDistrict, setTargetDistrict] = useState('MH_PUNE');
  const [capexInjection, setCapexInjection] = useState(200.0);
  const [additionalSeats, setAdditionalSeats] = useState(1000);
  const [stipendBoost, setStipendBoost] = useState(15.0);
  const [horizonMonths, setHorizonMonths] = useState(12);

  useEffect(() => {
    Promise.all([
      simulationApi.getPresets(),
      taxonomyApi.getSectors(),
      taxonomyApi.getDistricts(),
    ]).then(([p, s, d]) => {
      setPresets(p.data);
      setSectors(s.data);
      setDistricts(d.data);
    });
  }, []);

  const loadPreset = (preset: Record<string, unknown>) => {
    const p = preset.params as Record<string, unknown>;
    setScenarioName(String(p.scenario_name || ''));
    setTargetSector(String(p.target_sector_code || ''));
    setTargetDistrict(String(p.target_district_code || ''));
    setCapexInjection(Number(p.capex_injection_cr || 0));
    setAdditionalSeats(Number(p.additional_seats_sanctioned || 0));
    setStipendBoost(Number(p.training_stipend_boost_pct || 0));
    setHorizonMonths(Number(p.simulation_horizon_months || 12));
    toast.success('Preset loaded!');
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await simulationApi.runWhatIf({
        scenario_name: scenarioName,
        target_sector_code: targetSector || null,
        target_district_code: targetDistrict || null,
        capex_injection_cr: capexInjection,
        additional_seats_sanctioned: additionalSeats,
        training_stipend_boost_pct: stipendBoost,
        simulation_horizon_months: horizonMonths,
      });
      setResult(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const monthlyProjections = (result?.monthly_projections as Record<string, unknown>[]) || [];

  const chartData = monthlyProjections.map(m => ({
    month: String(m.month || ''),
    demand: Number(m.projected_demand || 0),
    supply: Number(m.projected_supply || 0),
    gap: Number(m.gap || 0),
  }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">What-If Policy Simulation Sandbox</h1>
          <p className="page-subtitle">
            Winning Pillar 3 — Test capex injections, seat expansions & stipend boosts across 12M/24M horizons
          </p>
        </div>
        <span className="badge badge-green">🏆 SIH Winning Pillar</span>
      </div>

      {/* Presets */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 12 }}><Zap size={16} style={{ color: 'var(--color-warning)' }} /> Quick-Load Curated Policy Presets</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {presets.map((preset: Record<string, unknown>, i: number) => (
            <button
              key={i}
              className="btn btn-secondary"
              onClick={() => loadPreset(preset)}
              style={{ textAlign: 'left', maxWidth: 280 }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{String(preset.name || '')}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {String(preset.description || '').slice(0, 60)}…
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>
          <FlaskConical size={16} style={{ color: 'var(--color-primary)' }} /> Simulation Parameters
        </div>
        <div className="grid-2" style={{ gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Scenario Name</label>
            <input className="input" value={scenarioName} onChange={e => setScenarioName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Target Sector</label>
            <select className="select" value={targetSector} onChange={e => setTargetSector(e.target.value)}>
              <option value="">All Sectors</option>
              {sectors.map((s: Record<string, unknown>, i) => (
                <option key={i} value={String(s.code)}>{String(s.name)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Target District</label>
            <select className="select" value={targetDistrict} onChange={e => setTargetDistrict(e.target.value)}>
              <option value="">All Districts</option>
              {districts.map((d: Record<string, unknown>, i) => (
                <option key={i} value={String(d.code)}>{String(d.name)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Capex Injection (₹ Crores)</label>
            <input className="input" type="number" min={0} step={10} value={capexInjection}
              onChange={e => setCapexInjection(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Additional Seats to Sanction</label>
            <input className="input" type="number" min={0} step={100} value={additionalSeats}
              onChange={e => setAdditionalSeats(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Trainee Stipend Boost (%)</label>
            <input className="input" type="number" min={0} max={100} step={5} value={stipendBoost}
              onChange={e => setStipendBoost(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Simulation Horizon</label>
            <select className="select" value={horizonMonths} onChange={e => setHorizonMonths(Number(e.target.value))}>
              <option value={12}>12 Months (Tactical)</option>
              <option value={24}>24 Months (Strategic)</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <button className="btn btn-primary btn-lg" onClick={runSimulation} disabled={loading}>
            {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <Play size={16} />}
            {loading ? 'Running Simulation...' : 'Run What-If Simulation'}
          </button>
        </div>
      </div>

      {result && (
        <>
          {/* Results KPIs */}
          <div className="grid-4">
            <div className="stat-card blue">
              <div className="stat-value" style={{ color: 'var(--color-primary)', fontSize: 22 }}>
                {Number(result.baseline_demand || 0).toLocaleString('en-IN')}
              </div>
              <div className="stat-label">Baseline Demand (HC)</div>
            </div>
            <div className="stat-card green">
              <div className="stat-value" style={{ color: 'var(--color-success)', fontSize: 22 }}>
                +{Number(result.projected_additional_supply || 0).toLocaleString('en-IN')}
              </div>
              <div className="stat-label">Additional Supply Generated</div>
            </div>
            <div className="stat-card orange">
              <div className="stat-value" style={{ color: 'var(--color-orange)', fontSize: 22 }}>
                {Number(result.gap_closure_pct || 0).toFixed(1)}%
              </div>
              <div className="stat-label">Gap Closure Achieved</div>
            </div>
            <div className="stat-card cyan">
              <div className="stat-value" style={{ color: 'var(--color-secondary)', fontSize: 22 }}>
                {Number(result.roi_multiplier || 0).toFixed(2)}x
              </div>
              <div className="stat-label">ROI Multiplier</div>
            </div>
          </div>

          {/* Policy Levers Summary */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>
              ⚙️ Policy Lever Impacts — <span style={{ color: 'var(--color-primary)' }}>{String(result.scenario_name || '')}</span>
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {(result.lever_impacts as Record<string, unknown>[] || []).map((l: Record<string, unknown>, i: number) => (
                <div key={i} style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  minWidth: 180,
                }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(l.lever_name || '')}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)', marginTop: 4 }}>
                    {Number(l.impact_value || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{String(l.unit || '')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Projection Chart */}
          {chartData.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>📈 Monthly Demand-Supply Projection</div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
                  <Tooltip contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-dim)' }} />
                  <Line type="monotone" dataKey="demand" name="Projected Demand" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="supply" name="Projected Supply" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="gap" name="Residual Gap" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Narrative */}
          {result.executive_narrative && (
            <div className="alert alert-blue">
              <FlaskConical size={16} style={{ flexShrink: 0 }} />
              <div>
                <strong>Simulation Narrative:</strong><br />
                {String(result.executive_narrative || '')}
              </div>
            </div>
          )}
        </>
      )}

      {!result && !loading && (
        <div className="empty-state">
          <FlaskConical size={48} />
          <p>Load a preset or configure parameters above, then run the simulation.</p>
        </div>
      )}
    </div>
  );
}
