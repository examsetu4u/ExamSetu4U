import React from 'react';
import type { DiagramData } from '@/types/diagram';

interface SvgDiagramProps {
  data?: DiagramData;
  caption?: string;
  className?: string;
}

/**
 * Coordinate Axes / Cartesian Graph Renderer
 */
export function CoordinateGraphRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  const points = data.points || [
    { x: 2, y: 3, label: 'P(2, 3)' },
    { x: -3, y: 2, label: 'Q(-3, 2)' }
  ];
  const equation = data.dimensions?.equation || data.title || '';
  const isParabola = data.type === 'parabola' || Boolean(data.isParabola) || String(equation).includes('x²') || String(equation).includes('x^2');

  const originX = 210;
  const originY = 145;
  const scale = 25; // 25 px per unit

  return (
    <svg viewBox="0 0 420 290" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Coordinate Graph Diagram'}>
      <rect x="15" y="15" width="390" height="260" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Grid Lines */}
      <g stroke="#e2e8f0" strokeWidth="1">
        {[-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6].map(i => (
          <React.Fragment key={`grid-${i}`}>
            <line x1={originX + i * scale} y1="25" x2={originX + i * scale} y2="265" strokeDasharray={i % 2 === 0 ? 'none' : '2 2'} />
            <line x1="25" y1={originY + i * scale} x2="395" y2={originY + i * scale} strokeDasharray={i % 2 === 0 ? 'none' : '2 2'} />
          </React.Fragment>
        ))}
      </g>

      {/* Axes */}
      {/* X Axis */}
      <line x1="30" y1={originY} x2="390" y2={originY} stroke="#334155" strokeWidth="2" />
      <path d="M 385 141 L 392 145 L 385 149" fill="#334155" />
      <text x="395" y="149" className="text-[12px] font-extrabold fill-slate-800">X</text>
      <text x="25" y="149" className="text-[12px] font-extrabold fill-slate-800">X'</text>

      {/* Y Axis */}
      <line x1={originX} y1="265" x2={originX} y2="25" stroke="#334155" strokeWidth="2" />
      <path d="M 206 32 L 210 25 L 214 32" fill="#334155" />
      <text x="206" y="22" className="text-[12px] font-extrabold fill-slate-800">Y</text>
      <text x="206" y="278" className="text-[12px] font-extrabold fill-slate-800">Y'</text>

      {/* Origin (0,0) */}
      <circle cx={originX} cy={originY} r="3" fill="#334155" />
      <text x={originX - 14} y={originY + 14} className="text-[11px] font-bold fill-slate-600">O</text>

      {/* Axis Tick Marks & Numbers */}
      {[-4, -2, 2, 4].map(n => (
        <React.Fragment key={`tick-${n}`}>
          {/* X ticks */}
          <line x1={originX + n * scale} y1={originY - 3} x2={originX + n * scale} y2={originY + 3} stroke="#334155" strokeWidth="1.5" />
          <text x={originX + n * scale} y={originY + 14} textAnchor="middle" className="text-[9px] font-semibold fill-slate-500">{n}</text>
          {/* Y ticks */}
          <line x1={originX - 3} y1={originY - n * scale} x2={originX + 3} y2={originY - n * scale} stroke="#334155" strokeWidth="1.5" />
          <text x={originX - 8} y={originY - n * scale + 3} textAnchor="end" className="text-[9px] font-semibold fill-slate-500">{n}</text>
        </React.Fragment>
      ))}

      {/* Parabola or Line Plot */}
      {isParabola ? (
        <path
          d={`M ${originX - 3.2 * scale} ${originY - 3.5 * scale} Q ${originX} ${originY + 1.2 * scale} ${originX + 3.2 * scale} ${originY - 3.5 * scale}`}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
        />
      ) : (
        /* Linear equation line */
        <line
          x1={originX - 4 * scale}
          y1={originY + 2.5 * scale}
          x2={originX + 4 * scale}
          y2={originY - 2.5 * scale}
          stroke="#2563eb"
          strokeWidth="2.5"
        />
      )}

      {/* Plot Points */}
      {Array.isArray(points) && points.map((pt: any, idx: number) => {
        const px = typeof pt.x === 'number' ? pt.x : (Array.isArray(pt) ? pt[0] : 0);
        const py = typeof pt.y === 'number' ? pt.y : (Array.isArray(pt) ? pt[1] : 0);
        const label = pt.label || `(${px}, ${py})`;
        const screenX = originX + px * scale;
        const screenY = originY - py * scale;

        return (
          <g key={`pt-${idx}`}>
            {/* Dashed drop lines to axes */}
            <line x1={screenX} y1={screenY} x2={screenX} y2={originY} stroke="#dc2626" strokeWidth="1" strokeDasharray="3 2" />
            <line x1={screenX} y1={screenY} x2={originX} y2={screenY} stroke="#dc2626" strokeWidth="1" strokeDasharray="3 2" />
            <circle cx={screenX} cy={screenY} r="4.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
            <rect x={screenX + 6} y={screenY - 18} width={label.length * 7 + 10} height="16" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
            <text x={screenX + 11} y={screenY - 6} className="text-[10px] font-extrabold fill-red-700">{label}</text>
          </g>
        );
      })}

      {/* Equation Badge */}
      {equation && (
        <g transform="translate(30, 32)">
          <rect x="0" y="0" width={equation.length * 8 + 18} height="22" rx="4" fill="#ffffff" stroke="#93c5fd" strokeWidth="1" />
          <text x="9" y="15" className="text-[11px] font-bold fill-blue-900">{equation}</text>
        </g>
      )}
    </svg>
  );
}

