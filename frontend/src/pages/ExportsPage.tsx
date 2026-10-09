import { useState } from 'react';
import { exportsApi } from '../api/client';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ExportsPage() {
  const [policyBrief, setPolicyBrief] = useState<Record<string, unknown> | null>(null);
  const [loadingCsv, setLoadingCsv] = useState(false);
  const [loadingBrief, setLoadingBrief] = useState(false);

  // CSV params
  const [targetCycle, setTargetCycle] = useState('2026-27');
  const [maxVariation, setMaxVariation] = useState(20);
  const [stateCode, setStateCode] = useState('');
  const [period, setPeriod] = useState('2026-03');

  const downloadCsv = async () => {
    setLoadingCsv(true);
    try {
      const res = await exportsApi.getSanctionPlanCsv({
        target_cycle: targetCycle,
        max_seat_variation_pct: maxVariation,
        state_code: stateCode || undefined,
      });
      const url = window.URL.createObjectURL(new Blob([res.data as BlobPart]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `MSDE_Sanction_Plan_${targetCycle}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Sanction Plan CSV downloaded!');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || 'CSV export failed. Ensure admin role.');
    } finally {
      setLoadingCsv(false);
    }
  };

  const fetchBrief = async () => {
    setLoadingBrief(true);
    try {
      const res = await exportsApi.getExecutivePolicyBrief(period);
      setPolicyBrief(res.data);
      toast.success('Policy brief generated!');
    } catch { toast.error('Brief generation failed'); }
    finally { setLoadingBrief(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exports & Policy Reports</h1>
          <p className="page-subtitle">Download official MSDE Annual Training Sanction Sheet (CSV) and Executive Policy Intelligence Brief</p>
        </div>
      </div>

      <div className="grid-2">
        {/* CSV Export */}
        <div className="card" style={{ borderTop: '3px solid var(--color-success)' }}>
          <div className="card-header">
            <div className="card-title"><FileSpreadsheet size={16} style={{ color: 'var(--color-success)' }} /> Annual Training Sanction Plan (CSV)</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 20 }}>
            Official MSDE Annual Training Target Sanction Sheet — plug-and-play input for scheme planning and target-setting workflows.
            <br /><br />
            <span className="badge badge-orange">⚠️ Requires MSDE_ADMIN role (login as admin)</span>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Target Training Cycle</label>
              <input className="input" value={targetCycle} onChange={e => setTargetCycle(e.target.value)} placeholder="e.g. 2026-27" />
            </div>
            <div className="form-group">
              <label className="form-label">Max Seat Variation (±%)</label>
              <input className="input" type="number" min={5} max={50} value={maxVariation}
                onChange={e => setMaxVariation(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">State Filter (optional)</label>
              <input className="input" value={stateCode} onChange={e => setStateCode(e.target.value)} placeholder="e.g. MH, UP, GJ (leave blank for all)" />
            </div>

            <button className="btn btn-success btn-lg" onClick={downloadCsv} disabled={loadingCsv}
              style={{ background: 'var(--color-success)', color: 'white', justifyContent: 'center' }}>
              {loadingCsv ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <Download size={18} />}
              {loadingCsv ? 'Generating...' : 'Download Sanction Plan CSV'}
            </button>
          </div>

          <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--color-surface-2)', borderRadius: 8, fontSize: 12, color: 'var(--color-text-dim)' }}>
            <strong>Columns included:</strong> District Code, Trade Title, Current Seats, Recommended Seats, Delta %, Projected Demand, Residual Gap, Policy Action, Estimated Cost (₹L), Rationale
          </div>
        </div>

        {/* Executive Policy Brief */}
        <div className="card" style={{ borderTop: '3px solid var(--color-primary)' }}>
          <div className="card-header">
            <div className="card-title"><FileText size={16} style={{ color: 'var(--color-primary)' }} /> Executive Labour Market Intelligence Brief</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 20 }}>
            Structured Intelligence Brief for apex leadership — MSDE Secretary, NCVET Chairman, and SSC CEOs.
            Includes macro summary, critical intervention list, and saturation advisories.
          </p>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Reporting Period</label>
            <input className="input" value={period} onChange={e => setPeriod(e.target.value)} placeholder="YYYY-MM (e.g. 2026-03)" />
          </div>

          <button className="btn btn-primary btn-lg" onClick={fetchBrief} disabled={loadingBrief}
            style={{ justifyContent: 'center', width: '100%' }}>
            {loadingBrief ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <FileText size={18} />}
            {loadingBrief ? 'Generating...' : 'Generate Executive Brief'}
          </button>
        </div>
      </div>

      {policyBrief && (
        <div className="card">
          <div className="card-header">
            <div className="card-title"><FileText size={16} style={{ color: 'var(--color-primary)' }} /> {String(policyBrief.title || '')}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge badge-blue">{String(policyBrief.ministry || '')}</span>
              <span className="badge badge-green">Period: {String(policyBrief.reporting_period || '')}</span>
            </div>
          </div>

          {/* Executive Summary */}
          {Boolean(policyBrief.executive_summary) && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>📊 Executive Summary</div>
              <div className="grid-4">
                {Object.entries(policyBrief.executive_summary as Record<string, unknown>).map(([k, v], i) => (
                  <div key={i} style={{
                    background: 'var(--color-surface-2)',
                    borderRadius: 10,
                    padding: '14px 16px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>{String(v)}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-dim)', marginTop: 4 }}>
                      {k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critical Interventions */}
          {(policyBrief.critical_interventions_required as unknown[] || []).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--color-danger)' }}>🚨 Critical Interventions Required</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Priority</th><th>District</th><th>Trade</th><th>Deficit</th><th>Multiplier</th><th>Recommended Action</th></tr></thead>
                  <tbody>
                    {(policyBrief.critical_interventions_required as Record<string, unknown>[]).map((c, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: 'var(--color-danger)' }}>#{Number(c.priority)}</td>
                        <td style={{ fontSize: 12 }}>{String(c.district || '')}</td>
                        <td style={{ fontSize: 12, fontWeight: 600 }}>{String(c.trade || '')}</td>
                        <td><span className="badge badge-red">{Number(c.deficit || 0).toLocaleString()}</span></td>
                        <td style={{ fontWeight: 700 }}>{String(c.mismatch_multiplier || '')}</td>
                        <td style={{ fontSize: 11, color: 'var(--color-text-dim)', maxWidth: 200 }}>{String(c.recommended_action || '').slice(0, 80)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Saturation Advisories */}
          {(policyBrief.saturation_and_reskilling_advisories as unknown[] || []).length > 0 && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--color-warning)' }}>⚠️ Saturation & Reskilling Advisories</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Priority</th><th>District</th><th>Trade</th><th>Surplus</th><th>Multiplier</th><th>Advisory</th></tr></thead>
                  <tbody>
                    {(policyBrief.saturation_and_reskilling_advisories as Record<string, unknown>[]).map((a, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: 'var(--color-warning)' }}>#{Number(a.priority)}</td>
                        <td style={{ fontSize: 12 }}>{String(a.district || '')}</td>
                        <td style={{ fontSize: 12, fontWeight: 600 }}>{String(a.trade || '')}</td>
                        <td><span className="badge badge-yellow">{Number(a.surplus || 0).toLocaleString()}</span></td>
                        <td style={{ fontWeight: 700 }}>{String(a.mismatch_multiplier || '')}</td>
                        <td style={{ fontSize: 11, color: 'var(--color-text-dim)', maxWidth: 200 }}>{String(a.recommended_action || '').slice(0, 80)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
