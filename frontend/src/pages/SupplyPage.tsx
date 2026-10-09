import { useEffect, useState } from 'react';
import { supplyApi } from '../api/client';
import { Building2, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

export default function SupplyPage() {
  const [centers, setCenters] = useState<Record<string, unknown>[]>([]);
  const [effective, setEffective] = useState<Record<string, unknown>[]>([]);
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'centers' | 'effective'>('centers');
  const [centerTypeFilter, setCenterTypeFilter] = useState('');

  useEffect(() => {
    Promise.all([
      supplyApi.getCenters(),
      supplyApi.getEffective(),
      supplyApi.getSummary(),
    ]).then(([c, e, s]) => {
      setCenters(c.data);
      setEffective(e.data);
      setSummary(s.data);
    }).catch(() => toast.error('Failed to load supply data'))
      .finally(() => setLoading(false));
  }, []);

  const centerTypes = [...new Set(centers.map(c => String(c.center_type || '')).filter(Boolean))];

  const filteredCenters = centerTypeFilter
    ? centers.filter(c => String(c.center_type) === centerTypeFilter)
    : centers;

  const effChartData = effective.slice(0, 10).map(r => ({
    name: String(r.trade_title || '').split(' ').slice(0, 3).join(' '),
    seats: Number(r.annual_seat_capacity || 0),
    passouts: Number(r.certified_passouts || 0),
    effective: Number(r.effective_local_supply || 0),
  }));

  if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading supply data...</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Training Supply & Institutional Capacity</h1>
          <p className="page-subtitle">ITI / PMKK / NSTI infrastructure, seat capacities, certified passouts & effective local supply discounting</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid-4">
        <div className="stat-card blue">
          <div className="stat-icon blue"><Building2 size={20} /></div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{Number(summary?.total_training_centers || 0)}</div>
          <div className="stat-label">Total Training Centers</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><BarChart3 size={20} /></div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{Number(summary?.total_sanctioned_seats || 0).toLocaleString('en-IN')}</div>
          <div className="stat-label">Sanctioned Annual Seats</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange"><BarChart3 size={20} /></div>
          <div className="stat-value" style={{ color: 'var(--color-orange)' }}>{Number(summary?.total_certified_passouts || 0).toLocaleString('en-IN')}</div>
          <div className="stat-label">Certified Passouts (Annual)</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan"><BarChart3 size={20} /></div>
          <div className="stat-value" style={{ color: 'var(--color-secondary)' }}>{Number(summary?.total_effective_supply || 0).toLocaleString('en-IN')}</div>
          <div className="stat-label">Effective Local Supply</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'centers' ? 'active' : ''}`} onClick={() => setTab('centers')}>Training Centers</button>
        <button className={`tab ${tab === 'effective' ? 'active' : ''}`} onClick={() => setTab('effective')}>Effective Supply Breakdown</button>
      </div>

      {tab === 'centers' ? (
        <>
          {/* Filter */}
          <div className="card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label className="form-label" style={{ margin: 0 }}>Center Type:</label>
              <select className="select" style={{ width: 200 }} value={centerTypeFilter} onChange={e => setCenterTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                {centerTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{filteredCenters.length} centers shown</span>
            </div>
          </div>

          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Center Name</th>
                    <th>Type</th>
                    <th>District</th>
                    <th>Affiliation</th>
                    <th>Annual Intake</th>
                    <th>Trades</th>
                    <th>NAAC Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCenters.map((c: Record<string, unknown>, i: number) => (
                    <tr key={i}>
                      <td><strong style={{ fontSize: 12 }}>{String(c.name || '')}</strong></td>
                      <td><span className={`badge ${String(c.center_type) === 'ITI' ? 'badge-blue' : String(c.center_type) === 'PMKK' ? 'badge-green' : 'badge-purple'}`}>{String(c.center_type || '')}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(c.district_code || '')}</td>
                      <td style={{ fontSize: 11 }}>{String(c.affiliation_body || '')}</td>
                      <td>{Number(c.annual_intake_capacity || 0).toLocaleString()}</td>
                      <td style={{ fontSize: 11 }}>{String(c.trades_offered || '')}</td>
                      <td>
                        <span className={`badge ${String(c.naac_grade) === 'A' ? 'badge-green' : String(c.naac_grade) === 'B' ? 'badge-yellow' : 'badge-orange'}`}>
                          {String(c.naac_grade || 'N/A')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Effective Supply Chart */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>📊 Effective Supply vs. Sanctioned Seats (Top 10 Trades)</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={effChartData} margin={{ top: 5, right: 20, bottom: 60, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
                <Tooltip contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-dim)' }} />
                <Bar dataKey="seats" name="Sanctioned Seats" fill="#4f8ef7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="passouts" name="Certified Passouts" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="effective" name="Effective Local Supply" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>📋 Effective Supply Breakdown (With Discount Factors)</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Trade</th>
                    <th>District</th>
                    <th>Annual Seats</th>
                    <th>Passout Rate</th>
                    <th>Local Absorption</th>
                    <th>Outmigration</th>
                    <th>e-Shram Pool</th>
                    <th>Effective Supply</th>
                  </tr>
                </thead>
                <tbody>
                  {effective.map((r: Record<string, unknown>, i: number) => (
                    <tr key={i}>
                      <td style={{ fontSize: 12 }}><strong>{String(r.trade_title || '')}</strong></td>
                      <td style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(r.district_name || '')}</td>
                      <td>{Number(r.annual_seat_capacity || 0).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {(Number(r.pass_completion_rate || 0) * 100).toFixed(0)}%
                          <div className="progress" style={{ width: 40 }}>
                            <div className="progress-bar green" style={{ width: `${Number(r.pass_completion_rate || 0) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td>{(Number(r.local_placement_absorption_rate || 0) * 100).toFixed(0)}%</td>
                      <td style={{ color: 'var(--color-orange)' }}>{(Number(r.interdistrict_migration_rate || 0) * 100).toFixed(0)}%</td>
                      <td>{Number(r.unorganized_eshram_pool || 0).toLocaleString()}</td>
                      <td><span className="badge badge-cyan">{Number(r.effective_local_supply || 0).toLocaleString()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
