import { getStudyMaterial, getTopic } from '@/data/curriculum';
import { getPYQsForTopic } from '@/data/pyq';
import { getFilteredQuestions } from '@/data/quiz/questions';
import { loadQuizHistory } from '@/lib/quiz-storage';
import { summarizePYQProgress } from '@/lib/progress';
import type {
  ScienceChapter,
  ScienceChapterProgress,
  ScienceQuestion,
  ScienceQuestionType,
  ScienceSectionKey,
  ScienceSectionMetadata,
} from './types';

/**
 * Official CBSE Class 10 Science Syllabus Chapters (NCERT / CBSE Board Exam)
 * Total 13 chapters across 5 major units. Total Marks: 80 (Theory) + 20 (Internal)
 */
export const CBSE_CLASS_10_SCIENCE_CHAPTERS: ScienceChapter[] = [
  // Unit I: Chemical Substances - Nature and Behaviour (25 Marks)
  {
    id: 'cbse-class-10-science-1',
    canonicalId: 'cbse-class-10-science-1',
    chapterNumber: 1,
    slug: 'chemical-reactions-and-equations',
    title: 'Chemical Reactions and Equations',
    hindiTitle: 'रासायनिक अभिक्रियाएँ एवं समीकरण',
    unitNumber: 1,
    unitName: 'Unit I: Chemical Substances - Nature and Behaviour',
    unitHindiName: 'इकाई 1: रासायनिक पदार्थ - प्रकृति एवं व्यवहार',
    shortDescription:
      'Chemical equations, balanced chemical equations, implications of a balanced chemical equation, types of chemical reactions: combination, decomposition, displacement, double displacement, precipitation, neutralization, oxidation and reduction.',
    syllabusTopics: [
      'Writing and Balancing Chemical Equations',
      'Combination Reactions & Exothermic Processes',
      'Decomposition Reactions (Thermal, Electrolytic, Photolytic)',
      'Displacement & Double Displacement Reactions',
      'Oxidation, Reduction, Corrosion & Rancidity',
    ],
    weightageMarks: 6,
  },
  {
    id: 'cbse-class-10-science-2',
    canonicalId: 'cbse-class-10-science-2',
    chapterNumber: 2,
    slug: 'acids-bases-and-salts',
    title: 'Acids, Bases and Salts',
    hindiTitle: 'अम्ल, क्षारक एवं लवण',
    unitNumber: 1,
    unitName: 'Unit I: Chemical Substances - Nature and Behaviour',
    unitHindiName: 'इकाई 1: रासायनिक पदार्थ - प्रकृति एवं व्यवहार',
    shortDescription:
      'Their definitions in terms of furnishing of H+ and OH- ions, general properties, examples and uses, concept of pH scale, importance of pH in everyday life; preparation and uses of Sodium Hydroxide, Bleaching powder, Baking soda, Washing soda and Plaster of Paris.',
    syllabusTopics: [
      'Chemical Properties of Acids and Bases',
      'Reaction with Metals, Carbonates and Hydrogencarbonates',
      'pH Scale and its Importance in Daily Life',
      'Salts Family, pH of Salts and Common Salt Chemicals',
      'Bleaching Powder, Baking Soda, Washing Soda & Plaster of Paris',
    ],
    weightageMarks: 7,
  },
  {
    id: 'cbse-class-10-science-3',
    canonicalId: 'cbse-class-10-science-3',
    chapterNumber: 3,
    slug: 'metals-and-non-metals',
    title: 'Metals and Non-metals',
    hindiTitle: 'धातु एवं अधातु',
    unitNumber: 1,
    unitName: 'Unit I: Chemical Substances - Nature and Behaviour',
    unitHindiName: 'इकाई 1: रासायनिक पदार्थ - प्रकृति एवं व्यवहार',
    shortDescription:
      'Properties of metals and non-metals; Reactivity series; Formation and properties of ionic compounds; Basic metallurgical processes; Corrosion and its prevention.',
    syllabusTopics: [
      'Physical & Chemical Properties of Metals and Non-metals',
      'Reactivity Series & Metal Displacement',
      'Ionic Bonding and Properties of Ionic Compounds',
      'Occurrence of Metals & Extraction (Roasting, Calcination)',
      'Corrosion and Prevention Methods (Galvanization, Alloying)',
    ],
    weightageMarks: 6,
  },
  {
    id: 'cbse-class-10-science-4',
    canonicalId: 'cbse-class-10-science-4',
    chapterNumber: 4,
    slug: 'carbon-and-its-compounds',
    title: 'Carbon and its Compounds',
    hindiTitle: 'कार्बन एवं उसके यौगिक',
    unitNumber: 1,
    unitName: 'Unit I: Chemical Substances - Nature and Behaviour',
    unitHindiName: 'इकाई 1: रासायनिक पदार्थ - प्रकृति एवं व्यवहार',
    shortDescription:
      'Covalent bonding in carbon compounds. Versatile nature of carbon. Homologous series. Nomenclature of carbon compounds containing functional groups, difference between saturated and unsaturated hydrocarbons. Chemical properties of carbon compounds. Ethanol and Ethanoic acid, Soaps and detergents.',
    syllabusTopics: [
      'Covalent Bonding & Versatility of Carbon (Catenation, Tetravalency)',
      'Saturated & Unsaturated Hydrocarbons (Alkanes, Alkenes, Alkynes)',
      'Homologous Series and Functional Groups',
      'Chemical Properties: Combustion, Oxidation, Addition & Substitution',
      'Properties of Ethanol, Ethanoic Acid, Soaps & Detergents',
    ],
    weightageMarks: 6,
  },

  // Unit II: World of Living (25 Marks)
  {
    id: 'cbse-class-10-science-5',
    canonicalId: 'cbse-class-10-science-5',
    chapterNumber: 5,
    slug: 'life-processes',
    title: 'Life Processes',
    hindiTitle: 'जैव प्रक्रम',
    unitNumber: 2,
    unitName: 'Unit II: World of Living',
    unitHindiName: 'इकाई 2: जैव जगत',
    shortDescription:
      '‘Living Being’. Basic concept of nutrition, respiration, transport and excretion in plants and animals.',
    syllabusTopics: [
      'Autotrophic Nutrition (Photosynthesis Mechanism & Stomata)',
      'Heterotrophic Nutrition & Human Alimentary Canal',
      'Respiration: Aerobic, Anaerobic & Human Respiratory System',
      'Circulation in Humans (Double Circulation, Heart, Blood Vessels)',
      'Transportation in Plants (Xylem & Phloem)',
      'Excretion in Humans (Nephron Functioning) & Plants',
    ],
    weightageMarks: 9,
  },
  {
    id: 'cbse-class-10-science-6',
    canonicalId: 'cbse-class-10-science-6',
    chapterNumber: 6,
    slug: 'control-and-coordination',
    title: 'Control and Coordination',
    hindiTitle: 'नियंत्रण एवं समन्वय',
    unitNumber: 2,
    unitName: 'Unit II: World of Living',
    unitHindiName: 'इकाई 2: जैव जगत',
    shortDescription:
      'Tropic movements in plants; Introduction of plant hormones; Control and co-ordination in animals: Nervous system; Voluntary, involuntary and reflex action; Chemical co-ordination: animal hormones.',
    syllabusTopics: [
      'Nervous System: Neuron Structure, Synapse & Nerve Impulse',
      'Reflex Action and Reflex Arc',
      'Human Brain: Forebrain, Midbrain & Hindbrain Functions',
      'Coordination in Plants: Tropic & Nastic Movements, Phytohormones',
      'Endocrine System & Hormones in Animals',
    ],
    weightageMarks: 6,
  },
  {
    id: 'cbse-class-10-science-7',
    canonicalId: 'cbse-class-10-science-7',
    chapterNumber: 7,
    slug: 'how-do-organisms-reproduce',
    title: 'How do Organisms Reproduce?',
    hindiTitle: 'जीव जनन कैसे करते हैं?',
    unitNumber: 2,
    unitName: 'Unit II: World of Living',
    unitHindiName: 'इकाई 2: जैव जगत',
    shortDescription:
      'Reproduction in animals and plants (asexual and sexual) reproductive health - need and methods of family planning. Safe sex vs HIV/AIDS. Child bearing and women’s health.',
    syllabusTopics: [
      'Modes of Asexual Reproduction (Fission, Budding, Spore, Vegetative)',
      'Sexual Reproduction in Flowering Plants (Pollination & Fertilization)',
      'Male & Female Human Reproductive Systems',
      'Fertilization, Embryo Development & Menstruation',
      'Reproductive Health, Contraceptive Methods & STDs',
    ],
    weightageMarks: 6,
  },
  {
    id: 'cbse-class-10-science-8',
    canonicalId: 'cbse-class-10-science-8',
    chapterNumber: 8,
    slug: 'heredity',
    title: 'Heredity',
    hindiTitle: 'आनुवंशिकता',
    unitNumber: 2,
    unitName: 'Unit II: World of Living',
    unitHindiName: 'इकाई 2: जैव जगत',
    shortDescription:
      'Heredity; Mendel’s contribution- Laws for inheritance of traits: Sex determination: brief introduction.',
    syllabusTopics: [
      'Accumulation of Variation during Reproduction',
      'Heredity and Inherited Traits',
      "Mendel's Experiments: Monohybrid & Dihybrid Crosses",
      'Laws of Inheritance (Dominance, Segregation, Independent Assortment)',
      'Mechanism of Sex Determination in Humans',
    ],
    weightageMarks: 4,
  },

  // Unit III: Natural Phenomena (12 Marks)
  {
    id: 'cbse-class-10-science-9',
    canonicalId: 'cbse-class-10-science-9',
    chapterNumber: 9,
    slug: 'light-reflection-and-refraction',
    title: 'Light – Reflection and Refraction',
    hindiTitle: 'प्रकाश – परावर्तन तथा अपवर्तन',
    unitNumber: 3,
    unitName: 'Unit III: Natural Phenomena',
    unitHindiName: 'इकाई 3: प्राकृतिक घटनाएँ',
    shortDescription:
      'Reflection of light by curved surfaces; Images formed by spherical mirrors, centre of curvature, principal axis, principal focus, focal length, mirror formula, magnification. Refraction; Laws of refraction, refractive index. Refraction of light by spherical lens; Image formed by spherical lenses; Lens formula; Magnification. Power of a lens.',
    syllabusTopics: [
      'Reflection by Spherical Mirrors (Concave & Convex Ray Diagrams)',
      'Mirror Formula and Magnification Calculations',
      'Refraction of Light, Snell’s Law & Refractive Index',
      'Refraction through Spherical Lenses (Convex & Concave Ray Diagrams)',
      'Lens Formula, Magnification and Power of a Lens (Dioptre)',
    ],
    weightageMarks: 8,
  },
  {
    id: 'cbse-class-10-science-10',
    canonicalId: 'cbse-class-10-science-10',
    chapterNumber: 10,
    slug: 'the-human-eye-and-the-colourful-world',
    title: 'The Human Eye and the Colourful World',
    hindiTitle: 'मानव नेत्र तथा रंगबिरंगा संसार',
    unitNumber: 3,
    unitName: 'Unit III: Natural Phenomena',
    unitHindiName: 'इकाई 3: प्राकृतिक घटनाएँ',
    shortDescription:
      'Functioning of a lens in human eye, defects of vision and their corrections, applications of spherical mirrors and lenses. Refraction of light through a prism, dispersion of light, scattering of light, applications in daily life (excluding colour of the sun at sunrise and sunset).',
    syllabusTopics: [
      'Structure of Human Eye & Accommodation Power',
      'Defects of Vision: Myopia, Hypermetropia, Presbyopia & Corrections',
      'Refraction of Light through a Triangular Glass Prism',
      'Dispersion of White Light and Rainbow Formation',
      'Atmospheric Refraction (Twinkling of Stars, Advanced Sunrise)',
      'Scattering of Light & Tyndall Effect (Blue Sky Reason)',
    ],
    weightageMarks: 4,
  },

  // Unit IV: Effects of Current (13 Marks)
  {
    id: 'cbse-class-10-science-11',
    canonicalId: 'cbse-class-10-science-11',
    chapterNumber: 11,
    slug: 'electricity',
    title: 'Electricity',
    hindiTitle: 'विद्युत',
    unitNumber: 4,
    unitName: 'Unit IV: Effects of Current',
    unitHindiName: 'इकाई 4: विद्युत के प्रभाव',
    shortDescription:
      'Electric current, potential difference and electric current. Ohm’s law; Resistance, Resistivity, Factors on which the resistance of a conductor depends. Series combination of resistors, parallel combination of resistors and its applications in daily life. Heating effect of electric current and its applications in daily life. Electric power, Interrelation between P, V, I and R.',
    syllabusTopics: [
      'Electric Current, Potential Difference & Electric Circuit Symbols',
      "Ohm's Law, Resistance and V-I Graph",
      'Factors Affecting Resistance & Specific Resistivity',
      'Resistors in Series and Parallel Combinations & Equivalent Resistance',
      "Joule's Law of Heating Effect of Electric Current",
      'Electric Power (P = VI = I²R = V²/R) and Commercial Unit (kWh)',
    ],
    weightageMarks: 7,
  },
  {
    id: 'cbse-class-10-science-12',
    canonicalId: 'cbse-class-10-science-12',
    chapterNumber: 12,
    slug: 'magnetic-effects-of-electric-current',
    title: 'Magnetic Effects of Electric Current',
    hindiTitle: 'विद्युत धारा के चुंबकीय प्रभाव',
    unitNumber: 4,
    unitName: 'Unit IV: Effects of Current',
    unitHindiName: 'इकाई 4: विद्युत के प्रभाव',
    shortDescription:
      'Magnetic field, field lines, field due to a current carrying conductor, field due to current carrying coil or solenoid; Force on current carrying conductor, Fleming’s Left Hand Rule, Direct current. Alternating current: frequency of AC. Advantage of AC over DC. Domestic electric circuits.',
    syllabusTopics: [
      'Magnetic Field and Magnetic Field Lines Properties',
      'Magnetic Field due to Straight Wire, Circular Loop & Solenoid',
      'Right Hand Thumb Rule & Electromagnets',
      'Force on a Current-Carrying Conductor & Fleming’s Left-Hand Rule',
      'Direct Current (DC) vs Alternating Current (AC)',
      'Domestic Electric Circuits (Live, Neutral, Earth Wires, Fuses, Earthing)',
    ],
    weightageMarks: 6,
  },

  // Unit V: Natural Resources (5 Marks)
  {
    id: 'cbse-class-10-science-13',
    canonicalId: 'cbse-class-10-science-13',
    chapterNumber: 13,
    slug: 'our-environment',
    title: 'Our Environment',
    hindiTitle: 'हमारा पर्यावरण',
    unitNumber: 5,
    unitName: 'Unit V: Natural Resources',
    unitHindiName: 'इकाई 5: प्राकृतिक संसाधन',
    shortDescription:
      'Eco-system, Environmental problems, Ozone depletion, waste production and their solutions. Biodegradable and non-biodegradable substances.',
    syllabusTopics: [
      'Ecosystem Components (Biotic and Abiotic Factors)',
      'Food Chains, Food Webs and Trophic Levels',
      '10% Law of Energy Flow in an Ecosystem',
      'Biological Magnification of Harmful Chemicals',
      'Depletion of Ozone Layer & CFCs Impact',
      'Biodegradable vs Non-Biodegradable Waste & Solid Waste Management',
    ],
    weightageMarks: 5,
  },
];

