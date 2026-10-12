import React from 'react';
import { Sliders, RefreshCw, Zap, TrendingUp, DollarSign, Percent, Award } from 'lucide-react';

export default function MacroShockControls({
  capexBoostCr,
  setCapexBoostCr,
  inflationRatePct,
  setInflationRatePct,
  fdiInflowCr,
  setFdiInflowCr,
  stipendBoostPct,
  setStipendBoostPct,
  onReset,
  loading = false,
}) {
  const presets = [
    {
      id: 'organic',
      name: 'Status Quo Baseline',
      icon: RefreshCw,
      apply: () => {
        setCapexBoostCr(0);
        setInflationRatePct(5.5);
        setFdiInflowCr(0);
        setStipendBoostPct(0);
      },
    },
    {
      id: 'solar_ev',
      name: 'Clean Tech & EV Incentive',
      icon: Zap,
      apply: () => {
        setCapexBoostCr(450);
        setInflationRatePct(5.2);
        setFdiInflowCr(300);
        setStipendBoostPct(20);
      },
    },
    {
      id: 'semi_atmp',
      name: 'Electronics Corridor Expansion',
      icon: DollarSign,
      apply: () => {
        setCapexBoostCr(500);
        setInflationRatePct(5.4);
        setFdiInflowCr(400);
        setStipendBoostPct(15);
      },
    },
    {
      id: 'inflation_shock',
      name: 'High Inflation Stress Test',
      icon: Percent,
      apply: () => {
        setCapexBoostCr(0);
        setInflationRatePct(8.5);
        setFdiInflowCr(0);
        setStipendBoostPct(0);
      },
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Macroeconomic Stress Testing & Scenario Analysis
            </h3>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded uppercase">
              Scenario Modeling
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Simulate capital injections, inflation fluctuations, and apprentice incentives to evaluate trajectory sensitivity.
          </p>
        </div>

        <button
          onClick={onReset}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Baseline
        </button>
      </div>

      {/* Preset Quick Shocks Strip */}
      <div className="mb-6">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
          Predefined Policy Scenarios
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                onClick={preset.apply}
                disabled={loading}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-all text-xs group"
              >
                <div className="p-1 rounded-md bg-white border border-slate-200 group-hover:border-blue-300 text-blue-600">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-slate-800 group-hover:text-blue-900 truncate">
                  {preset.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Interactive Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Slider 1: Industrial Capex Injection */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              State / PLI Capex Injection
            </span>
            <span className="font-mono text-sm font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              ₹{capexBoostCr} Cr
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1500"
            step="25"
            value={capexBoostCr}
            onChange={(e) => setCapexBoostCr(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>₹0 Cr (Base)</span>
            <span className="text-blue-600 font-semibold">
              +{Math.round(capexBoostCr * 1.65)} direct jobs
            </span>
            <span>₹1,500 Cr</span>
          </div>
        </div>

        {/* Slider 2: Headline Inflation Drag */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Headline CPI Inflation
            </span>
            <span className="font-mono text-sm font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
              {inflationRatePct.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min="3.0"
            max="12.0"
            step="0.1"
            value={inflationRatePct}
            onChange={(e) => setInflationRatePct(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>3.0% (Disinflation)</span>
            <span className={inflationRatePct > 5.5 ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
              {inflationRatePct > 5.5 ? `-${((inflationRatePct - 5.5) * 1.4).toFixed(1)}% hiring drag` : 'Stable cost index'}
            </span>
            <span>12.0% (Stress)</span>
          </div>
        </div>

        {/* Slider 3: FDI / Anchor Plant Inflow */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              FDI / Mega-Project Inflow
            </span>
            <span className="font-mono text-sm font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              ₹{fdiInflowCr} Cr
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            step="50"
            value={fdiInflowCr}
            onChange={(e) => setFdiInflowCr(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>₹0 Cr</span>
            <span className="text-indigo-600 font-semibold">
              Global Anchor Factory Pull
            </span>
            <span>₹1,000 Cr</span>
          </div>
        </div>

        {/* Slider 4: Trainee Stipend & Retention Boost */}
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Trainee Stipend Incentive
            </span>
            <span className="font-mono text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              +{stipendBoostPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="5"
            value={stipendBoostPct}
            onChange={(e) => setStipendBoostPct(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>+0% (Standard DBT)</span>
            <span className="text-emerald-600 font-semibold">
              +{Math.round(stipendBoostPct * 0.75)}% supply retention
            </span>
            <span>+40% (Surge)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
