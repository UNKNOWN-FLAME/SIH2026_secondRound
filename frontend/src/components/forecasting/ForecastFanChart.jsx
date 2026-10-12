import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Eye, Info, Sparkles, TrendingUp, Cpu, Network, BarChart2 } from 'lucide-react';

export default function ForecastFanChart({ data, loading = false, horizonMonths = 12 }) {
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [showSupply, setShowSupply] = useState(true);
  const [showGbr, setShowGbr] = useState(false);
  const [showLstm, setShowLstm] = useState(false);
  const [showArima, setShowArima] = useState(false);

  if (loading || !data) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-[560px] flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Generating Stochastic Monte Carlo Trajectory Curves...</span>
        </div>
      </div>
    );
  }

  const historicalPoints = data.historical_points || [];
  const futurePoints = data.future_points || [];

  // Combine into unified chart timeline
  const chartData = [
    ...historicalPoints.map((pt) => ({
      period: pt.period,
      isHistorical: true,
      historicalDemand: pt.projected_demand_p50,
      historicalSupply: pt.projected_supply,
      p50Demand: null,
      p10Demand: null,
      p90Demand: null,
      supply: pt.projected_supply,
      gbrDemand: null,
      lstmDemand: null,
      arimaDemand: null,
      mismatchRatio: pt.mismatch_ratio,
      severityFlag: pt.severity_flag,
    })),
    ...futurePoints.map((pt, idx) => ({
      period: pt.period,
      isHistorical: false,
      historicalDemand: null,
      historicalSupply: null,
      p50Demand: pt.projected_demand_p50,
      p10Demand: pt.projected_demand_p10,
      p90Demand: pt.projected_demand_p90,
      // For Recharts area delta ribbon:
      envelopeDelta: Math.max(0, pt.projected_demand_p90 - pt.projected_demand_p10),
      supply: pt.projected_supply,
      gbrDemand: pt.gbr_demand,
      lstmDemand: pt.lstm_demand,
      arimaDemand: pt.arima_demand,
      mismatchRatio: pt.mismatch_ratio,
      severityFlag: pt.severity_flag,
    })),
  ];

  // Transition period point between historical and forecast
  const splitPeriod = futurePoints[0]?.period || '';

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const row = payload[0]?.payload || {};
    const isHist = row.isHistorical;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-4 shadow-2xl text-white min-w-[260px] text-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <span className="font-mono text-sm font-bold text-blue-400">{label}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            isHist ? 'bg-slate-800 text-slate-300' : 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
          }`}>
            {isHist ? 'Historical' : 'AI Forecast'}
          </span>
        </div>

        <div className="space-y-1.5">
          {isHist ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Reported Demand:</span>
                <span className="font-bold text-white">{row.historicalDemand?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Institutional Supply:</span>
                <span className="font-bold text-emerald-400">{row.historicalSupply?.toLocaleString()}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-blue-300 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> P50 Expected Demand:
                </span>
                <span className="font-extrabold text-white text-sm">{row.p50Demand?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-amber-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> P10 Conservative:
                </span>
                <span className="font-mono">{row.p10Demand?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-rose-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> P90 Aggressive:
                </span>
                <span className="font-mono">{row.p90Demand?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Effective Supply:
                </span>
                <span className="font-bold text-white">{row.supply?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span className="text-slate-400">Net Gap / Deficit:</span>
                <span className={`font-mono font-bold ${
                  (row.p50Demand - row.supply) > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {(row.p50Demand - row.supply) > 0 ? `-${Math.round(row.p50Demand - row.supply)} (Deficit)` : `+${Math.round(row.supply - row.p50Demand)} (Surplus)`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Demand/Supply Ratio:</span>
                <span className="font-bold font-mono text-white">{row.mismatchRatio}x</span>
              </div>

              {/* Extra model outputs if toggled */}
              {(showGbr || showLstm || showArima) && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                  {showGbr && (
                    <div className="flex justify-between text-purple-300">
                      <span>GBR Regressor:</span>
                      <span className="font-mono">{row.gbrDemand?.toLocaleString()}</span>
                    </div>
                  )}
                  {showLstm && (
                    <div className="flex justify-between text-cyan-300">
                      <span>LSTM RNN:</span>
                      <span className="font-mono">{row.lstmDemand?.toLocaleString()}</span>
                    </div>
                  )}
                  {showArima && (
                    <div className="flex justify-between text-orange-300">
                      <span>Auto-ARIMA:</span>
                      <span className="font-mono">{row.arimaDemand?.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
      {/* Chart Title and Interactive Model Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Stochastic Forecast Curves & Confidence Envelopes
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
              {horizonMonths}M Horizon
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Empirical demand baseline with forward Monte Carlo P10 (Bear), P50 (Expected), and P90 (Bull) uncertainty envelopes.
          </p>
        </div>

        {/* Dynamic Model & Envelope Visibility Switches */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showEnvelope}
              onChange={(e) => setShowEnvelope(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
            />
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/20 border border-blue-500"></span>
            P10-P90 Envelope
          </label>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showSupply}
              onChange={(e) => setShowSupply(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Effective Supply
          </label>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showGbr}
              onChange={(e) => setShowGbr(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
            />
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            GBR Curve
          </label>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showLstm}
              onChange={(e) => setShowLstm(e.target.checked)}
              className="rounded text-cyan-600 focus:ring-cyan-500 w-3.5 h-3.5"
            />
            <Network className="w-3.5 h-3.5 text-cyan-600" />
            LSTM Curve
          </label>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors font-medium text-slate-700">
            <input
              type="checkbox"
              checked={showArima}
              onChange={(e) => setShowArima(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500 w-3.5 h-3.5"
            />
            <BarChart2 className="w-3.5 h-3.5 text-orange-600" />
            ARIMA Curve
          </label>
        </div>
      </div>

      {/* Main Canvas Chart */}
      <div className="h-[460px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 25, left: 0, bottom: 25 }}>
            <defs>
              {/* Shaded Gradient Ribbon for P10-P90 Confidence Interval */}
              <linearGradient id="confidenceEnvelopeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.03} />
              </linearGradient>

              {/* Historical Shading */}
              <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="period"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              dy={8}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Split Dotted Marker between Historical and Forward Projections */}
            {splitPeriod && (
              <ReferenceLine
                x={splitPeriod}
                stroke="#6366f1"
                strokeDasharray="4 4"
                label={{
                  value: 'AI Forecast Horizon ➔',
                  position: 'top',
                  fill: '#6366f1',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              />
            )}

            {/* Historical Demand Area/Line */}
            <Line
              type="monotone"
              dataKey="historicalDemand"
              name="Historical Ground Demand"
              stroke="#64748b"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#64748b' }}
              activeDot={{ r: 5 }}
            />

            {/* Confidence Envelope Shaded Area (P90 to P10) */}
            {showEnvelope && (
              <>
                <Area
                  type="monotone"
                  dataKey="p90Demand"
                  name="P90 (Aggressive Bound)"
                  stroke="#f43f5e"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  fill="url(#confidenceEnvelopeGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="p10Demand"
                  name="P10 (Conservative Bound)"
                  stroke="#eab308"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </>
            )}

            {/* Primary P50 Expected Demand Forecast Line */}
            <Line
              type="monotone"
              dataKey="p50Demand"
              name="P50 Expected Demand"
              stroke="#2563eb"
              strokeWidth={3.5}
              dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6 }}
            />

            {/* Effective Institutional Supply Line */}
            {showSupply && (
              <Line
                type="monotone"
                dataKey="supply"
                name="Effective Supply (Batches)"
                stroke="#10b981"
                strokeWidth={2.5}
                strokeDasharray="4 2"
                dot={{ r: 3, fill: '#10b981' }}
                activeDot={{ r: 5 }}
              />
            )}

            {/* GBR Model Curve (if toggled) */}
            {showGbr && (
              <Line
                type="monotone"
                dataKey="gbrDemand"
                name="Gradient Boosting Regressor"
                stroke="#9333ea"
                strokeWidth={2}
                dot={false}
              />
            )}

            {/* LSTM Model Curve (if toggled) */}
            {showLstm && (
              <Line
                type="monotone"
                dataKey="lstmDemand"
                name="LSTM Sequence Model"
                stroke="#06b6d4"
                strokeWidth={2}
                dot={false}
              />
            )}

            {/* ARIMA Model Curve (if toggled) */}
            {showArima && (
              <Line
                type="monotone"
                dataKey="arimaDemand"
                name="Auto-ARIMA Baseline"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Explanatory Legend Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 rounded-full inline-block"></span>
            <span className="font-semibold text-slate-700">P50 Expected (Median)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-rose-500 border-b border-dashed inline-block"></span>
            <span>P90 (Bull Case)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 border-b border-dashed inline-block"></span>
            <span>P10 (Bear Case)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 border-b border-dashed inline-block"></span>
            <span className="text-emerald-700 font-semibold">Institutional Passouts</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Supply curve incorporates seasonal ITI passout surges (July/Aug & Dec batches).</span>
        </div>
      </div>
    </div>
  );
}
