import React from 'react';
import type { DiagramData } from '@/types/diagram';

interface SvgDiagramProps {
  data?: DiagramData;
  caption?: string;
  className?: string;
}

/**
 * Optics Ray Diagram: Concave Mirror, Convex Mirror, Convex Lens, Refraction
 */
export function OpticsRayRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  const type = (data.type || 'concavemirror').toLowerCase();

  const isConcaveMirror = type.includes('concavemirror') || type.includes('अवतल दर्पण');
  const isConvexMirror = type.includes('convexmirror') || type.includes('उत्तल दर्पण');
  const isConvexLens = type.includes('convexlens') || type.includes('उत्तल लेंस');
  const isConcaveLens = type.includes('concavelens') || type.includes('अवतल लेंस');
  const isRefraction = type.includes('refraction') || type.includes('अपवर्तन') || type.includes('glassslab');

  return (
    <svg viewBox="0 0 420 280" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Optics Ray Diagram'}>
      <defs>
        <marker id="rayArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#dc2626" />
        </marker>
        <marker id="rayArrowBlue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb" />
        </marker>
      </defs>

      <rect x="15" y="15" width="390" height="250" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Case 1: Concave Mirror Ray Diagram */}
      {(isConcaveMirror || (!isConvexMirror && !isConvexLens && !isConcaveLens && !isRefraction)) && (
        <g transform="translate(10, 0)">
          {/* Principal Axis */}
          <line x1="20" y1="140" x2="380" y2="140" stroke="#334155" strokeWidth="1.8" />
          <text x="382" y="144" className="text-[11px] font-bold fill-slate-700">मुख्य अक्ष</text>

          {/* Concave Mirror Arc */}
          <path d="M 330 40 A 180 180 0 0 0 330 240" fill="none" stroke="#1e40af" strokeWidth="3.5" />
          {/* Silvering marks on the back */}
          {[60, 80, 100, 120, 140, 160, 180, 200, 220].map((y) => (
            <line key={`tick-${y}`} x1="334" y1={y - 5} x2="344" y2={y - 12} stroke="#94a3b8" strokeWidth="1.5" />
          ))}

          {/* Points: Pole P (330, 140), Focus F (240, 140), Centre C (150, 140) */}
          <circle cx="330" cy="140" r="3.5" fill="#dc2626" />
          <text x="335" y="156" className="text-[12px] font-extrabold fill-slate-900">P (ध्रुव)</text>

          <circle cx="240" cy="140" r="3.5" fill="#dc2626" />
          <text x="236" y="158" className="text-[12px] font-extrabold fill-blue-900">F (फोकस)</text>

          <circle cx="150" cy="140" r="3.5" fill="#dc2626" />
          <text x="142" y="158" className="text-[12px] font-extrabold fill-blue-900">C (वक्रता केंद्र)</text>

          {/* Object AB (placed between C and F at x=195, height=55) */}
          <line x1="195" y1="140" x2="195" y2="85" stroke="#16a34a" strokeWidth="3" markerEnd="url(#rayArrow)" />
          <circle cx="195" cy="85" r="3" fill="#16a34a" />
          <text x="190" y="78" className="text-[12px] font-bold fill-emerald-800">A</text>
          <text x="190" y="156" className="text-[12px] font-bold fill-emerald-800">B (बिंब)</text>

          {/* Ray 1: Parallel to axis, passes through Focus F */}
          <line x1="195" y1="85" x2="330" y2="85" stroke="#dc2626" strokeWidth="1.8" />
          <path d="M 260 81 L 268 85 L 260 89" fill="#dc2626" />
          {/* Reflected ray from mirror through F */}
          <line x1="330" y1="85" x2="90" y2="231" stroke="#dc2626" strokeWidth="1.8" />
          <path d="M 230 142 L 222 147 L 228 153" fill="#dc2626" />

          {/* Ray 2: Passing through Focus F, reflects parallel to axis */}
          <line x1="195" y1="85" x2="310" y2="225" stroke="#2563eb" strokeWidth="1.8" />
          <path d="M 240 137 L 246 144 L 240 148" fill="#2563eb" />
          {/* Reflected parallel ray */}
          <line x1="310" y1="225" x2="50" y2="225" stroke="#2563eb" strokeWidth="1.8" />
          <path d="M 160 221 L 150 225 L 160 229" fill="#2563eb" />

          {/* Real Inverted Image A'B' at x=100 (Beyond C) */}
          <line x1="100" y1="140" x2="100" y2="225" stroke="#dc2626" strokeWidth="2.5" />
          <circle cx="100" cy="225" r="3" fill="#dc2626" />
          <text x="92" y="240" className="text-[12px] font-bold fill-red-700">A' (प्रतिबिंब)</text>
          <text x="95" y="134" className="text-[12px] font-bold fill-red-700">B'</text>

          {/* Description */}
          <text x="200" y="268" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
            अवतल दर्पण: बिंब C और F के बीच स्थित होने पर प्रतिबिंब <tspan className="font-bold fill-red-700">C से परे, वास्तविक और उल्टा</tspan> बनता है।
          </text>
        </g>
      )}

      {/* Case 2: Convex Lens Ray Diagram */}
      {isConvexLens && (
        <g transform="translate(10, 0)">
          {/* Principal Axis */}
          <line x1="20" y1="140" x2="380" y2="140" stroke="#334155" strokeWidth="1.8" />

          {/* Double Convex Lens */}
          <path d="M 200 40 Q 225 140 200 240 Q 175 140 200 40 Z" fill="#bfdbfe" fillOpacity="0.5" stroke="#1d4ed8" strokeWidth="2.5" />

          {/* Optical Center O */}
          <circle cx="200" cy="140" r="3.5" fill="#dc2626" />
          <text x="196" y="156" className="text-[12px] font-extrabold fill-slate-900">O</text>

          {/* Focus Points: F1(130), 2F1(60), F2(270), 2F2(340) */}
          <circle cx="130" cy="140" r="3" fill="#1e40af" />
          <text x="124" y="156" className="text-[11px] font-bold fill-blue-900">F₁</text>
          <circle cx="60" cy="140" r="3" fill="#1e40af" />
          <text x="52" y="156" className="text-[11px] font-bold fill-blue-900">2F₁</text>

          <circle cx="270" cy="140" r="3" fill="#1e40af" />
          <text x="264" y="156" className="text-[11px] font-bold fill-blue-900">F₂</text>
          <circle cx="340" cy="140" r="3" fill="#1e40af" />
          <text x="332" y="156" className="text-[11px] font-bold fill-blue-900">2F₂</text>

          {/* Object at 2F1 (x=60, height=45) */}
          <line x1="60" y1="140" x2="60" y2="95" stroke="#16a34a" strokeWidth="3" />
          <circle cx="60" cy="95" r="3" fill="#16a34a" />
          <text x="55" y="88" className="text-[11px] font-bold fill-emerald-800">A</text>
          <text x="55" y="135" className="text-[11px] font-bold fill-emerald-800">B</text>

          {/* Ray 1: Parallel to axis, refracts through F2 */}
          <line x1="60" y1="95" x2="200" y2="95" stroke="#dc2626" strokeWidth="1.8" />
          <line x1="200" y1="95" x2="340" y2="185" stroke="#dc2626" strokeWidth="1.8" />

          {/* Ray 2: Passing straight through optical center O */}
          <line x1="60" y1="95" x2="340" y2="185" stroke="#2563eb" strokeWidth="1.8" />

          {/* Real Inverted Image at 2F2 (x=340, height=45 downward) */}
          <line x1="340" y1="140" x2="340" y2="185" stroke="#dc2626" strokeWidth="2.5" />
          <circle cx="340" cy="185" r="3" fill="#dc2626" />
          <text x="345" y="190" className="text-[11px] font-bold fill-red-700">A'</text>
          <text x="345" y="135" className="text-[11px] font-bold fill-red-700">B'</text>

          <text x="200" y="268" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
            उत्तल लेंस: बिंब 2F₁ पर होने पर प्रतिबिंब <tspan className="font-bold fill-blue-800">2F₂ पर, समान आकार, वास्तविक एवं उल्टा</tspan> बनता है।
          </text>
        </g>
      )}

      {/* Case 3: Refraction through Glass Slab */}
      {isRefraction && (
        <g transform="translate(10, 0)">
          {/* Glass Slab */}
          <rect x="80" y="80" width="240" height="95" rx="4" fill="#bfdbfe" fillOpacity="0.4" stroke="#1d4ed8" strokeWidth="2" />
          <text x="90" y="100" className="text-[11px] font-bold fill-blue-800">कांच की सिल्ली (Glass Slab - सघन माध्यम)</text>
          <text x="90" y="55" className="text-[11px] font-bold fill-slate-600">वायु (Air - विरल माध्यम)</text>
          <text x="90" y="205" className="text-[11px] font-bold fill-slate-600">वायु (Air)</text>

          {/* Normal 1 at top surface (x=160) */}
          <line x1="160" y1="40" x2="160" y2="130" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="165" y="50" className="text-[10px] font-bold fill-slate-500">N₁</text>

          {/* Incident Ray in Air */}
          <line x1="80" y1="35" x2="160" y2="80" stroke="#dc2626" strokeWidth="2" />
          <path d="M 120 54 L 128 58 L 122 64" fill="#dc2626" />
          <text x="135" y="70" className="text-[11px] font-bold fill-red-700">∠i (आपतन कोण)</text>

          {/* Refracted Ray in Glass (bends towards normal) */}
          <line x1="160" y1="80" x2="220" y2="175" stroke="#2563eb" strokeWidth="2" />
          <text x="175" y="105" className="text-[10px] font-bold fill-blue-700">∠r</text>

          {/* Normal 2 at bottom surface (x=220) */}
          <line x1="220" y1="125" x2="220" y2="225" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="225" y="220" className="text-[10px] font-bold fill-slate-500">N₂</text>

          {/* Emergent Ray in Air (bends away from normal, parallel to incident) */}
          <line x1="220" y1="175" x2="300" y2="220" stroke="#16a34a" strokeWidth="2" />
          <text x="235" y="200" className="text-[11px] font-bold fill-emerald-700">∠e (निर्गत कोण)</text>

          {/* Lateral displacement line */}
          <line x1="160" y1="80" x2="270" y2="142" stroke="#dc2626" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="270" y1="142" x2="340" y2="181" stroke="#dc2626" strokeWidth="1" strokeDasharray="3 3" />

          <text x="200" y="260" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
            स्नेल का नियम: <tspan className="font-bold fill-blue-800">sin i / sin r = स्थिरांक (अपवर्तनांक μ)</tspan> | ∠i = ∠e
          </text>
        </g>
      )}
    </svg>
  );
}

