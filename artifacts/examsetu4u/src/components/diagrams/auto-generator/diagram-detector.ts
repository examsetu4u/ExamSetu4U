import type { DiagramType, DiagramData } from '@/types/diagram';

export interface DiagramDetectionResult {
  required: boolean;
  type?: DiagramType;
  caption?: string;
  altText?: string;
  data?: DiagramData;
  confidence: number;
  reason?: string;
}

/**
 * Intelligent detector that identifies questions/notes needing diagrams
 * and extracts geometric and scientific parameters automatically.
 */
export function detectDiagramRequirement(
  text: string,
  options?: {
    subjectId?: string;
    topicId?: string;
    explanation?: string;
  }
): DiagramDetectionResult {
  if (!text) {
    return { required: false, confidence: 0 };
  }

  const combined = `${text} ${options?.explanation || ''} ${options?.topicId || ''}`.toLowerCase();

  // 1. Right Triangle (समकोण त्रिभुज, कर्ण, लंब, आधार, पाइथागोरस)
  if (
    combined.includes('समकोण त्रिभुज') ||
    combined.includes('right triangle') ||
    combined.includes('right-angled') ||
    combined.includes('कर्ण') ||
    combined.includes('hypotenuse') ||
    (combined.includes('त्रिभुज') && (combined.includes('90°') || combined.includes('90 अंश') || combined.includes('लंबवत')))
  ) {
    // Extract base, height, hypotenuse if numbers exist
    const baseMatch = text.match(/आधार\s*[=:]?\s*(\d+(\.\d+)?)\s*(cm|सेमी|मी)?/i);
    const heightMatch = text.match(/(लंब|ऊंचाई|ऊँचाई)\s*[=:]?\s*(\d+(\.\d+)?)\s*(cm|सेमी|मी)?/i);
    const hypMatch = text.match(/कर्ण\s*[=:]?\s*(\d+(\.\d+)?)\s*(cm|सेमी|मी)?/i);

    return {
      required: true,
      type: 'rightTriangle',
      confidence: 0.95,
      reason: 'Right-angled triangle detected from keywords',
      caption: 'समकोण त्रिभुज (Right-Angled Triangle)',
      altText: 'Right triangle with base, perpendicular and hypotenuse',
      data: {
        type: 'rightTriangle',
        isRightAngle: true,
        dimensions: {
          base: baseMatch ? `${baseMatch[1]} ${baseMatch[3] || 'cm'}` : 'आधार (Base)',
          height: heightMatch ? `${heightMatch[2]} ${heightMatch[4] || 'cm'}` : 'लंब (Height)',
          hypotenuse: hypMatch ? `${hypMatch[1]} ${hypMatch[3] || 'cm'}` : 'कर्ण (Hypotenuse)',
        },
        labels: ['A', 'B', 'C'],
      },
    };
  }

  // 2. General Triangle (समबाहु, समद्विबाहु, त्रिभुज)
  if (
    combined.includes('समबाहु') ||
    combined.includes('equilateral') ||
    combined.includes('समद्विबाहु') ||
    combined.includes('isosceles') ||
    combined.includes('त्रिभुज abc') ||
    combined.includes('triangle abc')
  ) {
    const isEqui = combined.includes('समबाहु') || combined.includes('equilateral');
    return {
      required: true,
      type: isEqui ? 'equilateralTriangle' : 'isoscelesTriangle',
      confidence: 0.9,
      reason: 'Triangle shape detected',
      caption: isEqui ? 'समबाहु त्रिभुज (Equilateral Triangle)' : 'त्रिभुज (Triangle)',
      altText: 'Geometric triangle diagram',
      data: {
        type: isEqui ? 'equilateralTriangle' : 'isoscelesTriangle',
        isEquilateral: isEqui,
        labels: ['A', 'B', 'C'],
      },
    };
  }

  // 3. Circle & Tangents (वृत्त, स्पर्श रेखा, त्रिज्या, व्यास, त्रिज्यखंड)
  if (
    combined.includes('स्पर्श रेखा') ||
    combined.includes('tangent') ||
    combined.includes('स्पर्श बिंदु') ||
    combined.includes('point of contact')
  ) {
    return {
      required: true,
      type: 'circleWithTangent',
      confidence: 0.95,
      reason: 'Circle tangent detected',
      caption: 'वृत्त और स्पर्श रेखा (Circle and Tangent)',
      altText: 'Circle with radius perpendicular to tangent at point of contact',
      data: {
        type: 'circleWithTangent',
        dimensions: { radius: 'r' },
      },
    };
  }

  if (combined.includes('त्रिज्यखंड') || combined.includes('sector of a circle')) {
    const angleMatch = text.match(/(\d+)\s*(°|अंश|degree)/i);
    return {
      required: true,
      type: 'sector',
      confidence: 0.9,
      reason: 'Circle sector detected',
      caption: 'वृत्त का त्रिज्यखंड (Sector of a Circle)',
      altText: 'Circle showing shaded sector with angle theta',
      data: {
        type: 'sector',
        dimensions: { angle: angleMatch ? `${angleMatch[1]}°` : '60°' },
      },
    };
  }

  if (
    combined.includes('जीवा') ||
    combined.includes('chord of circle') ||
    combined.includes('chord ab')
  ) {
    return {
      required: true,
      type: 'circleWithChord',
      confidence: 0.9,
      reason: 'Circle chord detected',
      caption: 'वृत्त और जीवा (Circle with Chord)',
      altText: 'Circle with chord and perpendicular bisector from center',
      data: {
        type: 'circleWithChord',
      },
    };
  }

  // 4. Parallel Lines & Transversal (समांतर रेखाएं, तिर्यक रेखा, एकांतर कोण)
  if (
    combined.includes('तिर्यक रेखा') ||
    combined.includes('transversal') ||
    combined.includes('एकांतर कोण') ||
    combined.includes('alternate interior') ||
    combined.includes('संगत कोण') ||
    (combined.includes('समांतर रेखा') && combined.includes('कोण'))
  ) {
    return {
      required: true,
      type: 'parallelLines',
      confidence: 0.92,
      reason: 'Parallel lines with transversal detected',
      caption: 'समांतर रेखाएं और तिर्यक रेखा (Parallel Lines & Transversal)',
      altText: 'Two parallel lines intersected by transversal showing alternate interior angles',
      data: {
        type: 'parallelLines',
      },
    };
  }

  // 5. Quadrilaterals (समांतर चतुर्भुज, समचतुर्भुज, समलंब, आयत, वर्ग)
  if (combined.includes('समांतर चतुर्भुज') || combined.includes('parallelogram')) {
    return {
      required: true,
      type: 'parallelogram',
      confidence: 0.9,
      caption: 'समांतर चतुर्भुज (Parallelogram)',
      altText: 'Parallelogram ABCD with parallel opposite sides',
      data: { type: 'parallelogram', labels: ['A', 'B', 'C', 'D'] },
    };
  }

  if (combined.includes('समचतुर्भुज') || combined.includes('rhombus')) {
    return {
      required: true,
      type: 'rhombus',
      confidence: 0.9,
      caption: 'समचतुर्भुज (Rhombus)',
      altText: 'Rhombus ABCD with perpendicular diagonals',
      data: { type: 'rhombus', labels: ['A', 'B', 'C', 'D'], showDiagonals: true },
    };
  }

  if (combined.includes('समलंब') || combined.includes('trapezium') || combined.includes('trapezoid')) {
    return {
      required: true,
      type: 'trapezium',
      confidence: 0.9,
      caption: 'समलंब चतुर्भुज (Trapezium)',
      altText: 'Trapezium with one pair of parallel sides',
      data: { type: 'trapezium', labels: ['A', 'B', 'C', 'D'] },
    };
  }

  // 6. 3D Solids (बेलन, शंकु, गोला, अर्धगोला, घनाभ, घन)
  if (combined.includes('बेलन') || combined.includes('cylinder')) {
    return {
      required: true,
      type: 'cylinder',
      confidence: 0.92,
      caption: 'लंब वृत्तीय बेलन (Right Circular Cylinder)',
      altText: 'Cylinder showing radius r and height h',
      data: { type: 'cylinder' },
    };
  }

  if (combined.includes('शंकु') || combined.includes('cone')) {
    return {
      required: true,
      type: 'cone',
      confidence: 0.92,
      caption: 'शंकु (Cone)',
      altText: 'Cone showing radius r, height h and slant height l',
      data: { type: 'cone' },
    };
  }

  if (combined.includes('अर्धगोला') || combined.includes('hemisphere')) {
    return {
      required: true,
      type: 'hemisphere',
      confidence: 0.92,
      caption: 'अर्धगोला (Hemisphere)',
      altText: 'Hemisphere showing radius r',
      data: { type: 'hemisphere' },
    };
  }

  if (combined.includes('गोला') || combined.includes('sphere')) {
    return {
      required: true,
      type: 'sphere',
      confidence: 0.88,
      caption: 'ठोस गोला (Sphere)',
      altText: 'Sphere with radius r',
      data: { type: 'sphere' },
    };
  }

  if (combined.includes('घनाभ') || combined.includes('cuboid')) {
    return {
      required: true,
      type: 'cuboid',
      confidence: 0.9,
      caption: 'घनाभ (Cuboid)',
      altText: 'Cuboid with length, width and height',
      data: { type: 'cuboid' },
    };
  }

  // 7. Optics (अवतल दर्पण, उत्तल दर्पण, उत्तल लेंस, अवतल लेंस, कांच की सिल्ली, अपवर्तन)
  if (combined.includes('अवतल दर्पण') || combined.includes('concave mirror')) {
    return {
      required: true,
      type: 'concaveMirror',
      confidence: 0.95,
      caption: 'अवतल दर्पण किरण आरेख (Concave Mirror Ray Diagram)',
      altText: 'Ray diagram for concave mirror showing object between C and F and real inverted image',
      data: { type: 'concaveMirror' },
    };
  }

  if (combined.includes('उत्तल लेंस') || combined.includes('convex lens')) {
    return {
      required: true,
      type: 'convexLens',
      confidence: 0.95,
      caption: 'उत्तल लेंस किरण आरेख (Convex Lens Ray Diagram)',
      altText: 'Ray diagram for convex lens showing refraction through focus',
      data: { type: 'convexLens' },
    };
  }

  if (combined.includes('अपवर्तन') || combined.includes('कांच की सिल्ली') || combined.includes('स्नेल का नियम') || combined.includes('glass slab')) {
    return {
      required: true,
      type: 'refraction',
      confidence: 0.92,
      caption: 'कांच की सिल्ली से प्रकाश का अपवर्तन (Refraction through Glass Slab)',
      altText: 'Refraction through rectangular glass slab showing incident, refracted and emergent ray',
      data: { type: 'refraction' },
    };
  }

  // 8. Electricity (विद्युत परिपथ, श्रेणीक्रम, समांतर क्रम, प्रतिरोध, ओम का नियम)
  if (
    combined.includes('श्रेणीक्रम') ||
    combined.includes('series circuit') ||
    combined.includes('resistors in series') ||
    (combined.includes('प्रतिरोध') && combined.includes('r1'))
  ) {
    const isPar = combined.includes('समांतर क्रम') || combined.includes('parallel');
    return {
      required: true,
      type: isPar ? 'parallelCircuit' : 'seriesCircuit',
      confidence: 0.92,
      caption: isPar ? 'समांतर क्रम परिपथ (Parallel Circuit)' : 'श्रेणीक्रम परिपथ (Series Circuit)',
      altText: 'Electric circuit diagram with battery, switch, ammeter and resistors',
      data: { type: isPar ? 'parallelCircuit' : 'seriesCircuit' },
    };
  }

  // 9. Magnetism (चुंबकीय क्षेत्र, बार मैग्नेट, चुंबक)
  if (combined.includes('चुंबकीय क्षेत्र रेखा') || combined.includes('magnetic field lines') || combined.includes('बार चुंबक') || combined.includes('bar magnet')) {
    return {
      required: true,
      type: 'barMagnet',
      confidence: 0.93,
      caption: 'छड़ चुंबक की चुंबकीय क्षेत्र रेखाएं (Magnetic Field Lines of Bar Magnet)',
      altText: 'Bar magnet showing closed loops of magnetic field lines from North to South pole',
      data: { type: 'barMagnet' },
    };
  }

  // 10. Biology: Cells, Eye, Nephron, Neuron
  if (combined.includes('पादप कोशिका') || combined.includes('plant cell')) {
    return {
      required: true,
      type: 'plantCell',
      confidence: 0.95,
      caption: 'पादप कोशिका की संरचना (Plant Cell Structure)',
      altText: 'Plant cell showing cell wall, large vacuole, chloroplast and nucleus',
      data: { type: 'plantCell' },
    };
  }

  if (combined.includes('जंतु कोशिका') || combined.includes('animal cell')) {
    return {
      required: true,
      type: 'animalCell',
      confidence: 0.95,
      caption: 'जंतु कोशिका की संरचना (Animal Cell Structure)',
      altText: 'Animal cell showing cell membrane, nucleus and mitochondria',
      data: { type: 'animalCell' },
    };
  }

  if (combined.includes('मानव नेत्र') || combined.includes('human eye') || combined.includes('रेटिना') || combined.includes('कॉर्निया') || combined.includes('पक्ष्माभी पेशी')) {
    return {
      required: true,
      type: 'humanEye',
      confidence: 0.95,
      caption: 'मानव नेत्र की संरचना (Structure of Human Eye)',
      altText: 'Human eye schematic showing cornea, lens, retina and optic nerve',
      data: { type: 'humanEye' },
    };
  }

  if (combined.includes('नेफ्रॉन') || combined.includes('nephron') || combined.includes('बोमन संपुट') || combined.includes('ग्लोमेरुलस') || combined.includes('वृक्क नलिका')) {
    return {
      required: true,
      type: 'nephron',
      confidence: 0.95,
      caption: 'वृक्काणु (नेफ्रॉन) की संरचना (Structure of Nephron)',
      altText: 'Nephron showing Bowman capsule, glomerulus, Henle loop and collecting duct',
      data: { type: 'nephron' },
    };
  }

  if (combined.includes('न्यूरॉन') || combined.includes('neuron') || combined.includes('तंत्रिका कोशिका') || combined.includes('एक्सॉन') || combined.includes('डेंड्राइट') || combined.includes('सिनेप्स')) {
    return {
      required: true,
      type: 'neuron',
      confidence: 0.95,
      caption: 'तंत्रिका कोशिका - न्यूरॉन (Structure of Neuron)',
      altText: 'Neuron showing dendrites, cyton, myelin sheath axon and nerve endings',
      data: { type: 'neuron' },
    };
  }

  // 11. Chemistry: Bohr Model, Electrolysis, Displacement
  if (combined.includes('बोहर का परमाणु मॉडल') || combined.includes('bohr model') || combined.includes('इलेक्ट्रॉनिक विन्यास') || combined.includes('k, l, m') || combined.includes('संयोजी इलेक्ट्रॉन')) {
    return {
      required: true,
      type: 'bohrModel',
      confidence: 0.9,
      caption: 'बोहर का परमाणु मॉडल (Bohr Atomic Model)',
      altText: 'Bohr model showing nucleus with protons and concentric electron shells',
      data: { type: 'bohrModel' },
    };
  }

  if (combined.includes('जल का विद्युत अपघटन') || combined.includes('electrolysis of water') || (combined.includes('अपघटन') && combined.includes('कैथोड') && combined.includes('एनोड'))) {
    return {
      required: true,
      type: 'electrolysisWater',
      confidence: 0.95,
      caption: 'जल का विद्युत अपघटन (Electrolysis of Water)',
      altText: 'Electrolysis apparatus showing 2 volumes of H2 at cathode and 1 volume of O2 at anode',
      data: { type: 'electrolysisWater' },
    };
  }

  if (combined.includes('विस्थापन अभिक्रिया') || combined.includes('displacement reaction') || (combined.includes('cuso4') && combined.includes('लोहे की कील'))) {
    return {
      required: true,
      type: 'displacementReaction',
      confidence: 0.95,
      caption: 'विस्थापन अभिक्रिया (Displacement Reaction)',
      altText: 'Displacement reaction showing iron nail immersed in copper sulphate solution turning green',
      data: { type: 'displacementReaction' },
    };
  }

  // 12. Coordinate Geometry / Number Line
  if (combined.includes('निर्देशांक ज्यामिति') || combined.includes('coordinate geometry') || combined.includes('कार्तीय तल') || combined.includes('cartesian')) {
    return {
      required: true,
      type: 'coordinateAxes',
      confidence: 0.85,
      caption: 'कार्तीय निर्देशांक तल (Cartesian Coordinate Plane)',
      altText: 'Cartesian coordinate system showing X and Y axes and plotted points',
      data: { type: 'coordinateAxes' },
    };
  }

  if (combined.includes('संख्या रेखा') || combined.includes('number line')) {
    return {
      required: true,
      type: 'numberLine',
      confidence: 0.9,
      caption: 'संख्या रेखा (Number Line)',
      altText: 'Real number line with integers and marked points',
      data: { type: 'numberLine' },
    };
  }

  return { required: false, confidence: 0 };
}
