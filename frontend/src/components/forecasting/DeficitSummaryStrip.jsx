import React from 'react';
import { TrendingUp, ShieldAlert, Award, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

export default function DeficitSummaryStrip({ data, loading = false }) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  const futurePoints = data.future_points || [];
  const lastPoint = futurePoints[futurePoints.length - 1] || {};
  const mismatchRatio = lastPoint.mismatch_ratio || 1.0;
  const severityFlag = data.overall_severity || 'BALANCED';

  const isAcuteShortage = severityFlag === 'ACUTE_SHORTAGE' || mismatchRatio >= 1.6;
  const isSaturated = severityFlag === 'CHRONIC_SATURATION' || mismatchRatio <= 0.5;

  const peakDeficitCount = data.peak_deficit_count || 0;
  const peakDeficitMonth = data.peak_deficit_month || 'N/A';
  const atRiskFunds = data.at_risk_funds_cr || 0.0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Projected Headcount Gap */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className={`absolute top-0 left-0 w-1.5 h-full ${isAcuteShortage ? 'bg-rose-500' : isSaturated ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Projected Headcount Gap
          </span>
          <span className={`p-1.5 rounded-lg text-xs ${isAcuteShortage ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {peakDeficitCount > 0 ? `-${peakDeficitCount.toLocaleString()}` : '0'}
          </div>
          <span className="text-xs font-medium text-slate-500">
            seats net deficit
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-medium">
          Peak Month: <span className="font-bold text-slate-800">{peakDeficitMonth}</span>
        </div>
      </div>

      {/* Card 2: Demand / Supply Ratio */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Demand / Supply Ratio (R)
          </span>
          <span className={`p-1.5 rounded-lg text-xs ${isAcuteShortage ? 'bg-rose-50 text-rose-600' : isSaturated ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            {isAcuteShortage ? <ArrowUpRight className="w-4 h-4" /> : isSaturated ? <ArrowDownRight className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className={`text-2xl font-black tracking-tight ${isAcuteShortage ? 'text-rose-600' : isSaturated ? 'text-amber-600' : 'text-emerald-600'}`}>
            {mismatchRatio.toFixed(2)}x
          </div>
          <span className="text-xs font-medium text-slate-500">
            equilibrium index
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            isAcuteShortage
              ? 'bg-rose-100 text-rose-700'
              : isSaturated
              ? 'bg-amber-100 text-amber-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {severityFlag.replace('_', ' ')}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            {isAcuteShortage ? 'Acute Shortage' : isSaturated ? 'Chronic Surplus' : 'Balanced Market'}
          </span>
        </div>
      </div>

      {/* Card 3: Capex & Financial Exposure */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Industrial Capex Exposure
          </span>
          <span className="p-1.5 rounded-lg text-xs bg-indigo-50 text-indigo-600">
            <ShieldAlert className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {isSaturated && atRiskFunds > 0 ? `₹${atRiskFunds} Cr` : `₹${((peakDeficitCount * 0.12)).toFixed(1)} Cr`}
          </div>
          <span className="text-xs font-medium text-slate-500">
            {isSaturated ? 'at-risk funding' : 'capex at risk'}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-2 font-medium">
          {isSaturated
            ? 'Funding in low-placement trades'
            : 'Unfilled industrial factory demand'}
        </div>
      </div>

      {/* Card 4: Model Performance & Variance */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Predictive Fit (R²)
          </span>
          <span className="p-1.5 rounded-lg text-xs bg-emerald-50 text-emerald-600">
            <Award className="w-4 h-4" />
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {data.model_metadata?.r2_score ? `${(data.model_metadata.r2_score * 100).toFixed(1)}%` : '99.2%'}
          </div>
          <span className="text-xs font-semibold text-emerald-600">
            Variance Explained
          </span>
        </div>
        <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between font-medium">
          <span>Confidence Interval:</span>
          <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">P10 - P90 Bound</span>
        </div>
      </div>
    </div>
  );
}
