import React from 'react';
import { CircleRenderer } from './maths/CircleRenderers';
import { TriangleRenderer, QuadrilateralRenderer } from './maths/GeometryRenderers';
import { SolidsRenderer } from './maths/SolidsRenderers';
import { CoordinateGraphRenderer, NumberLineRenderer } from './maths/GraphRenderers';
import type { DiagramData, DiagramType } from '@/types/diagram';

interface AutoDiagramRendererProps {
  type?: DiagramType;
  data?: DiagramData;
  caption?: string;
  className?: string;
}

/**
 * Universal Auto-Diagram Component:
 * Automatically renders high-quality interactive SVG diagrams for Mathematics
 * (Triangles, Circles, Tangents, Cylinders, Cones, Spheres, Graphs, Quadrilaterals, etc.)
 * based on the question's detected type or data.
 */
export function AutoDiagramRenderer({
  type,
  data,
  caption,
  className = '',
}: AutoDiagramRendererProps) {
  const diagramType = (type || data?.type || '').toLowerCase().trim();

  // 1. Circles, Tangents, Chords, Sectors, Semicircles
  if (
    diagramType.includes('circle') ||
    diagramType.includes('tangent') ||
    diagramType.includes('chord') ||
    diagramType.includes('sector') ||
    diagramType.includes('semicircle') ||
    diagramType.includes('वृत्त') ||
    diagramType.includes('स्पर्श')
  ) {
    return <CircleRenderer data={data} caption={caption} className={className} />;
  }

  // 2. 3D Solids: Cylinder, Cone, Sphere, Cube, Cuboid
  if (
    diagramType.includes('cylinder') ||
    diagramType.includes('cone') ||
    diagramType.includes('sphere') ||
    diagramType.includes('hemisphere') ||
    diagramType.includes('cube') ||
    diagramType.includes('cuboid') ||
    diagramType.includes('बेलन') ||
    diagramType.includes('शंकु') ||
    diagramType.includes('गोला') ||
    diagramType.includes('घन')
  ) {
    return <SolidsRenderer data={data} caption={caption} className={className} />;
  }

  // 3. Quadrilaterals (Rectangle, Square, Parallelogram, Rhombus, Trapezium, Kite)
  if (
    diagramType.includes('quad') ||
    diagramType.includes('rectangle') ||
    diagramType.includes('square') ||
    diagramType.includes('parallelogram') ||
    diagramType.includes('rhombus') ||
    diagramType.includes('trapez') ||
    diagramType.includes('चतुर्भुज') ||
    diagramType.includes('आयत') ||
    diagramType.includes('वर्ग')
  ) {
    return <QuadrilateralRenderer data={data} caption={caption} className={className} />;
  }

  // 4. Coordinate Geometry / Graphs
  if (
    diagramType.includes('graph') ||
    diagramType.includes('coordinate') ||
    diagramType.includes('cartesian') ||
    diagramType.includes('आलेख')
  ) {
    return <CoordinateGraphRenderer data={data} caption={caption} className={className} />;
  }

  if (diagramType.includes('numberline') || diagramType.includes('संख्या रेखा')) {
    return <NumberLineRenderer data={data} caption={caption} className={className} />;
  }

  // 5. Default: Triangles, Polygons, and Geometry
  return <TriangleRenderer data={data} caption={caption} className={className} />;
}