/**
 * Electric Circuit Schematic Renderer (Simple, Series, Parallel)
 */
export function ElectricCircuitRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  const type = (data.type || 'electriccircuit').toLowerCase();
  const isSeries = type.includes('series') || type.includes('श्रेणी');
  const isParallel = type.includes('parallel') || type.includes('समांतर');

  const vVal = data.dimensions?.voltage || '6V';
  const r1 = data.dimensions?.r1 || 'R₁';
  const r2 = data.dimensions?.r2 || 'R₂';
  const r3 = data.dimensions?.r3 || 'R₃';

  return (
    <svg viewBox="0 0 420 280" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Electric Circuit Diagram'}>
      <rect x="15" y="15" width="390" height="250" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Standard Series Circuit */}
      {(isSeries || (!isParallel && !isSeries)) && (
        <g transform="translate(10, 0)">
          {/* Main rectangular wire */}
          <path d="M 60 70 L 340 70 L 340 210 L 60 210 Z" fill="none" stroke="#334155" strokeWidth="2.5" />

          {/* Battery at bottom: (180, 210) */}
          <rect x="175" y="200" width="40" height="20" fill="#f8fafc" />
          {/* Long line (+) */}
          <line x1="185" y1="195" x2="185" y2="225" stroke="#dc2626" strokeWidth="3" />
          <text x="175" y="195" className="text-[12px] font-extrabold fill-red-700">+</text>
          {/* Short thick line (-) */}
          <line x1="195" y1="202" x2="195" y2="218" stroke="#1e293b" strokeWidth="4" />
          {/* Second cell */}
          <line x1="205" y1="195" x2="205" y2="225" stroke="#dc2626" strokeWidth="3" />
          <line x1="215" y1="202" x2="215" y2="218" stroke="#1e293b" strokeWidth="4" />
          <text x="220" y="195" className="text-[12px] font-extrabold fill-slate-800">-</text>
          <text x="200" y="242" textAnchor="middle" className="text-[11px] font-bold fill-slate-700">बैटरी ({vVal})</text>

          {/* Key / Switch at bottom-left */}
          <rect x="95" y="200" width="30" height="20" fill="#f8fafc" />
          <circle cx="102" cy="210" r="3" fill="#334155" />
          <line x1="102" y1="210" x2="118" y2="200" stroke="#334155" strokeWidth="2.5" />
          <circle cx="120" cy="210" r="3" fill="#334155" />
          <text x="110" y="240" textAnchor="middle" className="text-[11px] font-bold fill-slate-700">कुंजी (K)</text>

          {/* Current direction arrow */}
          <path d="M 60 135 L 56 145 L 64 145 Z" fill="#dc2626" />
          <text x="40" y="145" className="text-[11px] font-bold fill-red-700">I →</text>

          {/* Ammeter at right wire */}
          <rect x="325" y="125" width="30" height="30" fill="#f8fafc" />
          <circle cx="340" cy="140" r="14" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
          <text x="340" y="145" textAnchor="middle" className="text-[12px] font-extrabold fill-blue-800">A</text>
          <text x="362" y="145" className="text-[10px] font-bold fill-blue-700">एमीटर</text>

          {/* Resistors in Series at top: R1, R2, R3 */}
          {/* R1 */}
          <rect x="90" y="60" width="55" height="20" fill="#f8fafc" />
          <path d="M 90 70 L 97 62 L 105 78 L 113 62 L 121 78 L 129 62 L 137 78 L 145 70" fill="none" stroke="#2563eb" strokeWidth="2.5" />
          <text x="117" y="55" textAnchor="middle" className="text-[11px] font-bold fill-blue-900">{r1}</text>

          {/* R2 */}
          <rect x="170" y="60" width="55" height="20" fill="#f8fafc" />
          <path d="M 170 70 L 177 62 L 185 78 L 193 62 L 201 78 L 209 62 L 217 78 L 225 70" fill="none" stroke="#2563eb" strokeWidth="2.5" />
          <text x="197" y="55" textAnchor="middle" className="text-[11px] font-bold fill-blue-900">{r2}</text>

          {/* R3 */}
          <rect x="250" y="60" width="55" height="20" fill="#f8fafc" />
          <path d="M 250 70 L 257 62 L 265 78 L 273 62 L 281 78 L 289 62 L 297 78 L 305 70" fill="none" stroke="#2563eb" strokeWidth="2.5" />
          <text x="277" y="55" textAnchor="middle" className="text-[11px] font-bold fill-blue-900">{r3}</text>

          {/* Formula */}
          <text x="200" y="268" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
            श्रेणीक्रम में तुल्य प्रतिरोध (Equivalent Resistance): <tspan className="font-bold fill-blue-800">R_eq = R₁ + R₂ + R₃</tspan>
          </text>
        </g>
      )}

      {/* Case 2: Parallel Circuit */}
      {isParallel && (
        <g transform="translate(10, 0)">
          {/* Main rectangular wire */}
          <path d="M 70 60 L 130 60" fill="none" stroke="#334155" strokeWidth="2.5" />
          <path d="M 270 60 L 330 60 L 330 210 L 70 210 L 70 60" fill="none" stroke="#334155" strokeWidth="2.5" />

          {/* 3 Parallel branches at x=130 to x=270 */}
          {/* Branch 1 (y=60) */}
          <path d="M 130 60 L 150 60 L 158 52 L 166 68 L 174 52 L 182 68 L 190 52 L 198 68 L 206 60 L 270 60" fill="none" stroke="#2563eb" strokeWidth="2" />
          <text x="178" y="46" textAnchor="middle" className="text-[11px] font-bold fill-blue-900">{r1}</text>

          {/* Branch 2 (y=100) */}
          <line x1="130" y1="60" x2="130" y2="140" stroke="#334155" strokeWidth="2.5" />
          <line x1="270" y1="60" x2="270" y2="140" stroke="#334155" strokeWidth="2.5" />
          <path d="M 130 100 L 150 100 L 158 92 L 166 108 L 174 92 L 182 108 L 190 92 L 198 108 L 206 100 L 270 100" fill="none" stroke="#2563eb" strokeWidth="2" />
          <text x="178" y="86" textAnchor="middle" className="text-[11px] font-bold fill-blue-900">{r2}</text>

          {/* Branch 3 (y=140) */}
          <path d="M 130 140 L 150 140 L 158 132 L 166 148 L 174 132 L 182 148 L 190 132 L 198 148 L 206 140 L 270 140" fill="none" stroke="#2563eb" strokeWidth="2" />
          <text x="178" y="126" textAnchor="middle" className="text-[11px] font-bold fill-blue-900">{r3}</text>

          {/* Battery at bottom */}
          <rect x="175" y="200" width="40" height="20" fill="#f8fafc" />
          <line x1="185" y1="195" x2="185" y2="225" stroke="#dc2626" strokeWidth="3" />
          <line x1="195" y1="202" x2="195" y2="218" stroke="#1e293b" strokeWidth="4" />
          <line x1="205" y1="195" x2="205" y2="225" stroke="#dc2626" strokeWidth="3" />
          <line x1="215" y1="202" x2="215" y2="218" stroke="#1e293b" strokeWidth="4" />
          <text x="200" y="242" textAnchor="middle" className="text-[11px] font-bold fill-slate-700">बैटरी ({vVal})</text>

          <text x="200" y="268" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
            समांतर क्रम में: <tspan className="font-bold fill-blue-800">1/R_eq = 1/R₁ + 1/R₂ + 1/R₃</tspan> | विभवांतर (V) समान रहता है
          </text>
        </g>
      )}
    </svg>
  );
}

