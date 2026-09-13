import React from 'react';
import type { DiagramData } from '@/types/diagram';

interface SvgDiagramProps {
  data?: DiagramData;
  caption?: string;
  className?: string;
}

/**
 * Plant & Animal Cell Diagram Renderer
 */
export function CellDiagramRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  const isPlant = (data.type || 'plantcell').toLowerCase().includes('plant') || String(data.title).includes('पादप');

  return (
    <svg viewBox="0 0 420 300" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || (isPlant ? 'Plant Cell' : 'Animal Cell')}>
      <rect x="15" y="15" width="390" height="270" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      {isPlant ? (
        /* Plant Cell */
        <g transform="translate(10, 0)">
          {/* Outer Cell Wall (Hexagonal / Rounded Rect) */}
          <rect x="50" y="40" width="220" height="190" rx="20" fill="#dcfce7" stroke="#15803d" strokeWidth="4" />
          {/* Inner Cell Membrane */}
          <rect x="58" y="48" width="204" height="174" rx="16" fill="#f0fdf4" stroke="#22c55e" strokeWidth="2" />

          {/* Large Central Vacuole */}
          <rect x="80" y="80" width="105" height="110" rx="18" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2" />
          <text x="132" y="140" textAnchor="middle" className="text-[11px] font-bold fill-sky-800">बड़ी रसधानी (Vacuole)</text>

          {/* Nucleus with Nucleolus (Shifted to side) */}
          <circle cx="215" cy="100" r="28" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />
          <circle cx="215" cy="100" r="10" fill="#be185d" />
          <line x1="243" y1="100" x2="285" y2="90" stroke="#db2777" strokeWidth="1.2" />
          <text x="290" y="94" className="text-[11px] font-bold fill-pink-900">केंद्रक (Nucleus)</text>

          {/* Chloroplasts (Green ovals) */}
          <ellipse cx="90" cy="65" rx="12" ry="7" fill="#22c55e" stroke="#15803d" strokeWidth="1.2" />
          <ellipse cx="230" cy="165" rx="12" ry="7" fill="#22c55e" stroke="#15803d" strokeWidth="1.2" />
          <line x1="242" y1="165" x2="285" y2="165" stroke="#15803d" strokeWidth="1.2" />
          <text x="290" y="168" className="text-[11px] font-bold fill-emerald-900">क्लोरोप्लास्ट (हरितलवक)</text>

          {/* Mitochondria (Orange oval) */}
          <ellipse cx="140" cy="205" rx="14" ry="8" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.2" />
          <line x1="154" y1="205" x2="285" y2="205" stroke="#ea580c" strokeWidth="1.2" />
          <text x="290" y="208" className="text-[11px] font-bold fill-orange-950">माइटोकॉन्ड्रिया</text>

          {/* Cell wall pointer */}
          <line x1="50" y1="60" x2="15" y2="50" stroke="#15803d" strokeWidth="1.2" />
          <text x="15" y="42" className="text-[11px] font-bold fill-emerald-900">कोशिका भित्ति (Cell Wall)</text>

          <text x="200" y="260" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
            पादप कोशिका (Plant Cell): <tspan className="font-bold fill-emerald-800">सेल्युलोज की कोशिका भित्ति और क्लोरोप्लास्ट</tspan> उपस्थित होते हैं।
          </text>
        </g>
      ) : (
        /* Animal Cell */
        <g transform="translate(10, 0)">
          {/* Cell Membrane (Irregular rounded circle) */}
          <ellipse cx="160" cy="135" rx="110" ry="90" fill="#fdf2f8" stroke="#db2777" strokeWidth="3" />

          {/* Central Nucleus */}
          <circle cx="160" cy="135" r="34" fill="#fbcfe8" stroke="#be185d" strokeWidth="2.5" />
          <circle cx="160" cy="135" r="12" fill="#9d174d" />
          <line x1="194" y1="135" x2="285" y2="135" stroke="#db2777" strokeWidth="1.2" />
          <text x="290" y="139" className="text-[11px] font-bold fill-pink-900">केंद्रक (Nucleus)</text>

          {/* Mitochondria */}
          <ellipse cx="110" cy="90" rx="16" ry="9" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.2" transform="rotate(-20 110 90)" />
          <ellipse cx="210" cy="190" rx="16" ry="9" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.2" transform="rotate(30 210 190)" />
          <line x1="226" y1="190" x2="285" y2="190" stroke="#ea580c" strokeWidth="1.2" />
          <text x="290" y="194" className="text-[11px] font-bold fill-orange-950">माइटोकॉन्ड्रिया (पावरहाउस)</text>

          {/* Cell Membrane pointer */}
          <line x1="270" y1="135" x2="285" y2="80" stroke="#db2777" strokeWidth="1.2" />
          <text x="290" y="84" className="text-[11px] font-bold fill-pink-900">कोशिका झिल्ली</text>

          <text x="200" y="260" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
            जंतु कोशिका (Animal Cell): <tspan className="font-bold fill-pink-900">कोशिका भित्ति अनुपस्थित</tspan>, छोटी रसधानियां एवं केंद्रक मध्य में।
          </text>
        </g>
      )}
    </svg>
  );
}

