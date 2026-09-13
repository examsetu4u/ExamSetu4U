import { exams, getExam, getSubject, getSubjectsForExam, getTopic, getTopicsForSubject, Topic } from '@/data/curriculum';
import { pyqQuestions } from '@/data/pyq';
import { loadQuizHistory } from '@/lib/quiz-storage';
import { loadMistakes, filterAndSortMistakes } from '@/lib/mistakes';
import { loadMockAttempts } from '@/lib/mock-test-storage';
import { mockTestConfigs } from '@/data/mock/tests';
import {
  getDailyActivityMap,
  getDailyQuestionGoal,
  getTodayKey,
  setDailyQuestionGoal,
  DAILY_GOAL_OPTIONS,
  DAILY_ACTIVITY_KEY,
} from '@/lib/analytics';
import {
  calculateOverallProgress,
  getContinueLearning,
  getLegacyPYQProgressMap,
  getLegacyTopicProgressMap,
  getWeakAreas,
  loadExtendedProgress,
  saveExtendedProgress,
} from '@/lib/user-progress';

// --------------------------------------------------------
// Storage Keys (Namespaced as per Module 13 specification)
// --------------------------------------------------------
export const PLANNER_SETTINGS_KEY = 'examsetu4u_planner_settings';
export const DAILY_PROGRESS_KEY = 'examsetu4u_daily_progress';
export const STUDY_HISTORY_KEY = 'examsetu4u_study_history';

// --------------------------------------------------------
// Types
// --------------------------------------------------------
export type DailyTaskType =
  | 'STUDY_MATERIAL'
  | 'PYQ'
  | 'QUIZ'
  | 'REVISION'
  | 'WEAK_TOPIC'
  | 'MOCK_TEST';

export type StudySequencePreference =
  | 'study_first'
  | 'pyq_first'
  | 'quiz_first'
  | 'revision_first';

export interface DailyTask {
  id: string;
  type: DailyTaskType;
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  title: string;
  description: string;
  priority: number; // 1 to 7
  estimatedQuestions?: number;
  completed: boolean;
  actionUrl: string;
  actionLabel: string;
  badgeText: string;
  badgeTone: 'primary' | 'success' | 'warning' | 'info' | 'purple' | 'amber';
}

export interface PlannerSettings {
  dailyGoal: number; // 10, 20, 30, 50, 100
  preferredExamId: string;
  studySequence: StudySequencePreference;
}

export interface TodayProgressSummary {
  date: string; // YYYY-MM-DD
  questionsTarget: number;
  questionsAttempted: number;
  questionsCorrect: number;
  remainingQuestions: number;
  completionPercentage: number;
  isCompleted: boolean;
  studyMaterialsCount: number;
  pyqsAttempted: number;
  quizzesCompleted: number;
  revisionsDone: number;
}

export interface StreakInfo {
  currentStreak: number;
  bestStreak: number;
  studyDays: number;
  nextMilestone: number;
  daysToNextMilestone: number;
  completedMilestones: number[];
}

export interface StudyHistoryEntry {
  date: string; // YYYY-MM-DD
  formattedDate: string;
  questionsAttempted: number;
  questionsCorrect: number;
  studyMaterialsCount: number;
  pyqsAttempted: number;
  quizzesCompleted: number;
  revisionsDone: number;
  goalTarget: number;
  isGoalCompleted: boolean;
  completionPercentage: number;
}

// --------------------------------------------------------
// Safe Storage Helpers
// --------------------------------------------------------
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

// --------------------------------------------------------
// 1. Date Handling
// --------------------------------------------------------
export function getTodayDate(): string {
  return getTodayKey(); // YYYY-MM-DD from analytics
}

export function formatReadableDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      weekday: 'short',
    });
  } catch {
    return dateStr;
  }
}

