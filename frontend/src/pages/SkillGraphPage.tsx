import { useEffect, useState } from 'react';
import { skillsApi, taxonomyApi } from '../api/client';
import { Network, ArrowRight, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SkillGraphPage() {
  const [occupations, setOccupations] = useState<Record<string, unknown>[]>([]);
  const [sourceNco, setSourceNco] = useState('7231.0100');
  const [surplus, setSurplus] = useState(500);
  const [recommendations, setRecommendations] = useState<Record<string, unknown> | null>(null);
  const [network, setNetwork] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [netLoading, setNetLoading] = useState(true);
  const [tab, setTab] = useState<'bridge' | 'network'>('bridge');

  useEffect(() => {
    Promise.all([
      taxonomyApi.getOccupations({ is_legacy_at_risk: true }),
      skillsApi.getNetwork(),
    ]).then(([o, n]) => {
      setOccupations(o.data);
      setNetwork(n.data);
    }).catch(console.error)
      .finally(() => setNetLoading(false));
  }, []);

  const fetchBridge = async () => {
    setLoading(true);
    try {
      const res = await skillsApi.getBridgeRecommendations(sourceNco, surplus);
      setRecommendations(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || 'Bridge recommendation failed');
    } finally {
      setLoading(false);
    }
  };

  const bridges = (recommendations?.bridge_routes as Record<string, unknown>[]) || [];
  const nodes = (network?.nodes as Record<string, unknown>[]) || [];
  const edges = (network?.edges as Record<string, unknown>[]) || [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Skill Adjacency & Bridge Course Recommender</h1>
          <p className="page-subtitle">
            Winning Pillar 2 — Maps saturated legacy trades to high-demand emerging roles via competency overlap graphs
          </p>
        </div>
        <span className="badge badge-green">🏆 SIH Winning Pillar</span>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'bridge' ? 'active' : ''}`} onClick={() => setTab('bridge')}>Bridge Recommendations</button>
        <button className={`tab ${tab === 'network' ? 'active' : ''}`} onClick={() => setTab('network')}>Skill Network Topology</button>
      </div>

      {tab === 'bridge' ? (
        <>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              <Network size={16} style={{ color: 'var(--color-primary)' }} /> Configure Bridge Analysis
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 260 }}>
                <label className="form-label">Legacy / Oversupplied Trade (Source)</label>
                <select className="select" value={sourceNco} onChange={e => setSourceNco(e.target.value)}>
                  {occupations.map((o: Record<string, unknown>, i) => (
                    <option key={i} value={String(o.nco_code)}>{String(o.title)} ({String(o.nco_code)})</option>
                  ))}
                  {occupations.length === 0 && (
                    <>
                      <option value="7231.0100">Diesel Mechanic (7231.0100)</option>
                      <option value="4132.0100">Data Entry Operator (4132.0100)</option>
                      <option value="8212.0300">Manual Solderer (8212.0300)</option>
                    </>
                  )}
                </select>
              </div>
              <div className="form-group" style={{ minWidth: 140 }}>
                <label className="form-label">Surplus Candidates</label>
                <input className="input" type="number" min={10} max={10000} value={surplus}
                  onChange={e => setSurplus(Number(e.target.value))} />
              </div>
              <button className="btn btn-primary" onClick={fetchBridge} disabled={loading}>
                {loading ? <div className="spinner" style={{ width: 15, height: 15 }} /> : <Lightbulb size={15} />}
                {loading ? 'Computing...' : 'Get Bridge Routes'}
              </button>
            </div>
          </div>

          {recommendations && (
            <>
              {/* Source Trade Summary */}
              <div className="card">
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Source Trade (Oversupplied)</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-danger)' }}>{String(recommendations.source_trade_title || '')}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>NCO: {String(recommendations.source_nco_code || '')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Surplus Candidates to Transition</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-warning)' }}>{Number(recommendations.total_surplus_candidates || 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Bridge Routes Found</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-success)' }}>{bridges.length}</div>
                  </div>
                </div>
              </div>

              {/* Bridge Routes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {bridges.map((route: Record<string, unknown>, i: number) => {
                  const overlapPct = Number(route.skill_overlap_pct || 0);
                  const bridgeWeeks = Number(route.bridge_course_weeks || 0);
                  return (
                    <div key={i} className="card" style={{ borderLeft: `4px solid var(--color-success)` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>Transition to →</span>
                            <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-success)' }}>{String(route.target_trade_title || '')}</span>
                            <span className="badge badge-cyan">{String(route.target_nco_code || '')}</span>
                            <span className="badge badge-green">NSQF {String(route.target_nsqf_level || '')}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginTop: 4 }}>{String(route.target_sector_code || '')}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>{overlapPct}%</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Skill Overlap</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-orange)' }}>{bridgeWeeks}w</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Bridge Course</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-success)' }}>{Number(route.transitionable_candidates || 0)}</div>
                            <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Candidates</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Skill Overlap:</span>
                          <div className="progress" style={{ flex: 1 }}>
                            <div className="progress-bar green" style={{ width: `${overlapPct}%` }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600 }}>{overlapPct}%</span>
                        </div>
                      </div>

                      <div className="divider" />

                      <div className="grid-2" style={{ gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-success)', marginBottom: 6 }}>✅ Shared Skills</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {(route.shared_skills as string[] || []).map((s, si) => (
                              <span key={si} className="badge badge-green" style={{ fontSize: 10 }}>{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-orange)', marginBottom: 6 }}>📚 Skills to Acquire (Bridge)</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {(route.missing_skills as string[] || []).map((s, si) => (
                              <span key={si} className="badge badge-orange" style={{ fontSize: 10 }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {Boolean(route.recommended_bridge_module) && (
                        <div className="alert alert-blue" style={{ marginTop: 12, fontSize: 12 }}>
                          <Lightbulb size={13} style={{ flexShrink: 0 }} />
                          <div>
                            <strong>NSQF Bridge Module: </strong>{String(route.recommended_bridge_module || '')}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!recommendations && !loading && (
            <div className="empty-state">
              <Network size={48} />
              <p>Select a legacy trade and click "Get Bridge Routes" to see skill adjacency recommendations.</p>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Network size={16} /> Skill Network Topology — Nodes & Edges</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-blue">{nodes.length} Occupation Nodes</span>
              <span className="badge badge-orange">{edges.length} Skill-Distance Edges</span>
            </div>
          </div>
          {netLoading ? (
            <div className="loading-overlay"><div className="spinner" /><p>Loading graph...</p></div>
          ) : (
            <>
              <div className="grid-2">
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--color-text-dim)' }}>Occupation Nodes</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>NCO Code</th><th>Title</th><th>Sector</th><th>Type</th></tr></thead>
                      <tbody>
                        {nodes.map((n: Record<string, unknown>, i: number) => (
                          <tr key={i}>
                            <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{String(n.id || n.nco_code || '')}</td>
                            <td style={{ fontSize: 11 }}>{String(n.label || n.title || '')}</td>
                            <td><span className="badge badge-blue" style={{ fontSize: 9 }}>{String(n.sector_code || n.sector || '')}</span></td>
                            <td>
                              {n.is_emerging ? <span className="badge badge-green" style={{ fontSize: 9 }}>Emerging</span>
                                : n.is_legacy_at_risk ? <span className="badge badge-red" style={{ fontSize: 9 }}>Legacy Risk</span>
                                  : <span className="badge badge-cyan" style={{ fontSize: 9 }}>Stable</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--color-text-dim)' }}>Adjacency Edges</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>From</th><th>→</th><th>To</th><th>Overlap</th><th>Bridge Wks</th></tr></thead>
                      <tbody>
                        {edges.map((e: Record<string, unknown>, i: number) => (
                          <tr key={i}>
                            <td style={{ fontSize: 10, fontFamily: 'monospace' }}>{String(e.source || e.from || '')}</td>
                            <td><ArrowRight size={12} style={{ color: 'var(--color-text-dim)' }} /></td>
                            <td style={{ fontSize: 10, fontFamily: 'monospace' }}>{String(e.target || e.to || '')}</td>
                            <td>
                              <div className="progress" style={{ width: 50 }}>
                                <div className="progress-bar green" style={{ width: `${Number(e.overlap_pct || e.skill_overlap_pct || 0)}%` }} />
                              </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{String(e.bridge_weeks || '')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
