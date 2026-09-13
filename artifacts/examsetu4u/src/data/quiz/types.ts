export type MCQDifficulty = 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';
export type MCQSourceType = 'PYQ' | 'PYQ-based' | 'Practice' | 'Current Affairs Automation';

export type QuestionType =
  | 'DIRECT_MCQ'
  | 'STATEMENT_BASED'
  | 'ASSERTION_REASON'
  | 'MATCHING'
  | 'CASE_BASED'
  | 'PASSAGE_BASED'
  | 'SEQUENCE_ORDER'
  | 'CLASSROOM_SITUATION'
  | 'DIAGRAM_BASED';

export interface MCQQuestion {
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
  difficulty: MCQDifficulty;
  sourceType: MCQSourceType;
  year?: number;
  examName?: string;

  // Visual Flow Architecture Fields
  paper?: string;
  level?: string;
  section?: string;
  chapter?: string;
  subTopic?: string;
  questionType?: QuestionType | string;
  isPYQ?: boolean;
  pyqYear?: number;
  pyqReference?: string;
  language?: string;

  // Optional diagram fields
  diagramRequired?: boolean;
  diagramType?: string;
  diagramData?: any;
  diagramCaption?: string;
  diagramAltText?: string;
  diagramImageUrl?: string;
}

export type QuizFilterOptions = {
  examId?: string;
  paper?: string;
  subjectId?: string;
  chapter?: string;
  topicId?: string;
  questionType?: string;
  isPYQ?: boolean;
  difficulty?: 'All' | MCQDifficulty;
  count?: number;
  random?: boolean;
  search?: string;
};

export type QuizSessionState = {
  questionIds: string[];
  currentIndex: number;
  selectedAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  submittedAnswers: Record<string, boolean>;
  markedForReview: Record<string, boolean>;
  isFinished: boolean;
  startedAt: string;
  examId: string;
  subjectId: string;
  topicId: string;
  difficulty: string;
  random: boolean;
  title: string;
  isRevision?: boolean;
};

export type QuizAttemptResult = {
  attemptId: string;
  date: string;
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  markedForReview: number;
  accuracy: number;
  score: number;
  percentage: number;
  questionIds: string[];
  incorrectQuestionIds: string[];
  userAnswers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  isRevision?: boolean;
  mistakesImproved?: number;
};
