import { exams, getExam, getSubject, getSubjectsForExam, getTopic, getTopicsForSubject, subjects, topics } from '@/data/curriculum';
import { pyqQuestions } from '@/data/pyq';
import type { QuizAttemptResult } from '@/data/quiz/types';
import { loadQuizHistory } from '@/lib/quiz-storage';

export const USER_PROGRESS_KEY = 'examsetu4u_progress';
const LEGACY_TOPIC_PROGRESS_KEY = 'examsetu4u-module-2-progress';
const LEGACY_BOOKMARKS_KEY = 'examsetu4u-study-bookmarks';
const LEGACY_READING_PROGRESS_KEY = 'examsetu4u-study-reading-progress';
const LEGACY_PYQ_PROGRESS_KEY = 'examsetu4u-module-4-pyq-progress';

export interface ActivityItem {
  id: string;
  type: 'quiz' | 'pyq' | 'study' | 'bookmark';
  title: string;
  subtitle: string;
  timestamp: string;
  url: string;
  scoreText?: string;
  badgeTone?: 'primary' | 'success' | 'warning' | 'info';
}

export interface ContinueLearningItem {
  topicId: string;
  subjectId: string;
  examId: string;
  examName: string;
  subjectName: string;
  topicName: string;
  type: 'study' | 'quiz' | 'pyq';
  progress: number;
  lastVisited: string;
  url: string;
}

export interface WeakAreaItem {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  examId: string;
  examName: string;
  accuracy: number;
  incorrectCount: number;
  practiceUrl: string;
}

export interface SubjectProgressDetails {
  subjectId: string;
  subjectName: string;
  examId: string;
  status: 'Not Started' | 'In Progress' | 'Strong' | 'Completed';
  overallPercent: number;
  studyMaterialPercent: number;
  pyqPercent: number;
  quizPercent: number;
  totalTopics: number;
  completedTopics: number;
}

export interface ExamProgressDetails {
  examId: string;
  examName: string;
  overallPercentage: number;
  subjectsStarted: number;
  subjectsCompleted: number;
  totalSubjects: number;
  studyMaterialCompletion: number;
  pyqPerformance: number;
  quizPerformance: number;
  questionsAttempted: number;
  questionsCorrect: number;
  accuracy: number;
}

export interface OverallProgressSummary {
  overallPercentage: number;
  studyMaterialsCompleted: number;
  totalStudyMaterials: number;
  studyCompletionPercent: number;
  pyqsAttempted: number;
  pyqsCorrect: number;
  pyqAccuracy: number;
  quizzesStarted: number;
  quizzesCompleted: number;
  quizQuestionsAttempted: number;
  quizQuestionsCorrect: number;
  quizAccuracy: number;
  quizBestScore: number;
  quizAverageScore: number;
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  overallAccuracy: number;
  learningStreakDays: number;
}

export interface IntelligentScoreResult {
  score: number;
  isBuilding: boolean;
  buildingProgress: number; // 0 to 100
  statusMessage: string;
  tier: 'Foundational' | 'Developing' | 'Strong' | 'Exam Ready' | 'Score Building';
  tierLabel: string;
  feedback: string;
  breakdown: {
    studyMaterialScore: number; // max 20
    pyqScore: number;           // max 25
    quizScore: number;          // max 30
    topicCoverageScore: number; // max 15
    consistencyScore: number;   // max 10
  };
  metrics: {
    studyMaterialPercent: number;
    pyqAccuracy: number;
    quizAccuracy: number;
    topicCoveragePercent: number;
    activeDays: number;
  };
}

export interface ExtendedProgressStore {
  activities: ActivityItem[];
  continueLearning: ContinueLearningItem | null;
  lastActiveTimestamp: string;
  streakCount: number;
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
  } catch {}
}

export function loadExtendedProgress(): ExtendedProgressStore {
  const raw = safeGet(USER_PROGRESS_KEY);
  if (!raw) {
    return {
      activities: [],
      continueLearning: null,
      lastActiveTimestamp: new Date().toISOString(),
      streakCount: 1,
    };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      continueLearning: parsed.continueLearning || null,
      lastActiveTimestamp: parsed.lastActiveTimestamp || new Date().toISOString(),
      streakCount: typeof parsed.streakCount === 'number' ? parsed.streakCount : 1,
    };
  } catch {
    return {
      activities: [],
      continueLearning: null,
      lastActiveTimestamp: new Date().toISOString(),
      streakCount: 1,
    };
  }
}

export function saveExtendedProgress(store: ExtendedProgressStore): void {
  safeSet(USER_PROGRESS_KEY, JSON.stringify(store));
}

