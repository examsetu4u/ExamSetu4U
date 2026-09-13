import React from 'react';
import type { DiagramData } from '@/types/diagram';

interface SvgDiagramProps {
  data?: DiagramData;
  caption?: string;
  className?: string;
}

/**
 * Bohr Atomic Model Renderer (Nucleus + Electron Shells K, L, M)
 */
export function BohrModelRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  const element = data.dimensions?.element || data.title || 'Sodium (Na)';
  const atomicNumber = data.dimensions?.atomicNumber ? Number(data.dimensions.atomicNumber) : 11;
  const config = data.dimensions?.configuration || [2, 8, 1]; // K=2, L=8, M=1

  const cx = 200;
  const cy = 135;
  const shellRadii = [45, 75, 105];
  const shellNames = ['K', 'L', 'M'];

  return (
    <svg viewBox="0 0 420 280" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Bohr Atomic Model'}>
      <rect x="15" y="15" width="390" height="250" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Concentric Shells */}
      {config.map((_count: number, sIdx: number) => {
        const r = shellRadii[sIdx] || (40 + sIdx * 30);
        return (
          <g key={`shell-${sIdx}`}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x={cx + r - 8} y={cy - 6} className="text-[10px] font-bold fill-slate-500">{shellNames[sIdx]} कोश</text>
          </g>
        );
      })}

      {/* Central Nucleus */}
      <circle cx={cx} cy={cy} r="24" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
      <text x={cx} y={cy - 4} textAnchor="middle" className="text-[10px] font-black fill-red-800">p⁺ = {atomicNumber}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" className="text-[10px] font-bold fill-slate-700">नाभिक</text>

      {/* Electrons on each shell */}
      {config.map((electronCount: number, sIdx: number) => {
        const r = shellRadii[sIdx] || (40 + sIdx * 30);
        return Array.from({ length: electronCount }).map((_, eIdx) => {
          const angle = (2 * Math.PI / electronCount) * eIdx - Math.PI / 2;
          const ex = cx + r * Math.cos(angle);
          const ey = cy + r * Math.sin(angle);

          return (
            <circle key={`e-${sIdx}-${eIdx}`} cx={ex} cy={ey} r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.2" />
          );
        });
      })}

      {/* Top Left Title Badge */}
      <g transform="translate(30, 30)">
        <rect x="0" y="0" width="130" height="24" rx="4" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
        <text x="65" y="16" textAnchor="middle" className="text-[11px] font-bold fill-blue-900">{element}</text>
      </g>

      {/* Bottom Summary */}
      <text x="200" y="262" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
        इलेक्ट्रॉनिक विन्यास (Config): <tspan className="font-bold fill-blue-800">{config.join(', ')}</tspan> | संयोजी इलेक्ट्रॉन = <tspan className="font-bold fill-red-700">{config[config.length - 1]}</tspan>
      </text>
    </svg>
  );
}

/**
 * Electrolysis of Water (जल का विद्युत अपघटन)
 */
export function ElectrolysisWaterRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  return (
    <svg viewBox="0 0 420 280" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Electrolysis of Water'}>
      <rect x="15" y="15" width="390" height="250" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      <g transform="translate(10, 0)">
        {/* Transparent Beaker */}
        <rect x="90" y="70" width="220" height="130" rx="6" fill="#eff6ff" fillOpacity="0.7" stroke="#3b82f6" strokeWidth="2.5" />
        {/* Acidulated water level */}
        <rect x="92" y="100" width="216" height="98" fill="#dbeafe" fillOpacity="0.5" />
        <text x="98" y="116" className="text-[9px] font-semibold fill-blue-800">तनु H₂SO₄ युक्त जल</text>

        {/* Cathode (-) Test Tube at left (x: 130 to 160) */}
        <rect x="135" y="45" width="30" height="135" rx="10" fill="#ffffff" fillOpacity="0.8" stroke="#64748b" strokeWidth="2" />
        {/* Carbon electrode */}
        <rect x="145" y="110" width="10" height="70" fill="#334155" />
        {/* Hydrogen gas pocket at top (larger: 2 volumes) */}
        <rect x="136" y="46" width="28" height="42" fill="#fed7aa" fillOpacity="0.6" />
        <text x="150" y="70" textAnchor="middle" className="text-[11px] font-extrabold fill-orange-950">H₂</text>
        <text x="150" y="82" textAnchor="middle" className="text-[8px] font-bold fill-orange-900">(2 आयतन)</text>

        {/* Anode (+) Test Tube at right (x: 210 to 240) */}
        <rect x="235" y="45" width="30" height="135" rx="10" fill="#ffffff" fillOpacity="0.8" stroke="#64748b" strokeWidth="2" />
        {/* Carbon electrode */}
        <rect x="245" y="110" width="10" height="70" fill="#334155" />
        {/* Oxygen gas pocket at top (smaller: 1 volume) */}
        <rect x="236" y="46" width="28" height="22" fill="#bbf7d0" fillOpacity="0.6" />
        <text x="250" y="60" textAnchor="middle" className="text-[11px] font-extrabold fill-emerald-950">O₂</text>
        <text x="250" y="70" textAnchor="middle" className="text-[8px] font-bold fill-emerald-900">(1 आयतन)</text>

        {/* Electrodes Labels */}
        <text x="120" y="195" textAnchor="middle" className="text-[10px] font-bold fill-blue-800">कैथोड (-)</text>
        <text x="280" y="195" textAnchor="middle" className="text-[10px] font-bold fill-red-700">एनोड (+)</text>

        {/* Battery Connection below beaker */}
        <line x1="150" y1="180" x2="150" y2="230" stroke="#334155" strokeWidth="2" />
        <line x1="150" y1="230" x2="190" y2="230" stroke="#334155" strokeWidth="2" />

        <line x1="250" y1="180" x2="250" y2="230" stroke="#334155" strokeWidth="2" />
        <line x1="250" y1="230" x2="210" y2="230" stroke="#334155" strokeWidth="2" />

        {/* Battery */}
        <line x1="190" y1="222" x2="190" y2="238" stroke="#334155" strokeWidth="3" />
        <line x1="210" y1="218" x2="210" y2="242" stroke="#dc2626" strokeWidth="3" />
        <text x="180" y="228" className="text-[10px] font-bold fill-slate-800">-</text>
        <text x="215" y="228" className="text-[10px] font-bold fill-red-700">+</text>
        <text x="200" y="250" textAnchor="middle" className="text-[10px] font-bold fill-slate-700">6V बैटरी</text>

        {/* Chemical Equation */}
        <text x="200" y="268" textAnchor="middle" className="text-[11px] font-semibold fill-slate-800">
          2H₂O(l) → <tspan className="font-bold fill-orange-700">2H₂(g)</tspan> [कैथोड पर] + <tspan className="font-bold fill-emerald-700">O₂(g)</tspan> [एनोड पर] | H₂ : O₂ = <tspan className="font-bold fill-blue-800">2 : 1</tspan>
        </text>
      </g>
    </svg>
  );
}

