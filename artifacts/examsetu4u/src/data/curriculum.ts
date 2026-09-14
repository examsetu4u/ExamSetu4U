import { convertNotesToStudyMaterial, getStudyNotesForTopic } from '@/services/study-notes-loader';
import { uppcsCurrentAffairsStudyMaterials } from '@/data/uppcs-current-affairs/study-materials';
import {
  CBSE_CLASS_10_SOCIAL_SCIENCE,
  CBSE_CLASS_10_ENGLISH,
  CBSE_CLASS_10_HINDI,
  CBSE_CLASS_12_PHYSICS,
  CBSE_CLASS_12_CHEMISTRY,
  CBSE_CLASS_12_MATHEMATICS,
  CBSE_CLASS_12_BIOLOGY,
  CBSE_CLASS_12_ENGLISH,
} from '@/data/cbse-curriculum';

export type ContentAvailability = {
  studyMaterial: boolean;
  pyq: boolean;
  quiz: boolean;
  theory: boolean;
};

export type Progress = {
  percent: number;
  completed: boolean;
};

export type Topic = {
  id: string;
  examId: string;
  subjectId: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  availability: ContentAvailability;
};

export type Subject = {
  id: string;
  examId: string;
  name: string;
  description: string;
  topicIds: string[];
};

export type Exam = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  subjects: string;
  subjectIds: string[];
  tone: 'saffron' | 'teal' | 'blue' | 'coral';
};

export type MaterialSection = {
  heading: string;
  subheading?: string;
  paragraphs: MaterialParagraph[];
  bullets?: MaterialPoint[];
  numberedPoints?: MaterialPoint[];
  tables?: MaterialTable[];
  images?: MaterialImage[];
  questions?: MaterialQuestion[];
};

export type StudyMaterialSection = MaterialSection;

export type MaterialParagraph = string | {
  text: string;
  emphasis?: boolean;
};

export type MaterialPoint = string | {
  text: string;
  style?: 'bullet' | 'numbered';
};

export type MaterialImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type MaterialQuestion = {
  prompt: string;
  answer?: string;
};

export type MaterialTable = {
  headers: string[];
  rows: string[][];
};

export type StudyMaterialCallout = {
  label: string;
  title: string;
  body: string;
};

export type StudyMaterial = {
  topicId: string;
  intro: string;
  sections: MaterialSection[];
  callouts: StudyMaterialCallout[];
  keyTakeaways: string[];
  quickRevision: string[];
};

type SubjectDefinition = {
  id: string;
  name: string;
  description: string;
  topics: string[];
};

type ExamDefinition = Omit<Exam, 'subjectIds' | 'subjects'> & {
  subjects: SubjectDefinition[];
};

function createCurriculum(definitions: ExamDefinition[]) {
  const exams: Exam[] = [];
  const subjects: Subject[] = [];
  const topics: Topic[] = [];

  definitions.forEach((definition) => {
    const subjectIds = definition.subjects.map((subject) => `${definition.id}-${subject.id}`);
    exams.push({ ...definition, subjectIds, subjects: definition.subjects.map((subject) => subject.name).slice(0, 3).join(' · ') });

    definition.subjects.forEach((subject) => {
      const subjectId = `${definition.id}-${subject.id}`;
      const topicIds = subject.topics.map((_, index) => `${subjectId}-${index + 1}`);
      subjects.push({ id: subjectId, examId: definition.id, name: subject.name, description: subject.description, topicIds });

      subject.topics.forEach((topicName, index) => {
        const isSscCgl = definition.id === 'ssc-cgl';
        const isUppcsMains = definition.id === 'uppcs-mains' || subject.name.startsWith('Mains:');
        const isUppcsPre = definition.id === 'uppcs-pre' || (definition.id === 'uppcs' && subject.name.startsWith('Pre:'));

        topics.push({
          id: topicIds[index],
          examId: definition.id,
          subjectId,
          name: topicName,
          description: isSscCgl
            ? `Master ${topicName} through focused Multiple Choice Questions (MCQs), previous year patterns and timed speed testing.`
            : isUppcsMains
            ? `Master ${topicName} through subjective descriptive answer writing, structured framework and official model answers.`
            : isUppcsPre
            ? `Master ${topicName} for UPPCS Prelims through multi-statement, assertion-reason, match lists and conceptual MCQs.`
            : `Build a clear understanding of ${topicName.toLowerCase()} with focused notes, practice and revision.`,
          estimatedMinutes: 20 + (index % 3) * 10,
          availability: {
            studyMaterial: isSscCgl
              ? false
              : isUppcsMains || isUppcsPre
              ? true
              : subjectId === 'super-tet-child-development' ||
                subjectId === 'super-tet-teaching-skills' ||
                subjectId === 'uppcs-pre-current-affairs',
            pyq: isSscCgl ? true : isUppcsMains ? false : subjectId === 'cbse-class-10-science' ? index === 0 : true,
            quiz: isUppcsMains ? false : true,
            theory: isSscCgl ? false : true,
          },
        });
      });
    });
  });

  return { exams, subjects, topics };
}

