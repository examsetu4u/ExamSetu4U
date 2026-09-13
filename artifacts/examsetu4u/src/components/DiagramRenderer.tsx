import React, { useState } from 'react';
import type { DiagramRendererProps } from '@/types/diagram';
import {
  TriangleRenderer,
  QuadrilateralRenderer,
  ParallelLinesRenderer,
} from './diagrams/maths/GeometryRenderers';
import { CircleRenderer } from './diagrams/maths/CircleRenderers';
import {
  CoordinateGraphRenderer,
  NumberLineRenderer,
  StatisticsChartRenderer,
} from './diagrams/maths/GraphRenderers';
import { SolidsRenderer } from './diagrams/maths/SolidsRenderers';
import {
  OpticsRayRenderer,
  ElectricCircuitRenderer,
  MagnetismRenderer,
} from './diagrams/science/PhysicsRenderers';
import {
  CellDiagramRenderer,
  HumanEyeRenderer,
  NephronRenderer,
  NeuronRenderer,
} from './diagrams/science/BiologyRenderers';
import {
  BohrModelRenderer,
  ElectrolysisWaterRenderer,
  DisplacementReactionRenderer,
} from './diagrams/science/ChemistryRenderers';
import { ZoomIn, ZoomOut, Maximize2, X, RotateCcw } from 'lucide-react';

/**
 * Universal DiagramRenderer Component for ExamSetu4U
 * Supports structured SVG diagrams, high-resolution images, and interactive zoom.
 */