/**
 * 11 Mandatory Learning Sections per Chapter in Exact User-Requested Order
 */
export const SCIENCE_CHAPTER_SECTIONS: ScienceSectionMetadata[] = [
  {
    key: 'study-material',
    order: 1,
    icon: '📖',
    title: 'Study Material',
    hindiTitle: 'अध्ययन सामग्री व संकल्पना नोट्स',
    description: 'NCERT आधारित विस्तृत संकल्पना नोट्स, सूत्र, आरेख और मुख्य परीक्षा बिंदु।',
    badge: 'अवधारणाएं (Concepts)',
    emptyHeading: 'अभी इस अध्याय के Study Material उपलब्ध नहीं हैं।',
    emptyDescription: 'इस अध्याय की NCERT आधारित विस्तृत अध्ययन सामग्री एवं सारांश संकलन कार्य प्रगति पर है।',
    targetRouteSegment: 'study-material',
  },
  {
    key: 'mcq',
    order: 2,
    icon: '📝',
    title: 'MCQ / Objective Questions',
    hindiTitle: 'वस्तुनिष्ठ बहुविकल्पीय प्रश्न',
    description: 'CBSE बोर्ड पैटर्न पर आधारित 1-अंक के वस्तुनिष्ठ प्रश्न एवं त्वरित अभ्यास।',
    badge: '1 अंक (1 Mark)',
    emptyHeading: 'अभी MCQ उपलब्ध नहीं हैं।',
    emptyDescription: 'इस अध्याय के बहुविकल्पीय प्रश्न बैंक तैयार किया जा रहा है। (0 questions available)',
    targetRouteSegment: 'mcq',
  },
  {
    key: 'assertion-reason',
    order: 3,
    icon: '⚡',
    title: 'Assertion–Reason',
    hindiTitle: 'अभिकथन एवं कारण प्रश्न',
    description: 'CBSE बोर्ड के लिए विशेष अभिकथन और कारण आधारित वैचारिक प्रश्न।',
    badge: 'तर्क शक्ति (Logic)',
    emptyHeading: 'अभी Assertion–Reason प्रश्न उपलब्ध नहीं हैं।',
    emptyDescription: 'इस अध्याय के अभिकथन और कारण (Assertion & Reason) प्रश्न शीघ्र जोड़े जाएंगे। (0 questions available)',
    targetRouteSegment: 'assertion-reason',
  },
  {
    key: 'very-short',
    order: 4,
    icon: '✍️',
    title: 'Very Short Answer',
    hindiTitle: 'अति लघु उत्तरीय प्रश्न',
    description: '1-2 पंक्तियों वाले सीधे सैद्धांतिक व परिभाषिक प्रश्न (1 अंक)।',
    badge: '1 अंक (VSA)',
    emptyHeading: 'अभी Very Short Answer प्रश्न उपलब्ध नहीं हैं।',
    emptyDescription: 'अति लघु उत्तरीय प्रश्नों का आदर्श उत्तर सहित संकलन शीघ्र उपलब्ध होगा।',
    targetRouteSegment: 'very-short',
  },
  {
    key: 'short-answer',
    order: 5,
    icon: '✍️',
    title: 'Short Answer Questions',
    hindiTitle: 'लघु उत्तरीय प्रश्न (SA-I व SA-II)',
    description: '2 और 3 अंकों वाले वैज्ञानिक कारण, विभेद और संख्यात्मक प्रश्न।',
    badge: '2-3 अंक (SA)',
    emptyHeading: 'अभी Short Answer प्रश्न उपलब्ध नहीं हैं।',
    emptyDescription: '2 से 3 अंकों वाले प्रश्नों का स्टेप-बाय-स्टेप हल संकलन कार्य प्रगति पर है।',
    targetRouteSegment: 'short-answer',
  },
  {
    key: 'case-based',
    order: 6,
    icon: '📊',
    title: 'Case-Based / Source-Based Questions',
    hindiTitle: 'केस आधारित / स्रोत आधारित प्रश्न',
    description: 'CBSE का अनिवार्य 4-अंकों वाला केस-स्टडी व प्रयोगात्मक विश्लेषण प्रश्न खंड।',
    badge: '4 अंक (Case Study)',
    emptyHeading: 'अभी Case-Based प्रश्न उपलब्ध नहीं हैं।',
    emptyDescription: 'अनुच्छेद, आरेख एवं डेटा पर आधारित केस स्टडी प्रश्न जल्द जोड़े जाएंगे।',
    targetRouteSegment: 'case-based',
  },
  {
    key: 'long-answer',
    order: 7,
    icon: '📚',
    title: 'Long Answer Questions',
    hindiTitle: 'दीर्घ उत्तरीय प्रश्न',
    description: '5 अंकों के विस्तृत सैद्धांतिक, आरेख व समग्र विश्लेषण वाले प्रश्न।',
    badge: '5 अंक (5 Marks)',
    emptyHeading: 'अभी Long Answer प्रश्न उपलब्ध नहीं हैं।',
    emptyDescription: '5 अंकों वाले दीर्घ उत्तरीय प्रश्नों की रूपरेखा एवं मॉडल उत्तर जल्द उपलब्ध होंगे।',
    targetRouteSegment: 'long-answer',
  },
  {
    key: 'pyq',
    order: 8,
    icon: '🏆',
    title: 'Previous Year Questions',
    hindiTitle: 'विगत वर्षों के बोर्ड प्रश्न (PYQ)',
    description: 'विगत 10 वर्षों के CBSE बोर्ड परीक्षा में पूछे गए वास्तविक प्रश्न।',
    badge: 'Board PYQs',
    emptyHeading: 'इस अध्याय के PYQ जल्द उपलब्ध होंगे।',
    emptyDescription: 'विगत वर्षों के CBSE बोर्ड प्रश्न पत्रों का अध्याय-वार संकलन तैयार किया जा रहा है।',
    targetRouteSegment: 'pyq',
  },
  {
    key: 'chapter-test',
    order: 9,
    icon: '🎯',
    title: 'Chapter Test',
    hindiTitle: 'अध्याय का संपूर्ण टेस्ट',
    description: 'समयबद्ध ऑनलाइन मूल्यांकन जो आपकी तैयारी और सटीकता की जांच करता है।',
    badge: 'समयबद्ध टेस्ट (Timed)',
    emptyHeading: 'इस अध्याय का टेस्ट जल्द उपलब्ध होगा।',
    emptyDescription: 'इस अध्याय का 20 प्रश्नों का समयबद्ध अध्याय टेस्ट जल्द उपलब्ध होगा।',
    targetRouteSegment: 'chapter-test',
  },
  {
    key: 'revision',
    order: 10,
    icon: '🔄',
    title: 'Revision',
    hindiTitle: 'त्वरित पुनरावलोकन व मुख्य सूत्र',
    description: 'कमजोर क्षेत्रों, माइंड मैप्स और प्रमुख सूत्रों का त्वरित रिवीजन।',
    badge: 'त्वरित सारांश (Quick)',
    emptyHeading: 'इस अध्याय का रिवीजन मॉड्यूल तैयार किया जा रहा है।',
    emptyDescription: 'रिवीजन फ्लैशकार्ड, सूत्र सूची और माइंड मैप जल्द सक्रिय होंगे।',
    targetRouteSegment: 'revision',
  },
  {
    key: 'mistake-practice',
    order: 11,
    icon: '❌',
    title: 'Mistake Practice',
    hindiTitle: 'त्रुटि सुधार अभ्यास (Mistake Book)',
    description: 'क्विज़ और टेस्ट में गलत हुए प्रश्नों का लक्षित दोहराव और सुधार।',
    badge: 'गलतियों का सुधार',
    emptyHeading: 'अभी इस अध्याय में कोई त्रुटि दर्ज नहीं है।',
    emptyDescription: 'जब आप क्विज़ या टेस्ट हल करेंगे, तब आपके द्वारा गलत किए गए प्रश्न स्वतः यहाँ प्रदर्शित होंगे।',
    targetRouteSegment: 'mistake-practice',
  },
];

