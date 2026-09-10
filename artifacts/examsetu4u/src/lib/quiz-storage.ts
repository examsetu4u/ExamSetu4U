import type { QuizAttemptResult, QuizSessionState } from '@/data/quiz/types';

const STORAGE_KEYS = {
  SESSION: 'examsetu4u_quiz_active_session',
  HISTORY: 'examsetu4u_quiz_history',
  LAST_RESULT: 'examsetu4u_quiz_last_result',
  INCORRECT_IDS: 'examsetu4u_quiz_incorrect_ids',
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeGetItem(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`[QuizStorage] Failed to read from localStorage key "${key}":`, error);
    return null;
  }
}

function safeSetItem(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`[QuizStorage] Failed to write to localStorage key "${key}":`, error);
  }
}

function safeRemoveItem(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[QuizStorage] Failed to remove localStorage key "${key}":`, error);
  }
}

// Active Quiz Session Storage
export function loadQuizSession(): QuizSessionState | null {
  const raw = safeGetItem(STORAGE_KEYS.SESSION);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (
      data &&
      typeof data === 'object' &&
      Array.isArray((data as QuizSessionState).questionIds) &&
      typeof (data as QuizSessionState).currentIndex === 'number'
    ) {
      const state = data as QuizSessionState;
      return {
        questionIds: state.questionIds,
        currentIndex: Math.max(0, Math.min(state.currentIndex, state.questionIds.length - 1)),
        selectedAnswers: state.selectedAnswers && typeof state.selectedAnswers === 'object' ? state.selectedAnswers : {},
        submittedAnswers: state.submittedAnswers && typeof state.submittedAnswers === 'object' ? state.submittedAnswers : {},
        markedForReview: state.markedForReview && typeof state.markedForReview === 'object' ? state.markedForReview : {},
        isFinished: Boolean(state.isFinished),
        startedAt: state.startedAt || new Date().toISOString(),
        examId: state.examId || '',
        subjectId: state.subjectId || '',
        topicId: state.topicId || '',
        difficulty: state.difficulty || 'All',
        random: Boolean(state.random),
        title: state.title || 'ExamSetu4U Quiz',
      };
    }
    // Corrupt format, clear it
    safeRemoveItem(STORAGE_KEYS.SESSION);
    return null;
  } catch {
    // JSON parse error, recover by clearing corrupt session
    safeRemoveItem(STORAGE_KEYS.SESSION);
    return null;
  }
}

export function saveQuizSession(session: QuizSessionState | null): void {
  if (!session) {
    safeRemoveItem(STORAGE_KEYS.SESSION);
  } else {
    safeSetItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  }
}

export function clearQuizSession(): void {
  safeRemoveItem(STORAGE_KEYS.SESSION);
}

// Quiz History Storage
export function loadQuizHistory(): QuizAttemptResult[] {
  const raw = safeGetItem(STORAGE_KEYS.HISTORY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (Array.isArray(data)) {
      return data.filter(
        (item): item is QuizAttemptResult =>
          Boolean(item && typeof item === 'object' && 'attemptId' && typeof item.score === 'number'),
      );
    }
    safeRemoveItem(STORAGE_KEYS.HISTORY);
    return [];
  } catch {
    safeRemoveItem(STORAGE_KEYS.HISTORY);
    return [];
  }
}

export function saveQuizAttempt(result: QuizAttemptResult): void {
  const history = loadQuizHistory();
  // Store newest first, limit to 50 attempts to avoid quota exhaustion
  const updatedHistory = [result, ...history.filter((h) => h.attemptId !== result.attemptId)].slice(0, 50);
  safeSetItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory));
  safeSetItem(STORAGE_KEYS.LAST_RESULT, JSON.stringify(result));

  // Also update incorrect question IDs pool
  if (result.incorrectQuestionIds && result.incorrectQuestionIds.length > 0) {
    saveIncorrectQuestionIds(result.incorrectQuestionIds);
  }
}

export function loadLastQuizResult(): QuizAttemptResult | null {
  const raw = safeGetItem(STORAGE_KEYS.LAST_RESULT);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (data && typeof data === 'object' && 'attemptId' in data) {
      return data as QuizAttemptResult;
    }
    safeRemoveItem(STORAGE_KEYS.LAST_RESULT);
    return null;
  } catch {
    safeRemoveItem(STORAGE_KEYS.LAST_RESULT);
    return null;
  }
}

// Incorrect Questions Storage (for "गलत प्रश्नों का अभ्यास करें")
export function loadIncorrectQuestionIds(): string[] {
  const raw = safeGetItem(STORAGE_KEYS.INCORRECT_IDS);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (Array.isArray(data)) {
      return data.filter((id): id is string => typeof id === 'string');
    }
    safeRemoveItem(STORAGE_KEYS.INCORRECT_IDS);
    return [];
  } catch {
    safeRemoveItem(STORAGE_KEYS.INCORRECT_IDS);
    return [];
  }
}

export function saveIncorrectQuestionIds(newIncorrectIds: string[]): void {
  const existing = loadIncorrectQuestionIds();
  const set = new Set([...newIncorrectIds, ...existing]);
  safeSetItem(STORAGE_KEYS.INCORRECT_IDS, JSON.stringify(Array.from(set)));
}

export function clearIncorrectQuestionIds(): void {
  safeRemoveItem(STORAGE_KEYS.INCORRECT_IDS);
}