/**
 * Real Number Line Renderer
 */
export function NumberLineRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  const points = data.points || [{ x: -2, label: '-2' }, { x: 3, label: '3' }];
  const start = data.dimensions?.start ? Number(data.dimensions.start) : -5;
  const end = data.dimensions?.end ? Number(data.dimensions.end) : 5;
  const step = 1;

  const count = end - start;
  const lineY = 130;
  const startX = 50;
  const endX = 370;
  const stepPx = (endX - startX) / count;

  return (
    <svg viewBox="0 0 420 220" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Number Line Diagram'}>
      <rect x="15" y="15" width="390" height="190" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Main horizontal number line */}
      <line x1={startX - 15} y1={lineY} x2={endX + 15} y2={lineY} stroke="#1e293b" strokeWidth="2.5" />
      <path d={`M ${endX + 8} ${lineY - 5} L ${endX + 18} ${lineY} L ${endX + 8} ${lineY + 5}`} fill="#1e293b" />
      <path d={`M ${startX - 8} ${lineY - 5} L ${startX - 18} ${lineY} L ${startX - 8} ${lineY + 5}`} fill="#1e293b" />

      {/* Ticks and values */}
      {Array.from({ length: count + 1 }).map((_, i) => {
        const val = start + i * step;
        const x = startX + i * stepPx;
        const isZero = val === 0;

        return (
          <g key={`nline-${val}`}>
            <line x1={x} y1={lineY - (isZero ? 10 : 6)} x2={x} y2={lineY + (isZero ? 10 : 6)} stroke={isZero ? '#dc2626' : '#64748b'} strokeWidth={isZero ? 2.5 : 1.5} />
            <text x={x} y={lineY + 24} textAnchor="middle" className={`text-[11px] ${isZero ? 'font-extrabold fill-red-700 text-[12px]' : 'font-semibold fill-slate-700'}`}>
              {val}
            </text>
          </g>
        );
      })}

      {/* Plotted Points on line */}
      {Array.isArray(points) && points.map((p: any, idx: number) => {
        const val = typeof p === 'number' ? p : (typeof p.x === 'number' ? p.x : 0);
        const label = p.label || String(val);
        const px = startX + ((val - start) / count) * (endX - startX);

        return (
          <g key={`pt-${idx}`}>
            <circle cx={px} cy={lineY} r="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
            <line x1={px} y1={lineY - 6} x2={px} y2={lineY - 30} stroke="#2563eb" strokeWidth="1.5" />
            <rect x={px - 18} y={lineY - 48} width="36" height="18" rx="3" fill="#2563eb" />
            <text x={px} y={lineY - 35} textAnchor="middle" className="text-[10px] font-bold fill-white">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Statistics Bar Chart / Histogram Renderer
 */
export function StatisticsChartRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  const bars = data.dimensions?.bars || [
    { label: '0-10', value: 8, color: '#3b82f6' },
    { label: '10-20', value: 14, color: '#2563eb' },
    { label: '20-30', value: 18, color: '#1d4ed8' },
    { label: '30-40', value: 10, color: '#1e40af' },
    { label: '40-50', value: 6, color: '#1e3a8a' },
  ];
  const maxVal = 20;
  const originX = 60;
  const originY = 220;
  const chartHeight = 160;
  const chartWidth = 320;
  const barWidth = chartWidth / bars.length - 8;

  return (
    <svg viewBox="0 0 420 280" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Statistics Chart'}>
      <rect x="15" y="15" width="390" height="250" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Y Axis Grid & Labels */}
      {[0, 5, 10, 15, 20].map((v) => {
        const y = originY - (v / maxVal) * chartHeight;
        return (
          <g key={`ygrid-${v}`}>
            <line x1={originX} y1={y} x2={originX + chartWidth} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
            <text x={originX - 8} y={y + 4} textAnchor="end" className="text-[10px] font-medium fill-slate-500">{v}</text>
          </g>
        );
      })}

      {/* Axes */}
      <line x1={originX} y1="40" x2={originX} y2={originY} stroke="#334155" strokeWidth="2" />
      <line x1={originX} y1={originY} x2={originX + chartWidth + 10} y2={originY} stroke="#334155" strokeWidth="2" />

      {/* Bars */}
      {bars.map((bar: any, idx: number) => {
        const h = (bar.value / maxVal) * chartHeight;
        const x = originX + idx * (barWidth + 8) + 6;
        const y = originY - h;

        return (
          <g key={`bar-${idx}`}>
            <rect x={x} y={y} width={barWidth} height={h} rx="3" fill={bar.color || '#3b82f6'} />
            <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" className="text-[10px] font-bold fill-blue-900">{bar.value}</text>
            <text x={x + barWidth / 2} y={originY + 16} textAnchor="middle" className="text-[10px] font-medium fill-slate-700">{bar.label}</text>
          </g>
        );
      })}

      <text x={originX + chartWidth / 2} y={originY + 34} textAnchor="middle" className="text-[11px] font-bold fill-slate-800">
        वर्ग अंतराल (Class Intervals)
      </text>
      <text x="25" y="32" className="text-[11px] font-bold fill-slate-800">
        बारंबारता (f)
      </text>
    </svg>
  );
}
