import React from 'react';
import { PiggyBank, Clock, CheckCircle2, Building2, Zap, ArrowRight } from 'lucide-react';

export default function TransitionEconomicsStrip({
  recommendationData,
  activePathway,
  surplusCandidates = 500,
  loading = false,
}) {
  if (loading || !activePathway) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  const overlapPct = activePathway.skill_overlap_pct || 78;
  const bridgeWeeks = activePathway.recommended_bridge_weeks || 4;

  // Economic calculations (MSDE benchmark costs)
  const traditionalCostPerCandidate = 120000; // ₹1.2 Lakh per 2-year ITI graduate
  const bridgeCostPerCandidate = 14000;       // ₹14,000 per 4-week addendum
  const netSavedPerCandidate = traditionalCostPerCandidate - bridgeCostPerCandidate;
  const totalFundsSavedCr = ((netSavedPerCandidate * surplusCandidates) / 10000000).toFixed(2);

  // Centers saved calculation (average ITI capacity = 180 seats)
  const centersSaved = Math.max(1, Math.round(surplusCandidates / 180));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Total Public Funds Saved */}
      <div className="bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Public Capex Saved
          </span>
          <span className="p-1.5 rounded-lg text-xs bg-emerald-100 text-emerald-700 font-bold">
            <PiggyBank className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-black text-emerald-700 tracking-tight">
            ₹{totalFundsSavedCr} Cr
          </div>
          <span className="text-xs font-bold text-emerald-600">
            saved
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-2 font-medium">
          ₹1.2L (Traditional ITI) vs ₹14k (Bridge Module)
        </div>
      </div>

      {/* Metric 2: Competency Overlap % */}
      <div className="bg-white border border-blue-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Syllabus Overlap
          </span>
          <span className="p-1.5 rounded-lg text-xs bg-blue-100 text-blue-700 font-bold">
            <Zap className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-black text-blue-700 tracking-tight">
            {overlapPct}%
          </div>
          <span className="text-xs font-bold text-blue-600">
            competency match
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-2 font-medium flex items-center gap-1">
          <span>Feasibility Index:</span>
          <strong className="text-slate-800 font-mono">{(activePathway.feasibility_score * 100).toFixed(0)}% optimal</strong>
        </div>
      </div>

      {/* Metric 3: Time to Deployment */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Deployment Horizon
          </span>
          <span className="p-1.5 rounded-lg text-xs bg-purple-50 text-purple-700 font-bold">
            <Clock className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {bridgeWeeks} Weeks
          </div>
          <span className="text-xs font-semibold text-slate-500">
            (30 Days)
          </span>
        </div>
        <div className="text-[11px] text-purple-700 font-semibold mt-2">
          26x faster than 2-Year ITI cycle
        </div>
      </div>

      {/* Metric 4: Infrastructure Optimization */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Infrastructure Optimization
          </span>
          <span className="p-1.5 rounded-lg text-xs bg-amber-50 text-amber-700 font-bold">
            <Building2 className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {centersSaved} ITIs
          </div>
          <span className="text-xs font-semibold text-slate-500">
            capacity equivalent
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-2 font-medium truncate" title="Utilizes existing ITI workshop network">
          Utilizes existing ITI workshop network
        </div>
      </div>
    </div>
  );
}