/**
 * Human Eye Schematic Diagram
 */
export function HumanEyeRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  return (
    <svg viewBox="0 0 420 280" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Human Eye Diagram'}>
      <rect x="15" y="15" width="390" height="250" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      <g transform="translate(10, 0)">
        {/* Eyeball Body */}
        <circle cx="170" cy="135" r="85" fill="#f1f5f9" stroke="#334155" strokeWidth="2.5" />
        {/* Bulging Cornea at front (left) */}
        <path d="M 115 78 A 70 70 0 0 0 115 192" fill="#e0f2fe" fillOpacity="0.5" stroke="#0284c7" strokeWidth="2.5" />

        {/* Crystalline Convex Lens */}
        <path d="M 125 105 Q 138 135 125 165 Q 112 135 125 105 Z" fill="#93c5fd" fillOpacity="0.8" stroke="#1d4ed8" strokeWidth="2" />

        {/* Ciliary Muscles holding lens */}
        <path d="M 125 90 L 125 105" stroke="#ef4444" strokeWidth="4" />
        <path d="M 125 165 L 125 180" stroke="#ef4444" strokeWidth="4" />

        {/* Iris & Pupil */}
        <line x1="112" y1="95" x2="118" y2="115" stroke="#78350f" strokeWidth="3.5" />
        <line x1="112" y1="175" x2="118" y2="155" stroke="#78350f" strokeWidth="3.5" />

        {/* Retina (Inner layer at back) */}
        <path d="M 170 55 A 80 80 0 0 1 250 135 A 80 80 0 0 1 170 215" fill="none" stroke="#f43f5e" strokeWidth="3" />

        {/* Optic Nerve exit at right */}
        <path d="M 252 125 L 290 120 L 290 150 L 252 145" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />

        {/* Pointers & Labels */}
        {/* Cornea */}
        <line x1="90" y1="135" x2="40" y2="90" stroke="#0284c7" strokeWidth="1.2" />
        <text x="35" y="85" className="text-[11px] font-bold fill-sky-900">कॉर्निया (स्वच्छ मंडल)</text>

        {/* Eye Lens */}
        <line x1="125" y1="105" x2="50" y2="55" stroke="#1d4ed8" strokeWidth="1.2" />
        <text x="45" y="50" className="text-[11px] font-bold fill-blue-900">नेत्र लेंस (उत्तल)</text>

        {/* Ciliary Muscles */}
        <line x1="125" y1="85" x2="160" y2="40" stroke="#ef4444" strokeWidth="1.2" />
        <text x="165" y="42" className="text-[11px] font-bold fill-red-800">पक्ष्माभी पेशियां (Ciliary Muscles)</text>

        {/* Retina */}
        <line x1="245" y1="90" x2="295" y2="70" stroke="#f43f5e" strokeWidth="1.2" />
        <text x="300" y="74" className="text-[11px] font-bold fill-rose-700">रेटिना (दृष्टिपटल - वास्तविक व उल्टा प्रतिबिंब)</text>

        {/* Optic Nerve */}
        <line x1="285" y1="135" x2="310" y2="135" stroke="#db2777" strokeWidth="1.2" />
        <text x="315" y="139" className="text-[11px] font-bold fill-pink-900">दृक तंत्रिका (Optic Nerve)</text>

        {/* Bottom Note */}
        <text x="200" y="260" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
          सामान्य नेत्र के लिए निकट बिंदु = <tspan className="font-bold fill-blue-800">25 cm</tspan> एवं दूर बिंदु = <tspan className="font-bold fill-blue-800">अनंत (Infinity)</tspan>
        </text>
      </g>
    </svg>
  );
}

/**
 * Human Nephron (Functional Unit of Kidney) Renderer
 */
