import { exams, getExam, getSubject, getSubjectsForExam, getTopic, getTopicsForSubject, subjects, topics } from '@/data/curriculum';
import { pyqQuestions } from '@/data/pyq';
import { loadQuizHistory } from '@/lib/quiz-storage';
import {
  calculateExamProgress,
  calculateIntelligentScore,
  calculateOverallProgress,
  calculateSubjectProgress,
  getLegacyPYQProgressMap,
  getLegacyTopicProgressMap,
  loadExtendedProgress,
  saveExtendedProgress,
  OverallProgressSummary,
} from '@/lib/user-progress';

// --------------------------------------------------------
// Storage Keys
// --------------------------------------------------------
export const DAILY_GOAL_KEY = 'examsetu4u_daily_goal';
export const DAILY_ACTIVITY_KEY = 'examsetu4u_daily_activity';
export const ACHIEVEMENTS_KEY = 'examsetu4u_achievements';
export const MILESTONES_KEY = 'examsetu4u_milestones';
export const STUDY_TIME_GOAL_KEY = 'examsetu4u_study_time_goal';

// --------------------------------------------------------
// Types
// --------------------------------------------------------
export type StrengthCategory = 'Weak' | 'Needs Improvement' | 'Good' | 'Strong';

export interface SubjectStrengthItem {
  subjectId: string;
  subjectName: string;
  examId: string;
  examName: string;
  accuracy: number;
  progress: number;
  strength: StrengthCategory;
  questionsAttempted: number;
  questionsCorrect: number;
  studyPercent: number;
  url: string;
  quizUrl: string;
}

export interface TopicPerformanceItem {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  examId: string;
  examName: string;
  accuracy: number;
  studyProgress: number;
  questionsAttempted: number;
  questionsCorrect: number;
  strength: StrengthCategory;
  url: string;
  quizUrl: string;
}

export interface QuizPerformanceTrend {
  totalQuizzes: number;
  averageScore: number;
  bestScore: number;
  averageAccuracy: number;
  totalQuestions: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnanswered: number;
  trendDirection: 'improving' | 'declining' | 'steady' | 'insufficient';
  trendDiffPercentage: number;
  recentQuizzes: Array<{
    attemptId: string;
    date: string;
    percentage: number;
    score: number;
    total: number;
    topicName: string;
    subjectName: string;
  }>;
  hasEnoughData: boolean;
}

export interface DailyGoalStatus {
  targetQuestions: number;
  todayQuestionsAttempted: number;
  todayQuestionsCorrect: number;
  percentage: number;
  isCompleted: boolean;
  remaining: number;
  selectedStudyTimeGoalMinutes: number;
}

export interface PreparationLevel {
  levelNumber: number;
  levelName: string;
  badge: string;
  description: string;
  progressToNext: number; // 0 - 100
  nextLevelName: string | null;
  requirementsText: string;
  isMaxLevel: boolean;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  requirement: string;
  icon: string;
  category: 'quiz' | 'practice' | 'study' | 'streak' | 'accuracy';
  isUnlocked: boolean;
  unlockedAt: string | null;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
}

export interface MilestoneRecord {
  id: string;
  title: string;
  description: string;
  icon: string;
  isAchieved: boolean;
  achievedAt: string | null;
  badgeText: string;
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

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --------------------------------------------------------
// 1. Daily Learning Goal
// --------------------------------------------------------
export const DAILY_GOAL_OPTIONS = [10, 20, 30, 50, 100] as const;
export const STUDY_TIME_OPTIONS = [15, 30, 45, 60, 90] as const;

export function getDailyQuestionGoal(): number {
  const raw = safeGet(DAILY_GOAL_KEY);
  if (raw) {
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > 0) return num;
  }
  return 20; // default 20 questions/day
}

export function setDailyQuestionGoal(goal: number): void {
  safeSet(DAILY_GOAL_KEY, String(goal));
}

export function getStudyTimeGoal(): number {
  const raw = safeGet(STUDY_TIME_GOAL_KEY);
  if (raw) {
    const num = parseInt(raw, 10);
    if (!isNaN(num) && num > 0) return num;
  }
  return 30; // default 30 minutes
}

export function setStudyTimeGoal(minutes: number): void {
  safeSet(STUDY_TIME_GOAL_KEY, String(minutes));
}

export interface DailyActivityMap {
  [dateStr: string]: {
    questionsAttempted: number;
    questionsCorrect: number;
    quizzesCompleted: number;
    pyqsAttempted: number;
  };
}

