/**
 * District Diagnostic Modal
 * Opened from map clicks on critical regions or "Inspect" on alert cards.
 * All illustrative values (Tata Motors capex, ITI Aundh supply) are demo data per PDF Section 2.
 */
import { useEffect, useCallback } from 'react';
import { useLMIS } from '../context/LMISContext';
import { DEMO_ALERTS, SEVERITY_META } from '../mock/demoData';
import { X, MapPin, TrendingUp, Building2, AlertTriangle, Info } from 'lucide-react';

export default function DiagnosticModal() {
  const { state, closeDiagnostic } = useLMIS();
  const target = state.diagnosticTarget;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeDiagnostic();
  }, [closeDiagnostic]);

  useEffect(() => {
    if (!target) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [target, handleKeyDown]);

  if (!target) return null;

  // Find the best matching alert for this district/trade context
  const alert = DEMO_ALERTS.find(a =>
    a.districtCode === target.districtCode ||
    a.district === target.districtName
  ) ?? DEMO_ALERTS.find(a => a.stateCode === target.stateCode);

  const trade = state.selectedTrade;
  const period = state.selectedPeriod;

  const sevMeta = alert ? SEVERITY_META[alert.severity] : null;
  const netGap = alert ? alert.gap : null;
  const isShortage = netGap !== null && netGap < 0;
  const isSurplus = netGap !== null && netGap > 0;

  // Seat expansion recommendation
  const seatExpansion = alert && isShortage
    ? Math.abs(alert.gap)
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeDiagnostic}
        role="presentation"
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          zIndex: 2000, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`District Diagnostic: ${target.districtName}`}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2001,
          width: '100%', maxWidth: 640,
          background: '#1a1d2e',
          border: '1px solid #2e3350',
          borderRadius: 12,
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2e3350', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={18} style={{ color: '#4f8ef7', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#e2e8f0' }}>{target.districtName}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                {alert?.state ?? target.stateCode} · {trade?.label ?? 'All Trades'} · Period: {period}
              </div>
            </div>
          </div>
          <button
            onClick={closeDiagnostic}
            aria-label="Close diagnostic modal"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, borderRadius: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Demo banner */}
        <div style={{ padding: '8px 20px', background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.2)', fontSize: 11, color: '#f59e0b', display: 'flex', gap: 6, alignItems: 'center' }}>
          <Info size={12} />
          Illustrative demo data per PDF specification — not verified statistics
        </div>

        <div style={{ padding: 20 }}>

          {/* Severity */}
          {sevMeta && (
            <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, background: `${sevMeta.color}12`, border: `1px solid ${sevMeta.color}40`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={16} style={{ color: sevMeta.color, flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 700, color: sevMeta.color, fontSize: 13 }}>{sevMeta.label}</span>
                <span style={{ color: '#94a3b8', fontSize: 12, marginLeft: 8 }}>
                  D/S Ratio: {alert?.ratio.toFixed(2)}×
                </span>
              </div>
            </div>
          )}

          {/* Demand / Supply grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: '#252839', borderRadius: 8, padding: 12, border: '1px solid #2e3350' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <TrendingUp size={13} style={{ color: '#4f8ef7' }} />
                <span style={{ fontSize: 11, color: '#64748b' }}>Projected Demand</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#4f8ef7' }}>
                {alert?.demand?.toLocaleString('en-IN') ?? '—'}
              </div>
            </div>
            <div style={{ background: '#252839', borderRadius: 8, padding: 12, border: '1px solid #2e3350' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Building2 size={13} style={{ color: '#10b981' }} />
                <span style={{ fontSize: 11, color: '#64748b' }}>Training Supply</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>
                {alert?.supply?.toLocaleString('en-IN') ?? '—'}
              </div>
            </div>
            <div style={{ background: '#252839', borderRadius: 8, padding: 12, border: '1px solid #2e3350' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <AlertTriangle size={13} style={{ color: isShortage ? '#ef4444' : isSurplus ? '#a78bfa' : '#64748b' }} />
                <span style={{ fontSize: 11, color: '#64748b' }}>{isShortage ? 'Net Deficit' : 'Net Surplus'}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: isShortage ? '#ef4444' : isSurplus ? '#a78bfa' : '#64748b' }}>
                {netGap !== null ? (netGap > 0 ? `+${netGap.toLocaleString('en-IN')}` : netGap.toLocaleString('en-IN')) : '—'}
              </div>
            </div>
          </div>

          {/* Capex / Industrial Activity */}
          {alert?.capexCr && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>INCOMING CAPEX</div>
              <div style={{ background: '#252839', borderRadius: 8, padding: 12, border: '1px solid #2e3350', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#e2e8f0' }}>{alert.capexSource ?? 'Industrial Project'}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Sector capex trigger</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#22d3ee' }}>₹{alert.capexCr} Cr</div>
              </div>
            </div>
          )}

          {/* ITI / Training Centre Supply Breakdown */}
          {alert?.itiSupply && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>LOCAL TRAINING SUPPLY</div>
              <div style={{ background: '#252839', borderRadius: 8, padding: 12, border: '1px solid #2e3350', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#e2e8f0' }}>{alert.itiName ?? 'Local ITI'}</div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Annual seat capacity (ITI/PMKK)</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{alert.itiSupply} seats</div>
              </div>
            </div>
          )}

          {/* Recommended action */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>RECOMMENDED POLICY ACTION</div>
            <div style={{ background: 'rgba(79,142,247,0.08)', borderRadius: 8, padding: 12, border: '1px solid rgba(79,142,247,0.25)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4f8ef7' }}>{alert?.action ?? 'Assessment Required'}</div>
              {seatExpansion && (
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  Estimated seat expansion required: <strong style={{ color: '#e2e8f0' }}>+{seatExpansion.toLocaleString('en-IN')} seats</strong>
                </div>
              )}
            </div>
          </div>

          {/* Trade context */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>TRADE CONTEXT</div>
            <div style={{ background: '#252839', borderRadius: 8, padding: 12, border: '1px solid #2e3350' }}>
              <div style={{ fontSize: 13, color: '#e2e8f0' }}>
                {alert?.trade ?? trade?.label ?? 'All Trades'}
                <span style={{ marginLeft: 8, fontSize: 11, color: '#64748b' }}>({alert?.tradeCode ?? trade?.code ?? 'N/A'})</span>
              </div>
              {alert?.state && (
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                  {alert.state} · {alert.district}
                </div>
              )}
            </div>
          </div>

          {/* No data state */}
          {!alert && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              <AlertTriangle size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              <p>No detailed diagnostic data available for this district.</p>
              <p style={{ fontSize: 11, marginTop: 4 }}>Connect to the backend to load live district-level data.</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              onClick={closeDiagnostic}
              style={{ padding: '7px 16px', borderRadius: 6, border: '1px solid #2e3350', background: '#252839', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}
            >
              Close
            </button>
            <button
              onClick={() => {
                // Export brief (same logic as action bar)
                const data = {
                  location: `${target.districtName}, ${alert?.state ?? target.stateCode}`,
                  trade: trade?.label ?? alert?.trade ?? 'All Trades',
                  period,
                  demand: alert?.demand ?? 'N/A',
                  supply: alert?.supply ?? 'N/A',
                  gap: netGap ?? 'N/A',
                  severity: sevMeta?.label ?? 'Unknown',
                  action: alert?.action ?? 'Assessment Required',
                  source: 'DEMO DATA — not verified statistics',
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `district-brief-${target.districtName.replace(/\s+/g, '-')}-${period}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: '#4f8ef7', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
            >
              Export Brief
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
