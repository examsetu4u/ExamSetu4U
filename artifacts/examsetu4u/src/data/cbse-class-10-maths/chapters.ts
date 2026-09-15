import { getStudyMaterial, getTopic } from '@/data/curriculum';
import { getPYQsForTopic } from '@/data/pyq';
import { getFilteredQuestions } from '@/data/quiz/questions';
import { loadQuizHistory } from '@/lib/quiz-storage';
import { summarizePYQProgress } from '@/lib/progress';
import type {
  MathsChapter,
  MathsChapterProgress,
  MathsQuestion,
  MathsQuestionType,
  MathsSectionKey,
  MathsSectionMetadata,
} from './types';

/**
 * Official CBSE Class 10 Mathematics Syllabus Chapters (NCERT / CBSE Board Exam)
 * Total 14 chapters across 7 units. Total Marks: 80 (Theory) + 20 (Internal) = 100 Marks
 */
export const CBSE_CLASS_10_MATHS_CHAPTERS: MathsChapter[] = [
  // Unit I: Number Systems (6 Marks)
  {
    id: 'cbse-class-10-mathematics-1',
    canonicalId: 'cbse-class-10-mathematics-1',
    chapterNumber: 1,
    slug: 'real-numbers',
    title: 'Real Numbers',
    hindiTitle: 'वास्तविक संख्याएँ',
    unitNumber: 1,
    unitName: 'Unit I: Number Systems',
    unitHindiName: 'इकाई 1: संख्या पद्धति',
    shortDescription:
      'Fundamental Theorem of Arithmetic - statements after reviewing work done earlier and after illustrating and motivating through examples, Proofs of irrationality of √2, √3, √5.',
    syllabusTopics: [
      'Fundamental Theorem of Arithmetic',
      'Prime Factorisation & HCF / LCM',
      'Relationship between HCF and LCM: HCF(a,b) × LCM(a,b) = a × b',
      'Proofs of Irrationality (√2, √3, √5, a ± b√p)',
      'Applications of Number Theory in Board Exams',
    ],
    keyFormulas: [
      'HCF(a, b) × LCM(a, b) = a × b',
      'Every composite number can be uniquely expressed as a product of primes',
      'If p is a prime and p divides a², then p divides a',
    ],
    weightageMarks: 6,
  },

  // Unit II: Algebra (20 Marks Total)
  {
    id: 'cbse-class-10-mathematics-2',
    canonicalId: 'cbse-class-10-mathematics-2',
    chapterNumber: 2,
    slug: 'polynomials',
    title: 'Polynomials',
    hindiTitle: 'बहुपद',
    unitNumber: 2,
    unitName: 'Unit II: Algebra',
    unitHindiName: 'इकाई 2: बीजगणित',
    shortDescription:
      'Zeros of a polynomial. Relationship between zeros and coefficients of quadratic polynomials.',
    syllabusTopics: [
      'Geometrical Meaning of the Zeros of a Polynomial',
      'Relationship between Zeros and Coefficients of a Quadratic Polynomial',
      'Forming a Quadratic Polynomial when sum and product of zeros are given',
      'Cubic and Higher Degree Polynomial Relations',
    ],
    keyFormulas: [
      'For ax² + bx + c: Sum of zeros (α + β) = -b/a',
      'Product of zeros (αβ) = c/a',
      'Quadratic polynomial k[x² - (α + β)x + αβ]',
    ],
    weightageMarks: 4,
  },
  {
    id: 'cbse-class-10-mathematics-3',
    canonicalId: 'cbse-class-10-mathematics-3',
    chapterNumber: 3,
    slug: 'pair-of-linear-equations-in-two-variables',
    title: 'Pair of Linear Equations in Two Variables',
    hindiTitle: 'दो चर वाले रैखिक समीकरणों का युग्म',
    unitNumber: 2,
    unitName: 'Unit II: Algebra',
    unitHindiName: 'इकाई 2: बीजगणित',
    shortDescription:
      'Pair of linear equations in two variables and graphical method of their solution, consistency/inconsistency. Algebraic conditions for number of solutions. Solution of a pair of linear equations in two variables algebraically - by substitution, by elimination. Simple situational problems.',
    syllabusTopics: [
      'Graphical Method of Solution & Consistency Criteria',
      'Ratios of Coefficients (a1/a2, b1/b2, c1/c2)',
      'Substitution Method',
      'Elimination Method',
      'Word Problems on Age, Speed, Fractions, and Numbers',
    ],
    keyFormulas: [
      'Unique solution (intersecting lines): a1/a2 ≠ b1/b2',
      'Infinitely many solutions (coincident lines): a1/a2 = b1/b2 = c1/c2',
      'No solution (parallel lines): a1/a2 = b1/b2 ≠ c1/c2',
    ],
    weightageMarks: 5,
  },
  {
    id: 'cbse-class-10-mathematics-4',
    canonicalId: 'cbse-class-10-mathematics-4',
    chapterNumber: 4,
    slug: 'quadratic-equations',
    title: 'Quadratic Equations',
    hindiTitle: 'द्विघात समीकरण',
    unitNumber: 2,
    unitName: 'Unit II: Algebra',
    unitHindiName: 'इकाई 2: बीजगणित',
    shortDescription:
      'Standard form of a quadratic equation ax² + bx + c = 0, (a ≠ 0). Solutions of quadratic equations (only real roots) by factorization, and by using quadratic formula. Relationship between discriminant and nature of roots. Situational problems based on quadratic equations related to day to day activities.',
    syllabusTopics: [
      'Standard Form ax² + bx + c = 0',
      'Solution by Factorization (Splitting the Middle Term)',
      'Solution by Quadratic Formula: x = (-b ± √D)/(2a)',
      'Discriminant D = b² - 4ac and Nature of Roots',
      'Day-to-day Real-world Word Problems',
    ],
    keyFormulas: [
      'Discriminant D = b² - 4ac',
      'D > 0: Two distinct real roots',
      'D = 0: Two equal real roots (x = -b / 2a)',
      'D < 0: No real roots',
      'Quadratic formula: x = (-b ± √(b² - 4ac)) / (2a)',
    ],
    weightageMarks: 5,
  },
  {
    id: 'cbse-class-10-mathematics-5',
    canonicalId: 'cbse-class-10-mathematics-5',
    chapterNumber: 5,
    slug: 'arithmetic-progressions',
    title: 'Arithmetic Progressions',
    hindiTitle: 'समांतर श्रेढ़ियाँ',
    unitNumber: 2,
    unitName: 'Unit II: Algebra',
    unitHindiName: 'इकाई 2: बीजगणित',
    shortDescription:
      'Motivation for studying Arithmetic Progression. Derivation of the nth term and sum of the first n terms of A.P. and their application in solving daily life problems.',
    syllabusTopics: [
      'Identifying an AP and Common Difference (d)',
      'General / nth Term of an AP (an = a + (n - 1)d)',
      'Finding Terms from the End of an AP',
      'Sum of First n Terms (Sn)',
      'Applications in Real Life & Word Problems',
    ],
    keyFormulas: [
      'an = a + (n - 1)d',
      'Sn = n/2 [2a + (n - 1)d] = n/2 [a + l]',
      'nth term from end = l - (n - 1)d',
      'an = Sn - Sn-1',
    ],
    weightageMarks: 6,
  },

  // Unit IV: Geometry (15 Marks Total)
  {
    id: 'cbse-class-10-mathematics-6',
    canonicalId: 'cbse-class-10-mathematics-6',
    chapterNumber: 6,
    slug: 'triangles',
    title: 'Triangles',
    hindiTitle: 'त्रिभुज',
    unitNumber: 4,
    unitName: 'Unit IV: Geometry',
    unitHindiName: 'इकाई 4: ज्यामिति',
    shortDescription:
      'Definitions, examples, counter examples of similar triangles. Proof of Basic Proportionality Theorem (Thales Theorem). Criteria for similarity of triangles (AAA/AA, SAS, SSS). Applications and board proofs.',
    syllabusTopics: [
      'Similarity vs Congruence of Figures',
      'Basic Proportionality Theorem (Thales Theorem) & its Converse',
      'Criteria for Similarity of Triangles (AA, SAS, SSS)',
      'Properties of Similar Triangles & Ratio of Altitudes/Medians',
      'Step-by-step Geometric Proofs',
    ],
    keyFormulas: [
      'BPT (Thales): If DE || BC, then AD/DB = AE/EC',
      'Converse of BPT: If AD/DB = AE/EC, then DE || BC',
      'Similarity criteria: AA (Angle-Angle), SAS, SSS',
    ],
    weightageMarks: 9,
  },

  // Unit III: Coordinate Geometry (6 Marks)
  {
    id: 'cbse-class-10-mathematics-7',
    canonicalId: 'cbse-class-10-mathematics-7',
    chapterNumber: 7,
    slug: 'coordinate-geometry',
    title: 'Coordinate Geometry',
    hindiTitle: 'निर्देशांक ज्यामिति',
    unitNumber: 3,
    unitName: 'Unit III: Coordinate Geometry',
    unitHindiName: 'इकाई 3: निर्देशांक ज्यामिति',
    shortDescription:
      'Review: Concepts of coordinate geometry, graphs of linear equations. Distance formula. Section formula (internal division). Midpoint formula and applications to geometric figures.',
    syllabusTopics: [
      'Distance Formula between Two Points',
      'Collinearity of Three Points',
      'Types of Triangles and Quadrilaterals (using distance)',
      'Section Formula (Internal Division)',
      'Midpoint Formula & Centroid of a Triangle',
    ],
    keyFormulas: [
      'Distance d = √[(x2 - x1)² + (y2 - y1)²]',
      'Distance from origin = √(x² + y²)',
      'Section formula: P(x, y) = ((m1·x2 + m2·x1)/(m1 + m2), (m1·y2 + m2·y1)/(m1 + m2))',
      'Midpoint: M = ((x1 + x2)/2, (y1 + y2)/2)',
      'Centroid of Triangle: G = ((x1 + x2 + x3)/3, (y1 + y2 + y3)/3)',
    ],
    weightageMarks: 6,
  },

  // Unit V: Trigonometry (12 Marks Total)
  {
    id: 'cbse-class-10-mathematics-8',
    canonicalId: 'cbse-class-10-mathematics-8',
    chapterNumber: 8,
    slug: 'introduction-to-trigonometry',
    title: 'Introduction to Trigonometry',
    hindiTitle: 'त्रिकोणमिति का परिचय',
    unitNumber: 5,
    unitName: 'Unit V: Trigonometry',
    unitHindiName: 'इकाई 5: त्रिकोणमिति',
    shortDescription:
      'Trigonometric ratios of an acute angle of a right-angled triangle. Proof of their existence. Values of the trigonometric ratios of 30°, 45° and 60°. Relationships between the ratios. Proof and applications of the identity sin²A + cos²A = 1.',
    syllabusTopics: [
      'Trigonometric Ratios (sin, cos, tan, cot, sec, cosec)',
      'Values of T-Ratios at standard angles (0°, 30°, 45°, 60°, 90°)',
      'Fundamental Trigonometric Identity: sin²A + cos²A = 1',
      '1 + tan²A = sec²A and 1 + cot²A = cosec²A',
      'Proving Trigonometric Identities',
    ],
    keyFormulas: [
      'sin θ = Opp/Hyp, cos θ = Adj/Hyp, tan θ = Opp/Adj',
      'sin²A + cos²A = 1',
      '1 + tan²A = sec²A  (sec²A - tan²A = 1)',
      '1 + cot²A = cosec²A  (cosec²A - cot²A = 1)',
      'tan A = sin A / cos A, cot A = cos A / sin A',
    ],
    weightageMarks: 8,
  },
  {
    id: 'cbse-class-10-mathematics-9',
    canonicalId: 'cbse-class-10-mathematics-9',
    chapterNumber: 9,
    slug: 'some-applications-of-trigonometry',
    title: 'Some Applications of Trigonometry',
    hindiTitle: 'त्रिकोणमिति के कुछ अनुप्रयोग',
    unitNumber: 5,
    unitName: 'Unit V: Trigonometry',
    unitHindiName: 'इकाई 5: त्रिकोणमिति',
    shortDescription:
      'Heights and Distances: Angle of elevation, Angle of Depression. Simple problems on heights and distances. Problems should not involve more than two right triangles. Angles of elevation / depression should be only 30°, 45°, and 60°.',
    syllabusTopics: [
      'Line of Sight, Angle of Elevation and Angle of Depression',
      'Heights and Distances with Single Right Triangle',
      'Heights and Distances with Two Right Triangles',
      'Tower, Building, Balloon, and Cloud Board Problems',
    ],
    keyFormulas: [
      'tan θ = Height / Base (useful when base and height are related)',
      'sin θ = Height / Hypotenuse (useful for kite strings or ladders)',
      'Angle of elevation from observer = Angle of depression from object',
    ],
    weightageMarks: 4,
  },

  // Unit IV: Geometry (Continued)
  {
    id: 'cbse-class-10-mathematics-10',
    canonicalId: 'cbse-class-10-mathematics-10',
    chapterNumber: 10,
    slug: 'circles',
    title: 'Circles',
    hindiTitle: 'वृत्त',
    unitNumber: 4,
    unitName: 'Unit IV: Geometry',
    unitHindiName: 'इकाई 4: ज्यामिति',
    shortDescription:
      'Tangent to a circle at, point of contact. (Prove) The tangent at any point of a circle is perpendicular to the radius through the point of contact. (Prove) The lengths of tangents drawn from an external point to a circle are equal.',
    syllabusTopics: [
      'Tangent to a Circle & Point of Contact',
      'Theorem 1: Radius is perpendicular to tangent at point of contact',
      'Theorem 2: Lengths of tangents drawn from an external point are equal',
      'Properties of Tangents & Inscribed Polygons',
      'Tangents from an External Point Applications',
    ],
    keyFormulas: [
      'OP ⊥ PT (Radius ⊥ Tangent at point of contact)',
      'PA = PB (Tangents from external point P to circle are equal in length)',
      '∠APB + ∠AOB = 180° (Angles between tangents and radii are supplementary)',
    ],
    weightageMarks: 6,
  },

  // Unit VI: Mensuration (10 Marks Total)
  {
    id: 'cbse-class-10-mathematics-11',
    canonicalId: 'cbse-class-10-mathematics-11',
    chapterNumber: 11,
    slug: 'areas-related-to-circles',
    title: 'Areas Related to Circles',
    hindiTitle: 'वृत्तों से संबंधित क्षेत्रफल',
    unitNumber: 6,
    unitName: 'Unit VI: Mensuration',
    unitHindiName: 'इकाई 6: क्षेत्रमिति',
    shortDescription:
      'Area of sectors and segments of a circle. Problems based on areas and perimeter / circumference of the above said plane figures. (In calculating area of segment of a circle, problems should be restricted to central angle of 60°, 90° and 120° only).',
    syllabusTopics: [
      'Perimeter and Area of a Circle Review',
      'Area of Sector of a Circle (Minor & Major Sector)',
      'Length of an Arc of a Sector',
      'Area of Segment of a Circle (Minor & Major Segment)',
      'Combination of Plane Figures & Shaded Region Problems',
    ],
    keyFormulas: [
      'Length of arc l = (θ / 360°) × 2πr',
      'Area of sector = (θ / 360°) × πr² = (1/2) × l × r',
      'Area of minor segment = Area of sector - Area of corresponding triangle',
      'Area of triangle with central angle θ: (1/2) r² sin θ',
    ],
    weightageMarks: 4,
  },
  {
    id: 'cbse-class-10-mathematics-12',
    canonicalId: 'cbse-class-10-mathematics-12',
    chapterNumber: 12,
    slug: 'surface-areas-and-volumes',
    title: 'Surface Areas and Volumes',
    hindiTitle: 'पृष्ठीय क्षेत्रफल और आयतन',
    unitNumber: 6,
    unitName: 'Unit VI: Mensuration',
    unitHindiName: 'इकाई 6: क्षेत्रमिति',
    shortDescription:
      'Surface areas and volumes of combinations of any two of the following: cubes, cuboids, spheres, hemispheres and right circular cylinders/cones.',
    syllabusTopics: [
      'Surface Area of Combination of Solids',
      'Volume of Combination of Solids',
      'Toy, Tent, Capsule, and Gulab Jamun Problems',
      'Conversion of Solid from One Shape to Another',
    ],
    keyFormulas: [
      'Cylinder: CSA = 2πrh, TSA = 2πr(r + h), Volume = πr²h',
      'Cone: CSA = πrl (where l = √(r² + h²)), TSA = πr(r + l), Volume = (1/3)πr²h',
      'Sphere: Surface Area = 4πr², Volume = (4/3)πr³',
      'Hemisphere: CSA = 2πr², TSA = 3πr², Volume = (2/3)πr³',
      'Cuboid: TSA = 2(lb + bh + hl), Volume = lbh',
      'Cube: TSA = 6a², Volume = a³',
    ],
    weightageMarks: 6,
  },

  // Unit VII: Statistics and Probability (11 Marks Total)
  {
    id: 'cbse-class-10-mathematics-13',
    canonicalId: 'cbse-class-10-mathematics-13',
    chapterNumber: 13,
    slug: 'statistics',
    title: 'Statistics',
    hindiTitle: 'सांख्यिकी',
    unitNumber: 7,
    unitName: 'Unit VII: Statistics & Probability',
    unitHindiName: 'इकाई 7: सांख्यिकी एवं प्रायिकता',
    shortDescription:
      'Mean, median and mode of grouped data (bimodal situation to be avoided). Mean by Direct method and Assumed Mean method only.',
    syllabusTopics: [
      'Mean of Grouped Data (Direct Method & Assumed Mean Method)',
      'Mode of Grouped Data (Modal Class & Formula)',
      'Median of Grouped Data (Cumulative Frequency & Formula)',
      'Empirical Relationship between Mean, Median, and Mode',
      'Missing Frequency Problems (Single & Double Missing)',
    ],
    keyFormulas: [
      'Direct Mean x̄ = Σfi·xi / Σfi',
      'Assumed Mean x̄ = a + (Σfi·di / Σfi) where di = xi - a',
      'Mode = l + [(f1 - f0) / (2f1 - f0 - f2)] × h',
      'Median = l + [((n/2) - cf) / f] × h',
      'Empirical Formula: 3 Median = Mode + 2 Mean',
    ],
    weightageMarks: 7,
  },
  {
    id: 'cbse-class-10-mathematics-14',
    canonicalId: 'cbse-class-10-mathematics-14',
    chapterNumber: 14,
    slug: 'probability',
    title: 'Probability',
    hindiTitle: 'प्रायिकता',
    unitNumber: 7,
    unitName: 'Unit VII: Statistics & Probability',
    unitHindiName: 'इकाई 7: सांख्यिकी एवं प्रायिकता',
    shortDescription:
      'Classical definition of probability. Simple problems on finding the probability of an event. Deck of 52 playing cards, coin tosses, and dice rolls.',
    syllabusTopics: [
      'Theoretical (Classical) Probability P(E) = n(E) / n(S)',
      'Sure Event, Impossible Event, and Range of Probability (0 ≤ P(E) ≤ 1)',
      'Complementary Events: P(E) + P(not E) = 1',
      'Coin Tosses (1, 2, and 3 coins)',
      'Dice Rolls (Single and Pair of Dice)',
      'Deck of 52 Playing Cards (Suits, Face Cards, Honours)',
    ],
    keyFormulas: [
      'P(E) = (Number of outcomes favourable to E) / (Total number of possible outcomes)',
      '0 ≤ P(E) ≤ 1',
      'P(E) + P(E̅) = 1',
      'Sum of probabilities of all elementary events = 1',
    ],
    weightageMarks: 4,
  },
];

