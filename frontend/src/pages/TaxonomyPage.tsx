import { useEffect, useState } from 'react';
import { taxonomyApi } from '../api/client';
import { BarChart3, Search, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaxonomyPage() {
  const [states, setStates] = useState<Record<string, unknown>[]>([]);
  const [districts, setDistricts] = useState<Record<string, unknown>[]>([]);
  const [sectors, setSectors] = useState<Record<string, unknown>[]>([]);
  const [occupations, setOccupations] = useState<Record<string, unknown>[]>([]);
  const [matchResult, setMatchResult] = useState<Record<string, unknown> | null>(null);
  const [queryText, setQueryText] = useState('Solar panel installation technician with EV battery knowledge');
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [tab, setTab] = useState<'sectors' | 'occupations' | 'districts' | 'match'>('sectors');
  const [sectorFilter, setSectorFilter] = useState('');
  const [emergingFilter, setEmergingFilter] = useState<string>('');

  useEffect(() => {
    Promise.all([
      taxonomyApi.getStates(),
      taxonomyApi.getDistricts(),
      taxonomyApi.getSectors(),
      taxonomyApi.getOccupations(),
    ]).then(([s, d, sec, o]) => {
      setStates(s.data);
      setDistricts(d.data);
      setSectors(sec.data);
      setOccupations(o.data);
    }).catch(() => toast.error('Failed to load taxonomy'))
      .finally(() => setLoading(false));
  }, []);

  const applyOccFilter = async () => {
    const params: Record<string, unknown> = {};
    if (sectorFilter) params.sector_code = sectorFilter;
    if (emergingFilter === 'emerging') params.is_emerging = true;
    if (emergingFilter === 'legacy') params.is_legacy_at_risk = true;
    try {
      const res = await taxonomyApi.getOccupations(params);
      setOccupations(res.data);
    } catch { toast.error('Filter failed'); }
  };

  const runMatch = async () => {
    if (!queryText.trim()) return;
    setMatchLoading(true);
    try {
      const res = await taxonomyApi.matchJob(queryText, topK);
      setMatchResult(res.data);
    } catch { toast.error('Match failed'); }
    finally { setMatchLoading(false); }
  };

  const SECTOR_EMOJI: Record<string, string> = {
    GREEN_ENERGY: '☀️',
    ESDM: '💻',
    HEALTHCARE: '🏥',
    IT_ITES: '📱',
  };

  if (loading) return <div className="loading-overlay"><div className="spinner" /><p>Loading taxonomy...</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">NCO-2015 Taxonomy & AI Job Classifier</h1>
          <p className="page-subtitle">
            Official NCO-2015 occupational taxonomy, NSQF levels, state/district master data, and AI semantic job-to-NCO mapper
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-blue">{states.length} States</span>
          <span className="badge badge-green">{districts.length} Districts</span>
          <span className="badge badge-orange">{occupations.length} Occupations</span>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'sectors' ? 'active' : ''}`} onClick={() => setTab('sectors')}>Sectors</button>
        <button className={`tab ${tab === 'occupations' ? 'active' : ''}`} onClick={() => setTab('occupations')}>Occupations</button>
        <button className={`tab ${tab === 'districts' ? 'active' : ''}`} onClick={() => setTab('districts')}>Districts</button>
        <button className={`tab ${tab === 'match' ? 'active' : ''}`} onClick={() => setTab('match')}>AI NCO Mapper</button>
      </div>

      {tab === 'sectors' && (
        <div className="grid-2">
          {sectors.map((s: Record<string, unknown>, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 36 }}>{SECTOR_EMOJI[String(s.code || '')] || '🏭'}</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{String(s.name || '')}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-primary)', marginTop: 2 }}>Code: {String(s.code || '')}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginTop: 4 }}>{String(s.description || '')}</div>
                  <div style={{ marginTop: 8 }}>
                    <span className="badge badge-cyan" style={{ marginRight: 6 }}>SSC: {String(s.ssc_name || '')}</span>
                    <span className="badge badge-blue">{Number(s.active_trades_count || 0)} Trades</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'occupations' && (
        <>
          <div className="card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <select className="select" style={{ width: 200 }} value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}>
                <option value="">All Sectors</option>
                {sectors.map((s: Record<string, unknown>, i) => <option key={i} value={String(s.code)}>{String(s.name)}</option>)}
              </select>
              <select className="select" style={{ width: 200 }} value={emergingFilter} onChange={e => setEmergingFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="emerging">Emerging (High Demand)</option>
                <option value="legacy">Legacy (At Risk)</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={applyOccFilter}>Filter</button>
              <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{occupations.length} occupations</span>
            </div>
          </div>

          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>NCO Code</th><th>Title</th><th>Sector</th><th>NSQF Level</th><th>Core Skills</th><th>Type</th></tr>
                </thead>
                <tbody>
                  {occupations.map((o: Record<string, unknown>, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: 'var(--color-primary)' }}>{String(o.nco_code || '')}</td>
                      <td style={{ fontSize: 12, fontWeight: 600 }}>{String(o.title || '')}</td>
                      <td><span className="badge badge-blue" style={{ fontSize: 10 }}>{String(o.sector_code || '')}</span></td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{String(o.nsqf_level || '')}</td>
                      <td style={{ fontSize: 11, color: 'var(--color-text-dim)', maxWidth: 200 }}>
                        {String(o.core_skills || '').slice(0, 60)}{String(o.core_skills || '').length > 60 ? '…' : ''}
                      </td>
                      <td>
                        {o.is_emerging
                          ? <span className="badge badge-green" style={{ fontSize: 9 }}>🚀 Emerging</span>
                          : o.is_legacy_at_risk
                          ? <span className="badge badge-red" style={{ fontSize: 9 }}>⚠️ Legacy Risk</span>
                          : <span className="badge badge-cyan" style={{ fontSize: 9 }}>Stable</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'districts' && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Code</th><th>Name</th><th>State</th><th>LGD Code</th><th>Tier</th><th>Industrial Focus</th><th>Coordinates</th></tr>
              </thead>
              <tbody>
                {districts.map((d: Record<string, unknown>, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600, color: 'var(--color-primary)' }}>{String(d.code || '')}</td>
                    <td style={{ fontSize: 12, fontWeight: 600 }}>{String(d.name || '')}</td>
                    <td><span className="badge badge-blue" style={{ fontSize: 10 }}>{String(d.state_code || '')}</span></td>
                    <td style={{ fontSize: 11 }}>{String(d.lgd_code || '')}</td>
                    <td><span className={`badge ${String(d.tier) === '1' ? 'badge-green' : String(d.tier) === '2' ? 'badge-yellow' : 'badge-orange'}`} style={{ fontSize: 10 }}>Tier {String(d.tier || '')}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--color-text-dim)', maxWidth: 150 }}>{String(d.industrial_focus || '').slice(0, 40)}</td>
                    <td style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{Number(d.latitude || 0).toFixed(2)}°N, {Number(d.longitude || 0).toFixed(2)}°E</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'match' && (
        <>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              <Search size={16} style={{ color: 'var(--color-primary)' }} /> AI Semantic NCO Mapper (TF-IDF + Cosine Similarity)
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Raw Job Description / Title</label>
              <textarea
                className="textarea"
                style={{ minHeight: 100 }}
                value={queryText}
                onChange={e => setQueryText(e.target.value)}
                placeholder="Enter unstructured job posting text, syllabus title, or skill description..."
              />
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ minWidth: 120 }}>
                <label className="form-label">Top-K Results</label>
                <input className="input" type="number" min={1} max={20} value={topK} onChange={e => setTopK(Number(e.target.value))} />
              </div>
              <button className="btn btn-primary" onClick={runMatch} disabled={matchLoading}>
                {matchLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Search size={14} />}
                {matchLoading ? 'Classifying...' : 'Classify to NCO'}
              </button>
            </div>
          </div>

          {matchResult && (
            <div className="card">
              <div className="card-header">
                <div className="card-title"><Tag size={16} style={{ color: 'var(--color-success)' }} /> NCO Classification Results</div>
                <span className="badge badge-blue">AI Matched</span>
              </div>
              <div style={{ marginBottom: 12, fontSize: 12, color: 'var(--color-text-dim)' }}>
                Query: <em style={{ color: 'var(--color-text)' }}>{String(matchResult.query_text || '')}</em>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(matchResult.matches as Record<string, unknown>[] || []).map((m: Record<string, unknown>, i) => (
                  <div key={i} style={{
                    background: 'var(--color-surface-2)',
                    border: `1px solid ${i === 0 ? 'var(--color-success)' : 'var(--color-border)'}`,
                    borderRadius: 10,
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {i === 0 && <span className="badge badge-green" style={{ fontSize: 10 }}>Best Match</span>}
                        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>{String(m.nco_code || '')}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{String(m.title || '')}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-dim)', marginTop: 4 }}>
                        {String(m.sector_code || '')} | NSQF Level {String(m.nsqf_level || '')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: Number(m.similarity_score || 0) > 0.7 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {(Number(m.similarity_score || 0) * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Similarity</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!matchResult && !matchLoading && (
            <div className="empty-state"><Search size={48} /><p>Enter a job description and run the AI classifier.</p></div>
          )}
        </>
      )}
    </div>
  );
}
