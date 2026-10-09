import { useEffect, useState } from 'react';
import { forecastingApi, taxonomyApi } from '../api/client';
import { Activity, AlertTriangle } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, Area, AreaChart
} from 'recharts';
import toast from 'react-hot-toast';

const SEVERITY_BADGE: Record<string, string> = {
  ACUTE_SHORTAGE: 'badge-red',
  MODERATE_SHORTAGE: 'badge-orange',
  BALANCED: 'badge-green',
  MILD_SURPLUS: 'badge-yellow',
  CHRONIC_SATURATION: 'badge-purple',
};

export default function ForecastingPage() {
  const [districts, setDistricts] = useState<Record<string, unknown>[]>([]);
  const [occupations, setOccupations] = useState<Record<string, unknown>[]>([]);
  const [districtCode, setDistrictCode] = useState('MH_PUNE');
  const [ncoCode, setNcoCode] = useState('');
  const [horizon, setHorizon] = useState(12);
  const [forecast, setForecast] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelMeta, setModelMeta] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    Promise.all([
      taxonomyApi.getDistricts(),
      taxonomyApi.getOccupations(),
      forecastingApi.getModelMetrics(),
    ]).then(([d, o, m]) => {
      setDistricts(d.data);
      setOccupations(o.data);
      setModelMeta(m.data);
      if (o.data.length > 0) setNcoCode(String(o.data[0].nco_code));
    });
  }, []);

  const runForecast = async () => {
    if (!districtCode || !ncoCode) { toast.error('Select district and occupation'); return; }
    setLoading(true);
    try {
      const res = await forecastingApi.getTrajectory(districtCode, ncoCode, horizon);
      setForecast(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || 'Forecast failed');
    } finally {
      setLoading(false);
    }
  };

  const historicalPoints = (forecast?.historical_points as Record<string, unknown>[]) || [];
  const futurePoints = (forecast?.future_points as Record<string, unknown>[]) || [];

  const chartData = [
    ...historicalPoints.map(p => ({
      period: String(p.period || ''),
      demand_p50: Number(p.projected_demand_p50 || 0),
      supply: Number(p.projected_supply || 0),
      type: 'historical',
    })),
    ...futurePoints.map(p => ({
      period: String(p.period || ''),
      demand_p50: Number(p.projected_demand_p50 || 0),
      demand_p10: Number(p.projected_demand_p10 || 0),
      demand_p90: Number(p.projected_demand_p90 || 0),
      supply: Number(p.projected_supply || 0),
      type: 'forecast',
    })),
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">12M / 24M Demand-Supply Forecasting Engine</h1>
          <p className="page-subtitle">Forward-looking trajectory with P10/P50/P90 confidence bands. Tactical (12M) & Strategic (24M) horizons.</p>
        </div>
      </div>

      {/* Model Metrics */}
      {modelMeta && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>🤖 ML Model Performance Metrics</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {Object.entries(modelMeta).map(([k, v]) => (
              <div key={k} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>{typeof v === 'number' ? v.toFixed(3) : String(v)}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{k.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Config */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 16 }}>⚙️ Forecast Configuration</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">District</label>
            <select className="select" value={districtCode} onChange={e => setDistrictCode(e.target.value)}>
              {districts.map((d: Record<string, unknown>, i) => (
                <option key={i} value={String(d.code)}>{String(d.name)} ({String(d.code)})</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 220 }}>
            <label className="form-label">NCO Occupation</label>
            <select className="select" value={ncoCode} onChange={e => setNcoCode(e.target.value)}>
              {occupations.map((o: Record<string, unknown>, i) => (
                <option key={i} value={String(o.nco_code)}>{String(o.title).slice(0, 45)} ({String(o.nco_code)})</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ minWidth: 140 }}>
            <label className="form-label">Horizon</label>
            <select className="select" value={horizon} onChange={e => setHorizon(Number(e.target.value))}>
              <option value={12}>12 Months (Tactical)</option>
              <option value={24}>24 Months (Strategic)</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={runForecast} disabled={loading}>
            {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <Activity size={15} />}
            {loading ? 'Forecasting...' : 'Generate Forecast'}
          </button>
        </div>
      </div>

      {forecast && (
        <>
          {/* Forecast Header */}
          <div className="card">
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>Trade</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{String(forecast.trade_title || '')}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>District</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{String(forecast.district_name || '')}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>Horizon</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{String(forecast.horizon_months || '')} Months</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>Overall Severity</div>
                <span className={`badge ${SEVERITY_BADGE[String(forecast.overall_severity || '')] || 'badge-blue'}`} style={{ fontSize: 13 }}>
                  {String(forecast.overall_severity || '')}
                </span>
              </div>
            </div>
          </div>

          {/* Executive Recommendation */}
          <div className={`alert ${String(forecast.overall_severity || '').includes('SHORTAGE') ? 'alert-red' : String(forecast.overall_severity || '').includes('SURPLUS') || String(forecast.overall_severity || '').includes('SATURATION') ? 'alert-orange' : 'alert-green'}`}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <div>
              <strong>Executive Recommendation:</strong><br />
              {String(forecast.executive_recommendation || '')}
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>📈 Demand-Supply Trajectory with Confidence Bands</div>
            <ResponsiveContainer width="100%" height={360}>
              <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-dim)' }} />
                <ReferenceLine x={historicalPoints[historicalPoints.length - 1]?.period as string} stroke="var(--color-border)" strokeDasharray="5 5" label={{ value: 'Forecast →', fontSize: 10, fill: 'var(--color-text-dim)' }} />
                <Area type="monotone" dataKey="demand_p90" name="Demand P90" fill="rgba(239,68,68,0.05)" stroke="transparent" />
                <Area type="monotone" dataKey="demand_p10" name="Demand P10" fill="rgba(239,68,68,0.1)" stroke="transparent" />
                <Line type="monotone" dataKey="demand_p50" name="Projected Demand (P50)" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="supply" name="Projected Supply" stroke="#10b981" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast Table */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>📋 Monthly Forecast Data</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Demand P10</th>
                    <th>Demand P50 (Median)</th>
                    <th>Demand P90</th>
                    <th>Projected Supply</th>
                    <th>Mismatch Ratio</th>
                    <th>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {futurePoints.map((p: Record<string, unknown>, i: number) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{String(p.period || '')}</td>
                      <td style={{ color: 'var(--color-text-dim)', fontSize: 12 }}>{Number(p.projected_demand_p10 || 0).toLocaleString()}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{Number(p.projected_demand_p50 || 0).toLocaleString()}</td>
                      <td style={{ color: 'var(--color-text-dim)', fontSize: 12 }}>{Number(p.projected_demand_p90 || 0).toLocaleString()}</td>
                      <td style={{ color: 'var(--color-success)' }}>{Number(p.projected_supply || 0).toLocaleString()}</td>
                      <td style={{ fontWeight: 600 }}>{Number(p.mismatch_ratio || 0).toFixed(2)}x</td>
                      <td><span className={`badge ${SEVERITY_BADGE[String(p.severity_flag || '')] || 'badge-blue'}`}>{String(p.severity_flag || '')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!forecast && !loading && (
        <div className="empty-state">
          <Activity size={48} />
          <p>Select a district and occupation, then click Generate Forecast to view 12M/24M projections.</p>
        </div>
      )}
    </div>
  );
}
