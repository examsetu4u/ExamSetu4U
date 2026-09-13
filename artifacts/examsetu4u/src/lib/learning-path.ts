import {
  exams,
  getExam,
  getSubject,
  getSubjectsForExam,
  getTopic,
  getTopicsForSubject,
  Topic,
} from '@/data/curriculum';
import { pyqQuestions } from '@/data/pyq';
import { loadQuizHistory } from '@/lib/quiz-storage';
import {
  calculateIntelligentScore,
  getLegacyPYQProgressMap,
  getLegacyTopicProgressMap,
  getRecentActivities,
  getWeakAreas,
  ActivityItem,
  IntelligentScoreResult,
} from '@/lib/user-progress';
import { getDailyGoalStatus, DailyGoalStatus } from '@/lib/analytics';

export type TopicStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export const TOPIC_STATUS_LABELS: Record<TopicStatus, string> = {
  NOT_STARTED: 'अभी शुरू नहीं किया',
  IN_PROGRESS: 'अध्ययन जारी है',
  COMPLETED: 'पूरा किया गया',
};

export interface TopicStepDetails {
  type: 'study' | 'pyq' | 'quiz';
  title: string;
  isAvailable: boolean;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  actionLabel: string;
  url: string;
}

export interface TopicLearningDetails {
  topic: Topic;
  status: TopicStatus;
  statusLabelHindi: string;
  overallProgress: number;
  studyMaterialProgress: number;
  studyMaterialStatus: 'not_started' | 'in_progress' | 'completed';
  pyqPracticed: boolean;
  pyqAttempted: number;
  pyqCorrect: number;
  pyqAccuracy: number;
  pyqStatus: 'not_started' | 'in_progress' | 'completed';
  quizAttempted: boolean;
  quizAccuracy: number;
  quizBestScore: number;
  quizStatus: 'not_started' | 'in_progress' | 'completed';
  steps: TopicStepDetails[];
  nextAction: {
    type: 'study' | 'pyq' | 'quiz';
    label: string;
    url: string;
    reason: string;
  };
  isComplete: boolean;
}

export interface SubjectProgressStats {
  subjectId: string;
  subjectName: string;
  examId: string;
  totalTopics: number;
  startedTopics: number;
  completedTopics: number;
  completionPercentage: number;
  quizAccuracy: number | null;
  pyqStatus: 'completed' | 'in_progress' | 'not_started';
  studyMaterialStatus: 'completed' | 'in_progress' | 'not_started';
  averageProgress: number;
  topics: TopicLearningDetails[];
}

export interface ExamLearningProgress {
  examId: string;
  examName: string;
  totalSubjects: number;
  subjectsStarted: number;
  subjectsCompleted: number;
  totalTopics: number;
  completedTopics: number;
  totalTopicProgress: number;
  overallPercentage: number;
  intelligentScore: IntelligentScoreResult;
  dailyGoal: DailyGoalStatus;
}

export interface SmartContinueLearningItem {
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  currentActivity: string;
  progress: number;
  recommendedAction: string;
  actionReason: string;
  actionUrl: string;
  priority: number;
  actionType: 'study' | 'pyq' | 'quiz';
}

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

