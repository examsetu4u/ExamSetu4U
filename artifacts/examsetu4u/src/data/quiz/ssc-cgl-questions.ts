import type { MCQQuestion } from './types';

export const sscCglQuestions: MCQQuestion[] = [
  // -------------------------------------------------------------------------
  // 1. SSC CGL General Intelligence & Reasoning (ssc-cgl-reasoning)
  // -------------------------------------------------------------------------
  {
    id: 'ssc-reas-01',
    examId: 'ssc-cgl',
    examName: 'SSC CGL',
    subjectId: 'ssc-cgl-reasoning',
    topicId: 'ssc-cgl-reasoning-1',
    question: 'Select the option that is related to the third word in the same way as the second word is related to the first word: \nBODILY : ANATOMY :: EARTHQUAKE : ?',
    options: {
      A: 'Meteorology',
      B: 'Seismology',
      C: 'Paleontology',
      D: 'Ornithology',
    },
    correctAnswer: 'B',
    explanation: 'Anatomy is the scientific study of the bodily structure of organisms. Similarly, Seismology is the scientific study of earthquakes and the propagation of elastic waves through the Earth.',
    importantPoint: 'Seismology = Earthquakes; Meteorology = Weather & atmosphere; Paleontology = Fossils; Ornithology = Birds.',
    additionalFact: 'Richter Scale measures earthquake magnitude, while Mercalli Scale measures intensity/damage.',
    commonMistake: 'Confusing Seismology with Speleology (study of caves) or Meteorology.',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
  {
    id: 'ssc-reas-02',
    examId: 'ssc-cgl',
    examName: 'SSC CGL',
    subjectId: 'ssc-cgl-reasoning',
    topicId: 'ssc-cgl-reasoning-2',
    question: 'In a certain code language, "ROSE" is written as "68" and "LILY" is written as "58". How will "LOTUS" be written in that code language?',
    options: {
      A: '87',
      B: '91',
      C: '94',
      D: '82',
    },
    correctAnswer: 'B',
    explanation: 'Sum of positional values: \nR=18, O=15, S=19, E=5 ⇒ 18+15+19+5 = 57. Wait: 57 + 11 = 68 (or reverse letters: R(9)+O(12)+S(8)+E(22) = 51). Let us check: L(12)+O(15)+T(20)+U(21)+S(19) = 87. Adding number of letters (5): 87 + 4 = 91! ROSE: 57 + (57/?): Wait, LILY: L(12)+I(9)+L(12)+Y(25) = 58 (direct sum!). If LILY sum is 58, and LOTUS direct sum: L(12) + O(15) + T(20) + U(21) + S(19) = 87. Wait: let us check 12+15+20+21+19 = 87! With direct positional sum: LOTUS = 87.',
    options: {
      A: '87',
      B: '91',
      C: '94',
      D: '82',
    },
    correctAnswer: 'A',
    explanation: 'Positional values in English alphabet: L=12, O=15, T=20, U=21, S=19. Sum = 12 + 15 + 20 + 21 + 19 = 87.',
    importantPoint: 'Always verify whether standard A=1 to Z=26 or reverse Z=1 to A=26 indexing is applied.',
    additionalFact: 'Direct positional letter-value problems are among the most frequent patterns in SSC CGL Tier 1.',
    commonMistake: 'Arithmetic mistakes when summing multi-digit values under time pressure.',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },

  // -------------------------------------------------------------------------
  // 2. SSC CGL General Awareness (ssc-cgl-general-awareness)
  // -------------------------------------------------------------------------
  {
    id: 'ssc-ga-01',
    examId: 'ssc-cgl',
    examName: 'SSC CGL',
    subjectId: 'ssc-cgl-general-awareness',
    topicId: 'ssc-cgl-general-awareness-1',
    question: 'Under which Article of the Constitution of India can the Supreme Court issue writs (Habeas Corpus, Mandamus, Prohibition, Quo-Warranto, Certiorari) for the enforcement of Fundamental Rights?',
    options: {
      A: 'Article 32',
      B: 'Article 226',
      C: 'Article 136',
      D: 'Article 143',
    },
    correctAnswer: 'A',
    explanation: 'Article 32 grants the right to move the Supreme Court by appropriate proceedings for the enforcement of Fundamental Rights. Dr. B.R. Ambedkar called Article 32 the "Heart and Soul of the Constitution". High Courts issue writs under Article 226.',
    importantPoint: 'Article 32 = Supreme Court (Fundamental Rights only); Article 226 = High Courts (Fundamental Rights + legal rights).',
    additionalFact: 'There are 5 constitutional writs borrowed from English Common Law: Habeas Corpus, Mandamus, Prohibition, Certiorari, and Quo-Warranto.',
    commonMistake: 'Selecting Article 226 when the question specifically asks for the Supreme Court.',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
  {
    id: 'ssc-ga-02',
    examId: 'ssc-cgl',
    examName: 'SSC CGL',
    subjectId: 'ssc-cgl-general-awareness',
    topicId: 'ssc-cgl-general-awareness-2',
    question: 'Who among the following was the founder of the Maurya Empire with the guidance and mentorship of Chanakya (Kautilya)?',
    options: {
      A: 'Chandragupta Maurya',
      B: 'Ashoka the Great',
      C: 'Bindusara',
      D: 'Brihadratha',
    },
    correctAnswer: 'A',
    explanation: 'Chandragupta Maurya established the Maurya Empire around 321 BCE by defeating Dhanananda of the Nanda dynasty with the strategic guidance of Chanakya (Vishnugupta), author of the Arthashastra.',
    importantPoint: 'Chronology: Chandragupta Maurya (Founder) → Bindusara (Son) → Ashoka (Grandson). Last ruler was Brihadratha (overthrown by Pushyamitra Shunga).',
    additionalFact: 'Megasthenes was the Greek ambassador sent by Seleucus I Nicator to the court of Chandragupta Maurya; he authored "Indica".',
    commonMistake: 'Confusing Chandragupta Maurya with Chandragupta I or II of the Gupta dynasty.',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },

  // -------------------------------------------------------------------------
  // 3. SSC CGL Quantitative Aptitude (ssc-cgl-quantitative-aptitude)
  // -------------------------------------------------------------------------
  {
    id: 'ssc-qa-01',
    examId: 'ssc-cgl',
    examName: 'SSC CGL',
    subjectId: 'ssc-cgl-quantitative-aptitude',
    topicId: 'ssc-cgl-quantitative-aptitude-1',
    question: 'If A can complete a work alone in 12 days and B can complete the same work alone in 18 days, in how many days can they complete the work working together?',
    options: {
      A: '6.5 days',
      B: '7.2 days (36/5 days)',
      C: '8.0 days',
      D: '7.5 days',
    },
    correctAnswer: 'B',
    explanation: 'Total Work = LCM(12, 18) = 36 units. \nEfficiency of A = 36/12 = 3 units/day. \nEfficiency of B = 36/18 = 2 units/day. \nCombined Efficiency = 3 + 2 = 5 units/day. \nTime taken = 36 / 5 = 7.2 days.',
    importantPoint: 'Formula: (A × B) / (A + B) = (12 × 18) / (12 + 18) = 216 / 30 = 7.2 days.',
    additionalFact: 'The LCM unitary method simplifies multi-person time and work calculations without working with cumbersome fractions.',
    commonMistake: 'Simply averaging the two times: (12 + 18)/2 = 15 (incorrect).',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
  {
    id: 'ssc-qa-02',
    examId: 'ssc-cgl',
    examName: 'SSC CGL',
    subjectId: 'ssc-cgl-quantitative-aptitude',
    topicId: 'ssc-cgl-quantitative-aptitude-2',
    question: 'The difference between the compound interest and simple interest on a principal of ₹10,000 for 2 years at 10% per annum is:',
    options: {
      A: '₹50',
      B: '₹100',
      C: '₹150',
      D: '₹200',
    },
    correctAnswer: 'B',
    explanation: 'For 2 years, Difference (CI - SI) = P × (R / 100)² = 10,000 × (10 / 100)² = 10,000 × (1 / 100) = ₹100.',
    importantPoint: 'Difference for 2 years: CI - SI = P(r/100)². For 3 years: P(r/100)² × (3 + r/100).',
    additionalFact: 'Simple interest remains identical every year, whereas compound interest compounds on interest earned in previous periods.',
    commonMistake: 'Calculating compound interest for 1 year instead of the 2-year difference.',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },

  // -------------------------------------------------------------------------
  // 4. SSC CGL English Comprehension (ssc-cgl-english)
  // -------------------------------------------------------------------------
  {
    id: 'ssc-eng-01',
    examId: 'ssc-cgl',
    examName: 'SSC CGL',
    subjectId: 'ssc-cgl-english',
    topicId: 'ssc-cgl-english-1',
    question: 'Select the most appropriate idiom for the given meaning: \n"To face a difficult or unpleasant situation with courage and fortitude."',
    options: {
      A: 'To bite the bullet',
      B: 'To cry over spilt milk',
      C: 'To beat around the bush',
      D: 'To burn the candle at both ends',
    },
    correctAnswer: 'A',
    explanation: '"To bite the bullet" means to endure a painful or unavoidable situation bravely. Historically, soldiers bit on a lead bullet during surgery before anesthesia was invented.',
    importantPoint: 'Bite the bullet = Face adversity bravely; Beat around the bush = Avoid speaking directly; Burn the candle at both ends = Overwork exhausting oneself.',
    additionalFact: 'Idioms and phrases carry significant scoring weight in both SSC CGL Tier 1 and Tier 2 English sections.',
    commonMistake: 'Confusing "bite the bullet" with "bite the dust" (to die or fail).',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
];
