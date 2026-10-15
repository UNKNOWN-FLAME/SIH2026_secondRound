/**
 * Data & Truth Hub — Route: /data-hub
 * Placeholder — to be implemented in Phase 2.
 * Displays summary of connected data sources and API status.
 */
import { Database, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const DATA_SOURCES = [
  { name: 'Demand Signals API', endpoint: '/api/v1/demand/signals', status: 'connected' },
  { name: 'Supply Centers API', endpoint: '/api/v1/supply/centers', status: 'connected' },
  { name: 'Mismatch Engine', endpoint: '/api/v1/mismatch/dashboard', status: 'connected' },
  { name: 'NCO Taxonomy', endpoint: '/api/v1/taxonomy/occupations', status: 'connected' },
  { name: 'Forecasting ML Models', endpoint: '/api/v1/forecasting/trajectory', status: 'pending' },
  { name: 'PM Gati-Shakti GIS', endpoint: '/api/v1/gati-shakti/corridors', status: 'pending' },
  { name: 'Blockchain Audit Ledger', endpoint: 'Internal service', status: 'pending' },
  { name: 'India GeoJSON Boundaries', endpoint: '/geo/india-states.geojson', status: 'required' },
];

const statusIcon = (s: string) => {
  if (s === 'connected') return <CheckCircle size={14} style={{ color: '#10b981' }} />;
  if (s === 'pending') return <Clock size={14} style={{ color: '#f59e0b' }} />;
  return <AlertCircle size={14} style={{ color: '#ef4444' }} />;
};
const statusColor = (s: string) => s === 'connected' ? '#10b981' : s === 'pending' ? '#f59e0b' : '#ef4444';

export default function DataHubPage() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={20} style={{ color: '#4f8ef7' }} /> Data & Truth Hub
          </h1>
          <p className="page-subtitle">Connected data sources and system integrity verification</p>
        </div>
        <span className="badge badge-blue">Phase 2 — Partial</span>
      </div>

      <div className="alert alert-blue" style={{ fontSize: 12 }}>
        <AlertCircle size={14} />
        Full Data Hub UI is scheduled for Phase 2. The API integration layer, ML model connections, and data lineage graph will be displayed here.
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><Database size={15} style={{ color: '#4f8ef7' }} /> Data Source Registry</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data Source</th>
                <th>Endpoint / Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DATA_SOURCES.map(src => (
                <tr key={src.name}>
                  <td style={{ fontWeight: 500 }}>{src.name}</td>
                  <td><code style={{ fontSize: 11, color: '#94a3b8' }}>{src.endpoint}</code></td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: statusColor(src.status), fontSize: 12 }}>
                      {statusIcon(src.status)}
                      {src.status.charAt(0).toUpperCase() + src.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
