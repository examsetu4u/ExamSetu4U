import type { MaterialSection } from '@/data/curriculum';
import type { MockTestConfig } from '@/data/mock/types';

export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type SubjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TopicStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type ContentSourceType = 'PYQ' | 'PYQ-BASED' | 'PRACTICE';
export type ContentDifficulty = 'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD';

export interface AdminExam {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: string;
  status: ExamStatus;
  order: number;
  subjectCount?: number;
  topicCount?: number;
}

export interface AdminSubject {
  id: string;
  examId: string;
  name: string;
  description: string;
  order: number;
  status: SubjectStatus;
  topicCount?: number;
}

export interface AdminTopic {
  id: string;
  examId: string;
  subjectId: string;
  name: string;
  description: string;
  order: number;
  status: TopicStatus;
  hasStudyMaterial?: boolean;
  questionCount?: number;
}

export interface AdminStudyMaterial {
  id: string;
  examId: string;
  subjectId: string;
  topicId: string;
  title: string;
  description: string;
  intro?: string;
  sections: MaterialSection[];
  keyPoints: string[];
  importantFacts: string[];
  status: ContentStatus;
  version: number;
  updatedAt?: string;
  quickRevision?: string[];
}

export interface AdminQuestion {
  id: string;
  examId: string;
  subjectId: string;
  topicId: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  importantPoint: string;
  additionalFact: string;
  commonMistake: string;
  difficulty: ContentDifficulty;
  sourceType: ContentSourceType;
  year?: number;
  examName?: string;
  status: ContentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminMockTest extends MockTestConfig {
  status: ContentStatus;
  updatedAt?: string;
}

export interface AdminActivityLog {
  id: string;
  timestamp: string;
  action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'IMPORTED' | 'ARCHIVED';
  entityType: 'EXAM' | 'SUBJECT' | 'TOPIC' | 'QUESTION' | 'STUDY_MATERIAL' | 'MOCK_TEST';
  entityId: string;
  entityTitle: string;
  details?: string;
}

export interface ValidationResult {
  status: 'VALID' | 'WARNING' | 'ERROR';
  errors: string[];
  warnings: string[];
  fieldErrors: Record<string, string>;
}

export interface QuestionValidationItem {
  questionId: string;
  questionText: string;
  examId: string;
  subjectId: string;
  topicId: string;
  sourceType: ContentSourceType;
  status: ContentStatus;
  result: ValidationResult;
}

export interface ValidationReportSummary {
  totalQuestions: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  items: QuestionValidationItem[];
  checkedAt: string;
}

export interface AdminDashboardStats {
  totalExams: number;
  totalSubjects: number;
  totalTopics: number;
  studyMaterialItems: number;
  pyqItems: number;
  quizItems: number;
  mockTests: number;
  draftCount: number;
  reviewCount: number;
  publishedCount: number;
  archivedCount: number;
  validationErrors: number;
  validationWarnings: number;
}
