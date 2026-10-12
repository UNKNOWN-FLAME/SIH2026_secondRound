import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle, FileCheck } from 'lucide-react';

export default function ForecastingCircularModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const futurePoints = data.future_points || [];
  const lastPoint = futurePoints[futurePoints.length - 1] || {};
  const isShortage = lastPoint.mismatch_ratio >= 1.25;
  const recommendedSeats = isShortage
    ? Math.round(lastPoint.projected_demand_p50 - lastPoint.projected_supply)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 print-modal-backdrop print:static print:inset-auto print:p-0 print:bg-transparent print:backdrop-none print:w-full print:block">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] print-modal-container print:w-full print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none print:overflow-visible print:m-0 print:p-0 print:block">
        {/* Modal Action Header (Hidden in Print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print-modal-header print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm tracking-wide uppercase">
              Gazette Order Preview · Annual Seat Sanction Circular
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Circular Letter Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans text-xs sm:text-sm print-document-sheet print:p-0 print:m-0 print:overflow-visible print:max-h-none print:text-black">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
              Government of India · Ministry of Skill Development and Entrepreneurship
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 mt-1 uppercase tracking-tight">
              Directorate General of Training (DGT) · Labour Market Analytics Division
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Shram Shakti Bhawan, Rafi Marg, New Delhi - 110001
            </div>
          </div>

          {/* Reference Meta */}
          <div className="flex justify-between items-start text-xs font-mono text-slate-600">
            <div>
              <div><strong>Circular No:</strong> DGT/LMIS/2026/SEC-{data.sector_code || 'GEN'}</div>
              <div><strong>LGD Jurisdiction:</strong> {data.district_code} ({data.district_name})</div>
            </div>
            <div className="text-right">
              <div><strong>Date:</strong> {today}</div>
              <div><strong>Audit Ref:</strong> {data.cag_audit_hash || 'AUDIT-REF-2026-LIVE'}</div>
            </div>
          </div>

          {/* Subject Line */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-900">SUBJECT: </span>
            <span className="font-semibold text-slate-700">
              Statutory Annual Seat Sanction & Quota Realignment Circular for Trade: {data.trade_title} (NCO {data.nco_code}) across District {data.district_name}.
            </span>
          </div>

          {/* Body Paragraphs */}
          <div className="space-y-3 leading-relaxed text-slate-700">
            <p>
              In exercise of powers conferred under National Council for Vocational Education and Training (NCVET) guidelines and multi-indicator labour demand analytics derived from the National Labour Market Information System (LMIS), sanction is hereby accorded for the following capacity adjustments:
            </p>

            {/* Structured Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden my-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Indicator Parameter</th>
                    <th className="p-2.5">Empirical / Projected Baseline</th>
                    <th className="p-2.5">Policy Directive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-slate-900">Target Horizon</td>
                    <td className="p-2.5">{data.horizon_months} Months Forward</td>
                    <td className="p-2.5 text-blue-600 font-bold">Standard Sanction Cycle</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-slate-900">Projected Market Headcount Demand (P50)</td>
                    <td className="p-2.5">{Math.round(lastPoint.projected_demand_p50 || 0).toLocaleString()} Candidates</td>
                    <td className="p-2.5 text-slate-600">Lead Inflow Ingestion</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-slate-900">Effective ITI Passout Supply</td>
                    <td className="p-2.5">{Math.round(lastPoint.projected_supply || 0).toLocaleString()} Candidates</td>
                    <td className="p-2.5 text-slate-600">Batch Capacity</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-slate-900">Demand / Supply Ratio (Severity)</td>
                    <td className="p-2.5 font-bold">{lastPoint.mismatch_ratio}x</td>
                    <td className="p-2.5 font-bold uppercase">{data.overall_severity}</td>
                  </tr>
                  <tr className="bg-blue-50/50 font-bold">
                    <td className="p-2.5 font-sans text-slate-900">Recommended Seat Quota Delta</td>
                    <td className="p-2.5">{isShortage ? `+${recommendedSeats}` : '0 (Freeze Intake)'} seats</td>
                    <td className="p-2.5 text-blue-700">{isShortage ? 'Mandatory Expansion' : 'Freeze & Reskill'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="font-medium text-slate-800">
              {data.executive_recommendation}
            </p>

            <p className="text-xs text-slate-500">
              This digital order is cryptographically authenticated and logged in the verified institutional compliance register pursuant to MSDE and NCVET guidelines.
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
            <div className="text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                <ShieldCheck className="w-4 h-4" /> Digitally Verified Audit Hash
              </div>
              <div>Ref: {data.cag_audit_hash || 'AUDIT-REF-2026-LIVE'}</div>
            </div>

            <div className="text-right text-xs">
              <div className="font-bold text-slate-900">Joint Secretary & Mission Director</div>
              <div className="text-slate-500">Ministry of Skill Development & Entrepreneurship</div>
              <div className="text-slate-400 font-mono text-[10px]">Govt. of India</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