const curriculumDefinitions: ExamDefinition[] = [
  {
    id: 'super-tet',
    name: 'Super TET',
    shortDescription: 'Prepare for teaching eligibility with focused practice and clear concepts.',
    description: 'A guided preparation path for Super TET with pedagogy, languages, subject knowledge and general awareness.',
    subjects: [
      {
        id: 'child-development',
        name: 'बाल विकास एवं शिक्षाशास्त्र',
        description: 'Understand how children learn, grow and respond to different teaching approaches.',
        topics: [
          'बाल विकास — अर्थ, प्रकृति एवं क्षेत्र',
          'विकास की अवस्थाएँ',
          'वंशानुक्रम एवं वातावरण',
          'व्यक्तिगत विभिन्नताएँ',
          'अधिगम एवं विकास का संबंध',
          'बाल विकास के सिद्धांत',
          'अधिगम और प्रेरणा',
          'समावेशी शिक्षा',
        ],
      },
      {
        id: 'teaching-skills',
        name: 'शिक्षण कौशल',
        description: 'Strengthen classroom practice, assessment and learner-centred teaching skills.',
        topics: [
          'शिक्षण का अर्थ एवं परिभाषा',
          'शिक्षण के उद्देश्य',
          'शिक्षण के सिद्धांत',
          'शिक्षण की विशेषताएँ',
          'प्रभावी शिक्षण',
          'शिक्षक की भूमिका',
          'विद्यार्थी की भूमिका',
          'शिक्षण की विभिन्न विधियाँ',
          'बाल-केंद्रित शिक्षण',
          'व्यक्तिगत भिन्नताएँ',
          'प्रेरणा एवं अधिगम',
          'कक्षा प्रबंधन',
          'मूल्यांकन एवं शिक्षण',
          'शिक्षण में ICT',
          'परीक्षा की दृष्टि से महत्वपूर्ण तथ्य',
        ],
      },
      { id: 'hindi', name: 'भाषा हिंदी', description: 'Revise Hindi language understanding, grammar and comprehension.', topics: ['हिंदी व्याकरण', 'अपठित गद्यांश', 'शब्द ज्ञान'] },
      { id: 'english', name: 'भाषा अंग्रेजी', description: 'Build practical English comprehension and grammar skills.', topics: ['Parts of Speech', 'Reading Comprehension', 'Vocabulary and Usage'] },
      { id: 'mathematics', name: 'गणित', description: 'Practice foundational mathematics concepts used in the teaching eligibility syllabus.', topics: ['संख्या पद्धति', 'भिन्न और दशमलव', 'ज्यामिति और मापन'] },
      { id: 'evs', name: 'पर्यावरण अध्ययन', description: 'Connect everyday life, environment and learning through core EVS themes.', topics: ['परिवार और समाज', 'प्राकृतिक संसाधन', 'स्वास्थ्य और स्वच्छता'] },
      { id: 'science', name: 'विज्ञान', description: 'Revise basic science concepts with classroom-friendly explanations.', topics: ['भौतिक विज्ञान की मूल बातें', 'जीव विज्ञान की मूल बातें', 'दैनिक जीवन में विज्ञान'] },
      { id: 'social-studies', name: 'सामाजिक अध्ययन', description: 'Cover history, geography and civics through structured revision.', topics: ['भारतीय इतिहास', 'भारत का भूगोल', 'नागरिक शास्त्र'] },
      { id: 'general-knowledge', name: 'सामान्य ज्ञान', description: 'Build a reliable base of static general awareness topics.', topics: ['भारत सामान्य ज्ञान', 'विश्व सामान्य ज्ञान', 'महत्वपूर्ण दिवस'] },
      { id: 'current-affairs', name: 'करंट अफेयर्स', description: 'Keep revision organised around important national and international events.', topics: ['राष्ट्रीय घटनाक्रम', 'अंतरराष्ट्रीय घटनाक्रम', 'खेल और पुरस्कार'] },
      { id: 'information-technology', name: 'सूचना प्रौद्योगिकी', description: 'Learn the digital literacy concepts relevant to modern teaching.', topics: ['कंप्यूटर की मूल बातें', 'इंटरनेट और सुरक्षा', 'डिजिटल शिक्षण'] },
    ],
    tone: 'saffron',
  },
  {
    id: 'ctet',
    name: 'CTET',
    shortDescription: 'Build a steady foundation for the Central Teacher Eligibility Test.',
    description: 'Organise CTET preparation by subject, topic and content type so every revision session has a clear next step.',
    subjects: [
      { id: 'child-development', name: 'Child Development & Pedagogy', description: 'Study child development, learning theories, inclusive classroom practice and pedagogical assessment.', topics: ['Child Development', 'Learning & Pedagogy', 'Learning Theories', 'Intelligence', 'Individual Differences', 'Inclusive Education', 'Special Needs', 'Assessment', 'Remedial Teaching'] },
      { id: 'mathematics', name: 'Mathematics', description: 'Revise primary and elementary mathematics concepts with teaching methods and error analysis.', topics: ['Number System', 'Arithmetic', 'Geometry', 'Mensuration', 'Data Handling', 'Mathematics Pedagogy'] },
      { id: 'environmental-studies', name: 'Environmental Studies', description: 'Thematic NCERT EVS concepts: Family & friends, food, shelter, water, travel, crafts and pedagogy.', topics: ['Family & Friends', 'Food', 'Shelter', 'Water', 'Travel', 'Things We Make & Do', 'EVS Pedagogy'] },
      { id: 'language-1', name: 'Language I', description: 'Practice language comprehension, functional grammar, acquisition theories and language pedagogy.', topics: ['Reading', 'Grammar', 'Vocabulary', 'Language Development', 'Language Pedagogy'] },
      { id: 'language-2', name: 'Language II', description: 'Strengthen unseen comprehension, grammar, vocabulary and second language teaching methods.', topics: ['Reading', 'Grammar', 'Vocabulary', 'Language Development', 'Language Pedagogy'] },
      { id: 'social-studies', name: 'Social Studies/Social Science', description: 'Build concepts across history, geography, civics and social science pedagogy.', topics: ['History', 'Geography', 'Social & Political Life', 'Social Science Pedagogy'] },
      { id: 'science', name: 'Science', description: 'Revise science concepts and the methods used to teach them effectively.', topics: ['Food & Materials', 'Living World', 'Forces & Motion', 'Science Pedagogy'] },
    ],
    tone: 'teal',
  },
  {
    id: 'uptet',
    name: 'UPTET',
    shortDescription: 'Revise the Uttar Pradesh TET syllabus with simple study paths.',
    description: 'A subject-wise UPTET route for building fundamentals, tracking revision and finding practice content quickly.',
    subjects: [
      { id: 'child-development', name: 'बाल विकास एवं शिक्षाशास्त्र', description: 'Cover learner development and the principles of effective teaching.', topics: ['बाल विकास', 'अधिगम सिद्धांत', 'समावेशी शिक्षा'] },
      { id: 'hindi', name: 'भाषा हिंदी', description: 'Revise Hindi comprehension, grammar and language pedagogy.', topics: ['व्याकरण', 'गद्य और पद्य', 'भाषा शिक्षण'] },
      { id: 'english', name: 'Language English', description: 'Practice English language understanding and pedagogy.', topics: ['Grammar Basics', 'Comprehension', 'Language Pedagogy'] },
      { id: 'mathematics', name: 'गणित', description: 'Strengthen arithmetic, geometry and mathematics teaching concepts.', topics: ['अंकगणित', 'बीजगणित और ज्यामिति', 'गणित शिक्षण'] },
      { id: 'evs', name: 'पर्यावरण अध्ययन', description: 'Study environment and everyday experiences through the UPTET syllabus.', topics: ['परिवार और भोजन', 'जल और आवास', 'EVS शिक्षण'] },
    ],
    tone: 'blue',
  },
  {
    id: 'ssc-cgl',
    name: 'SSC CGL',
    shortDescription: 'Comprehensive SSC CGL preparation across Tier-I (Pre) and Tier-II (Mains) MCQ modules.',
    description: 'Prepare for Staff Selection Commission Combined Graduate Level (SSC CGL) with dedicated 100% objective MCQ practice for Tier-I and Tier-II Compulsory & Optional papers.',
    subjects: [
      // PRE / TIER-I
      {
        id: 'reasoning',
        name: 'Tier-I: General Intelligence & Reasoning',
        description: 'Tier-I 100% Objective MCQ practice: Analogy, classification, series, coding-decoding, blood relations, non-verbal and visual reasoning.',
        topics: [
          'Analogy',
          'Classification',
          'Series',
          'Coding-Decoding',
          'Blood Relations',
          'Direction & Distance',
          'Ranking & Order',
          'Venn Diagram',
          'Syllogism',
          'Statement & Conclusion',
          'Mathematical Operations',
          'Non-Verbal Reasoning',
          'Figure/Pattern Based Questions',
        ],
      },
      {
        id: 'general-awareness',
        name: 'Tier-I: General Awareness',
        description: 'Tier-I 100% Objective MCQ practice: History, geography, polity, economy, general science (physics, chemistry, biology), environment, static GK and current affairs.',
        topics: [
          'History',
          'Geography',
          'Indian Polity',
          'Indian Economy',
          'General Science: Physics',
          'General Science: Chemistry',
          'General Science: Biology',
          'Environment',
          'Static GK',
          'Art & Culture',
          'Sports',
          'Current Affairs',
        ],
      },
      {
        id: 'quantitative-aptitude',
        name: 'Tier-I: Quantitative Aptitude',
        description: 'Tier-I 100% Objective MCQ practice: Number system, arithmetic, percentage, profit & loss, algebra, geometry, trigonometry, mensuration and data interpretation.',
        topics: [
          'Number System',
          'Simplification',
          'Percentage',
          'Ratio & Proportion',
          'Average',
          'Profit & Loss',
          'Discount',
          'Simple Interest',
          'Compound Interest',
          'Time & Work',
          'Time, Speed & Distance',
          'Algebra',
          'Geometry',
          'Trigonometry',
          'Mensuration',
          'Data Interpretation',
          'Statistics/Probability basics',
        ],
      },
      {
        id: 'english-comprehension',
        name: 'Tier-I: English Comprehension',
        description: 'Tier-I 100% Objective MCQ practice: Vocabulary, synonyms, antonyms, idioms, error spotting, voice, narration, cloze test and reading comprehension.',
        topics: [
          'Vocabulary',
          'Synonyms',
          'Antonyms',
          'One Word Substitution',
          'Idioms & Phrases',
          'Spelling',
          'Error Detection',
          'Fill in the Blanks',
          'Sentence Improvement',
          'Active & Passive Voice',
          'Direct & Indirect Speech',
          'Cloze Test',
          'Para Jumbles',
          'Reading Comprehension',
        ],
      },

      // MAINS / TIER-II — PAPER-I: COMPULSORY
      {
        id: 'tier2-paper1-math',
        name: 'Tier-II Paper-I: Mathematical Abilities (Sec-I, Mod-I)',
        description: 'Section-I, Module-I: Advanced mathematical abilities, arithmetic, algebra, geometry, mensuration, trigonometry, statistics & probability MCQs.',
        topics: [
          'Number Systems',
          'Fundamental Arithmetic Operations',
          'Percentage',
          'Ratio & Proportion',
          'Square Roots',
          'Averages',
          'Interest',
          'Profit & Loss',
          'Discount',
          'Partnership Business',
          'Mixture & Alligation',
          'Time & Distance',
          'Time & Work',
          'Algebra',
          'Geometry',
          'Mensuration',
          'Trigonometry',
          'Statistics',
          'Probability',
        ],
      },
      {
        id: 'tier2-paper1-reasoning',
        name: 'Tier-II Paper-I: Reasoning & General Intelligence (Sec-I, Mod-II)',
        description: 'Section-I, Module-II: Advanced reasoning, semantic & figural analogy, classification, series, critical thinking, problem solving & logical MCQs.',
        topics: [
          'Semantic Analogy',
          'Symbolic/Number Analogy',
          'Figural Analogy',
          'Semantic Classification',
          'Symbolic Classification',
          'Figural Classification',
          'Number Series',
          'Figural Series',
          'Coding-Decoding',
          'Venn Diagrams',
          'Space Orientation',
          'Problem Solving',
          'Critical Thinking',
          'Decision Making',
          'Visual Memory',
          'Observation',
          'Relationship Concepts',
          'Arithmetical Reasoning',
          'Non-Verbal Reasoning',
          'Statement/Conclusion & Logical Reasoning',
        ],
      },
      {
        id: 'tier2-paper1-english',
        name: 'Tier-II Paper-I: English Language & Comprehension (Sec-II, Mod-I)',
        description: 'Section-II, Module-I: Advanced English comprehension, grammar, sentence shuffling, active/passive voice, direct/indirect narration and cloze passage MCQs.',
        topics: [
          'Vocabulary',
          'Grammar',
          'Sentence Structure',
          'Synonyms/Homonyms',
          'Antonyms',
          'Spellings',
          'Error Spotting',
          'Fill in the Blanks',
          'Idioms & Phrases',
          'One Word Substitution',
          'Sentence Improvement',
          'Active/Passive Voice',
          'Direct/Indirect Narration',
          'Sentence Shuffling',
          'Para Jumbles',
          'Cloze Passage',
          'Reading Comprehension',
        ],
      },
      {
        id: 'tier2-paper1-general-awareness',
        name: 'Tier-II Paper-I: General Awareness (Sec-II, Mod-II)',
        description: 'Section-II, Module-II: Advanced general awareness, history, culture, geography, economic scene, scientific research, environment & current affairs MCQs.',
        topics: [
          'History',
          'Culture',
          'Geography',
          'Economic Scene',
          'General Policy',
          'Scientific Research',
          'General Science',
          'Environment',
          'Static GK',
          'Current Affairs',
        ],
      },
      {
        id: 'tier2-paper1-computer',
        name: 'Tier-II Paper-I: Computer Knowledge (Sec-III, Mod-I)',
        description: 'Section-III, Module-I (Qualifying): Computer fundamentals, organization, CPU, memory, OS, MS Office (Word, Excel, PowerPoint), networking and cyber security MCQs.',
        topics: [
          'Computer Fundamentals',
          'Computer Organisation',
          'CPU',
          'Memory',
          'Input/Output Devices',
          'Windows',
          'MS Word',
          'MS Excel',
          'MS PowerPoint',
          'Internet',
          'E-mail',
          'Networking',
          'Cyber Security basics',
        ],
      },
      {
        id: 'tier2-paper1-dest',
        name: 'Tier-II Paper-I: Data Entry Speed Test / DEST (Sec-III, Mod-II)',
        description: 'Section-III, Module-II (Qualifying): Typing speed drill, data entry passage practice, key depressions & error rate benchmarks (2000 key depressions in 15 min).',
        topics: [
          'Typing Practice',
          'Data Entry Practice',
          'Speed/Accuracy Tracking',
        ],
      },

      // MAINS / TIER-II — PAPER-II: STATISTICS
      {
        id: 'tier2-paper2-statistics',
        name: 'Tier-II Paper-II: Statistics (JSO / Statistical Posts)',
        description: 'Paper-II (for Junior Statistical Officer): Data collection, dispersion, moments, skewness, probability distributions, sampling and statistical inference MCQs.',
        topics: [
          'Collection, Classification & Presentation of Data',
          'Measures of Central Tendency',
          'Measures of Dispersion',
          'Moments',
          'Skewness',
          'Kurtosis',
          'Correlation',
          'Regression',
          'Probability Theory',
          'Random Variables',
          'Probability Distributions',
          'Sampling Theory',
          'Statistical Inference',
          'Analysis of Variance',
          'Time Series',
          'Index Numbers',
        ],
      },

      // MAINS / TIER-II — PAPER-III: GENERAL STUDIES (Finance & Economics)
      {
        id: 'tier2-paper3-finance-economics',
        name: 'Tier-II Paper-III: General Studies (Finance & Economics)',
        description: 'Paper-III (for Assistant Audit / Accounts Officer): Financial terms, budget, fiscal & monetary policy, micro & macroeconomics, and Indian economic policy MCQs.',
        topics: [
          'Finance: Financial & Economic Terms',
          'Finance: Role of Finance Commission',
          'Finance: Budget',
          'Finance: Fiscal Policy',
          'Finance: Monetary Policy',
          'Finance: Public Finance',
          'Finance: Banking',
          'Finance: Government Financial Schemes',
          'Economics: Fundamental Economics',
          'Economics: Micro Economics',
          'Economics: Macroeconomics',
          'Economics: National Income',
          'Economics: Economic Growth & Development',
          'Economics: Inflation',
          'Economics: Employment',
          'Economics: Money & Banking',
          'Economics: Indian Economy',
          'Economics: Economic Reforms',
          'Economics: Demand & Supply',
          'Economics: Production',
          'Economics: Government Economic Policies',
        ],
      },
    ],
    tone: 'coral',
  },
  {
    id: 'cbse-class-10',
    name: 'CBSE Class 10',
    shortDescription: 'Build a clear Class 10 revision plan across core CBSE subjects.',
    description: 'A lightweight Class 10 curriculum map for concept revision, practice and board exam preparation.',
    subjects: [
      {
        id: 'mathematics',
        name: 'Mathematics',
        description: 'Comprehensive chapter-wise CBSE Class 10 Mathematics syllabus covering Number Systems, Algebra, Coordinate Geometry, Geometry, Trigonometry, Mensuration, and Statistics & Probability.',
        topics: [
          'Real Numbers',
          'Polynomials',
          'Pair of Linear Equations in Two Variables',
          'Quadratic Equations',
          'Arithmetic Progressions',
          'Triangles',
          'Coordinate Geometry',
          'Introduction to Trigonometry',
          'Some Applications of Trigonometry',
          'Circles',
          'Areas Related to Circles',
          'Surface Areas and Volumes',
          'Statistics',
          'Probability',
        ],
      },
      {
        id: 'science',
        name: 'Science',
        description: 'Structured chapter-wise syllabus covering Chemical Substances, World of Living, Natural Phenomena, Effects of Current, and Natural Resources.',
        topics: [
          'Chemical Reactions and Equations',
          'Acids, Bases and Salts',
          'Metals and Non-metals',
          'Carbon and its Compounds',
          'Life Processes',
          'Control and Coordination',
          'How do Organisms Reproduce?',
          'Heredity',
          'Light – Reflection and Refraction',
          'The Human Eye and the Colourful World',
          'Electricity',
          'Magnetic Effects of Electric Current',
          'Our Environment',
        ],
      },
      {
        id: 'social-science',
        name: 'Social Science',
        description: 'Comprehensive NCERT Class 10 Social Science: History, Geography, Political Science and Economics with complete map work and board questions.',
        topics: CBSE_CLASS_10_SOCIAL_SCIENCE.chapters.map((c) => c.title),
      },
      {
        id: 'english',
        name: 'English',
        description: 'Class 10 English (Language & Literature): First Flight prose & poetry, Footprints without Feet, Reading Comprehension, Formal Letters and Analytical Paragraphs.',
        topics: CBSE_CLASS_10_ENGLISH.chapters.map((c) => c.title),
      },
      {
        id: 'hindi',
        name: 'Hindi',
        description: 'सीबीएसई कक्षा 10 हिंदी (कोर्स अ): क्षितिज भाग-2, कृतिका भाग-2, व्यावहारिक व्याकरण व रचनात्मक लेखन।',
        topics: CBSE_CLASS_10_HINDI.chapters.map((c) => c.title),
      },
    ],
    tone: 'blue',
  },
  {
    id: 'cbse-class-12',
    name: 'CBSE Class 12',
    shortDescription: 'Organise senior secondary revision with subject-wise topic routes.',
    description: 'Complete CBSE Class 12 Science & Humanities board curriculum with chapter notes, PYQs, MCQs, and subject-specific exam blueprints.',
    subjects: [
      {
        id: 'physics',
        name: 'Physics',
        description: 'Class 12 Physics: Electrostatics, Current Electricity, Magnetism, Optics, Modern Physics and Semiconductor Electronics with derivations & numericals.',
        topics: CBSE_CLASS_12_PHYSICS.chapters.map((c) => c.title),
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        description: 'Class 12 Chemistry: Solutions, Electrochemistry, Chemical Kinetics, d-f Blocks, Coordination Compounds and complete Organic reaction mechanisms.',
        topics: CBSE_CLASS_12_CHEMISTRY.chapters.map((c) => c.title),
      },
      {
        id: 'mathematics',
        name: 'Mathematics',
        description: 'Class 12 Mathematics: Calculus, Relations & Functions, Matrices & Determinants, Vectors, 3D Geometry and Probability with master formula sheet.',
        topics: CBSE_CLASS_12_MATHEMATICS.chapters.map((c) => c.title),
      },
      {
        id: 'biology',
        name: 'Biology',
        description: 'Class 12 Biology: Reproduction, Genetics & Evolution, Biotechnology, Human Health & Disease and Ecology with labeled diagrams.',
        topics: CBSE_CLASS_12_BIOLOGY.chapters.map((c) => c.title),
      },
      {
        id: 'english',
        name: 'English Core',
        description: 'Class 12 English Core: Flamingo Prose & Poetry, Vistas Supplementary, Reading Comprehension and Creative Writing Skills.',
        topics: CBSE_CLASS_12_ENGLISH.chapters.map((c) => c.title),
      },
    ],
    tone: 'teal',
  },
  {
    id: 'uppcs',
    name: 'UPPCS (Pre + Mains)',
    shortDescription: 'Complete UPPCS Civil Services coverage: Prelims (Pre - 100% Objective MCQs) & Mains (Subjective Answer Writing).',
    description: 'Comprehensive UPPCS exam portal structured into Prelims (Pre: GS-1 & CSAT 100% MCQs) and Mains (General Hindi, Essay, GS 1 to 6 Subjective Answer Writing) alongside the dedicated Current Affairs hub.',
    subjects: [
      // Pre Subjects
      {
        id: 'current-affairs',
        name: 'Pre: समसामयिकी एवं करेंट अफेयर्स (Current Affairs Hub)',
        description: 'UPPCS Pre हेतु दैनिक, साप्ताहिक, मासिक व वार्षिकी करेंट अफेयर्स नोट्स, यूपी विशेषांक एवं परीक्षा उपयोगी MCQ क्विज़।',
        topics: [
          'Daily Current Affairs (दैनिक समसामयिकी)',
          'Weekly Current Affairs (साप्ताहिक राउंडअप)',
          'Monthly Current Affairs (मासिक करेंट अफेयर्स)',
          'Yearly & UP Special (वार्षिकी एवं उत्तर प्रदेश समसामयिकी)',
        ],
      },
      {
        id: 'general-studies-1',
        name: 'Pre: सामान्य अध्ययन I - भारतीय इतिहास व संस्कृति',
        description: 'प्राचीन, मध्यकालीन व आधुनिक भारत का इतिहास, राष्ट्रीय आंदोलन एवं कला संस्कृति (100% वस्तुनिष्ठ MCQs)।',
        topics: [
          'प्राचीन भारत का इतिहास व सिंधु घाटी सभ्यता',
          'मध्यकालीन भारत एवं मुगल साम्राज्य',
          'आधुनिक भारत का इतिहास व 1857 का संग्राम',
          'भारतीय राष्ट्रीय आंदोलन एवं स्वतंत्रता संग्राम',
        ],
      },
      {
        id: 'pre-gs-geography',
        name: 'Pre: सामान्य अध्ययन I - भारत एवं विश्व का भूगोल',
        description: 'भौतिक, सामाजिक एवं आर्थिक भूगोल, नदियां, पर्वत, जलवायु, वन एवं मानचित्र आधारित प्रश्न।',
        topics: [
          'भारत का भौतिक भूगोल एवं नदी तंत्र',
          'मानसून, जलवायु एवं प्राकृतिक वनस्पति',
          'विश्व भूगोल, महाद्वीप एवं महासागरीय धाराएं',
          'कृषि, खनिज संसाधन एवं जनसंख्या भूगोल',
        ],
      },
      {
        id: 'pre-gs-polity',
        name: 'Pre: सामान्य अध्ययन I - भारतीय राजव्यवस्था व संविधान',
        description: 'संवैधानिक ढांचा, प्रस्तावना, मौलिक अधिकार, DPSP, संसद, न्यायपालिका एवं पंचायती राज व्यवस्था।',
        topics: [
          'संवैधानिक विकास, प्रस्तावना व नागरिकता',
          'मूल अधिकार, मूल कर्तव्य एवं नीति निदेशक तत्व',
          'संघीय कार्यपालिका, संसद व सर्वोच्च न्यायालय',
          'राज्य विधानमंडल, राज्यपाल एवं 73वां/74वां संशोधन',
        ],
      },
      {
        id: 'pre-gs-economy',
        name: 'Pre: सामान्य अध्ययन I - आर्थिक एवं सामाजिक विकास',
        description: 'सतत विकास, राष्ट्रीय आय, गरीबी, समावेशन, जनसांख्यिकी, सामाजिक क्षेत्र के उपक्रम एवं बजट।',
        topics: [
          'भारतीय अर्थव्यवस्था की संरचना एवं राष्ट्रीय आय',
          'बैंकिंग प्रणाली, मौद्रिक नीति व RBI',
          'गरीबी, बेरोजगारी एवं सरकारी कल्याणकारी योजनाएं',
          'केंद्रीय बजट, आर्थिक सर्वेक्षण एवं व्यापार संतुलन',
        ],
      },
      {
        id: 'pre-gs-science-env',
        name: 'Pre: सामान्य अध्ययन I - सामान्य विज्ञान एवं पर्यावरण',
        description: 'दैनिक भौतिकी, रसायन, जीव विज्ञान, जैव विविधता, पारिस्थितिकी, रामसर स्थल व जलवायु परिवर्तन।',
        topics: [
          'सामान्य भौतिकी एवं दैनिक अनुप्रयोग',
          'मानव शरीर क्रिया विज्ञान, पोषण एवं रोग',
          'पारिस्थितिकी तंत्र, जैव विविधता व रामसर स्थल',
          'पर्यावरण प्रदूषण, जलवायु परिवर्तन एवं सम्मेलन',
        ],
      },
      {
        id: 'pre-gs-up-special',
        name: 'Pre: सामान्य अध्ययन I - उत्तर प्रदेश विशेष (UP Special)',
        description: 'उत्तर प्रदेश का इतिहास, संस्कृति, मेले, नदियां, खनिज, वन्यजीव अभयारण्य, औद्योगिक नीतियां व ODOP।',
        topics: [
          'उत्तर प्रदेश का संक्षिप्त इतिहास एवं प्रमुख जननायक',
          'यूपी का भौगोलिक स्वरूप, नदियां एवं वन्यजीव अभयारण्य',
          'उत्तर प्रदेश की कला, संस्कृति, लोकगीत एवं मेले',
          'यूपी की अर्थव्यवस्था, प्रमुख उद्योग, ODOP व नीतियां',
        ],
      },
      {
        id: 'general-studies-2',
        name: 'Pre: सामान्य अध्ययन II (CSAT) - संप्रेषण व बोधगम्यता',
        description: 'Comprehension passages, Interpersonal skills including communication and decision making.',
        topics: [
          'Reading Comprehension (अपठित गद्यांश)',
          'Interpersonal Skills & Communication (अंतरवैयक्तिक संप्रेषण)',
          'Decision Making & Problem Solving (निर्णय क्षमता)',
        ],
      },
      {
        id: 'pre-csat-reasoning-maths',
        name: 'Pre: सामान्य अध्ययन II (CSAT) - तार्किक योग्यता व गणित',
        description: 'Logical reasoning, analytical ability and elementary mathematics up to class 10 standard.',
        topics: [
          'Logical Reasoning & Analytical Ability (तार्किक क्षमता)',
          'Coding-Decoding, Series & Syllogism',
          'अंकगणित: प्रतिशत, लाभ-हानि, अनुपात व समय-कार्य',
          'Data Interpretation (तालिका व आरेखीय विश्लेषण)',
        ],
      },
      {
        id: 'pre-csat-hindi-english',
        name: 'Pre: सामान्य अध्ययन II (CSAT) - सामान्य हिंदी व English',
        description: 'कक्षा 10 स्तर की सामान्य हिंदी व्याकरण एवं General English comprehension and grammar.',
        topics: [
          'सामान्य हिंदी: संधि, समास, विलोम व पर्यायवाची',
          'वाक्य शुद्धि, मुहावरे एवं लोकोक्तियां',
          'General English: Grammar & Vocabulary',
          'Idioms, Phrases & Sentence Correction',
        ],
      },

      // Mains Subjects (Subjective Answer Writing)
      {
        id: 'general-hindi',
        name: 'Mains: सामान्य हिंदी (General Hindi - 150 Marks)',
        description: 'दिए गए गद्य खंड का भावार्थ, संक्षेपण, शासकीय/अर्धशासकीय पत्र, मुहावरे व प्रशासनिक शब्दावली (150 अंक)।',
        topics: [
          'अपठित गद्यांश, संक्षेपण एवं शीर्षक निर्धारण',
          'शासकीय, अर्धशासकीय पत्र व परिपत्र प्रारूप लेखन',
          'विराम चिन्ह, विलोम, उपसर्ग-प्रत्यय एवं वर्तनी शुद्धि',
          'मुहावरे, लोकोक्तियां एवं प्रशासनिक पारिभाषिक शब्दावली',
        ],
      },
      {
        id: 'essay',
        name: 'Mains: निबंध (Essay Paper - 150 Marks)',
        description: 'तीन खंडों से एक-एक निबंध (कुल 3 निबंध × 50 अंक = 150 अंक, प्रत्येक 700 शब्द सीमा)।',
        topics: [
          'खंड (क): साहित्य और संस्कृति / सामाजिक क्षेत्र / राजनीतिक क्षेत्र',
          'खंड (ख): विज्ञान, पर्यावरण और प्रौद्योगिकी / आर्थिक क्षेत्र / कृषि एवं उद्योग',
          'खंड (ग): राष्ट्रीय एवं अंतरराष्ट्रीय घटनाक्रम / प्राकृतिक आपदाएं / राष्ट्रीय विकास योजनाएं',
        ],
      },
      {
        id: 'gs-paper-1',
        name: 'Mains: सामान्य अध्ययन प्रश्नपत्र 1 (GS Paper 1 - 200 Marks)',
        description: 'भारतीय संस्कृति का इतिहास, आधुनिक भारत, स्वतंत्रता संग्राम, विश्व इतिहास, भारतीय समाज एवं भूगोल (200 अंक)।',
        topics: [
          'भारतीय संस्कृति के प्राचीन से आधुनिक काल तक के कला रूप व वास्तुकला',
          '1757 से 1947 तक आधुनिक भारतीय इतिहास की महत्वपूर्ण घटनाएं एवं व्यक्तित्व',
          'स्वतंत्रता संग्राम: विभिन्न चरण व देश के विभिन्न भागों का योगदान',
          'भारतीय समाज की मुख्य विशेषताएं, महिला संगठन, उदारीकरण व सामाजिक सशक्तीकरण',
          'भौतिक भूगोल, विश्व के प्रमुख प्राकृतिक संसाधन एवं महत्वपूर्ण भूभौतिकीय घटनाएं',
        ],
      },
      {
        id: 'gs-paper-2',
        name: 'Mains: सामान्य अध्ययन प्रश्नपत्र 2 (GS Paper 2 - 200 Marks)',
        description: 'भारतीय संविधान, शासन प्रणाली, सामाजिक न्याय, नीतियां एवं अंतर्राष्ट्रीय संबंध (200 अंक)।',
        topics: [
          'भारतीय संविधान: ऐतिहासिक आधार, विशेषताएं, संशोधन एवं मूल ढांचा',
          'संघ एवं राज्यों के कार्य, उत्तरदायित्व एवं संघीय ढांचे की चुनौतियां',
          'शक्तियों का पृथक्करण, विवाद निवारण तंत्र एवं महत्वपूर्ण संवैधानिक पद',
          'विकास प्रक्रिया, गैर-सरकारी संगठन (NGOs), SHGs एवं सामाजिक न्याय',
          'भारत एवं इसके पड़ोसी संबंध, द्विपक्षीय, क्षेत्रीय एवं वैश्विक समूह',
        ],
      },
      {
        id: 'gs-paper-3',
        name: 'Mains: सामान्य अध्ययन प्रश्नपत्र 3 (GS Paper 3 - 200 Marks)',
        description: 'आर्थिक विकास, कृषि, विज्ञान एवं प्रौद्योगिकी, जैव विविधता, सुरक्षा एवं आपदा प्रबंधन (200 अंक)।',
        topics: [
          'भारतीय अर्थव्यवस्था, नियोजन, संसाधन जुटाना, संवृद्धि एवं विकास',
          'मुख्य फसलें, सिंचाई के प्रकार, भंडारण, परिवहन एवं किसानों की सहायता हेतु ई-प्रौद्योगिकी',
          'प्रत्यक्ष एवं अप्रत्यक्ष कृषि सब्सिडी, न्यूनतम समर्थन मूल्य (MSP) एवं PDS',
          'विज्ञान एवं प्रौद्योगिकी में भारतीयों की उपलब्धियां, साइबर सुरक्षा एवं आंतरिक सुरक्षा',
          'आपदा प्रबंधन, आपदा शमन एवं पर्यावरण प्रभाव आकलन (EIA)',
        ],
      },
      {
        id: 'gs-paper-4',
        name: 'Mains: सामान्य अध्ययन प्रश्नपत्र 4 (GS Paper 4: Ethics - 200 Marks)',
        description: 'नीतिशास्त्र तथा मानवीय सह-संबंध, अभिवृत्ति, सिविल सेवा मूल्य एवं सत्यनिष्ठा तथा केस स्टडीज (200 अंक)।',
        topics: [
          'नीतिशास्त्र तथा मानवीय सह-संबंध, मानवीय मूल्य एवं महापुरुषों का जीवन दर्शन',
          'अभिवृत्ति (Attitude): संरचना, कार्य, नैतिक एवं राजनीतिक प्रभाव',
          'सिविल सेवा के बुनियादी मूल्य: सत्यनिष्ठा, निष्पक्षता, गैर-पक्षपात एवं समानुभूति',
          'भावनात्मक समझ (Emotional Intelligence): अवधारणा एवं प्रशासन में उपयोग',
          'शासन व्यवस्था में ईमानदारी, लोक सेवा की अवधारणा एवं केस स्टडीज (Case Studies)',
        ],
      },
      {
        id: 'gs-paper-5',
        name: 'Mains: सामान्य अध्ययन प्रश्नपत्र 5 (GS Paper 5: UP Special I - 200 Marks)',
        description: 'उत्तर प्रदेश का इतिहास, संस्कृति, वास्तुकला, त्योहार, लोकनृत्य, राजव्यवस्था, न्यायपालिका एवं सुरक्षा (200 अंक)।',
        topics: [
          'उत्तर प्रदेश का इतिहास, सभ्यता, संस्कृति एवं प्राचीन नगर',
          '1857 के स्वतंत्रता संग्राम एवं भारतीय राष्ट्रीय आंदोलन में यूपी का योगदान',
          'उत्तर प्रदेश के लोकगीत, लोकनृत्य, मेले, पर्व एवं हस्तशिल्प',
          'उत्तर प्रदेश की शासन प्रणाली, राज्यपाल, मुख्यमंत्री, विधानसभा एवं उच्च न्यायालय',
          'उत्तर प्रदेश में लोक सेवाएं, लोक सेवा आयोग, लेखा परीक्षा एवं भूमि सुधार',
        ],
      },
      {
        id: 'gs-paper-6',
        name: 'Mains: सामान्य अध्ययन प्रश्नपत्र 6 (GS Paper 6: UP Special II - 200 Marks)',
        description: 'उत्तर प्रदेश का आर्थिक परिदृश्य, $1T लक्ष्य, बजट, बुनियादी ढांचा, भूगोल, पर्यावरण एवं खनिज (200 अंक)।',
        topics: [
          'उत्तर प्रदेश का आर्थिक परिदृश्य: $1 ट्रिलियन अर्थव्यवस्था का रोडमैप एवं राज्य बजट',
          'उत्तर प्रदेश में बुनियादी ढांचा: एक्सप्रेसवे, हवाई अड्डे, डिफेंस कॉरिडोर एवं औद्योगिक नीतियां',
          'एक जिला एक उत्पाद (ODOP), हथकरघा, हस्तशिल्प एवं MSME क्षेत्र',
          'उत्तर प्रदेश का भूगोल: उच्चावच, नदियां, मिट्टी, जलवायु एवं सिंचाई परियोजनाएं',
          'उत्तर प्रदेश के वन, राष्ट्रीय उद्यान, रामसर आर्द्रभूमियां, प्रदूषण एवं पर्यावरणीय मुद्दे',
        ],
      },
    ],
    tone: 'saffron',
  },
];

