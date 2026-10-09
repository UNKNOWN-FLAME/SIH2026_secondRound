import { useEffect, useState } from 'react';
import { tendersApi } from '../api/client';
import { ShoppingBag, Search, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TendersPage() {
  const [pipeline, setPipeline] = useState<Record<string, unknown>[]>([]);
  const [boqResult, setBoqResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pipeline' | 'parse'>('pipeline');

  // BOQ parse fields
  const [tenderTitle, setTenderTitle] = useState('PM Surya Ghar Solar Installation — Phase 3 Rajasthan');
  const [tenderScope, setTenderScope] = useState('Installation of 50,000 rooftop solar panels across rural Rajasthan. Requires certified PV installers, electrical wiremen, civil masons for mounting structures, and safety officers per CPCB norms.');
  const [tenderValue, setTenderValue] = useState(450);
  const [boqLoading, setBoqLoading] = useState(false);

  useEffect(() => {
    tendersApi.getPipeline()
      .then(res => setPipeline(res.data))
      .catch(() => toast.error('Failed to load tender pipeline'))
      .finally(() => setLoading(false));
  }, []);

  const parseBoq = async () => {
    setBoqLoading(true);
    try {
      const res = await tendersApi.parseBoq({
        tender_title: tenderTitle,
        tender_scope_text: tenderScope,
        tender_value_cr: tenderValue,
      });
      setBoqResult(res.data);
      toast.success('BoQ extracted!');
    } catch { toast.error('BoQ parsing failed'); }
    finally { setBoqLoading(false); }
  };

  const statusColor = (status: string) => {
    if (status?.includes('Sanction') || status?.includes('Active')) return 'badge-green';
    if (status?.includes('Tender')) return 'badge-blue';
    if (status?.includes('Pipeline') || status?.includes('Planned')) return 'badge-yellow';
    return 'badge-cyan';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Forward-Predictive Tenders (GeM / CPPP)</h1>
          <p className="page-subtitle">
            Ground Innovation 1 — Parses approved GeM & CPPP tenders into a "Bill of Qualifications" giving MSDE a 6-12 month lead window
          </p>
        </div>
        <span className="badge badge-blue">📦 GeM BoQ Engine</span>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'pipeline' ? 'active' : ''}`} onClick={() => setTab('pipeline')}>Active Pipeline</button>
        <button className={`tab ${tab === 'parse' ? 'active' : ''}`} onClick={() => setTab('parse')}>Parse Tender → BoQ</button>
      </div>

      {tab === 'pipeline' && (
        loading ? <div className="loading-overlay"><div className="spinner" /><p>Loading tender pipeline...</p></div> : (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              <ShoppingBag size={16} style={{ color: 'var(--color-primary)' }} /> National Infrastructure Project Pipeline
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Ministry</th>
                    <th>Value (₹ Cr)</th>
                    <th>Status</th>
                    <th>Lead Window</th>
                    <th>Key Trades</th>
                    <th>Workforce Est.</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.map((t: Record<string, unknown>, i) => (
                    <tr key={i}>
                      <td style={{ fontSize: 12, fontWeight: 600, maxWidth: 200 }}>
                        <div className="truncate">{String(t.project_title || t.tender_title || '')}</div>
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(t.ministry || t.awarding_body || '')}</td>
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>₹{Number(t.value_cr || t.tender_value_cr || 0).toLocaleString()}</td>
                      <td><span className={`badge ${statusColor(String(t.status || ''))}`} style={{ fontSize: 10 }}>{String(t.status || '')}</span></td>
                      <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>{String(t.lead_window_months || '')} months</td>
                      <td style={{ fontSize: 11, color: 'var(--color-text-dim)', maxWidth: 150 }}>{String(t.key_trades_required || '').slice(0, 50)}</td>
                      <td><span className="badge badge-orange">{Number(t.estimated_workforce || 0).toLocaleString()}</span></td>
                    </tr>
                  ))}
                  {pipeline.length === 0 && (
                    <tr><td colSpan={7}><div className="empty-state" style={{ padding: '20px 0' }}>No pipeline data</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {tab === 'parse' && (
        <>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              <Search size={16} style={{ color: 'var(--color-primary)' }} /> Parse GeM / CPPP Tender Scope into Bill of Qualifications (BoQ)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Tender / Project Title</label>
                <input className="input" value={tenderTitle} onChange={e => setTenderTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Scope of Work (raw text)</label>
                <textarea className="textarea" style={{ minHeight: 120 }} value={tenderScope} onChange={e => setTenderScope(e.target.value)} />
              </div>
              <div className="form-group" style={{ maxWidth: 200 }}>
                <label className="form-label">Tender Value (₹ Crores)</label>
                <input className="input" type="number" min={1} value={tenderValue} onChange={e => setTenderValue(Number(e.target.value))} />
              </div>
              <div>
                <button className="btn btn-primary" onClick={parseBoq} disabled={boqLoading}>
                  {boqLoading ? <div className="spinner" style={{ width: 15, height: 15 }} /> : <FileText size={15} />}
                  {boqLoading ? 'Parsing...' : 'Extract Bill of Qualifications'}
                </button>
              </div>
            </div>
          </div>

          {boqResult && (
            <div className="card">
              <div className="card-header">
                <div className="card-title"><FileText size={16} style={{ color: 'var(--color-success)' }} /> Bill of Qualifications (BoQ)</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="badge badge-green">AI Extracted</span>
                  <span className="badge badge-blue">6-12 Month Lead</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Project</div>
                  <div style={{ fontWeight: 700 }}>{String(boqResult.tender_title || '')}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Lead Window</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>{String(boqResult.lead_window_months || '')} months</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Total Workforce</div>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{Number(boqResult.total_workforce_required || 0).toLocaleString()}</div>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>NCO Trade</th><th>NSQF Level</th><th>Headcount</th><th>Timeline</th><th>Priority</th></tr>
                  </thead>
                  <tbody>
                    {(boqResult.boq_line_items as Record<string, unknown>[] || []).map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontSize: 12, fontWeight: 600 }}>{String(item.trade_title || '')}</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>Level {String(item.nsqf_level || '')}</td>
                        <td><span className="badge badge-blue">{Number(item.headcount_required || 0).toLocaleString()}</span></td>
                        <td style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(item.timeline || '')}</td>
                        <td><span className={`badge ${item.priority === 'Critical' ? 'badge-red' : 'badge-yellow'}`}>{String(item.priority || '')}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {Boolean(boqResult.msde_action_memo) && (
                <div className="alert alert-blue" style={{ marginTop: 16 }}>
                  <FileText size={14} style={{ flexShrink: 0 }} />
                  <div><strong>MSDE Action Memo:</strong><br />{String(boqResult.msde_action_memo || '')}</div>
                </div>
              )}
            </div>
          )}

          {!boqResult && !boqLoading && (
            <div className="empty-state"><ShoppingBag size={48} /><p>Enter a tender scope and parse to see the Bill of Qualifications.</p></div>
          )}
        </>
      )}
    </div>
  );
}