/**
 * Question Store Registry
 * Future questions (from Google Sheets or database) plug in here.
 * Never stores tens of thousands of questions in localStorage.
 */
let registeredScienceQuestions: ScienceQuestion[] = [];

export function registerScienceQuestions(questions: ScienceQuestion[]) {
  registeredScienceQuestions = questions;
}

export function getScienceQuestions(
  chapterId: string,
  questionType?: ScienceQuestionType
): ScienceQuestion[] {
  return registeredScienceQuestions.filter((q) => {
    if (q.chapterId !== chapterId && q.topicId !== chapterId) return false;
    if (questionType && q.questionType !== questionType) return false;
    return true;
  });
}

/**
 * Helper: Find chapter by id, slug, or number
 */
export function getScienceChapter(identifier: string | number): ScienceChapter | undefined {
  if (typeof identifier === 'number') {
    return CBSE_CLASS_10_SCIENCE_CHAPTERS.find((c) => c.chapterNumber === identifier);
  }
  const norm = identifier.toLowerCase().trim();
  return (
    CBSE_CLASS_10_SCIENCE_CHAPTERS.find((c) => c.id === norm) ||
    CBSE_CLASS_10_SCIENCE_CHAPTERS.find((c) => c.slug === norm) ||
    CBSE_CLASS_10_SCIENCE_CHAPTERS.find((c) => c.canonicalId === norm) ||
    CBSE_CLASS_10_SCIENCE_CHAPTERS.find((c) => String(c.chapterNumber) === norm) ||
    CBSE_CLASS_10_SCIENCE_CHAPTERS.find((c) => `chapter-${c.chapterNumber}` === norm)
  );
}

