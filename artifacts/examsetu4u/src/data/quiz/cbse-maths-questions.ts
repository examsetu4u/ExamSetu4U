import type { MCQQuestion } from './types';
import { CBSE_CLASS_10_MATHS_CURATED_QUESTIONS } from '@/data/cbse-class-10-maths';

export const cbseMathsQuestions: MCQQuestion[] = CBSE_CLASS_10_MATHS_CURATED_QUESTIONS
  .filter((q) => q.questionType === 'MCQ' && q.options)
  .map((q) => ({
    id: q.id,
    examId: 'cbse-class-10',
    examName: 'CBSE Class 10',
    subjectId: 'cbse-class-10-mathematics',
    topicId: q.chapterId,
    question: q.question,
    options: {
      A: q.options!.A || '',
      B: q.options!.B || '',
      C: q.options!.C || '',
      D: q.options!.D || '',
    },
    correctAnswer: (q.correctAnswer as 'A' | 'B' | 'C' | 'D') || 'A',
    explanation: q.explanation || '',
    importantPoint: q.importantPoint || (q.formulaUsed ? `Formula: ${q.formulaUsed}` : undefined),
    additionalFact: q.commonMistake,
    commonMistake: q.commonMistake,
    difficulty: q.difficulty === 'EASY' ? 'Easy' : q.difficulty === 'HARD' ? 'Hard' : 'Moderate',
    sourceType: q.sourceType === 'CBSE_PYQ' ? 'PYQ' : 'Practice',
    year: q.year,
  }));
