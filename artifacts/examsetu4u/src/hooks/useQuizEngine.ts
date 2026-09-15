import { useCallback, useEffect, useMemo, useState } from 'react';
import { getQuestionsByIds } from '@/data/quiz/questions';
import type { MCQQuestion, QuizAttemptResult, QuizSessionState } from '@/data/quiz/types';
import { clearQuizSession, loadQuizSession, saveQuizAttempt, saveQuizSession } from '@/lib/quiz-storage';
import { recordQuizAttempt } from '@/lib/user-progress';
import { recordQuizMistake, recordRevisionAttempt } from '@/lib/mistakes';
import { subscribeToQuestionBank } from '@/services/google-sheet-loader';

export type PaletteQuestionStatus = 'current' | 'answered_marked' | 'marked' | 'answered' | 'unanswered';

export function useQuizEngine(initialQuestions?: MCQQuestion[], initialConfig?: {
  examId?: string;
  examName?: string;
  subjectId?: string;
  subjectName?: string;
  topicId?: string;
  topicName?: string;
  difficulty?: string;
  random?: boolean;
  title?: string;
}) {
  const [bankRevision, setBankRevision] = useState(0);

  useEffect(() => {
    return subscribeToQuestionBank(() => {
      setBankRevision((r) => r + 1);
    });
  }, []);

  const [session, setSession] = useState<QuizSessionState | null>(() => {
    // Attempt to resume existing active session from localStorage
    const saved = loadQuizSession();
    if (saved && !saved.isFinished && saved.questionIds.length > 0) {
      return saved;
    }
    return null;
  });

  const [activeResult, setActiveResult] = useState<QuizAttemptResult | null>(null);
  const [isConfirmingFinish, setIsConfirmingFinish] = useState(false);

  // Retrieve current questions from session question IDs
  const currentQuestions: MCQQuestion[] = useMemo(() => {
    if (!session || session.questionIds.length === 0) {
      return initialQuestions || [];
    }
    return getQuestionsByIds(session.questionIds);
  }, [session, initialQuestions, bankRevision]);

  const currentIndex = session ? session.currentIndex : 0;
  const currentQuestion: MCQQuestion | undefined = currentQuestions[currentIndex];

  // Persist session to localStorage on changes
  useEffect(() => {
    if (session && !session.isFinished) {
      saveQuizSession(session);
    }
  }, [session]);

  // Start a new quiz with specific questions and config
  const startQuiz = useCallback((questions: MCQQuestion[], config?: {
    examId?: string;
    examName?: string;
    subjectId?: string;
    subjectName?: string;
    topicId?: string;
    topicName?: string;
    difficulty?: string;
    random?: boolean;
    title?: string;
    isRevision?: boolean;
  }) => {
    if (!questions || questions.length === 0) return;

    const newSession: QuizSessionState = {
      questionIds: questions.map((q) => q.id),
      currentIndex: 0,
      selectedAnswers: {},
      submittedAnswers: {},
      markedForReview: {},
      isFinished: false,
      startedAt: new Date().toISOString(),
      examId: config?.examId || '',
      subjectId: config?.subjectId || '',
      topicId: config?.topicId || '',
      difficulty: config?.difficulty || 'All',
      random: Boolean(config?.random),
      title: config?.title || 'ExamSetu4U Quiz',
      isRevision: Boolean(config?.isRevision),
    };

    setSession(newSession);
    saveQuizSession(newSession);
    setActiveResult(null);
    setIsConfirmingFinish(false);
  }, []);

  // Answer selection
  const selectOption = useCallback((optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setSession((prev) => {
      if (!prev) return null;
      // Disallow changing answer if already submitted
      if (prev.submittedAnswers[qId]) return prev;
      return {
        ...prev,
        selectedAnswers: {
          ...prev.selectedAnswers,
          [qId]: optionKey,
        },
      };
    });
  }, [currentQuestion]);

  // Clear answer
  const clearAnswer = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setSession((prev) => {
      if (!prev) return null;
      if (prev.submittedAnswers[qId]) return prev;
      const nextAnswers = { ...prev.selectedAnswers };
      delete nextAnswers[qId];
      return {
        ...prev,
        selectedAnswers: nextAnswers,
      };
    });
  }, [currentQuestion]);

  // Submit Answer for instant feedback
  const submitAnswer = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setSession((prev) => {
      if (!prev) return null;
      if (!prev.selectedAnswers[qId]) return prev; // Cannot submit without selecting
      return {
        ...prev,
        submittedAnswers: {
          ...prev.submittedAnswers,
          [qId]: true,
        },
      };
    });
  }, [currentQuestion]);

  // Toggle review mark
  const toggleMarkForReview = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setSession((prev) => {
      if (!prev) return null;
      const isMarked = Boolean(prev.markedForReview[qId]);
      return {
        ...prev,
        markedForReview: {
          ...prev.markedForReview,
          [qId]: !isMarked,
        },
      };
    });
  }, [currentQuestion]);

  // Navigation: Next
  const goToNext = useCallback(() => {
    setSession((prev) => {
      if (!prev) return null;
      if (prev.currentIndex < prev.questionIds.length - 1) {
        return {
          ...prev,
          currentIndex: prev.currentIndex + 1,
        };
      }
      return prev;
    });
  }, []);

  // Navigation: Previous
  const goToPrevious = useCallback(() => {
    setSession((prev) => {
      if (!prev) return null;
      if (prev.currentIndex > 0) {
        return {
          ...prev,
          currentIndex: prev.currentIndex - 1,
        };
      }
      return prev;
    });
  }, []);

  // Skip (moves to next question without answering)
  const skipQuestion = useCallback(() => {
    goToNext();
  }, [goToNext]);

  // Jump to specific question index
  const jumpToQuestion = useCallback((index: number) => {
    setSession((prev) => {
      if (!prev) return null;
      if (index >= 0 && index < prev.questionIds.length) {
        return {
          ...prev,
          currentIndex: index,
        };
      }
      return prev;
    });
  }, []);

  // Calculate final result
  const finishQuiz = useCallback(() => {
    if (!session || currentQuestions.length === 0) return;

    let correctCount = 0;
    let incorrectCount = 0;
    let mistakesImprovedCount = 0;
    const incorrectIds: string[] = [];

    currentQuestions.forEach((q) => {
      const userAns = session.selectedAnswers[q.id];
      if (userAns) {
        if (userAns === q.correctAnswer) {
          correctCount++;
          if (session.isRevision) {
            mistakesImprovedCount++;
            recordRevisionAttempt(q.id, true, userAns, q.options[userAns]);
          }
        } else {
          incorrectCount++;
          incorrectIds.push(q.id);
          if (session.isRevision) {
            recordRevisionAttempt(q.id, false, userAns, q.options[userAns]);
          } else {
            recordQuizMistake(q, userAns);
          }
        }
      }
    });

    const attemptedCount = Object.keys(session.selectedAnswers).length;
    const totalCount = currentQuestions.length;
    const unansweredCount = totalCount - attemptedCount;
    const markedCount = Object.values(session.markedForReview).filter(Boolean).length;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const percentage = Math.round((correctCount / totalCount) * 100);

    const result: QuizAttemptResult = {
      attemptId: `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
      examId: session.examId,
      examName: initialConfig?.examName || session.examId || 'ExamSetu4U',
      subjectId: session.subjectId,
      subjectName: initialConfig?.subjectName || session.subjectId || 'सामान्य ज्ञान',
      topicId: session.topicId,
      topicName: initialConfig?.topicName || session.topicId || 'सभी विषय',
      totalQuestions: totalCount,
      attempted: attemptedCount,
      correct: correctCount,
      incorrect: incorrectCount,
      unanswered: unansweredCount,
      markedForReview: markedCount,
      accuracy,
      score: correctCount,
      percentage,
      questionIds: session.questionIds,
      incorrectQuestionIds: incorrectIds,
      userAnswers: { ...session.selectedAnswers },
      isRevision: session.isRevision,
      mistakesImproved: mistakesImprovedCount,
    };

    saveQuizAttempt(result);
    recordQuizAttempt(result);
    clearQuizSession();
    setActiveResult(result);
    setSession(null);
    setIsConfirmingFinish(false);
  }, [session, currentQuestions, initialConfig]);

  // Restart / Retry the same quiz
  const retryQuiz = useCallback(() => {
    if (!activeResult) return;
    const questionsToUse = getQuestionsByIds(activeResult.questionIds);
    let orderedQuestions = [...questionsToUse];
    if (session?.random || initialConfig?.random) {
      for (let i = orderedQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [orderedQuestions[i], orderedQuestions[j]] = [orderedQuestions[j], orderedQuestions[i]];
      }
    }
    startQuiz(orderedQuestions, {
      examId: activeResult.examId,
      examName: activeResult.examName,
      subjectId: activeResult.subjectId,
      subjectName: activeResult.subjectName,
      topicId: activeResult.topicId,
      topicName: activeResult.topicName,
      title: activeResult.topicName ? `${activeResult.topicName} - Quiz` : 'ExamSetu4U Quiz',
    });
  }, [activeResult, session, initialConfig, startQuiz]);

  // Practice Incorrect Questions
  const practiceIncorrect = useCallback(() => {
    if (!activeResult || activeResult.incorrectQuestionIds.length === 0) return;
    const incorrectQuestions = getQuestionsByIds(activeResult.incorrectQuestionIds);
    if (incorrectQuestions.length === 0) return;

    startQuiz(incorrectQuestions, {
      examId: activeResult.examId,
      examName: activeResult.examName,
      subjectId: activeResult.subjectId,
      subjectName: activeResult.subjectName,
      topicId: activeResult.topicId,
      topicName: activeResult.topicName,
      title: 'गलत प्रश्नों का अभ्यास (Revision)',
    });
  }, [activeResult, startQuiz]);

  // Exit Quiz
  const exitQuiz = useCallback(() => {
    clearQuizSession();
    setSession(null);
    setActiveResult(null);
    setIsConfirmingFinish(false);
  }, []);

  // Helper for Question Navigator Palette status
  const getQuestionPaletteStatus = useCallback((qId: string, index: number): PaletteQuestionStatus => {
    if (!session) return 'unanswered';
    const isCurrent = session.currentIndex === index;
    const hasAnswer = Boolean(session.selectedAnswers[qId]);
    const isMarked = Boolean(session.markedForReview[qId]);

    if (isCurrent) return 'current';
    if (hasAnswer && isMarked) return 'answered_marked';
    if (isMarked) return 'marked';
    if (hasAnswer) return 'answered';
    return 'unanswered';
  }, [session]);

  // Summary counts for current session
  const attemptedCount = session ? Object.keys(session.selectedAnswers).length : 0;
  const unansweredCount = session ? session.questionIds.length - attemptedCount : 0;
  const markedCount = session ? Object.values(session.markedForReview).filter(Boolean).length : 0;

  return {
    session,
    currentQuestions,
    currentIndex,
    currentQuestion,
    activeResult,
    isConfirmingFinish,
    setIsConfirmingFinish,
    attemptedCount,
    unansweredCount,
    markedCount,
    startQuiz,
    selectOption,
    clearAnswer,
    submitAnswer,
    toggleMarkForReview,
    goToNext,
    goToPrevious,
    skipQuestion,
    jumpToQuestion,
    finishQuiz,
    retryQuiz,
    practiceIncorrect,
    exitQuiz,
    getQuestionPaletteStatus,
    setActiveResult,
  };
}