export function NephronRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  return (
    <svg viewBox="0 0 420 280" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Nephron Diagram'}>
      <rect x="15" y="15" width="390" height="250" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      <g transform="translate(10, 0)">
        {/* Bowman's Capsule (Cup shape at top left: 100, 80) */}
        <path d="M 85 65 C 60 70, 60 110, 85 115 C 105 115, 115 100, 115 90 C 115 80, 105 65, 85 65 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="2.5" />
        {/* Glomerulus capillary tuft inside */}
        <circle cx="85" cy="90" r="14" fill="#fecaca" stroke="#dc2626" strokeWidth="2" strokeDasharray="3 2" />
        <line x1="60" y1="45" x2="75" y2="80" stroke="#dc2626" strokeWidth="2.5" />
        <line x1="85" y1="45" x2="92" y2="80" stroke="#dc2626" strokeWidth="2" />

        {/* Proximal Convoluted Tubule (PCT) looping */}
        <path d="M 105 110 Q 140 120 120 145 Q 160 150 145 180" fill="none" stroke="#2563eb" strokeWidth="3" />

        {/* Henle's Loop (Hairpin loop downward) */}
        <path d="M 145 180 L 145 220 A 15 15 0 0 0 175 220 L 175 160" fill="none" stroke="#2563eb" strokeWidth="3" />

        {/* Distal Convoluted Tubule (DCT) */}
        <path d="M 175 160 Q 195 130 215 150 Q 235 130 250 140" fill="none" stroke="#2563eb" strokeWidth="3" />

        {/* Collecting Duct (Straight vertical duct at right) */}
        <line x1="250" y1="60" x2="250" y2="235" stroke="#16a34a" strokeWidth="6" />

        {/* Labels & Pointers */}
        {/* Glomerulus */}
        <line x1="75" y1="80" x2="35" y2="70" stroke="#dc2626" strokeWidth="1.2" />
        <text x="30" y="65" className="text-[11px] font-bold fill-red-700">ग्लोमेरुलस (केशिका गुच्छ)</text>

        {/* Bowman's capsule */}
        <line x1="100" y1="70" x2="140" y2="40" stroke="#ea580c" strokeWidth="1.2" />
        <text x="145" y="44" className="text-[11px] font-bold fill-orange-950">बोमन संपुट (Bowman's Capsule)</text>

        {/* Henle's Loop */}
        <line x1="160" y1="225" x2="200" y2="245" stroke="#2563eb" strokeWidth="1.2" />
        <text x="205" y="248" className="text-[11px] font-bold fill-blue-900">हेनले का लूप (Henle's Loop)</text>

        {/* Collecting Duct */}
        <line x1="250" y1="100" x2="280" y2="100" stroke="#16a34a" strokeWidth="1.2" />
        <text x="285" y="104" className="text-[11px] font-bold fill-emerald-800">संग्राहक वाहिनी (Collecting Duct)</text>

        <text x="200" y="268" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
          नेफ्रॉन: वृक्क (Kidney) की संरचनात्मक एवं क्रियात्मक इकाई है जो मूत्र निर्माण करती है।
        </text>
      </g>
    </svg>
  );
}

/**
 * Neuron (Nerve Cell) Renderer
 */
export function NeuronRenderer({ data = {}, caption, className = '' }: SvgDiagramProps) {
  return (
    <svg viewBox="0 0 420 280" className={`w-full max-w-[420px] mx-auto select-none ${className}`} aria-label={caption || 'Neuron Diagram'}>
      <rect x="15" y="15" width="390" height="250" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />

      <g transform="translate(10, 0)">
        {/* Cell Body (Cyton) with star-like dendrites at left (x: 80, y: 130) */}
        {/* Dendrites branches */}
        <path d="M 80 130 L 40 85 M 80 130 L 30 130 M 80 130 L 45 175 M 80 130 L 70 70 M 80 130 L 75 190" stroke="#3b82f6" strokeWidth="2.5" />
        <path d="M 40 85 L 25 75 M 40 85 L 35 95 M 30 130 L 15 125 M 45 175 L 25 185" stroke="#3b82f6" strokeWidth="1.5" />

        {/* Cyton core */}
        <circle cx="80" cy="130" r="24" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="2.5" />
        {/* Nucleus */}
        <circle cx="80" cy="130" r="9" fill="#1e40af" />

        {/* Axon (Long nerve fiber from x:104 to x:300) */}
        <line x1="104" y1="130" x2="310" y2="130" stroke="#f59e0b" strokeWidth="4" />

        {/* Myelin Sheath segments along axon */}
        {[115, 160, 205, 250].map((x) => (
          <rect key={`myelin-${x}`} x={x} y="118" width="35" height="24" rx="6" fill="#fde68a" stroke="#d97706" strokeWidth="1.8" />
        ))}

        {/* Axon Terminals / Nerve Endings at right */}
        <path d="M 310 130 L 340 100 M 310 130 L 345 130 M 310 130 L 340 160" stroke="#3b82f6" strokeWidth="2.5" />
        <circle cx="340" cy="100" r="3.5" fill="#1d4ed8" />
        <circle cx="345" cy="130" r="3.5" fill="#1d4ed8" />
        <circle cx="340" cy="160" r="3.5" fill="#1d4ed8" />

        {/* Labels */}
        <text x="25" y="60" className="text-[11px] font-bold fill-blue-900">द्रुमाक्ष्य (Dendrite)</text>
        <text x="50" y="215" className="text-[11px] font-bold fill-blue-900">कोशिकाकाय (Cyton)</text>
        <text x="180" y="105" textAnchor="middle" className="text-[11px] font-bold fill-amber-800">मायलिन शीथ (Myelin Sheath)</text>
        <text x="205" y="160" textAnchor="middle" className="text-[11px] font-bold fill-slate-800">तंत्रिकाक्ष (Axon)</text>
        <text x="315" y="85" className="text-[11px] font-bold fill-blue-900">तंत्रिका का अंतिम सिरा (Nerve Ending)</text>

        <text x="200" y="260" textAnchor="middle" className="text-[11px] font-semibold fill-slate-700">
          सूचना का प्रवाह: <tspan className="font-bold fill-blue-800">Dendrite → Cyton → Axon → Synapse (सिनेप्स)</tspan>
        </text>
      </g>
    </svg>
  );
}