/**
 * CBSE Exam Question Types & Learning Sections for Mathematics
 */
export const MATHS_CHAPTER_SECTIONS: MathsSectionMetadata[] = [
  {
    key: 'study-material',
    order: 1,
    icon: 'BookOpen',
    title: 'Study Material & Formulas',
    hindiTitle: 'सूत्र एवं संकल्पनाएँ',
    description: 'Comprehensive NCERT concept notes, key formulas, step-by-step algorithms and theorems.',
    badge: 'Formula & Theory',
    marksInfo: 'Theory',
    emptyHeading: 'Concept Notes Under Review',
    emptyDescription: 'NCERT concept summary and formula bank is being prepared for this chapter.',
    targetRouteSegment: 'study-material',
  },
  {
    key: 'mcq',
    order: 2,
    icon: 'FileQuestion',
    title: 'Section A: MCQ Practice',
    hindiTitle: 'खंड क: वस्तुनिष्ठ प्रश्न',
    description: '1-Mark multiple-choice questions matching latest CBSE Board question paper pattern.',
    badge: '1 Mark Each',
    marksInfo: '1 Mark',
    emptyHeading: 'No MCQs Available',
    emptyDescription: 'Multiple choice practice questions will be added shortly.',
    targetRouteSegment: 'mcq',
  },
  {
    key: 'assertion-reason',
    order: 3,
    icon: 'Sparkles',
    title: 'Section A: Assertion-Reason',
    hindiTitle: 'खंड क: अभिकथन एवं कारण',
    description: 'High-order analytical Assertion and Reason questions tested in CBSE Board exams.',
    badge: '1 Mark Each',
    marksInfo: '1 Mark',
    emptyHeading: 'Assertion-Reason Practice',
    emptyDescription: 'Assertion-Reasoning conceptual challenges will be published soon.',
    targetRouteSegment: 'assertion-reason',
  },
  {
    key: 'very-short',
    order: 4,
    icon: 'CheckCircle2',
    title: 'Section B: Very Short Answer (VSA)',
    hindiTitle: 'खंड ख: अति लघु उत्तरीय',
    description: '2-Mark direct conceptual and formula application problems with stepwise solutions.',
    badge: '2 Marks Each',
    marksInfo: '2 Marks',
    emptyHeading: 'Very Short Answers',
    emptyDescription: '2-Mark question bank is currently being updated.',
    targetRouteSegment: 'very-short',
  },
  {
    key: 'short-answer',
    order: 5,
    icon: 'Layers',
    title: 'Section C: Short Answer (SA)',
    hindiTitle: 'खंड ग: लघु उत्तरीय',
    description: '3-Mark standard derivation and numerical problems requiring clear step-by-step solving.',
    badge: '3 Marks Each',
    marksInfo: '3 Marks',
    emptyHeading: 'Short Answer Questions',
    emptyDescription: '3-Mark questions with full steps are being compiled.',
    targetRouteSegment: 'short-answer',
  },
  {
    key: 'long-answer',
    order: 6,
    icon: 'Target',
    title: 'Section D: Long Answer (LA)',
    hindiTitle: 'खंड घ: दीर्घ उत्तरीय',
    description: '5-Mark in-depth proofs, constructions, and multistep mathematical problem solving.',
    badge: '5 Marks Each',
    marksInfo: '5 Marks',
    emptyHeading: 'Long Answer Questions',
    emptyDescription: '5-Mark long solution problems will be available soon.',
    targetRouteSegment: 'long-answer',
  },
  {
    key: 'case-based',
    order: 7,
    icon: 'BookCheck',
    title: 'Section E: Case-Based Study',
    hindiTitle: 'खंड ङ: केस आधारित प्रश्न',
    description: '4-Mark practical, real-life integrated scenario case studies with sub-questions.',
    badge: '4 Marks Each',
    marksInfo: '4 Marks',
    emptyHeading: 'Case Studies',
    emptyDescription: 'CBSE Competency-based case studies are being authored.',
    targetRouteSegment: 'case-based',
  },
  {
    key: 'pyq',
    order: 8,
    icon: 'History',
    title: 'CBSE Board PYQs (2019-2024)',
    hindiTitle: 'विगत वर्षों के बोर्ड प्रश्न',
    description: 'Previous years standard and basic Mathematics CBSE board questions with marking scheme.',
    badge: 'Board Papers',
    marksInfo: 'PYQ',
    emptyHeading: 'Previous Year Questions',
    emptyDescription: 'Solved CBSE board papers for this chapter are coming soon.',
    targetRouteSegment: 'pyq',
  },
  {
    key: 'chapter-test',
    order: 9,
    icon: 'Clock',
    title: 'Chapter Speed Test',
    hindiTitle: 'अध्याय गति परीक्षा',
    description: 'Timed practice test with randomized questions to simulate real CBSE board timing.',
    badge: 'Mock Test',
    marksInfo: 'Timed',
    emptyHeading: 'Chapter Test',
    emptyDescription: 'Full chapter test series is being scheduled.',
    targetRouteSegment: 'chapter-test',
  },
  {
    key: 'revision',
    order: 10,
    icon: 'RotateCcw',
    title: 'Formula Sheet & Rapid Revision',
    hindiTitle: 'सूत्र पत्रक एवं त्वरित पुनरावलोकन',
    description: 'One-page formula sheet, definition summaries, and theorem list for the night before exam.',
    badge: 'Quick Notes',
    marksInfo: 'Summary',
    emptyHeading: 'Formula Sheet',
    emptyDescription: 'Formula sheet will be published shortly.',
    targetRouteSegment: 'revision',
  },
  {
    key: 'mistake-practice',
    order: 11,
    icon: 'HelpCircle',
    title: 'Common Mathematical Mistakes',
    hindiTitle: 'सामान्य गणितीय गलतियाँ',
    description: 'Identify and fix frequent sign errors, bracket omissions, and formula confusion.',
    badge: 'Mistake Book',
    marksInfo: 'Tips',
    emptyHeading: 'Mistake Book',
    emptyDescription: 'Analysis of common student pitfalls will be added here.',
    targetRouteSegment: 'mistake-practice',
  },
];