export const { exams, subjects, topics } = createCurriculum(curriculumDefinitions);

const studyMaterialByTopic: Record<string, StudyMaterial> = {
  ...uppcsCurrentAffairsStudyMaterials,
  'super-tet-child-development-1': {
    topicId: 'super-tet-child-development-1',
    intro: 'बाल विकास को समझने का सबसे अच्छा तरीका है बच्चे को एक सक्रिय, बदलते हुए व्यक्ति के रूप में देखना। विकास केवल कद और वजन में बदलाव नहीं, बल्कि सोच, भाषा, भावनाओं और सामाजिक व्यवहार में निरंतर परिवर्तन भी है।',
    sections: [
      {
        heading: 'विकास का अर्थ और विशेषताएँ',
        paragraphs: [
          'विकास एक क्रमिक और सतत प्रक्रिया है। यह गर्भावस्था से शुरू होकर जीवन भर चलती है। विकास में गुणात्मक और मात्रात्मक दोनों परिवर्तन शामिल होते हैं—जैसे शब्दावली का बढ़ना और समस्या हल करने की रणनीति का परिपक्व होना।',
          'हर बच्चे की विकास गति अलग हो सकती है। इसलिए शिक्षक का काम बच्चों की तुलना करना नहीं, बल्कि उनकी वर्तमान अवस्था को पहचानकर अगला सीखने का अवसर देना है।',
        ],
        bullets: ['विकास बहुआयामी है: शारीरिक, संज्ञानात्मक, भावनात्मक और सामाजिक।', 'विकास सामान्यतः सिर से पैर और सरल से जटिल दिशा में आगे बढ़ता है।', 'वंशानुक्रम और वातावरण दोनों विकास को प्रभावित करते हैं।'],
      },
      {
        heading: 'पियाजे और संज्ञानात्मक विकास',
        paragraphs: [
          'जीन पियाजे के अनुसार बच्चे ज्ञान को निष्क्रिय रूप से ग्रहण नहीं करते; वे अनुभवों के साथ सक्रिय रूप से अर्थ बनाते हैं। नई जानकारी को समझने के लिए बच्चा पहले से बने मानसिक ढाँचे का उपयोग करता है।',
          'कक्षा में इसका अर्थ है कि ठोस उदाहरण, गतिविधियाँ और प्रश्न बच्चों को केवल परिभाषा याद कराने से अधिक प्रभावी ढंग से सीखने में मदद करते हैं।',
        ],
        bullets: ['संवेदी-गामक अवस्था: जन्म से लगभग 2 वर्ष तक।', 'पूर्व-संक्रियात्मक अवस्था: लगभग 2 से 7 वर्ष तक।', 'ठोस संक्रियात्मक अवस्था: लगभग 7 से 11 वर्ष तक।', 'औपचारिक संक्रियात्मक अवस्था: लगभग 11 वर्ष के बाद।'],
      },
      {
        heading: 'शिक्षक के लिए कक्षा संकेत',
        paragraphs: [
          'बाल विकास का ज्ञान शिक्षक को एक ही गतिविधि सभी बच्चों पर लागू करने के बजाय स्तरानुकूल अनुभव बनाने में मदद करता है। निरीक्षण, बातचीत और छोटे कार्यों के माध्यम से शिक्षक बच्चे की समझ का अनुमान लगा सकता है।',
        ],
        bullets: ['गलत उत्तर को सीखने की प्रक्रिया का संकेत मानें, असफलता का लेबल नहीं।', 'खुले प्रश्न पूछें ताकि बच्चे अपनी सोच समझा सकें।', 'खेल, कहानी और सहयोगी कार्यों को सीखने के अवसर की तरह इस्तेमाल करें।'],
      },
    ],
    callouts: [
      { label: 'Exam focus', title: 'विकास और वृद्धि एक जैसे नहीं हैं', body: 'वृद्धि मुख्यतः शारीरिक और मापने योग्य परिवर्तन है, जबकि विकास में व्यवहार, सोच और क्षमताओं के गुणात्मक परिवर्तन भी शामिल होते हैं।' },
      { label: 'Remember', title: 'व्यक्तिगत भिन्नताएँ स्वाभाविक हैं', body: 'समान आयु के बच्चों की रुचि, गति और सीखने की शैली अलग हो सकती है। प्रभावी शिक्षक इस विविधता को योजना में शामिल करता है।' },
    ],
    keyTakeaways: ['विकास निरंतर, क्रमिक और बहुआयामी प्रक्रिया है।', 'बच्चे अनुभवों से ज्ञान का निर्माण करते हैं।', 'वंशानुक्रम और वातावरण का संयुक्त प्रभाव होता है।', 'कक्षा में स्तरानुकूल और गतिविधि-आधारित शिक्षण उपयोगी है।'],
    quickRevision: ['विकास = मात्रात्मक + गुणात्मक परिवर्तन', 'पियाजे: बच्चा सक्रिय ज्ञान-निर्माता', 'विकास की गति हर बच्चे में अलग', 'निरीक्षण शिक्षक का महत्वपूर्ण उपकरण'],
  },
  'ctet-child-development-1': {
    topicId: 'ctet-child-development-1',
    intro: 'Child development is a continuous pattern of change in physical, cognitive, language, emotional and social abilities. For a teacher, development is useful when it changes how a learner is observed, supported and assessed.',
    sections: [
      {
        heading: 'Development is multidimensional',
        paragraphs: [
          'A child may show strong language skills while still developing fine-motor control or emotional regulation. These dimensions influence one another, but they do not always move at the same pace.',
          'Development is shaped by both heredity and environment. Home experiences, peer relationships, nutrition, opportunity and classroom climate can all support or constrain growth.',
        ],
        bullets: ['It is continuous, but the rate may vary.', 'It follows a broad sequence, while individual outcomes differ.', 'Development is contextual rather than identical for every child.'],
      },
      {
        heading: 'Learning and development in the classroom',
        paragraphs: [
          'A constructivist classroom treats learners as active meaning-makers. Prior knowledge, language and everyday experiences become the starting point for new learning.',
          'Assessment should therefore include observation, discussion, student work and performance—not only a single written test.',
        ],
        bullets: ['Use questions that reveal thinking, not only final answers.', 'Offer multiple ways to participate and show understanding.', 'Treat mistakes as evidence for the next teaching step.'],
      },
    ],
    callouts: [
      { label: 'Exam focus', title: 'Growth is narrower than development', body: 'Growth usually refers to measurable physical change. Development includes qualitative changes in abilities, behaviour and thinking.' },
      { label: 'Classroom lens', title: 'Difference is not deficiency', body: 'Individual differences are expected. Inclusive teaching adjusts support without lowering the dignity or expectations of a learner.' },
    ],
    keyTakeaways: ['Development includes physical, cognitive, emotional and social dimensions.', 'Heredity and environment work together.', 'Learners construct meaning from prior experience.', 'Assessment should inform the next teaching decision.'],
    quickRevision: ['Continuous process', 'Individual pace differs', 'Learner is an active participant', 'Mistakes guide instruction'],
  },
  'super-tet-teaching-skills-1': {
    topicId: 'super-tet-teaching-skills-1',
    intro: 'शिक्षण एक उद्देश्यपूर्ण, संवादात्मक और बाल-केंद्रित प्रक्रिया है। परीक्षा की तैयारी में परिभाषाओं के साथ यह समझना जरूरी है कि शिक्षक, विद्यार्थी, विधि और मूल्यांकन एक-दूसरे से कैसे जुड़े हैं।',
    sections: [
      {
        heading: 'शिक्षण का अर्थ एवं परिभाषा',
        paragraphs: ['शिक्षण वह नियोजित प्रक्रिया है जिसमें शिक्षक सीखने के अवसर, अनुभव और मार्गदर्शन उपलब्ध कराता है ताकि विद्यार्थी के ज्ञान, कौशल, दृष्टिकोण और व्यवहार में अपेक्षित परिवर्तन आ सके।', 'शिक्षण केवल सूचना देना नहीं है; यह विद्यार्थी को समझने, प्रश्न पूछने, अभ्यास करने और अपने अनुभव से अर्थ बनाने में सहायता करता है।'],
        bullets: ['शिक्षण एक उद्देश्यपूर्ण प्रक्रिया है।', 'शिक्षण में शिक्षक और विद्यार्थी दोनों सक्रिय भागीदार होते हैं।', 'शिक्षण का अंतिम लक्ष्य सीखने को अर्थपूर्ण बनाना है।'],
      },
      {
        heading: 'शिक्षण के उद्देश्य',
        paragraphs: ['शिक्षण के उद्देश्य बताते हैं कि पाठ या गतिविधि के बाद विद्यार्थी क्या जानेंगे, क्या कर सकेंगे और किस प्रकार का दृष्टिकोण विकसित करेंगे। स्पष्ट उद्देश्य शिक्षक को सामग्री, विधि और मूल्यांकन चुनने में मदद करते हैं।'],
        bullets: ['ज्ञान और समझ का विकास', 'कौशल और समस्या-समाधान क्षमता का विकास', 'मूल्यों, रुचियों और सकारात्मक दृष्टिकोण का विकास'],
      },
      {
        heading: 'शिक्षण के सिद्धांत',
        paragraphs: ['शिक्षण के सिद्धांत वे सामान्य मार्गदर्शक नियम हैं जो कक्षा में सीखने को सरल और प्रभावी बनाते हैं। शिक्षक को आयु, पूर्वज्ञान और संदर्भ के अनुसार इन सिद्धांतों का लचीला उपयोग करना चाहिए।'],
        bullets: ['ज्ञात से अज्ञात की ओर', 'सरल से कठिन की ओर', 'ठोस से अमूर्त की ओर', 'विशेष से सामान्य की ओर', 'अनुभव और गतिविधि से सीखना'],
      },
      {
        heading: 'शिक्षण की विशेषताएँ',
        paragraphs: ['प्रभावी शिक्षण लचीला, संवादात्मक और संदर्भ-संवेदनशील होता है। इसमें शिक्षक लगातार यह देखता है कि विद्यार्थी क्या समझ रहा है और अगला शिक्षण कदम क्या होना चाहिए।'],
        bullets: ['शिक्षण सामाजिक और द्विपक्षीय प्रक्रिया है।', 'शिक्षण में योजना और उद्देश्य दोनों आवश्यक हैं।', 'शिक्षण के परिणामों का मूल्यांकन किया जाता है।'],
      },
      {
        heading: 'प्रभावी शिक्षण',
        paragraphs: ['प्रभावी शिक्षण में स्पष्ट निर्देश, उपयुक्त उदाहरण, सक्रिय भागीदारी और समय पर प्रतिक्रिया का संतुलन होता है। केवल अधिक सामग्री पूरा कर लेना प्रभावी शिक्षण नहीं माना जाता; समझ और अनुप्रयोग अधिक महत्वपूर्ण हैं।'],
        bullets: ['पाठ का उद्देश्य शुरुआत में स्पष्ट करें।', 'विद्यार्थियों को बोलने, करने और समझाने के अवसर दें।', 'गलतियों पर रचनात्मक प्रतिक्रिया दें।'],
      },
      {
        heading: 'शिक्षक की भूमिका',
        paragraphs: ['आधुनिक कक्षा में शिक्षक केवल व्याख्यान देने वाला व्यक्ति नहीं है। वह मार्गदर्शक, सहायक, प्रेरक, मूल्यांकनकर्ता और सीखने के वातावरण का निर्माता भी है।'],
        bullets: ['विद्यार्थियों की आवश्यकताओं को पहचानना', 'सुरक्षित और समावेशी वातावरण बनाना', 'सीखने के लिए संसाधन और अवसर उपलब्ध कराना'],
      },
      {
        heading: 'विद्यार्थी की भूमिका',
        paragraphs: ['विद्यार्थी सीखने की प्रक्रिया का सक्रिय केंद्र है। प्रश्न पूछना, पूर्वज्ञान से जोड़ना, सहयोग करना और अपने सीखने पर विचार करना विद्यार्थी की महत्वपूर्ण भूमिकाएँ हैं।'],
        bullets: ['सक्रिय रूप से सुनना और भाग लेना', 'अभ्यास तथा स्व-मूल्यांकन करना', 'सहपाठियों के विचारों का सम्मान करना'],
      },
      {
        heading: 'शिक्षण की विभिन्न विधियाँ',
        paragraphs: ['शिक्षण विधि का चुनाव उद्देश्य, विषय, समय, कक्षा के आकार और विद्यार्थियों की जरूरतों पर निर्भर करता है। किसी एक विधि को हर परिस्थिति में सर्वोत्तम नहीं माना जा सकता।'],
        bullets: ['व्याख्या और प्रदर्शन विधि: प्रक्रिया या अवधारणा को क्रम से समझाने के लिए', 'चर्चा विधि: विचार, तर्क और अभिव्यक्ति विकसित करने के लिए', 'परियोजना और समस्या-समाधान विधि: अनुप्रयोग और सहयोग के लिए', 'खेल तथा गतिविधि विधि: छोटे बच्चों की सक्रिय भागीदारी के लिए'],
        tables: [{ headers: ['विधि', 'सबसे उपयोगी कब'], rows: [['चर्चा', 'विचार और तर्क विकसित करने में'], ['प्रदर्शन', 'किसी प्रक्रिया या कौशल को दिखाने में'], ['परियोजना', 'वास्तविक जीवन से जोड़कर सीखने में']] }],
      },
      {
        heading: 'बाल-केंद्रित शिक्षण',
        paragraphs: ['बाल-केंद्रित शिक्षण में पाठ की योजना बच्चे की रुचि, गति, अनुभव और जरूरतों को ध्यान में रखकर बनाई जाती है। शिक्षक सीखने के अवसर देता है और विद्यार्थी खोज, प्रश्न तथा सहयोग के माध्यम से सीखता है।'],
        bullets: ['बच्चे के अनुभव को सीखने का प्रारंभिक बिंदु बनाएं।', 'विभिन्न स्तरों के लिए अलग सहायता दें।', 'गतिविधि और चुनाव के अवसर बढ़ाएं।'],
      },
      {
        heading: 'व्यक्तिगत भिन्नताएँ',
        paragraphs: ['विद्यार्थियों में बुद्धि, भाषा, रुचि, सीखने की गति, पारिवारिक अनुभव और सामाजिक पृष्ठभूमि के कारण भिन्नताएँ होती हैं। समान अवसर का अर्थ सभी को बिल्कुल एक जैसा कार्य देना नहीं, बल्कि आवश्यक सहायता उपलब्ध कराना है।'],
        bullets: ['तुलना के बजाय व्यक्तिगत प्रगति पर ध्यान दें।', 'बहुविध उदाहरण और अभिव्यक्ति के अवसर दें।', 'कम प्रदर्शन को स्थायी क्षमता का प्रमाण न मानें।'],
      },
      {
        heading: 'प्रेरणा एवं अधिगम',
        paragraphs: ['प्रेरणा वह शक्ति है जो विद्यार्थी को सीखने, प्रयास करने और लक्ष्य की ओर बढ़ने के लिए तैयार करती है। आंतरिक प्रेरणा रुचि और संतोष से आती है, जबकि बाहरी प्रेरणा पुरस्कार या परिणाम से जुड़ी हो सकती है।'],
        bullets: ['स्पष्ट और प्राप्त करने योग्य लक्ष्य दें।', 'प्रगति पर विशिष्ट और समय पर प्रतिक्रिया दें।', 'विद्यार्थी को विकल्प और जिम्मेदारी दें।'],
      },
      {
        heading: 'कक्षा प्रबंधन',
        paragraphs: ['कक्षा प्रबंधन का उद्देश्य केवल अनुशासन बनाए रखना नहीं, बल्कि ऐसा वातावरण बनाना है जिसमें समय, संसाधन और व्यवहार सीखने के पक्ष में काम करें। नियम कम, स्पष्ट और पहले से समझाए हुए होने चाहिए।'],
        bullets: ['दैनिक प्रक्रियाओं और अपेक्षाओं को स्पष्ट करें।', 'सकारात्मक व्यवहार को पहचानें।', 'समस्या आने पर व्यक्ति नहीं, व्यवहार पर प्रतिक्रिया दें।'],
      },
      {
        heading: 'मूल्यांकन एवं शिक्षण',
        paragraphs: ['मूल्यांकन शिक्षण का अंत नहीं, बल्कि अगली शिक्षण योजना के लिए प्रमाण है। प्रारंभिक, निर्माणात्मक और योगात्मक मूल्यांकन अलग-अलग उद्देश्यों की पूर्ति करते हैं।'],
        bullets: ['निदानात्मक मूल्यांकन से पूर्वज्ञान और कठिनाई का पता चलता है।', 'निर्माणात्मक मूल्यांकन सीखते समय सुधार का अवसर देता है।', 'योगात्मक मूल्यांकन इकाई या पाठ्यक्रम के अंत में उपलब्धि बताता है।'],
      },
      {
        heading: 'शिक्षण में ICT',
        paragraphs: ['सूचना एवं संचार प्रौद्योगिकी शिक्षण को दृश्य, संवादात्मक और संसाधन-समृद्ध बना सकती है। ICT का उपयोग उद्देश्य के अनुसार होना चाहिए; तकनीक स्वयं शिक्षण का लक्ष्य नहीं है।'],
        bullets: ['वीडियो, सिमुलेशन और डिजिटल प्रस्तुति से कठिन अवधारणाएँ स्पष्ट हो सकती हैं।', 'डिजिटल सामग्री की विश्वसनीयता और पहुंच जांचें।', 'ऑफलाइन और कम-तकनीकी विकल्प भी रखें।'],
      },
      {
        heading: 'परीक्षा की दृष्टि से महत्वपूर्ण तथ्य',
        paragraphs: ['शिक्षण कौशल के प्रश्नों में अक्सर शिक्षक की भूमिका, बाल-केंद्रित दृष्टिकोण, व्यक्तिगत भिन्नता, मूल्यांकन और शिक्षण विधियों के सही मिलान पर जोर दिया जाता है। विकल्पों में सबसे समावेशी और सीखने-केंद्रित उत्तर को प्राथमिकता दें।'],
        bullets: ['शिक्षण = उद्देश्यपूर्ण और सामाजिक प्रक्रिया', 'बाल-केंद्रित कक्षा में विद्यार्थी सक्रिय और शिक्षक सहायक होता है', 'निर्माणात्मक मूल्यांकन सीखने के दौरान सुधार करता है', 'विधि का चुनाव उद्देश्य और संदर्भ के अनुसार होता है', 'ICT का चयन शैक्षिक उद्देश्य के अनुसार किया जाता है'],
        numberedPoints: [{ text: 'परिभाषा पढ़कर उसका कक्षा-उदाहरण सोचें', style: 'numbered' }, { text: 'विधि, उद्देश्य और मूल्यांकन का मिलान करें', style: 'numbered' }, { text: 'समावेशी और विद्यार्थी-केंद्रित विकल्पों को पहचानें', style: 'numbered' }],
      },
    ],
    callouts: [
      { label: 'Exam focus', title: 'शिक्षण सूचना देने से अधिक है', body: 'सही उत्तर सामान्यतः वह होगा जो विद्यार्थी की सक्रिय भागीदारी, समझ, अनुभव और प्रगति को केंद्र में रखता है।' },
      { label: 'Important note', title: 'एक ही विधि हर कक्षा के लिए नहीं', body: 'उद्देश्य, विषय, आयु, समय और उपलब्ध संसाधनों के आधार पर शिक्षण विधि बदलती है।' },
    ],
    keyTakeaways: ['शिक्षण उद्देश्यपूर्ण, सामाजिक और द्विपक्षीय प्रक्रिया है।', 'बाल-केंद्रित शिक्षण में विद्यार्थी सक्रिय और शिक्षक मार्गदर्शक होता है।', 'व्यक्तिगत भिन्नताओं के लिए लचीली सहायता जरूरी है।', 'मूल्यांकन अगली शिक्षण योजना को दिशा देता है।', 'ICT का उपयोग उद्देश्य और संदर्भ के अनुसार होना चाहिए।'],
    quickRevision: ['ज्ञात से अज्ञात', 'बाल-केंद्रित दृष्टिकोण', 'निर्माणात्मक मूल्यांकन', 'व्यक्तिगत भिन्नताएँ', 'उद्देश्य के अनुसार विधि'],
  },
  'ssc-cgl-reasoning-1': {
    topicId: 'ssc-cgl-reasoning-1',
    intro: 'Analogy and classification questions test whether you can identify a consistent relationship or a common property. The fastest method is not guesswork; it is to name the relationship before checking the options.',
    sections: [
      {
        heading: 'How to approach an analogy',
        paragraphs: [
          'An analogy is written as A : B :: C : ?. First identify how A changes into B. Apply the same operation to C and then verify the answer against every option.',
        ],
        bullets: ['Check whether the relation is based on meaning, number, alphabet, part-whole or function.', 'Keep the direction of the relation unchanged.', 'Reject an option that fits only one superficial feature.'],
      },
      {
        heading: 'Classification and the odd one out',
        paragraphs: [
          'In classification, three or more items share a property and one item does not. Group the items by the strongest common rule, not by an accidental visual similarity.',
        ],
        bullets: ['Try categories such as place, use, number pattern, family or scientific group.', 'If two rules appear possible, prefer the rule that covers the largest group.', 'Use elimination and re-check the wording before finalising.'],
      },
    ],
    callouts: [
      { label: 'Exam focus', title: 'State the rule in one sentence', body: 'If you cannot explain the relation clearly, the pattern may be incomplete. A one-line rule protects you from attractive but incorrect options.' },
      { label: 'Speed note', title: 'Do not overwork a simple pattern', body: 'Test common relationships first. Move on when a clean rule explains all given pairs and one option.' },
    ],
    keyTakeaways: ['Identify the rule before looking for the answer.', 'Keep analogy direction consistent.', 'Classification depends on a shared property.', 'Prefer a rule that explains all items.'],
    quickRevision: ['Meaning', 'Number pattern', 'Alphabet position', 'Function or part-whole'],
  },
  'cbse-class-10-mathematics-1': {
    topicId: 'cbse-class-10-mathematics-1',
    intro: 'Real numbers connect the Euclidean division algorithm, prime factorisation and the nature of rational and irrational numbers. Keep the definitions separate, then use the theorem that matches the question.',
    sections: [
      {
        heading: 'Euclid’s division lemma',
        paragraphs: [
          'For positive integers a and b, there exist unique integers q and r such that a = bq + r, where 0 ≤ r < b. Repeatedly applying this identity gives the Euclidean algorithm for finding the HCF.',
        ],
        bullets: ['Divide the larger number by the smaller number.', 'Replace the divisor and remainder until the remainder becomes zero.', 'The last non-zero remainder is the HCF.'],
      },
      {
        heading: 'Fundamental theorem of arithmetic',
        paragraphs: [
          'Every composite number can be expressed as a product of primes, and this factorisation is unique apart from the order of factors. Prime factorisation is useful for HCF, LCM and decimal-expansion questions.',
        ],
        bullets: ['Terminating decimal: denominator in lowest form has only 2 and/or 5 as prime factors.', 'A denominator with another prime factor produces a non-terminating recurring decimal.', 'Always reduce the fraction before checking the denominator.'],
      },
    ],
    callouts: [
      { label: 'Exam focus', title: 'Reduce before checking 2 and 5', body: 'The terminating-decimal test applies to the denominator after the rational number has been written in lowest form.' },
      { label: 'Common error', title: 'Remainder has a condition', body: 'In Euclid’s division lemma, the remainder is never equal to or greater than the divisor: 0 ≤ r < b.' },
    ],
    keyTakeaways: ['a = bq + r with 0 ≤ r < b.', 'The last non-zero remainder gives HCF.', 'Prime factorisation is unique.', 'Lowest-form denominator decides decimal type.'],
    quickRevision: ['Euclid algorithm', 'Prime factorisation', 'HCF and LCM', 'Terminating decimal test'],
  },
};

