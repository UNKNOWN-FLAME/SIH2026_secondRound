/**
 * LMIS Sovereign Shell — Global Application Layout
 * Implements: fixed header, collapsible sidebar, main viewport.
 * Persistent across all module routes.
 */
import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Database, TrendingUp, FlaskConical, Network,
  Activity, AlertTriangle, Building2, BookOpen, Map, Zap, Heart,
  Train, MessageSquare, Package, Download, LogOut, Menu, X,
  ChevronRight, BarChart3, ShoppingBag, Cpu, Shield,
} from 'lucide-react';
import { useLMIS } from '../context/LMISContext';
import DiagnosticModal from './DiagnosticModal';

// ─── Navigation structure ─────────────────────────────────────────────────────

const primaryNav = [
  { to: '/',          label: 'Command Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/data-hub',  label: 'Data & Truth Hub',   icon: Database },
  { to: '/forecasting', label: 'AI Forecasting',   icon: TrendingUp },
  { to: '/sandbox',   label: 'Policy Sandbox',      icon: FlaskConical },
  { to: '/skill-graph', label: 'Skill Bridge Graph', icon: Network },
];

const secondaryNav = [
  { to: '/demand',     label: 'Labour Demand & CDI', icon: Activity },
  { to: '/supply',     label: 'Training Supply',     icon: Building2 },
  { to: '/mismatch',   label: 'Mismatch Alerts',     icon: AlertTriangle },
  { to: '/skills',     label: 'Skill Graph (Legacy)', icon: Network },
  { to: '/simulation', label: 'What-If Sandbox',     icon: FlaskConical },
  { to: '/curriculum', label: 'NCVET Curriculum',    icon: BookOpen },
  { to: '/mobility',   label: 'Mobility Corridors',  icon: Map },
];

const innovationsNav = [
  { to: '/tenders',       label: 'Forward Tenders (BoQ)', icon: ShoppingBag },
  { to: '/lego',          label: 'Lego Micro-Credentials', icon: Package },
  { to: '/whatsapp',      label: 'WhatsApp Gig Signal',    icon: MessageSquare },
  { to: '/migration',     label: 'Migration Heatmaps',     icon: Train },
  { to: '/gati-shakti',   label: 'PM Gati-Shakti',         icon: Cpu },
  { to: '/obsolescence',  label: 'AI Obsolescence Radar',  icon: Zap },
  { to: '/csr',           label: 'CSR Co-Investment',      icon: Heart },
  { to: '/taxonomy',      label: 'NCO Taxonomy',           icon: BarChart3 },
  { to: '/exports',       label: 'Exports & Reports',      icon: Download },
];

// ─── Role badge colours ───────────────────────────────────────────────────────

