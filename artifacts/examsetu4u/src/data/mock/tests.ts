import { getExam, getSubject } from '@/data/curriculum';
import { pyqQuestions, type PYQQuestion } from '@/data/pyq';
import { getAllQuizQuestions, getQuestionById } from '@/data/quiz/questions';
import type { MCQQuestion } from '@/data/quiz/types';
import type { MockTestConfig } from './types';

// Convert PYQ questions to MCQQuestion structure without modifying original data
function pyqToMCQQuestion(pyq: PYQQuestion): MCQQuestion {
  return {
    id: pyq.id,
    examId: pyq.metadata.examId,
    examName: getExam(pyq.metadata.examId)?.name || pyq.metadata.examId,
    subjectId: pyq.metadata.subjectId,
    topicId: pyq.metadata.topicId,
    question: pyq.prompt,
    options: {
      A: pyq.options[0]?.text || '',
      B: pyq.options[1]?.text || '',
      C: pyq.options[2]?.text || '',
      D: pyq.options[3]?.text || '',
    },
    correctAnswer: (pyq.correctOptionId.toUpperCase() as 'A' | 'B' | 'C' | 'D') || 'A',
    explanation: pyq.explanation.answerReason,
    importantPoint: pyq.explanation.importantPoint,
    additionalFact: pyq.explanation.additionalFact,
    commonMistake: pyq.explanation.commonMistake,
    difficulty: pyq.metadata.difficulty === 'Challenging' ? 'Hard' : pyq.metadata.difficulty,
    sourceType: 'PYQ',
    year: pyq.metadata.year,
  };
}

