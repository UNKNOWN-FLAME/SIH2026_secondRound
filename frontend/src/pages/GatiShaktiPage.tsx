import { useEffect, useState } from 'react';
import { gatiShaktiApi } from '../api/client';
import { Cpu, MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GatiShaktiPage() {
  const [corridors, setCorridors] = useState<Record<string, unknown>[]>([]);
  const [auditResult, setAuditResult] = useState<Record<string, unknown> | null>(null);
  const [simResult, setSimResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'corridors' | 'audit' | 'simulate'>('corridors');

  // Audit params
  const [auditNode, setAuditNode] = useState('MH_PUNE');
  const [catchmentKm, setCatchmentKm] = useState(50);

  // Simulation params
  const [projectTitle, setProjectTitle] = useState('Purvanchal Expressway Logistics Hub');
  const [simDistrict, setSimDistrict] = useState('UP_KANPUR');
  const [investment, setInvestment] = useState(1500);
  const [hubType, setHubType] = useState('Multi-Modal Logistics Park (MMLP)');

  useEffect(() => {
    gatiShaktiApi.getCorridors()
      .then(res => setCorridors(res.data))
      .catch(() => toast.error('Failed to load Gati-Shakti corridors'))
      .finally(() => setLoading(false));
  }, []);

  const runAudit = async () => {
    try {
      const res = await gatiShaktiApi.getCatchmentAudit(auditNode, catchmentKm);
      setAuditResult(res.data);
      setTab('audit');
      toast.success('Catchment audit complete');
    } catch { toast.error('Audit failed'); }
  };

  const runSimulation = async () => {
    try {
      const res = await gatiShaktiApi.simulateExpansion({
        project_title: projectTitle,
        district_code: simDistrict,
        investment_inr_cr: investment,
        hub_type: hubType,
      });
      setSimResult(res.data);
      setTab('simulate');
      toast.success('Simulation complete');
    } catch { toast.error('Simulation failed'); }
  };

  const typeColor = (type: string) => {
    if (type?.includes('Freight')) return 'badge-blue';
    if (type?.includes('Logistics')) return 'badge-green';
    if (type?.includes('Expressway')) return 'badge-orange';
    return 'badge-cyan';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">PM Gati-Shakti Multi-Modal Infrastructure Corridors</h1>
          <p className="page-subtitle">
            Strategic Innovation 6 — DFCs, MMLPs & Expressway hubs mapped with 50km ITI catchment audits & workforce projections
          </p>
        </div>
        <span className="badge badge-cyan">🚂 Gati-Shakti</span>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'corridors' ? 'active' : ''}`} onClick={() => setTab('corridors')}>Corridor Nodes</button>
        <button className={`tab ${tab === 'audit' ? 'active' : ''}`} onClick={() => setTab('audit')}>Catchment Audit</button>
        <button className={`tab ${tab === 'simulate' ? 'active' : ''}`} onClick={() => setTab('simulate')}>Simulate Expansion</button>
      </div>

      {tab === 'corridors' && (
        loading ? <div className="loading-overlay"><div className="spinner" /><p>Loading Gati-Shakti corridors...</p></div> : (
          <>
            {/* Audit Panel */}
            <div className="card">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
                  <label className="form-label">Corridor Node / District</label>
                  <input className="input" value={auditNode} onChange={e => setAuditNode(e.target.value)} placeholder="e.g. MH_PUNE or GS-NODE-WDFC-PUNE" />
                </div>
                <div className="form-group" style={{ minWidth: 140 }}>
                  <label className="form-label">Catchment Radius (km)</label>
                  <input className="input" type="number" min={10} max={150} value={catchmentKm} onChange={e => setCatchmentKm(Number(e.target.value))} />
                </div>
                <button className="btn btn-secondary" onClick={runAudit}><Search size={14} /> Audit Catchment</button>
              </div>
            </div>

            <div className="grid-2">
              {corridors.map((c: Record<string, unknown>, i: number) => (
                <div key={i} className="card">
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(34,211,238,0.1)', color: 'var(--color-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    }}>🚆</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{String(c.corridor_name || c.name || '')}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-dim)', marginTop: 2 }}>
                        <MapPin size={10} style={{ display: 'inline', marginRight: 3 }} />
                        {String(c.location || c.district_code || '')}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        <span className={`badge ${typeColor(String(c.corridor_type || c.infrastructure_type || ''))}`} style={{ fontSize: 10 }}>
                          {String(c.corridor_type || c.infrastructure_type || '')}
                        </span>
                        {Boolean(c.capex_inr_cr) && (
                          <span className="badge badge-yellow" style={{ fontSize: 10 }}>₹{Number(c.capex_inr_cr || 0).toLocaleString()} Cr</span>
                        )}
                        {Boolean(c.projected_logistics_workforce) && (
                          <span className="badge badge-green" style={{ fontSize: 10 }}>
                            {Number(c.projected_logistics_workforce || 0).toLocaleString()} workers
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {Boolean(c.key_trades_required) && (
                    <div style={{ marginTop: 10, fontSize: 11, color: 'var(--color-text-dim)' }}>
                      <strong>Key Trades: </strong>{String(c.key_trades_required || '').slice(0, 80)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Expansion Simulation panel */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}><Cpu size={16} /> Simulate New Corridor Expansion</div>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input className="input" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">District Code</label>
                  <input className="input" value={simDistrict} onChange={e => setSimDistrict(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Investment (₹ Crores)</label>
                  <input className="input" type="number" min={10} value={investment} onChange={e => setInvestment(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hub Type</label>
                  <input className="input" value={hubType} onChange={e => setHubType(e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={runSimulation}>
                <Cpu size={15} /> Simulate Expansion
              </button>
            </div>
          </>
        )
      )}

      {tab === 'audit' && auditResult && (
        <>
          <div className="grid-4">
            <div className="stat-card blue">
              <div className="stat-value" style={{ color: 'var(--color-primary)', fontSize: 20 }}>{Number(auditResult.iti_count_in_catchment || 0)}</div>
              <div className="stat-label">ITIs in 50km Catchment</div>
            </div>
            <div className="stat-card orange">
              <div className="stat-value" style={{ color: 'var(--color-orange)', fontSize: 20 }}>{Number(auditResult.total_workforce_deficit || 0).toLocaleString()}</div>
              <div className="stat-label">Workforce Deficit</div>
            </div>
            <div className="stat-card red">
              <div className="stat-value" style={{ color: 'var(--color-danger)', fontSize: 20 }}>₹{Number(auditResult.total_capex_required_cr || 0).toFixed(0)} Cr</div>
              <div className="stat-label">ITI Upgrade Capex Required</div>
            </div>
            <div className="stat-card green">
              <div className="stat-value" style={{ color: 'var(--color-success)', fontSize: 20 }}>{Number(auditResult.readiness_score || 0).toFixed(1)}%</div>
              <div className="stat-label">Catchment Readiness Score</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 12 }}>🏫 ITIs in Catchment Area</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Center Name</th><th>District</th><th>Seats</th><th>Gaps</th><th>Lab Upgrade Cost</th></tr></thead>
                <tbody>
                  {(auditResult.iti_list as Record<string, unknown>[] || []).map((iti, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 12, fontWeight: 600 }}>{String(iti.name || '')}</td>
                      <td style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(iti.district_code || '')}</td>
                      <td>{Number(iti.annual_intake || 0).toLocaleString()}</td>
                      <td><span className="badge badge-orange">{String(iti.critical_equipment_gaps || 'None')}</span></td>
                      <td>₹{Number(iti.estimated_upgrade_cost_lakhs || 0).toLocaleString()} L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'simulate' && simResult && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Cpu size={16} /> Corridor Expansion Simulation Results</div>
          </div>
          <div className="code-block" style={{ color: 'var(--color-text)', background: 'var(--color-surface-2)' }}>
            {JSON.stringify(simResult, null, 2)}
          </div>
        </div>
      )}

      {(tab === 'audit' && !auditResult) && (
        <div className="empty-state"><Search size={48} /><p>Run a catchment audit to see ITI readiness data.</p></div>
      )}
      {(tab === 'simulate' && !simResult) && (
        <div className="empty-state"><Cpu size={48} /><p>Run an expansion simulation to see results.</p></div>
      )}
    </div>
  );
}
