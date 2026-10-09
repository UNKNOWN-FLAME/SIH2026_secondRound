import { useEffect, useState } from 'react';
import { legoApi, taxonomyApi } from '../api/client';
import { Package, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LegoPage() {
  const [recommendations, setRecommendations] = useState<Record<string, unknown> | null>(null);
  const [districts, setDistricts] = useState<Record<string, unknown>[]>([]);
  const [sectors, setSectors] = useState<Record<string, unknown>[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('MH_PUNE');
  const [selectedSector, setSelectedSector] = useState('GREEN_ENERGY');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([taxonomyApi.getDistricts(), taxonomyApi.getSectors()])
      .then(([d, s]) => { setDistricts(d.data); setSectors(s.data); });
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await legoApi.getPivotRecommendation({
        district_code: selectedDistrict,
        sector_code: selectedSector,
      });
      setRecommendations(res.data);
    } catch { toast.error('Failed to load micro-credential recommendations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRecommendations(); }, []);

  const modules = (recommendations?.recommended_micro_credentials as Record<string, unknown>[]) || [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lego-Block Micro-Credential Pivots</h1>
          <p className="page-subtitle">
            Ground Innovation 3 — Stacks 30-45 hour modular NSQF micro-credentials on existing ITI infrastructure when oversupply is detected, reusing 85%+ of center assets
          </p>
        </div>
        <span className="badge badge-purple">🧩 Micro-Credentials</span>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">District</label>
            <select className="select" value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}>
              {districts.map((d: Record<string, unknown>, i) => (
                <option key={i} value={String(d.code)}>{String(d.name)}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">Sector</label>
            <select className="select" value={selectedSector} onChange={e => setSelectedSector(e.target.value)}>
              {sectors.map((s: Record<string, unknown>, i) => (
                <option key={i} value={String(s.code)}>{String(s.name)}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={fetchRecommendations} disabled={loading}>
            {loading ? <div className="spinner" style={{ width: 15, height: 15 }} /> : <Package size={15} />}
            {loading ? 'Generating...' : 'Get Recommendations'}
          </button>
        </div>
      </div>

      {recommendations && (
        <>
          <div className="grid-4">
            <div className="stat-card purple" style={{ '--before-color': 'var(--color-primary)' } as React.CSSProperties}>
              <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Center Reuse</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#a78bfa' }}>{Number(recommendations.center_reuse_pct || 85)}%</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Infrastructure Reused</div>
            </div>
            <div className="stat-card green">
              <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Modules Available</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-success)' }}>{modules.length}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Micro-Credential Modules</div>
            </div>
            <div className="stat-card blue">
              <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Avg. Duration</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-primary)' }}>
                {Number(recommendations.avg_module_hours) || 40}h
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Per Module</div>
            </div>
            <div className="stat-card orange">
              <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Surplus Workers Targeted</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-orange)' }}>
                {Number(recommendations.surplus_workers_targeted || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>Re-Skilled via Lego Pivots</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {modules.map((m: Record<string, unknown>, i: number) => (
              <div key={i} className="card" style={{ borderLeft: '4px solid #a78bfa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>{String(m.module_name || m.credential_name || '')}</span>
                      <span className="badge badge-purple">Micro-Credential</span>
                      <span className="badge badge-blue">NSQF L{String(m.nsqf_level || '')}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-dim)' }}>{String(m.target_trade || m.trade_title || '')}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                      <span className="badge badge-green">Duration: {String(m.duration_hours || m.hours || '')}h</span>
                      <span className="badge badge-orange">Reuse: {Number(m.infrastructure_reuse_pct || 85)}%</span>
                      <span className="badge badge-cyan">Demand: {Number(m.local_demand_signal || 0).toLocaleString()} openings</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#a78bfa' }}>{Number(m.beneficiaries || m.targeted_trainees || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Trainees Targeted</div>
                  </div>
                </div>

                {Boolean(m.delivery_mode) && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Delivery:</span>
                    <span className="badge badge-cyan" style={{ fontSize: 10 }}>{String(m.delivery_mode || '')}</span>
                    {Boolean(m.lab_required) && <span className="badge badge-yellow" style={{ fontSize: 10 }}>Lab Required</span>}
                    {Boolean(m.assessment_type) && <span className="badge badge-blue" style={{ fontSize: 10 }}>{String(m.assessment_type || '')}</span>}
                  </div>
                )}

                {Boolean(m.skills_acquired) && (
                  <div style={{ marginTop: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Skills Acquired: </span>
                    {(m.skills_acquired as string[]).map((s: string, si: number) => (
                      <span key={si} className="badge badge-green" style={{ fontSize: 10, marginLeft: 4 }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {recommendations.implementation_note && (
            <div className="alert alert-blue">
              <Layers size={16} style={{ flexShrink: 0 }} />
              <div><strong>Implementation Note:</strong><br />{String(recommendations.implementation_note || '')}</div>
            </div>
          )}
        </>
      )}

      {!recommendations && !loading && (
        <div className="empty-state"><Package size={48} /><p>Click "Get Recommendations" to see Lego-block micro-credential pivots.</p></div>
      )}
    </div>
  );
}
