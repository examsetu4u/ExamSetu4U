/**
 * Comprehensive Diagram System Types for ExamSetu4U
 * Supports Mathematics and Science Diagrams across MCQs, Notes, PYQs, and Theory.
 */

export type MathematicsDiagramType =
  // Triangles
  | 'triangle'
  | 'rightTriangle'
  | 'isoscelesTriangle'
  | 'equilateralTriangle'
  | 'scaleneTriangle'
  | 'similarTriangles'
  // Quadrilaterals & Polygons
  | 'quadrilateral'
  | 'square'
  | 'rectangle'
  | 'parallelogram'
  | 'rhombus'
  | 'trapezium'
  | 'kite'
  | 'polygon'
  // Angles & Lines
  | 'angle'
  | 'complementaryAngles'
  | 'supplementaryAngles'
  | 'parallelLines'
  | 'transversal'
  // Circles
  | 'circle'
  | 'circleWithCentre'
  | 'circleWithChord'
  | 'circleWithTangent'
  | 'circleWithSecant'
  | 'semicircle'
  | 'sector'
  // Coordinate Geometry & Graphs
  | 'coordinateAxes'
  | 'coordinateGraph'
  | 'lineGraph'
  | 'numberLine'
  | 'barGraph'
  | 'histogram'
  | 'pieChart'
  // 3D Solids & Mensuration
  | 'cube'
  | 'cuboid'
  | 'cylinder'
  | 'cone'
  | 'sphere'
  | 'hemisphere'
  | 'frustum'
  | 'prism'
  | 'pyramid'
  | 'mensurationShape';

export type SciencePhysicsDiagramType =
  | 'rayDiagram'
  | 'reflection'
  | 'refraction'
  | 'planeMirror'
  | 'concaveMirror'
  | 'convexMirror'
  | 'concaveLens'
  | 'convexLens'
  | 'lensRayDiagram'
  | 'prismDispersion'
  | 'glassSlabRefraction'
  | 'electricCircuit'
  | 'simpleCellCircuit'
  | 'seriesCircuit'
  | 'parallelCircuit'
  | 'resistanceCircuit'
  | 'resistor'
  | 'magneticField'
  | 'solenoid'
  | 'electromagnet'
  | 'motor'
  | 'generator'
  | 'domesticElectricCircuit';

export type ScienceBiologyDiagramType =
  | 'plantCell'
  | 'animalCell'
  | 'humanEye'
  | 'humanEar'
  | 'heart'
  | 'respiratorySystem'
  | 'digestiveSystem'
  | 'nephron'
  | 'brain'
  | 'neuron'
  | 'flower'
  | 'seed'
  | 'germination'
  | 'photosynthesis'
  | 'transpiration'
  | 'stomata'
  | 'foodChain'
  | 'foodWeb'
  | 'ecosystem'
  | 'chromosome'
  | 'dna'
  | 'mitosis'
  | 'meiosis';

export type ScienceChemistryDiagramType =
  | 'atom'
  | 'bohrModel'
  | 'electronicConfiguration'
  | 'molecule'
  | 'ionicBond'
  | 'covalentBond'
  | 'electrolysis'
  | 'displacementReaction'
  | 'chemicalReaction'
  | 'laboratorySetup'
  | 'phScale'
  | 'separationTechnique';

export type DiagramType =
  | MathematicsDiagramType
  | SciencePhysicsDiagramType
  | ScienceBiologyDiagramType
  | ScienceChemistryDiagramType
  | string;

export interface DiagramLabel {
  text: string;
  x?: number;
  y?: number;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center' | string;
  color?: string;
  subscript?: string;
  superscript?: string;
}

export interface DiagramPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
  filled?: boolean;
}

export interface DiagramData {
  title?: string;
  labels?: (string | DiagramLabel)[];
  points?: (DiagramPoint | [number, number])[];
  angles?: { vertex?: string; value?: number | string; label?: string; arcRadius?: number }[];
  sides?: { from?: string; to?: string; length?: number | string; label?: string }[];
  highlight?: string[];
  dimensions?: {
    base?: number | string;
    height?: number | string;
    length?: number | string;
    width?: number | string;
    radius?: number | string;
    angle?: number | string;
    [key: string]: any;
  };
  components?: string[];
  stages?: string[];
  steps?: { title: string; description?: string }[];
  showGrid?: boolean;
  showAxes?: boolean;
  theme?: 'light' | 'dark' | 'academic' | 'minimal';
  [key: string]: any;
}

export interface DiagramRendererProps {
  type?: DiagramType | string;
  data?: DiagramData | any;
  caption?: string;
  altText?: string;
  imageUrl?: string;
  className?: string;
  interactive?: boolean;
  responsive?: boolean;
  width?: number | string;
  height?: number | string;
  showCaption?: boolean;
  allowZoom?: boolean;
}

export interface DiagramDetectionResult {
  required: boolean;
  type?: DiagramType;
  confidence: number;
  reason?: string;
  extractedParameters?: Record<string, any>;
  suggestedData?: DiagramData;
}