/**
 * Magnetism & Magnetic Field Lines Renderer
 */
export function MagnetismRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  return (
    <svg viewBox="0 0 420 280" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Magnetic Field Lines'}>
      <rect x="15" y="15" width="390" height="250" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Field Lines Top Looping */}
      <path d="M 170 120 C 170 40, 250 40, 250 120" fill="none" stroke="#2563eb" strokeWidth="1.8" />
      <path d="M 213 46 L 223 50 L 217 56" fill="#2563eb" />

      <path d="M 155 120 C 140 10, 280 10, 265 120" fill="none" stroke="#2563eb" strokeWidth="1.8" />
      <path d="M 213 16 L 223 20 L 217 26" fill="#2563eb" />

      {/* Field Lines Bottom Looping */}
      <path d="M 170 160 C 170 240, 250 240, 250 160" fill="none" stroke="#2563eb" strokeWidth="1.8" />
      <path d="M 213 234 L 223 230 L 217 224" fill="#2563eb" />

      <path d="M 155 160 C 140 270, 280 270, 265 160" fill="none" stroke="#2563eb" strokeWidth="1.8" />
      <path d="M 213 264 L 223 260 L 217 254" fill="#2563eb" />

      {/* Bar Magnet (Center: 140 to 280, y: 120 to 160) */}
      <g>
        {/* North Pole (Red) */}
        <rect x="140" y="120" width="70" height="40" rx="3" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
        <text x="175" y="146" textAnchor="middle" className="text-[16px] font-black fill-white">N</text>
        <text x="175" y="176" textAnchor="middle" className="text-[10px] font-bold fill-red-800">उत्तरी ध्रुव</text>

        {/* South Pole (Blue) */}
        <rect x="210" y="120" width="70" height="40" rx="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
        <text x="245" y="146" textAnchor="middle" className="text-[16px] font-black fill-white">S</text>
        <text x="245" y="176" textAnchor="middle" className="text-[10px] font-bold fill-blue-800">दक्षिणी ध्रुव</text>
      </g>

      {/* Field Lines exiting N and entering S */}
      <line x1="140" y1="130" x2="60" y2="100" stroke="#2563eb" strokeWidth="1.8" />
      <path d="M 95 110 L 85 107 L 90 118" fill="#2563eb" />

      <line x1="140" y1="150" x2="60" y2="180" stroke="#2563eb" strokeWidth="1.8" />
      <path d="M 95 170 L 85 173 L 90 162" fill="#2563eb" />

      <line x1="280" y1="130" x2="360" y2="100" stroke="#2563eb" strokeWidth="1.8" />
      <path d="M 315 115 L 325 112 L 320 123" fill="#2563eb" />

      <line x1="280" y1="150" x2="360" y2="180" stroke="#2563eb" strokeWidth="1.8" />
      <path d="M 315 165 L 325 168 L 320 157" fill="#2563eb" />

      <text x="210" y="270" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
        चुंबकीय क्षेत्र रेखाएं: <tspan className="font-bold fill-blue-800">चुंबक के बाहर N से S की ओर तथा अंदर S से N की ओर</tspan> बंद वक्र बनाती हैं।
      </text>
    </svg>
  );
}
