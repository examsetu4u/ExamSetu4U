import React from 'react';
import type { DiagramData } from '@/types/diagram';

interface SvgDiagramProps {
  data?: DiagramData;
  caption?: string;
  className?: string;
}

/**
 * Standard Triangle & Right Triangle SVG Renderer
 */
export function TriangleRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  const isRight = data.type === 'rightTriangle' || Boolean(data.isRightAngle) || Boolean(data.angles?.some(a => String(a.value).includes('90')));
  const isEquilateral = data.type === 'equilateralTriangle' || Boolean(data.isEquilateral);
  const isIsosceles = data.type === 'isoscelesTriangle' || Boolean(data.isIsosceles);

  // Labels
  const vA = data.labels?.[0] ? (typeof data.labels[0] === 'string' ? data.labels[0] : data.labels[0].text) : 'A';
  const vB = data.labels?.[1] ? (typeof data.labels[1] === 'string' ? data.labels[1] : data.labels[1].text) : 'B';
  const vC = data.labels?.[2] ? (typeof data.labels[2] === 'string' ? data.labels[2] : data.labels[2].text) : 'C';

  // Dimensions
  const baseLabel = data.dimensions?.base ? `${data.dimensions.base}` : (data.sides?.find(s => s.from === 'B' && s.to === 'C')?.label || data.sides?.[0]?.label || '');
  const heightLabel = data.dimensions?.height ? `${data.dimensions.height}` : (data.sides?.find(s => s.from === 'A' && s.to === 'B')?.label || data.sides?.[1]?.label || '');
  const hypLabel = data.dimensions?.hypotenuse ? `${data.dimensions.hypotenuse}` : (data.sides?.find(s => s.from === 'A' && s.to === 'C')?.label || data.sides?.[2]?.label || '');
  
  // Angle at A, B, C
  const angleA = data.angles?.find(a => a.vertex === 'A')?.label || (isEquilateral ? '60°' : '');
  const angleB = data.angles?.find(a => a.vertex === 'B')?.label || (isRight ? '90°' : isEquilateral ? '60°' : '');
  const angleC = data.angles?.find(a => a.vertex === 'C')?.label || (isEquilateral ? '60°' : '');

  // Coordinates
  // B is at bottom-left (80, 240), C is at bottom-right (320, 240)
  // If right-angled at B: A is at top-left (80, 70)
  // If equilateral or general: A is at (200, 60)
  const ax = isRight ? 90 : (isIsosceles ? 200 : 180);
  const ay = 60;
  const bx = 90;
  const by = 240;
  const cx = 330;
  const cy = 240;

  return (
    <svg viewBox="0 0 420 300" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Triangle Diagram'}>
      <defs>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
        </filter>
        <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Grid background subtle */}
      <rect x="15" y="15" width="390" height="270" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Triangle Body */}
      <polygon
        points={`${ax},${ay} ${bx},${by} ${cx},${cy}`}
        fill="url(#triGrad)"
        stroke="#1e40af"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter="url(#shadow)"
      />

      {/* Right angle marker at B */}
      {isRight && (
        <path
          d={`M ${bx} ${by - 24} L ${bx + 24} ${by - 24} L ${bx + 24} ${by}`}
          fill="none"
          stroke="#dc2626"
          strokeWidth="2"
        />
      )}

      {/* Equal side ticks for isosceles / equilateral */}
      {isEquilateral && (
        <>
          {/* AB tick */}
          <line x1={(ax + bx)/2 - 5} y1={(ay + by)/2 - 3} x2={(ax + bx)/2 + 5} y2={(ay + by)/2 + 3} stroke="#1e40af" strokeWidth="2" />
          {/* BC tick */}
          <line x1={(bx + cx)/2} y1={(by + cy)/2 - 6} x2={(bx + cx)/2} y2={(by + cy)/2 + 6} stroke="#1e40af" strokeWidth="2" />
          {/* AC tick */}
          <line x1={(ax + cx)/2 - 5} y1={(ay + cy)/2 + 3} x2={(ax + cx)/2 + 5} y2={(ay + cy)/2 - 3} stroke="#1e40af" strokeWidth="2" />
        </>
      )}

      {isIsosceles && !isEquilateral && (
        <>
          {/* AB tick */}
          <line x1={(ax + bx)/2 - 5} y1={(ay + by)/2 - 3} x2={(ax + bx)/2 + 5} y2={(ay + by)/2 + 3} stroke="#dc2626" strokeWidth="2" />
          {/* AC tick */}
          <line x1={(ax + cx)/2 - 5} y1={(ay + cy)/2 + 3} x2={(ax + cx)/2 + 5} y2={(ay + cy)/2 - 3} stroke="#dc2626" strokeWidth="2" />
        </>
      )}

      {/* Angle Arcs */}
      {!isRight && (
        <path d={`M ${bx + 28} ${by} A 28 28 0 0 0 ${bx + 18} ${by - 24}`} fill="none" stroke="#dc2626" strokeWidth="1.5" />
      )}
      <path d={`M ${cx - 28} ${cy} A 28 28 0 0 1 ${cx - 18} ${cy - 20}`} fill="none" stroke="#2563eb" strokeWidth="1.5" />

      {/* Vertex Labels */}
      <circle cx={ax} cy={ay} r="4" fill="#1e40af" />
      <text x={ax} y={ay - 14} textAnchor="middle" className="text-[15px] font-extrabold fill-slate-900">{vA}</text>

      <circle cx={bx} cy={by} r="4" fill="#1e40af" />
      <text x={bx - 16} y={by + 16} textAnchor="middle" className="text-[15px] font-extrabold fill-slate-900">{vB}</text>

      <circle cx={cx} cy={cy} r="4" fill="#1e40af" />
      <text x={cx + 16} y={by + 16} textAnchor="middle" className="text-[15px] font-extrabold fill-slate-900">{vC}</text>

      {/* Dimensions & Side Labels */}
      {baseLabel && (
        <g>
          <rect x={(bx + cx)/2 - 35} y={by + 18} width="70" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <text x={(bx + cx)/2} y={by + 33} textAnchor="middle" className="text-[12px] font-bold fill-blue-800">
            {baseLabel}
          </text>
        </g>
      )}

      {heightLabel && (
        <g>
          <rect x={isRight ? bx - 60 : (ax + bx)/2 - 45} y={(ay + by)/2 - 10} width="60" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <text x={isRight ? bx - 30 : (ax + bx)/2 - 15} y={(ay + by)/2 + 4} textAnchor="middle" className="text-[12px] font-bold fill-blue-800">
            {heightLabel}
          </text>
        </g>
      )}

      {hypLabel && (
        <g>
          <rect x={(ax + cx)/2 + 10} y={(ay + cy)/2 - 10} width="65" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          <text x={(ax + cx)/2 + 42} y={(ay + cy)/2 + 4} textAnchor="middle" className="text-[12px] font-bold fill-rose-700">
            {hypLabel}
          </text>
        </g>
      )}

      {/* Angle text */}
      {angleB && isRight && (
        <text x={bx + 30} y={by - 8} className="text-[11px] font-extrabold fill-red-600">90°</text>
      )}
      {angleC && (
        <text x={cx - 48} y={cy - 8} className="text-[11px] font-bold fill-blue-700">{angleC}</text>
      )}
      {angleA && (
        <text x={ax + 4} y={ay + 28} className="text-[11px] font-bold fill-blue-700">{angleA}</text>
      )}
    </svg>
  );
}

