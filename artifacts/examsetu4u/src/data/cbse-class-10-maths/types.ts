/**
 * CBSE Class 10 Mathematics — Scalable Question & Curriculum Data Architecture
 * Reusable TypeScript interfaces for CBSE Board Examination System
 */

export type MathsQuestionType =
  | 'MCQ'
  | 'ASSERTION_REASON'
  | 'VERY_SHORT'
  | 'SHORT_ANSWER'
  | 'CASE_BASED'
  | 'LONG_ANSWER'
  | 'PYQ';

export type MathsSourceType = 'PYQ' | 'PYQ-BASED' | 'PRACTICE';

export type MathsDifficulty =
  | 'EASY'
  | 'MODERATE'
  | 'HARD'
  | 'VERY_HARD'
  | 'Easy'
  | 'Moderate'
  | 'Hard';

export type MathsQuestionStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface MathsQuestionOptions {
  A?: string;
  B?: string;
  C?: string;
  D?: string;
  [key: string]: string | undefined;
}

/**
 * Production-ready Question Model for CBSE Class 10 Mathematics
 * Supports MCQs, Assertion-Reason, Short Answers, Long Answers, and Case-Based questions.
 */
export interface MathsQuestion {
  id: string;
  examId: string; // 'cbse-class-10'
  subjectId: string; // 'cbse-class-10-mathematics'
  chapterId: string; // e.g. 'cbse-class-10-mathematics-1'
  topicId?: string;
  question: string;
  questionType: MathsQuestionType;
  options?: MathsQuestionOptions;
  correctAnswer?: string;
  explanation?: string;
  importantPoint?: string;
  additionalFact?: string;
  commonMistake?: string;
  formulaUsed?: string;
  difficulty: MathsDifficulty;
  sourceType: MathsSourceType;
  year?: number | null;
  examName?: string | null;
  marks?: number;
  status?: MathsQuestionStatus;

  // Structural metadata for advanced question types
  assertion?: string;
  reason?: string;
  caseStudyContext?: string;
  subQuestions?: {
    id: string;
    question: string;
    marks: number;
    answer: string;
    explanation?: string;
  }[];
}

export type MathsSectionKey =
  | 'study-material'
  | 'mcq'
  | 'assertion-reason'
  | 'very-short'
  | 'short-answer'
  | 'case-based'
  | 'long-answer'
  | 'pyq'
  | 'chapter-test'
  | 'revision'
  | 'mistake-practice';

export interface MathsSectionMetadata {
  key: MathsSectionKey;
  order: number;
  icon: string;
  title: string;
  hindiTitle: string;
  description: string;
  badge: string;
  marksInfo: string;
  emptyHeading: string;
  emptyDescription: string;
  targetRouteSegment: string;
}

export interface MathsChapter {
  id: string; // e.g. 'cbse-class-10-mathematics-1'
  canonicalId: string;
  chapterNumber: number;
  slug: string; // e.g. 'real-numbers'
  title: string;
  hindiTitle: string;
  unitNumber: number;
  unitName: string;
  unitHindiName: string;
  shortDescription: string;
  syllabusTopics: string[];
  keyFormulas: string[];
  weightageMarks: number;
}

export interface MathsChapterProgress {
  chapterId: string;
  studyMaterialProgress: number;
  mcqProgress: number;
  totalMCQs?: number;
  assertionReasonProgress: number;
  shortAnswerProgress: number;
  caseBasedProgress: number;
  longAnswerProgress: number;
  pyqProgress: number;
  chapterTestProgress: number;
  overallProgress: number;
  hasContent: boolean;
  availableQuestionsCount: number;
}
