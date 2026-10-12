import React from 'react';
import { FileText, Download, ShieldCheck, ArrowRight, Share2, Printer, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PolicyAdvisoryCard({
  data,
  onOpenCircularModal,
  loading = false,
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  if (!data) return null;

  const isAcute = data.overall_severity === 'ACUTE_SHORTAGE';
  const isSaturated = data.overall_severity === 'CHRONIC_SATURATION';

  const copyHash = () => {
    if (data.cag_audit_hash) {
      navigator.clipboard.writeText(data.cag_audit_hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCsv = () => {
    if (!data.future_points) return;
    const headers = ['Period', 'P50_Demand', 'P10_Demand', 'P90_Demand', 'Supply', 'Mismatch_Ratio', 'Severity'];
    const rows = data.future_points.map((pt) => [
      pt.period,
      pt.projected_demand_p50,
      pt.projected_demand_p10,
      pt.projected_demand_p90,
      pt.projected_supply,
      pt.mismatch_ratio,
      pt.severity_flag,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MSDE_Forecast_${data.district_code}_${data.nco_code}_${data.horizon_months}M.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`rounded-2xl p-6 border shadow-sm transition-all ${
      isAcute
        ? 'bg-rose-50/40 border-rose-200'
        : isSaturated
        ? 'bg-amber-50/40 border-amber-200'
        : 'bg-blue-50/40 border-blue-200'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isAcute
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : isSaturated
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}>
              Policy Directive
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Audit Ref:
              <button
                onClick={copyHash}
                title="Click to copy audit reference"
                className="font-bold text-slate-800 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                {data.cag_audit_hash || 'AUDIT-REF-2026-LIVE'}
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : null}
              </button>
            </div>
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Executive Policy Advisory & Training Seat Directive
          </h3>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          <button
            onClick={onOpenCircularModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            View Sanction Directive
          </button>
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Advisory Narrative Body */}
      <div className="mt-4 bg-white/90 rounded-xl p-4 border border-slate-200/80 shadow-xs">
        <p className="text-slate-800 text-sm leading-relaxed font-medium">
          {data.executive_recommendation}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span>Jurisdiction: <strong>{data.district_name}</strong></span>
            <span>•</span>
            <span>Trade: <strong>{data.trade_title} ({data.nco_code})</strong></span>
            <span>•</span>
            <span>Horizon: <strong>{data.horizon_months} Months</strong></span>
          </div>

          <button
            onClick={() => navigate('/graph')}
            className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 text-xs"
          >
            Review Skill Transition & Reskilling Pathways <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