// Helper to log user activity
export function logActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): void {
  const store = loadExtendedProgress();
  const newItem: ActivityItem = {
    ...activity,
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  const updatedActivities = [newItem, ...store.activities.filter((a) => a.url !== activity.url || a.type !== activity.type)].slice(0, 30);
  
  saveExtendedProgress({
    ...store,
    activities: updatedActivities,
    lastActiveTimestamp: new Date().toISOString(),
  });
}

// 1. Record Study Progress
export function recordStudyProgress(topicId: string, percent: number): void {
  const topic = getTopic(topicId);
  if (!topic) return;

  // Update legacy topic progress map
  try {
    const raw = safeGet(LEGACY_TOPIC_PROGRESS_KEY) ?? '{}';
    const progressMap = JSON.parse(raw);
    progressMap[topicId] = Math.max(0, Math.min(100, Math.round(percent)));
    safeSet(LEGACY_TOPIC_PROGRESS_KEY, JSON.stringify(progressMap));
  } catch {}

  const exam = getExam(topic.examId);
  const subject = getSubject(topic.subjectId);

  // Update continue learning
  const store = loadExtendedProgress();
  const continueItem: ContinueLearningItem = {
    topicId,
    subjectId: topic.subjectId,
    examId: topic.examId,
    examName: exam?.name || 'ExamSetu4U',
    subjectName: subject?.name || 'Subject',
    topicName: topic.name,
    type: 'study',
    progress: percent,
    lastVisited: new Date().toISOString(),
    url: `/study-material/${topic.examId}/${topic.subjectId}/${topic.id}`,
  };

  store.continueLearning = continueItem;
  saveExtendedProgress(store);

  // Log activity
  if (percent >= 100) {
    logActivity({
      type: 'study',
      title: `अध्याय पूरा किया: ${topic.name}`,
      subtitle: `${exam?.name || ''} • ${subject?.name || ''}`,
      url: continueItem.url,
      scoreText: '100% Complete',
      badgeTone: 'success',
    });
  } else if (percent > 0) {
    logActivity({
      type: 'study',
      title: `अध्ययन सामग्री पढ़ी: ${topic.name}`,
      subtitle: `${exam?.name || ''} • ${subject?.name || ''}`,
      url: continueItem.url,
      scoreText: `${Math.round(percent)}% पढ़ा`,
      badgeTone: 'info',
    });
  }
}

// 2. Record PYQ Attempt
export function recordPYQAttempt(
  questionId: string,
  examId: string,
  subjectId: string,
  topicId: string,
  isCorrect: boolean
): void {
  // Update legacy PYQ progress map
  try {
    const raw = safeGet(LEGACY_PYQ_PROGRESS_KEY) ?? '{}';
    const map = JSON.parse(raw);
    const prev = map[questionId] || { viewed: true, answered: 0, correct: 0, incorrect: 0 };
    map[questionId] = {
      viewed: true,
      answered: prev.answered + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
    };
    safeSet(LEGACY_PYQ_PROGRESS_KEY, JSON.stringify(map));
  } catch {}

  // Update daily activity tracking
  try {
    const today = new Date().toISOString().slice(0, 10);
    const rawDaily = safeGet('examsetu4u_daily_activity') ?? '{}';
    const dailyMap = JSON.parse(rawDaily);
    const todayEntry = dailyMap[today] || { questionsAttempted: 0, questionsCorrect: 0, quizzesCompleted: 0, pyqsAttempted: 0 };
    todayEntry.questionsAttempted += 1;
    if (isCorrect) todayEntry.questionsCorrect += 1;
    todayEntry.pyqsAttempted += 1;
    dailyMap[today] = todayEntry;
    safeSet('examsetu4u_daily_activity', JSON.stringify(dailyMap));
  } catch {}

  const topic = getTopic(topicId);
  const exam = getExam(examId);
  const subject = getSubject(subjectId);

  // Update continue learning
  const store = loadExtendedProgress();
  store.continueLearning = {
    topicId,
    subjectId,
    examId,
    examName: exam?.name || 'Exam',
    subjectName: subject?.name || 'Subject',
    topicName: topic?.name || 'PYQ Practice',
    type: 'pyq',
    progress: 50,
    lastVisited: new Date().toISOString(),
    url: `/pyq/${examId}/${subjectId}/${topicId}`,
  };
  saveExtendedProgress(store);

  // Log activity
  logActivity({
    type: 'pyq',
    title: `PYQ प्रश्न हल किया: ${topic?.name || 'PYQ Practice'}`,
    subtitle: `${exam?.name || ''} • ${subject?.name || ''}`,
    url: `/pyq/${examId}/${subjectId}/${topicId}`,
    scoreText: isCorrect ? 'सही उत्तर' : 'समीक्षा आवश्यक',
    badgeTone: isCorrect ? 'success' : 'warning',
  });
}

// 3. Record Quiz Attempt
export function recordQuizAttempt(result: QuizAttemptResult): void {
  const store = loadExtendedProgress();
  
  // Set continue learning to quiz
  store.continueLearning = {
    topicId: result.topicId || '',
    subjectId: result.subjectId || '',
    examId: result.examId || '',
    examName: result.examName || 'Quiz',
    subjectName: result.subjectName || 'Subject',
    topicName: result.topicName || 'MCQ Practice',
    type: 'quiz',
    progress: result.percentage,
    lastVisited: new Date().toISOString(),
    url: result.topicId && result.subjectId && result.examId
      ? `/quiz/${result.examId}/${result.subjectId}/${result.topicId}`
      : '/quiz',
  };
  saveExtendedProgress(store);

  // Update daily activity tracking
  try {
    const today = new Date().toISOString().slice(0, 10);
    const rawDaily = safeGet('examsetu4u_daily_activity') ?? '{}';
    const dailyMap = JSON.parse(rawDaily);
    const todayEntry = dailyMap[today] || { questionsAttempted: 0, questionsCorrect: 0, quizzesCompleted: 0, pyqsAttempted: 0 };
    todayEntry.questionsAttempted += result.attempted;
    todayEntry.questionsCorrect += result.correct;
    todayEntry.quizzesCompleted += 1;
    dailyMap[today] = todayEntry;
    safeSet('examsetu4u_daily_activity', JSON.stringify(dailyMap));
  } catch {}

  // Log activity
  logActivity({
    type: 'quiz',
    title: `MCQ Quiz संपन्न: ${result.topicName}`,
    subtitle: `${result.examName} • ${result.subjectName}`,
    url: store.continueLearning.url,
    scoreText: `${result.score}/${result.totalQuestions} (${result.percentage}%)`,
    badgeTone: result.percentage >= 70 ? 'success' : result.percentage >= 40 ? 'warning' : 'primary',
  });
}

// Helper: read raw progress maps
export function getLegacyTopicProgressMap(): Record<string, number> {
  try {
    const raw = safeGet(LEGACY_TOPIC_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getLegacyPYQProgressMap(): Record<string, { viewed: boolean; answered: number; correct: number; incorrect: number }> {
  try {
    const raw = safeGet(LEGACY_PYQ_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// 4. Calculate Subject Progress
export function calculateSubjectProgress(subjectId: string): SubjectProgressDetails {
  const subject = getSubject(subjectId);
  if (!subject) {
    return {
      subjectId,
      subjectName: 'Unknown',
      examId: '',
      status: 'Not Started',
      overallPercent: 0,
      studyMaterialPercent: 0,
      pyqPercent: 0,
      quizPercent: 0,
      totalTopics: 0,
      completedTopics: 0,
    };
  }

  const topicList = getTopicsForSubject(subjectId);
  const topicMap = getLegacyTopicProgressMap();
  const pyqMap = getLegacyPYQProgressMap();
  const quizHistory = loadQuizHistory();

  if (topicList.length === 0) {
    return {
      subjectId,
      subjectName: subject.name,
      examId: subject.examId,
      status: 'Not Started',
      overallPercent: 0,
      studyMaterialPercent: 0,
      pyqPercent: 0,
      quizPercent: 0,
      totalTopics: 0,
      completedTopics: 0,
    };
  }

  let completedCount = 0;
  let totalStudyPercent = 0;

  topicList.forEach((t) => {
    const p = topicMap[t.id] ?? 0;
    if (p >= 80) completedCount++;
    totalStudyPercent += p;
  });

  const studyMaterialPercent = Math.round(totalStudyPercent / topicList.length);

  // Subject PYQ performance
  const subjectPYQs = pyqQuestions.filter((q) => q.metadata.subjectId === subjectId);
  let pyqAttempted = 0;
  let pyqCorrect = 0;
  subjectPYQs.forEach((q) => {
    const record = pyqMap[q.id];
    if (record && record.answered > 0) {
      pyqAttempted += record.answered;
      pyqCorrect += record.correct;
    }
  });
  const pyqPercent = pyqAttempted > 0 ? Math.round((pyqCorrect / pyqAttempted) * 100) : 0;

  // Subject Quiz performance
  const subjectQuizzes = quizHistory.filter((q) => q.subjectId === subjectId);
  let quizPercent = 0;
  if (subjectQuizzes.length > 0) {
    const totalQuizScore = subjectQuizzes.reduce((acc, q) => acc + q.percentage, 0);
    quizPercent = Math.round(totalQuizScore / subjectQuizzes.length);
  }

  // Combined weighted progress
  // If no quizzes/pyqs exist yet, rely on study materials
  let overallPercent = studyMaterialPercent;
  if (pyqAttempted > 0 && subjectQuizzes.length > 0) {
    overallPercent = Math.round(studyMaterialPercent * 0.4 + pyqPercent * 0.3 + quizPercent * 0.3);
  } else if (pyqAttempted > 0) {
    overallPercent = Math.round(studyMaterialPercent * 0.5 + pyqPercent * 0.5);
  } else if (subjectQuizzes.length > 0) {
    overallPercent = Math.round(studyMaterialPercent * 0.5 + quizPercent * 0.5);
  }

  overallPercent = Math.max(0, Math.min(100, overallPercent));

  let status: SubjectProgressDetails['status'] = 'Not Started';
  if (overallPercent >= 100 || (completedCount === topicList.length && topicList.length > 0)) {
    status = 'Completed';
  } else if (overallPercent >= 70) {
    status = 'Strong';
  } else if (overallPercent > 0 || pyqAttempted > 0 || subjectQuizzes.length > 0) {
    status = 'In Progress';
  }

  return {
    subjectId,
    subjectName: subject.name,
    examId: subject.examId,
    status,
    overallPercent,
    studyMaterialPercent,
    pyqPercent,
    quizPercent,
    totalTopics: topicList.length,
    completedTopics: completedCount,
  };
}

// 5. Calculate Exam Progress for all 8 exams
export function calculateExamProgress(examId: string): ExamProgressDetails {
  const exam = getExam(examId);
  const examSubjects = getSubjectsForExam(examId);

  if (!exam || examSubjects.length === 0) {
    return {
      examId,
      examName: exam?.name || examId,
      overallPercentage: 0,
      subjectsStarted: 0,
      subjectsCompleted: 0,
      totalSubjects: 0,
      studyMaterialCompletion: 0,
      pyqPerformance: 0,
      quizPerformance: 0,
      questionsAttempted: 0,
      questionsCorrect: 0,
      accuracy: 0,
    };
  }

  let subjectsStarted = 0;
  let subjectsCompleted = 0;
  let totalStudyPercent = 0;
  let totalPyqAttempted = 0;
  let totalPyqCorrect = 0;

  const pyqMap = getLegacyPYQProgressMap();
  const quizHistory = loadQuizHistory().filter((q) => q.examId === examId);

  examSubjects.forEach((subj) => {
    const subjProgress = calculateSubjectProgress(subj.id);
    totalStudyPercent += subjProgress.studyMaterialPercent;
    if (subjProgress.status !== 'Not Started') subjectsStarted++;
    if (subjProgress.status === 'Completed') subjectsCompleted++;
  });

  // Calculate PYQs for this exam
  const examPYQs = pyqQuestions.filter((q) => q.metadata.examId === examId);
  examPYQs.forEach((q) => {
    const record = pyqMap[q.id];
    if (record && record.answered > 0) {
      totalPyqAttempted += record.answered;
      totalPyqCorrect += record.correct;
    }
  });

  // Quiz stats for this exam
  let totalQuizAttempted = 0;
  let totalQuizCorrect = 0;
  let quizPercentTotal = 0;

  quizHistory.forEach((q) => {
    totalQuizAttempted += q.attempted;
    totalQuizCorrect += q.correct;
    quizPercentTotal += q.percentage;
  });

  const studyMaterialCompletion = Math.round(totalStudyPercent / examSubjects.length);
  const pyqPerformance = totalPyqAttempted > 0 ? Math.round((totalPyqCorrect / totalPyqAttempted) * 100) : 0;
  const quizPerformance = quizHistory.length > 0 ? Math.round(quizPercentTotal / quizHistory.length) : 0;

  const questionsAttempted = totalPyqAttempted + totalQuizAttempted;
  const questionsCorrect = totalPyqCorrect + totalQuizCorrect;
  const accuracy = questionsAttempted > 0 ? Math.round((questionsCorrect / questionsAttempted) * 100) : 0;

  // Blended overall percentage
  let overallPercentage = studyMaterialCompletion;
  if (totalPyqAttempted > 0 && quizHistory.length > 0) {
    overallPercentage = Math.round(studyMaterialCompletion * 0.4 + pyqPerformance * 0.3 + quizPerformance * 0.3);
  } else if (totalPyqAttempted > 0) {
    overallPercentage = Math.round(studyMaterialCompletion * 0.5 + pyqPerformance * 0.5);
  } else if (quizHistory.length > 0) {
    overallPercentage = Math.round(studyMaterialCompletion * 0.5 + quizPerformance * 0.5);
  }

  return {
    examId,
    examName: exam.name,
    overallPercentage: Math.max(0, Math.min(100, overallPercentage)),
    subjectsStarted,
    subjectsCompleted,
    totalSubjects: examSubjects.length,
    studyMaterialCompletion,
    pyqPerformance,
    quizPerformance,
    questionsAttempted,
    questionsCorrect,
    accuracy,
  };
}

// 6. Calculate Overall Progress
export function calculateOverallProgress(): OverallProgressSummary {
  const topicMap = getLegacyTopicProgressMap();
  const pyqMap = getLegacyPYQProgressMap();
  const quizHistory = loadQuizHistory();

  let completedTopicsCount = 0;
  let totalStudyPercent = 0;

  topics.forEach((t) => {
    const p = topicMap[t.id] ?? 0;
    if (p >= 80) completedTopicsCount++;
    totalStudyPercent += p;
  });

  const studyCompletionPercent = topics.length > 0 ? Math.round(totalStudyPercent / topics.length) : 0;

  // PYQ aggregation
  let pyqAttempted = 0;
  let pyqCorrect = 0;
  Object.values(pyqMap).forEach((rec) => {
    pyqAttempted += rec.answered || 0;
    pyqCorrect += rec.correct || 0;
  });
  const pyqAccuracy = pyqAttempted > 0 ? Math.round((pyqCorrect / pyqAttempted) * 100) : 0;

  // Quiz aggregation
  let quizQuestionsAttempted = 0;
  let quizQuestionsCorrect = 0;
  let bestScore = 0;
  let totalPercentageSum = 0;

  quizHistory.forEach((q) => {
    quizQuestionsAttempted += q.attempted;
    quizQuestionsCorrect += q.correct;
    totalPercentageSum += q.percentage;
    if (q.percentage > bestScore) bestScore = q.percentage;
  });

  const quizAccuracy = quizQuestionsAttempted > 0 ? Math.round((quizQuestionsCorrect / quizQuestionsAttempted) * 100) : 0;
  const quizAverageScore = quizHistory.length > 0 ? Math.round(totalPercentageSum / quizHistory.length) : 0;

  const totalQuestionsAttempted = pyqAttempted + quizQuestionsAttempted;
  const totalQuestionsCorrect = pyqCorrect + quizQuestionsCorrect;
  const overallAccuracy = totalQuestionsAttempted > 0 ? Math.round((totalQuestionsCorrect / totalQuestionsAttempted) * 100) : 0;

  // Blended overall percentage
  let overallPercentage = studyCompletionPercent;
  if (totalQuestionsAttempted > 0) {
    overallPercentage = Math.round(studyCompletionPercent * 0.4 + overallAccuracy * 0.6);
  }

  const store = loadExtendedProgress();

  return {
    overallPercentage: Math.max(0, Math.min(100, overallPercentage)),
    studyMaterialsCompleted: completedTopicsCount,
    totalStudyMaterials: topics.length,
    studyCompletionPercent,
    pyqsAttempted: pyqAttempted,
    pyqsCorrect: pyqCorrect,
    pyqAccuracy,
    quizzesStarted: quizHistory.length,
    quizzesCompleted: quizHistory.length,
    quizQuestionsAttempted,
    quizQuestionsCorrect,
    quizAccuracy,
    quizBestScore: bestScore,
    quizAverageScore,
    totalQuestionsAttempted,
    totalQuestionsCorrect,
    overallAccuracy,
    learningStreakDays: store.streakCount || 1,
  };
}

// 7. Calculate Motivating Intelligent Score
export function calculateIntelligentScore(preferredExamId = 'super-tet'): IntelligentScoreResult {
  const overall = calculateOverallProgress();
  const examProgress = calculateExamProgress(preferredExamId);

  // Criteria for sufficient data:
  // Must have attempted at least 5 total questions (quiz + pyq) OR completed at least 2 study topics
  const totalActivityCount = overall.totalQuestionsAttempted;
  const topicsCompletedCount = overall.studyMaterialsCompleted;
  const minQuestionsRequired = 5;

  if (totalActivityCount < minQuestionsRequired && topicsCompletedCount < 2) {
    const progressTowardUnlock = Math.round(
      Math.min(100, (totalActivityCount / minQuestionsRequired) * 80 + (topicsCompletedCount / 2) * 20)
    );

    return {
      score: 0,
      isBuilding: true,
      buildingProgress: progressTowardUnlock,
      statusMessage: 'Score building...',
      tier: 'Score Building',
      tierLabel: 'स्कोर तैयार हो रहा है (Building)',
      feedback: 'अधिक क्विज़ और PYQ प्रश्नों को हल करें ताकि आपका विश्वसनीय Intelligent Score जनरेट हो सके।',
      breakdown: {
        studyMaterialScore: 0,
        pyqScore: 0,
        quizScore: 0,
        topicCoverageScore: 0,
        consistencyScore: 0,
      },
      metrics: {
        studyMaterialPercent: overall.studyCompletionPercent,
        pyqAccuracy: overall.pyqAccuracy,
        quizAccuracy: overall.quizAccuracy,
        topicCoveragePercent: Math.round((overall.studyMaterialsCompleted / Math.max(1, overall.totalStudyMaterials)) * 100),
        activeDays: overall.learningStreakDays,
      },
    };
  }

  // Multi-factor weighted formula (as requested):
  // 1. Study Material Completion = 20%
  // 2. PYQ Performance = 25%
  // 3. Quiz Accuracy = 30%
  // 4. Topic Coverage = 15%
  // 5. Consistency / Activity = 10%

  // Factor 1: Study Material (20%)
  const studyRatio = Math.min(100, Math.max(overall.studyCompletionPercent, examProgress.studyMaterialCompletion));
  const studyMaterialScore = Math.round((studyRatio / 100) * 20 * 10) / 10;

  // Factor 2: PYQ Performance (25%)
  const pyqEffectiveAccuracy = overall.pyqsAttempted > 0 ? overall.pyqAccuracy : (overall.quizAccuracy || 60);
  const pyqScore = Math.round((pyqEffectiveAccuracy / 100) * 25 * 10) / 10;

  // Factor 3: Quiz Accuracy (30%)
  const quizEffectiveAccuracy = overall.quizQuestionsAttempted > 0 ? overall.quizAccuracy : (overall.pyqAccuracy || 60);
  const quizScore = Math.round((quizEffectiveAccuracy / 100) * 30 * 10) / 10;

  // Factor 4: Topic Coverage (15%)
  const coverageRatio = Math.min(100, (overall.studyMaterialsCompleted / 8) * 100);
  const topicCoverageScore = Math.round((coverageRatio / 100) * 15 * 10) / 10;

  // Factor 5: Consistency / Activity (10%)
  const streakRatio = Math.min(100, (overall.learningStreakDays / 7) * 100);
  const consistencyScore = Math.round((streakRatio / 100) * 10 * 10) / 10;

  const rawScore = studyMaterialScore + pyqScore + quizScore + topicCoverageScore + consistencyScore;
  const finalScore = Math.min(100, Math.max(1, Math.round(rawScore)));

  let tier: IntelligentScoreResult['tier'] = 'Foundational';
  let tierLabel = 'आरंभिक स्तर (Foundational)';
  let feedback = 'नियमित अभ्यास शुरू करें। बुनियादी संकल्पनाओं को मजबूत करने के लिए नोट्स पढ़ें।';

  if (finalScore >= 85) {
    tier = 'Exam Ready';
    tierLabel = 'उत्कृष्ट तैयारी (Exam Ready)';
    feedback = 'शानदार प्रदर्शन! आपकी सटीकता और विषय कवरेज परीक्षा के लिए उत्कृष्ट स्तर पर है।';
  } else if (finalScore >= 70) {
    tier = 'Strong';
    tierLabel = 'सशक्त तैयारी (Strong Momentum)';
    feedback = 'बहुत अच्छी प्रगति! कठिन प्रश्नों के अभ्यास और रिवीजन से आप 90+ स्कोर हासिल कर सकते हैं।';
  } else if (finalScore >= 50) {
    tier = 'Developing';
    tierLabel = 'विकासशील (Developing)';
    feedback = 'आपकी तैयारी सही दिशा में है। कमजोर विषयों पर थोड़े और क्विज़ दें।';
  }

  return {
    score: finalScore,
    isBuilding: false,
    buildingProgress: 100,
    statusMessage: `${finalScore}/100 Intelligent Score`,
    tier,
    tierLabel,
    feedback,
    breakdown: {
      studyMaterialScore,
      pyqScore,
      quizScore,
      topicCoverageScore,
      consistencyScore,
    },
    metrics: {
      studyMaterialPercent: Math.round(studyRatio),
      pyqAccuracy: Math.round(pyqEffectiveAccuracy),
      quizAccuracy: Math.round(quizEffectiveAccuracy),
      topicCoveragePercent: Math.round(coverageRatio),
      activeDays: overall.learningStreakDays,
    },
  };
}

// 8. Get Recent Activities
export function getRecentActivities(): ActivityItem[] {
  const store = loadExtendedProgress();
  if (store.activities.length > 0) {
    return store.activities;
  }

  // Fallback to recent quiz history if no logged activities
  const quizzes = loadQuizHistory();
  if (quizzes.length > 0) {
    return quizzes.slice(0, 5).map((q) => ({
      id: q.attemptId,
      type: 'quiz',
      title: `MCQ Quiz: ${q.topicName}`,
      subtitle: `${q.examName} • ${q.subjectName}`,
      timestamp: q.date,
      url: `/quiz`,
      scoreText: `${q.score}/${q.totalQuestions} (${q.percentage}%)`,
      badgeTone: q.percentage >= 70 ? 'success' : 'primary',
    }));
  }

  return [];
}

// 9. Get Weak Areas
export function getWeakAreas(): WeakAreaItem[] {
  const quizHistory = loadQuizHistory();
  const pyqMap = getLegacyPYQProgressMap();
  const weakMap = new Map<string, WeakAreaItem>();

  // Extract from quiz history
  quizHistory.forEach((q) => {
    if (q.accuracy < 60 || q.incorrect > 0) {
      const topic = q.topicId ? getTopic(q.topicId) : undefined;
      const topicName = topic?.name || q.topicName;
      const key = q.topicId || q.topicName;
      
      const existing = weakMap.get(key);
      const totalIncorrect = (existing?.incorrectCount || 0) + q.incorrect;
      const avgAccuracy = existing ? Math.round((existing.accuracy + q.accuracy) / 2) : q.accuracy;

      weakMap.set(key, {
        topicId: q.topicId || 'generic',
        topicName,
        subjectId: q.subjectId || 'teaching-skills',
        subjectName: q.subjectName,
        examId: q.examId || 'super-tet',
        examName: q.examName,
        accuracy: avgAccuracy,
        incorrectCount: totalIncorrect,
        practiceUrl: q.topicId && q.subjectId && q.examId
          ? `/quiz/${q.examId}/${q.subjectId}/${q.topicId}`
          : '/quiz',
      });
    }
  });

  // Extract from PYQs
  Object.entries(pyqMap).forEach(([qId, rec]) => {
    if (rec.incorrect > 0) {
      const q = pyqQuestions.find((item) => item.id === qId);
      if (q) {
        const topic = getTopic(q.metadata.topicId);
        const subject = getSubject(q.metadata.subjectId);
        const exam = getExam(q.metadata.examId);
        const key = q.metadata.topicId;

        const existing = weakMap.get(key);
        if (existing) {
          existing.incorrectCount += rec.incorrect;
        } else {
          weakMap.set(key, {
            topicId: q.metadata.topicId,
            topicName: topic?.name || 'PYQ Topic',
            subjectId: q.metadata.subjectId,
            subjectName: subject?.name || 'Subject',
            examId: q.metadata.examId,
            examName: exam?.name || 'Exam',
            accuracy: Math.round((rec.correct / Math.max(1, rec.answered)) * 100),
            incorrectCount: rec.incorrect,
            practiceUrl: `/pyq/${q.metadata.examId}/${q.metadata.subjectId}/${q.metadata.topicId}`,
          });
        }
      }
    }
  });

  return Array.from(weakMap.values()).slice(0, 4);
}

// 10. Get Continue Learning
export function getContinueLearning(): ContinueLearningItem | null {
  const store = loadExtendedProgress();
  if (store.continueLearning) {
    return store.continueLearning;
  }

  // Fallback: Super TET teaching skills topic 1
  const defaultTopic = topics.find((t) => t.examId === 'super-tet' && t.availability.studyMaterial);
  if (defaultTopic) {
    const exam = getExam(defaultTopic.examId);
    const subject = getSubject(defaultTopic.subjectId);
    return {
      topicId: defaultTopic.id,
      subjectId: defaultTopic.subjectId,
      examId: defaultTopic.examId,
      examName: exam?.name || 'Super TET',
      subjectName: subject?.name || 'शिक्षण कौशल',
      topicName: defaultTopic.name,
      type: 'study',
      progress: 20,
      lastVisited: new Date().toISOString(),
      url: `/study-material/${defaultTopic.examId}/${defaultTopic.subjectId}/${defaultTopic.id}`,
    };
  }

  return null;
}

// Seed Demo Progress for instantaneous rich demonstration
export function seedDemoProgress(): void {
  // 1. Seed Study Material Topics in Super TET Teaching Skills
  const teachingSkillsTopics = topics.filter((t) => t.subjectId === 'super-tet-teaching-skills');
  const topicMap: Record<string, number> = {};
  if (teachingSkillsTopics[0]) topicMap[teachingSkillsTopics[0].id] = 100;
  if (teachingSkillsTopics[1]) topicMap[teachingSkillsTopics[1].id] = 100;
  if (teachingSkillsTopics[2]) topicMap[teachingSkillsTopics[2].id] = 75;
  if (teachingSkillsTopics[3]) topicMap[teachingSkillsTopics[3].id] = 40;
  safeSet(LEGACY_TOPIC_PROGRESS_KEY, JSON.stringify(topicMap));

  // 2. Seed PYQ answers
  const pyqMap: Record<string, { viewed: boolean; answered: number; correct: number; incorrect: number }> = {};
  pyqQuestions.slice(0, 10).forEach((q, idx) => {
    pyqMap[q.id] = {
      viewed: true,
      answered: 1,
      correct: idx % 4 === 0 ? 0 : 1, // 8 correct, 2 incorrect
      incorrect: idx % 4 === 0 ? 1 : 0,
    };
  });
  safeSet(LEGACY_PYQ_PROGRESS_KEY, JSON.stringify(pyqMap));

  // 3. Seed Quiz Attempts
  const mockQuizAttempts: QuizAttemptResult[] = [
    {
      attemptId: 'demo_quiz_1',
      date: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
      examId: 'super-tet',
      examName: 'Super TET',
      subjectId: 'super-tet-teaching-skills',
      subjectName: 'शिक्षण कौशल',
      topicId: teachingSkillsTopics[0]?.id || 'super-tet-teaching-skills-1',
      topicName: teachingSkillsTopics[0]?.name || 'शिक्षण का अर्थ एवं परिभाषा',
      totalQuestions: 10,
      attempted: 10,
      correct: 8,
      incorrect: 2,
      unanswered: 0,
      markedForReview: 1,
      accuracy: 80,
      score: 8,
      percentage: 80,
      questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'],
      incorrectQuestionIds: ['q2', 'q6'],
      userAnswers: {},
    },
    {
      attemptId: 'demo_quiz_2',
      date: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
      examId: 'super-tet',
      examName: 'Super TET',
      subjectId: 'super-tet-teaching-skills',
      subjectName: 'शिक्षण कौशल',
      topicId: teachingSkillsTopics[1]?.id || 'super-tet-teaching-skills-2',
      topicName: teachingSkillsTopics[1]?.name || 'शिक्षण के उद्देश्य',
      totalQuestions: 15,
      attempted: 15,
      correct: 12,
      incorrect: 3,
      unanswered: 0,
      markedForReview: 2,
      accuracy: 80,
      score: 12,
      percentage: 80,
      questionIds: [],
      incorrectQuestionIds: ['q12', 'q14'],
      userAnswers: {},
    },
  ];
  safeSet('examsetu4u_quiz_history', JSON.stringify(mockQuizAttempts));
  safeSet('examsetu4u_quiz_last_result', JSON.stringify(mockQuizAttempts[0]));

  // 4. Seed Extended Activities & Streak
  const demoStore: ExtendedProgressStore = {
    activities: [
      {
        id: 'act_demo_1',
        type: 'quiz',
        title: 'MCQ Quiz संपन्न: शिक्षण का अर्थ एवं परिभाषा',
        subtitle: 'Super TET • शिक्षण कौशल',
        timestamp: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
        url: `/quiz/super-tet/super-tet-teaching-skills/${teachingSkillsTopics[0]?.id || ''}`,
        scoreText: '8/10 (80%)',
        badgeTone: 'success',
      },
      {
        id: 'act_demo_2',
        type: 'study',
        title: 'अध्याय पूरा किया: शिक्षण का अर्थ एवं परिभाषा',
        subtitle: 'Super TET • शिक्षण कौशल',
        timestamp: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
        url: `/study-material/super-tet/super-tet-teaching-skills/${teachingSkillsTopics[0]?.id || ''}`,
        scoreText: '100% Complete',
        badgeTone: 'success',
      },
      {
        id: 'act_demo_3',
        type: 'pyq',
        title: 'PYQ प्रश्न हल किया: शिक्षण विधियाँ',
        subtitle: 'Super TET • शिक्षण कौशल',
        timestamp: new Date(Date.now() - 3600 * 1000 * 20).toISOString(),
        url: `/pyq/super-tet/super-tet-teaching-skills`,
        scoreText: 'सही उत्तर',
        badgeTone: 'success',
      },
      {
        id: 'act_demo_4',
        type: 'quiz',
        title: 'MCQ Quiz संपन्न: शिक्षण के उद्देश्य',
        subtitle: 'Super TET • शिक्षण कौशल',
        timestamp: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
        url: `/quiz/super-tet/super-tet-teaching-skills/${teachingSkillsTopics[1]?.id || ''}`,
        scoreText: '12/15 (80%)',
        badgeTone: 'success',
      },
    ],
    continueLearning: {
      topicId: teachingSkillsTopics[2]?.id || 'super-tet-teaching-skills-3',
      subjectId: 'super-tet-teaching-skills',
      examId: 'super-tet',
      examName: 'Super TET',
      subjectName: 'शिक्षण कौशल',
      topicName: teachingSkillsTopics[2]?.name || 'शिक्षण के सिद्धांत',
      type: 'study',
      progress: 75,
      lastVisited: new Date().toISOString(),
      url: `/study-material/super-tet/super-tet-teaching-skills/${teachingSkillsTopics[2]?.id || ''}`,
    },
    lastActiveTimestamp: new Date().toISOString(),
    streakCount: 6,
  };
  saveExtendedProgress(demoStore);

  // 5. Seed Daily Activity (15 attempted out of 20 today)
  const today = new Date().toISOString().slice(0, 10);
  const dailyActivity = {
    [today]: {
      questionsAttempted: 15,
      questionsCorrect: 12,
      quizzesCompleted: 1,
      pyqsAttempted: 5,
    },
  };
  safeSet('examsetu4u_daily_activity', JSON.stringify(dailyActivity));
  safeSet('examsetu4u_daily_goal', '20');
  safeSet('examsetu4u_study_time_goal', '30');

  // 6. Seed Sample Achievements
  const unlockedBadges = {
    'first-quiz': { unlockedAt: '2 दिन पहले' },
    'first-topic': { unlockedAt: '3 दिन पहले' },
    'pyq-starter': { unlockedAt: '4 दिन पहले' },
  };
  safeSet('examsetu4u_achievements', JSON.stringify(unlockedBadges));

  // 7. Seed Sample Milestones
  const sampleMilestones = {
    'milestone-first-quiz': { achievedAt: '2 दिन पहले' },
    'milestone-first-topic': { achievedAt: '3 दिन पहले' },
    'milestone-first-pyq': { achievedAt: '4 दिन पहले' },
  };
  safeSet('examsetu4u_milestones', JSON.stringify(sampleMilestones));
}

// Clear all progress data for testing from 0
export function clearAllProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(LEGACY_TOPIC_PROGRESS_KEY);
    window.localStorage.removeItem(LEGACY_BOOKMARKS_KEY);
    window.localStorage.removeItem(LEGACY_READING_PROGRESS_KEY);
    window.localStorage.removeItem(LEGACY_PYQ_PROGRESS_KEY);
    window.localStorage.removeItem(USER_PROGRESS_KEY);
    window.localStorage.removeItem('examsetu4u_quiz_history');
    window.localStorage.removeItem('examsetu4u_quiz_last_result');
    window.localStorage.removeItem('examsetu4u_quiz_incorrect_ids');
    window.localStorage.removeItem('examsetu4u_quiz_active_session');
    window.localStorage.removeItem('examsetu4u_daily_activity');
    window.localStorage.removeItem('examsetu4u_daily_goal');
    window.localStorage.removeItem('examsetu4u_study_time_goal');
    window.localStorage.removeItem('examsetu4u_achievements');
    window.localStorage.removeItem('examsetu4u_milestones');
  } catch {}
}
