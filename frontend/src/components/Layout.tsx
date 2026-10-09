import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Building2, Activity, AlertTriangle,
  Network, FlaskConical, BookOpen, Map, Zap, Heart, Lightbulb,
  Train, MessageSquare, Package, Download, LogOut, Menu, X,
  ChevronRight, BarChart3, ShoppingBag, Cpu
} from 'lucide-react';

const navGroups = [
  {
    title: 'Core Intelligence',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/demand', label: 'Labour Demand & CDI', icon: TrendingUp },
      { to: '/supply', label: 'Training Supply', icon: Building2 },
      { to: '/forecasting', label: '12M/24M Forecast', icon: Activity },
      { to: '/mismatch', label: 'Mismatch Alerts', icon: AlertTriangle },
    ]
  },
  {
    title: 'Winning Pillars',
    items: [
      { to: '/skills', label: 'Skill Bridge Graph', icon: Network },
      { to: '/simulation', label: 'What-If Sandbox', icon: FlaskConical },
      { to: '/curriculum', label: 'NCVET Curriculum', icon: BookOpen },
      { to: '/mobility', label: 'Mobility Corridors', icon: Map },
    ]
  },
  {
    title: 'Ground Innovations',
    items: [
      { to: '/tenders', label: 'Forward Tenders (BoQ)', icon: ShoppingBag },
      { to: '/lego', label: 'Lego Micro-Credentials', icon: Package },
      { to: '/whatsapp', label: 'WhatsApp Gig Signal', icon: MessageSquare },
      { to: '/migration', label: 'Migration Heatmaps', icon: Train },
    ]
  },
  {
    title: 'Strategic Innovations',
    items: [
      { to: '/gati-shakti', label: 'PM Gati-Shakti', icon: Cpu },
      { to: '/obsolescence', label: 'AI Obsolescence Radar', icon: Zap },
      { to: '/csr', label: 'CSR Co-Investment', icon: Heart },
    ]
  },
  {
    title: 'Tools & Data',
    items: [
      { to: '/taxonomy', label: 'NCO Taxonomy', icon: BarChart3 },
      { to: '/exports', label: 'Exports & Reports', icon: Download },
    ]
  }
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('lmis_token');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 'var(--sidebar-width)' : '56px',
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 10,
      }}>
        {/* Sidebar Header */}
        <div style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          borderBottom: '1px solid var(--color-border)',
          gap: 10,
          flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', padding: 4, flexShrink: 0 }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>LMIS</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>MSDE | PS-26246</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 6px' }}>
          {navGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: 8 }}>
              {sidebarOpen && (
                <div className="nav-section-title">{group.title}</div>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon size={16} className="nav-icon" />
                  {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '8px 6px', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
          <button className="nav-item" onClick={handleLogout} title={!sidebarOpen ? 'Logout' : undefined}>
            <LogOut size={16} className="nav-icon" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top header */}
        <header style={{
          height: 'var(--header-height)',
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <span style={{ fontSize: 13, color: 'var(--color-text-dim)' }}>
              AI-Enabled Labour Market Intelligence &amp; Skill Forecasting Engine
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 12, color: 'var(--color-success)' }}>API Online</span>
            </div>
            <div style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '4px 10px',
              fontSize: 12,
              color: 'var(--color-text-dim)',
            }}>
              🇮🇳 MSDE | NCVET | State Missions
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
