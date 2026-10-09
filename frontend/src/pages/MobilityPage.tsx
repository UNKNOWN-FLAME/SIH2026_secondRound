import { useEffect, useState } from 'react';
import { mobilityApi, taxonomyApi } from '../api/client';
import { Map, ArrowRight, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MobilityPage() {
  const [corridors, setCorridors] = useState<Record<string, unknown>[]>([]);
  const [districts, setDistricts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [simLoading, setSimLoading] = useState(false);
  const [simResult, setSimResult] = useState<Record<string, unknown> | null>(null);
  const [tab, setTab] = useState<'corridors' | 'simulate'>('corridors');

  // Simulation fields
  const [originDistrict, setOriginDistrict] = useState('UP_KANPUR');
  const [destDistrict, setDestDistrict] = useState('MH_PUNE');
  const [vouchers, setVouchers] = useState(300);
  const [monthlyVoucherAmt, setMonthlyVoucherAmt] = useState(3000);
  const [durationMonths, setDurationMonths] = useState(3);
  const [minGravityScore, setMinGravityScore] = useState(10);

  useEffect(() => {
    Promise.all([
      mobilityApi.getCorridors(minGravityScore),
      taxonomyApi.getDistricts(),
    ]).then(([c, d]) => {
      setCorridors(c.data);
      setDistricts(d.data);
    }).catch(() => toast.error('Failed to load mobility data'))
      .finally(() => setLoading(false));
  }, []);

  const refreshCorridors = async () => {
    setLoading(true);
    try {
      const res = await mobilityApi.getCorridors(minGravityScore);
      setCorridors(res.data);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const runSimulation = async () => {
    setSimLoading(true);
    try {
      const res = await mobilityApi.simulateRelocation({
        origin_district_code: originDistrict,
        destination_district_code: destDistrict,
        vouchers_to_issue: vouchers,
        monthly_voucher_amount_inr: monthlyVoucherAmt,
        voucher_duration_months: durationMonths,
      });
      setSimResult(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || 'Simulation failed');
    } finally {
      setSimLoading(false);
    }
  };

  const gravityColor = (score: number) => {
    if (score >= 60) return 'var(--color-success)';
    if (score >= 30) return 'var(--color-warning)';
    return 'var(--color-text-dim)';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Inter-District Spatial Labour Mobility & Gravity Corridors</h1>
          <p className="page-subtitle">
            Winning Feature 2 — Spatial gravity modeling to discover talent flow corridors & simulate MSDE Relocation Voucher ROI
          </p>
        </div>
        <span className="badge badge-orange">🏆 Winning Feature</span>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'corridors' ? 'active' : ''}`} onClick={() => setTab('corridors')}>Mobility Corridors</button>
        <button className={`tab ${tab === 'simulate' ? 'active' : ''}`} onClick={() => setTab('simulate')}>Relocation Voucher Simulation</button>
      </div>

      {tab === 'corridors' && (
        <>
          <div className="card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <label className="form-label" style={{ margin: 0 }}>Min Gravity Score:</label>
              <input className="input" type="number" style={{ width: 100 }} min={0} max={100}
                value={minGravityScore} onChange={e => setMinGravityScore(Number(e.target.value))} />
              <button className="btn btn-primary btn-sm" onClick={refreshCorridors}>Apply</button>
              <span style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{corridors.length} corridors identified</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-overlay"><div className="spinner" /><p>Computing gravity corridors...</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {corridors.map((corridor: Record<string, unknown>, i: number) => {
                const orig = corridor.origin_district as Record<string, unknown> || {};
                const dest = corridor.destination_district as Record<string, unknown> || {};
                const trade = corridor.trade as Record<string, unknown> || {};
                const gravityScore = Number(corridor.gravity_mobility_score || 0);
                const wageDiff = Number(dest.median_wage_inr || 0) - Number(orig.median_wage_inr || 0);
                return (
                  <div key={i} className="card" style={{ borderLeft: `4px solid ${gravityColor(gravityScore)}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>{String(orig.name || orig.code || '')}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(orig.state_code || '')}</div>
                          <span className="badge badge-yellow" style={{ marginTop: 4 }}>
                            Surplus: {Number(orig.surplus_headcount || 0).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <ArrowRight size={24} style={{ color: 'var(--color-text-dim)' }} />
                          <span className="badge badge-blue">{String(trade.title || trade.nco_code || '')}</span>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 16, fontWeight: 700 }}>{String(dest.name || dest.code || '')}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(dest.state_code || '')}</div>
                          <span className="badge badge-red" style={{ marginTop: 4 }}>
                            Deficit: {Number(dest.deficit_headcount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 26, fontWeight: 700, color: gravityColor(gravityScore) }}>{gravityScore.toFixed(1)}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Gravity Score</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-success)' }}>+₹{wageDiff.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Wage Draw/mo</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>{Number(corridor.recommended_vouchers || 0)}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Vouchers Rec.</div>
                        </div>
                      </div>
                    </div>

                    {Boolean(corridor.policy_recommendation) && (
                      <div className="alert alert-blue" style={{ marginTop: 12, fontSize: 12 }}>
                        <Map size={13} style={{ flexShrink: 0 }} />
                        <span>{String(corridor.policy_recommendation || '')}</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {corridors.length === 0 && (
                <div className="empty-state"><Map size={48} /><p>No corridors above the minimum gravity score threshold.</p></div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'simulate' && (
        <>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} /> MSDE Relocation Voucher Policy Simulation
            </div>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Origin District (Surplus Feeder)</label>
                <select className="select" value={originDistrict} onChange={e => setOriginDistrict(e.target.value)}>
                  {districts.map((d: Record<string, unknown>, i) => (
                    <option key={i} value={String(d.code)}>{String(d.name)} ({String(d.code)})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Destination District (Industrial Hub)</label>
                <select className="select" value={destDistrict} onChange={e => setDestDistrict(e.target.value)}>
                  {districts.map((d: Record<string, unknown>, i) => (
                    <option key={i} value={String(d.code)}>{String(d.name)} ({String(d.code)})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vouchers to Issue</label>
                <input className="input" type="number" min={10} value={vouchers}
                  onChange={e => setVouchers(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Voucher Amount (₹)</label>
                <input className="input" type="number" min={1000} step={500} value={monthlyVoucherAmt}
                  onChange={e => setMonthlyVoucherAmt(Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Voucher Duration (Months)</label>
                <input className="input" type="number" min={1} max={12} value={durationMonths}
                  onChange={e => setDurationMonths(Number(e.target.value))} />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-primary" onClick={runSimulation} disabled={simLoading}>
                {simLoading ? <div className="spinner" style={{ width: 15, height: 15 }} /> : <TrendingUp size={15} />}
                {simLoading ? 'Simulating...' : 'Simulate Relocation Policy'}
              </button>
            </div>
          </div>

          {simResult && (
            <>
              <div className="grid-4">
                <div className="stat-card green">
                  <div className="stat-value" style={{ color: 'var(--color-success)', fontSize: 20 }}>
                    ₹{Number(simResult.total_voucher_cost_cr || 0).toFixed(2)} Cr
                  </div>
                  <div className="stat-label">Total Voucher Cost</div>
                </div>
                <div className="stat-card blue">
                  <div className="stat-value" style={{ color: 'var(--color-primary)', fontSize: 20 }}>
                    ₹{Number(simResult.estimated_capex_savings_cr || 0).toFixed(0)} Cr
                  </div>
                  <div className="stat-label">vs New ITI Capex Savings</div>
                </div>
                <div className="stat-card orange">
                  <div className="stat-value" style={{ color: 'var(--color-orange)', fontSize: 20 }}>
                    {Number(simResult.shortage_mitigation_pct || 0).toFixed(1)}%
                  </div>
                  <div className="stat-label">Shortage Mitigation</div>
                </div>
                <div className="stat-card cyan">
                  <div className="stat-value" style={{ color: 'var(--color-secondary)', fontSize: 20 }}>
                    {Number(simResult.fiscal_roi_multiplier || 0).toFixed(2)}x
                  </div>
                  <div className="stat-label">Fiscal ROI Multiplier</div>
                </div>
              </div>

              {simResult.executive_summary && (
                <div className="alert alert-green">
                  <TrendingUp size={16} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Policy Impact Summary:</strong><br />
                    {String(simResult.executive_summary || '')}
                  </div>
                </div>
              )}
            </>
          )}

          {!simResult && !simLoading && (
            <div className="empty-state"><TrendingUp size={48} /><p>Configure and run the relocation voucher simulation to see ROI analysis.</p></div>
          )}
        </>
      )}
    </div>
  );
}
