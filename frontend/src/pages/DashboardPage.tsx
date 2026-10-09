import { useEffect, useState } from 'react';
import { demandApi, supplyApi, mismatchApi } from '../api/client';
import {
  AlertTriangle, TrendingUp, Building2, Activity, Users, Zap, BarChart3, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const SECTOR_COLORS: Record<string, string> = {
  GREEN_ENERGY: '#10b981',
  ESDM: '#4f8ef7',
  HEALTHCARE: '#f97316',
  IT_ITES: '#a78bfa',
};

const SEVERITY_COLORS: Record<string, string> = {
  ACUTE_SHORTAGE: '#ef4444',
  MODERATE_SHORTAGE: '#f97316',
  BALANCED: '#10b981',
  MILD_SURPLUS: '#f59e0b',
  CHRONIC_SATURATION: '#a78bfa',
};

export default function DashboardPage() {
  const [demandSummary, setDemandSummary] = useState<Record<string, unknown> | null>(null);
  const [supplySummary, setSupplySummary] = useState<Record<string, unknown> | null>(null);
  const [mismatch, setMismatch] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      demandApi.getSummary(),
      supplyApi.getSummary(),
      mismatchApi.getDashboard(),
    ]).then(([d, s, m]) => {
      setDemandSummary(d.data);
      setSupplySummary(s.data);
      setMismatch(m.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" style={{ width: 40, height: 40 }} />
        <p>Loading LMIS Intelligence Dashboard...</p>
      </div>
    );
  }

  const warnings = (mismatch?.active_early_warnings as unknown[]) || [];
  const topShortages = (mismatch?.top_undersupplied_trades as unknown[]) || [];
  const topSurpluses = (mismatch?.top_oversupplied_trades as unknown[]) || [];
  const heatmap = (mismatch?.geographic_heatmap as unknown[]) || [];

  // Build CDI chart data
  const cdiChartData = (demandSummary?.top_demanded_trades as Record<string, unknown>[] | undefined)?.map((t: Record<string, unknown>) => ({
    name: String(t.trade_title || '').split(' ').slice(0, 3).join(' '),
    cdi: Number(t.cdi_score || 0),
    demand: Number(t.projected_headcount_demand || 0),
    sector: String(t.sector_code || ''),
  })) || [];

  // Mismatch severity pie
  const severityData = [
    { name: 'Acute Shortage', value: warnings.filter((w: unknown) => (w as Record<string, unknown>).severity === 'RED').length, color: '#ef4444' },
    { name: 'Moderate', value: warnings.filter((w: unknown) => (w as Record<string, unknown>).severity === 'ORANGE').length, color: '#f97316' },
    { name: 'Balanced', value: Math.max(0, 20 - warnings.length), color: '#10b981' },
  ];

  return (
    <div className="page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Labour Market Intelligence Dashboard</h1>
          <p className="page-subtitle">
            AI-Driven Skill Demand-Supply Forecasting Engine | Period: March 2026 | 4 Pilot Sectors
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-green">● Live Data</span>
          <span className="badge badge-blue">MSDE | NCVET</span>
        </div>
      </div>

      {/* Alert Banner */}
      {warnings.length > 0 && (
        <div className="alert alert-red">
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <div>
            <strong>{warnings.length} Active Early Warnings</strong> — Critical skill mismatches detected across districts.{' '}
            <Link to="/mismatch" style={{ color: '#f87171', textDecoration: 'underline' }}>View full mismatch dashboard →</Link>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid-4">
        <div className="stat-card blue">
          <div className="stat-icon blue"><TrendingUp size={20} /></div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {Number(demandSummary?.total_active_postings || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Active Job Postings (NCO-coded)</div>
          <div className="stat-change up"><ArrowUp size={10} /> Lead Indicator Active</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><Building2 size={20} /></div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {Number(supplySummary?.total_training_centers || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Accredited Training Centers (ITI/PMKK)</div>
          <div className="stat-change up"><ArrowUp size={10} /> Capacity Tracked</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange"><Users size={20} /></div>
          <div className="stat-value" style={{ color: 'var(--color-orange)' }}>
            {Number(demandSummary?.total_projected_direct_jobs || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Projected Direct Jobs (Capex/PLI)</div>
          <div className="stat-change up"><ArrowUp size={10} /> Lead Indicator</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red"><AlertTriangle size={20} /></div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>
            {Number(mismatch?.total_shortage_headcount || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Total Shortage Headcount (Unfilled)</div>
          <div className="stat-change down"><ArrowDown size={10} /> Action Required</div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid-4">
        <div className="stat-card cyan">
          <div className="stat-icon cyan"><BarChart3 size={20} /></div>
          <div className="stat-value" style={{ color: 'var(--color-secondary)', fontSize: 24 }}>
            {Number(demandSummary?.average_cdi || 0).toFixed(1)}
          </div>
          <div className="stat-label">Avg. Composite Demand Index (CDI)</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><Activity size={20} /></div>
          <div className="stat-value" style={{ color: 'var(--color-success)', fontSize: 24 }}>
            {Number(supplySummary?.total_certified_passouts || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Certified Passouts (Annual)</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon blue"><Zap size={20} /></div>
          <div className="stat-value" style={{ color: 'var(--color-primary)', fontSize: 24 }}>
            {Number(mismatch?.overall_system_balance_pct || 0).toFixed(1)}%
          </div>
          <div className="stat-label">System Balance Score</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon yellow"><AlertTriangle size={20} /></div>
          <div className="stat-value" style={{ color: 'var(--color-warning)', fontSize: 24 }}>
            {Number(mismatch?.total_surplus_headcount || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Chronic Surplus / Oversupply</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2">
        {/* Top Demanded Trades */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><TrendingUp size={16} style={{ color: 'var(--color-primary)' }} /> Top Demanded Trades (CDI Score)</div>
            <Link to="/demand" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cdiChartData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-dim)' }} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--color-text)' }}
              />
              <Bar dataKey="cdi" name="CDI Score" fill="var(--color-primary)" radius={[4, 4, 0, 0]}>
                {cdiChartData.map((entry, idx) => (
                  <Cell key={idx} fill={SECTOR_COLORS[entry.sector] || 'var(--color-primary)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Mismatch Severity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><AlertTriangle size={16} style={{ color: 'var(--color-danger)' }} /> Mismatch Severity Distribution</div>
            <Link to="/mismatch" className="btn btn-secondary btn-sm">View Alerts</Link>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {severityData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'var(--color-text-dim)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid-2">
        {/* Top Shortages */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--color-danger)' }}>
              <AlertTriangle size={16} /> Top Skill Shortages
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Trade</th>
                  <th>District</th>
                  <th>Gap</th>
                  <th>Ratio</th>
                </tr>
              </thead>
              <tbody>
                {topShortages.slice(0, 8).map((item: unknown, idx: number) => {
                  const i = item as Record<string, unknown>;
                  return (
                    <tr key={idx}>
                      <td><span style={{ fontSize: 11 }}>{String(i.trade_title || '').slice(0, 30)}</span></td>
                      <td><span style={{ fontSize: 11, color: 'var(--color-text-dim)' }}>{String(i.district_name || '')}</span></td>
                      <td><span className="badge badge-red">{Number(i.gap_headcount || 0).toLocaleString()}</span></td>
                      <td><span style={{ color: SEVERITY_COLORS[String(i.severity_flag || '')] || 'var(--color-text)' }}>{Number(i.mismatch_ratio || 0).toFixed(2)}x</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Warnings */}
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ color: 'var(--color-orange)' }}>
              <AlertTriangle size={16} /> Early Warning Alerts
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {warnings.slice(0, 6).map((w: unknown, idx: number) => {
              const warn = w as Record<string, unknown>;
              const isRed = warn.severity === 'RED';
              return (
                <div key={idx} className={`alert ${isRed ? 'alert-red' : 'alert-orange'}`} style={{ fontSize: 12 }}>
                  <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>{String(warn.trade_title || '')}</strong> — {String(warn.district_name || '')}
                    <div style={{ marginTop: 2, opacity: 0.8 }}>{String(warn.alert_summary || '').slice(0, 100)}</div>
                  </div>
                </div>
              );
            })}
            {warnings.length === 0 && <div className="empty-state"><p>No active warnings</p></div>}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">⚡ Quick Actions & Module Navigation</div>
        </div>
        <div className="grid-4" style={{ gap: 12 }}>
          {[
            { to: '/simulation', label: 'Run What-If Policy Simulation', color: 'var(--color-primary)', emoji: '🎮' },
            { to: '/curriculum', label: 'Audit NCVET Curriculum Obsolescence', color: 'var(--color-orange)', emoji: '📚' },
            { to: '/mobility', label: 'View Labour Mobility Corridors', color: 'var(--color-success)', emoji: '🗺️' },
            { to: '/obsolescence', label: 'AI Automation Risk Matrix', color: 'var(--color-danger)', emoji: '🤖' },
            { to: '/csr', label: 'CSR Co-Investment Matchmaker', color: 'var(--color-warning)', emoji: '🤝' },
            { to: '/gati-shakti', label: 'PM Gati-Shakti Corridors', color: 'var(--color-secondary)', emoji: '🚂' },
            { to: '/exports', label: 'Download Sanction Plan CSV', color: '#a78bfa', emoji: '📊' },
            { to: '/skills', label: 'Bridge Course Recommender', color: '#f472b6', emoji: '🌉' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                background: 'var(--color-surface-2)',
                border: `1px solid ${item.color}30`,
                borderRadius: 10,
                padding: '14px 16px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.15s',
                color: 'var(--color-text)',
                fontSize: 13,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = `${item.color}10`)}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-surface-2)')}
            >
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