const roleBadgeStyle: Record<string, React.CSSProperties> = {
  MSDE_PLANNER: { background: 'rgba(79,142,247,0.15)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.3)' },
  STATE_OFFICER: { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
  ANALYST: { background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' },
  VIEWER: { background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)' },
};

// ─── Shell Layout ─────────────────────────────────────────────────────────────

export default function ShellLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [secondaryOpen, setSecondaryOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useLMIS();

  const handleLogout = () => {
    localStorage.removeItem('lmis_token');
    navigate('/login');
  };

  const jurisdiction = state.selectedJurisdiction;
  const breadcrumb = (() => {
    const parts: string[] = ['All India'];
    if (jurisdiction.stateName) parts.push(jurisdiction.stateName);
    if (jurisdiction.districtName) parts.push(jurisdiction.districtName);
    return parts;
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

      {/* ── Fixed Header ─────────────────────────────────────────────────── */}
      <header style={{
        height: 'var(--header-height)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        flexShrink: 0,
        zIndex: 100,
        position: 'sticky',
        top: 0,
      }}>
        {/* Identity / Sidebar toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', padding: 4, borderRadius: 4, flexShrink: 0 }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* MSDE Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(79,142,247,0.4)',
              flexShrink: 0,
            }}>
              <Shield size={16} style={{ color: '#93c5fd' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>LMIS Sovereign Telemetry</div>
              <div style={{ fontSize: 9, color: 'var(--color-text-muted)', letterSpacing: 0.5 }}>MSDE · PS-26246 · NCVET</div>
            </div>
          </div>
        </div>

        {/* Centre: Breadcrumb */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, minWidth: 0 }}>
          {breadcrumb.map((part, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
              {i > 0 && <ChevronRight size={12} style={{ color: '#2e3350', flexShrink: 0 }} />}
              <span style={{
                fontSize: 12,
                fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                color: i === breadcrumb.length - 1 ? '#e2e8f0' : '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {part}
              </span>
            </span>
          ))}
          {state.selectedTrade && (
            <>
              <span style={{ color: '#2e3350', margin: '0 4px' }}>·</span>
              <span style={{ fontSize: 11, color: '#22d3ee', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {state.selectedTrade.label}
              </span>
            </>
          )}
          {state.selectedPeriod && (
            <>
              <span style={{ color: '#2e3350', margin: '0 4px' }}>·</span>
              <span style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>{state.selectedPeriod}</span>
            </>
          )}
        </div>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* API status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-success)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: 'var(--color-success)' }}>API</span>
          </div>

          {/* Role badge */}
          <div style={{
            ...roleBadgeStyle[state.authClaims.role],
            borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <Shield size={11} />
            {state.authClaims.role.replace('_', ' ')}
          </div>

          {/* User */}
          <div style={{ fontSize: 12, color: 'var(--color-text-dim)', padding: '3px 8px', background: 'var(--color-surface-2)', borderRadius: 6, border: '1px solid var(--color-border)' }}>
            {state.authClaims.username}
          </div>
        </div>
      </header>

      {/* ── Body: Sidebar + Main ──────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Sidebar ────────────────────────────────────────────────────── */}
        <aside style={{
          width: sidebarOpen ? 'var(--sidebar-width)' : '52px',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
          flexShrink: 0,
          zIndex: 10,
        }}>
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 6px' }}>

            {/* Primary navigation — 5 main sections */}
            {sidebarOpen && (
              <div className="nav-section-title">Core Modules</div>
            )}
            {primaryNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={!sidebarOpen ? item.label : undefined}
                aria-label={item.label}
              >
                <item.icon size={16} className="nav-icon" />
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </NavLink>
            ))}

            {/* Expandable secondary nav */}
            {sidebarOpen && (
              <button
                onClick={() => setSecondaryOpen(v => !v)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}
              >
                <span>Intelligence Modules</span>
                <ChevronRight size={12} style={{ transform: secondaryOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
              </button>
            )}
            {secondaryOpen && sidebarOpen && secondaryNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ paddingLeft: 20, fontSize: 12 }}
              >
                <item.icon size={14} className="nav-icon" />
                <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
              </NavLink>
            ))}

            {sidebarOpen && (
              <button
                onClick={() => {}}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 4px', background: 'none', border: 'none', cursor: 'default', color: 'var(--color-text-muted)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}
              >
                <span>Ground Innovations</span>
              </button>
            )}
            {sidebarOpen && innovationsNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ paddingLeft: 20, fontSize: 12 }}
              >
                <item.icon size={14} className="nav-icon" />
                <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Logout */}
          <div style={{ padding: '8px 6px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
            <button
              className="nav-item"
              onClick={handleLogout}
              title={!sidebarOpen ? 'Logout' : undefined}
              aria-label="Logout"
            >
              <LogOut size={16} className="nav-icon" />
              {sidebarOpen && 'Logout'}
            </button>
          </div>
        </aside>

        {/* ── Main viewport ────────────────────────────────────────────────── */}
        <main
          id="main-content"
          style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
          aria-label="Main content"
        >
          <Outlet />
        </main>
      </div>

      {/* ── Diagnostic Modal (global, portal-like) ─────────────────────── */}
      <DiagnosticModal />
    </div>
  );
}
