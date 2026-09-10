import { getExam, getSubject, getTopic } from '@/data/curriculum';
import { pyqQuestions, PYQQuestion } from '@/data/pyq';
import { quizQuestions } from '@/data/quiz/questions';
import { MCQDifficulty, MCQQuestion } from '@/data/quiz/types';
import { getWeakAreas } from '@/lib/user-progress';
import { recordQuestionAttemptToday } from '@/lib/analytics';

export const MISTAKES_STORAGE_KEY = 'examsetu4u_mistakes';

export type RevisionStatus = 'NEEDS_REVISION' | 'IMPROVING' | 'MASTERED';

export const REVISION_STATUS_LABELS: Record<RevisionStatus, { hindi: string; english: string; tone: string }> = {
  NEEDS_REVISION: {
    hindi: 'दोबारा पढ़ें',
    english: 'Needs Revision',
    tone: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900',
  },
  IMPROVING: {
    hindi: 'सुधार हो रहा है',
    english: 'Improving',
    tone: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  },
  MASTERED: {
    hindi: 'मजबूत',
    english: 'Mastered',
    tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
  },
};

export interface MistakeOption {
  id: string;
  label: string;
  text: string;
}

export interface MistakeQuestion {
  id: string;
  questionId: string;
  source: 'quiz' | 'pyq';
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  difficulty: string;
  lastSelectedAnswer: string;
  lastSelectedAnswerText?: string;
  correctAnswer: string;
  correctAnswerText: string;
  wrongAttempts: number;
  successfulRevisions: number;
  lastAttemptedAt: string;
  lastReviewedAt?: string;
  lastRevisionOutcome?: 'correct' | 'incorrect';
  revisionStatus: RevisionStatus;
  questionText: string;
  options: MistakeOption[];
  explanation: string;
  importantPoint?: string;
  additionalFact?: string;
  commonMistake?: string;
  pyqYear?: number;
  pyqExamName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MistakeSummary {
  total: number;
  needsRevision: number;
  improving: number;
  mastered: number;
  todayRevisionCount: number;
  weakTopicsCount: number;
}

export interface MistakeFilterOptions {
  examId?: string;
  subjectId?: string;
  topicId?: string;
  difficulty?: string;
  revisionStatus?: string;
  source?: 'all' | 'quiz' | 'pyq';
  searchQuery?: string;
  sortBy?: 'recent' | 'wrong_attempts' | 'needs_revision' | 'improving' | 'mastered' | 'priority';
}

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch (err) {
    console.warn('LocalStorage error writing mistakes:', err);
  }
}

// Deterministic status evaluator (Requirement 5)
export function calculateRevisionStatus(
  successfulRevisions: number,
  lastRevisionOutcome?: 'correct' | 'incorrect'
): RevisionStatus {
  if (lastRevisionOutcome === 'incorrect' || successfulRevisions === 0) {
    return 'NEEDS_REVISION';
  }
  if (successfulRevisions >= 3) {
    return 'MASTERED';
  }
  return 'IMPROVING';
}

// Load all mistakes safely from LocalStorage
export function loadMistakes(): MistakeQuestion[] {
  const raw = safeGet(MISTAKES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list;
  } catch (err) {
    console.warn('Failed to parse mistakes from LocalStorage, recovering gracefully:', err);
    return [];
  }
}

// Save all mistakes to LocalStorage
export function saveMistakes(mistakes: MistakeQuestion[]): void {
  safeSet(MISTAKES_STORAGE_KEY, JSON.stringify(mistakes));
  // Dispatch a custom window event so reactive components can update immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('examsetu4u_mistakes_updated'));
  }
}

// Parameters to record a wrong answer
export interface RecordMistakeParams {
  questionId: string;
  source: 'quiz' | 'pyq';
  examId: string;
  subjectId: string;
  topicId: string;
  difficulty?: string;
  selectedAnswer: string;
  selectedAnswerText?: string;
  correctAnswer: string;
  correctAnswerText?: string;
  questionText: string;
  options: MistakeOption[];
  explanation: string;
  importantPoint?: string;
  additionalFact?: string;
  commonMistake?: string;
  pyqYear?: number;
  pyqExamName?: string;
}

