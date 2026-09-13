import type { MCQDifficulty, MCQQuestion, MCQSourceType } from '@/data/quiz/types';

export type GoogleSheetRowStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export type GoogleSheetDifficultyInput = 'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD' | 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';

export type GoogleSheetSourceTypeInput = 'PRACTICE' | 'PYQ' | 'PYQ-BASED' | 'Practice' | 'PYQ' | 'PYQ-based';

export type GoogleSheetStatus = 'unconfigured' | 'loading' | 'success' | 'empty' | 'error';

export interface RawGoogleSheetRow {
  id: string;
  examId: string;
  subjectId: string;
  topicId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  importantPoint: string;
  additionalFact: string;
  commonMistake: string;
  difficulty: string;
  sourceType: string;
  year?: string;
  examName?: string;
  status: string;
  sourceName?: string;
  // Optional diagram fields
  diagramRequired?: string;
  diagramType?: string;
  diagramData?: string;
  diagramCaption?: string;
  diagramAltText?: string;
  diagramImageUrl?: string;
}

export interface GoogleSheetRowValidation {
  rowNumber: number;
  id: string;
  status: GoogleSheetRowStatus | 'UNKNOWN';
  isValid: boolean;
  isPublished: boolean;
  errors: string[];
  warnings: string[];
  questionPreview?: string;
  convertedMCQ?: MCQQuestion;
}

export interface GoogleSheetBankReport {
  url: string;
  isConfigured: boolean;
  status: GoogleSheetStatus;
  statusMessage: string;
  lastFetchedAt: string | null;
  totalRows: number;
  publishedCount: number;
  draftCount: number;
  reviewCount: number;
  archivedCount: number;
  malformedRowsCount: number;
  duplicateIdsCount: number;
  validations: GoogleSheetRowValidation[];
  publishedQuestions: MCQQuestion[];
}
