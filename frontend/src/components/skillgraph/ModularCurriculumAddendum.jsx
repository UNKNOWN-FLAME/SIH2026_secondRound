import React from 'react';
import { BookOpen, CheckCircle, AlertCircle, Calendar, Sparkles, ArrowRight, ShieldCheck, Printer } from 'lucide-react';

export default function ModularCurriculumAddendum({
  pathways = [],
  activePathway,
  onSelectPathway,
  onOpenOrderModal,
  loading = false,
}) {
  if (loading || !activePathway) return null;

  const sharedSkills = activePathway.shared_skills || [
    'Automotive chassis mechanics',
    '12V electrical wiring & schematics',
    'Diagnostic fault code scanning',
    'Pneumatic & hand tools precision',
  ];

  const gapSkills = activePathway.missing_gap_skills || [
    'High-voltage (>400V) LOTO safety',
    'BMS CAN-bus telemetry diagnostics',
    'Battery thermal runaway mitigation',
    'EV inverter phase testing',
  ];

  // 4-Week curriculum module breakdown
  const weeks = [
    {
      weekNumber: 1,
      title: 'High-Voltage Safety & Lithium-ion Pack Architecture',
      hours: 30,
      focus: 'LOTO isolation protocols, LFP/NMC cell balancing, and personal dielectric PPE standards.',
      prerequisiteTransfer: 'Automotive 12V schematics & workshop safety (94% transfer)',
    },
    {
      weekNumber: 2,
      title: 'Thermal Management & BMS Telematics Diagnostics',
      hours: 30,
      focus: 'Liquid cooling loop bleeding, CAN OBD-II telemetry, oscilloscope insulation testing.',
      prerequisiteTransfer: 'ECU sensor diagnostics & multimeter testing (88% transfer)',
    },
    {
      weekNumber: 3,
      title: 'Inverter & Electric Powertrain Integration',
      hours: 30,
      focus: 'AC synchronous motor bench testing, phase cable torque specs, regenerative braking calibration.',
      prerequisiteTransfer: 'Mechanical drivetrain & gearbox alignment (95% transfer)',
    },
    {
      weekNumber: 4,
      title: 'Industrial Plant Floor OJT & NCVET Certification',
      hours: 30,
      focus: 'Live production cluster internship, fast-charging station commissioning, NCVET Level 4 exam.',
      prerequisiteTransfer: 'Automotive production discipline & QC protocols (100% transfer)',
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
      {/* Header and Pathway Selector Tabs */}
      <div className="pb-4 mb-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              30-Day Modular Bridge Recommender & Curriculum Addendum
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded uppercase">
              Fast-Track Modular Standard
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Select the most optimal adjacent destination trade to generate an official 4-week NCVET curriculum addendum.
          </p>
        </div>

        <button
          onClick={onOpenOrderModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all self-start lg:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          Draft Reskilling Directive
        </button>
      </div>

      {/* Alternative Transition Pathways Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {pathways.map((path, idx) => {
          const isSelected = activePathway.target_nco_code === path.target_nco_code;
          return (
            <button
              key={path.target_nco_code}
              onClick={() => onSelectPathway(path)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-1 ring-emerald-500/40'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  Rank #{idx + 1} Pathway
                </span>
                <span className="font-mono text-xs font-black text-emerald-700">
                  {path.skill_overlap_pct}% Overlap
                </span>
              </div>
              <div className="font-bold text-slate-900 text-xs tracking-tight line-clamp-1">
                {path.target_trade_title}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                <span>Duration: <strong>{path.recommended_bridge_weeks} Weeks</strong></span>
                <span className="text-emerald-700 font-semibold">{path.target_market_demand_status.replace('_', ' ')}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Competencies Comparison: Shared vs Missing Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Shared Competencies */}
        <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900 mb-2.5">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            Verified Shared Competencies ({activePathway.skill_overlap_pct}% Overlap)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sharedSkills.map((s, i) => (
              <span
                key={i}
                className="bg-white border border-blue-200 text-blue-800 text-xs px-2.5 py-1 rounded-lg font-medium shadow-2xs"
              >
                ✓ {s}
              </span>
            ))}
          </div>
          <div className="text-[11px] text-blue-700 mt-3 font-medium">
            Trainees already possess certified mastery in these domains. No repeat instruction required.
          </div>
        </div>

        {/* Missing Gap Skills */}
        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Target Competency Gaps (To Be Trained in 30-Day Bridge)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {gapSkills.map((s, i) => (
              <span
                key={i}
                className="bg-white border border-emerald-200 text-emerald-800 text-xs px-2.5 py-1 rounded-lg font-medium shadow-2xs"
              >
                ⚡ {s}
              </span>
            ))}
          </div>
          <div className="text-[11px] text-emerald-700 mt-3 font-medium">
            Bridged exclusively through 4-week intensive lab simulations and plant OJT.
          </div>
        </div>
      </div>

      {/* Week-by-Week Modular Bridge Curriculum Timeline */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
          <span>Official 4-Week Modular Syllabus Schedule (120 Total Training Hours)</span>
          <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            NSQF Level {activePathway.target_nsqf_level} Addendum
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {weeks.map((w) => (
            <div
              key={w.weekNumber}
              className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-300 hover:bg-emerald-50/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                    Week 0{w.weekNumber}
                  </span>
                  <span className="text-[11px] text-slate-500 font-semibold">{w.hours} Hours</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs leading-snug mb-1.5">
                  {w.title}
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  {w.focus}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-[10px] text-slate-500 font-medium">
                Transfer: <span className="text-slate-800">{w.prerequisiteTransfer}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
