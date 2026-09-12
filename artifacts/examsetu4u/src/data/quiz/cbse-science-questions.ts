import type { MCQQuestion } from './types';

export const cbseScienceQuestions: MCQQuestion[] = [
  // -------------------------------------------------------------------------
  // Chapter 1: Chemical Reactions and Equations (cbse-class-10-science-1)
  // -------------------------------------------------------------------------
  {
    id: 'cbse10-sci-01',
    examId: 'cbse-class-10',
    examName: 'CBSE Class 10',
    subjectId: 'cbse-class-10-science',
    topicId: 'cbse-class-10-science-1',
    question: 'When aqueous solutions of Barium Chloride (BaCl₂) and Sodium Sulphate (Na₂SO₄) are mixed, a white precipitate is formed. What is the chemical formula of this white precipitate?',
    options: {
      A: 'BaSO₄ (Barium Sulphate)',
      B: 'NaCl (Sodium Chloride)',
      C: 'BaS (Barium Sulphide)',
      D: 'Na₂SO₃ (Sodium Sulphite)',
    },
    correctAnswer: 'A',
    explanation: 'BaCl₂(aq) + Na₂SO₄(aq) → BaSO₄(s)↓ + 2NaCl(aq). This is a double displacement and precipitation reaction. Barium Sulphate (BaSO₄) is insoluble in water and separates out as a white precipitate.',
    importantPoint: 'Precipitation reactions involve the exchange of ions between two aqueous compounds producing an insoluble solid product.',
    additionalFact: 'BaSO₄ is used in medical imaging (Barium meal) because of its insolubility and high radiopacity.',
    commonMistake: 'Thinking NaCl is the precipitate, whereas NaCl is completely soluble in water.',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
  {
    id: 'cbse10-sci-02',
    examId: 'cbse-class-10',
    examName: 'CBSE Class 10',
    subjectId: 'cbse-class-10-science',
    topicId: 'cbse-class-10-science-1',
    question: 'Respiration in living organisms is considered which type of reaction?',
    options: {
      A: 'Exothermic combination reaction',
      B: 'Endothermic decomposition reaction',
      C: 'Exothermic oxidation reaction',
      D: 'Photochemical reaction',
    },
    correctAnswer: 'C',
    explanation: 'During respiration, glucose combines with oxygen in the cells of our body and releases energy: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy (ATP). Since energy is released and glucose is oxidized, respiration is an exothermic oxidation reaction.',
    importantPoint: 'Respiration = Exothermic (releases energy); Photosynthesis = Endothermic (absorbs solar energy).',
    additionalFact: 'Decomposition of vegetable matter into compost is also an example of an exothermic reaction.',
    commonMistake: 'Confusing respiration with photosynthesis and marking it as endothermic.',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },

  // -------------------------------------------------------------------------
  // Chapter 2: Acids, Bases and Salts (cbse-class-10-science-2)
  // -------------------------------------------------------------------------
  {
    id: 'cbse10-sci-03',
    examId: 'cbse-class-10',
    examName: 'CBSE Class 10',
    subjectId: 'cbse-class-10-science',
    topicId: 'cbse-class-10-science-2',
    question: 'What is the chemical formula of Plaster of Paris (POP) and how is it prepared from Gypsum?',
    options: {
      A: 'CaSO₄·½H₂O (Calcium Sulphate Hemihydrate), prepared by heating Gypsum at 373 K',
      B: 'CaSO₄·2H₂O (Calcium Sulphate Dihydrate), prepared by adding water to quicklime',
      C: 'Ca(OH)₂ (Calcium Hydroxide), prepared by slaking lime',
      D: 'CaCO₃ (Calcium Carbonate), prepared by passing CO₂ through lime water',
    },
    correctAnswer: 'A',
    explanation: 'On heating gypsum (CaSO₄·2H₂O) at 373 K (100°C), it loses water molecules and becomes calcium sulphate hemihydrate (CaSO₄·½H₂O). This is called Plaster of Paris. When mixed with water, it sets into a hard solid mass by converting back into Gypsum.',
    importantPoint: 'Plaster of Paris = CaSO₄·½H₂O; Gypsum = CaSO₄·2H₂O; Bleaching powder = CaOCl₂; Baking soda = NaHCO₃; Washing soda = Na₂CO₃·10H₂O.',
    additionalFact: 'Doctors use POP for supporting fractured bones in the right position.',
    commonMistake: 'Confusing the chemical formula of POP with that of Gypsum (½H₂O vs 2H₂O).',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },

  // -------------------------------------------------------------------------
  // Chapter 3: Metals and Non-metals (cbse-class-10-science-3)
  // -------------------------------------------------------------------------
  {
    id: 'cbse10-sci-04',
    examId: 'cbse-class-10',
    examName: 'CBSE Class 10',
    subjectId: 'cbse-class-10-science',
    topicId: 'cbse-class-10-science-3',
    question: 'Why are sodium (Na) and potassium (K) stored immersed in kerosene oil?',
    options: {
      A: 'Because they react vigorously with atmospheric oxygen and moisture, catching fire exothermically',
      B: 'Because they dissolve rapidly in air',
      C: 'To prevent them from evaporating into gas',
      D: 'To make them harder and more ductile',
    },
    correctAnswer: 'A',
    explanation: 'Sodium and potassium are highly reactive alkali metals. They react vigorously with oxygen and moisture present in air at room temperature, releasing hydrogen gas which catches fire due to the large amount of heat produced. Kerosene does not react with them and prevents contact with air.',
    importantPoint: 'Reactivity Series: K > Na > Ca > Mg > Al > Zn > Fe > Pb > [H] > Cu > Hg > Ag > Au.',
    additionalFact: 'White phosphorus, a non-metal, is stored under water because it catches fire in air but does not react with water.',
    commonMistake: 'Confusing sodium storage in kerosene with phosphorus storage under water.',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },

  // -------------------------------------------------------------------------
  // Chapter 4: Carbon and its Compounds (cbse-class-10-science-4)
  // -------------------------------------------------------------------------
  {
    id: 'cbse10-sci-05',
    examId: 'cbse-class-10',
    examName: 'CBSE Class 10',
    subjectId: 'cbse-class-10-science',
    topicId: 'cbse-class-10-science-4',
    question: 'Carbon forms a large number of compounds due to two unique properties. These properties are:',
    options: {
      A: 'Catenation (self-linking) and Tetravalency',
      B: 'High electronegativity and radioactivity',
      C: 'Paramagnetism and high metallic luster',
      D: 'Low ionization enthalpy and ductility',
    },
    correctAnswer: 'A',
    explanation: 'Carbon has the unique ability to form bonds with other carbon atoms, giving rise to large chains and rings (Catenation). With a valency of four (Tetravalency), it can bond with four other atoms of carbon or other monovalent elements.',
    importantPoint: 'Catenation + Tetravalency = Millions of organic carbon compounds.',
    additionalFact: 'Diamond and Graphite are allotropes of carbon. Diamond is an electrical insulator, while Graphite conducts electricity due to free delocalized electrons.',
    commonMistake: 'Assuming carbon can form stable C⁴⁺ or C⁴⁻ ions, whereas it shares electrons covalently.',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },

  // -------------------------------------------------------------------------
  // Chapter 5: Life Processes (cbse-class-10-science-5)
  // -------------------------------------------------------------------------
  {
    id: 'cbse10-sci-06',
    examId: 'cbse-class-10',
    examName: 'CBSE Class 10',
    subjectId: 'cbse-class-10-science',
    topicId: 'cbse-class-10-science-5',
    question: 'What is the structural and functional filtration unit of the human kidney?',
    options: {
      A: 'Nephron (वृक्काणु)',
      B: 'Neuron (तंत्रिका कोशिका)',
      C: 'Alveoli (कूपिका)',
      D: 'Villi (दीर्घरोम)',
    },
    correctAnswer: 'A',
    explanation: 'Each kidney contains about one million filtration units called nephrons. A nephron consists of a Bowman’s capsule enclosing the glomerulus (where ultrafiltration occurs) and a renal tubule (where selective reabsorption of glucose, amino acids, salts, and water takes place).',
    importantPoint: 'Nephron = Kidney (Excretion); Neuron = Nervous system; Alveoli = Lungs (Gas exchange); Villi = Small intestine (Absorption).',
    additionalFact: 'About 180 liters of initial filtrate is formed daily in healthy adult kidneys, but only 1 to 2 liters is excreted as urine due to extensive tubular reabsorption.',
    commonMistake: 'Confusing Nephron (kidney) with Neuron (nerve cell).',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },

  // -------------------------------------------------------------------------
  // Chapter 9: Light – Reflection and Refraction (cbse-class-10-science-9)
  // -------------------------------------------------------------------------
  {
    id: 'cbse10-sci-07',
    examId: 'cbse-class-10',
    examName: 'CBSE Class 10',
    subjectId: 'cbse-class-10-science',
    topicId: 'cbse-class-10-science-9',
    question: 'An object is placed at the center of curvature (C = 2F) of a concave mirror. The image formed by the mirror is:',
    options: {
      A: 'Real, inverted, and of the same size as the object at C',
      B: 'Virtual, erect, and magnified behind the mirror',
      C: 'Real, inverted, and diminished at F',
      D: 'Real, inverted, and highly enlarged at infinity',
    },
    correctAnswer: 'A',
    explanation: 'When an object is placed at the center of curvature (C) of a concave mirror, the reflected rays converge at C itself. Therefore, the image is formed at C, is real and inverted, and its size is exactly equal to that of the object (magnification m = -1).',
    importantPoint: 'Object at C ⇒ Image at C, Real, Inverted, Same size (m = -1). Object between P and F ⇒ Virtual, Erect, Enlarged (used by dentists and for shaving).',
    additionalFact: 'Convex mirrors always form virtual, erect, and diminished images, providing a wide field of view for vehicle rear-view mirrors.',
    commonMistake: 'Confusing concave mirror ray diagrams with convex lens ray diagrams.',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },

  // -------------------------------------------------------------------------
  // Chapter 11: Electricity (cbse-class-10-science-11)
  // -------------------------------------------------------------------------
  {
    id: 'cbse10-sci-08',
    examId: 'cbse-class-10',
    examName: 'CBSE Class 10',
    subjectId: 'cbse-class-10-science',
    topicId: 'cbse-class-10-science-11',
    question: 'According to Joule’s law of heating, the heat produced in a resistor of resistance R carrying current I for time t is given by:',
    options: {
      A: 'H = I²Rt',
      B: 'H = IR²t',
      C: 'H = V / (It)',
      D: 'H = I / (Rt)',
    },
    correctAnswer: 'A',
    explanation: 'Joule’s Law states that heat produced in a conductor is directly proportional to the square of current (I²), resistance (R), and time (t): H = I²Rt. Since V = IR, H = VIt = (V²/R)t.',
    importantPoint: 'SI unit of electric energy/heat is Joule (J). Commercial unit is kilowatt-hour (1 kWh = 3.6 × 10⁶ J = 1 unit).',
    additionalFact: 'Tungsten is used for bulb filaments because of its very high melting point (3380°C) and high resistivity.',
    commonMistake: 'Forgetting the square on the current I (writing IRt instead of I²Rt).',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
];