// 1. Get Topic Learning Details with honest completion validation
export function getTopicLearningDetails(topicId: string): TopicLearningDetails | null {
  const topic = getTopic(topicId);
  if (!topic) return null;

  const topicMap = getLegacyTopicProgressMap();
  const pyqMap = getLegacyPYQProgressMap();
  const quizHistory = loadQuizHistory();

  // Study progress: from legacy progress map or reading progress
  const studyProgress = Math.min(100, Math.max(0, topicMap[topic.id] ?? 0));
  const studyStatus: 'not_started' | 'in_progress' | 'completed' =
    studyProgress >= 80 ? 'completed' : studyProgress > 0 ? 'in_progress' : 'not_started';

  // PYQ questions for this topic
  const matchingPYQs = pyqQuestions.filter(
    (q) =>
      q.metadata.topicId === topic.id ||
      q.metadata.topicId === topic.id.replace(`${topic.examId}-`, '')
  );
  let pyqAttempted = 0;
  let pyqCorrect = 0;
  matchingPYQs.forEach((q) => {
    const rec = pyqMap[q.id];
    if (rec && rec.answered > 0) {
      pyqAttempted += rec.answered;
      pyqCorrect += rec.correct;
    }
  });
  const pyqAccuracy = pyqAttempted > 0 ? Math.round((pyqCorrect / pyqAttempted) * 100) : 0;
  const pyqPracticed = pyqAttempted > 0;
  const pyqStatus: 'not_started' | 'in_progress' | 'completed' =
    pyqAttempted >= Math.max(1, Math.min(3, matchingPYQs.length))
      ? 'completed'
      : pyqAttempted > 0
      ? 'in_progress'
      : 'not_started';

  // Quiz attempts for this topic
  const topicQuizzes = quizHistory.filter(
    (q) => q.topicId === topic.id || (q.subjectId === topic.subjectId && q.topicName === topic.name)
  );
  const quizAttempted = topicQuizzes.length > 0;
  let quizAccuracy = 0;
  let quizBestScore = 0;
  if (quizAttempted) {
    const totalAttemptedQ = topicQuizzes.reduce((acc, q) => acc + q.attempted, 0);
    const totalCorrectQ = topicQuizzes.reduce((acc, q) => acc + q.correct, 0);
    quizAccuracy = totalAttemptedQ > 0 ? Math.round((totalCorrectQ / totalAttemptedQ) * 100) : 0;
    quizBestScore = Math.max(...topicQuizzes.map((q) => q.percentage));
  }
  const quizStatus: 'not_started' | 'in_progress' | 'completed' =
    quizAttempted && quizBestScore >= 60
      ? 'completed'
      : quizAttempted
      ? 'in_progress'
      : 'not_started';

  // Available criteria check for honest completion:
  // A topic is truly COMPLETED only when:
  // - If study material available: studyProgress >= 80
  // - If pyq available: pyqPracticed is true
  // - If quiz available: quizAttempted is true and best score >= 50%
  // OR if manual override in topicMap is explicitly 100
  const hasStudyReq = topic.availability.studyMaterial;
  const hasPyqReq = topic.availability.pyq;
  const hasQuizReq = topic.availability.quiz;

  const studySatisfied = !hasStudyReq || studyProgress >= 80;
  const pyqSatisfied = !hasPyqReq || pyqPracticed;
  const quizSatisfied = !hasQuizReq || (quizAttempted && quizBestScore >= 50);

  const isSatisfiedByCriteria = (hasStudyReq || hasPyqReq || hasQuizReq) &&
    studySatisfied && pyqSatisfied && quizSatisfied;

  const isComplete = studyProgress >= 100 || isSatisfiedByCriteria;

  // Calculate balanced topic progress
  let weightedProgress = 0;
  let totalWeights = 0;

  if (hasStudyReq) {
    weightedProgress += (studyProgress / 100) * 40;
    totalWeights += 40;
  }
  if (hasPyqReq) {
    const pyqProg = pyqStatus === 'completed' ? 100 : pyqStatus === 'in_progress' ? 50 : 0;
    weightedProgress += (pyqProg / 100) * 30;
    totalWeights += 30;
  }
  if (hasQuizReq) {
    const quizProg = quizStatus === 'completed' ? 100 : quizStatus === 'in_progress' ? 50 : 0;
    weightedProgress += (quizProg / 100) * 30;
    totalWeights += 30;
  }

  const overallProgress = isComplete
    ? 100
    : totalWeights > 0
    ? Math.min(99, Math.round((weightedProgress / totalWeights) * 100))
    : studyProgress;

  // Status mapping
  let status: TopicStatus = 'NOT_STARTED';
  if (isComplete) {
    status = 'COMPLETED';
  } else if (overallProgress > 0 || studyProgress > 0 || pyqPracticed || quizAttempted) {
    status = 'IN_PROGRESS';
  }

  // Steps
  const steps: TopicStepDetails[] = [
    {
      type: 'study',
      title: 'Study Material',
      isAvailable: topic.availability.studyMaterial,
      status: studyStatus,
      progress: studyProgress,
      actionLabel: studyStatus === 'completed' ? 'दोबारा पढ़ें' : studyStatus === 'in_progress' ? 'जारी रखें' : 'शुरू करें',
      url: `/study-material/${topic.examId}/${topic.subjectId}/${topic.id}`,
    },
    {
      type: 'pyq',
      title: 'PYQ Practice',
      isAvailable: topic.availability.pyq,
      status: pyqStatus,
      progress: pyqStatus === 'completed' ? 100 : pyqAttempted > 0 ? 50 : 0,
      actionLabel: pyqStatus === 'completed' ? 'पुनः अभ्यास करें' : pyqAttempted > 0 ? 'अभ्यास जारी रखें' : 'हल करें',
      url: `/pyq/${topic.examId}/${topic.subjectId}/${topic.id}`,
    },
    {
      type: 'quiz',
      title: 'MCQ Quiz',
      isAvailable: topic.availability.quiz,
      status: quizStatus,
      progress: quizStatus === 'completed' ? 100 : quizAttempted ? 50 : 0,
      actionLabel: quizStatus === 'completed' ? 'दोबारा टेस्ट दें' : quizAttempted ? 'स्कोर सुधारें' : 'टेस्ट शुरू करें',
      url: `/quiz/${topic.examId}/${topic.subjectId}/${topic.id}`,
    },
  ];

  // Determine Next Action
  let nextAction: TopicLearningDetails['nextAction'];
  if (topic.availability.studyMaterial && studyStatus !== 'completed') {
    nextAction = {
      type: 'study',
      label: studyStatus === 'in_progress' ? 'Study Material जारी रखें' : 'Study Material पढ़ें',
      url: `/study-material/${topic.examId}/${topic.subjectId}/${topic.id}`,
      reason: studyStatus === 'in_progress'
        ? 'आपने इस topic का Study Material शुरू किया था। इसे पूरा करें।'
        : 'यह अध्याय प्रारंभ करें और मूलभूत अवधारणाएं समझें।',
    };
  } else if (topic.availability.pyq && pyqStatus !== 'completed') {
    nextAction = {
      type: 'pyq',
      label: pyqStatus === 'in_progress' ? 'PYQ अभ्यास जारी रखें' : 'PYQ हल करें',
      url: `/pyq/${topic.examId}/${topic.subjectId}/${topic.id}`,
      reason: topic.examId === 'ssc-cgl'
        ? 'SSC CGL पिछले वर्षों के वास्तविक MCQ प्रश्नों का अभ्यास करें।'
        : 'Study Material पूरा हो चुका है। अब PYQ हल करें।',
    };
  } else if (topic.availability.quiz && quizStatus !== 'completed') {
    nextAction = {
      type: 'quiz',
      label: quizAttempted ? 'Quiz स्कोर सुधारें' : 'Take Quiz',
      url: `/quiz/${topic.examId}/${topic.subjectId}/${topic.id}`,
      reason: quizAttempted && quizAccuracy < 60
        ? 'आपकी Quiz Accuracy कम है। इस topic की दोबारा Practice करें।'
        : 'पूर्व वर्षों के प्रश्न हल कर चुके हैं। अब टाइमर के साथ Quiz देकर अपनी तैयारी परखें।',
    };
  } else {
    // Topic fully completed
    nextAction = {
      type: 'quiz',
      label: 'पुनरावलोकन (Revision)',
      url: `/exams/${topic.examId}/${topic.subjectId}/${topic.id}`,
      reason: 'यह टॉपिक सफलतापूर्वक पूरा हो गया है। समय-समय पर रिवीज़न करते रहें।',
    };
  }

  return {
    topic,
    status,
    statusLabelHindi: TOPIC_STATUS_LABELS[status],
    overallProgress,
    studyMaterialProgress: studyProgress,
    studyMaterialStatus: studyStatus,
    pyqPracticed,
    pyqAttempted,
    pyqCorrect,
    pyqAccuracy,
    pyqStatus,
    quizAttempted,
    quizAccuracy,
    quizBestScore,
    quizStatus,
    steps,
    nextAction,
    isComplete,
  };
}