// Add or update wrong answer in Mistake Book (Requirement 2)
export function recordMistake(params: RecordMistakeParams): MistakeQuestion {
  const mistakes = loadMistakes();
  const existingIndex = mistakes.findIndex((m) => m.questionId === params.questionId);
  const now = new Date().toISOString();

  const exam = getExam(params.examId);
  const subject = getSubject(params.subjectId);
  const topic = getTopic(params.topicId);

  const examName = exam?.name || params.examId;
  const subjectName = subject?.name || params.subjectId;
  const topicName = topic?.name || params.topicId;

  let result: MistakeQuestion;

  if (existingIndex >= 0) {
    // Update existing record: do NOT create duplicate!
    const existing = mistakes[existingIndex];
    result = {
      ...existing,
      examId: params.examId || existing.examId,
      examName: examName || existing.examName,
      subjectId: params.subjectId || existing.subjectId,
      subjectName: subjectName || existing.subjectName,
      topicId: params.topicId || existing.topicId,
      topicName: topicName || existing.topicName,
      difficulty: params.difficulty || existing.difficulty,
      lastSelectedAnswer: params.selectedAnswer,
      lastSelectedAnswerText: params.selectedAnswerText || existing.lastSelectedAnswerText,
      correctAnswer: params.correctAnswer || existing.correctAnswer,
      correctAnswerText: params.correctAnswerText || existing.correctAnswerText,
      wrongAttempts: existing.wrongAttempts + 1,
      lastAttemptedAt: now,
      lastRevisionOutcome: 'incorrect',
      revisionStatus: 'NEEDS_REVISION',
      questionText: params.questionText || existing.questionText,
      options: params.options && params.options.length ? params.options : existing.options,
      explanation: params.explanation || existing.explanation,
      importantPoint: params.importantPoint || existing.importantPoint,
      additionalFact: params.additionalFact || existing.additionalFact,
      commonMistake: params.commonMistake || existing.commonMistake,
      pyqYear: params.pyqYear ?? existing.pyqYear,
      pyqExamName: params.pyqExamName || existing.pyqExamName,
      updatedAt: now,
    };
    mistakes[existingIndex] = result;
  } else {
    // Create new record
    result = {
      id: `mistake_${params.questionId}`,
      questionId: params.questionId,
      source: params.source,
      examId: params.examId,
      examName,
      subjectId: params.subjectId,
      subjectName,
      topicId: params.topicId,
      topicName,
      difficulty: params.difficulty || 'Moderate',
      lastSelectedAnswer: params.selectedAnswer,
      lastSelectedAnswerText: params.selectedAnswerText,
      correctAnswer: params.correctAnswer,
      correctAnswerText: params.correctAnswerText || '',
      wrongAttempts: 1,
      successfulRevisions: 0,
      lastAttemptedAt: now,
      revisionStatus: 'NEEDS_REVISION',
      lastRevisionOutcome: 'incorrect',
      questionText: params.questionText,
      options: params.options,
      explanation: params.explanation,
      importantPoint: params.importantPoint,
      additionalFact: params.additionalFact,
      commonMistake: params.commonMistake,
      pyqYear: params.pyqYear,
      pyqExamName: params.pyqExamName,
      createdAt: now,
      updatedAt: now,
    };
    mistakes.unshift(result);
  }

  saveMistakes(mistakes);
  return result;
}