/**
 * Quadrilaterals Renderer: Square, Rectangle, Parallelogram, Rhombus, Trapezium, Kite
 */
export function QuadrilateralRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  const quadType = (data.type || 'quadrilateral').toLowerCase();
  
  const isSquare = quadType.includes('square');
  const isRect = quadType.includes('rectangle');
  const isParallelogram = quadType.includes('parallelogram');
  const isRhombus = quadType.includes('rhombus');
  const isTrapezium = quadType.includes('trapezium') || quadType.includes('trapezoid');
  const isKite = quadType.includes('kite');

  // Labels A, B, C, D
  const vA = data.labels?.[0] ? (typeof data.labels[0] === 'string' ? data.labels[0] : data.labels[0].text) : 'A';
  const vB = data.labels?.[1] ? (typeof data.labels[1] === 'string' ? data.labels[1] : data.labels[1].text) : 'B';
  const vC = data.labels?.[2] ? (typeof data.labels[2] === 'string' ? data.labels[2] : data.labels[2].text) : 'C';
  const vD = data.labels?.[3] ? (typeof data.labels[3] === 'string' ? data.labels[3] : data.labels[3].text) : 'D';

  // Points setup
  let pA = [100, 80];
  let pB = [320, 80];
  let pC = [320, 230];
  let pD = [100, 230];

  if (isSquare) {
    pA = [135, 75];
    pB = [285, 75];
    pC = [285, 225];
    pD = [135, 225];
  } else if (isParallelogram) {
    pA = [130, 80];
    pB = [340, 80];
    pC = [290, 230];
    pD = [80, 230];
  } else if (isRhombus) {
    pA = [210, 60];
    pB = [330, 155];
    pC = [210, 250];
    pD = [90, 155];
  } else if (isTrapezium) {
    pA = [140, 80];
    pB = [280, 80];
    pC = [350, 230];
    pD = [70, 230];
  } else if (isKite) {
    pA = [210, 50];
    pB = [320, 130];
    pC = [210, 260];
    pD = [100, 130];
  }

  const lengthLabel = data.dimensions?.length || data.dimensions?.base || '';
  const widthLabel = data.dimensions?.width || data.dimensions?.height || data.dimensions?.side || '';

  return (
    <svg viewBox="0 0 420 300" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Quadrilateral Diagram'}>
      <rect x="15" y="15" width="390" height="270" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Diagonal for rhombus/parallelogram if requested */}
      {(isRhombus || data.showDiagonals) && (
        <>
          <line x1={pA[0]} y1={pA[1]} x2={pC[0]} y2={pC[1]} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1={pB[0]} y1={pB[1]} x2={pD[0]} y2={pD[1]} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
        </>
      )}

      {/* Polygon */}
      <polygon
        points={`${pA[0]},${pA[1]} ${pB[0]},${pB[1]} ${pC[0]},${pC[1]} ${pD[0]},${pD[1]}`}
        fill="#3b82f6"
        fillOpacity="0.1"
        stroke="#1d4ed8"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Parallel arrows for parallelogram or trapezium */}
      {(isParallelogram || isTrapezium) && (
        <>
          {/* Top arrow */}
          <path d={`M ${(pA[0]+pB[0])/2 - 5} ${pA[1]-4} L ${(pA[0]+pB[0])/2 + 4} ${pA[1]} L ${(pA[0]+pB[0])/2 - 5} ${pA[1]+4}`} fill="none" stroke="#2563eb" strokeWidth="2" />
          {/* Bottom arrow */}
          <path d={`M ${(pD[0]+pC[0])/2 - 5} ${pD[1]-4} L ${(pD[0]+pC[0])/2 + 4} ${pD[1]} L ${(pD[0]+pC[0])/2 - 5} ${pD[1]+4}`} fill="none" stroke="#2563eb" strokeWidth="2" />
        </>
      )}

      {/* Right angle markers for Square / Rectangle */}
      {(isSquare || isRect) && (
        <>
          <rect x={pD[0]} y={pD[1] - 16} width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="1.5" />
          <rect x={pC[0] - 16} y={pC[1] - 16} width="16" height="16" fill="none" stroke="#dc2626" strokeWidth="1.5" />
        </>
      )}

      {/* Vertex Dots & Labels */}
      <circle cx={pA[0]} cy={pA[1]} r="4" fill="#1e40af" />
      <text x={pA[0] - 12} y={pA[1] - 10} className="text-[14px] font-extrabold fill-slate-900">{vA}</text>

      <circle cx={pB[0]} cy={pB[1]} r="4" fill="#1e40af" />
      <text x={pB[0] + 10} y={pB[1] - 10} className="text-[14px] font-extrabold fill-slate-900">{vB}</text>

      <circle cx={pC[0]} cy={pC[1]} r="4" fill="#1e40af" />
      <text x={pC[0] + 10} y={pC[1] + 16} className="text-[14px] font-extrabold fill-slate-900">{vC}</text>

      <circle cx={pD[0]} cy={pD[1]} r="4" fill="#1e40af" />
      <text x={pD[0] - 12} y={pD[1] + 16} className="text-[14px] font-extrabold fill-slate-900">{vD}</text>

      {/* Dimensions text */}
      {lengthLabel && (
        <text x={(pD[0] + pC[0]) / 2} y={pD[1] + 32} textAnchor="middle" className="text-[12px] font-bold fill-blue-800">
          {lengthLabel}
        </text>
      )}
      {widthLabel && (
        <text x={pC[0] + 25} y={(pB[1] + pC[1]) / 2} textAnchor="start" className="text-[12px] font-bold fill-blue-800">
          {widthLabel}
        </text>
      )}
    </svg>
  );
}