/**
 * Curated initial questions for CBSE Class 10 Mathematics
 * Supports all CBSE question types (MCQ, Assertion-Reason, VSA, SA, LA, Case-Based)
 */
export const CBSE_CLASS_10_MATHS_CURATED_QUESTIONS: MathsQuestion[] = [
  // Chapter 1: Real Numbers
  {
    id: 'CBSE10-MATH-01-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-1',
    topicId: 'real-numbers',
    question: 'If two positive integers a and b are written as a = x³y² and b = xy³, where x, y are prime numbers, then HCF(a, b) is:',
    questionType: 'MCQ',
    options: {
      A: 'xy',
      B: 'xy²',
      C: 'x³y³',
      D: 'x²y²',
    },
    correctAnswer: 'B',
    explanation: 'HCF is the product of the smallest power of each common prime factor involved in the numbers. Smallest power of x is x¹ and smallest power of y is y². Therefore, HCF(a, b) = x¹ · y² = xy².',
    importantPoint: 'HCF takes minimum powers of common primes; LCM takes maximum powers of all primes.',
    formulaUsed: 'HCF(a, b) = x^(min(3,1)) · y^(min(2,3)) = xy²',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2023,
    marks: 1,
    status: 'PUBLISHED',
  },
  {
    id: 'CBSE10-MATH-01-002',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-1',
    topicId: 'real-numbers',
    question: 'The LCM of two numbers is 2400. Which of the following CANNOT be their HCF?',
    questionType: 'MCQ',
    options: {
      A: '300',
      B: '400',
      C: '500',
      D: '600',
    },
    correctAnswer: 'C',
    explanation: 'The HCF of two numbers must always divide their LCM completely. Check options: 2400 ÷ 300 = 8 (divides); 2400 ÷ 400 = 6 (divides); 2400 ÷ 500 = 4.8 (does not divide); 2400 ÷ 600 = 4 (divides). Hence, 500 cannot be their HCF.',
    importantPoint: 'HCF is always a factor of LCM for any two positive integers.',
    difficulty: 'MODERATE',
    sourceType: 'PYQ',
    year: 2022,
    marks: 1,
    status: 'PUBLISHED',
  },
  {
    id: 'CBSE10-MATH-01-AR-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-1',
    topicId: 'real-numbers',
    question: 'Assertion (A): The HCF of two numbers is 5 and their product is 150, then their LCM is 30.\nReason (R): For any two positive integers a and b, HCF(a, b) × LCM(a, b) = a × b.',
    questionType: 'ASSERTION_REASON',
    options: {
      A: 'Both Assertion (A) and Reason (R) are true and Reason (R) is the correct explanation of Assertion (A).',
      B: 'Both Assertion (A) and Reason (R) are true but Reason (R) is not the correct explanation of Assertion (A).',
      C: 'Assertion (A) is true but Reason (R) is false.',
      D: 'Assertion (A) is false but Reason (R) is true.',
    },
    correctAnswer: 'A',
    explanation: 'From the property HCF × LCM = a × b, we get 5 × LCM = 150 ⇒ LCM = 150 / 5 = 30. Both statements are true and Reason directly explains Assertion.',
    difficulty: 'EASY',
    sourceType: 'PRACTICE',
    marks: 1,
    status: 'PUBLISHED',
  },
  {
    id: 'CBSE10-MATH-01-VSA-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-1',
    topicId: 'real-numbers',
    question: 'Explain why 7 × 11 × 13 + 13 is a composite number.',
    questionType: 'VERY_SHORT',
    correctAnswer: '13 × (7 × 11 + 1) = 13 × 78 = 13 × 2 × 3 × 13. Since it has factors other than 1 and itself, it is a composite number.',
    explanation: 'Factor out 13: 7 × 11 × 13 + 13 = 13 × (77 + 1) = 13 × 78 = 13 × 2 × 3 × 13 = 2 × 3 × 13². By the Fundamental Theorem of Arithmetic, any number that can be expressed as a product of prime factors other than 1 and itself is a composite number.',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2020,
    marks: 2,
    status: 'PUBLISHED',
  },

  // Chapter 2: Polynomials
  {
    id: 'CBSE10-MATH-02-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-2',
    topicId: 'polynomials',
    question: 'If one zero of the quadratic polynomial x² + 3x + k is 2, then the value of k is:',
    questionType: 'MCQ',
    options: {
      A: '10',
      B: '-10',
      C: '-7',
      D: '-2',
    },
    correctAnswer: 'B',
    explanation: 'Since 2 is a zero of the polynomial p(x) = x² + 3x + k, we must have p(2) = 0. Substituting x = 2: (2)² + 3(2) + k = 0 ⇒ 4 + 6 + k = 0 ⇒ 10 + k = 0 ⇒ k = -10.',
    importantPoint: 'If α is a zero of p(x), then p(α) = 0.',
    formulaUsed: 'p(2) = 2² + 3(2) + k = 0',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2023,
    marks: 1,
    status: 'PUBLISHED',
  },
  {
    id: 'CBSE10-MATH-02-002',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-2',
    topicId: 'polynomials',
    question: 'A quadratic polynomial whose zeros are -3 and 4 is:',
    questionType: 'MCQ',
    options: {
      A: 'x² - x + 12',
      B: 'x² + x + 12',
      C: 'x²/2 - x/2 - 6',
      D: '2x² + 2x - 24',
    },
    correctAnswer: 'C',
    explanation: 'Sum of zeros (S) = -3 + 4 = 1. Product of zeros (P) = -3 × 4 = -12. A quadratic polynomial is k(x² - Sx + P) = k(x² - x - 12). Taking k = 1/2 gives x²/2 - x/2 - 6, which matches option C.',
    importantPoint: 'Any non-zero constant multiple k(x² - Sx + P) has the exact same zeros.',
    difficulty: 'MODERATE',
    sourceType: 'PYQ',
    year: 2021,
    marks: 1,
    status: 'PUBLISHED',
  },

  // Chapter 3: Pair of Linear Equations in Two Variables
  {
    id: 'CBSE10-MATH-03-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-3',
    topicId: 'pair-of-linear-equations-in-two-variables',
    question: 'The pair of linear equations 2x + 3y = 5 and 4x + 6y = 15 has:',
    questionType: 'MCQ',
    options: {
      A: 'a unique solution',
      B: 'exactly two solutions',
      C: 'infinitely many solutions',
      D: 'no solution',
    },
    correctAnswer: 'D',
    explanation: 'Here a1/a2 = 2/4 = 1/2; b1/b2 = 3/6 = 1/2; c1/c2 = 5/15 = 1/3. Since a1/a2 = b1/b2 ≠ c1/c2, the lines are parallel and the system has NO solution (inconsistent).',
    importantPoint: 'a1/a2 = b1/b2 ≠ c1/c2 represents parallel lines with zero common points.',
    formulaUsed: 'a1/a2 = b1/b2 ≠ c1/c2',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2023,
    marks: 1,
    status: 'PUBLISHED',
  },

  // Chapter 4: Quadratic Equations
  {
    id: 'CBSE10-MATH-04-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-4',
    topicId: 'quadratic-equations',
    question: 'If the quadratic equation x² - 8x + k = 0 has real and equal roots, then the value of k is:',
    questionType: 'MCQ',
    options: {
      A: '64',
      B: '16',
      C: '-16',
      D: '4',
    },
    correctAnswer: 'B',
    explanation: 'For real and equal roots, the discriminant D = 0. Here a = 1, b = -8, c = k. D = b² - 4ac = (-8)² - 4(1)(k) = 64 - 4k = 0 ⇒ 4k = 64 ⇒ k = 16.',
    importantPoint: 'Equal roots condition: b² - 4ac = 0.',
    formulaUsed: 'D = b² - 4ac = 0',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2023,
    marks: 1,
    status: 'PUBLISHED',
  },

  // Chapter 5: Arithmetic Progressions
  {
    id: 'CBSE10-MATH-05-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-5',
    topicId: 'arithmetic-progressions',
    question: 'The 11th term of the AP: -3, -1/2, 2, ... is:',
    questionType: 'MCQ',
    options: {
      A: '28',
      B: '22',
      C: '-38',
      D: '-46.5',
    },
    correctAnswer: 'B',
    explanation: 'First term a = -3. Common difference d = -1/2 - (-3) = -1/2 + 3 = 5/2. The 11th term an = a + (n - 1)d = -3 + (11 - 1)(5/2) = -3 + 10(5/2) = -3 + 25 = 22.',
    importantPoint: 'an = a + (n - 1)d',
    formulaUsed: 'a11 = -3 + 10 × (5/2) = 22',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2020,
    marks: 1,
    status: 'PUBLISHED',
  },

  // Chapter 6: Triangles
  {
    id: 'CBSE10-MATH-06-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-6',
    topicId: 'triangles',
    question: 'In △ABC, DE || BC such that AD = 3 cm, DB = 5 cm and AE = 6 cm. The length of EC is:',
    questionType: 'MCQ',
    options: {
      A: '10 cm',
      B: '8 cm',
      C: '12 cm',
      D: '15 cm',
    },
    correctAnswer: 'A',
    explanation: 'By Basic Proportionality Theorem (Thales Theorem): AD / DB = AE / EC ⇒ 3 / 5 = 6 / EC ⇒ 3 × EC = 30 ⇒ EC = 10 cm.',
    importantPoint: 'If a line is drawn parallel to one side of a triangle, it divides the other two sides in the same ratio.',
    formulaUsed: 'AD / DB = AE / EC',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2023,
    marks: 1,
    status: 'PUBLISHED',
  },

  // Chapter 7: Coordinate Geometry
  {
    id: 'CBSE10-MATH-07-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-7',
    topicId: 'coordinate-geometry',
    question: 'The distance of the point P(-6, 8) from the origin is:',
    questionType: 'MCQ',
    options: {
      A: '8',
      B: '2√7',
      C: '10',
      D: '6',
    },
    correctAnswer: 'C',
    explanation: 'The distance of any point (x, y) from the origin (0, 0) is √(x² + y²). Distance = √[(-6)² + 8²] = √(36 + 64) = √100 = 10 units.',
    importantPoint: 'Distance from origin formula: d = √(x² + y²). Distance is always non-negative.',
    formulaUsed: 'd = √[(-6)² + 8²] = 10',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2023,
    marks: 1,
    status: 'PUBLISHED',
  },

  // Chapter 8: Introduction to Trigonometry
  {
    id: 'CBSE10-MATH-08-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-8',
    topicId: 'introduction-to-trigonometry',
    question: 'If tan θ = 4/3, then the value of (sin θ + cos θ) / (sin θ - cos θ) is:',
    questionType: 'MCQ',
    options: {
      A: '7',
      B: '1/7',
      C: '-7',
      D: '7/2',
    },
    correctAnswer: 'A',
    explanation: 'Divide numerator and denominator by cos θ: (tan θ + 1) / (tan θ - 1). Substitute tan θ = 4/3: (4/3 + 1) / (4/3 - 1) = (7/3) / (1/3) = 7.',
    importantPoint: 'Dividing numerator and denominator by cos θ converts rational expressions of sin θ and cos θ into tan θ directly without computing hypotenuse.',
    formulaUsed: '(tan θ + 1) / (tan θ - 1) = (4/3 + 1) / (4/3 - 1) = 7',
    difficulty: 'MODERATE',
    sourceType: 'PYQ',
    year: 2022,
    marks: 1,
    status: 'PUBLISHED',
  },

  // Chapter 9: Some Applications of Trigonometry
  {
    id: 'CBSE10-MATH-09-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-9',
    topicId: 'some-applications-of-trigonometry',
    question: 'If the height of a vertical pole is equal to the length of its shadow on the ground, the angle of elevation of the Sun is:',
    questionType: 'MCQ',
    options: {
      A: '0°',
      B: '30°',
      C: '45°',
      D: '60°',
    },
    correctAnswer: 'C',
    explanation: 'Let height of pole be h and shadow length be s. Given h = s. tan θ = height / shadow = h / s = 1. Since tan 45° = 1, θ = 45°.',
    importantPoint: 'When height = shadow, the angle of elevation of Sun is always 45°.',
    formulaUsed: 'tan θ = h / s = 1 ⇒ θ = 45°',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2020,
    marks: 1,
    status: 'PUBLISHED',
  },

  // Chapter 10: Circles
  {
    id: 'CBSE10-MATH-10-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-10',
    topicId: 'circles',
    question: 'If tangents PA and PB from a point P to a circle with centre O are inclined to each other at angle of 80°, then ∠POA is equal to:',
    questionType: 'MCQ',
    options: {
      A: '50°',
      B: '60°',
      C: '70°',
      D: '80°',
    },
    correctAnswer: 'A',
    explanation: 'In quadrilateral OAPB, OA ⊥ PA and OB ⊥ PB (radius is perpendicular to tangent). ∠OAP = ∠OBP = 90°. Since sum of angles in quadrilateral is 360°: ∠AOB = 180° - 80° = 100°. OP bisects ∠AOB, so ∠POA = 100° / 2 = 50°.',
    importantPoint: 'The angle subtended by tangents at centre and angle between tangents are supplementary: ∠AOB + ∠APB = 180°.',
    formulaUsed: '∠POA = (180° - 80°) / 2 = 50°',
    difficulty: 'MODERATE',
    sourceType: 'PYQ',
    year: 2023,
    marks: 1,
    status: 'PUBLISHED',
  },

  // Chapter 11: Areas Related to Circles
  {
    id: 'CBSE10-MATH-11-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-11',
    topicId: 'areas-related-to-circles',
    question: 'The area of a sector of a circle of radius 6 cm with central angle 60° is: (Take π = 22/7)',
    questionType: 'MCQ',
    options: {
      A: '132/7 cm²',
      B: '144/7 cm²',
      C: '120/7 cm²',
      D: '154/7 cm²',
    },
    correctAnswer: 'A',
    explanation: 'Area of sector = (θ / 360°) × πr² = (60° / 360°) × (22/7) × 6² = (1/6) × (22/7) × 36 = 6 × (22/7) = 132/7 cm².',
    importantPoint: 'Area of sector formula: (θ / 360) × πr².',
    formulaUsed: 'A = (60/360) × (22/7) × 36 = 132/7 cm²',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2023,
    marks: 1,
    status: 'PUBLISHED',
  },

  // Chapter 12: Surface Areas and Volumes
  {
    id: 'CBSE10-MATH-12-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-12',
    topicId: 'surface-areas-and-volumes',
    question: 'Two cubes each of volume 64 cm³ are joined end to end. The surface area of the resulting cuboid is:',
    questionType: 'MCQ',
    options: {
      A: '128 cm²',
      B: '160 cm²',
      C: '192 cm²',
      D: '256 cm²',
    },
    correctAnswer: 'B',
    explanation: 'Let side of cube be a. Volume = a³ = 64 ⇒ a = 4 cm. When two cubes are joined end to end, length of cuboid l = 4 + 4 = 8 cm, breadth b = 4 cm, height h = 4 cm. Surface area of cuboid = 2(lb + bh + hl) = 2(8×4 + 4×4 + 4×8) = 2(32 + 16 + 32) = 2(80) = 160 cm².',
    importantPoint: 'When cubes are joined in a line, only the length changes; breadth and height remain unchanged.',
    formulaUsed: 'TSA = 2(lb + bh + hl) = 2(32 + 16 + 32) = 160 cm²',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2022,
    marks: 1,
    status: 'PUBLISHED',
  },

  // Chapter 13: Statistics
  {
    id: 'CBSE10-MATH-13-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-13',
    topicId: 'statistics',
    question: 'If the mean and the mode of a data are 24 and 12 respectively, then its median is:',
    questionType: 'MCQ',
    options: {
      A: '18',
      B: '20',
      C: '22',
      D: '25',
    },
    correctAnswer: 'B',
    explanation: 'By Empirical relationship: 3 Median = Mode + 2 Mean. 3 Median = 12 + 2(24) = 12 + 48 = 60 ⇒ Median = 60 / 3 = 20.',
    importantPoint: 'Empirical formula: 3 Median = Mode + 2 Mean.',
    formulaUsed: 'Median = (Mode + 2 Mean) / 3 = (12 + 48) / 3 = 20',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2023,
    marks: 1,
    status: 'PUBLISHED',
  },

  // Chapter 14: Probability
  {
    id: 'CBSE10-MATH-14-001',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-14',
    topicId: 'probability',
    question: 'A card is drawn from a well-shuffled deck of 52 playing cards. The probability of getting a black face card is:',
    questionType: 'MCQ',
    options: {
      A: '3/13',
      B: '3/26',
      C: '1/26',
      D: '3/52',
    },
    correctAnswer: 'B',
    explanation: 'Total cards n(S) = 52. Face cards are King, Queen, Jack (3 per suit). There are 2 black suits (Spades and Clubs), so total black face cards n(E) = 2 × 3 = 6. Probability P(E) = 6 / 52 = 3 / 26.',
    importantPoint: 'Total face cards = 12 (6 red, 6 black). P(black face card) = 6/52 = 3/26.',
    formulaUsed: 'P(E) = 6 / 52 = 3 / 26',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2023,
    marks: 1,
    status: 'PUBLISHED',
  },
  {
    id: 'CBSE10-MATH-14-002',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-14',
    topicId: 'probability',
    question: 'Which of the following numbers CANNOT be the probability of an event?',
    questionType: 'MCQ',
    options: {
      A: '2/3',
      B: '-1.5',
      C: '15%',
      D: '0.7',
    },
    correctAnswer: 'B',
    explanation: 'Probability of any event E always satisfies 0 ≤ P(E) ≤ 1. It can never be negative and can never be greater than 1. Therefore, -1.5 cannot be a probability.',
    importantPoint: '0 ≤ P(E) ≤ 1 is the fundamental axiom of probability.',
    difficulty: 'EASY',
    sourceType: 'PYQ',
    year: 2021,
    marks: 1,
    status: 'PUBLISHED',
  },
];

