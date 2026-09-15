import { ArrowLeft, BookOpen, ChevronRight, HelpCircle, History, RotateCcw, Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { FinishConfirmModal } from '@/components/quiz/FinishConfirmModal';
import { QuestionNavigator } from '@/components/quiz/QuestionNavigator';
import { QuestionScreen } from '@/components/quiz/QuestionScreen';
import { QuizHistoryModal } from '@/components/quiz/QuizHistoryModal';
import { QuizResult } from '@/components/quiz/QuizResult';
import { QuizSetup } from '@/components/quiz/QuizSetup';
import { Button, Card, Container, Layout } from '@/components/site';
import { getExam, getSubject, getTopic } from '@/data/curriculum';
import { filterQuizQuestions, getQuestionsByIds } from '@/data/quiz/questions';
import type { MCQQuestion } from '@/data/quiz/types';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import {
  clearIncorrectQuestionIds,
  clearQuizSession,
  loadIncorrectQuestionIds,
  loadQuizHistory,
  saveQuizAttempt,
} from '@/lib/quiz-storage';

export default function QuizPage() {
  const params = useParams<{ examId?: string; subjectId?: string; topicId?: string }>();
  const [location, setLocation] = useLocation();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState(() => loadQuizHistory());

  const exam = params.examId ? getExam(params.examId) : undefined;
  const subject = params.subjectId ? getSubject(params.subjectId) : undefined;
  const topic = params.topicId ? getTopic(params.topicId) : undefined;

  // Invalid route parameter detection for graceful recovery
  const isInvalidExam = Boolean(params.examId && !exam);
  const isInvalidSubject = Boolean(params.subjectId && (!subject || (exam && subject.examId !== exam.id)));
  const isInvalidTopic = Boolean(params.topicId && (!topic || (subject && topic.subjectId !== subject.id)));
  const hasRouteError = isInvalidExam || isInvalidSubject || isInvalidTopic;

  const {
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
  } = useQuizEngine();

  // Refresh history whenever result is displayed or history modal opens
  useEffect(() => {
    setHistoryList(loadQuizHistory());
  }, [activeResult, isHistoryOpen]);

  const handleClearHistory = () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('examsetu4u_quiz_history');
        window.localStorage.removeItem('examsetu4u_quiz_last_result');
        clearIncorrectQuestionIds();
        setHistoryList([]);
      } catch (err) {
        console.warn('Failed to clear history:', err);
      }
    }
  };

  // Keyboard shortcut listener during active quiz session
  useEffect(() => {
    if (!session || !currentQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === '1' || e.key === 'a' || e.key === 'A') {
        selectOption('A');
      } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
        selectOption('B');
      } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
        selectOption('C');
      } else if (e.key === '4' || e.key === 'd' || e.key === 'D') {
        selectOption('D');
      } else if (e.key === 'Enter') {
        const isSubmitted = session.submittedAnswers[currentQuestion.id];
        if (!isSubmitted && session.selectedAnswers[currentQuestion.id]) {
          submitAnswer();
        } else if (isSubmitted) {
          goToNext();
        }
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, currentQuestion, selectOption, submitAnswer, goToNext, goToPrevious]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const items: { label: string; href?: string }[] = [
      { label: 'होम', href: '/' },
      { label: 'MCQ Quiz', href: '/quiz' },
    ];
    if (exam) {
      items.push({ label: exam.name, href: `/quiz/${exam.id}` });
    }
    if (subject) {
      items.push({ label: subject.name, href: `/quiz/${exam?.id}/${subject.id}` });
    }
    if (topic) {
      items.push({ label: topic.name });
    }
    return items;
  }, [exam, subject, topic]);

  return (
    <Layout>
      {/* Header section with Breadcrumbs - Prepare with purpose theme */}
      <section className="hero-wash text-white py-10 sm:py-14">
        <Container>
          <div className="text-blue-200">
            <Breadcrumbs items={breadcrumbItems} />
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur-xs">
                <Sparkles size={13} className="text-blue-300" /> Interactive Test Engine
              </span>
              <h1 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                MCQ <span className="text-blue-300">Quiz Engine</span>
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-blue-100/90 max-w-2xl leading-relaxed">
                परीक्षा, विषय और कठिनाई स्तर चुनकर अपनी परीक्षा तैयारी का स्व-मूल्यांकन करें।
              </p>
            </div>
            {historyList.length > 0 && !session && (
              <Button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-xs font-bold text-xs self-start sm:self-auto min-h-10"
                data-testid="button-view-quiz-history"
              >
                <History size={15} />
                <span>पिछला इतिहास ({historyList.length})</span>
              </Button>
            )}
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <section className="py-8 sm:py-12">
        <Container>
          {/* Graceful Error Handling for invalid route parameters */}
          {hasRouteError ? (
            <Card className="p-8 sm:p-12 text-center max-w-xl mx-auto border-dashed">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4">
                <HelpCircle size={28} />
              </div>
              <h2 className="font-display text-2xl text-[hsl(var(--primary))] font-bold">
                अमान्य चयन (Invalid Selection)
              </h2>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                आपके द्वारा चुना गया परीक्षा या विषय उपलब्ध नहीं है। कृपया Quiz होम पर जाकर उपलब्ध सूची में से चयन करें।
              </p>
              <Button href="/quiz" variant="primary" className="mt-6 inline-flex items-center gap-2">
                <RotateCcw size={16} />
                <span>Quiz होम पर लौटें</span>
              </Button>
            </Card>
          ) : activeResult ? (
            /* Result View */
            <QuizResult
              result={activeResult}
              onRetry={retryQuiz}
              onPracticeIncorrect={practiceIncorrect}
              onNewQuiz={() => {
                setActiveResult(null);
                clearQuizSession();
              }}
            />
          ) : session && currentQuestion ? (
            /* Active Question Screen + Navigator Layout */
            <div className="grid gap-8 lg:grid-cols-12 scroll-mt-24">
              {/* Question Screen (8 columns on desktop) */}
              <div className="lg:col-span-8">
                <QuestionScreen
                  question={currentQuestion}
                  currentIndex={currentIndex}
                  totalQuestions={currentQuestions.length}
                  examName={session.title.split('•')[0]?.trim() || exam?.name || 'ExamSetu4U'}
                  subjectName={subject?.name || 'शिक्षण कौशल'}
                  topicName={session.title.split('•')[1]?.trim() || topic?.name || 'MCQ Practice'}
                  selectedAnswer={session.selectedAnswers[currentQuestion.id]}
                  isSubmitted={Boolean(session.submittedAnswers[currentQuestion.id])}
                  isMarkedForReview={Boolean(session.markedForReview[currentQuestion.id])}
                  onSelectOption={selectOption}
                  onSubmitAnswer={submitAnswer}
                  onClearAnswer={clearAnswer}
                  onToggleReview={toggleMarkForReview}
                  onPrevious={goToPrevious}
                  onNext={goToNext}
                  onSkip={skipQuestion}
                  onFinishRequest={() => setIsConfirmingFinish(true)}
                  onExit={exitQuiz}
                />
              </div>

              {/* Question Palette Navigator (4 columns on desktop, sticky) */}
              <div className="lg:col-span-4">
                <div className="sticky top-20">
                  <QuestionNavigator
                    totalQuestions={currentQuestions.length}
                    questionIds={session.questionIds}
                    currentIndex={currentIndex}
                    getStatus={getQuestionPaletteStatus}
                    onSelectQuestion={jumpToQuestion}
                  />

                  {/* Finish Quiz button in Navigator column for easy desktop access */}
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setIsConfirmingFinish(true)}
                      className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3"
                      data-testid="button-palette-finish"
                    >
                      Quiz समाप्त करें
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Quiz Setup View */
            <div className="mx-auto max-w-4xl">
              <QuizSetup
                initialExamId={params.examId}
                initialSubjectId={params.subjectId}
                initialTopicId={params.topicId}
                onStartQuiz={startQuiz}
                onOpenHistory={() => setIsHistoryOpen(true)}
                hasHistory={historyList.length > 0}
              />
            </div>
          )}

          {/* Submission Confirmation Modal */}
          <FinishConfirmModal
            isOpen={isConfirmingFinish}
            totalQuestions={currentQuestions.length}
            attemptedCount={attemptedCount}
            unansweredCount={unansweredCount}
            markedCount={markedCount}
            onConfirm={finishQuiz}
            onCancel={() => setIsConfirmingFinish(false)}
          />

          {/* Previous Attempts History Modal */}
          <QuizHistoryModal
            isOpen={isHistoryOpen}
            history={historyList}
            onClose={() => setIsHistoryOpen(false)}
            onSelectAttempt={(attempt) => {
              setActiveResult(attempt);
              setIsHistoryOpen(false);
            }}
            onClearHistory={handleClearHistory}
          />
        </Container>
      </section>
    </Layout>
  );
}
