import React from 'react';
import { Network, Users, ArrowRight, ShieldAlert, Sparkles, Filter } from 'lucide-react';

export default function GraphHeader({
  occupations = [],
  sourceNco,
  setSourceNco,
  surplusCandidates,
  setSurplusCandidates,
  activePathway,
  loading = false,
}) {
  const legacyTrades = occupations.filter((o) => o.is_legacy_at_risk) || [];
  const otherTrades = occupations.filter((o) => !o.is_legacy_at_risk) || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Competency Adjacency Mapping
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              Adjacency Engine Synchronized
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Skill Transition & Competency Pathways
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Ontology-driven competency overlap analysis. Identifies rapid 30-day modular bridge pathways from available talent pools to high-demand technical specializations.
          </p>
        </div>

        {/* Transition Summary Pill */}
        {activePathway && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Optimal Bridge Identified</div>
              <div className="text-xs font-bold text-emerald-400">{activePathway.target_trade_title}</div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-center px-1">
              <div className="text-sm font-black text-white">{activePathway.skill_overlap_pct}%</div>
              <div className="text-[9px] text-slate-400">Overlap</div>
            </div>
          </div>
        )}
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
        {/* Origin Trade Selector */}
        <div className="md:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Source Trade (Baseline Qualification / Intake Pool)
          </label>
          <select
            value={sourceNco}
            onChange={(e) => setSourceNco(e.target.value)}
            disabled={loading}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
          >
            <optgroup label="Priority Transition Cohorts (Available Trainee Pools)">
              {legacyTrades.map((o) => (
                <option key={o.nco_code} value={o.nco_code}>
                  {o.nco_code} · {o.title} (NSQF Level {o.nsqf_level})
                </option>
              ))}
            </optgroup>
            <optgroup label="Standard Occupational Trades">
              {otherTrades.map((o) => (
                <option key={o.nco_code} value={o.nco_code}>
                  {o.nco_code} · {o.title}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Candidate Cohort Size Slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              Candidate Cohort Size
            </label>
            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
              {surplusCandidates.toLocaleString()} Trainees
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="2000"
            step="50"
            value={surplusCandidates}
            onChange={(e) => setSurplusCandidates(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>50 Batch</span>
            <span>District Scale (2,000)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