// 2. Get Subject Progress Stats
export function getSubjectStats(subjectId: string): SubjectProgressStats | null {
  const subject = getSubject(subjectId);
  if (!subject) return null;

  const subjectTopics = getTopicsForSubject(subjectId);
  const topicDetailsList = subjectTopics
    .map((t) => getTopicLearningDetails(t.id))
    .filter((t): t is TopicLearningDetails => t !== null);

  const totalTopics = subjectTopics.length;
  let startedTopics = 0;
  let completedTopics = 0;
  let sumProgress = 0;

  topicDetailsList.forEach((td) => {
    if (td.status === 'COMPLETED') completedTopics++;
    if (td.status !== 'NOT_STARTED') startedTopics++;
    sumProgress += td.overallProgress;
  });

  const completionPercentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const averageProgress = totalTopics > 0 ? Math.round(sumProgress / totalTopics) : 0;

  // Quiz accuracy for subject
  const quizHistory = loadQuizHistory().filter((q) => q.subjectId === subjectId);
  let quizAccuracy: number | null = null;
  if (quizHistory.length > 0) {
    const totalAttempted = quizHistory.reduce((acc, q) => acc + q.attempted, 0);
    const totalCorrect = quizHistory.reduce((acc, q) => acc + q.correct, 0);
    quizAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : null;
  }

  // Aggregate PYQ & Study Statuses
  const anyStudyStarted = topicDetailsList.some((t) => t.studyMaterialStatus !== 'not_started');
  const allStudyCompleted =
    totalTopics > 0 && topicDetailsList.every((t) => t.studyMaterialStatus === 'completed');
  const studyMaterialStatus = allStudyCompleted
    ? 'completed'
    : anyStudyStarted
    ? 'in_progress'
    : 'not_started';

  const anyPyqStarted = topicDetailsList.some((t) => t.pyqPracticed);
  const allPyqCompleted =
    totalTopics > 0 && topicDetailsList.every((t) => !t.topic.availability.pyq || t.pyqStatus === 'completed');
  const pyqStatus = allPyqCompleted
    ? 'completed'
    : anyPyqStarted
    ? 'in_progress'
    : 'not_started';

  return {
    subjectId,
    subjectName: subject.name,
    examId: subject.examId,
    totalTopics,
    startedTopics,
    completedTopics,
    completionPercentage,
    quizAccuracy,
    pyqStatus,
    studyMaterialStatus,
    averageProgress,
    topics: topicDetailsList,
  };
}

