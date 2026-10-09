import { useEffect, useState } from 'react';
import { curriculumApi, taxonomyApi } from '../api/client';
import { BookOpen, AlertTriangle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CurriculumPage() {
  const [occupations, setOccupations] = useState<Record<string, unknown>[]>([]);
  const [highRisk, setHighRisk] = useState<Record<string, unknown>[]>([]);
  const [auditResult, setAuditResult] = useState<Record<string, unknown> | null>(null);
  const [addendum, setAddendum] = useState<Record<string, unknown> | null>(null);
  const [selectedNco, setSelectedNco] = useState('7231.0100');
  const [loading, setLoading] = useState(false);
  const [highRiskLoading, setHighRiskLoading] = useState(true);
  const [tab, setTab] = useState<'audit' | 'high-risk' | 'addendum'>('audit');
  const [minObsolescence, setMinObsolescence] = useState(25);

  useEffect(() => {
    Promise.all([
      taxonomyApi.getOccupations(),
      curriculumApi.getHighRiskTrades(25),
    ]).then(([o, h]) => {
      setOccupations(o.data);
      setHighRisk(h.data);
    }).catch(console.error)
      .finally(() => setHighRiskLoading(false));
  }, []);

  const runAudit = async () => {
    setLoading(true);
    try {
      const res = await curriculumApi.auditCurriculum(selectedNco);
      setAuditResult(res.data);
      setAddendum(null);
      toast.success('Curriculum audit complete');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || 'Audit failed');
    } finally {
      setLoading(false);
    }
  };

  const generateAddendum = async () => {
    setLoading(true);
    try {
      const res = await curriculumApi.generateRevisionAddendum(selectedNco);
      setAddendum(res.data);
      setTab('addendum');
      toast.success('Revision addendum generated!');
    } catch {
      toast.error('Addendum generation failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchHighRisk = async () => {
    setHighRiskLoading(true);
    try {
      const res = await curriculumApi.getHighRiskTrades(minObsolescence);
      setHighRisk(res.data);
    } catch {
      toast.error('Failed to load high-risk trades');
    } finally {
      setHighRiskLoading(false);
    }
  };

  const obsolescenceColor = (pct: number) => {
    if (pct >= 50) return 'var(--color-danger)';
    if (pct >= 30) return 'var(--color-orange)';
    return 'var(--color-warning)';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">NCVET Curriculum Obsolescence Analyzer</h1>
          <p className="page-subtitle">
            Winning Feature 1 — Evaluates QP-NOS syllabi vs real-time industry specs. Flags decaying modules & missing competencies.
          </p>
        </div>
        <span className="badge badge-orange">🏆 Winning Feature</span>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'audit' ? 'active' : ''}`} onClick={() => setTab('audit')}>Curriculum Audit</button>
        <button className={`tab ${tab === 'high-risk' ? 'active' : ''}`} onClick={() => setTab('high-risk')}>High-Risk Trades</button>
        {addendum && <button className={`tab ${tab === 'addendum' ? 'active' : ''}`} onClick={() => setTab('addendum')}>Revision Addendum</button>}
      </div>

      {tab === 'audit' && (
        <>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              <BookOpen size={16} style={{ color: 'var(--color-primary)' }} /> Select Trade for Curriculum Audit
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 280 }}>
                <label className="form-label">NCO Occupation / Trade</label>
                <select className="select" value={selectedNco} onChange={e => setSelectedNco(e.target.value)}>
                  {occupations.map((o: Record<string, unknown>, i) => (
                    <option key={i} value={String(o.nco_code)}>
                      {String(o.title)} ({String(o.nco_code)})
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" onClick={runAudit} disabled={loading}>
                {loading ? <div className="spinner" style={{ width: 15, height: 15 }} /> : <BookOpen size={15} />}
                {loading ? 'Auditing...' : 'Run Audit'}
              </button>
              {auditResult && (
                <button className="btn btn-secondary" onClick={generateAddendum} disabled={loading}>
                  <FileText size={15} /> Generate Addendum
                </button>
              )}
            </div>
          </div>

          {auditResult && (
            <>
              {/* Audit Summary */}
              <div className="card">
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Trade</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{String(auditResult.trade_title || '')}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>NCO: {String(auditResult.nco_code || '')}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, fontWeight: 700, color: obsolescenceColor(Number(auditResult.obsolescence_rate_pct || 0)) }}>
                      {Number(auditResult.obsolescence_rate_pct || 0).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Obsolescence Rate</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, fontWeight: 700, color: 'var(--color-primary)' }}>
                      {Number(auditResult.industry_alignment_score || 0).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Industry Alignment</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-danger)' }}>
                      {(auditResult.decaying_modules as unknown[] || []).length}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Decaying Modules</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-orange)' }}>
                      {(auditResult.missing_modern_competencies as unknown[] || []).length}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Missing Competencies</div>
                  </div>
                </div>
              </div>

              <div className="grid-2">
                {/* Decaying Modules */}
                <div className="card">
                  <div className="card-header">
                    <div className="card-title" style={{ color: 'var(--color-danger)' }}>
                      <AlertTriangle size={15} /> Decaying Legacy Modules
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(auditResult.decaying_modules as Record<string, unknown>[] || []).map((m: Record<string, unknown>, i: number) => (
                      <div key={i} style={{
                        background: 'rgba(239,68,68,0.07)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 8,
                        padding: '10px 12px',
                      }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#f87171' }}>{String(m.module_name || '')}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-dim)', marginTop: 3 }}>{String(m.reason || '')}</div>
                        <div style={{ fontSize: 11, marginTop: 4 }}>
                          <span className="badge badge-red">Relevance: {Number(m.current_relevance_pct || 0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Competencies */}
                <div className="card">
                  <div className="card-header">
                    <div className="card-title" style={{ color: 'var(--color-orange)' }}>
                      <AlertTriangle size={15} /> Critical Missing Competencies
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(auditResult.missing_modern_competencies as Record<string, unknown>[] || []).map((c: Record<string, unknown>, i: number) => (
                      <div key={i} style={{
                        background: 'rgba(249,115,22,0.07)',
                        border: '1px solid rgba(249,115,22,0.2)',
                        borderRadius: 8,
                        padding: '10px 12px',
                      }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#fb923c' }}>{String(c.skill_name || c.competency || '')}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-dim)', marginTop: 3 }}>{String(c.employer_demand_signal || c.description || '')}</div>
                        <span className="badge badge-orange" style={{ marginTop: 4 }}>Priority: {String(c.priority || 'High')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lab Equipment Gaps */}
              {(auditResult.lab_equipment_gaps as unknown[] || []).length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <div className="card-title" style={{ color: 'var(--color-warning)' }}>
                      🔧 Lab Equipment Modernization Required
                    </div>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Equipment</th><th>Status</th><th>Priority</th><th>Est. Cost (₹L)</th></tr></thead>
                      <tbody>
                        {(auditResult.lab_equipment_gaps as Record<string, unknown>[]).map((g, i) => (
                          <tr key={i}>
                            <td style={{ fontSize: 12 }}>{String(g.equipment_name || '')}</td>
                            <td><span className="badge badge-red">{String(g.current_status || 'Absent')}</span></td>
                            <td><span className={`badge ${g.priority === 'Critical' ? 'badge-red' : 'badge-yellow'}`}>{String(g.priority || '')}</span></td>
                            <td style={{ fontWeight: 600 }}>₹{Number(g.estimated_cost_lakhs || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {!auditResult && !loading && (
            <div className="empty-state"><BookOpen size={48} /><p>Select a trade and run audit to see obsolescence analysis.</p></div>
          )}
        </>
      )}

      {tab === 'high-risk' && (
        <>
          <div className="card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label className="form-label" style={{ margin: 0 }}>Min Obsolescence %:</label>
              <input className="input" type="number" style={{ width: 100 }} min={0} max={100} value={minObsolescence}
                onChange={e => setMinObsolescence(Number(e.target.value))} />
              <button className="btn btn-primary btn-sm" onClick={fetchHighRisk}>Apply</button>
              <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{highRisk.length} high-risk trades found</span>
            </div>
          </div>

          {highRiskLoading ? (
            <div className="loading-overlay"><div className="spinner" /><p>Loading high-risk trades...</p></div>
          ) : (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>🚨 National High-Risk Curriculum Trades (NCVET Priority)</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>Trade</th><th>NCO Code</th><th>Obsolescence %</th><th>Industry Alignment</th>
                      <th>Decaying Modules</th><th>Missing Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {highRisk.map((r: Record<string, unknown>, i: number) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>#{i + 1}</td>
                        <td style={{ fontSize: 12, fontWeight: 600 }}>{String(r.trade_title || '')}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(r.nco_code || '')}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 700, color: obsolescenceColor(Number(r.obsolescence_rate_pct || 0)) }}>
                              {Number(r.obsolescence_rate_pct || 0).toFixed(1)}%
                            </span>
                            <div className="progress" style={{ width: 60 }}>
                              <div className="progress-bar red" style={{ width: `${Math.min(Number(r.obsolescence_rate_pct || 0), 100)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: 'var(--color-success)' }}>{Number(r.industry_alignment_score || 0).toFixed(1)}%</span>
                            <div className="progress" style={{ width: 50 }}>
                              <div className="progress-bar green" style={{ width: `${Number(r.industry_alignment_score || 0)}%` }} />
                            </div>
                          </div>
                        </td>
                        <td><span className="badge badge-red">{(r.decaying_modules as unknown[] || []).length}</span></td>
                        <td><span className="badge badge-orange">{(r.missing_modern_competencies as unknown[] || []).length}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'addendum' && addendum && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><FileText size={16} style={{ color: 'var(--color-primary)' }} /> NCVET Curriculum Revision Addendum</div>
            <span className="badge badge-blue">Official Draft</span>
          </div>
          <div className="code-block" style={{ color: 'var(--color-text)', background: 'var(--color-surface-2)' }}>
            {JSON.stringify(addendum, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}
