import React, { useState, useMemo } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw, Info, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export default function SkillNetworkCanvas({
  networkData,
  sourceNco,
  targetNco,
  onSelectNode,
  loading = false,
}) {
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState(null);

  // Layout node positions dynamically in a circular / cluster layout
  const { nodePositions, edges } = useMemo(() => {
    const nodes = networkData?.nodes || [];
    const rawEdges = networkData?.edges || [];

    const positions = {};
    const width = 850;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;

    const surplusNodes = nodes.filter((n) => n.status === 'SURPLUS');
    const shortageNodes = nodes.filter((n) => n.status === 'SHORTAGE');
    const balancedNodes = nodes.filter((n) => n.status === 'BALANCED');

    // Place Surplus nodes on the left cluster
    surplusNodes.forEach((node, idx) => {
      const step = (idx + 1) / (surplusNodes.length + 1);
      positions[node.id] = {
        ...node,
        x: 140,
        y: 80 + step * (height - 160),
      };
    });

    // Place Shortage / Emerging nodes on the right cluster
    shortageNodes.forEach((node, idx) => {
      const step = (idx + 1) / (shortageNodes.length + 1);
      positions[node.id] = {
        ...node,
        x: width - 160,
        y: 80 + step * (height - 160),
      };
    });

    // Place Balanced nodes in the center / top-bottom arches
    balancedNodes.forEach((node, idx) => {
      const angle = (idx / Math.max(balancedNodes.length, 1)) * Math.PI;
      positions[node.id] = {
        ...node,
        x: centerX + Math.cos(angle) * 160,
        y: centerY + Math.sin(angle) * 150 - 30,
      };
    });

    // Fallback if node not assigned
    nodes.forEach((node, idx) => {
      if (!positions[node.id]) {
        positions[node.id] = {
          ...node,
          x: 200 + (idx % 4) * 150,
          y: 120 + Math.floor(idx / 4) * 100,
        };
      }
    });

    return { nodePositions: positions, edges: rawEdges };
  }, [networkData]);

  if (loading || !networkData) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl h-[520px] flex items-center justify-center animate-pulse text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">Loading Competency Adjacency Network & Directed Pathways...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden text-white flex flex-col">
      {/* Canvas Top Bar */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80 z-10">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold tracking-tight text-white uppercase">
            Interactive Competency Adjacency Topology
          </h3>
          <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
            {Object.keys(nodePositions).length} Nodes · {edges.length} Directed Pathways
          </span>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 overflow-hidden min-h-[460px] flex items-center justify-center">
        <svg
          viewBox="0 0 850 500"
          className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <defs>
            {/* Arrow Marker Definitions */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#475569" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="24"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981" />
            </marker>

            {/* Glowing Active Path Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Background Grid Pattern */}
          <g opacity="0.15">
            {Array.from({ length: 18 }).map((_, i) => (
              <line key={`x-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="500" stroke="#334155" strokeWidth="1" />
            ))}
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={`y-${i}`} x1="0" y1={i * 50} x2="850" y2={i * 50} stroke="#334155" strokeWidth="1" />
            ))}
          </g>

          {/* Directed Edges */}
          {edges.map((edge, idx) => {
            const src = nodePositions[edge.source];
            const dst = nodePositions[edge.target];
            if (!src || !dst) return null;

            const isSelectedTransition = edge.source === sourceNco && edge.target === targetNco;
            const isHovered = hoveredEdge === idx;

            // Curved quadratic Bezier control point
            const midX = (src.x + dst.x) / 2;
            const midY = (src.y + dst.y) / 2 - 25;
            const pathD = `M ${src.x} ${src.y} Q ${midX} ${midY} ${dst.x} ${dst.y}`;

            return (
              <g key={`edge-${idx}`} onMouseEnter={() => setHoveredEdge(idx)} onMouseLeave={() => setHoveredEdge(null)}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={isSelectedTransition ? '#10b981' : isHovered ? '#60a5fa' : '#334155'}
                  strokeWidth={isSelectedTransition ? 3.5 : isHovered ? 2.5 : Math.max(1, edge.overlap_pct / 35)}
                  strokeDasharray={isSelectedTransition ? 'none' : '4 2'}
                  markerEnd={isSelectedTransition ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                  filter={isSelectedTransition ? 'url(#glow)' : undefined}
                  className="transition-colors duration-200"
                />

                {/* Overlap % Badge on edge */}
                {(isSelectedTransition || isHovered || edge.overlap_pct >= 70) && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-22"
                      y="-11"
                      width="44"
                      height="20"
                      rx="6"
                      fill={isSelectedTransition ? '#064e3b' : '#0f172a'}
                      stroke={isSelectedTransition ? '#10b981' : '#475569'}
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dy="3"
                      fill={isSelectedTransition ? '#a7f3d0' : '#cbd5e1'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {edge.overlap_pct}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {Object.values(nodePositions).map((node) => {
            const isSource = node.id === sourceNco;
            const isTarget = node.id === targetNco;
            const isHovered = hoveredNode?.id === node.id;

            const isSurplus = node.status === 'SURPLUS';
            const isShortage = node.status === 'SHORTAGE';

            const fillColor = isSource
              ? '#dc2626'
              : isTarget
              ? '#059669'
              : isSurplus
              ? '#991b1b'
              : isShortage
              ? '#047857'
              : '#1e293b';

            const strokeColor = isSource
              ? '#fca5a5'
              : isTarget
              ? '#6ee7b7'
              : isSurplus
              ? '#ef4444'
              : isShortage
              ? '#10b981'
              : '#475569';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelectNode(node.id)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className="cursor-pointer transition-transform duration-200"
              >
                {/* Node Outer Ring */}
                <circle
                  r={isSource || isTarget ? 22 : 18}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSource || isTarget ? 3 : 1.5}
                  filter={isSource || isTarget ? 'url(#glow)' : undefined}
                />

                {/* Status Indicator Icon or Dot */}
                <circle
                  r={5}
                  fill="#ffffff"
                  cx={isSource || isTarget ? 13 : 11}
                  cy={isSource || isTarget ? -13 : -11}
                  stroke={fillColor}
                  strokeWidth="1.5"
                />

                {/* Node Label Text */}
                <text
                  textAnchor="middle"
                  dy={isSource || isTarget ? 34 : 30}
                  fill={isSource ? '#fca5a5' : isTarget ? '#a7f3d0' : '#e2e8f0'}
                  fontSize={isSource || isTarget ? 11 : 9.5}
                  fontWeight={isSource || isTarget ? 'bold' : 'normal'}
                  className="select-none pointer-events-none tracking-tight"
                >
                  {node.label.length > 22 ? `${node.label.substring(0, 20)}...` : node.label}
                </text>
                <text
                  textAnchor="middle"
                  dy={isSource || isTarget ? 46 : 41}
                  fill="#94a3b8"
                  fontSize="8.5"
                  fontFamily="monospace"
                  className="select-none pointer-events-none"
                >
                  NCO {node.id} · Lvl {node.nsqf_level}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hovered Node Detail Tooltip Popup */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 text-xs shadow-2xl max-w-xs pointer-events-none z-20">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-blue-400 font-bold">{hoveredNode.id}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                hoveredNode.status === 'SURPLUS' ? 'bg-rose-500/20 text-rose-300' : hoveredNode.status === 'SHORTAGE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
              }`}>
                {hoveredNode.status}
              </span>
            </div>
            <div className="font-bold text-white text-sm">{hoveredNode.label}</div>
            <div className="text-slate-400 mt-1 flex justify-between">
              <span>Sector: <strong className="text-slate-200">{hoveredNode.sector}</strong></span>
              <span>NSQF: <strong className="text-slate-200">Level {hoveredNode.nsqf_level}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Canvas Legend */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 border border-red-400 inline-block"></span>
            <span className="text-slate-300 font-medium">Saturated Legacy Origin (Surplus)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-emerald-400 inline-block"></span>
            <span className="text-emerald-300 font-semibold">Emerging High-Growth Destination</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600 inline-block"></span>
            <span>Balanced Trade</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5" />
          <span>Click any node to re-center the optimal bridge recommender.</span>
        </div>
      </div>
    </div>
  );
}