// Pre-configured Mock Tests covering all 6 target exams
export const mockTestConfigs: MockTestConfig[] = [
  // 1. Super TET
  {
    id: 'st-full-mock-01',
    examId: 'super-tet',
    title: 'Super TET Full Length Mock Test - 01',
    description: 'शिक्षण कौशल, बाल विकास एवं शिक्षण पद्धतियों पर आधारित संपूर्ण परीक्षा पैटर्न मॉक टेस्ट।',
    testType: 'full',
    questionCount: 20,
    durationMinutes: 30,
    difficulty: 'Moderate',
    subjects: ['super-tet-teaching-skills', 'super-tet-child-development'],
    randomizeQuestions: true,
    randomizeOptions: false,
    negativeMarking: false,
    negativeMarks: 0,
    marksPerQuestion: 1,
    instructions: [
      'इस परीक्षा में कुल 20 बहुविकल्पीय प्रश्न हैं और कुल समय 30 मिनट है।',
      'प्रत्येक सही उत्तर के लिए 1 अंक मिलेगा। कोई नकारात्मक अंकन (Negative Marking) नहीं है।',
      'परीक्षा के दौरान किसी भी प्रश्न पर जाने के लिए Question Navigator Palette का उपयोग करें।',
      'जिस प्रश्न पर संदेह हो, उसे "Mark for Review" कर सकते हैं।',
      'समय समाप्त होने पर टेस्ट स्वतः सबमिट हो जाएगा।',
    ],
  },
  {
    id: 'st-subject-teaching-skills',
    examId: 'super-tet',
    title: 'Super TET शिक्षण कौशल विषयवार टेस्ट (Subject Mock)',
    description: 'शिक्षण सिद्धांत, विधियाँ, ब्लूम टैक्सोनॉमी और कक्षा प्रबंधन पर केंद्रित विशेष मॉक टेस्ट।',
    testType: 'subject',
    questionCount: 15,
    durationMinutes: 20,
    difficulty: 'Moderate',
    subjects: ['super-tet-teaching-skills'],
    randomizeQuestions: true,
    randomizeOptions: false,
    negativeMarking: false,
    negativeMarks: 0,
    marksPerQuestion: 1,
    instructions: [
      'शिक्षण कौशल के महत्वपूर्ण अध्यायों पर आधारित 15 प्रश्न।',
      'समय सीमा: 20 मिनट। कोई नकारात्मक अंकन नहीं।',
      'टेस्ट सबमिशन के बाद विस्तृत समाधान व कमजोर टॉपिक विश्लेषण उपलब्ध होगा।',
    ],
  },
  {
    id: 'st-practice-pedagogy-speed',
    examId: 'super-tet',
    title: 'बाल विकास एवं शिक्षण गति अभ्यास (Speed Test)',
    description: 'कम समय में त्वरित निर्णय लेने और सटीकता बढ़ाने के लिए 10 प्रश्नों का रैपिड मॉक।',
    testType: 'practice',
    questionCount: 10,
    durationMinutes: 12,
    difficulty: 'Easy',
    subjects: ['super-tet-teaching-skills', 'super-tet-child-development'],
    randomizeQuestions: true,
    randomizeOptions: false,
    negativeMarking: false,
    negativeMarks: 0,
    marksPerQuestion: 1,
    instructions: [
      '10 त्वरित प्रश्न, 12 मिनट का समय।',
      'अपने समय प्रबंधन और एक्यूरेसी की जांच करें।',
    ],
  },

  // 2. SSC CGL
  {
    id: 'ssc-cgl-tier1-mock-01',
    examId: 'ssc-cgl',
    title: 'SSC CGL Tier-1 General Awareness & Reasoning Mock',
    description: 'रीजनिंग और सामान्य जागरूकता पर आधारित टीसीएस पैटर्न अभ्यास परीक्षा (नकारात्मक अंकन सहित)।',
    testType: 'full',
    questionCount: 15,
    durationMinutes: 20,
    difficulty: 'Hard',
    subjects: ['ssc-cgl-reasoning', 'ssc-cgl-general-awareness'],
    randomizeQuestions: true,
    randomizeOptions: false,
    negativeMarking: true,
    negativeMarks: 0.5,
    marksPerQuestion: 2,
    instructions: [
      'प्रत्येक प्रश्न 2 अंक का है।',
      'सावधानी: प्रत्येक गलत उत्तर के लिए 0.50 अंक काटे जाएंगे (Negative Marking)।',
      'अनुत्तरित प्रश्नों के लिए कोई अंक नहीं काटा जाएगा।',
      'समय सीमा 20 मिनट है।',
    ],
  },
  {
    id: 'ssc-cgl-subject-ga',
    examId: 'ssc-cgl',
    title: 'SSC CGL General Awareness Sectional Mock',
    description: 'भारतीय संविधान, इतिहास और समसामयिक सामान्य अध्ययन सेक्शनल टेस्ट।',
    testType: 'subject',
    questionCount: 10,
    durationMinutes: 12,
    difficulty: 'Moderate',
    subjects: ['ssc-cgl-general-awareness'],
    randomizeQuestions: true,
    randomizeOptions: false,
    negativeMarking: true,
    negativeMarks: 0.5,
    marksPerQuestion: 2,
    instructions: [
      'सामान्य जागरूकता के 10 प्रश्न।',
      'प्रत्येक सही उत्तर पर +2 अंक, गलत उत्तर पर -0.50 अंक।',
    ],
  },

  // 3. CBSE Class 10
  {
    id: 'cbse-10-science-math-mock',
    examId: 'cbse-class-10',
    title: 'CBSE Class 10 Science & Mathematics Board Pattern Mock',
    description: 'बोर्ड परीक्षा प्रारूप पर आधारित बहुविकल्पीय वस्तुनिष्ठ प्रश्न अभ्यास।',
    testType: 'full',
    questionCount: 12,
    durationMinutes: 20,
    difficulty: 'Moderate',
    subjects: ['cbse-class-10-science', 'cbse-class-10-mathematics'],
    randomizeQuestions: true,
    randomizeOptions: false,
    negativeMarking: false,
    negativeMarks: 0,
    marksPerQuestion: 1,
    instructions: [
      'सीबीएसई कक्षा 10 बोर्ड परीक्षा पैटर्न अनुसार प्रश्न।',
      'प्रत्येक प्रश्न 1 अंक का है। नकारात्मक अंकन नहीं है।',
    ],
  },
  {
    id: 'cbse-10-social-science-mock',
    examId: 'cbse-class-10',
    title: 'CBSE Class 10 Social Science Chapter Practice',
    description: 'इतिहास, भूगोल और नागरिक शास्त्र के महत्वपूर्ण बहुविकल्पीय प्रश्न।',
    testType: 'subject',
    questionCount: 8,
    durationMinutes: 15,
    difficulty: 'Easy',
    subjects: ['cbse-class-10-social-science'],
    randomizeQuestions: true,
    randomizeOptions: false,
    negativeMarking: false,
    negativeMarks: 0,
    marksPerQuestion: 1,
    instructions: [
      'सामाजिक विज्ञान वस्तुनिष्ठ अभ्यास।',
      'समय सीमा 15 मिनट।',
    ],
  },

  // 4. CBSE Class 12
  {
    id: 'cbse-12-science-stream-mock',
    examId: 'cbse-class-12',
    title: 'CBSE Class 12 Physics & Chemistry Practice Mock',
    description: 'कक्षा 12 विज्ञान वर्ग हेतु महत्वपूर्ण बहुविकल्पीय अभ्यास पत्र।',
    testType: 'full',
    questionCount: 10,
    durationMinutes: 15,
    difficulty: 'Hard',
    subjects: ['cbse-class-12-physics', 'cbse-class-12-chemistry'],
    randomizeQuestions: true,
    randomizeOptions: false,
    negativeMarking: false,
    negativeMarks: 0,
    marksPerQuestion: 1,
    instructions: [
      'कक्षा 12 भौतिक व रसायन विज्ञान वस्तुनिष्ठ प्रश्न।',
      'प्रत्येक प्रश्न 1 अंक। समय 15 मिनट।',
    ],
  },

  // 5. UPPCS Pre
  {
    id: 'uppcs-pre-gs1-mock-01',
    examId: 'uppcs-pre',
    title: 'UPPCS Prelims General Studies Paper-1 Full Mock',
    description: 'उत्तर प्रदेश लोक सेवा आयोग प्रारंभिक परीक्षा सामान्य अध्ययन पेपर-1 आधारित मानक मॉक टेस्ट।',
    testType: 'full',
    questionCount: 15,
    durationMinutes: 25,
    difficulty: 'Hard',
    subjects: ['uppcs-pre-general-studies-1', 'uppcs-pre-general-studies-2'],
    randomizeQuestions: true,
    randomizeOptions: false,
    negativeMarking: true,
    negativeMarks: 0.33,
    marksPerQuestion: 1.33,
    instructions: [
      'UPPCS प्रारंभिक परीक्षा मानक के अनुसार 1.33 अंक प्रति प्रश्न।',
      'गलत उत्तर पर 1/3 अंक (0.33) की नकारात्मक कटौती (Negative Marking) लागू होगी।',
      'सावधानीपूर्वक प्रश्न पढ़ें और समीक्षा हेतु मार्क करें।',
    ],
  },

  // 6. UPPCS Mains
  {
    id: 'uppcs-mains-essay-practice',
    examId: 'uppcs-mains',
    title: 'UPPCS Mains Objective Conceptual Assessment',
    description: 'मुख्य परीक्षा परिप्रेक्ष्य हेतु निबंध व सामान्य अध्ययन समझ का वस्तुनिष्ठ मूल्यांकन।',
    testType: 'subject',
    questionCount: 8,
    durationMinutes: 15,
    difficulty: 'Hard',
    subjects: ['uppcs-mains-general-studies-1', 'uppcs-mains-essay'],
    randomizeQuestions: true,
    randomizeOptions: false,
    negativeMarking: false,
    negativeMarks: 0,
    marksPerQuestion: 2,
    instructions: [
      'प्रश्नों की वैचारिक समझ और विश्लेषणात्मक क्षमता का परीक्षण।',
      'समय सीमा 15 मिनट।',
    ],
  },

  // 7. CTET
  {
    id: 'ctet-paper1-pedagogy-mock',
    examId: 'ctet',
    title: 'CTET Paper-1 Pedagogy & Child Development Mock',
    description: 'केंद्रीय शिक्षक पात्रता परीक्षा हेतु बाल विकास एवं पर्यावरण अध्ययन अभ्यास।',
    testType: 'full',
    questionCount: 15,
    durationMinutes: 20,
    difficulty: 'Moderate',
    subjects: ['ctet-child-development', 'ctet-environmental-studies'],
    randomizeQuestions: true,
    randomizeOptions: false,
    negativeMarking: false,
    negativeMarks: 0,
    marksPerQuestion: 1,
    instructions: [
      'CTET प्राथमिक स्तर हेतु 15 प्रश्न। कोई नकारात्मक अंकन नहीं।',
      'समय सीमा 20 मिनट।',
    ],
  },

  // 8. UPTET
  {
    id: 'uptet-foundation-mock',
    examId: 'uptet',
    title: 'UPTET Paper-1 Foundation Mock Test',
    description: 'उत्तर प्रदेश टीईटी बाल विकास, हिंदी व पर्यावरण अध्ययन अभ्यास टेस्ट।',
    testType: 'full',
    questionCount: 15,
    durationMinutes: 20,
    difficulty: 'Moderate',
    subjects: ['uptet-child-development', 'uptet-evs', 'uptet-hindi'],
    randomizeQuestions: true,
    randomizeOptions: false,
    negativeMarking: false,
    negativeMarks: 0,
    marksPerQuestion: 1,
    instructions: [
      'UPTET पाठ्यक्रम अनुसार प्रश्न। कोई नकारात्मक अंकन नहीं।',
      'समय सीमा 20 मिनट।',
    ],
  },
];