/**
 * Calculate actual chapter progress from ExamSetu4U progress architecture
 * NEVER returns fake numbers or hardcoded percentages.
 */
export function calculateScienceChapterProgress(chapterId: string): ScienceChapterProgress {
  const chapter = getScienceChapter(chapterId);
  const targetId = chapter?.id || chapterId;

  // 1. Study Material: check if material exists and get reading progress
  const studyMat = getStudyMaterial(targetId);
  let studyProgress = 0;
  if (studyMat && typeof window !== 'undefined') {
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
    subjectId: 'cbse-class-10-science',
    topicId: targetId,
  });
  const customMCQs = getScienceQuestions(targetId, 'MCQ');
  const totalMCQs = mcqQuestions.length + customMCQs.length;

  let mcqProgress = 0;
  if (totalMCQs > 0) {
    const quizHistory = loadQuizHistory().filter(
      (h) => h.topicId === targetId || h.subjectId === 'cbse-class-10-science'
    );
    if (quizHistory.length > 0) {
      const best = Math.max(...quizHistory.map((h) => h.accuracy || 0));
      mcqProgress = Math.min(100, best);
    }
  }

  // 3. Assertion-Reason Progress
  const arQuestions = getScienceQuestions(targetId, 'ASSERTION_REASON');
  const assertionReasonProgress = arQuestions.length > 0 ? 0 : 0;

  // 4. Short Answer Progress
  const saQuestions = [
    ...getScienceQuestions(targetId, 'VERY_SHORT'),
    ...getScienceQuestions(targetId, 'SHORT_ANSWER'),
  ];
  const shortAnswerProgress = saQuestions.length > 0 ? 0 : 0;

  // 5. Case-Based Progress
  const caseQuestions = getScienceQuestions(targetId, 'CASE_BASED');
  const caseBasedProgress = caseQuestions.length > 0 ? 0 : 0;

  // 6. Long Answer Progress
  const laQuestions = getScienceQuestions(targetId, 'LONG_ANSWER');
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

  // Overall progress is derived ONLY from available content/activities
  const activeWeights: { weight: number; value: number }[] = [];
  if (studyMat) activeWeights.push({ weight: 20, value: studyProgress });
  if (totalMCQs > 0) activeWeights.push({ weight: 30, value: mcqProgress });
  if (pyqQuestionsList.length > 0) activeWeights.push({ weight: 25, value: pyqProgress });
  if (arQuestions.length > 0) activeWeights.push({ weight: 10, value: assertionReasonProgress });
  if (saQuestions.length > 0 || caseQuestions.length > 0 || laQuestions.length > 0) {
    activeWeights.push({ weight: 15, value: shortAnswerProgress });
  }

  let overallProgress = 0;
  if (activeWeights.length > 0) {
    const totalWeight = activeWeights.reduce((acc, curr) => acc + curr.weight, 0);
    const weightedSum = activeWeights.reduce((acc, curr) => acc + (curr.value * curr.weight), 0);
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