export const DiagramRenderer: React.FC<DiagramRendererProps> = ({
  type = 'triangle',
  data = {},
  caption,
  altText,
  imageUrl,
  className = '',
  showCaption = true,
  allowZoom = true,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  // Normalize diagram type
  const normalizedType = String(type || data?.type || '').toLowerCase().trim();

  // Pick the appropriate SVG renderer
  const renderDiagramContent = () => {
    // 1. If an image URL is explicitly provided, render high-res image
    if (imageUrl) {
      return (
        <div className="flex items-center justify-center p-2">
          <img
            src={imageUrl}
            alt={altText || caption || 'Exam Diagram'}
            className="max-w-full max-h-[340px] h-auto object-contain rounded-lg shadow-sm border border-slate-200"
            loading="lazy"
          />
        </div>
      );
    }

    // 2. Geometry - Triangles
    if (
      normalizedType.includes('triangle') ||
      normalizedType === 'righttriangle' ||
      normalizedType === 'equilateraltriangle' ||
      normalizedType === 'isoscelestriangle'
    ) {
      return <TriangleRenderer data={data} caption={caption} />;
    }

    // 3. Geometry - Quadrilaterals (Square, Rect, Rhombus, Parallelogram, Trapezium)
    if (
      normalizedType.includes('quadrilateral') ||
      normalizedType.includes('parallelogram') ||
      normalizedType.includes('rhombus') ||
      normalizedType.includes('trapezium') ||
      normalizedType.includes('trapezoid') ||
      normalizedType.includes('square') ||
      normalizedType.includes('rectangle') ||
      normalizedType.includes('kite')
    ) {
      return <QuadrilateralRenderer data={data} caption={caption} />;
    }

    // 4. Lines & Angles
    if (
      normalizedType.includes('parallelline') ||
      normalizedType.includes('transversal') ||
      normalizedType.includes('angle')
    ) {
      return <ParallelLinesRenderer data={data} caption={caption} />;
    }

    // 5. Circles, Tangents, Chords, Sectors
    if (
      normalizedType.includes('circle') ||
      normalizedType.includes('tangent') ||
      normalizedType.includes('chord') ||
      normalizedType.includes('sector') ||
      normalizedType.includes('semicircle')
    ) {
      return <CircleRenderer data={data} caption={caption} />;
    }

    // 6. Graphs & Coordinate Geometry
    if (
      normalizedType.includes('coordinate') ||
      normalizedType.includes('axes') ||
      normalizedType.includes('parabola') ||
      normalizedType.includes('linegraph')
    ) {
      return <CoordinateGraphRenderer data={data} caption={caption} />;
    }

    if (normalizedType.includes('numberline')) {
      return <NumberLineRenderer data={data} caption={caption} />;
    }

    if (
      normalizedType.includes('bargraph') ||
      normalizedType.includes('histogram') ||
      normalizedType.includes('statistics')
    ) {
      return <StatisticsChartRenderer data={data} caption={caption} />;
    }

    // 7. 3D Solids & Mensuration
    if (
      normalizedType.includes('cylinder') ||
      normalizedType.includes('cone') ||
      normalizedType.includes('sphere') ||
      normalizedType.includes('hemisphere') ||
      normalizedType.includes('cube') ||
      normalizedType.includes('cuboid') ||
      normalizedType.includes('mensuration')
    ) {
      return <SolidsRenderer data={data} caption={caption} />;
    }

    // 8. Physics: Optics Ray Diagrams
    if (
      normalizedType.includes('raydiagram') ||
      normalizedType.includes('concavemirror') ||
      normalizedType.includes('convexmirror') ||
      normalizedType.includes('convexlens') ||
      normalizedType.includes('concavelens') ||
      normalizedType.includes('lens') ||
      normalizedType.includes('mirror') ||
      normalizedType.includes('refraction') ||
      normalizedType.includes('reflection') ||
      normalizedType.includes('glassslab')
    ) {
      return <OpticsRayRenderer data={data} caption={caption} />;
    }

    // 9. Physics: Electric Circuits
    if (
      normalizedType.includes('circuit') ||
      normalizedType.includes('resistor') ||
      normalizedType.includes('electric')
    ) {
      return <ElectricCircuitRenderer data={data} caption={caption} />;
    }

    // 10. Physics: Magnetism
    if (
      normalizedType.includes('magnet') ||
      normalizedType.includes('solenoid') ||
      normalizedType.includes('magnetic')
    ) {
      return <MagnetismRenderer data={data} caption={caption} />;
    }

    // 11. Biology: Cells
    if (normalizedType.includes('cell') || normalizedType.includes('plantcell') || normalizedType.includes('animalcell')) {
      return <CellDiagramRenderer data={data} caption={caption} />;
    }

    // 12. Biology: Human Eye
    if (normalizedType.includes('eye') || normalizedType.includes('cornea') || normalizedType.includes('retina')) {
      return <HumanEyeRenderer data={data} caption={caption} />;
    }

    // 13. Biology: Nephron
    if (normalizedType.includes('nephron') || normalizedType.includes('kidney') || normalizedType.includes('bowman')) {
      return <NephronRenderer data={data} caption={caption} />;
    }

    // 14. Biology: Neuron
    if (normalizedType.includes('neuron') || normalizedType.includes('nerve') || normalizedType.includes('axon')) {
      return <NeuronRenderer data={data} caption={caption} />;
    }

    // 15. Chemistry: Bohr Model
    if (
      normalizedType.includes('bohr') ||
      normalizedType.includes('atom') ||
      normalizedType.includes('electronicconfig')
    ) {
      return <BohrModelRenderer data={data} caption={caption} />;
    }

    // 16. Chemistry: Electrolysis
    if (normalizedType.includes('electrolysis') || normalizedType.includes('water')) {
      return <ElectrolysisWaterRenderer data={data} caption={caption} />;
    }

    // 17. Chemistry: Displacement Reaction
    if (
      normalizedType.includes('displacement') ||
      normalizedType.includes('reaction') ||
      normalizedType.includes('laboratory')
    ) {
      return <DisplacementReactionRenderer data={data} caption={caption} />;
    }

    // Default fallback: Render Triangle with provided or default data
    return <TriangleRenderer data={data} caption={caption} />;
  };

  const finalCaption = caption || data?.title || '';

  return (
    <div
      id="diagram-container"
      className={`my-3 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-all hover:shadow-md ${className}`}
    >
      {/* Top Toolbar (Controls for students) */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-600">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
          आरेख (Diagram)
        </span>

        {allowZoom && (
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.75}
              title="Zoom Out"
              aria-label="Zoom Out"
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 text-slate-600 transition"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-medium px-1 text-slate-500">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2.5}
              title="Zoom In"
              aria-label="Zoom In"
              className="p-1 rounded hover:bg-slate-200 disabled:opacity-40 text-slate-600 transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 1 && (
              <button
                type="button"
                onClick={handleResetZoom}
                title="Reset Zoom"
                aria-label="Reset Zoom"
                className="p-1 rounded hover:bg-slate-200 text-slate-600 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              title="Fullscreen View"
              aria-label="Fullscreen View"
              className="p-1 ml-1 rounded hover:bg-slate-200 text-slate-600 transition"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Diagram Area with smooth zoom */}
      <div className="relative overflow-x-auto p-2 sm:p-3 flex items-center justify-center bg-slate-50/40">
        <div
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.15s ease-out',
          }}
          className="w-full flex items-center justify-center"
        >
          {renderDiagramContent()}
        </div>
      </div>

      {/* Diagram Caption */}
      {showCaption && finalCaption && (
        <div className="border-t border-slate-100 bg-white px-3 py-2 text-center text-xs font-medium text-slate-600">
          {finalCaption}
        </div>
      )}

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {finalCaption || 'आरेख दृश्य (Diagram View)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition"
                aria-label="Close Fullscreen"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center p-2 max-h-[70vh] overflow-auto">
              {renderDiagramContent()}
            </div>

            {altText && (
              <p className="mt-3 text-xs text-slate-500 text-center italic border-t border-slate-100 pt-2">
                {altText}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagramRenderer;