// Helper: Normalize exam ID aliases (e.g. cbse-10 -> cbse-class-10)
export function normalizeExamId(id: string): string {
  if (id === 'cbse-10') return 'cbse-class-10';
  if (id === 'cbse-12') return 'cbse-class-12';
  return id;
}

// Get all mock tests
export function getAllMockTests(): MockTestConfig[] {
  return [...mockTestConfigs];
}

// Get mock test by ID
export function getMockTestById(id: string): MockTestConfig | undefined {
  return mockTestConfigs.find((t) => t.id === id);
}

// Get mock tests for specific exam
export function getMockTestsForExam(examId: string): MockTestConfig[] {
  const normalized = normalizeExamId(examId);
  return mockTestConfigs.filter((t) => normalizeExamId(t.examId) === normalized);
}

// Build Unified Question Pool without duplicating datasets
let cachedUnifiedPool: MCQQuestion[] | null = null;

export function getUnifiedQuestionPool(): MCQQuestion[] {
  if (!cachedUnifiedPool) {
    const quizQuestions = getAllQuizQuestions();
    const adaptedPYQs = pyqQuestions.map(pyqToMCQQuestion);
    
    // De-duplicate by ID
    const map = new Map<string, MCQQuestion>();
    for (const q of quizQuestions) {
      map.set(q.id, q);
    }
    for (const q of adaptedPYQs) {
      if (!map.has(q.id)) {
        map.set(q.id, q);
      }
    }
    cachedUnifiedPool = Array.from(map.values());
  }
  return cachedUnifiedPool;
}

