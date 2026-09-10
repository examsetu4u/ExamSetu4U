import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  Menu,
  Save,
  Send,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { Button, Card } from '@/components/site';
import { getSubject, getTopic } from '@/data/curriculum';
import { getMockTestById, getQuestionsForMockTest, getUnifiedQuestionById } from '@/data/mock/tests';
import type {
  MockActiveAttempt,
  MockAnswer,
  MockResult,
  SubjectPerformance,
  TopicPerformance,
} from '@/data/mock/types';
import type { MCQQuestion } from '@/data/quiz/types';
import {
  clearActiveMockAttempt,
  loadActiveMockAttempt,
  saveActiveMockAttempt,
  saveMockAttempt,
} from '@/lib/mock-test-storage';

export default function MockTestLiveExamPage() {
  const params = useParams<{ testId: string }>();
  const testId = params.testId || '';
  const [, setLocation] = useLocation();

  const testConfig = useMemo(() => getMockTestById(testId), [testId]);

  // Active attempt state
  const [activeAttempt, setActiveAttempt] = useState<MockActiveAttempt | null>(() => {
    const existing = loadActiveMockAttempt();
    if (existing && existing.testId === testId && !existing.isFinished) {
      return existing;
    }
    return null;
  });

  // Questions for this session
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [isPaletteOpenMobile, setIsPaletteOpenMobile] = useState(false);
  const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(0);
  const [timeWarning, setTimeWarning] = useState<string | null>(null);

  // Warning flags to prevent repeated alerts
  const warnedRef = useRef({ m10: false, m5: false, m1: false });
  const isSubmittingRef = useRef(false);

  // Initialize or restore attempt
  useEffect(() => {
    if (!testConfig) return;

    let attempt = loadActiveMockAttempt();
    if (!attempt || attempt.testId !== testId || attempt.isFinished) {
      // Create new session if none exists
      const qs = getQuestionsForMockTest(testConfig);
      if (qs.length === 0) {
        // Redirect to start page if empty
        setLocation(`/mock-tests/start/${testId}`);
        return;
      }

      const durationMs = testConfig.durationMinutes * 60 * 1000;
      const answersMap: Record<string, MockAnswer> = {};
      qs.forEach((q, idx) => {
        answersMap[q.id] = {
          questionId: q.id,
          visited: idx === 0,
          answered: false,
          markedForReview: false,
        };
      });

      attempt = {
        attemptId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        testId: testConfig.id,
        examId: testConfig.examId,
        testTitle: testConfig.title,
        startedAt: new Date().toISOString(),
        endTime: Date.now() + durationMs,
        durationMinutes: testConfig.durationMinutes,
        currentIndex: 0,
        questionIds: qs.map((q) => q.id),
        answers: answersMap,
        isFinished: false,
      };

      saveActiveMockAttempt(attempt);
      setActiveAttempt(attempt);
      setQuestions(qs);
    } else {
      // Restore questions from questionIds
      setActiveAttempt(attempt);
      const restored = attempt.questionIds
        .map((id) => getUnifiedQuestionById(id))
        .filter((q): q is MCQQuestion => Boolean(q));
      setQuestions(restored);
    }
  }, [testConfig, testId, setLocation]);

  // Countdown timer derived from static endTime (resistant to re-renders/refresh)
  useEffect(() => {
    if (!activeAttempt || activeAttempt.isFinished) return;

    const tick = () => {
      const remainingMs = activeAttempt.endTime - Date.now();
      const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
      setTimeRemainingSeconds(remainingSec);

      // Low time warnings (Requirement 6: 10m, 5m, 1m warnings)
      if (remainingSec <= 600 && remainingSec > 590 && !warnedRef.current.m10) {
        warnedRef.current.m10 = true;
        setTimeWarning('चेतावनी: केवल 10 मिनट शेष हैं!');
        setTimeout(() => setTimeWarning(null), 5000);
      } else if (remainingSec <= 300 && remainingSec > 290 && !warnedRef.current.m5) {
        warnedRef.current.m5 = true;
        setTimeWarning('चेतावनी: केवल 5 मिनट शेष हैं!');
        setTimeout(() => setTimeWarning(null), 5000);
      } else if (remainingSec <= 60 && remainingSec > 50 && !warnedRef.current.m1) {
        warnedRef.current.m1 = true;
        setTimeWarning('अंतिम चेतावनी: केवल 1 मिनट शेष है!');
        setTimeout(() => setTimeWarning(null), 5000);
      }

      // Automatically submit when timer reaches zero
      if (remainingSec <= 0 && !isSubmittingRef.current) {
        isSubmittingRef.current = true;
        handleFinishAndSubmit(true);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeAttempt]);

  // Anti-accident: Warn user before leaving active test (Requirement 22)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (activeAttempt && !activeAttempt.isFinished) {
        e.preventDefault();
        e.returnValue = 'मॉक टेस्ट प्रगति पर है। क्या आप वास्तव में छोड़ना चाहते हैं?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeAttempt]);

  // Current Question
  const currentIndex = activeAttempt ? activeAttempt.currentIndex : 0;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion && activeAttempt ? activeAttempt.answers[currentQuestion.id] : undefined;

  // Question Navigation Actions
  const jumpToQuestion = useCallback((index: number) => {
    setActiveAttempt((prev) => {
      if (!prev || index < 0 || index >= prev.questionIds.length) return prev;
      const targetId = prev.questionIds[index];
      const updatedAnswers = { ...prev.answers };
      if (updatedAnswers[targetId]) {
        updatedAnswers[targetId] = {
          ...updatedAnswers[targetId],
          visited: true,
        };
      }
      const nextState: MockActiveAttempt = {
        ...prev,
        currentIndex: index,
        answers: updatedAnswers,
      };
      saveActiveMockAttempt(nextState);
      return nextState;
    });
    setIsPaletteOpenMobile(false);
  }, []);

  const handleNext = useCallback(() => {
    if (!activeAttempt) return;
    if (currentIndex < questions.length - 1) {
      jumpToQuestion(currentIndex + 1);
    }
  }, [activeAttempt, currentIndex, questions.length, jumpToQuestion]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      jumpToQuestion(currentIndex - 1);
    }
  }, [currentIndex, jumpToQuestion]);

  // Select Option
  const handleSelectOption = useCallback((optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setActiveAttempt((prev) => {
      if (!prev) return null;
      const currentAns = prev.answers[qId] || {
        questionId: qId,
        visited: true,
        answered: false,
        markedForReview: false,
      };

      const updatedAns: MockAnswer = {
        ...currentAns,
        selectedAnswer: optionKey,
        answered: true,
        visited: true,
      };

      const nextState: MockActiveAttempt = {
        ...prev,
        answers: {
          ...prev.answers,
          [qId]: updatedAns,
        },
      };
      saveActiveMockAttempt(nextState);
      return nextState;
    });
  }, [currentQuestion]);

  // Clear Answer
  const handleClearAnswer = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setActiveAttempt((prev) => {
      if (!prev) return null;
      const currentAns = prev.answers[qId];
      if (!currentAns) return prev;

      const updatedAns: MockAnswer = {
        ...currentAns,
        selectedAnswer: undefined,
        answered: false,
      };

      const nextState: MockActiveAttempt = {
        ...prev,
        answers: {
          ...prev.answers,
          [qId]: updatedAns,
        },
      };
      saveActiveMockAttempt(nextState);
      return nextState;
    });
  }, [currentQuestion]);

  // Toggle Mark for Review
  const handleToggleMarkForReview = useCallback(() => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;

    setActiveAttempt((prev) => {
      if (!prev) return null;
      const currentAns = prev.answers[qId] || {
        questionId: qId,
        visited: true,
        answered: false,
        markedForReview: false,
      };

      const updatedAns: MockAnswer = {
        ...currentAns,
        markedForReview: !currentAns.markedForReview,
        visited: true,
      };

      const nextState: MockActiveAttempt = {
        ...prev,
        answers: {
          ...prev.answers,
          [qId]: updatedAns,
        },
      };
      saveActiveMockAttempt(nextState);
      return nextState;
    });
  }, [currentQuestion]);

  // Save & Next
  const handleSaveAndNext = useCallback(() => {
    handleNext();
  }, [handleNext]);

  // Calculate Palette Status for each question
  const getQuestionStatus = useCallback((qId: string) => {
    if (!activeAttempt) return 'unanswered';
    const ans = activeAttempt.answers[qId];
    if (!ans) return 'unanswered';

    const hasAnswer = Boolean(ans.selectedAnswer);
    const isMarked = Boolean(ans.markedForReview);

    if (hasAnswer && isMarked) return 'answered_marked';
    if (isMarked) return 'marked';
    if (hasAnswer) return 'answered';
    return 'unanswered';
  }, [activeAttempt]);

  // Summary counts for Confirmation Modal & Palette
  const summaryCounts = useMemo(() => {
    if (!activeAttempt) return { attempted: 0, unanswered: 0, marked: 0, answeredMarked: 0 };
    let attempted = 0;
    let marked = 0;
    let answeredMarked = 0;

    Object.values(activeAttempt.answers).forEach((ans) => {
      const hasAns = Boolean(ans.selectedAnswer);
      const isMarked = Boolean(ans.markedForReview);
      if (hasAns) attempted++;
      if (isMarked && !hasAns) marked++;
      if (isMarked && hasAns) answeredMarked++;
    });

    const total = activeAttempt.questionIds.length;
    const unanswered = Math.max(0, total - attempted);

    return { attempted, unanswered, marked, answeredMarked, total };
  }, [activeAttempt]);

  // Calculate & Submit Test Results
  const handleFinishAndSubmit = useCallback((autoSubmitted = false) => {
    if (!activeAttempt || !testConfig || questions.length === 0) return;
    isSubmittingRef.current = true;

    const totalCount = questions.length;
    let correctCount = 0;
    let incorrectCount = 0;
    const userAnswersRecord: Record<string, 'A' | 'B' | 'C' | 'D'> = {};
    const markedForReviewIds: string[] = [];

    // Subject and Topic tracking maps
    const subjectStatsMap: Record<string, { total: number; correct: number; incorrect: number; attempted: number }> = {};
    const topicStatsMap: Record<string, { total: number; correct: number; incorrect: number; subjectId: string }> = {};

    questions.forEach((q) => {
      const ans = activeAttempt.answers[q.id];
      const selected = ans?.selectedAnswer;

      if (ans?.markedForReview) {
        markedForReviewIds.push(q.id);
      }

      // Initialize subject stats
      if (!subjectStatsMap[q.subjectId]) {
        subjectStatsMap[q.subjectId] = { total: 0, correct: 0, incorrect: 0, attempted: 0 };
      }
      subjectStatsMap[q.subjectId].total += 1;

      // Initialize topic stats
      if (!topicStatsMap[q.topicId]) {
        topicStatsMap[q.topicId] = { total: 0, correct: 0, incorrect: 0, subjectId: q.subjectId };
      }
      topicStatsMap[q.topicId].total += 1;

      if (selected) {
        userAnswersRecord[q.id] = selected;
        subjectStatsMap[q.subjectId].attempted += 1;

        if (selected === q.correctAnswer) {
          correctCount++;
          subjectStatsMap[q.subjectId].correct += 1;
          topicStatsMap[q.topicId].correct += 1;
        } else {
          incorrectCount++;
          subjectStatsMap[q.subjectId].incorrect += 1;
          topicStatsMap[q.topicId].incorrect += 1;
        }
      }
    });

    const attemptedCount = Object.keys(userAnswersRecord).length;
    const unansweredCount = totalCount - attemptedCount;

    // Negative marking calculations
    const marksPerQ = testConfig.marksPerQuestion || 1;
    const positiveMarks = correctCount * marksPerQ;
    const negativeMarksDeducted = testConfig.negativeMarking
      ? Math.round(incorrectCount * testConfig.negativeMarks * 100) / 100
      : 0;

    const rawFinalScore = positiveMarks - negativeMarksDeducted;
    const finalScore = Math.max(0, Math.round(rawFinalScore * 100) / 100);
    const maxMarks = totalCount * marksPerQ;
    const percentage = maxMarks > 0 ? Math.round((finalScore / maxMarks) * 100) : 0;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    // Time calculations
    const totalDurationSec = testConfig.durationMinutes * 60;
    const remainingSec = Math.max(0, Math.floor((activeAttempt.endTime - Date.now()) / 1000));
    const timeUsedSec = Math.max(1, totalDurationSec - remainingSec);
    const avgTimeSec = attemptedCount > 0 ? Math.round(timeUsedSec / attemptedCount) : 0;

    // Subject-wise performance array
    const subjectWise: SubjectPerformance[] = Object.entries(subjectStatsMap).map(([sId, stats]) => {
      const subjectObj = getSubject(sId);
      const subScore = stats.correct * marksPerQ - (testConfig.negativeMarking ? stats.incorrect * testConfig.negativeMarks : 0);
      return {
        subjectId: sId,
        subjectName: subjectObj?.name || sId,
        totalQuestions: stats.total,
        attempted: stats.attempted,
        correct: stats.correct,
        incorrect: stats.incorrect,
        unanswered: stats.total - stats.attempted,
        accuracy: stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0,
        score: Math.max(0, Math.round(subScore * 100) / 100),
        maxScore: stats.total * marksPerQ,
      };
    });

    // Topic-wise performance array
    const topicWise: TopicPerformance[] = Object.entries(topicStatsMap).map(([tId, stats]) => {
      const topicObj = getTopic(tId);
      const subjectObj = getSubject(stats.subjectId);
      const topicAcc = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      let status: 'Mastered' | 'Needs Improvement' | 'Weak' = 'Needs Improvement';
      if (topicAcc >= 75) status = 'Mastered';
      else if (topicAcc < 50) status = 'Weak';

      return {
        topicId: tId,
        topicName: topicObj?.name || tId,
        subjectId: stats.subjectId,
        subjectName: subjectObj?.name || stats.subjectId,
        totalQuestions: stats.total,
        correct: stats.correct,
        incorrect: stats.incorrect,
        accuracy: topicAcc,
        status,
      };
    });

    const result: MockResult = {
      attemptId: activeAttempt.attemptId,
      testId: testConfig.id,
      testTitle: testConfig.title,
      examId: testConfig.examId,
      examName: testConfig.title.split(' ')[0] || 'ExamSetu4U',
      date: new Date().toISOString(),
      totalQuestions: totalCount,
      attempted: attemptedCount,
      correct: correctCount,
      incorrect: incorrectCount,
      unanswered: unansweredCount,
      markedForReview: markedForReviewIds.length,
      marksPerQuestion: marksPerQ,
      negativeMarking: testConfig.negativeMarking,
      negativeMarks: testConfig.negativeMarks,
      positiveMarks,
      negativeMarksDeducted,
      finalScore,
      maxMarks,
      percentage,
      accuracy,
      durationMinutes: testConfig.durationMinutes,
      timeUsedSeconds: timeUsedSec,
      timeRemainingSeconds: remainingSec,
      questionIds: activeAttempt.questionIds,
      userAnswers: userAnswersRecord,
      markedForReviewIds,
      subjectWise,
      topicWise,
      averageTimePerQuestionSeconds: avgTimeSec,
    };

    saveMockAttempt(result);
    clearActiveMockAttempt();
    setLocation(`/mock-tests/result/${result.attemptId}`);
  }, [activeAttempt, testConfig, questions, setLocation]);

  if (!testConfig || !activeAttempt || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] p-4 text-center">
        <Card className="max-w-md p-8">
          <Clock size={40} className="mx-auto text-[hsl(var(--primary))] animate-spin mb-3" />
          <h2 className="font-display text-lg font-bold">मॉक टेस्ट लोड हो रहा है...</h2>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            कृपया प्रतीक्षा करें, आपकी परीक्षा सामग्री लोड की जा रही है।
          </p>
        </Card>
      </div>
    );
  }

  // Format Time for Display (HH:MM:SS or MM:SS)
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemainingSeconds <= 300; // <= 5 minutes
  const isCriticalTime = timeRemainingSeconds <= 60; // <= 1 minute

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))] select-none">
      {/* 1. TOP EXAM HEADER (Fixed / Clear Timer Area - Requirement 5 & 6) */}
      <header className="sticky top-0 z-30 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm px-4 py-2.5 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          {/* Test Name & Progress */}
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-display text-xs sm:text-sm font-black text-[hsl(var(--foreground))] truncate max-w-[140px] sm:max-w-xs md:max-w-md">
              {testConfig.title}
            </span>
            <span className="hidden sm:inline-flex rounded bg-[hsl(var(--secondary))] px-2 py-0.5 text-[11px] font-bold text-[hsl(var(--primary))]">
              प्रश्न {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Center / Right: Countdown Timer + Submit Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Timer Badge */}
            <div
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-mono font-black transition-colors ${
                isCriticalTime
                  ? 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                  : isLowTime
                  ? 'border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.6)] text-[hsl(var(--foreground))]'
              }`}
              title="शेष समय"
              aria-label={`शेष समय: ${formatTimer(timeRemainingSeconds)}`}
            >
              <Clock size={14} className={isLowTime ? 'text-amber-600 dark:text-amber-400' : ''} />
              <span>{formatTimer(timeRemainingSeconds)}</span>
            </div>

            {/* Mobile Palette Toggle Button (Requirement 7 & 23) */}
            <button
              onClick={() => setIsPaletteOpenMobile(!isPaletteOpenMobile)}
              className="lg:hidden flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-2.5 py-1.5 text-xs font-medium text-[hsl(var(--foreground))]"
              aria-label="Question palette"
            >
              <Menu size={14} />
              <span className="text-[11px]">Q-{currentIndex + 1}</span>
            </button>

            {/* Submit Test Button */}
            <Button
              onClick={() => setIsSubmitConfirmOpen(true)}
              variant="primary"
              className="text-xs min-h-8 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              data-testid="button-open-submit-modal"
            >
              <Send size={13} />
              <span>Submit Test</span>
            </Button>
          </div>
        </div>

        {/* Low Time Warning Banner */}
        {timeWarning && (
          <div className="mt-1.5 flex items-center justify-center gap-2 rounded bg-amber-500 py-1 text-xs font-bold text-white shadow-sm animate-bounce">
            <AlertTriangle size={14} />
            <span>{timeWarning}</span>
          </div>
        )}
      </header>

      {/* 2. MAIN EXAM INTERFACE (Split Layout on Desktop, Fluid on Mobile) */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col lg:flex-row gap-6 p-4 sm:p-6">
        {/* Left Column: Active Question & Options Area */}
        <main className="flex-1 flex flex-col justify-between" role="main">
          {currentQuestion ? (
            <div>
              {/* Question Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[hsl(var(--border))] pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[hsl(var(--primary))] px-2.5 py-0.5 font-bold text-[hsl(var(--primary-foreground))]">
                    प्रश्न {currentIndex + 1}
                  </span>
                  <span className="text-[hsl(var(--muted-foreground))]">
                    (कुल {questions.length} में से)
                  </span>
                  {currentQuestion.sourceType === 'PYQ' && (
                    <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      PYQ {currentQuestion.year || ''}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[hsl(var(--muted-foreground))]">
                    अंक: +{testConfig.marksPerQuestion}
                    {testConfig.negativeMarking ? ` / -${testConfig.negativeMarks}` : ''}
                  </span>
                </div>
              </div>

              {/* Question Prompt Text (Large, comfortable font - Requirement 23) */}
              <div className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:p-6 shadow-sm">
                <p className="text-base sm:text-lg font-semibold text-[hsl(var(--foreground))] leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Multiple Choice Options (A, B, C, D) */}
              <div className="mt-5 space-y-3" role="radiogroup" aria-label="उत्तर विकल्प">
                {(['A', 'B', 'C', 'D'] as const).map((key) => {
                  const optionText = currentQuestion.options[key];
                  const isSelected = currentAnswer?.selectedAnswer === key;

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      role="radio"
                      aria-checked={isSelected}
                      className={`w-full flex items-start gap-3.5 rounded-xl border p-4 text-left text-sm sm:text-base transition min-h-[52px] ${
                        isSelected
                          ? 'border-[hsl(var(--primary))] bg-primary/10 text-[hsl(var(--foreground))] font-medium ring-2 ring-[hsl(var(--primary)/.4)]'
                          : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/.5)] hover:bg-[hsl(var(--secondary)/.5)]'
                      }`}
                      data-testid={`option-${key}`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold transition ${
                          isSelected
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                            : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'
                        }`}
                      >
                        {key}
                      </span>
                      <span className="flex-1 leading-snug pt-0.5">{optionText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <AlertCircle size={32} className="mx-auto text-amber-500 mb-2" />
              <p>प्रश्न लोड नहीं हो सका।</p>
            </div>
          )}

          {/* 3. CONTROLS BAR (Requirement 5: Previous, Next, Save & Next, Mark for Review, Clear Answer) */}
          <div className="mt-8 border-t border-[hsl(var(--border))] pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Left group: Mark for Review & Clear Answer */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleToggleMarkForReview}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition min-h-[40px] ${
                    currentAnswer?.markedForReview
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]'
                  }`}
                  data-testid="button-mark-for-review"
                >
                  <Bookmark size={14} className={currentAnswer?.markedForReview ? 'fill-indigo-600' : ''} />
                  <span>
                    {currentAnswer?.markedForReview ? 'Marked for Review' : 'Mark for Review'}
                  </span>
                </button>

                <button
                  onClick={handleClearAnswer}
                  disabled={!currentAnswer?.selectedAnswer}
                  className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition min-h-[40px]"
                  data-testid="button-clear-answer"
                >
                  <X size={14} />
                  <span>Clear Answer</span>
                </button>
              </div>

              {/* Right group: Previous, Next, Save & Next */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] disabled:opacity-40 disabled:cursor-not-allowed min-h-[40px]"
                  data-testid="button-prev"
                >
                  <ArrowLeft size={14} />
                  <span>Previous</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={handleSaveAndNext}
                    className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] hover:opacity-90 shadow-sm min-h-[40px]"
                    data-testid="button-save-next"
                  >
                    <span>Save & Next</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSubmitConfirmOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm min-h-[40px]"
                    data-testid="button-save-submit"
                  >
                    <Send size={13} />
                    <span>Save & Submit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Right Column: Question Navigator / Palette (Requirement 7 & 23) */}
        <aside
          className={`lg:w-80 shrink-0 border border-[hsl(var(--border))] rounded-2xl bg-[hsl(var(--card))] p-5 shadow-sm lg:block ${
            isPaletteOpenMobile
              ? 'fixed inset-x-4 top-16 bottom-4 z-40 overflow-y-auto block bg-[hsl(var(--card))]'
              : 'hidden'
          }`}
          aria-label="Question Navigator Palette"
        >
          {/* Mobile close header */}
          <div className="flex items-center justify-between lg:hidden border-b border-[hsl(var(--border))] pb-2 mb-3">
            <span className="font-bold text-sm">Question Navigator</span>
            <button
              onClick={() => setIsPaletteOpenMobile(false)}
              className="p-1 rounded text-[hsl(var(--muted-foreground))]"
            >
              <X size={18} />
            </button>
          </div>

          <h3 className="font-display text-sm font-bold text-[hsl(var(--foreground))] flex items-center justify-between">
            <span>प्रश्न पैलेट (Question Palette)</span>
            <span className="text-xs font-normal text-[hsl(var(--muted-foreground))]">
              {summaryCounts.attempted} / {questions.length} हल
            </span>
          </h3>

          {/* Palette Legend (Requirement 7) */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] border-b border-[hsl(var(--border))] pb-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-600 shrink-0" />
              <span className="text-[hsl(var(--muted-foreground))]">उत्तर दिया ({summaryCounts.attempted})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--secondary))] border border-[hsl(var(--border))] shrink-0" />
              <span className="text-[hsl(var(--muted-foreground))]">अनुत्तरित ({summaryCounts.unanswered})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-indigo-600 shrink-0" />
              <span className="text-[hsl(var(--muted-foreground))]">रिव्यू हेतु ({summaryCounts.marked})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-indigo-600 ring-2 ring-emerald-500 shrink-0" />
              <span className="text-[hsl(var(--muted-foreground))]">उत्तर + रिव्यू ({summaryCounts.answeredMarked})</span>
            </div>
          </div>

          {/* Question Numbers Grid */}
          <div className="mt-4 grid grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const status = getQuestionStatus(q.id);
              const isCurrent = currentIndex === idx;

              let style = 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] border-[hsl(var(--border))]';

              if (status === 'answered_marked') {
                style = 'bg-indigo-600 text-white border-emerald-400 ring-2 ring-emerald-500 font-bold';
              } else if (status === 'marked') {
                style = 'bg-indigo-600 text-white border-indigo-600 font-bold';
              } else if (status === 'answered') {
                style = 'bg-emerald-600 text-white border-emerald-600 font-bold';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => jumpToQuestion(idx)}
                  className={`flex h-9 w-full items-center justify-center rounded-lg border text-xs font-semibold transition ${style} ${
                    isCurrent ? 'ring-2 ring-[hsl(var(--primary))] ring-offset-2 ring-offset-[hsl(var(--card))]' : ''
                  }`}
                  data-testid={`palette-btn-${idx + 1}`}
                  title={`प्रश्न ${idx + 1} (${status})`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Bottom Submit Action */}
          <div className="mt-6 border-t border-[hsl(var(--border))] pt-4">
            <Button
              onClick={() => setIsSubmitConfirmOpen(true)}
              variant="primary"
              className="w-full text-xs min-h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <Send size={14} />
              <span>Submit Mock Test</span>
            </Button>
          </div>
        </aside>
      </div>

      {/* 4. SUBMIT CONFIRMATION MODAL (Requirement 9) */}
      {isSubmitConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <Card className="w-full max-w-md p-6 shadow-2xl border-[hsl(var(--border))] animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-[hsl(var(--primary))]">
                <HelpCircle size={22} />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-[hsl(var(--foreground))]">
                  टेस्ट सबमिशन की पुष्टि करें
                </h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  क्या आप test submit करना चाहते हैं?
                </p>
              </div>
            </div>

            {/* Status Breakdown (Requirement 9) */}
            <div className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.4)] p-4 text-xs space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-[hsl(var(--muted-foreground))]">कुल प्रश्न (Total Questions):</span>
                <span className="font-bold text-[hsl(var(--foreground))]">{summaryCounts.total}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-emerald-700 dark:text-emerald-400">हल किए गए प्रश्न (Attempted):</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{summaryCounts.attempted}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-[hsl(var(--muted-foreground))]">अनुत्तरित प्रश्न (Unanswered):</span>
                <span className="font-bold text-[hsl(var(--foreground))]">{summaryCounts.unanswered}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-indigo-700 dark:text-indigo-400">मार्क फॉर रिव्यू (Marked for Review):</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-400">
                  {summaryCounts.marked + summaryCounts.answeredMarked}
                </span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-[hsl(var(--border))]">
                <span className="text-[hsl(var(--muted-foreground))]">शेष समय (Time Remaining):</span>
                <span className="font-bold font-mono text-[hsl(var(--foreground))]">
                  {formatTimer(timeRemainingSeconds)}
                </span>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-[hsl(var(--muted-foreground))] text-center">
              सबमिशन के उपरांत आप उत्तरों में संशोधन नहीं कर पाएंगे।
            </p>

            {/* Modal Actions */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setIsSubmitConfirmOpen(false)}
                className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-2 text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))] min-h-[40px]"
                data-testid="button-cancel-submit"
              >
                Continue Test (जारी रखें)
              </button>
              <button
                onClick={() => handleFinishAndSubmit(false)}
                className="flex-1 rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm min-h-[40px]"
                data-testid="button-confirm-submit"
              >
                Submit Test (सबमिट करें)
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
