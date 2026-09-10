/**
 * Super TET — शिक्षण कौशल (Teaching Skill) 1000 MCQ Content System
 * Production-Ready Content Schema & Types
 */

export type MCQDifficultyEnum = 'EASY' | 'MODERATE' | 'HARD' | 'VERY_HARD';
export type MCQSourceTypeEnum = 'PRACTICE' | 'PYQ' | 'PYQ-BASED';
export type MCQStatusEnum = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface ShikshanKaushalMCQ {
  id: string; // ST-SK-0001 to ST-SK-1000
  examId: 'super-tet';
  subjectId: 'shikshan-kaushal';
  topicId: string; // Valid 1 of 15 syllabus topic IDs
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
  difficulty: MCQDifficultyEnum;
  sourceType: MCQSourceTypeEnum;
  year: number | null;
  examName: string | null;
  status: MCQStatusEnum;
}

export interface TopicDefinition {
  index: number;
  id: string;
  canonicalId: string;
  aliasIds: string[];
  name: string;
  description: string;
  targetCount: number; // Ideal distribution across 1000 questions (~66-70 per topic)
}

export interface ValidationErrorItem {
  questionId: string;
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface DuplicateMatch {
  questionIdA: string;
  questionIdB: string;
  similarityScore: number; // 0.0 to 1.0
  reason: 'EXACT_TEXT' | 'NORMALIZED_TEXT' | 'SIMILAR_WORDING' | 'IDENTICAL_OPTIONS';
  snippetA: string;
  snippetB: string;
}

export interface BatchValidationReport {
  timestamp: string;
  totalReceived: number;
  validCount: number;
  invalidCount: number;
  duplicateIdCount: number;
  duplicateQuestionCount: number;
  errors: ValidationErrorItem[];
  warnings: ValidationErrorItem[];
  duplicates: DuplicateMatch[];
  difficultyCounts: Record<MCQDifficultyEnum, number>;
  sourceTypeCounts: Record<MCQSourceTypeEnum, number>;
  topicCounts: Record<string, number>;
  isValid: boolean;
}

export interface ShikshanKaushalContentCoverage {
  totalTarget: 1000;
  totalLoaded: number;
  completionPercentage: number;
  difficultyDistribution: {
    target: {
      EASY: 300;
      MODERATE: 400;
      HARD: 200;
      VERY_HARD: 100;
    };
    actual: Record<MCQDifficultyEnum, number>;
    percentages: Record<MCQDifficultyEnum, number>;
  };
  sourceDistribution: Record<MCQSourceTypeEnum, number>;
  topicCoverage: Array<{
    topicIndex: number;
    topicId: string;
    topicName: string;
    count: number;
    target: number;
    completionPercent: number;
    easyCount: number;
    moderateCount: number;
    hardCount: number;
    veryHardCount: number;
  }>;
}
