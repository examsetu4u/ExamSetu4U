/**
 * CBSE Class 10 Science — Scalable Question & Curriculum Data Architecture
 * Reusable TypeScript interfaces for CBSE Board Examination System
 */

export type ScienceQuestionType =
  | 'MCQ'
  | 'ASSERTION_REASON'
  | 'VERY_SHORT'
  | 'SHORT_ANSWER'
  | 'CASE_BASED'
  | 'LONG_ANSWER'
  | 'PYQ';

export type ScienceSourceType = 'PYQ' | 'PYQ-BASED' | 'PRACTICE';

export type ScienceDifficulty =
  | 'EASY'
  | 'MODERATE'
  | 'HARD'
  | 'VERY_HARD'
  | 'Easy'
  | 'Moderate'
  | 'Hard';

export type ScienceQuestionStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface ScienceQuestionOptions {
  A?: string;
  B?: string;
  C?: string;
  D?: string;
  [key: string]: string | undefined;
}

/**
 * Production-ready Question Model for CBSE Class 10 Science
 * Scalable for 10,000+ questions, Google Sheets synchronization, and local/remote stores.
 */
export interface ScienceQuestion {
  id: string;
  examId: string; // 'cbse-class-10'
  subjectId: string; // 'cbse-class-10-science'
  chapterId: string; // e.g. 'cbse-class-10-science-1'
  topicId?: string;
  question: string;
  questionType: ScienceQuestionType;
  options?: ScienceQuestionOptions;
  correctAnswer?: string;
  explanation?: string;
  importantPoint?: string;
  additionalFact?: string;
  commonMistake?: string;
  difficulty: ScienceDifficulty;
  sourceType: ScienceSourceType;
  year?: number | null;
  examName?: string | null;
  marks?: number;
  status?: ScienceQuestionStatus;

  // Structural metadata for advanced question types
  assertion?: string;
  reason?: string;
  caseStudyContext?: string;
}

export type ScienceSectionKey =
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

export interface ScienceSectionMetadata {
  key: ScienceSectionKey;
  order: number;
  icon: string;
  title: string;
  hindiTitle: string;
  description: string;
  badge: string;
  emptyHeading: string;
  emptyDescription: string;
  targetRouteSegment: string;
}

export interface ScienceChapter {
  id: string; // e.g. 'cbse-class-10-science-1'
  canonicalId: string;
  chapterNumber: number;
  slug: string; // e.g. 'chemical-reactions-and-equations'
  title: string;
  hindiTitle: string;
  unitNumber: number;
  unitName: string;
  unitHindiName: string;
  shortDescription: string;
  syllabusTopics: string[];
  weightageMarks: number;
}

export interface ScienceChapterProgress {
  chapterId: string;
  studyMaterialProgress: number;
  mcqProgress: number;
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