export function getDailyActivityMap(): DailyActivityMap {
  const raw = safeGet(DAILY_ACTIVITY_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function recordQuestionAttemptToday(isCorrect: boolean, type: 'pyq' | 'quiz'): void {
  const today = getTodayKey();
  const map = getDailyActivityMap();
  const existing = map[today] || {
    questionsAttempted: 0,
    questionsCorrect: 0,
    quizzesCompleted: 0,
    pyqsAttempted: 0,
  };

  existing.questionsAttempted += 1;
  if (isCorrect) existing.questionsCorrect += 1;
  if (type === 'pyq') existing.pyqsAttempted += 1;

  map[today] = existing;
  safeSet(DAILY_ACTIVITY_KEY, JSON.stringify(map));
  evaluateAchievementsAndMilestones();
}

export function recordQuizCompletedToday(attempted: number, correct: number): void {
  const today = getTodayKey();
  const map = getDailyActivityMap();
  const existing = map[today] || {
    questionsAttempted: 0,
    questionsCorrect: 0,
    quizzesCompleted: 0,
    pyqsAttempted: 0,
  };

  existing.questionsAttempted += attempted;
  existing.questionsCorrect += correct;
  existing.quizzesCompleted += 1;

  map[today] = existing;
  safeSet(DAILY_ACTIVITY_KEY, JSON.stringify(map));
  evaluateAchievementsAndMilestones();
}

export function getDailyGoalStatus(): DailyGoalStatus {
  const targetQuestions = getDailyQuestionGoal();
  const studyGoal = getStudyTimeGoal();
  const today = getTodayKey();
  const map = getDailyActivityMap();
  const todayActivity = map[today];

  let todayQuestionsAttempted = todayActivity?.questionsAttempted || 0;
  let todayQuestionsCorrect = todayActivity?.questionsCorrect || 0;

  // Cross-verify with quizzes taken today if not yet counted
  const quizHistory = loadQuizHistory();
  const todayQuizzes = quizHistory.filter((q) => q.date && q.date.startsWith(today));
  const quizQuestionsToday = todayQuizzes.reduce((acc, q) => acc + (q.attempted || 0), 0);
  const quizCorrectToday = todayQuizzes.reduce((acc, q) => acc + (q.correct || 0), 0);

  if (quizQuestionsToday > todayQuestionsAttempted) {
    todayQuestionsAttempted = Math.max(todayQuestionsAttempted, quizQuestionsToday);
    todayQuestionsCorrect = Math.max(todayQuestionsCorrect, quizCorrectToday);
  }

  const percentage = Math.min(100, Math.round((todayQuestionsAttempted / targetQuestions) * 100));
  const isCompleted = todayQuestionsAttempted >= targetQuestions;
  const remaining = Math.max(0, targetQuestions - todayQuestionsAttempted);

  return {
    targetQuestions,
    todayQuestionsAttempted,
    todayQuestionsCorrect,
    percentage,
    isCompleted,
    remaining,
    selectedStudyTimeGoalMinutes: studyGoal,
  };
}

// --------------------------------------------------------
// 2. Subject Strength Analysis
// Categories:
// 0–49% = Weak
// 50–69% = Needs Improvement
// 70–84% = Good
// 85–100% = Strong
// --------------------------------------------------------
export function getStrengthCategory(accuracy: number): StrengthCategory {
  if (accuracy >= 85) return 'Strong';
  if (accuracy >= 70) return 'Good';
  if (accuracy >= 50) return 'Needs Improvement';
  return 'Weak';
}

export function getSubjectStrengthList(examId?: string): SubjectStrengthItem[] {
  const pyqMap = getLegacyPYQProgressMap();
  const quizHistory = loadQuizHistory();
  const activeExamIds = examId ? [examId] : exams.map((e) => e.id);

  const result: SubjectStrengthItem[] = [];

  activeExamIds.forEach((eId) => {
    const exam = getExam(eId);
    if (!exam) return;
    const examSubjects = getSubjectsForExam(eId);

    examSubjects.forEach((subj) => {
      // Calculate questions attempted & correct in PYQs
      const subjPyqs = pyqQuestions.filter((q) => q.metadata.subjectId === subj.id);
      let pyqAttempted = 0;
      let pyqCorrect = 0;
      subjPyqs.forEach((q) => {
        const record = pyqMap[q.id];
        if (record && record.answered > 0) {
          pyqAttempted += record.answered;
          pyqCorrect += record.correct;
        }
      });

      // Calculate questions in Quizzes
      const subjQuizzes = quizHistory.filter((q) => q.subjectId === subj.id);
      let quizAttempted = 0;
      let quizCorrect = 0;
      subjQuizzes.forEach((q) => {
        quizAttempted += q.attempted;
        quizCorrect += q.correct;
      });

      const totalAttempted = pyqAttempted + quizAttempted;
      const totalCorrect = pyqCorrect + quizCorrect;

      // Subject accuracy
      const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

      // Subject study progress
      const subjProgress = calculateSubjectProgress(subj.id);

      result.push({
        subjectId: subj.id,
        subjectName: subj.name,
        examId: eId,
        examName: exam.name,
        accuracy,
        progress: subjProgress.overallPercent,
        strength: getStrengthCategory(accuracy),
        questionsAttempted: totalAttempted,
        questionsCorrect: totalCorrect,
        studyPercent: subjProgress.studyMaterialPercent,
        url: `/exams/${eId}/${subj.id}`,
        quizUrl: `/quiz/${eId}/${subj.id}`,
      });
    });
  });

  return result;
}

// --------------------------------------------------------
// 3. Topic Performance Analysis
// --------------------------------------------------------
export function getTopicPerformanceList(examId?: string, subjectId?: string): TopicPerformanceItem[] {
  const topicProgressMap = getLegacyTopicProgressMap();
  const pyqMap = getLegacyPYQProgressMap();
  const quizHistory = loadQuizHistory();

  let targetTopics = topics;
  if (examId) targetTopics = targetTopics.filter((t) => t.examId === examId);
  if (subjectId) targetTopics = targetTopics.filter((t) => t.subjectId === subjectId);

  const results: TopicPerformanceItem[] = [];

  targetTopics.forEach((t) => {
    const exam = getExam(t.examId);
    const subject = getSubject(t.subjectId);
    const studyProgress = topicProgressMap[t.id] || 0;

    // PYQ performance for topic
    const topicPyqs = pyqQuestions.filter((q) => q.metadata.topicId === t.id);
    let pyqAttempted = 0;
    let pyqCorrect = 0;
    topicPyqs.forEach((q) => {
      const rec = pyqMap[q.id];
      if (rec && rec.answered > 0) {
        pyqAttempted += rec.answered;
        pyqCorrect += rec.correct;
      }
    });

    // Quiz performance for topic
    const topicQuizzes = quizHistory.filter((q) => q.topicId === t.id);
    let quizAttempted = 0;
    let quizCorrect = 0;
    topicQuizzes.forEach((q) => {
      quizAttempted += q.attempted;
      quizCorrect += q.correct;
    });

    const totalAttempted = pyqAttempted + quizAttempted;
    const totalCorrect = pyqCorrect + quizCorrect;

    // Only include topics where student has read notes OR attempted questions
    if (studyProgress > 0 || totalAttempted > 0) {
      const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : studyProgress >= 80 ? 75 : 50;

      results.push({
        topicId: t.id,
        topicName: t.name,
        subjectId: t.subjectId,
        subjectName: subject?.name || 'Subject',
        examId: t.examId,
        examName: exam?.name || 'Exam',
        accuracy,
        studyProgress,
        questionsAttempted: totalAttempted,
        questionsCorrect: totalCorrect,
        strength: getStrengthCategory(accuracy),
        url: `/study-material/${t.examId}/${t.subjectId}/${t.id}`,
        quizUrl: `/quiz/${t.examId}/${t.subjectId}/${t.id}`,
      });
    }
  });

  return results;
}

// --------------------------------------------------------
// 4. Quiz Performance & Trend Analysis
// --------------------------------------------------------
export function getQuizPerformanceTrend(): QuizPerformanceTrend {
  const quizHistory = loadQuizHistory();

  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalUnanswered = 0;
  let scoreSum = 0;
  let bestScore = 0;

  quizHistory.forEach((q) => {
    totalQuestions += q.attempted;
    totalCorrect += q.correct;
    totalIncorrect += q.incorrect;
    totalUnanswered += q.unanswered;
    scoreSum += q.percentage;
    if (q.percentage > bestScore) bestScore = q.percentage;
  });

  const totalQuizzes = quizHistory.length;
  const averageScore = totalQuizzes > 0 ? Math.round(scoreSum / totalQuizzes) : 0;
  const averageAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const recentQuizzes = quizHistory.slice(0, 7).map((q) => ({
    attemptId: q.attemptId,
    date: q.date,
    percentage: q.percentage,
    score: q.score,
    total: q.totalQuestions,
    topicName: q.topicName,
    subjectName: q.subjectName,
  }));

  const hasEnoughData = recentQuizzes.length >= 2;

  let trendDirection: QuizPerformanceTrend['trendDirection'] = 'insufficient';
  let trendDiffPercentage = 0;

  if (hasEnoughData) {
    // Compare most recent quiz vs average of earlier quizzes in recent list
    const latestScore = recentQuizzes[0].percentage;
    const previousScores = recentQuizzes.slice(1).map((q) => q.percentage);
    const previousAverage = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;

    trendDiffPercentage = Math.round(latestScore - previousAverage);
    if (trendDiffPercentage > 3) {
      trendDirection = 'improving';
    } else if (trendDiffPercentage < -3) {
      trendDirection = 'declining';
    } else {
      trendDirection = 'steady';
    }
  }

  return {
    totalQuizzes,
    averageScore,
    bestScore,
    averageAccuracy,
    totalQuestions,
    totalCorrect,
    totalIncorrect,
    totalUnanswered,
    trendDirection,
    trendDiffPercentage,
    recentQuizzes,
    hasEnoughData,
  };
}

// --------------------------------------------------------
// 5. Preparation Level System
// Levels:
// Level 1 — Starter
// Level 2 — Learner
// Level 3 — Consistent
// Level 4 — Strong
// Level 5 — Advanced
// Level 6 — Exam Ready
// --------------------------------------------------------
export function calculatePreparationLevel(): PreparationLevel {
  const overall = calculateOverallProgress();
  const topicsCompleted = overall.studyMaterialsCompleted;
  const questionsAttempted = overall.totalQuestionsAttempted;
  const quizAccuracy = overall.quizAccuracy;
  const pyqAccuracy = overall.pyqAccuracy;
  const overallAccuracy = overall.overallAccuracy;
  const streak = overall.learningStreakDays;
  const quizzesCompleted = overall.quizzesCompleted;

  // Level 6: Exam Ready
  // Criteria: 20+ topics, 400+ questions, accuracy >= 82%, streak >= 5, 5+ quizzes
  if (topicsCompleted >= 20 && questionsAttempted >= 400 && overallAccuracy >= 82 && streak >= 5) {
    return {
      levelNumber: 6,
      levelName: 'Level 6 — Exam Ready',
      badge: '🏆 Exam Ready',
      description: 'आपकी तैयारी परीक्षा-स्तर पर पहुँच चुकी है। सटीकता, कवरेज और निरंतरता शीर्ष स्तर पर है।',
      progressToNext: 100,
      nextLevelName: null,
      requirementsText: 'सर्वोच्च तैयारी स्तर प्राप्त! नियमित मॉक टेस्ट देते रहें।',
      isMaxLevel: true,
    };
  }

  // Level 5: Advanced
  // Requirements for Level 6: 20 topics, 400 questions, 82% accuracy
  if (topicsCompleted >= 10 && questionsAttempted >= 200 && overallAccuracy >= 75) {
    const topicsNeeded = Math.max(0, 20 - topicsCompleted);
    const questionsNeeded = Math.max(0, 400 - questionsAttempted);
    const progress = Math.min(
      99,
      Math.round(((topicsCompleted / 20) * 0.4 + (questionsAttempted / 400) * 0.4 + (overallAccuracy / 82) * 0.2) * 100)
    );
    return {
      levelNumber: 5,
      levelName: 'Level 5 — Advanced',
      badge: '⭐ Advanced',
      description: 'गहन अध्ययन और उच्च सटीकता। आप शीर्ष रैंकर्स की श्रेणी में आ रहे हैं।',
      progressToNext: progress,
      nextLevelName: 'Level 6 — Exam Ready',
      requirementsText: `${questionsNeeded} और प्रश्न अभ्यास + ${topicsNeeded} नए अध्याय पूर्ण करने पर अगला स्तर अनलॉक होगा।`,
      isMaxLevel: false,
    };
  }

  // Level 4: Strong
  // Requirements for Level 5: 10 topics, 200 questions, 75% accuracy
  if (topicsCompleted >= 5 && questionsAttempted >= 80 && overallAccuracy >= 65) {
    const topicsNeeded = Math.max(0, 10 - topicsCompleted);
    const questionsNeeded = Math.max(0, 200 - questionsAttempted);
    const progress = Math.min(
      99,
      Math.round(((topicsCompleted / 10) * 0.4 + (questionsAttempted / 200) * 0.4 + (overallAccuracy / 75) * 0.2) * 100)
    );
    return {
      levelNumber: 4,
      levelName: 'Level 4 — Strong',
      badge: '⚡ Strong',
      description: 'मजबूत पकड़। अवधारणाएँ स्पष्ट हो रही हैं और क्विज़ में निरंतरता आ रही है।',
      progressToNext: progress,
      nextLevelName: 'Level 5 — Advanced',
      requirementsText: `${questionsNeeded} और प्रश्न + ${topicsNeeded} अध्याय आवश्यक (Level 5 के लिए)।`,
      isMaxLevel: false,
    };
  }

  // Level 3: Consistent
  // Requirements for Level 4: 5 topics, 80 questions, 65% accuracy
  if (topicsCompleted >= 2 && questionsAttempted >= 30 && (quizzesCompleted >= 2 || overall.pyqsAttempted >= 10)) {
    const topicsNeeded = Math.max(0, 5 - topicsCompleted);
    const questionsNeeded = Math.max(0, 80 - questionsAttempted);
    const progress = Math.min(
      99,
      Math.round(((topicsCompleted / 5) * 0.4 + (questionsAttempted / 80) * 0.4 + (overallAccuracy / 65) * 0.2) * 100)
    );
    return {
      levelNumber: 3,
      levelName: 'Level 3 — Consistent',
      badge: '🔥 Consistent',
      description: 'नियमितता स्थापित हो गई है। आप लगातार अभ्यास और अध्ययन कर रहे हैं।',
      progressToNext: progress,
      nextLevelName: 'Level 4 — Strong',
      requirementsText: `${questionsNeeded} प्रश्न हल करें + ${topicsNeeded} और टॉपिक पूरे करें (Level 4 के लिए)।`,
      isMaxLevel: false,
    };
  }

  // Level 2: Learner
  // Requirements for Level 3: 2 topics, 30 questions, 2 quizzes
  if (topicsCompleted >= 1 || questionsAttempted >= 10 || quizzesCompleted >= 1) {
    const topicsNeeded = Math.max(0, 2 - topicsCompleted);
    const questionsNeeded = Math.max(0, 30 - questionsAttempted);
    const progress = Math.min(
      99,
      Math.round(((topicsCompleted / 2) * 0.4 + (questionsAttempted / 30) * 0.6) * 100)
    );
    return {
      levelNumber: 2,
      levelName: 'Level 2 — Learner',
      badge: '📚 Learner',
      description: 'अध्ययन यात्रा प्रारंभ हो चुकी है। बेसिक संकल्पनाओं पर काम चल रहा है।',
      progressToNext: progress,
      nextLevelName: 'Level 3 — Consistent',
      requirementsText: `${questionsNeeded} और प्रश्न + ${topicsNeeded} टॉपिक पूर्ण करने पर Level 3 अनलॉक होगा।`,
      isMaxLevel: false,
    };
  }

  // Level 1: Starter
  // Requirements for Level 2: 1 topic OR 10 questions OR 1 quiz
  const starterProgress = Math.min(99, Math.round((questionsAttempted / 10) * 80 + (topicsCompleted > 0 ? 20 : 0)));
  return {
    levelNumber: 1,
    levelName: 'Level 1 — Starter',
    badge: '🌱 Starter',
    description: 'ExamSetu4U पर आपकी शुरुआत। पहला क्विज़ हल करें या अध्याय पढ़ें।',
    progressToNext: starterProgress,
    nextLevelName: 'Level 2 — Learner',
    requirementsText: 'पहला क्विज़ दें या 10 प्रश्न हल करें और Level 2 — Learner पर पहुँचें।',
    isMaxLevel: false,
  };
}

// --------------------------------------------------------
// 6. Achievements Engine
// Defined Badges:
// 1. First Quiz
// 2. 50 Questions
// 3. 100 Questions
// 4. 500 Questions
// 5. 1000 Questions
// 6. First Topic
// 7. 10 Topics
// 8. PYQ Starter
// 9. Accuracy Master (85%+)
// 10. 7 Day Streak
// 11. 30 Day Streak
// --------------------------------------------------------
interface StoredAchievementMeta {
  [id: string]: {
    unlockedAt: string;
  };
}

function getStoredAchievementMeta(): StoredAchievementMeta {
  const raw = safeGet(ACHIEVEMENTS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStoredAchievementMeta(meta: StoredAchievementMeta): void {
  safeSet(ACHIEVEMENTS_KEY, JSON.stringify(meta));
}

export function getAllAchievements(): AchievementItem[] {
  const overall = calculateOverallProgress();
  const meta = getStoredAchievementMeta();
  let updatedMeta = false;

  const rawBadges = [
    {
      id: 'first-quiz',
      title: 'First Quiz',
      description: 'Complete your first quiz.',
      requirement: 'पहला क्विज़ टेस्ट पूरा करें।',
      icon: '🏆',
      category: 'quiz' as const,
      currentValue: overall.quizzesCompleted,
      targetValue: 1,
      isUnlocked: overall.quizzesCompleted >= 1,
    },
    {
      id: '50-questions',
      title: '50 Questions',
      description: 'Attempt 50 questions.',
      requirement: 'कुल 50 प्रश्न हल करें (Quiz + PYQ)।',
      icon: '🎯',
      category: 'practice' as const,
      currentValue: overall.totalQuestionsAttempted,
      targetValue: 50,
      isUnlocked: overall.totalQuestionsAttempted >= 50,
    },
    {
      id: '100-questions',
      title: '100 Questions',
      description: 'Attempt 100 questions.',
      requirement: '100 प्रश्नों का अभ्यास पूरा करें।',
      icon: '💯',
      category: 'practice' as const,
      currentValue: overall.totalQuestionsAttempted,
      targetValue: 100,
      isUnlocked: overall.totalQuestionsAttempted >= 100,
    },
    {
      id: '500-questions',
      title: '500 Questions',
      description: 'Attempt 500 questions.',
      requirement: '500 प्रश्नों का गहन अभ्यास पूरा करें।',
      icon: '🎖️',
      category: 'practice' as const,
      currentValue: overall.totalQuestionsAttempted,
      targetValue: 500,
      isUnlocked: overall.totalQuestionsAttempted >= 500,
    },
    {
      id: '1000-questions',
      title: '1000 Questions',
      description: 'Attempt 1000 questions.',
      requirement: '1000 प्रश्नों का मास्टर अभ्यास पूरा करें।',
      icon: '👑',
      category: 'practice' as const,
      currentValue: overall.totalQuestionsAttempted,
      targetValue: 1000,
      isUnlocked: overall.totalQuestionsAttempted >= 1000,
    },
    {
      id: 'first-topic',
      title: 'First Topic',
      description: 'Complete your first study topic.',
      requirement: 'पहला अध्ययन विषय 80%+ पूरा करें।',
      icon: '📖',
      category: 'study' as const,
      currentValue: overall.studyMaterialsCompleted,
      targetValue: 1,
      isUnlocked: overall.studyMaterialsCompleted >= 1,
    },
    {
      id: '10-topics',
      title: '10 Topics',
      description: 'Complete 10 topics.',
      requirement: '10 अध्ययन अध्यायों को पूरा करें।',
      icon: '📚',
      category: 'study' as const,
      currentValue: overall.studyMaterialsCompleted,
      targetValue: 10,
      isUnlocked: overall.studyMaterialsCompleted >= 10,
    },
    {
      id: 'pyq-starter',
      title: 'PYQ Starter',
      description: 'Attempt your first PYQ.',
      requirement: 'पहला विगत वर्ष प्रश्न (PYQ) हल करें।',
      icon: '📝',
      category: 'practice' as const,
      currentValue: overall.pyqsAttempted,
      targetValue: 1,
      isUnlocked: overall.pyqsAttempted >= 1,
    },
    {
      id: 'accuracy-master',
      title: 'Accuracy Master',
      description: 'Reach 85%+ accuracy with sufficient attempts.',
      requirement: 'कम से कम 20 प्रश्नों में 85%+ सटीकता हासिल करें।',
      icon: '🎯',
      category: 'accuracy' as const,
      currentValue: overall.totalQuestionsAttempted >= 20 ? overall.overallAccuracy : 0,
      targetValue: 85,
      isUnlocked: overall.totalQuestionsAttempted >= 20 && overall.overallAccuracy >= 85,
    },
    {
      id: '7-day-streak',
      title: '7 Day Streak',
      description: 'Study for 7 consecutive days.',
      requirement: 'लगातार 7 दिनों तक अध्ययन निरंतरता बनाए रखें।',
      icon: '🔥',
      category: 'streak' as const,
      currentValue: overall.learningStreakDays,
      targetValue: 7,
      isUnlocked: overall.learningStreakDays >= 7,
    },
    {
      id: '30-day-streak',
      title: '30 Day Streak',
      description: 'Study for 30 consecutive days.',
      requirement: '30 दिनों की निरंतर अध्ययन लकीर (Streak) पूरी करें।',
      icon: '⚡',
      category: 'streak' as const,
      currentValue: overall.learningStreakDays,
      targetValue: 30,
      isUnlocked: overall.learningStreakDays >= 30,
    },
  ];

  const evaluated: AchievementItem[] = rawBadges.map((b) => {
    let unlockedAt: string | null = null;
    if (b.isUnlocked) {
      if (meta[b.id]?.unlockedAt) {
        unlockedAt = meta[b.id].unlockedAt;
      } else {
        unlockedAt = new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'short', day: 'numeric' });
        meta[b.id] = { unlockedAt };
        updatedMeta = true;
      }
    }

    const progressPercent = Math.min(100, Math.round((b.currentValue / b.targetValue) * 100));

    return {
      id: b.id,
      title: b.title,
      description: b.description,
      requirement: b.requirement,
      icon: b.icon,
      category: b.category,
      isUnlocked: b.isUnlocked,
      unlockedAt,
      currentValue: b.currentValue,
      targetValue: b.targetValue,
      progressPercent,
    };
  });

  if (updatedMeta) {
    saveStoredAchievementMeta(meta);
  }

  return evaluated;
}

// --------------------------------------------------------
// 7. Personal Milestones
// --------------------------------------------------------
interface StoredMilestonesMap {
  [id: string]: {
    achievedAt: string;
    value?: string | number;
  };
}

function getStoredMilestonesMap(): StoredMilestonesMap {
  const raw = safeGet(MILESTONES_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStoredMilestonesMap(map: StoredMilestonesMap): void {
  safeSet(MILESTONES_KEY, JSON.stringify(map));
}

export function getPersonalMilestones(): MilestoneRecord[] {
  const overall = calculateOverallProgress();
  const stored = getStoredMilestonesMap();
  let updated = false;

  const definitions = [
    {
      id: 'milestone-first-quiz',
      title: 'पहला क्विज़ संपन्न (First Quiz Completed)',
      description: 'ExamSetu4U पर अपना पहला आधिकारिक क्विज़ टेस्ट दिया।',
      icon: '🏁',
      badgeText: 'First Quiz',
      isAchieved: overall.quizzesCompleted >= 1,
    },
    {
      id: 'milestone-first-topic',
      title: 'पहला अध्याय पूर्ण (First Topic Completed)',
      description: 'पाठ्यक्रम के पहले विषय का अध्ययन पूरा किया।',
      icon: '📖',
      badgeText: 'Topic 1',
      isAchieved: overall.studyMaterialsCompleted >= 1,
    },
    {
      id: 'milestone-first-pyq',
      title: 'पहला PYQ हल किया (First PYQ Attempted)',
      description: 'विगत वर्ष परीक्षा प्रश्न का पहला अभ्यास किया।',
      icon: '📝',
      badgeText: 'First PYQ',
      isAchieved: overall.pyqsAttempted >= 1,
    },
    {
      id: 'milestone-100-q',
      title: '100 प्रश्न हल (100 Questions Attempted)',
      description: 'प्रश्नोत्तरी और विगत वर्ष प्रश्नों का शतक पूरा किया।',
      icon: '💯',
      badgeText: '100 Solved',
      isAchieved: overall.totalQuestionsAttempted >= 100,
    },
    {
      id: 'milestone-500-q',
      title: '500 प्रश्न मील का पत्थर (500 Questions Milestone)',
      description: 'गहन अभ्यास में 500 प्रश्नों का लैंडमार्क पार किया।',
      icon: '🎖️',
      badgeText: '500 Solved',
      isAchieved: overall.totalQuestionsAttempted >= 500,
    },
    {
      id: 'milestone-7-streak',
      title: '7 दिवसीय अध्ययन लकीर (7-Day Streak)',
      description: 'लगातार 7 दिनों तक बिना नागा अध्ययन किया।',
      icon: '🔥',
      badgeText: '7-Day Streak',
      isAchieved: overall.learningStreakDays >= 7,
    },
    {
      id: 'milestone-best-accuracy',
      title: 'सर्वश्रेष्ठ सटीकता (Best Accuracy Achieved)',
      description: overall.overallAccuracy >= 80 ? `समग्र सटीकता ${overall.overallAccuracy}% तक पहुँची।` : '80%+ सटीकता प्राप्त करने का लक्ष्य।',
      icon: '⭐',
      badgeText: `${overall.overallAccuracy}% Accuracy`,
      isAchieved: overall.totalQuestionsAttempted >= 15 && overall.overallAccuracy >= 80,
    },
  ];

  const evaluated: MilestoneRecord[] = definitions.map((m) => {
    let achievedAt: string | null = null;
    if (m.isAchieved) {
      if (stored[m.id]?.achievedAt) {
        achievedAt = stored[m.id].achievedAt;
      } else {
        achievedAt = new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'short', day: 'numeric' });
        stored[m.id] = { achievedAt };
        updated = true;
      }
    }

    return {
      id: m.id,
      title: m.title,
      description: m.description,
      icon: m.icon,
      isAchieved: m.isAchieved,
      achievedAt,
      badgeText: m.badgeText,
    };
  });

  if (updated) {
    saveStoredMilestonesMap(stored);
  }

  return evaluated;
}

export function evaluateAchievementsAndMilestones(): void {
  getAllAchievements();
  getPersonalMilestones();
}

// --------------------------------------------------------
// 8. Deterministic Motivational Insights
// Rules based entirely on actual data without AI/API calls:
// - accuracy improvement
// - strongest subject
// - weakest subject / topic
// - distance to daily goal
// - streak praise
// --------------------------------------------------------
export interface MotivationalInsight {
  id: string;
  type: 'streak' | 'improvement' | 'strength' | 'weakness' | 'goal' | 'general';
  title: string;
  message: string;
  tone: 'primary' | 'success' | 'warning' | 'info';
  actionLabel?: string;
  actionUrl?: string;
}

export function generateMotivationalInsights(examId?: string): MotivationalInsight[] {
  const overall = calculateOverallProgress();
  const daily = getDailyGoalStatus();
  const quizTrend = getQuizPerformanceTrend();
  const subjectStrengths = getSubjectStrengthList(examId);
  const insights: MotivationalInsight[] = [];

  // Rule 1: Daily Goal Distance
  if (daily.isCompleted) {
    insights.push({
      id: 'daily-completed',
      type: 'goal',
      title: 'आज का लक्ष्य पूर्ण! 🎉',
      message: `शानदार! आपने आज के सभी ${daily.targetQuestions} प्रश्नों का लक्ष्य पूरा कर लिया है। अतिरिक्त अभ्यास से इंटेलिजेंट स्कोर और बढ़ेगा।`,
      tone: 'success',
      actionLabel: 'क्विज़ अभ्यास जारी रखें',
      actionUrl: '/quiz',
    });
  } else if (daily.todayQuestionsAttempted > 0) {
    insights.push({
      id: 'daily-remaining',
      type: 'goal',
      title: 'दैनिक लक्ष्य की ओर प्रगति',
      message: `आप आज के लक्ष्य से केवल ${daily.remaining} प्रश्न दूर हैं (${daily.todayQuestionsAttempted}/${daily.targetQuestions} पूर्ण)। इसे आज ही पूरा करें!`,
      tone: 'primary',
      actionLabel: 'शेष प्रश्न हल करें',
      actionUrl: '/quiz',
    });
  } else {
    insights.push({
      id: 'daily-not-started',
      type: 'goal',
      title: 'आज का दैनिक लक्ष्य सेट है',
      message: `आज का लक्ष्य ${daily.targetQuestions} प्रश्न हल करने का है। 10 मिनट का समय निकालें और अभ्यास शुरू करें।`,
      tone: 'info',
      actionLabel: 'पहला प्रश्न हल करें',
      actionUrl: '/quiz',
    });
  }

  // Rule 2: Quiz Trend improvement/decline
  if (quizTrend.hasEnoughData) {
    if (quizTrend.trendDirection === 'improving') {
      insights.push({
        id: 'quiz-improving',
        type: 'improvement',
        title: 'सटीकता में सकारात्मक सुधार 📈',
        message: `आपकी हालिया क्विज़ सटीकता में पहले के प्रयासों की तुलना में +${quizTrend.trendDiffPercentage}% का सुधार देखा गया है। बहुत बढ़िया!`,
        tone: 'success',
        actionLabel: 'प्रगति ट्रेंड देखें',
        actionUrl: '/analytics',
      });
    } else if (quizTrend.trendDirection === 'declining') {
      insights.push({
        id: 'quiz-declining',
        type: 'improvement',
        title: 'पुनरावृत्ति (Revision) की सलाह',
        message: 'हालिया क्विज़ में स्कोर में थोड़ा उतार देखा गया है। कठिन विषयों के थ्योरी नोट्स दोहराने से सटीकता फिर से सुधरेगी।',
        tone: 'warning',
        actionLabel: 'नोट्स पढ़ें',
        actionUrl: '/study-material',
      });
    }
  }

  // Rule 3: Strongest Subject
  const strongSubjects = subjectStrengths.filter((s) => s.questionsAttempted >= 5 && s.accuracy >= 75);
  if (strongSubjects.length > 0) {
    strongSubjects.sort((a, b) => b.accuracy - a.accuracy);
    const strongest = strongSubjects[0];
    insights.push({
      id: 'strongest-subject',
      type: 'strength',
      title: `सशक्त विषय: ${strongest.subjectName}`,
      message: `${strongest.subjectName} में आपकी सटीकता ${strongest.accuracy}% है (${strongest.questionsCorrect}/${strongest.questionsAttempted} सही)। इस बढ़त को बनाए रखें!`,
      tone: 'success',
      actionLabel: 'विषय देखें',
      actionUrl: strongest.url,
    });
  }

  // Rule 4: Weakest Subject needing improvement
  const weakSubjects = subjectStrengths.filter((s) => s.questionsAttempted >= 3 && s.accuracy < 60);
  if (weakSubjects.length > 0) {
    weakSubjects.sort((a, b) => a.accuracy - b.accuracy);
    const weakest = weakSubjects[0];
    insights.push({
      id: 'weakest-subject',
      type: 'weakness',
      title: `सुधार क्षेत्र: ${weakest.subjectName}`,
      message: `${weakest.subjectName} में आपकी सटीकता ${weakest.accuracy}% है। संकल्पनाओं को स्पष्ट करने के लिए नोट्स पढ़ें और PYQ हल करें।`,
      tone: 'warning',
      actionLabel: 'कमजोर विषय का अभ्यास करें',
      actionUrl: weakest.quizUrl,
    });
  }

  // Rule 5: Learning Streak
  if (overall.learningStreakDays >= 3) {
    insights.push({
      id: 'streak-praise',
      type: 'streak',
      title: `${overall.learningStreakDays} दिवसीय निरंतर अध्ययन 🔥`,
      message: `शानदार अनुशासन! आपने लगातार ${overall.learningStreakDays} दिनों की अध्ययन लकीर कायम रखी है। निरंतरता ही चयन की कुंजी है।`,
      tone: 'info',
    });
  }

  return insights;
}