// Record an answer during Mistake Practice revision (Requirement 4 & 8)
export function recordRevisionAttempt(
  questionId: string,
  isCorrect: boolean,
  selectedAnswer?: string,
  selectedAnswerText?: string
): MistakeQuestion | null {
  const mistakes = loadMistakes();
  const index = mistakes.findIndex((m) => m.questionId === questionId || m.id === questionId);
  if (index === -1) return null;

  const target = mistakes[index];
  const now = new Date().toISOString();

  if (isCorrect) {
    // Increase successful revision count, update last reviewed date, keep in Mistake Book!
    const newSuccessCount = target.successfulRevisions + 1;
    const newStatus = calculateRevisionStatus(newSuccessCount, 'correct');
    const updated: MistakeQuestion = {
      ...target,
      successfulRevisions: newSuccessCount,
      lastReviewedAt: now,
      lastRevisionOutcome: 'correct',
      revisionStatus: newStatus,
      updatedAt: now,
    };
    mistakes[index] = updated;
    saveMistakes(mistakes);

    // Also integrate with Module 7 Daily Goals
    recordQuestionAttemptToday(true, 'quiz');
    return updated;
  } else {
    // Increase wrongAttempts, set status to NEEDS_REVISION, keep in Mistake Book
    const updated: MistakeQuestion = {
      ...target,
      wrongAttempts: target.wrongAttempts + 1,
      lastAttemptedAt: now,
      lastReviewedAt: now,
      lastRevisionOutcome: 'incorrect',
      revisionStatus: 'NEEDS_REVISION',
      lastSelectedAnswer: selectedAnswer || target.lastSelectedAnswer,
      lastSelectedAnswerText: selectedAnswerText || target.lastSelectedAnswerText,
      updatedAt: now,
    };
    mistakes[index] = updated;
    saveMistakes(mistakes);

    // Also integrate with Module 7 Daily Goals
    recordQuestionAttemptToday(false, 'quiz');
    return updated;
  }
}

// Remove mistake manually with confirmation (Requirement 12)
export function removeMistake(idOrQuestionId: string): boolean {
  const mistakes = loadMistakes();
  const filtered = mistakes.filter((m) => m.id !== idOrQuestionId && m.questionId !== idOrQuestionId);
  if (filtered.length !== mistakes.length) {
    saveMistakes(filtered);
    return true;
  }
  return false;
}

// Mark mistake for review (status resets to NEEDS_REVISION)
export function markMistakeForReview(idOrQuestionId: string): boolean {
  const mistakes = loadMistakes();
  const index = mistakes.findIndex((m) => m.id === idOrQuestionId || m.questionId === idOrQuestionId);
  if (index === -1) return false;

  mistakes[index] = {
    ...mistakes[index],
    revisionStatus: 'NEEDS_REVISION',
    lastRevisionOutcome: 'incorrect',
    updatedAt: new Date().toISOString(),
  };
  saveMistakes(mistakes);
  return true;
}

// Summary of mistakes for Dashboard (Requirement 7)
export function getMistakeSummary(): MistakeSummary {
  const mistakes = loadMistakes();
  let needsRevision = 0;
  let improving = 0;
  let mastered = 0;
  let todayRevisionCount = 0;

  const todayDatePrefix = new Date().toISOString().slice(0, 10);

  mistakes.forEach((m) => {
    if (m.revisionStatus === 'NEEDS_REVISION') needsRevision++;
    else if (m.revisionStatus === 'IMPROVING') improving++;
    else if (m.revisionStatus === 'MASTERED') mastered++;

    if (m.lastReviewedAt && m.lastReviewedAt.startsWith(todayDatePrefix)) {
      todayRevisionCount++;
    }
  });

  const weakAreas = getWeakAreas();

  return {
    total: mistakes.length,
    needsRevision,
    improving,
    mastered,
    todayRevisionCount,
    weakTopicsCount: weakAreas.length,
  };
}

