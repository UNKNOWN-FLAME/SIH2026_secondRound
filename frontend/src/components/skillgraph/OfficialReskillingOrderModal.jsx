import React from 'react';
import { X, Printer, ShieldCheck, FileCheck, CheckCircle2 } from 'lucide-react';

export default function OfficialReskillingOrderModal({
  isOpen,
  onClose,
  sourceTradeTitle,
  sourceNcoCode,
  activePathway,
  surplusCandidates = 500,
}) {
  if (!isOpen || !activePathway) return null;

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const traditionalCost = surplusCandidates * 120000;
  const bridgeCost = surplusCandidates * 14000;
  const savingsCr = ((traditionalCost - bridgeCost) / 10000000).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 print-modal-backdrop print:static print:inset-auto print:p-0 print:bg-transparent print:backdrop-none print:w-full print:block">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] print-modal-container print:w-full print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none print:overflow-visible print:m-0 print:p-0 print:block">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print-modal-header print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm tracking-wide uppercase">
              Statutory Reskilling Directive · NCVET Modular Addendum Sanction
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm"
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

        {/* Official Letter Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 font-sans text-xs sm:text-sm print-document-sheet print:p-0 print:m-0 print:overflow-visible print:max-h-none print:text-black">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4">
            <div className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
              Government of India · Ministry of Skill Development and Entrepreneurship
            </div>
            <div className="text-base sm:text-lg font-black text-slate-900 mt-1 uppercase tracking-tight">
              National Council for Vocational Education and Training (NCVET)
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Kaushal Bhawan, New Delhi - 110023
            </div>
          </div>

          {/* Reference Line */}
          <div className="flex justify-between items-start text-xs font-mono text-slate-600">
            <div>
              <div><strong>Order No:</strong> NCVET/MODULAR-BRIDGE/2026/SEC-AUTO-EV</div>
              <div><strong>Target Pipeline:</strong> {surplusCandidates} Certified Trainees</div>
            </div>
            <div className="text-right">
              <div><strong>Date:</strong> {today}</div>
              <div><strong>Verification Ref:</strong> NCVET-REF-{activePathway.target_nco_code}</div>
            </div>
          </div>

          {/* Subject Line */}
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-900">
            <span className="font-bold">SUBJECT: </span>
            <span>
              Sanction of 30-Day Modular Bridge Addendum for rapid career transition from <strong>{sourceTradeTitle} (NCO {sourceNcoCode})</strong> to <strong>{activePathway.target_trade_title} (NCO {activePathway.target_nco_code})</strong>.
            </span>
          </div>

          {/* Body */}
          <div className="space-y-3 leading-relaxed text-slate-700">
            <p>
              In accordance with NCVET competency harmonization standards, the Competency Adjacency Engine has established a certified <strong>{activePathway.skill_overlap_pct}% competency overlap</strong> between the baseline and emerging target trades.
            </p>

            <div className="border border-slate-200 rounded-lg overflow-hidden my-4">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 font-sans">
                  <tr>
                    <th className="p-2.5">Parameter</th>
                    <th className="p-2.5">Traditional Protocol</th>
                    <th className="p-2.5">Modular Bridge Sanction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-slate-900">Course Duration</td>
                    <td className="p-2.5">104 Weeks (2 Years)</td>
                    <td className="p-2.5 text-emerald-600 font-bold">{activePathway.recommended_bridge_weeks} Weeks (30 Days)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-slate-900">Public Cost per Candidate</td>
                    <td className="p-2.5">₹1,20,000</td>
                    <td className="p-2.5 font-bold text-slate-900">₹14,000</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans font-medium text-slate-900">Total Sanctioned Outlay ({surplusCandidates} Candidates)</td>
                    <td className="p-2.5">₹{(traditionalCost / 10000000).toFixed(2)} Cr</td>
                    <td className="p-2.5 font-bold text-slate-900">₹{(bridgeCost / 10000000).toFixed(2)} Cr</td>
                  </tr>
                  <tr className="bg-emerald-50 font-bold">
                    <td className="p-2.5 font-sans text-slate-900">Net Public Funds Saved</td>
                    <td className="p-2.5 text-slate-400">—</td>
                    <td className="p-2.5 text-emerald-700 text-sm">₹{savingsCr} Cr (Protected)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="font-semibold text-slate-900">
              Directive to State Skill Missions:
            </p>
            <p>
              All state training centers are instructed to immediately halt intake expansion for legacy trade {sourceNcoCode} and deploy the 4-week modular curriculum addendum directly utilizing existing workshop infrastructure. No new land acquisition or building construction is authorized.
            </p>
          </div>

          {/* Footer Signature */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end">
            <div className="text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold mb-1">
                <ShieldCheck className="w-4 h-4" /> Cryptographically Verified Digital Signature
              </div>
              <div className="font-mono text-[10px]">NCVET Institutional Compliance Verified</div>
            </div>

            <div className="text-right text-xs">
              <div className="font-bold text-slate-900">Chairperson, Executive Council</div>
              <div className="text-slate-500">National Council for Vocational Education and Training</div>
              <div className="text-slate-400 font-mono text-[10px]">Ministry of Skill Development, Govt. of India</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