// --------------------------------------------------------
// 2. Planner Settings
// --------------------------------------------------------
export function getPlannerSettings(): PlannerSettings {
  const raw = safeGet(PLANNER_SETTINGS_KEY);
  const fallbackGoal = getDailyQuestionGoal();
  let defaultExam = 'super-tet';

  try {
    const authProfileRaw = safeGet('examsetu4u_profile');
    if (authProfileRaw) {
      const p = JSON.parse(authProfileRaw);
      if (p.preferredExamId) defaultExam = p.preferredExamId;
    }
  } catch {}

  if (!raw) {
    return {
      dailyGoal: fallbackGoal,
      preferredExamId: defaultExam,
      studySequence: 'study_first',
    };
  }

  try {
    const parsed = JSON.parse(raw);
    const validGoal = DAILY_GOAL_OPTIONS.includes(parsed.dailyGoal)
      ? parsed.dailyGoal
      : fallbackGoal;
    return {
      dailyGoal: validGoal,
      preferredExamId: parsed.preferredExamId || defaultExam,
      studySequence: parsed.studySequence || 'study_first',
    };
  } catch {
    return {
      dailyGoal: fallbackGoal,
      preferredExamId: defaultExam,
      studySequence: 'study_first',
    };
  }
}

export function savePlannerSettings(settings: Partial<PlannerSettings>): PlannerSettings {
  const current = getPlannerSettings();
  const updated: PlannerSettings = {
    ...current,
    ...settings,
  };
  safeSet(PLANNER_SETTINGS_KEY, JSON.stringify(updated));

  // Keep Module 7 daily question goal in lock-step
  if (settings.dailyGoal && settings.dailyGoal !== current.dailyGoal) {
    setDailyQuestionGoal(settings.dailyGoal);
  }

  return updated;
}

// --------------------------------------------------------
// 3. Daily Goal Status & Progress
// --------------------------------------------------------
export function getDailyGoal(): number {
  return getPlannerSettings().dailyGoal;
}

export function isDailyGoalComplete(): boolean {
  const progress = getTodayProgress();
  return progress.isCompleted;
}

export function getTodayProgress(): TodayProgressSummary {
  const today = getTodayDate();
  const goalTarget = getDailyGoal();
  const dailyMap = getDailyActivityMap();
  const todayActivity = dailyMap[today] || {
    questionsAttempted: 0,
    questionsCorrect: 0,
    quizzesCompleted: 0,
    pyqsAttempted: 0,
  };

  // Cross-reference with today's quizzes from quiz history
  const quizHistory = loadQuizHistory();
  const todayQuizzes = quizHistory.filter((q) => q.date && q.date.startsWith(today));
  const quizQuestionsAttempted = todayQuizzes.reduce((acc, q) => acc + (q.attempted || 0), 0);
  const quizQuestionsCorrect = todayQuizzes.reduce((acc, q) => acc + (q.correct || 0), 0);
  const totalQuizzesCompleted = Math.max(todayActivity.quizzesCompleted, todayQuizzes.length);

  // Cross-reference with today's mock tests
  const mockAttempts = loadMockAttempts();
  const todayMocks = mockAttempts.filter((m) => {
    const d = m.completedAt || m.date;
    return d && d.startsWith(today);
  });
  const mockQuestionsAttempted = todayMocks.reduce((acc, m) => acc + (m.attempted || 0), 0);
  const mockQuestionsCorrect = todayMocks.reduce((acc, m) => acc + (m.correct || 0), 0);

  // Total questions attempted today
  const combinedQuestionsAttempted = Math.max(
    todayActivity.questionsAttempted,
    quizQuestionsAttempted + mockQuestionsAttempted + todayActivity.pyqsAttempted
  );
  const combinedQuestionsCorrect = Math.max(
    todayActivity.questionsCorrect,
    quizQuestionsCorrect + mockQuestionsCorrect
  );

  // Study material count: check extended progress activities for today
  const extended = loadExtendedProgress();
  const todayActivities = extended.activities.filter(
    (a) => a.timestamp && a.timestamp.startsWith(today)
  );
  const studyMaterialsCount = todayActivities.filter((a) => a.type === 'study').length;

  // Revisions count: check mistakes reviewed today
  const mistakes = loadMistakes();
  const revisionsDone = mistakes.filter(
    (m) => m.lastReviewedAt && m.lastReviewedAt.startsWith(today)
  ).length;

  const completionPercentage = Math.min(
    100,
    Math.round((combinedQuestionsAttempted / goalTarget) * 100)
  );
  const isCompleted = combinedQuestionsAttempted >= goalTarget;
  const remainingQuestions = Math.max(0, goalTarget - combinedQuestionsAttempted);

  const summary: TodayProgressSummary = {
    date: today,
    questionsTarget: goalTarget,
    questionsAttempted: combinedQuestionsAttempted,
    questionsCorrect: combinedQuestionsCorrect,
    remainingQuestions,
    completionPercentage,
    isCompleted,
    studyMaterialsCount,
    pyqsAttempted: todayActivity.pyqsAttempted,
    quizzesCompleted: totalQuizzesCompleted,
    revisionsDone,
  };

  // Keep examsetu4u_daily_progress in sync
  safeSet(DAILY_PROGRESS_KEY, JSON.stringify(summary));

  return summary;
}

