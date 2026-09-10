import type { MCQQuestion } from '@/data/quiz/types';

export type MockTestType = 'full' | 'subject' | 'topic' | 'practice';

export interface MockTestConfig {
  id: string;
  examId: string;
  title: string;
  description: string;
  testType: MockTestType;
  questionCount: number;
  durationMinutes: number;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Mixed';
  subjects: string[]; // Subject IDs or names
  topics?: string[]; // Topic IDs or names
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  negativeMarking: boolean;
  negativeMarks: number; // e.g., 0.25, 0.33, 0.5
  marksPerQuestion: number; // e.g., 1, 2
  instructions: string[];
}

export interface MockAnswer {
  questionId: string;
  selectedAnswer?: 'A' | 'B' | 'C' | 'D';
  visited: boolean;
  answered: boolean;
  markedForReview: boolean;
  timeSpentSeconds?: number;
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  accuracy: number;
  score: number;
  maxScore: number;
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  status: 'Mastered' | 'Needs Improvement' | 'Weak';
}

export interface MockResult {
  attemptId: string;
  testId: string;
  testTitle: string;
  examId: string;
  examName: string;
  date: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  markedForReview: number;
  marksPerQuestion: number;
  negativeMarking: boolean;
  negativeMarks: number;
  positiveMarks: number;
  negativeMarksDeducted: number;
  finalScore: number;
  maxMarks: number;
  percentage: number;
  accuracy: number;
  durationMinutes: number;
  timeUsedSeconds: number;
  timeRemainingSeconds: number;
  questionIds: string[];
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  markedForReviewIds: string[];
  subjectWise: SubjectPerformance[];
  topicWise: TopicPerformance[];
  averageTimePerQuestionSeconds: number;
}

export interface MockActiveAttempt {
  attemptId: string;
  testId: string;
  examId: string;
  testTitle: string;
  startedAt: string;
  endTime: number; // Date.now() + durationMinutes * 60 * 1000
  durationMinutes: number;
  currentIndex: number;
  questionIds: string[];
  answers: Record<string, MockAnswer>;
  isFinished: boolean;
}

export interface MockTestSummary {
  attemptCount: number;
  bestScore: number;
  bestPercentage: number;
  bestAccuracy: number;
  lastAttemptDate?: string;
  lastAttemptId?: string;
  hasActiveAttempt?: boolean;
}
