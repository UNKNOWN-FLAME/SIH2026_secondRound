import { useEffect, useState } from 'react';
import { demandApi, taxonomyApi } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, Filter, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DemandPage() {
  const [cdiData, setCdiData] = useState<Record<string, unknown>[]>([]);
  const [capexData, setCapexData] = useState<Record<string, unknown>[]>([]);
  const [signals, setSignals] = useState<Record<string, unknown>[]>([]);
  const [districts, setDistricts] = useState<Record<string, unknown>[]>([]);
  const [sectors, setSectors] = useState<Record<string, unknown>[]>([]);
  const [occupations, setOccupations] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'cdi' | 'capex' | 'signals'>('cdi');

  // Filters
  const [districtFilter, setDistrictFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [ncoFilter, setNcoFilter] = useState('');

  useEffect(() => {
    Promise.all([
      taxonomyApi.getDistricts(),
      taxonomyApi.getSectors(),
      taxonomyApi.getOccupations(),
    ]).then(([d, s, o]) => {
      setDistricts(d.data);
      setSectors(s.data);
      setOccupations(o.data);
    });
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        district_code: districtFilter || undefined,
        nco_code: ncoFilter || undefined,
      };
      const [cdi, capex, sig] = await Promise.all([
        demandApi.getCDI(params),
        demandApi.getCapex({ district_code: districtFilter || undefined, sector_code: sectorFilter || undefined }),
        demandApi.getSignals({ district_code: districtFilter || undefined, nco_code: ncoFilter || undefined }),
      ]);
      setCdiData(cdi.data);
      setCapexData(capex.data);
      setSignals(sig.data);
    } catch {
      toast.error('Failed to load demand data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const cdiChartData = cdiData.slice(0, 15).map((r) => ({
    name: String(r.trade_title || '').split(' ').slice(0, 3).join(' '),
    cdi: Number(r.cdi_score || 0).toFixed(1),
    demand: Number(r.projected_headcount_demand || 0),
    postings: Number(r.posting_component || 0).toFixed(1),
    capex: Number(r.capex_component || 0).toFixed(1),
    velocity: Number(r.velocity_component || 0).toFixed(1),
    wage: Number(r.wage_component || 0).toFixed(1),
  }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Labour Demand & Composite Demand Index (CDI)</h1>
          <p className="page-subtitle">Multi-Source Lead-Indicator Fusion: Postings (30%) + Capex (35%) + Velocity (15%) + Wages (10%) + Migration (10%)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><Filter size={16} /> Filters</div>
          <button className="btn btn-primary btn-sm" onClick={fetchData}>
            <RefreshCw size={13} /> Apply Filters
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">District</label>
            <select className="select" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
              <option value="">All Districts</option>
              {districts.map((d: Record<string, unknown>, i: number) => (
                <option key={i} value={String(d.code)}>{String(d.name)} ({String(d.code)})</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">Sector</label>
            <select className="select" value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}>
              <option value="">All Sectors</option>
              {sectors.map((s: Record<string, unknown>, i: number) => (
                <option key={i} value={String(s.code)}>{String(s.name)}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">NCO Occupation</label>
            <select className="select" value={ncoFilter} onChange={e => setNcoFilter(e.target.value)}>
              <option value="">All Occupations</option>
              {occupations.map((o: Record<string, unknown>, i: number) => (
                <option key={i} value={String(o.nco_code)}>{String(o.title)} ({String(o.nco_code)})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'cdi' ? 'active' : ''}`} onClick={() => setTab('cdi')}>CDI Analysis</button>
        <button className={`tab ${tab === 'capex' ? 'active' : ''}`} onClick={() => setTab('capex')}>Industrial Capex / PLI</button>
        <button className={`tab ${tab === 'signals' ? 'active' : ''}`} onClick={() => setTab('signals')}>Job Posting Signals</button>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /><p>Loading demand data...</p></div>
      ) : tab === 'cdi' ? (
        <>
          {/* CDI Chart */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}><TrendingUp size={16} style={{ color: 'var(--color-primary)' }} /> CDI Score by Trade (Top 15)</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cdiChartData} margin={{ top: 5, right: 20, bottom: 60, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-dim)' }} />
                <Bar dataKey="cdi" name="CDI Score" fill="#4f8ef7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demand" name="Projected Demand" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CDI Component Breakdown */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>📊 CDI Component Breakdown (Weighted Factors)</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={cdiChartData} margin={{ top: 5, right: 20, bottom: 60, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-dim)' }} />
                <Bar dataKey="postings" name="Postings (30%)" fill="#4f8ef7" stackId="a" />
                <Bar dataKey="capex" name="Capex (35%)" fill="#10b981" stackId="a" />
                <Bar dataKey="velocity" name="Velocity (15%)" fill="#f97316" stackId="a" />
                <Bar dataKey="wage" name="Wage (10%)" fill="#a78bfa" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CDI Table */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>📋 Composite Demand Index Records</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Trade</th>
                    <th>District</th>
                    <th>CDI Score</th>
                    <th>Postings</th>
                    <th>Capex</th>
                    <th>Velocity</th>
                    <th>Wage</th>
                    <th>Demand (HC)</th>
                  </tr>
                </thead>
                <tbody>
                  {cdiData.slice(0, 20).map((r: Record<string, unknown>, i: number) => (
                    <tr key={i}>
                      <td><strong style={{ fontSize: 12 }}>{String(r.trade_title || '')}</strong></td>
                      <td style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(r.district_name || '')}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{Number(r.cdi_score || 0).toFixed(1)}</span>
                          <div className="progress" style={{ width: 50 }}>
                            <div className="progress-bar blue" style={{ width: `${Math.min(Number(r.cdi_score || 0), 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>{Number(r.posting_component || 0).toFixed(1)}</td>
                      <td>{Number(r.capex_component || 0).toFixed(1)}</td>
                      <td>{Number(r.velocity_component || 0).toFixed(1)}</td>
                      <td>{Number(r.wage_component || 0).toFixed(1)}</td>
                      <td><span className="badge badge-blue">{Number(r.projected_headcount_demand || 0).toLocaleString('en-IN')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : tab === 'capex' ? (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>🏭 Industrial Capex & PLI Scheme Projects</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>District</th>
                  <th>Sector</th>
                  <th>Investment (₹ Cr)</th>
                  <th>Scheme</th>
                  <th>Direct Jobs</th>
                  <th>Indirect Jobs</th>
                  <th>Operational By</th>
                </tr>
              </thead>
              <tbody>
                {capexData.map((r: Record<string, unknown>, i: number) => (
                  <tr key={i}>
                    <td><strong style={{ fontSize: 12 }}>{String(r.project_title || '')}</strong></td>
                    <td style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(r.district_code || '')}</td>
                    <td><span className="badge badge-blue">{String(r.sector_code || '')}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>₹{Number(r.investment_inr_cr || 0).toLocaleString('en-IN')} Cr</td>
                    <td style={{ fontSize: 11 }}>{String(r.scheme_name || '')}</td>
                    <td><span className="badge badge-green">{Number(r.expected_direct_jobs || 0).toLocaleString()}</span></td>
                    <td>{Number(r.expected_indirect_jobs || 0).toLocaleString()}</td>
                    <td style={{ fontSize: 11 }}>{String(r.expected_operational_year || '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>📡 Job Posting Time-Series Signals</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Trade (NCO)</th>
                  <th>District</th>
                  <th>Active Postings</th>
                  <th>Median Wage (₹)</th>
                  <th>Hiring Velocity</th>
                  <th>YoY Change</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((r: Record<string, unknown>, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{String(r.period || '')}</td>
                    <td style={{ fontSize: 11 }}>{String(r.nco_code || '')}</td>
                    <td style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(r.district_code || '')}</td>
                    <td><span className="badge badge-blue">{Number(r.active_postings || 0).toLocaleString()}</span></td>
                    <td style={{ color: 'var(--color-success)' }}>₹{Number(r.median_wage_inr || 0).toLocaleString('en-IN')}</td>
                    <td>
                      <div className="progress" style={{ width: 80 }}>
                        <div className="progress-bar green" style={{ width: `${Math.min(Number(r.hiring_velocity_score || 0) * 10, 100)}%` }} />
                      </div>
                    </td>
                    <td style={{ color: Number(r.yoy_change_pct || 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {Number(r.yoy_change_pct || 0) >= 0 ? '+' : ''}{Number(r.yoy_change_pct || 0).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