/**
 * Chemical Displacement Reaction (Iron Nail in Copper Sulphate)
 */
export function DisplacementReactionRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  return (
    <svg viewBox="0 0 420 280" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Chemical Reaction Setup'}>
      <rect x="15" y="15" width="390" height="250" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Test Tube 1: Before Reaction (Blue CuSO4) */}
      <g transform="translate(60, 30)">
        <rect x="25" y="20" width="32" height="130" rx="14" fill="#ffffff" stroke="#64748b" strokeWidth="2" />
        {/* Blue Liquid CuSO4 */}
        <rect x="26" y="55" width="30" height="93" rx="10" fill="#38bdf8" fillOpacity="0.7" />
        {/* Clean Iron Nail */}
        <line x1="41" y1="40" x2="41" y2="125" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
        <circle cx="41" cy="40" r="4" fill="#475569" />

        <text x="41" y="170" textAnchor="middle" className="text-[10px] font-bold fill-sky-800">CuSO₄ विलयन (नीला)</text>
        <text x="41" y="185" textAnchor="middle" className="text-[9px] font-semibold fill-slate-600">+ लोहे की कील (Fe)</text>
        <text x="41" y="200" textAnchor="middle" className="text-[10px] font-extrabold fill-slate-700">(अभिक्रिया से पूर्व)</text>
      </g>

      {/* Reaction Arrow */}
      <g transform="translate(195, 100)">
        <line x1="0" y1="0" x2="30" y2="0" stroke="#dc2626" strokeWidth="2.5" />
        <path d="M 25 -4 L 33 0 L 25 4 Z" fill="#dc2626" />
        <text x="15" y="-8" textAnchor="middle" className="text-[9px] font-bold fill-red-700">विस्थापन</text>
      </g>

      {/* Test Tube 2: After Reaction (Light Green FeSO4 + Brown deposit nail) */}
      <g transform="translate(260, 30)">
        <rect x="25" y="20" width="32" height="130" rx="14" fill="#ffffff" stroke="#64748b" strokeWidth="2" />
        {/* Light Green Liquid FeSO4 */}
        <rect x="26" y="55" width="30" height="93" rx="10" fill="#86efac" fillOpacity="0.7" />
        {/* Iron nail with reddish-brown copper coating */}
        <line x1="41" y1="40" x2="41" y2="125" stroke="#b45309" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="41" cy="40" r="4" fill="#b45309" />

        <text x="41" y="170" textAnchor="middle" className="text-[10px] font-bold fill-emerald-800">FeSO₄ विलयन (हल्का हरा)</text>
        <text x="41" y="185" textAnchor="middle" className="text-[9px] font-semibold fill-amber-900">+ भूरे रंग की कॉपर परत</text>
        <text x="41" y="200" textAnchor="middle" className="text-[10px] font-extrabold fill-emerald-700">(अभिक्रिया के पश्चात)</text>
      </g>

      {/* Chemical Equation Bottom */}
      <text x="210" y="260" textAnchor="middle" className="text-[11px] font-semibold fill-slate-800">
        Fe(s) + <tspan className="font-bold fill-sky-700">CuSO₄(aq)</tspan> → <tspan className="font-bold fill-emerald-700">FeSO₄(aq)</tspan> + <tspan className="font-bold fill-amber-700">Cu(s)</tspan>
      </text>
    </svg>
  );
}