// Priority & Filtering Engine (Requirement 9 & 10)
export function filterAndSortMistakes(options: MistakeFilterOptions = {}): MistakeQuestion[] {
  const {
    examId,
    subjectId,
    topicId,
    difficulty,
    revisionStatus,
    source = 'all',
    searchQuery = '',
    sortBy = 'priority',
  } = options;

  let list = loadMistakes();

  // Filters
  if (examId && examId !== 'all') {
    list = list.filter((m) => m.examId === examId);
  }
  if (subjectId && subjectId !== 'all') {
    list = list.filter((m) => m.subjectId === subjectId);
  }
  if (topicId && topicId !== 'all') {
    list = list.filter((m) => m.topicId === topicId);
  }
  if (difficulty && difficulty !== 'all') {
    list = list.filter((m) => m.difficulty.toLowerCase() === difficulty.toLowerCase());
  }
  if (revisionStatus && revisionStatus !== 'all') {
    list = list.filter((m) => m.revisionStatus === revisionStatus);
  }
  if (source && source !== 'all') {
    list = list.filter((m) => m.source === source);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    list = list.filter(
      (m) =>
        m.questionText.toLowerCase().includes(q) ||
        m.subjectName.toLowerCase().includes(q) ||
        m.topicName.toLowerCase().includes(q) ||
        m.explanation.toLowerCase().includes(q)
    );
  }

  // Sorting
  const weakAreas = getWeakAreas();
  const weakTopicIds = new Set(weakAreas.map((w) => w.topicId));

  return list.sort((a, b) => {
    if (sortBy === 'wrong_attempts') {
      return b.wrongAttempts - a.wrongAttempts;
    }
    if (sortBy === 'needs_revision') {
      const rank = (status: RevisionStatus) =>
        status === 'NEEDS_REVISION' ? 1 : status === 'IMPROVING' ? 2 : 3;
      return rank(a.revisionStatus) - rank(b.revisionStatus);
    }
    if (sortBy === 'improving') {
      const rank = (status: RevisionStatus) =>
        status === 'IMPROVING' ? 1 : status === 'NEEDS_REVISION' ? 2 : 3;
      return rank(a.revisionStatus) - rank(b.revisionStatus);
    }
    if (sortBy === 'mastered') {
      const rank = (status: RevisionStatus) =>
        status === 'MASTERED' ? 1 : status === 'IMPROVING' ? 2 : 3;
      return rank(a.revisionStatus) - rank(b.revisionStatus);
    }
    if (sortBy === 'recent') {
      return new Date(b.lastAttemptedAt).getTime() - new Date(a.lastAttemptedAt).getTime();
    }

    // Default: Revision Priority (Requirement 9: Deterministic order)
    // 1. Recently answered incorrectly
    // 2. Repeatedly incorrect questions (wrongAttempts)
    // 3. Weak-topic questions
    // 4. Older unanswered mistakes
    // 5. Improving questions needing another revision
    const isWeakA = weakTopicIds.has(a.topicId) ? 1 : 0;
    const isWeakB = weakTopicIds.has(b.topicId) ? 1 : 0;

    const rankA =
      a.revisionStatus === 'NEEDS_REVISION'
        ? 100 + a.wrongAttempts * 10 + isWeakA * 5
        : a.revisionStatus === 'IMPROVING'
        ? 50 + a.wrongAttempts * 5 + isWeakA * 5
        : 10;

    const rankB =
      b.revisionStatus === 'NEEDS_REVISION'
        ? 100 + b.wrongAttempts * 10 + isWeakB * 5
        : b.revisionStatus === 'IMPROVING'
        ? 50 + b.wrongAttempts * 5 + isWeakB * 5
        : 10;

    if (rankB !== rankA) return rankB - rankA;

    // Tie-break: most recent attempt
    return new Date(b.lastAttemptedAt).getTime() - new Date(a.lastAttemptedAt).getTime();
  });
}