// --------------------------------------------------------
// 4. Streak System & Milestones
// --------------------------------------------------------
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

export function getStudyStreak(): StreakInfo {
  const dailyMap = getDailyActivityMap();
  const quizHistory = loadQuizHistory();
  const mockAttempts = loadMockAttempts();
  const mistakes = loadMistakes();
  const extended = loadExtendedProgress();

  // Gather all unique days with meaningful learning activity
  const activeDateSet = new Set<string>();

  // From daily activity
  Object.entries(dailyMap).forEach(([dateStr, act]) => {
    if (act.questionsAttempted > 0 || act.quizzesCompleted > 0 || act.pyqsAttempted > 0) {
      activeDateSet.add(dateStr);
    }
  });

  // From quizzes
  quizHistory.forEach((q) => {
    if (q.date) {
      activeDateSet.add(q.date.slice(0, 10));
    }
  });

  // From mock tests
  mockAttempts.forEach((m) => {
    const d = m.completedAt || m.date;
    if (d) {
      activeDateSet.add(d.slice(0, 10));
    }
  });

  // From mistakes
  mistakes.forEach((m) => {
    if (m.lastAttemptedAt) activeDateSet.add(m.lastAttemptedAt.slice(0, 10));
    if (m.lastReviewedAt) activeDateSet.add(m.lastReviewedAt.slice(0, 10));
  });

  // From logged activities
  extended.activities.forEach((a) => {
    if (a.timestamp) activeDateSet.add(a.timestamp.slice(0, 10));
  });

  const sortedDates = Array.from(activeDateSet).sort();
  const studyDays = sortedDates.length;

  // Compute consecutive day streak ending at today or yesterday
  const today = getTodayDate();
  const todayDateObj = new Date();
  const yesterdayObj = new Date(todayDateObj);
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterday = yesterdayObj.toISOString().slice(0, 10);

  let currentStreak = 0;
  if (activeDateSet.has(today)) {
    // Count backward from today
    let checkDate = new Date(todayDateObj);
    while (true) {
      const key = checkDate.toISOString().slice(0, 10);
      if (activeDateSet.has(key)) {
        currentStreak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  } else if (activeDateSet.has(yesterday)) {
    // Count backward from yesterday (today's study hasn't been logged yet)
    let checkDate = new Date(yesterdayObj);
    while (true) {
      const key = checkDate.toISOString().slice(0, 10);
      if (activeDateSet.has(key)) {
        currentStreak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Preserve any legacy streak recorded in extended store
  if (extended.streakCount && extended.streakCount > currentStreak) {
    currentStreak = extended.streakCount;
  }
  if (currentStreak === 0 && studyDays > 0) {
    currentStreak = 1;
  }

  // Calculate best historical streak
  let bestStreak = currentStreak;
  let running = 0;
  let prevDate: Date | null = null;

  sortedDates.forEach((dStr) => {
    const [y, m, d] = dStr.split('-').map(Number);
    const curr = new Date(y, m - 1, d);
    if (!prevDate) {
      running = 1;
    } else {
      const diffDays = Math.round((curr.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        running += 1;
      } else if (diffDays > 1) {
        running = 1;
      }
    }
    if (running > bestStreak) bestStreak = running;
    prevDate = curr;
  });

  // Milestones
  const completedMilestones = STREAK_MILESTONES.filter(
    (m) => currentStreak >= m || bestStreak >= m
  );
  const nextMilestone =
    STREAK_MILESTONES.find((m) => currentStreak < m) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  const daysToNextMilestone = Math.max(0, nextMilestone - currentStreak);

  return {
    currentStreak,
    bestStreak,
    studyDays,
    nextMilestone,
    daysToNextMilestone,
    completedMilestones: Array.from(completedMilestones),
  };
}

// --------------------------------------------------------
// 5. Daily Task Generation (Deterministic Algorithm)
// --------------------------------------------------------
export function getDailyPlan(): DailyTask[] {
  const settings = getPlannerSettings();
  const examId = settings.preferredExamId || 'super-tet';
  const exam = getExam(examId) || exams[0];
  const examSubjects = getSubjectsForExam(exam.id);
  const allTopicsForExam = examSubjects.flatMap((s) => getTopicsForSubject(s.id));

  const topicMap = getLegacyTopicProgressMap();
  const pyqMap = getLegacyPYQProgressMap();
  const quizHistory = loadQuizHistory();
  const mistakes = filterAndSortMistakes({ examId: exam.id, sortBy: 'priority' });
  const weakAreas = getWeakAreas();
  const today = getTodayDate();

  const tasks: DailyTask[] = [];

  // Helper: check if a topic was read/studied today
  const wasStudiedToday = (topicId: string) => {
    const extended = loadExtendedProgress();
    return extended.activities.some(
      (a) => a.timestamp && a.timestamp.startsWith(today) && a.url.includes(topicId)
    );
  };

  // Helper: check if a quiz was attempted today for topic
  const wasQuizAttemptedToday = (topicId: string) => {
    return quizHistory.some(
      (q) => q.date && q.date.startsWith(today) && q.topicId === topicId
    );
  };

  // Helper: check if PYQ was practiced today for topic
  const wasPyqPracticedToday = (topicId: string) => {
    const extended = loadExtendedProgress();
    return extended.activities.some(
      (a) =>
        a.timestamp &&
        a.timestamp.startsWith(today) &&
        a.type === 'pyq' &&
        a.url.includes(topicId)
    );
  };

  // --------------------------------------------------------
  // PRIORITY 1: Continue currently incomplete topic
  // --------------------------------------------------------
  const continueItem = getContinueLearning();
  let incompleteTopic: Topic | undefined;

  if (continueItem && continueItem.examId === exam.id) {
    incompleteTopic = allTopicsForExam.find((t) => t.id === continueItem.topicId);
  }

  if (!incompleteTopic) {
    // Find topic where study progress is > 0 and < 100
    incompleteTopic = allTopicsForExam.find((t) => {
      const p = topicMap[t.id] || 0;
      return p > 0 && p < 100;
    });
  }

  if (incompleteTopic) {
    const subj = getSubject(incompleteTopic.subjectId);
    const progress = topicMap[incompleteTopic.id] || 0;
    const completedToday = wasStudiedToday(incompleteTopic.id) && progress >= 100;
    tasks.push({
      id: `task_continue_${incompleteTopic.id}`,
      type: 'STUDY_MATERIAL',
      examId: exam.id,
      examName: exam.name,
      subjectId: incompleteTopic.subjectId,
      subjectName: subj?.name || 'Subject',
      topicId: incompleteTopic.id,
      topicName: incompleteTopic.name,
      title: `${subj?.name || 'अध्ययन'}: ${incompleteTopic.name}`,
      description: `अधूरा अध्याय जारी रखें (${progress}% पूरा)। सिद्धांत और मुख्य बिंदु पढ़ें।`,
      priority: 1,
      estimatedQuestions: undefined,
      completed: completedToday,
      actionUrl: `/study-material/${exam.id}/${incompleteTopic.subjectId}/${incompleteTopic.id}`,
      actionLabel: progress > 0 ? 'जारी रखें' : 'शुरू करें',
      badgeText: 'अध्ययन जारी रखें',
      badgeTone: 'primary',
    });
  }

  // --------------------------------------------------------
  // PRIORITY 2: Revise mistakes (Module 10 Revision Priority)
  // --------------------------------------------------------
  const activeMistakes = mistakes.filter((m) => m.revisionStatus !== 'MASTERED');
  if (activeMistakes.length > 0) {
    const topMistake = activeMistakes[0];
    const revisionsToday = activeMistakes.filter(
      (m) => m.lastReviewedAt && m.lastReviewedAt.startsWith(today)
    ).length;
    const isDone = revisionsToday >= Math.min(3, activeMistakes.length);

    tasks.push({
      id: `task_revision_mistakes`,
      type: 'REVISION',
      examId: topMistake.examId,
      examName: topMistake.examName,
      subjectId: topMistake.subjectId,
      subjectName: topMistake.subjectName,
      topicId: topMistake.topicId,
      topicName: topMistake.topicName,
      title: `Mistake Book: ${activeMistakes.length} गलत प्रश्नों का पुनरावलोकन`,
      description: `${topMistake.topicName} में बार-बार गलत हुए प्रश्नों का रिवीजन करें और सही संकल्पना समझें।`,
      priority: 2,
      estimatedQuestions: Math.min(10, activeMistakes.length),
      completed: isDone,
      actionUrl: `/mistakes/practice`,
      actionLabel: 'रिवीजन प्रारंभ करें',
      badgeText: 'Mistake Revision',
      badgeTone: 'warning',
    });
  }

  // --------------------------------------------------------
  // PRIORITY 3: Weak topic practice
  // --------------------------------------------------------
  const examWeakAreas = weakAreas.filter(
    (w) => !w.examId || w.examId === exam.id || w.examId === 'super-tet'
  );
  if (examWeakAreas.length > 0) {
    const weakest = examWeakAreas[0];
    const quizDoneToday = wasQuizAttemptedToday(weakest.topicId);
    tasks.push({
      id: `task_weak_${weakest.topicId}`,
      type: 'WEAK_TOPIC',
      examId: exam.id,
      examName: exam.name,
      subjectId: weakest.subjectId,
      subjectName: weakest.subjectName,
      topicId: weakest.topicId,
      topicName: weakest.topicName,
      title: `कमजोर विषय अभ्यास: ${weakest.topicName}`,
      description: `आपकी सटीकता ${weakest.accuracy}% है (${weakest.incorrectCount} गलतियां)। अतिरिक्त अभ्यास आवश्यक है।`,
      priority: 3,
      estimatedQuestions: 10,
      completed: quizDoneToday,
      actionUrl: weakest.practiceUrl || `/quiz/${exam.id}/${weakest.subjectId}/${weakest.topicId}`,
      actionLabel: 'अभ्यास करें',
      badgeText: 'कमजोर विषय',
      badgeTone: 'purple',
    });
  }

  // --------------------------------------------------------
  // PRIORITY 4: Pending authentic PYQ practice
  // --------------------------------------------------------
  const examPyqs = pyqQuestions.filter((q) => q.metadata.examId === exam.id);
  const pendingPyq = examPyqs.find((q) => {
    const rec = pyqMap[q.id];
    return !rec || rec.answered === 0;
  });

  if (pendingPyq) {
    const topic = getTopic(pendingPyq.metadata.topicId);
    const subj = getSubject(pendingPyq.metadata.subjectId);
    const pyqDoneToday = wasPyqPracticedToday(pendingPyq.metadata.topicId);

    tasks.push({
      id: `task_pyq_${pendingPyq.id}`,
      type: 'PYQ',
      examId: exam.id,
      examName: exam.name,
      subjectId: pendingPyq.metadata.subjectId,
      subjectName: subj?.name || 'PYQ Subject',
      topicId: pendingPyq.metadata.topicId,
      topicName: topic?.name || 'PYQ Topic',
      title: `विगत वर्ष प्रश्न (PYQ): ${topic?.name || 'प्रामाणिक प्रश्न'}`,
      description: `${exam.name} (${pendingPyq.metadata.year}) का विगत वर्ष प्रश्न हल करें।`,
      priority: 4,
      estimatedQuestions: 5,
      completed: pyqDoneToday,
      actionUrl: `/pyq/${exam.id}/${pendingPyq.metadata.subjectId}/${pendingPyq.metadata.topicId}`,
      actionLabel: 'PYQ हल करें',
      badgeText: 'विगत वर्ष प्रश्न',
      badgeTone: 'amber',
    });
  }

  // --------------------------------------------------------
  // PRIORITY 5: Pending Quiz
  // --------------------------------------------------------
  // Find a topic with quiz available that hasn't been attempted yet or needs practice
  const pendingQuizTopic = allTopicsForExam.find((t) => {
    if (!t.availability.quiz) return false;
    const attempts = quizHistory.filter((q) => q.topicId === t.id);
    return attempts.length === 0;
  });

  if (pendingQuizTopic) {
    const subj = getSubject(pendingQuizTopic.subjectId);
    const quizDoneToday = wasQuizAttemptedToday(pendingQuizTopic.id);
    tasks.push({
      id: `task_quiz_${pendingQuizTopic.id}`,
      type: 'QUIZ',
      examId: exam.id,
      examName: exam.name,
      subjectId: pendingQuizTopic.subjectId,
      subjectName: subj?.name || 'Subject',
      topicId: pendingQuizTopic.id,
      topicName: pendingQuizTopic.name,
      title: `MCQ क्विज़: ${pendingQuizTopic.name}`,
      description: `10 बहुविकल्पीय प्रश्नों के साथ तुरंत मूल्यांकन और व्याख्या प्राप्त करें।`,
      priority: 5,
      estimatedQuestions: 10,
      completed: quizDoneToday,
      actionUrl: `/quiz/${exam.id}/${pendingQuizTopic.subjectId}/${pendingQuizTopic.id}`,
      actionLabel: 'क्विज़ प्रारंभ करें',
      badgeText: 'MCQ क्विज़',
      badgeTone: 'info',
    });
  }

  // --------------------------------------------------------
  // PRIORITY 6: New Topic in curriculum
  // --------------------------------------------------------
  const unstartedTopic = allTopicsForExam.find((t) => {
    const p = topicMap[t.id] || 0;
    return p === 0;
  });

  if (unstartedTopic) {
    const subj = getSubject(unstartedTopic.subjectId);
    const completedToday = wasStudiedToday(unstartedTopic.id);
    tasks.push({
      id: `task_new_${unstartedTopic.id}`,
      type: 'STUDY_MATERIAL',
      examId: exam.id,
      examName: exam.name,
      subjectId: unstartedTopic.subjectId,
      subjectName: subj?.name || 'Subject',
      topicId: unstartedTopic.id,
      topicName: unstartedTopic.name,
      title: `नया अध्याय: ${unstartedTopic.name}`,
      description: `${subj?.name || 'विषय'} का नया अध्याय प्रारंभ करें और अपने पाठ्यक्रम का विस्तार करें।`,
      priority: 6,
      estimatedQuestions: undefined,
      completed: completedToday,
      actionUrl: `/study-material/${exam.id}/${unstartedTopic.subjectId}/${unstartedTopic.id}`,
      actionLabel: 'अध्याय शुरू करें',
      badgeText: 'नया विषय',
      badgeTone: 'success',
    });
  }

  // --------------------------------------------------------
  // PRIORITY 7: Mock Test when appropriate
  // --------------------------------------------------------
  const examMocks = mockTestConfigs.filter((m) => m.examId === exam.id);
  if (examMocks.length > 0) {
    const mock = examMocks[0];
    const mockAttempts = loadMockAttempts();
    const attemptedToday = mockAttempts.some((m) => {
      const d = m.completedAt || m.date;
      return m.testId === mock.id && d && d.startsWith(today);
    });

    tasks.push({
      id: `task_mock_${mock.id}`,
      type: 'MOCK_TEST',
      examId: exam.id,
      examName: exam.name,
      subjectId: '',
      subjectName: exam.name,
      topicId: '',
      topicName: mock.title,
      title: `फुल मॉक टेस्ट: ${mock.title}`,
      description: `${mock.questionCount} प्रश्न • ${mock.durationMinutes} मिनट • वास्तविक परीक्षा का माहौल।`,
      priority: 7,
      estimatedQuestions: mock.questionCount,
      completed: attemptedToday,
      actionUrl: `/mock-tests/start/${mock.id}`,
      actionLabel: 'मॉक टेस्ट दें',
      badgeText: 'मॉक टेस्ट',
      badgeTone: 'purple',
    });
  }

  // --------------------------------------------------------
  // Study Sequence Adjustment from Planner Settings
  // --------------------------------------------------------
  if (settings.studySequence === 'revision_first') {
    tasks.sort((a, b) => (a.type === 'REVISION' ? -1 : b.type === 'REVISION' ? 1 : a.priority - b.priority));
  } else if (settings.studySequence === 'pyq_first') {
    tasks.sort((a, b) => (a.type === 'PYQ' ? -1 : b.type === 'PYQ' ? 1 : a.priority - b.priority));
  } else if (settings.studySequence === 'quiz_first') {
    tasks.sort((a, b) => (a.type === 'QUIZ' ? -1 : b.type === 'QUIZ' ? 1 : a.priority - b.priority));
  } else {
    // Default: Sort by priority ascending
    tasks.sort((a, b) => a.priority - b.priority);
  }

  // Cap at 6 focused daily tasks
  return tasks.slice(0, 6);
}

// --------------------------------------------------------
// 6. Motivational Insights (Deterministic State-based)
// --------------------------------------------------------
export function getPlannerMotivationalInsight(): { message: string; tone: string } {
  const progress = getTodayProgress();
  const streak = getStudyStreak();
  const weakAreas = getWeakAreas();
  const mistakes = loadMistakes();
  const activeMistakes = mistakes.filter((m) => m.revisionStatus !== 'MASTERED');

  if (progress.isCompleted) {
    return {
      message: 'बहुत बढ़िया! आज का दैनिक लक्ष्य पूरा हो गया 🎉 अपने आत्मविश्वास को बनाए रखें।',
      tone: 'emerald',
    };
  }

  if (streak.currentStreak >= 7) {
    return {
      message: `आपकी निरंतरता मजबूत हो रही है (${streak.currentStreak} दिन की लकीर 🔥)। प्रतिदिन का यह अनुशासन आपको सफल बनाएगा।`,
      tone: 'amber',
    };
  }

  if (activeMistakes.length > 0 && progress.revisionsDone === 0) {
    return {
      message: 'आज Mistake Book से गलत प्रश्नों का रिवीजन करना उपयोगी रहेगा। त्रुटियों को दूर करना ही उच्चतम अंक दिलाता है।',
      tone: 'rose',
    };
  }

  if (weakAreas.length > 0) {
    return {
      message: `कुछ topics (${weakAreas[0].topicName}) पर अतिरिक्त रिवीजन की जरूरत है। आज थोड़ा समय इस पर दें।`,
      tone: 'purple',
    };
  }

  if (progress.questionsAttempted === 0) {
    return {
      message: 'आज की पढ़ाई शुरू करें और पहला छोटा लक्ष्य पूरा करें। एक कदम भी आपको मंजिल के करीब लाता है।',
      tone: 'sky',
    };
  }

  return {
    message: `आज ${progress.questionsAttempted}/${progress.questionsTarget} प्रश्न हल हो चुके हैं। थोड़ा और प्रयास करें और लक्ष्य हासिल करें!`,
    tone: 'blue',
  };
}

// --------------------------------------------------------
// 7. Study History
// --------------------------------------------------------
export function getStudyHistory(): StudyHistoryEntry[] {
  const dailyMap = getDailyActivityMap();
  const quizHistory = loadQuizHistory();
  const mockAttempts = loadMockAttempts();
  const mistakes = loadMistakes();
  const extended = loadExtendedProgress();
  const goalTarget = getDailyGoal();

  // Distinct dates set
  const dateSet = new Set<string>();

  Object.keys(dailyMap).forEach((d) => dateSet.add(d));
  quizHistory.forEach((q) => q.date && dateSet.add(q.date.slice(0, 10)));
  mockAttempts.forEach((m) => {
    const d = m.completedAt || m.date;
    if (d) dateSet.add(d.slice(0, 10));
  });
  mistakes.forEach((m) => {
    if (m.lastAttemptedAt) dateSet.add(m.lastAttemptedAt.slice(0, 10));
    if (m.lastReviewedAt) dateSet.add(m.lastReviewedAt.slice(0, 10));
  });
  extended.activities.forEach((a) => a.timestamp && dateSet.add(a.timestamp.slice(0, 10)));

  const historyEntries: StudyHistoryEntry[] = [];

  Array.from(dateSet).forEach((dateStr) => {
    const act = dailyMap[dateStr] || {
      questionsAttempted: 0,
      questionsCorrect: 0,
      quizzesCompleted: 0,
      pyqsAttempted: 0,
    };

    // Quizzes on this date
    const dateQuizzes = quizHistory.filter((q) => q.date && q.date.startsWith(dateStr));
    const quizQAttempted = dateQuizzes.reduce((acc, q) => acc + (q.attempted || 0), 0);
    const quizQCorrect = dateQuizzes.reduce((acc, q) => acc + (q.correct || 0), 0);

    // Mock tests on this date
    const dateMocks = mockAttempts.filter((m) => {
      const d = m.completedAt || m.date;
      return d && d.startsWith(dateStr);
    });
    const mockQAttempted = dateMocks.reduce((acc, m) => acc + (m.attempted || 0), 0);
    const mockQCorrect = dateMocks.reduce((acc, m) => acc + (m.correct || 0), 0);

    const questionsAttempted = Math.max(
      act.questionsAttempted,
      quizQAttempted + mockQAttempted + act.pyqsAttempted
    );
    const questionsCorrect = Math.max(act.questionsCorrect, quizQCorrect + mockQCorrect);

    // Study materials on this date
    const dateActivities = extended.activities.filter(
      (a) => a.timestamp && a.timestamp.startsWith(dateStr)
    );
    const studyMaterialsCount = dateActivities.filter((a) => a.type === 'study').length;

    // Mistakes reviewed on this date
    const revisionsDone = mistakes.filter(
      (m) => m.lastReviewedAt && m.lastReviewedAt.startsWith(dateStr)
    ).length;

    const quizzesCompleted = Math.max(act.quizzesCompleted, dateQuizzes.length);

    // Filter out dates that had 0 questions, 0 study, 0 quizzes, 0 revisions
    if (questionsAttempted === 0 && studyMaterialsCount === 0 && quizzesCompleted === 0 && revisionsDone === 0) {
      return;
    }

    const completionPercentage = Math.min(
      100,
      Math.round((questionsAttempted / goalTarget) * 100)
    );
    const isGoalCompleted = questionsAttempted >= goalTarget;

    historyEntries.push({
      date: dateStr,
      formattedDate: formatReadableDate(dateStr),
      questionsAttempted,
      questionsCorrect,
      studyMaterialsCount,
      pyqsAttempted: act.pyqsAttempted,
      quizzesCompleted,
      revisionsDone,
      goalTarget,
      isGoalCompleted,
      completionPercentage,
    });
  });

  // Sort descending by date
  historyEntries.sort((a, b) => b.date.localeCompare(a.date));

  // Sync to examsetu4u_study_history
  safeSet(STUDY_HISTORY_KEY, JSON.stringify(historyEntries));

  return historyEntries;
}

// --------------------------------------------------------
// 8. Top Recommended Action (for Dashboard integration)
// --------------------------------------------------------
export function getTopPlannerRecommendation(): DailyTask | null {
  const plan = getDailyPlan();
  const incomplete = plan.find((t) => !t.completed);
  return incomplete || plan[0] || null;
}