topics.forEach((topic) => {
  if (topic.examId === 'ssc-cgl') {
    topic.availability.studyMaterial = false;
    topic.availability.theory = false;
    topic.availability.quiz = true;
    topic.availability.pyq = true;
    return;
  }
  topic.availability.studyMaterial =
    Boolean(studyMaterialByTopic[topic.id]) ||
    topic.subjectId === 'super-tet-child-development' ||
    topic.subjectId === 'super-tet-teaching-skills';
});

export function getExam(examId: string) {
  const norm = (examId || '').toLowerCase().trim();
  const direct = exams.find((exam) => exam.id.toLowerCase() === norm);
  if (direct) return direct;

  if (norm === 'uppcs' || norm === 'uppsc' || norm === 'up-pcs' || norm === 'uppcs-exam') {
    return exams.find((e) => e.id === 'uppcs') || exams.find((e) => e.id === 'uppcs-pre');
  }
  return undefined;
}

export function getSubject(subjectId: string, examId?: string) {
  const norm = (subjectId || '').toLowerCase().trim();
  const normExam = (examId || '').toLowerCase().trim();

  // If examId is provided, prioritize subject matching that exam
  if (normExam) {
    const directMatch = subjects.find(
      (s) =>
        s.examId.toLowerCase() === normExam &&
        (s.id.toLowerCase() === norm ||
          s.id.toLowerCase() === `${normExam}-${norm}` ||
          (s.id === 'cbse-class-10-science' && (norm === 'science' || norm === 'cbse-science')) ||
          (s.id === 'cbse-class-10-mathematics' && (norm === 'mathematics' || norm === 'maths' || norm === 'math' || norm === 'cbse-maths' || norm === 'cbse-mathematics')) ||
          (s.id === 'super-tet-science' && (norm === 'science' || norm === 'vigyan')))
    );
    if (directMatch) return directMatch;
  }

  const standardMatch = subjects.find(
    (subject) =>
      subject.id.toLowerCase() === norm ||
      (subject.examId === 'cbse-class-10' && (
        (subject.id === 'cbse-class-10-science' && (
          norm === 'cbse-class-10-science' ||
          norm === 'cbse-10-science' ||
          norm === 'class-10-science' ||
          norm === 'science'
        )) ||
        (subject.id === 'cbse-class-10-mathematics' && (
          norm === 'cbse-class-10-mathematics' ||
          norm === 'cbse-10-mathematics' ||
          norm === 'class-10-mathematics' ||
          norm === 'cbse-maths' ||
          norm === 'cbse-10-maths' ||
          norm === 'mathematics' ||
          norm === 'maths' ||
          norm === 'math'
        ))
      )) ||
      (subject.examId === 'super-tet' && (
        (subject.id === 'super-tet-teaching-skills' && (norm === 'teaching-skills' || norm === 'shikshan-kaushal' || norm === 'super-tet-shikshan-kaushal' || norm === 'shikshan-kaushal-pedagogy')) ||
        (subject.id === 'super-tet-child-development' && (
          norm === 'child-development' ||
          norm === 'bal-vikas' ||
          norm === 'super-tet-bal-vikas' ||
          norm === 'cdp' ||
          norm === 'bal-manovigyan' ||
          norm === 'bal-vikas-shikshan-vidhiyan' ||
          norm === 'super-tet-bal-vikas-shikshan-vidhiyan'
        )) ||
        (subject.id === 'super-tet-hindi' && norm === 'hindi') ||
        (subject.id === 'super-tet-english' && norm === 'english') ||
        (subject.id === 'super-tet-mathematics' && (norm === 'mathematics' || norm === 'maths' || norm === 'math')) ||
        (subject.id === 'super-tet-evs' && (norm === 'evs' || norm === 'environment')) ||
        (subject.id === 'super-tet-science' && (norm === 'science' || norm === 'vigyan')) ||
        (subject.id === 'super-tet-social-studies' && (norm === 'social-studies' || norm === 'sst')) ||
        (subject.id === 'super-tet-general-knowledge' && (norm === 'general-knowledge' || norm === 'gk')) ||
        (subject.id === 'super-tet-current-affairs' && (norm === 'current-affairs' || norm === 'ca')) ||
        (subject.id === 'super-tet-information-technology' && (norm === 'information-technology' || norm === 'it' || norm === 'computer'))
      )) ||
      (subject.examId === 'uppcs-pre' && (
        (subject.id === 'uppcs-pre-current-affairs' && (
          norm === 'current-affairs' ||
          norm === 'uppcs-current-affairs' ||
          norm === 'uppcs-pre-current-affairs' ||
          norm === 'ca' ||
          norm === 'samayiki'
        ))
      )) ||
      (subject.examId === 'uppcs' && (
        (subject.id === 'uppcs-current-affairs' && (
          norm === 'current-affairs' ||
          norm === 'uppcs-current-affairs' ||
          norm === 'ca' ||
          norm === 'samayiki'
        ))
      ))
  );
  if (standardMatch) return standardMatch;

  // Suffix or substring match fallback
  return subjects.find(
    (s) => s.id.toLowerCase().endsWith(norm) || norm.endsWith(s.id.toLowerCase())
  );
}

