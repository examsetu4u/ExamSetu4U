/**
 * UPPCS Current Affairs Automation Pipeline - Type Definitions
 * Strictly adheres to UPPCS Prelims & Mains examination specifications.
 */

export type UPPCSCategory =
  | 'UP_SPECIAL'
  | 'NATIONAL'
  | 'INTERNATIONAL'
  | 'ECONOMY'
  | 'ENVIRONMENT'
  | 'SCIENCE_DEFENSE'
  | 'AWARDS_SPORTS';

export interface RawNewsItem {
  id: string;
  title: string;
  description: string;
  content: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  categoryGuess?: string;
}

export interface ProcessedMCQ {
  question: string;
  options: string[] | { A: string; B: string; C: string; D: string };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
}

export interface ProcessedCurrentAffairItem {
  id?: string;
  date: string; // YYYY-MM-DD
  category: UPPCSCategory | string;
  categoryLabel?: string;
  title: string;
  titleEn?: string;
  summary: string | string[];
  why_important_for_uppcs: string;
  key_facts: string[];
  uttar_pradesh_relevance: string;
  prelims_facts: string[];
  mains_points: string[];
  source: string;
  source_url: string;
  mcqs: ProcessedMCQ[];
  // Backwards compatibility for UI rendering
  uppcsPreFocus?: string[];
  staticLinkage?: string;
  tags?: string[];
}

export interface DailyCurrentAffairsPayload {
  date: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "16 फरवरी 2025 (दैनिक समसामयिकी)"
  items: ProcessedCurrentAffairItem[];
  dailyQuiz: Array<{
    id: string;
    question: string;
    questionEn?: string;
    options: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
    prelimsTip: string;
    difficulty?: 'Easy' | 'Moderate' | 'Hard';
    category: string;
  }>;
}

export interface AutomationStatus {
  lastSuccessfulUpdate: string | null;
  lastRunTimestamp: string;
  status: 'success' | 'warning' | 'error' | 'idle';
  newItemsAdded: number;
  duplicatesRejected: number;
  mcqsGenerated: number;
  failedItems: number;
  sourceUrls: string[];
  lastAutomationError: string | null;
  executionSummary: string;
  runHistory: Array<{
    timestamp: string;
    date: string;
    itemsCount: number;
    mcqsCount: number;
    status: string;
    sources: string[];
    error?: string;
  }>;
}