// Convert MistakeQuestions to MCQQuestions for seamless execution in existing Quiz Engine (Requirement 3 & 14)
export function convertMistakesToMCQs(mistakes: MistakeQuestion[]): MCQQuestion[] {
  return mistakes.map((m) => {
    const optsObj: Record<'A' | 'B' | 'C' | 'D', string> = {
      A: '',
      B: '',
      C: '',
      D: '',
    };

    m.options.forEach((opt, idx) => {
      const key = (['A', 'B', 'C', 'D'][idx] || 'A') as 'A' | 'B' | 'C' | 'D';
      optsObj[key] = opt.text;
    });

    let correctKey: 'A' | 'B' | 'C' | 'D' = 'A';
    if (['A', 'B', 'C', 'D'].includes(m.correctAnswer.toUpperCase())) {
      correctKey = m.correctAnswer.toUpperCase() as 'A' | 'B' | 'C' | 'D';
    } else {
      // Find matching option index
      const matchIdx = m.options.findIndex(
        (opt) =>
          opt.id.toLowerCase() === m.correctAnswer.toLowerCase() ||
          opt.label.toLowerCase() === m.correctAnswer.toLowerCase() ||
          opt.text.toLowerCase() === m.correctAnswerText.toLowerCase()
      );
      if (matchIdx >= 0) {
        correctKey = (['A', 'B', 'C', 'D'][matchIdx] || 'A') as 'A' | 'B' | 'C' | 'D';
      }
    }

    return {
      id: m.questionId,
      examId: m.examId,
      subjectId: m.subjectId,
      topicId: m.topicId,
      question: m.questionText,
      options: optsObj,
      correctAnswer: correctKey,
      explanation: m.explanation,
      importantPoint: m.importantPoint || '',
      additionalFact: m.additionalFact || '',
      commonMistake: m.commonMistake || '',
      difficulty: (['Easy', 'Moderate', 'Hard', 'Very Hard'].includes(m.difficulty)
        ? m.difficulty
        : 'Moderate') as MCQDifficulty,
      sourceType: m.source === 'pyq' ? 'PYQ' : 'Practice',
      year: m.pyqYear,
      examName: m.pyqExamName || m.examName,
    };
  });
}

// Helpers for automatic recording from Quiz & PYQ:

// Helper 1: Record from MCQ question in Quiz
export function recordQuizMistake(question: MCQQuestion, selectedAnswerKey: string): MistakeQuestion {
  const optionsList: MistakeOption[] = [
    { id: 'A', label: 'A', text: question.options.A },
    { id: 'B', label: 'B', text: question.options.B },
    { id: 'C', label: 'C', text: question.options.C },
    { id: 'D', label: 'D', text: question.options.D },
  ];

  const selectedText =
    question.options[selectedAnswerKey as 'A' | 'B' | 'C' | 'D'] || selectedAnswerKey;
  const correctText = question.options[question.correctAnswer];

  return recordMistake({
    questionId: question.id,
    source: question.sourceType === 'PYQ' ? 'pyq' : 'quiz',
    examId: question.examId,
    subjectId: question.subjectId,
    topicId: question.topicId,
    difficulty: question.difficulty,
    selectedAnswer: selectedAnswerKey,
    selectedAnswerText: selectedText,
    correctAnswer: question.correctAnswer,
    correctAnswerText: correctText,
    questionText: question.question,
    options: optionsList,
    explanation: question.explanation,
    importantPoint: question.importantPoint,
    additionalFact: question.additionalFact,
    commonMistake: question.commonMistake,
    pyqYear: question.year,
    pyqExamName: question.examName,
  });
}

// Helper 2: Record from PYQ question
export function recordPYQMistake(question: PYQQuestion, selectedOptionId: string): MistakeQuestion {
  const optionsList: MistakeOption[] = question.options.map((o) => ({
    id: o.id,
    label: o.label,
    text: o.text,
  }));

  const selectedOpt = question.options.find((o) => o.id === selectedOptionId);
  const correctOpt = question.options.find((o) => o.id === question.correctOptionId);

  return recordMistake({
    questionId: question.id,
    source: 'pyq',
    examId: question.metadata.examId,
    subjectId: question.metadata.subjectId,
    topicId: question.metadata.topicId,
    difficulty: question.metadata.difficulty,
    selectedAnswer: selectedOpt?.label || selectedOptionId,
    selectedAnswerText: selectedOpt?.text || '',
    correctAnswer: correctOpt?.label || question.correctOptionId,
    correctAnswerText: correctOpt?.text || '',
    questionText: question.prompt,
    options: optionsList,
    explanation: question.explanation.answerReason,
    importantPoint: question.explanation.importantPoint,
    additionalFact: question.explanation.additionalFact,
    commonMistake: question.explanation.commonMistake,
    pyqYear: question.metadata.year,
    pyqExamName: question.metadata.sourceLabel,
  });
}
