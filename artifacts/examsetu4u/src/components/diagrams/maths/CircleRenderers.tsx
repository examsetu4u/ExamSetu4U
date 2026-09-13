import React from 'react';
import type { DiagramData } from '@/types/diagram';

interface SvgDiagramProps {
  data?: DiagramData;
  caption?: string;
  className?: string;
}

/**
 * Circle with Center, Radius, Chord, Tangent, and Secant
 */
export function CircleRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  const type = (data.type || 'circle').toLowerCase();
  const isTangent = type.includes('tangent');
  const isChord = type.includes('chord');
  const isSector = type.includes('sector');
  const isSemicircle = type.includes('semicircle');

  const radiusVal = data.dimensions?.radius || 'r';
  const angleTheta = data.dimensions?.angle || data.angles?.[0]?.value || 'θ';

  const cx = 200;
  const cy = 145;
  const r = 90;

  return (
    <svg viewBox="0 0 420 290" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Circle Diagram'}>
      <defs>
        <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="sectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <rect x="15" y="15" width="390" height="260" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Semicircle mode */}
      {isSemicircle ? (
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`}
          fill="url(#circleGrad)"
          stroke="#1e40af"
          strokeWidth="2.5"
        />
      ) : isSector ? (
        <>
          {/* Main circle faint */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" />
          {/* Shaded Sector (60 deg: from -30 deg to 30 deg or 0 to 60 deg) */}
          <path
            d={`M ${cx} ${cy} L ${cx + r * Math.cos(-Math.PI/6)} ${cy + r * Math.sin(-Math.PI/6)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(Math.PI/4)} ${cy + r * Math.sin(Math.PI/4)} Z`}
            fill="url(#sectorGrad)"
            stroke="#d97706"
            strokeWidth="2"
          />
          {/* Angle theta arc */}
          <path
            d={`M ${cx + 35 * Math.cos(-Math.PI/6)} ${cy + 35 * Math.sin(-Math.PI/6)} A 35 35 0 0 1 ${cx + 35 * Math.cos(Math.PI/4)} ${cy + 35 * Math.sin(Math.PI/4)}`}
            fill="none"
            stroke="#b45309"
            strokeWidth="2"
          />
          <text x={cx + 42} y={cy + 5} className="text-[13px] font-extrabold fill-amber-800">{String(angleTheta)}</text>
        </>
      ) : (
        /* Standard Full Circle */
        <circle cx={cx} cy={cy} r={r} fill="url(#circleGrad)" stroke="#1e40af" strokeWidth="2.5" />
      )}

      {/* Center Point O */}
      <circle cx={cx} cy={cy} r="4" fill="#dc2626" />
      <text x={cx - 14} y={cy - 8} className="text-[14px] font-extrabold fill-slate-900">O</text>

      {/* Radius OA */}
      {!isTangent && (
        <>
          <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#dc2626" strokeWidth="2" />
          <circle cx={cx + r} cy={cy} r="3.5" fill="#1e40af" />
          <text x={cx + r + 8} y={cy + 5} className="text-[13px] font-bold fill-slate-900">A</text>
          <text x={cx + r / 2} y={cy - 8} textAnchor="middle" className="text-[12px] font-bold fill-red-700">
            r = {String(radiusVal)}
          </text>
        </>
      )}

      {/* Tangent Line with 90 deg radius indicator */}
      {isTangent && (
        <>
          {/* Tangent line at bottom (cy + r) */}
          <line x1="50" y1={cy + r} x2="350" y2={cy + r} stroke="#16a34a" strokeWidth="2.5" />
          <path d={`M 45 ${cy + r} L 55 ${cy + r - 4} L 55 ${cy + r + 4} Z`} fill="#16a34a" />
          <path d={`M 355 ${cy + r} L 345 ${cy + r - 4} L 345 ${cy + r + 4} Z`} fill="#16a34a" />

          {/* Radius to point of contact P */}
          <line x1={cx} y1={cy} x2={cx} y2={cy + r} stroke="#dc2626" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx={cx} cy={cy + r} r="4" fill="#16a34a" />

          {/* 90 degree square at point of contact */}
          <rect x={cx} y={cy + r - 15} width="15" height="15" fill="none" stroke="#dc2626" strokeWidth="1.5" />

          {/* Labels */}
          <text x={cx + 8} y={cy + r / 2} className="text-[12px] font-bold fill-red-700">Radius (r)</text>
          <text x={cx - 18} y={cy + r + 18} className="text-[13px] font-extrabold fill-slate-900">P (स्पर्श बिंदु)</text>
          <text x="310" y={cy + r - 8} className="text-[12px] font-bold fill-emerald-800">Tangent (स्पर्श रेखा)</text>
          <text x={cx} y={cy + r + 32} textAnchor="middle" className="text-[11px] font-bold fill-slate-600">
            प्रमेय: स्पर्श बिंदु पर खींची गई त्रिज्या स्पर्श रेखा पर लंब होती है (OP ⊥ Tangent)
          </text>
        </>
      )}

      {/* Chord AB */}
      {isChord && (
        <>
          <line x1={cx - 70} y1={cy + 45} x2={cx + 70} y2={cy + 45} stroke="#2563eb" strokeWidth="2.5" />
          <circle cx={cx - 70} cy={cy + 45} r="3.5" fill="#1e40af" />
          <text x={cx - 86} y={cy + 50} className="text-[13px] font-extrabold fill-slate-900">A</text>
          <circle cx={cx + 70} cy={cy + 45} r="3.5" fill="#1e40af" />
          <text x={cx + 80} y={cy + 50} className="text-[13px] font-extrabold fill-slate-900">B</text>

          {/* Perpendicular from center to chord */}
          <line x1={cx} y1={cy} x2={cx} y2={cy + 45} stroke="#dc2626" strokeWidth="1.5" strokeDasharray="3 3" />
          <rect x={cx} y={cy + 33} width="12" height="12" fill="none" stroke="#dc2626" strokeWidth="1.5" />
          <circle cx={cx} cy={cy + 45} r="3" fill="#dc2626" />
          <text x={cx + 6} y={cy + 42} className="text-[12px] font-bold fill-slate-900">M</text>
          <text x={cx + 8} y={cy + 25} className="text-[11px] font-bold fill-red-700">OM ⊥ AB</text>
          <text x="210" y={cy + 65} textAnchor="middle" className="text-[11px] font-bold fill-blue-700">जीवा (Chord AB)</text>
        </>
      )}

      {/* Sector Arc length label */}
      {isSector && (
        <text x="210" y="260" textAnchor="middle" className="text-[11px] font-bold fill-amber-900">
          त्रिज्यखंड का क्षेत्रफल (Area of Sector) = (θ / 360°) × πr²
        </text>
      )}
    </svg>
  );
}
