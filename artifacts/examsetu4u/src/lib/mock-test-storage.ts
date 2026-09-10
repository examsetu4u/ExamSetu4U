import type { MockActiveAttempt, MockResult, MockTestSummary } from '@/data/mock/types';
import { logActivity } from '@/lib/user-progress';

export const MOCK_ATTEMPTS_KEY = 'examsetu4u_mock_attempts';
export const ACTIVE_MOCK_ATTEMPT_KEY = 'examsetu4u_mock_active_attempt';

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
  } catch {}
}

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

// 1. Load All Completed Mock Attempts
export function loadMockAttempts(): MockResult[] {
  const raw = safeGet(MOCK_ATTEMPTS_KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// 2. Save a Completed Mock Attempt
export function saveMockAttempt(result: MockResult): void {
  const list = loadMockAttempts();
  // Prepend latest attempt
  list.unshift(result);
  // Cap at 100 recent attempts to keep localStorage lightweight
  const trimmed = list.slice(0, 100);
  safeSet(MOCK_ATTEMPTS_KEY, JSON.stringify(trimmed));

  // Also clear any active attempt since test has completed
  clearActiveMockAttempt();

  // Seamlessly integrate with user daily activity tracking
  recordMockAttemptProgress(result);
}

// 3. Get Mock Attempt by ID
export function getMockAttemptById(attemptId: string): MockResult | undefined {
  const list = loadMockAttempts();
  return list.find((a) => a.attemptId === attemptId);
}

// 4. Get Attempts for a specific test ID
export function getMockAttemptsForTest(testId: string): MockResult[] {
  const list = loadMockAttempts();
  return list.filter((a) => a.testId === testId);
}

// 5. Calculate Best Score and summary statistics for a Mock Test
export function getMockTestSummary(testId: string): MockTestSummary {
  const attempts = getMockAttemptsForTest(testId);
  const active = loadActiveMockAttempt();
  const hasActiveAttempt = Boolean(active && active.testId === testId && !active.isFinished);

  if (attempts.length === 0) {
    return {
      attemptCount: 0,
      bestScore: 0,
      bestPercentage: 0,
      bestAccuracy: 0,
      hasActiveAttempt,
    };
  }

  let bestScore = -Infinity;
  let bestPercentage = 0;
  let bestAccuracy = 0;

  attempts.forEach((a) => {
    if (a.finalScore > bestScore) {
      bestScore = a.finalScore;
    }
    if (a.percentage > bestPercentage) {
      bestPercentage = a.percentage;
    }
    if (a.accuracy > bestAccuracy) {
      bestAccuracy = a.accuracy;
    }
  });

  return {
    attemptCount: attempts.length,
    bestScore: Math.max(0, Math.round(bestScore * 10) / 10),
    bestPercentage,
    bestAccuracy,
    lastAttemptDate: attempts[0].date,
    lastAttemptId: attempts[0].attemptId,
    hasActiveAttempt,
  };
}

// 6. Active In-Progress Attempt Management (Resumable, lightweight)
export function loadActiveMockAttempt(): MockActiveAttempt | null {
  const raw = safeGet(ACTIVE_MOCK_ATTEMPT_KEY);
  if (!raw) return null;
  try {
    const attempt: MockActiveAttempt = JSON.parse(raw);
    if (!attempt || !attempt.attemptId || !attempt.questionIds || attempt.questionIds.length === 0) {
      return null;
    }
    return attempt;
  } catch {
    // If corrupted, clean up safely without crashing
    safeRemove(ACTIVE_MOCK_ATTEMPT_KEY);
    return null;
  }
}

export function saveActiveMockAttempt(attempt: MockActiveAttempt): void {
  safeSet(ACTIVE_MOCK_ATTEMPT_KEY, JSON.stringify(attempt));
}

export function clearActiveMockAttempt(): void {
  safeRemove(ACTIVE_MOCK_ATTEMPT_KEY);
}

// 7. Record Progress & Daily Activity Integration (Module 6 & 7 compatible)
export function recordMockAttemptProgress(result: MockResult): void {
  try {
    // Update daily activity counts
    const today = new Date().toISOString().slice(0, 10);
    const rawDaily = safeGet('examsetu4u_daily_activity') ?? '{}';
    const dailyMap = JSON.parse(rawDaily);
    const todayEntry = dailyMap[today] || {
      questionsAttempted: 0,
      questionsCorrect: 0,
      quizzesCompleted: 0,
      pyqsAttempted: 0,
    };

    todayEntry.questionsAttempted += result.attempted;
    todayEntry.questionsCorrect += result.correct;
    todayEntry.quizzesCompleted += 1;
    dailyMap[today] = todayEntry;
    safeSet('examsetu4u_daily_activity', JSON.stringify(dailyMap));

    // Log to user activity feed
    logActivity({
      type: 'quiz',
      title: `Mock Test संपन्न: ${result.testTitle}`,
      subtitle: `${result.examName} • स्कोर: ${result.finalScore}/${result.maxMarks} (${result.percentage}%)`,
      url: `/mock-tests/result/${result.attemptId}`,
      scoreText: `${result.finalScore}/${result.maxMarks} (${result.accuracy}% सटीकता)`,
      badgeTone: result.percentage >= 70 ? 'success' : result.percentage >= 40 ? 'warning' : 'primary',
    });
  } catch (err) {
    console.warn('Failed to record mock attempt progress:', err);
  }
}