/**
 * Resolves a chapter by ID, canonicalId, or slug
 */
export function getMathsChapter(idOrSlug: string): MathsChapter | undefined {
  if (!idOrSlug) return undefined;
  const norm = idOrSlug.toLowerCase().trim();

  // 1. Exact ID match
  const byId = CBSE_CLASS_10_MATHS_CHAPTERS.find(
    (c) => c.id.toLowerCase() === norm || c.canonicalId.toLowerCase() === norm
  );
  if (byId) return byId;

  // 2. Slug match
  const bySlug = CBSE_CLASS_10_MATHS_CHAPTERS.find(
    (c) => c.slug.toLowerCase() === norm || norm.includes(c.slug.toLowerCase())
  );
  if (bySlug) return bySlug;

  // 3. Numeric chapter match (e.g. "chapter-1", "ch-1", "1")
  const num = parseInt(norm.replace(/\D/g, ''), 10);
  if (!isNaN(num) && num >= 1 && num <= CBSE_CLASS_10_MATHS_CHAPTERS.length) {
    return CBSE_CLASS_10_MATHS_CHAPTERS[num - 1];
  }

  return undefined;
}

/**
 * Gets all questions for a specific chapter and optional question type
 */
export function getMathsQuestions(
  chapterIdOrSlug: string,
  questionType?: MathsQuestionType
): MathsQuestion[] {
  const chapter = getMathsChapter(chapterIdOrSlug);
  if (!chapter) return [];

  return CBSE_CLASS_10_MATHS_CURATED_QUESTIONS.filter((q) => {
    const matchChapter =
      q.chapterId === chapter.id ||
      q.topicId === chapter.slug ||
      q.chapterId === chapter.canonicalId;
    if (!matchChapter) return false;
    if (questionType && q.questionType !== questionType) return false;
    return true;
  });
}