/**
 * Parallel Lines and Transversal with Alternate / Corresponding Angles
 */
export function ParallelLinesRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  const line1Label = data.labels?.[0] || 'm';
  const line2Label = data.labels?.[1] || 'n';
  const transLabel = data.labels?.[2] || 'l (तिर्यक रेखा)';

  return (
    <svg viewBox="0 0 420 280" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Parallel Lines & Transversal'}>
      <rect x="15" y="15" width="390" height="250" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Line 1 (Top parallel line) */}
      <line x1="40" y1="90" x2="380" y2="90" stroke="#1e40af" strokeWidth="2.5" markerEnd="url(#arrow)" />
      <path d="M 370 86 L 380 90 L 370 94" fill="#1e40af" />
      <path d="M 50 86 L 40 90 L 50 94" fill="#1e40af" />
      <text x="385" y="94" className="text-[13px] font-bold fill-blue-900">{typeof line1Label === 'string' ? line1Label : line1Label.text}</text>

      {/* Line 2 (Bottom parallel line) */}
      <line x1="40" y1="190" x2="380" y2="190" stroke="#1e40af" strokeWidth="2.5" />
      <path d="M 370 186 L 380 190 L 370 194" fill="#1e40af" />
      <path d="M 50 186 L 40 190 L 50 194" fill="#1e40af" />
      <text x="385" y="194" className="text-[13px] font-bold fill-blue-900">{typeof line2Label === 'string' ? line2Label : line2Label.text}</text>

      {/* Transversal Line */}
      <line x1="140" y1="35" x2="280" y2="245" stroke="#dc2626" strokeWidth="2.5" />
      <path d="M 148 48 L 140 35 L 133 46" fill="#dc2626" />
      <path d="M 272 232 L 280 245 L 287 234" fill="#dc2626" />
      <text x="120" y="38" className="text-[12px] font-bold fill-red-700">{typeof transLabel === 'string' ? transLabel : transLabel.text}</text>

      {/* Angle Arcs at Intersection 1 (177, 90) */}
      <circle cx="177" cy="90" r="3.5" fill="#1e40af" />
      {/* Angle 1 (Top right) */}
      <path d="M 202 90 A 25 25 0 0 0 193 70" fill="none" stroke="#2563eb" strokeWidth="1.5" />
      <text x="195" y="80" className="text-[11px] font-bold fill-blue-700">∠1</text>

      {/* Angle 2 (Top left) */}
      <text x="152" y="80" className="text-[11px] font-bold fill-slate-700">∠2</text>

      {/* Angle 3 (Bottom left - interior) */}
      <path d="M 152 90 A 25 25 0 0 0 162 110" fill="none" stroke="#16a34a" strokeWidth="1.5" />
      <text x="152" y="112" className="text-[11px] font-bold fill-emerald-700">∠3</text>

      {/* Angle 4 (Bottom right - interior) */}
      <path d="M 192 112 A 25 25 0 0 0 202 90" fill="none" stroke="#d97706" strokeWidth="1.5" />
      <text x="190" y="112" className="text-[11px] font-bold fill-amber-700">∠4</text>

      {/* Angle Arcs at Intersection 2 (243, 190) */}
      <circle cx="243" cy="190" r="3.5" fill="#1e40af" />
      {/* Angle 5 (Top right - interior alternate to 3) */}
      <path d="M 268 190 A 25 25 0 0 0 259 170" fill="none" stroke="#d97706" strokeWidth="1.5" />
      <text x="256" y="180" className="text-[11px] font-bold fill-amber-700">∠5</text>

      {/* Angle 6 (Top left - interior alternate to 4) */}
      <path d="M 228 170 A 25 25 0 0 0 218 190" fill="none" stroke="#16a34a" strokeWidth="1.5" />
      <text x="218" y="180" className="text-[11px] font-bold fill-emerald-700">∠6</text>

      {/* Angle 7 */}
      <text x="218" y="212" className="text-[11px] font-bold fill-slate-700">∠7</text>
      {/* Angle 8 */}
      <text x="256" y="212" className="text-[11px] font-bold fill-blue-700">∠8</text>

      {/* Bottom Summary Legend */}
      <g transform="translate(40, 245)">
        <text x="0" y="12" className="text-[11px] font-semibold fill-slate-600">
          • एकांतर अंतः कोण (Alternate Interior): <tspan className="font-bold fill-emerald-700">∠3 = ∠6</tspan>, <tspan className="font-bold fill-amber-700">∠4 = ∠5</tspan>
        </text>
      </g>
    </svg>
  );
}
