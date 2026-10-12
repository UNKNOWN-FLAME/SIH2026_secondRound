import React from 'react';
import { MapPin, Briefcase, Calendar, Layers, Sparkles, Building2 } from 'lucide-react';

export default function ForecastingHeader({
  states = [],
  selectedState = 'ALL',
  setSelectedState,
  districts = [],
  sectors = [],
  occupations = [],
  selectedDistrict,
  setSelectedDistrict,
  selectedSector,
  setSelectedSector,
  selectedNco,
  setSelectedNco,
  horizonMonths,
  setHorizonMonths,
  tradeDetails,
  loading = false,
}) {
  const stateOptions = [
    { code: 'ALL', name: 'All Priority States' },
    { code: 'UP', name: 'Uttar Pradesh' },
    { code: 'MH', name: 'Maharashtra' },
    { code: 'TN', name: 'Tamil Nadu' },
  ];

  const visibleDistricts = selectedState === 'ALL'
    ? districts
    : districts.filter((d) => d.state_code === selectedState);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Demand-Supply Forecasting
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Validated Model Active
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Labour Demand & Supply Forecasting
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Empirical demand trajectories with probabilistic intervals (P10, P50, P90) across tactical and strategic planning horizons.
          </p>
        </div>

        {/* 12M vs 24M Horizon Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start lg:self-center">
          <button
            onClick={() => setHorizonMonths(12)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              horizonMonths === 12
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            12-Month Horizon
          </button>
          <button
            onClick={() => setHorizonMonths(24)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              horizonMonths === 24
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            24-Month Horizon
          </button>
        </div>
      </div>

      {/* Cascading 4-Level Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
        {/* Level 1: State Filter */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            Target State
          </label>
          <select
            value={selectedState}
            onChange={(e) => {
              const newState = e.target.value;
              setSelectedState(newState);
              if (newState !== 'ALL') {
                const stateDists = districts.filter((d) => d.state_code === newState);
                if (stateDists.length > 0 && !stateDists.some((d) => d.code === selectedDistrict)) {
                  setSelectedDistrict(stateDists[0].code);
                }
              }
            }}
            disabled={loading}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
          >
            {stateOptions.map((st) => (
              <option key={st.code} value={st.code}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level 2: District Selector */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            Target District
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={loading}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
          >
            {visibleDistricts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name} ({d.state_code})
              </option>
            ))}
          </select>
        </div>

        {/* Level 3: Priority Sector */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Industry Sector
          </label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            disabled={loading}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
          >
            {sectors.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Level 4: Occupational Trade */}
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            Occupational Trade (NCO)
          </label>
          <select
            value={selectedNco}
            onChange={(e) => setSelectedNco(e.target.value)}
            disabled={loading}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
          >
            {occupations.map((o) => (
              <option key={o.nco_code} value={o.nco_code}>
                {o.nco_code} · {o.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trade Summary Bar */}
      {tradeDetails && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Selected Trade:</span>
            <span className="font-bold text-white tracking-wide">{tradeDetails.title}</span>
            <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono text-[11px]">
              NSQF Level {tradeDetails.nsqf_level || 4}
            </span>
            {tradeDetails.is_emerging && (
              <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 px-2.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> High Demand Growth
              </span>
            )}
            {tradeDetails.is_legacy_at_risk && (
              <span className="bg-rose-500/15 text-rose-300 border border-rose-500/25 px-2.5 py-0.5 rounded text-[11px] font-semibold">
                Saturated Trade Baseline
              </span>
            )}
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            District Code: <span className="text-blue-400 font-semibold">{selectedDistrict}</span>
          </div>
        </div>
      )}
    </div>
  );
}