// Get questions matching a Mock Test configuration
export function getQuestionsForMockTest(config: MockTestConfig): MCQQuestion[] {
  const pool = getUnifiedQuestionPool();
  const normalizedExamId = normalizeExamId(config.examId);

  // 1. Filter by normalized exam ID
  let matching = pool.filter((q) => normalizeExamId(q.examId) === normalizedExamId);

  // 2. Filter by subjects if specified
  if (config.subjects && config.subjects.length > 0) {
    const subjectFiltered = matching.filter((q) =>
      config.subjects.some((sId) => q.subjectId === sId || q.subjectId.includes(sId))
    );
    // If subject filter matches questions, use them
    if (subjectFiltered.length > 0) {
      matching = subjectFiltered;
    }
  }

  // 3. Fallback: If matching questions are fewer than needed, allow broader pool for the same exam
  if (matching.length === 0) {
    // Check if any question exists for this exam
    matching = pool.filter((q) => normalizeExamId(q.examId) === normalizedExamId);
  }

  // If still empty, return empty array (Requirement 27 handles empty state cleanly)
  if (matching.length === 0) {
    return [];
  }

  // Create a shallow copy to prevent any mutation of source data
  let result = [...matching];

  // Randomize question order if configured (Fisher-Yates)
  if (config.randomizeQuestions) {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
  }

  // Slice to configured questionCount
  if (config.questionCount > 0 && result.length > config.questionCount) {
    result = result.slice(0, config.questionCount);
  }

  return result;
}

// Helper to look up a question by ID from the unified pool
export function getUnifiedQuestionById(id: string): MCQQuestion | undefined {
  const pool = getUnifiedQuestionPool();
  return pool.find((q) => q.id === id);
}
