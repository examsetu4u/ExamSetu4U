import React from 'react';
import type { DiagramData } from '@/types/diagram';

interface SvgDiagramProps {
  data?: DiagramData;
  caption?: string;
  className?: string;
}

/**
 * 3D Solids / Mensuration Shapes (Cube, Cuboid, Cylinder, Cone, Sphere, Hemisphere)
 */
export function SolidsRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  const shape = (data.type || 'cylinder').toLowerCase();

  const isCylinder = shape.includes('cylinder') || shape.includes('बेलन');
  const isCone = shape.includes('cone') || shape.includes('शंकु');
  const isSphere = shape.includes('sphere') && !shape.includes('hemi') || shape.includes('गोला');
  const isHemisphere = shape.includes('hemisphere') || shape.includes('अर्धगोला');
  const isCube = shape.includes('cube') && !shape.includes('cuboid') || shape.includes('घन');
  const isCuboid = shape.includes('cuboid') || shape.includes('घनाभ');

  // Dimensions
  const radius = data.dimensions?.radius || 'r';
  const height = data.dimensions?.height || 'h';
  const slantHeight = data.dimensions?.slantHeight || 'l';
  const length = data.dimensions?.length || 'l';
  const width = data.dimensions?.width || 'b';

  return (
    <svg viewBox="0 0 420 290" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || '3D Solid Diagram'}>
      <defs>
        <linearGradient id="solidGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#e0f2fe" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      <rect x="15" y="15" width="390" height="260" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {/* Case 1: Cylinder */}
      {isCylinder && (
        <g transform="translate(130, 45)">
          {/* Cylinder Body */}
          <rect x="20" y="30" width="120" height="130" fill="url(#solidGrad)" />
          <line x1="20" y1="30" x2="20" y2="160" stroke="#1d4ed8" strokeWidth="2" />
          <line x1="140" y1="30" x2="140" y2="160" stroke="#1d4ed8" strokeWidth="2" />

          {/* Bottom Ellipse (Back dashed, Front solid) */}
          <path d="M 20 160 A 60 22 0 0 0 140 160" fill="none" stroke="#1d4ed8" strokeWidth="2" />
          <path d="M 20 160 A 60 22 0 0 1 140 160" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* Top Ellipse */}
          <ellipse cx="80" cy="30" rx="60" ry="22" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2" />

          {/* Radius line at top */}
          <line x1="80" y1="30" x2="140" y2="30" stroke="#dc2626" strokeWidth="2" />
          <circle cx="80" cy="30" r="3" fill="#dc2626" />
          <text x="105" y="24" className="text-[12px] font-bold fill-red-700">r = {String(radius)}</text>

          {/* Height Dimension line */}
          <line x1="165" y1="30" x2="165" y2="160" stroke="#1e40af" strokeWidth="1.5" />
          <path d="M 162 36 L 165 30 L 168 36" fill="#1e40af" />
          <path d="M 162 154 L 165 160 L 168 154" fill="#1e40af" />
          <text x="175" y="100" className="text-[12px] font-bold fill-blue-900">h = {String(height)}</text>

          {/* Formula summary */}
          <text x="80" y="205" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
            आयतन (Volume) = <tspan className="font-bold fill-blue-800">πr²h</tspan> | वक्र पृष्ठ = <tspan className="font-bold fill-blue-800">2πrh</tspan>
          </text>
        </g>
      )}

      {/* Case 2: Cone */}
      {isCone && (
        <g transform="translate(130, 45)">
          {/* Cone Body */}
          <path d="M 80 20 L 20 160 A 60 22 0 0 0 140 160 Z" fill="url(#solidGrad)" stroke="#1d4ed8" strokeWidth="2" />
          <path d="M 20 160 A 60 22 0 0 1 140 160" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* Height central dashed line */}
          <line x1="80" y1="20" x2="80" y2="160" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4 3" />
          <rect x="80" y="145" width="12" height="12" fill="none" stroke="#dc2626" strokeWidth="1.2" />

          {/* Radius line */}
          <line x1="80" y1="160" x2="140" y2="160" stroke="#dc2626" strokeWidth="2" />
          <circle cx="80" cy="160" r="3" fill="#dc2626" />
          <text x="105" y="152" className="text-[11px] font-bold fill-red-700">r = {String(radius)}</text>

          {/* Slant height label */}
          <text x="122" y="85" className="text-[12px] font-bold fill-blue-800">l = {String(slantHeight)}</text>
          <text x="50" y="95" className="text-[12px] font-bold fill-red-700">h = {String(height)}</text>

          {/* Vertex dot */}
          <circle cx="80" cy="20" r="3.5" fill="#1e40af" />
          <text x="75" y="12" className="text-[12px] font-extrabold fill-slate-900">A</text>

          <text x="80" y="205" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
            l = √(r² + h²) | आयतन = <tspan className="font-bold fill-blue-800">⅓ πr²h</tspan> | CSA = <tspan className="font-bold fill-blue-800">πrl</tspan>
          </text>
        </g>
      )}

      {/* Case 3: Sphere & Hemisphere */}
      {(isSphere || isHemisphere) && (
        <g transform="translate(140, 50)">
          {isHemisphere ? (
            <>
              {/* Hemisphere Dome */}
              <path d="M 10 90 A 65 65 0 0 1 140 90 Z" fill="url(#solidGrad)" stroke="#1d4ed8" strokeWidth="2" />
              <ellipse cx="75" cy="90" rx="65" ry="22" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2" />
              <line x1="75" y1="90" x2="140" y2="90" stroke="#dc2626" strokeWidth="2" />
              <circle cx="75" cy="90" r="3" fill="#dc2626" />
              <text x="100" y="84" className="text-[12px] font-bold fill-red-700">r = {String(radius)}</text>
              <text x="75" y="165" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
                अर्धगोला (Hemisphere): आयतन = <tspan className="font-bold fill-blue-800">⅔ πr³</tspan> | TSA = <tspan className="font-bold fill-blue-800">3πr²</tspan>
              </text>
            </>
          ) : (
            <>
              {/* Full Sphere */}
              <circle cx="75" cy="75" r="65" fill="url(#solidGrad)" stroke="#1d4ed8" strokeWidth="2" />
              <ellipse cx="75" cy="75" rx="65" ry="20" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="4 3" />
              <line x1="75" y1="75" x2="140" y2="75" stroke="#dc2626" strokeWidth="2" />
              <circle cx="75" cy="75" r="3" fill="#dc2626" />
              <text x="100" y="68" className="text-[12px] font-bold fill-red-700">r = {String(radius)}</text>
              <text x="75" y="170" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
                गोला (Sphere): आयतन = <tspan className="font-bold fill-blue-800">4/3 πr³</tspan> | पृष्ठीय क्षेत्रफल = <tspan className="font-bold fill-blue-800">4πr²</tspan>
              </text>
            </>
          )}
        </g>
      )}

      {/* Case 4: Cuboid & Cube */}
      {(isCuboid || isCube) && (
        <g transform="translate(100, 45)">
          {/* Front face */}
          <rect x="30" y="60" width="130" height="90" fill="#bfdbfe" fillOpacity="0.4" stroke="#1d4ed8" strokeWidth="2" />
          {/* Top face */}
          <polygon points="30,60 75,20 205,20 160,60" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2" />
          {/* Right face */}
          <polygon points="160,60 205,20 205,110 160,150" fill="#93c5fd" fillOpacity="0.6" stroke="#1d4ed8" strokeWidth="2" />

          {/* Hidden back edges */}
          <line x1="75" y1="20" x2="75" y2="110" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="30" y1="150" x2="75" y2="110" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1="75" y1="110" x2="205" y2="110" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* Dimensions */}
          <text x="95" y="170" textAnchor="middle" className="text-[12px] font-bold fill-blue-900">लंबाई (l) = {String(length)}</text>
          <text x="188" y="90" className="text-[12px] font-bold fill-blue-900">h = {String(height)}</text>
          <text x="145" y="35" className="text-[12px] font-bold fill-blue-900">चौड़ाई (b) = {String(width)}</text>

          <text x="115" y="200" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
            आयतन = <tspan className="font-bold fill-blue-800">l × b × h</tspan> | कुल पृष्ठीय क्षेत्रफल = <tspan className="font-bold fill-blue-800">2(lb + bh + hl)</tspan>
          </text>
        </g>
      )}
    </svg>
  );
}