// 3. Get Exam Progress with Module 6 & 7 integration
export function getExamProgress(examId: string): ExamLearningProgress {
  const exam = getExam(examId);
  const subjects = exam ? getSubjectsForExam(exam.id) : [];

  let totalTopics = 0;
  let completedTopics = 0;
  let subjectsStarted = 0;
  let subjectsCompleted = 0;
  let sumTopicProgress = 0;

  subjects.forEach((s) => {
    const stats = getSubjectStats(s.id);
    if (stats) {
      totalTopics += stats.totalTopics;
      completedTopics += stats.completedTopics;
      sumTopicProgress += stats.averageProgress;
      if (stats.startedTopics > 0) subjectsStarted++;
      if (stats.completedTopics === stats.totalTopics && stats.totalTopics > 0) subjectsCompleted++;
    }
  });

  const totalTopicProgress = subjects.length > 0 ? Math.round(sumTopicProgress / subjects.length) : 0;
  const overallPercentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Use existing Module 6 intelligent score & Module 7 daily goal
  const intelligentScore = calculateIntelligentScore(examId);
  const dailyGoal = getDailyGoalStatus();

  return {
    examId,
    examName: exam?.name || 'Exam',
    totalSubjects: subjects.length,
    subjectsStarted,
    subjectsCompleted,
    totalTopics,
    completedTopics,
    totalTopicProgress,
    overallPercentage,
    intelligentScore,
    dailyGoal,
  };
}