/**
 * Computes chapter-level progress across all activities and questions
 */
export function calculateMathsChapterProgress(chapterIdOrSlug: string): MathsChapterProgress {
  const chapter = getMathsChapter(chapterIdOrSlug);
  const targetId = chapter?.id || chapterIdOrSlug;

  // 1. Study Material Progress
  const studyMat = getStudyMaterial(targetId);
  let studyProgress = 0;
  if (typeof window !== 'undefined') {
    try {
      const readingMap = JSON.parse(
        window.localStorage.getItem('examsetu4u-study-reading-progress') || '{}'
      );
      studyProgress = typeof readingMap[targetId] === 'number' ? readingMap[targetId] : 0;
    } catch {
      studyProgress = 0;
    }
  }

  // 2. MCQ Progress: check real questions in Quiz Engine
  const mcqQuestions = getFilteredQuestions({
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    topicId: targetId,
  });
  const totalMCQs = mcqQuestions.length;

  let mcqProgress = 0;
  if (totalMCQs > 0) {
    const quizHistory = loadQuizHistory().filter(
      (h) => h.topicId === targetId || h.subjectId === 'cbse-class-10-mathematics'
    );
    if (quizHistory.length > 0) {
      const best = Math.max(...quizHistory.map((h) => h.accuracy || 0));
      mcqProgress = Math.min(100, best);
    }
  }

  // 3. Assertion-Reason Progress
  const arQuestions = getMathsQuestions(targetId, 'ASSERTION_REASON');
  const assertionReasonProgress = arQuestions.length > 0 ? 0 : 0;

  // 4. Short Answer Progress
  const saQuestions = [
    ...getMathsQuestions(targetId, 'VERY_SHORT'),
    ...getMathsQuestions(targetId, 'SHORT_ANSWER'),
  ];
  const shortAnswerProgress = saQuestions.length > 0 ? 0 : 0;

  // 5. Case-Based Progress
  const caseQuestions = getMathsQuestions(targetId, 'CASE_BASED');
  const caseBasedProgress = caseQuestions.length > 0 ? 0 : 0;

  // 6. Long Answer Progress
  const laQuestions = getMathsQuestions(targetId, 'LONG_ANSWER');
  const longAnswerProgress = laQuestions.length > 0 ? 0 : 0;

  // 7. PYQ Progress: check actual PYQs from PYQ store
  const pyqQuestionsList = getPYQsForTopic(targetId);
  let pyqProgress = 0;
  if (pyqQuestionsList.length > 0) {
    const summary = summarizePYQProgress(pyqQuestionsList.map((q) => q.id));
    pyqProgress = summary.answered > 0 ? Math.round((summary.correct / summary.answered) * 100) : 0;
  }

  // 8. Chapter Test Progress
  const chapterTestProgress = 0;

  // Total available questions
  const availableQuestionsCount =
    totalMCQs +
    arQuestions.length +
    saQuestions.length +
    caseQuestions.length +
    laQuestions.length +
    pyqQuestionsList.length;

  const hasContent = Boolean(studyMat) || availableQuestionsCount > 0;

  // Overall progress is derived from available content
  const activeWeights: { weight: number; value: number }[] = [];
  if (studyMat) activeWeights.push({ weight: 20, value: studyProgress });
  if (totalMCQs > 0) activeWeights.push({ weight: 30, value: mcqProgress });
  if (pyqQuestionsList.length > 0) activeWeights.push({ weight: 30, value: pyqProgress });
  if (arQuestions.length > 0) activeWeights.push({ weight: 20, value: assertionReasonProgress });

  let overallProgress = 0;
  if (activeWeights.length > 0) {
    const totalWeight = activeWeights.reduce((acc, w) => acc + w.weight, 0);
    const weightedSum = activeWeights.reduce((acc, w) => acc + w.weight * w.value, 0);
    overallProgress = Math.round(weightedSum / totalWeight);
  }

  return {
    chapterId: targetId,
    studyMaterialProgress: studyProgress,
    mcqProgress,
    totalMCQs,
    assertionReasonProgress,
    shortAnswerProgress,
    caseBasedProgress,
    longAnswerProgress,
    pyqProgress,
    chapterTestProgress,
    overallProgress,
    hasContent,
    availableQuestionsCount,
  };
}