export function getTopic(topicId: string) {
  const norm = (topicId || '').toLowerCase().trim();

  // 1. Direct match
  const direct = topics.find((topic) => topic.id.toLowerCase() === norm);
  if (direct) return direct;

  // 2. CBSE Class 10 Science chapter aliases & slugs
  const scienceSlugToId: Record<string, string> = {
    'chemical-reactions-and-equations': 'cbse-class-10-science-1',
    'acids-bases-and-salts': 'cbse-class-10-science-2',
    'metals-and-non-metals': 'cbse-class-10-science-3',
    'carbon-and-its-compounds': 'cbse-class-10-science-4',
    'life-processes': 'cbse-class-10-science-5',
    'control-and-coordination': 'cbse-class-10-science-6',
    'how-do-organisms-reproduce': 'cbse-class-10-science-7',
    'heredity': 'cbse-class-10-science-8',
    'light-reflection-and-refraction': 'cbse-class-10-science-9',
    'human-eye-and-colourful-world': 'cbse-class-10-science-10',
    'electricity': 'cbse-class-10-science-11',
    'magnetic-effects-of-electric-current': 'cbse-class-10-science-12',
    'our-environment': 'cbse-class-10-science-13',
  };
  if (scienceSlugToId[norm]) {
    const match = topics.find((t) => t.id === scienceSlugToId[norm]);
    if (match) return match;
  }

  if (
    norm.startsWith('cbse-class-10-science-') ||
    norm.startsWith('cbse-10-science-') ||
    norm.startsWith('science-ch-') ||
    norm.startsWith('chapter-')
  ) {
    const num = parseInt(norm.replace(/\D/g, ''), 10);
    if (!isNaN(num) && num >= 1 && num <= 13) {
      const match = topics.find((t) => t.id === `cbse-class-10-science-${num}`);
      if (match) return match;
    }
  }

  // 3. CBSE Class 10 Mathematics chapter aliases & slugs
  const mathsSlugToId: Record<string, string> = {
    'real-numbers': 'cbse-class-10-mathematics-1',
    'polynomials': 'cbse-class-10-mathematics-2',
    'pair-of-linear-equations-in-two-variables': 'cbse-class-10-mathematics-3',
    'pair-of-linear-equations': 'cbse-class-10-mathematics-3',
    'linear-equations': 'cbse-class-10-mathematics-3',
    'quadratic-equations': 'cbse-class-10-mathematics-4',
    'arithmetic-progressions': 'cbse-class-10-mathematics-5',
    'ap': 'cbse-class-10-mathematics-5',
    'triangles': 'cbse-class-10-mathematics-6',
    'coordinate-geometry': 'cbse-class-10-mathematics-7',
    'introduction-to-trigonometry': 'cbse-class-10-mathematics-8',
    'trigonometry': 'cbse-class-10-mathematics-8',
    'some-applications-of-trigonometry': 'cbse-class-10-mathematics-9',
    'applications-of-trigonometry': 'cbse-class-10-mathematics-9',
    'heights-and-distances': 'cbse-class-10-mathematics-9',
    'circles': 'cbse-class-10-mathematics-10',
    'areas-related-to-circles': 'cbse-class-10-mathematics-11',
    'surface-areas-and-volumes': 'cbse-class-10-mathematics-12',
    'statistics': 'cbse-class-10-mathematics-13',
    'probability': 'cbse-class-10-mathematics-14',
  };
  if (mathsSlugToId[norm]) {
    const match = topics.find((t) => t.id === mathsSlugToId[norm]);
    if (match) return match;
  }

  if (
    norm.startsWith('cbse-class-10-mathematics-') ||
    norm.startsWith('cbse-10-math-') ||
    norm.startsWith('cbse-10-maths-') ||
    norm.startsWith('math-ch-') ||
    norm.startsWith('maths-ch-')
  ) {
    const num = parseInt(norm.replace(/\D/g, ''), 10);
    if (!isNaN(num) && num >= 1 && num <= 14) {
      const match = topics.find((t) => t.id === `cbse-class-10-mathematics-${num}`);
      if (match) return match;
    }
  }

  // 2. Google Sheet Topic aliases for Super TET CDP chapters
  if (norm === 'bal-vikas-arth-prakriti' || norm.includes('bal-vikas-arth')) {
    return topics.find((t) => t.id === 'super-tet-child-development-1');
  }
  if (norm === 'vikas-ki-avasthayen' || norm.includes('vikas-ki-avastha')) {
    return topics.find((t) => t.id === 'super-tet-child-development-2');
  }
  if (norm === 'vanshanukram-evam-vatavaran' || norm.includes('vanshanukram')) {
    return topics.find((t) => t.id === 'super-tet-child-development-3');
  }
  if (norm === 'vyaktigat-vibhinnataen' || norm.includes('vyaktigat-vibhinnat')) {
    return topics.find((t) => t.id === 'super-tet-child-development-4');
  }
  if (norm === 'adhigam-evam-vikas-ka-sambandh' || norm.includes('adhigam-evam-vikas')) {
    return topics.find((t) => t.id === 'super-tet-child-development-5');
  }

  // 3. Numbered aliases (st-sk-01, st-cd-01, etc.)
  return topics.find((topic) => {
    const skNorm = norm.replace('st-sk-top-', '').replace('st-sk-', '');
    const num = parseInt(skNorm, 10);
    if (!isNaN(num) && num >= 1 && num <= 15) {
      return topic.id === `super-tet-teaching-skills-${num}`;
    }
    const cdNorm = norm.replace('st-cd-top-', '').replace('st-cd-', '');
    const cdNum = parseInt(cdNorm, 10);
    if (!isNaN(cdNum) && cdNum >= 1 && cdNum <= 10) {
      return topic.id === `super-tet-child-development-${cdNum}`;
    }
    return false;
  });
}

export function getSubjectsForExam(examId: string) {
  return subjects.filter((subject) => subject.examId === examId);
}

export function getTopicsForSubject(subjectId: string) {
  return topics.filter((topic) => topic.subjectId === subjectId);
}

export function getStudyMaterial(topicId: string) {
  const baseMaterial = studyMaterialByTopic[topicId];
  // Check dynamically loaded / bundled notes from Google Sheet
  const notes = getStudyNotesForTopic(topicId);
  if (notes && notes.length > 0) {
    return convertNotesToStudyMaterial(topicId, notes, baseMaterial);
  }
  return baseMaterial;
}
