import { useEffect, useState } from 'react';
import { obsolescenceApi, taxonomyApi } from '../api/client';
import { Zap, AlertTriangle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ObsolescencePage() {
  const [riskMatrix, setRiskMatrix] = useState<Record<string, unknown>[]>([]);
  const [districts, setDistricts] = useState<Record<string, unknown>[]>([]);
  const [districtReport, setDistrictReport] = useState<Record<string, unknown> | null>(null);
  const [pathway, setPathway] = useState<Record<string, unknown> | null>(null);
  const [occupations, setOccupations] = useState<Record<string, unknown>[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('MH_PUNE');
  const [selectedNco, setSelectedNco] = useState('4132.0100');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'matrix' | 'district' | 'pathway'>('matrix');

  useEffect(() => {
    Promise.all([
      obsolescenceApi.getTradeRiskMatrix(),
      taxonomyApi.getDistricts(),
      taxonomyApi.getOccupations(),
    ]).then(([r, d, o]) => {
      setRiskMatrix(r.data);
      setDistricts(d.data);
      setOccupations(o.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const runDistrictScan = async () => {
    const dist = districts.find(d => String(d.code) === selectedDistrict);
    if (!dist) return;
    try {
      const res = await obsolescenceApi.getDistrictVulnerability(
        selectedDistrict,
        String(dist.name || selectedDistrict)
      );
      setDistrictReport(res.data);
    } catch { toast.error('District scan failed'); }
  };

  const generatePathway = async () => {
    try {
      const res = await obsolescenceApi.generatePreemptivePathway(selectedNco);
      setPathway(res.data);
      setTab('pathway');
      toast.success('Pathway generated!');
    } catch { toast.error('Pathway generation failed'); }
  };

  const ovsColor = (ovs: number) => {
    if (ovs >= 70) return 'var(--color-danger)';
    if (ovs >= 40) return 'var(--color-orange)';
    if (ovs >= 20) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Automation & Skill-Obsolescence Radar</h1>
          <p className="page-subtitle">
            Strategic Innovation 7 — Ranks NCO occupations by Obsolescence Velocity Score (OVS) due to AI, RPA & robotics penetration
          </p>
        </div>
        <span className="badge badge-purple">🤖 AI Radar</span>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'matrix' ? 'active' : ''}`} onClick={() => setTab('matrix')}>Trade Risk Matrix</button>
        <button className={`tab ${tab === 'district' ? 'active' : ''}`} onClick={() => setTab('district')}>District Vulnerability</button>
        {pathway && <button className={`tab ${tab === 'pathway' ? 'active' : ''}`} onClick={() => setTab('pathway')}>Reskilling Pathway</button>}
      </div>

      {tab === 'matrix' && (
        loading ? <div className="loading-overlay"><div className="spinner" /><p>Loading risk matrix...</p></div> : (
          <>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>
                <Zap size={16} style={{ color: 'var(--color-danger)' }} /> Obsolescence Velocity Score (OVS) — All Trades
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Trade</th>
                      <th>NCO Code</th>
                      <th>OVS (0-100%)</th>
                      <th>Routineness</th>
                      <th>AI Driver</th>
                      <th>Timeframe</th>
                      <th>Pivot To</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskMatrix.map((r: Record<string, unknown>, i: number) => {
                      const ovs = Number(r.ovs_score || r.obsolescence_velocity_score || 0);
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: 700 }}>#{i + 1}</td>
                          <td style={{ fontSize: 12, fontWeight: 600 }}>{String(r.trade_title || r.occupation_title || '')}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(r.nco_code || '')}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 700, color: ovsColor(ovs), minWidth: 38 }}>{ovs.toFixed(0)}%</span>
                              <div className="progress" style={{ width: 60 }}>
                                <div className="progress-bar red" style={{ width: `${ovs}%`, background: ovsColor(ovs) }} />
                              </div>
                            </div>
                          </td>
                          <td>{String(r.routineness_index || '')}</td>
                          <td><span className="badge badge-purple" style={{ fontSize: 10 }}>{String(r.primary_displacement_driver || '')}</span></td>
                          <td style={{ fontSize: 11, color: 'var(--color-orange)' }}>{String(r.displacement_timeframe || r.risk_horizon || '')}</td>
                          <td style={{ fontSize: 11, color: 'var(--color-success)' }}>{String(r.recommended_pivot_trade || '').slice(0, 30)}</td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => { setSelectedNco(String(r.nco_code || '')); generatePathway(); }}
                            >
                              <Shield size={12} /> Pathway
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      )}

      {tab === 'district' && (
        <>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              <AlertTriangle size={16} style={{ color: 'var(--color-warning)' }} /> District Automation Vulnerability Scan
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 240 }}>
                <label className="form-label">District</label>
                <select className="select" value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}>
                  {districts.map((d: Record<string, unknown>, i) => (
                    <option key={i} value={String(d.code)}>{String(d.name)} ({String(d.code)})</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={runDistrictScan}>
                <AlertTriangle size={15} /> Scan District
              </button>
            </div>
          </div>

          {districtReport && (
            <>
              <div className="grid-4">
                <div className="stat-card red">
                  <div className="stat-value" style={{ color: 'var(--color-danger)', fontSize: 22 }}>
                    {Number(districtReport.total_at_risk_headcount || 0).toLocaleString()}
                  </div>
                  <div className="stat-label">Workers at Automation Risk</div>
                </div>
                <div className="stat-card orange">
                  <div className="stat-value" style={{ color: 'var(--color-orange)', fontSize: 22 }}>
                    {Number(districtReport.critical_risk_headcount || 0).toLocaleString()}
                  </div>
                  <div className="stat-label">Critical Risk (12-18 months)</div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-value" style={{ color: 'var(--color-primary)', fontSize: 22 }}>
                    {Number(districtReport.district_vulnerability_score || 0).toFixed(1)}%
                  </div>
                  <div className="stat-label">District Vulnerability Score</div>
                </div>
                <div className="stat-card yellow">
                  <div className="stat-value" style={{ color: 'var(--color-warning)', fontSize: 22 }}>
                    {(districtReport.at_risk_trades as unknown[] || []).length}
                  </div>
                  <div className="stat-label">At-Risk Trades</div>
                </div>
              </div>

              {districtReport.early_warning_alert && (
                <div className="alert alert-red">
                  <Zap size={16} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Early Warning:</strong><br />
                    {String(districtReport.early_warning_alert || '')}
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>At-Risk Trades in District</div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Trade</th><th>Headcount at Risk</th><th>OVS</th><th>Timeframe</th><th>Pivot Trade</th></tr>
                    </thead>
                    <tbody>
                      {(districtReport.at_risk_trades as Record<string, unknown>[] || []).map((t, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: 12, fontWeight: 600 }}>{String(t.trade_title || '')}</td>
                          <td><span className="badge badge-red">{Number(t.headcount_at_risk || 0).toLocaleString()}</span></td>
                          <td style={{ fontWeight: 700, color: ovsColor(Number(t.ovs_score || 0)) }}>
                            {Number(t.ovs_score || 0).toFixed(0)}%
                          </td>
                          <td style={{ fontSize: 11, color: 'var(--color-orange)' }}>{String(t.displacement_timeframe || '')}</td>
                          <td style={{ fontSize: 11, color: 'var(--color-success)' }}>{String(t.pivot_trade || '')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!districtReport && (
            <div className="empty-state"><AlertTriangle size={48} /><p>Select a district and click Scan to see automation vulnerability data.</p></div>
          )}
        </>
      )}

      {tab === 'pathway' && pathway && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Shield size={16} style={{ color: 'var(--color-success)' }} /> Pre-emptive Reskilling Pathway</div>
            <span className="badge badge-green">Turn-Key Plan</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Source Trade (At Risk)</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-danger)' }}>{String(pathway.source_trade_title || '')}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Pivot Trade</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-success)' }}>{String(pathway.pivot_trade_title || '')}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Total Reskilling Duration</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>{String(pathway.total_duration_weeks || '')} weeks</div>
              </div>
            </div>
            <div className="divider" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>📚 Module Sequence:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(pathway.modules as Record<string, unknown>[] || []).map((m, i) => (
                  <div key={i} style={{
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 10,
                    padding: '12px 16px',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}>
                    <div style={{
                      background: 'var(--color-primary)',
                      color: 'white',
                      borderRadius: 8,
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>{i + 1}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{String(m.module_name || '')}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-dim)', marginTop: 2 }}>
                        Duration: {String(m.duration_weeks || '')} weeks | {String(m.delivery_mode || '')}
                      </div>
                      <div style={{ fontSize: 11, marginTop: 4, color: 'var(--color-text-dim)' }}>{String(m.description || '')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
