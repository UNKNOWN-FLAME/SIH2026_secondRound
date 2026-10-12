import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ActivitySquare, Network, Database, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      icon: ActivitySquare,
      label: 'Labour Demand Forecasting',
      sublabel: '12M & 24M Predictive Trajectories',
      exact: true,
    },
    {
      path: '/graph',
      icon: Network,
      label: 'Skill Transition Ontology',
      sublabel: 'Career Pathways & Modular Reskilling',
    },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans print:h-auto print:overflow-visible print:bg-white print:block">
      {/* Institutional Slate Sidebar */}
      <aside className="w-72 bg-slate-900 flex flex-col z-20 shadow-2xl border-r border-slate-800 print:hidden">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold tracking-wider text-white uppercase">LMIS Portal</h2>
              <span className="text-[9px] bg-blue-500/20 text-blue-400 font-mono px-1.5 py-0.5 rounded border border-blue-500/30">v2.4</span>
            </div>
            <span className="text-[10px] text-slate-400 tracking-wide block mt-0.5">Labour Market Intelligence System</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 pt-2 pb-1">
            Analytical Modules
          </div>

          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === '/' || location.pathname === '/forecasting'
              : location.pathname.includes(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-blue-600/20 text-white border border-blue-500/30 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className={`p-2 rounded-lg mt-0.5 ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {item.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer Audit Status */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">Audited & Verified Model</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            LGD Regional Standard · Multi-Modal Data
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50 print:overflow-visible print:bg-white print:p-0 print:block">
        {/* Enterprise Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shadow-xs print:hidden">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-800 tracking-wide uppercase">
              Ministry of Skill Development & Entrepreneurship · National LMIS
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              UP · MH · TN (6 Priority Districts · 4 Core Sectors)
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span>API Reference</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 bg-emerald-50 font-semibold text-[11px] px-2 py-0.5 rounded border border-emerald-200">System Live</span>
          </div>
        </header>

        {/* Page View Container */}
        <div className="flex-1 overflow-auto p-6 relative z-0 print:p-0 print:overflow-visible print:block">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
