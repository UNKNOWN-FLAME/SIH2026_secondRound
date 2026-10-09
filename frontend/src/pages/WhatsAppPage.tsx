import { useState } from 'react';
import { whatsappApi } from '../api/client';
import { MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WhatsAppPage() {
  const [message, setMessage] = useState('Mujhe 5 electricians chahiye solar panel ke kaam ke liye, NSQF Level 3, next week se Pune mein.');
  const [contractorName, setContractorName] = useState('Sharma Electricals, Pune');
  const [phone, setPhone] = useState('+91-98765-43210');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const submitSignal = async () => {
    setLoading(true);
    try {
      const res = await whatsappApi.ingestGigSignal({
        contractor_name: contractorName,
        phone_number: phone,
        raw_message_text: message,
        channel: 'WHATSAPP',
      });
      setResult(res.data);
      toast.success('Gig signal processed!');
    } catch { toast.error('Signal processing failed'); }
    finally { setLoading(false); }
  };

  const examples = [
    'Need 10 solar panel fitters immediately in Jaipur, must have NSQF Level 4 certificate, pay ₹600/day',
    'Mujhe 3 EV battery technician chahiye, Pune factory, PMKVY certified, starting Monday',
    'Required: 5 dialysis technicians, GNM or equivalent, Apollo Hospital Hyderabad, urgent',
    'Looking for 8 SMT operators for circuit board assembly, Noida factory, experience preferred',
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">WhatsApp "Gig-Signal" Engine for MSMEs</h1>
          <p className="page-subtitle">
            Ground Innovation 4 — Local contractors send natural language hiring requests; AI extracts demand & matches certified MSDE candidates instantly
          </p>
        </div>
        <span className="badge badge-green">💬 WhatsApp AI</span>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>
            <MessageSquare size={16} style={{ color: '#25D366' }} /> Submit Contractor Hiring Request
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Contractor / MSME Name</label>
              <input className="input" value={contractorName} onChange={e => setContractorName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp Number</label>
              <input className="input" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Natural Language Message (Hindi / English)</label>
              <textarea
                className="textarea"
                style={{ minHeight: 120 }}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your hiring requirement in Hindi or English..."
              />
            </div>

            <div>
              <div style={{ fontSize: 11, color: 'var(--color-text-dim)', marginBottom: 8 }}>Try an example:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    className="btn btn-secondary btn-sm"
                    style={{ justifyContent: 'flex-start', textAlign: 'left', whiteSpace: 'normal', height: 'auto', padding: '6px 10px' }}
                    onClick={() => setMessage(ex)}
                  >
                    <span style={{ fontSize: 11 }}>{ex.slice(0, 60)}…</span>
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-lg" onClick={submitSignal} disabled={loading}
              style={{ justifyContent: 'center', background: '#25D366' }}>
              {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <Send size={18} />}
              {loading ? 'Processing Signal...' : 'Submit Gig Signal'}
            </button>
          </div>
        </div>

        {result ? (
          <div className="card">
            <div className="card-header">
              <div className="card-title" style={{ color: '#25D366' }}>✅ Signal Processed Successfully</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Extracted Trade</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-primary)' }}>{String(result.extracted_trade_title || '')}</div>
                <div style={{ fontSize: 12 }}>NCO: {String(result.matched_nco_code || '')} | NSQF: {String(result.nsqf_level || '')}</div>
              </div>
              <div className="grid-2">
                <div style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>{Number(result.headcount_requested || 0)}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Headcount Requested</div>
                </div>
                <div style={{ background: 'var(--color-surface-2)', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-success)' }}>{Number(result.matched_candidates_count || 0)}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Matched Candidates</div>
                </div>
              </div>

              {(result.matched_candidates as Record<string, unknown>[] || []).length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🎯 Verified Certified Candidates:</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Name</th><th>Trade</th><th>NSQF</th><th>Location</th><th>Availability</th></tr></thead>
                      <tbody>
                        {(result.matched_candidates as Record<string, unknown>[]).map((c, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600, fontSize: 12 }}>{String(c.name || '')}</td>
                            <td style={{ fontSize: 11 }}>{String(c.trade || '')}</td>
                            <td style={{ textAlign: 'center' }}>L{String(c.nsqf_level || '')}</td>
                            <td style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(c.district || '')}</td>
                            <td><span className="badge badge-green" style={{ fontSize: 10 }}>{String(c.availability || 'Immediate')}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {Boolean(result.whatsapp_response_message) && (
                <div style={{
                  background: 'rgba(37,211,102,0.07)',
                  border: '1px solid rgba(37,211,102,0.25)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  fontSize: 13,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#25D366', marginBottom: 4 }}>📱 WhatsApp Response (auto-sent):</div>
                  {String(result.whatsapp_response_message || '')}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
            <div className="empty-state">
              <MessageSquare size={48} style={{ color: '#25D366' }} />
              <p>Submit a contractor gig signal to see AI extraction & candidate matching results.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