// 4. Deterministic Smart Continue Learning (Priorities 1-6)
export function getSmartContinueLearning(
  targetExamId?: string,
  targetSubjectId?: string
): SmartContinueLearningItem | null {
  // Candidate pool
  let candidateTopics: Topic[] = [];

  if (targetSubjectId) {
    candidateTopics = getTopicsForSubject(targetSubjectId);
  } else if (targetExamId) {
    const subjects = getSubjectsForExam(targetExamId);
    candidateTopics = subjects.flatMap((s) => getTopicsForSubject(s.id));
  } else {
    // Look in Super TET or first available
    candidateTopics = getTopicsForSubject('super-tet-teaching-skills');
    if (candidateTopics.length === 0 && exams[0]) {
      const firstSubjects = getSubjectsForExam(exams[0].id);
      candidateTopics = firstSubjects.flatMap((s) => getTopicsForSubject(s.id));
    }
  }

  if (candidateTopics.length === 0) return null;

  const detailsList = candidateTopics
    .map((t) => getTopicLearningDetails(t.id))
    .filter((td): td is TopicLearningDetails => td !== null);

  const weakAreas = getWeakAreas();

  // PRIORITY 1: Incomplete topic currently being studied (IN_PROGRESS, overallProgress < 100)
  const p1 = detailsList.find(
    (td) => td.status === 'IN_PROGRESS' && td.overallProgress > 0 && td.overallProgress < 100
  );
  if (p1) {
    const exam = getExam(p1.topic.examId);
    const subject = getSubject(p1.topic.subjectId);
    return {
      examId: p1.topic.examId,
      examName: exam?.name || 'Exam',
      subjectId: p1.topic.subjectId,
      subjectName: subject?.name || 'Subject',
      topicId: p1.topic.id,
      topicName: p1.topic.name,
      currentActivity: `${p1.nextAction.label} (${p1.overallProgress}% पूर्ण)`,
      progress: p1.overallProgress,
      recommendedAction: p1.nextAction.label,
      actionReason: p1.nextAction.reason,
      actionUrl: p1.nextAction.url,
      priority: 1,
      actionType: p1.nextAction.type,
    };
  }

  // PRIORITY 2: Topic with Study Material started but not completed
  const p2 = detailsList.find(
    (td) =>
      td.topic.availability.studyMaterial &&
      td.studyMaterialProgress > 0 &&
      td.studyMaterialProgress < 80
  );
  if (p2) {
    const exam = getExam(p2.topic.examId);
    const subject = getSubject(p2.topic.subjectId);
    return {
      examId: p2.topic.examId,
      examName: exam?.name || 'Exam',
      subjectId: p2.topic.subjectId,
      subjectName: subject?.name || 'Subject',
      topicId: p2.topic.id,
      topicName: p2.topic.name,
      currentActivity: `Study Material (${p2.studyMaterialProgress}%)`,
      progress: p2.studyMaterialProgress,
      recommendedAction: 'Study Material जारी रखें',
      actionReason: 'आपने इस topic का Study Material शुरू किया था। इसे पूरा करें।',
      actionUrl: `/study-material/${p2.topic.examId}/${p2.topic.subjectId}/${p2.topic.id}`,
      priority: 2,
      actionType: 'study',
    };
  }

  // PRIORITY 3: Topic where Study Material is completed (>=80%) but PYQ is not practiced
  const p3 = detailsList.find(
    (td) =>
      td.topic.availability.studyMaterial &&
      td.studyMaterialProgress >= 80 &&
      td.topic.availability.pyq &&
      !td.pyqPracticed
  );
  if (p3) {
    const exam = getExam(p3.topic.examId);
    const subject = getSubject(p3.topic.subjectId);
    return {
      examId: p3.topic.examId,
      examName: exam?.name || 'Exam',
      subjectId: p3.topic.subjectId,
      subjectName: subject?.name || 'Subject',
      topicId: p3.topic.id,
      topicName: p3.topic.name,
      currentActivity: 'PYQ Practice',
      progress: 60,
      recommendedAction: 'PYQ हल करें',
      actionReason: 'Study Material पूरा हो चुका है। अब PYQ हल करें।',
      actionUrl: `/pyq/${p3.topic.examId}/${p3.topic.subjectId}/${p3.topic.id}`,
      priority: 3,
      actionType: 'pyq',
    };
  }

  // PRIORITY 4: Topic where PYQ is practiced but Quiz has not been attempted
  const p4 = detailsList.find(
    (td) =>
      td.topic.availability.pyq &&
      td.pyqPracticed &&
      td.topic.availability.quiz &&
      !td.quizAttempted
  );
  if (p4) {
    const exam = getExam(p4.topic.examId);
    const subject = getSubject(p4.topic.subjectId);
    return {
      examId: p4.topic.examId,
      examName: exam?.name || 'Exam',
      subjectId: p4.topic.subjectId,
      subjectName: subject?.name || 'Subject',
      topicId: p4.topic.id,
      topicName: p4.topic.name,
      currentActivity: 'MCQ Quiz',
      progress: 75,
      recommendedAction: 'Take Quiz',
      actionReason: 'PYQ हल कर चुके हैं। अब टाइमर के साथ Quiz देकर अपनी तैयारी परखें।',
      actionUrl: `/quiz/${p4.topic.examId}/${p4.topic.subjectId}/${p4.topic.id}`,
      priority: 4,
      actionType: 'quiz',
    };
  }

  // PRIORITY 5: Weak topic based on existing analytics
  if (weakAreas.length > 0) {
    const weakMatch = detailsList.find((td) =>
      weakAreas.some(
        (w) =>
          w.topicId === td.topic.id ||
          w.topicName.toLowerCase().trim() === td.topic.name.toLowerCase().trim()
      )
    );
    if (weakMatch) {
      const exam = getExam(weakMatch.topic.examId);
      const subject = getSubject(weakMatch.topic.subjectId);
      return {
        examId: weakMatch.topic.examId,
        examName: exam?.name || 'Exam',
        subjectId: weakMatch.topic.subjectId,
        subjectName: subject?.name || 'Subject',
        topicId: weakMatch.topic.id,
        topicName: weakMatch.topic.name,
        currentActivity: `समीक्षा अभ्यास (सटीकता: ${weakMatch.quizAccuracy || weakMatch.pyqAccuracy}%)`,
        progress: weakMatch.overallProgress,
        recommendedAction: 'पुनः अभ्यास करें',
        actionReason: 'आपकी Quiz Accuracy कम है। इस topic की दोबारा Practice करें।',
        actionUrl: weakMatch.nextAction.url,
        priority: 5,
        actionType: weakMatch.nextAction.type,
      };
    }
  }

  // PRIORITY 6: First unstarted topic
  const p6 = detailsList.find((td) => td.status === 'NOT_STARTED');
  if (p6) {
    const exam = getExam(p6.topic.examId);
    const subject = getSubject(p6.topic.subjectId);
    return {
      examId: p6.topic.examId,
      examName: exam?.name || 'Exam',
      subjectId: p6.topic.subjectId,
      subjectName: subject?.name || 'Subject',
      topicId: p6.topic.id,
      topicName: p6.topic.name,
      currentActivity: 'नया अध्याय प्रारंभ करें',
      progress: 0,
      recommendedAction: p6.nextAction.label,
      actionReason: 'यह अध्याय प्रारंभ करें और मूलभूत अवधारणाएं समझें।',
      actionUrl: p6.nextAction.url,
      priority: 6,
      actionType: p6.nextAction.type,
    };
  }

  // Fallback: first topic in list
  if (detailsList.length > 0) {
    const fallback = detailsList[0];
    const exam = getExam(fallback.topic.examId);
    const subject = getSubject(fallback.topic.subjectId);
    return {
      examId: fallback.topic.examId,
      examName: exam?.name || 'Exam',
      subjectId: fallback.topic.subjectId,
      subjectName: subject?.name || 'Subject',
      topicId: fallback.topic.id,
      topicName: fallback.topic.name,
      currentActivity: fallback.nextAction.label,
      progress: fallback.overallProgress,
      recommendedAction: fallback.nextAction.label,
      actionReason: fallback.nextAction.reason,
      actionUrl: fallback.nextAction.url,
      priority: 6,
      actionType: fallback.nextAction.type,
    };
  }

  return null;
}

// 5. Get Recently Studied Activities (5-10 items)
export function getRecentlyStudied(limit: number = 6): ActivityItem[] {
  const activities = getRecentActivities();
  return activities.slice(0, Math.min(10, Math.max(5, limit)));
}
