import { useEffect, useState } from 'react';
import { migrationApi } from '../api/client';
import { Train, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MigrationPage() {
  const [flows, setFlows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    migrationApi.getRailwayTransitFlows()
      .then(res => setFlows(res.data))
      .catch(() => toast.error('Failed to load migration heatmap data'))
      .finally(() => setLoading(false));
  }, []);

  const alertColor = (magnitude: string) => {
    if (magnitude === 'High' || magnitude === 'CRITICAL') return 'badge-red';
    if (magnitude === 'Medium' || magnitude === 'WARNING') return 'badge-orange';
    return 'badge-yellow';
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Migration-Reversal Heatmaps (IRCTC + e-Shram)</h1>
          <p className="page-subtitle">
            Ground Innovation 5 — Cross-references e-Shram profiles with anonymized IRCTC unreserved passenger data to detect real-time workforce departures
          </p>
        </div>
        <span className="badge badge-blue">🚂 IRCTC + e-Shram</span>
      </div>

      {loading ? (
        <div className="loading-overlay"><div className="spinner" /><p>Fetching migration transit flows...</p></div>
      ) : (
        <>
          <div className="grid-4">
            <div className="stat-card red">
              <div className="stat-value" style={{ color: 'var(--color-danger)', fontSize: 22 }}>
                {flows.filter((f: Record<string, unknown>) => f.alert_magnitude === 'High' || f.alert_magnitude === 'CRITICAL').length}
              </div>
              <div className="stat-label">Critical Exodus Events</div>
            </div>
            <div className="stat-card orange">
              <div className="stat-value" style={{ color: 'var(--color-orange)', fontSize: 22 }}>
                {flows.reduce((s: number, f: Record<string, unknown>) => s + Number(f.estimated_migrant_count || 0), 0).toLocaleString('en-IN')}
              </div>
              <div className="stat-label">Total Workers Departing</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-value" style={{ color: 'var(--color-primary)', fontSize: 22 }}>{flows.length}</div>
              <div className="stat-label">Active Migration Corridors</div>
            </div>
            <div className="stat-card yellow">
              <div className="stat-value" style={{ color: 'var(--color-warning)', fontSize: 22 }}>
                {[...new Set(flows.map((f: Record<string, unknown>) => String(f.origin_state || f.source_hub || '')))].length}
              </div>
              <div className="stat-label">Source States Affected</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>
              <Train size={16} style={{ color: 'var(--color-primary)' }} /> Real-Time Railway Transit Flow Events
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {flows.map((f: Record<string, unknown>, i: number) => (
                <div key={i} style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{String(f.origin_hub || f.source_hub || '')}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(f.origin_state || '')}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Train size={18} style={{ color: 'var(--color-text-dim)' }} />
                      <ArrowRight size={16} style={{ color: 'var(--color-text-dim)' }} />
                      <span style={{ fontSize: 10, color: 'var(--color-text-dim)' }}>{String(f.train_number || f.route_code || '')}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{String(f.destination_hub || f.dest_hub || '')}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(f.destination_state || f.dest_state || '')}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-danger)' }}>{Number(f.estimated_migrant_count || 0).toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Workers Departing</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{String(f.primary_trade_departing || f.trade || '')}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>Primary Trade</div>
                    </div>
                    <div>
                      <span className={`badge ${alertColor(String(f.alert_magnitude || ''))}`}>
                        {String(f.alert_magnitude || '')} Alert
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(f.detected_at || f.period || '')}</div>
                  </div>
                </div>
              ))}
              {flows.length === 0 && (
                <div className="empty-state"><Train size={48} /><p>No migration transit events detected.</p></div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
