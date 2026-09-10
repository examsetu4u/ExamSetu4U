import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { FinishConfirmModal } from '@/components/quiz/FinishConfirmModal';
import { QuestionNavigator } from '@/components/quiz/QuestionNavigator';
import { QuestionScreen } from '@/components/quiz/QuestionScreen';
import { QuizResult } from '@/components/quiz/QuizResult';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { exams, getSubjectsForExam, getTopicsForSubject } from '@/data/curriculum';
import { MCQQuestion } from '@/data/quiz/types';
import { useQuizEngine } from '@/hooks/useQuizEngine';
import {
  convertMistakesToMCQs,
  filterAndSortMistakes,
  loadMistakes,
  MistakeQuestion,
} from '@/lib/mistakes';
import { clearQuizSession } from '@/lib/quiz-storage';

export default function MistakesPracticePage() {
  const searchStr = useSearch();
  const searchParams = useMemo(() => new URLSearchParams(searchStr), [searchStr]);

  const queryQuestionId = searchParams.get('questionId') || '';
  const queryExamId = searchParams.get('examId') || 'all';
  const querySubjectId = searchParams.get('subjectId') || 'all';
  const queryTopicId = searchParams.get('topicId') || 'all';
  const queryDifficulty = searchParams.get('difficulty') || 'all';
  const queryRevisionStatus = searchParams.get('revisionStatus') || 'all';

  // Local filter states for interactive setup
  const [selectedExamId, setSelectedExamId] = useState<string>(queryExamId);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(querySubjectId);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(queryTopicId);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(queryDifficulty);
  const [selectedStatus, setSelectedStatus] = useState<string>(queryRevisionStatus);

  const allMistakes = useMemo(() => loadMistakes(), []);

  // Filtered pool based on selection
  const eligibleMistakes = useMemo(() => {
    if (queryQuestionId) {
      return allMistakes.filter((m) => m.questionId === queryQuestionId || m.id === queryQuestionId);
    }
    return filterAndSortMistakes({
      examId: selectedExamId,
      subjectId: selectedSubjectId,
      topicId: selectedTopicId,
      difficulty: selectedDifficulty,
      revisionStatus: selectedStatus,
      sortBy: 'priority',
    });
  }, [allMistakes, queryQuestionId, selectedExamId, selectedSubjectId, selectedTopicId, selectedDifficulty, selectedStatus]);

  const subjectOptions = useMemo(() => {
    if (selectedExamId === 'all') return [];
    return getSubjectsForExam(selectedExamId);
  }, [selectedExamId]);

  const topicOptions = useMemo(() => {
    if (selectedSubjectId === 'all') return [];
    return getTopicsForSubject(selectedSubjectId);
  }, [selectedSubjectId]);

  // Quiz Engine Hook (Reused from Module 5)
  const {
    session,
    currentQuestions,
    currentIndex,
    currentQuestion,
    activeResult,
    isConfirmingFinish,
    setIsConfirmingFinish,
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

  // Keyboard shortcut listener during active session
  useEffect(() => {
    if (!session || !currentQuestion) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
        submitAnswer();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [session, currentQuestion, selectOption, submitAnswer, goToNext, goToPrevious]);

  // Auto-start if single question passed in query
  useEffect(() => {
    if (queryQuestionId && eligibleMistakes.length > 0 && !session && !activeResult) {
      const mcqs = convertMistakesToMCQs(eligibleMistakes);
      startQuiz(mcqs, {
        isRevision: true,
        examId: eligibleMistakes[0].examId,
        examName: eligibleMistakes[0].examName,
        subjectId: eligibleMistakes[0].subjectId,
        subjectName: eligibleMistakes[0].subjectName,
        topicId: eligibleMistakes[0].topicId,
        topicName: eligibleMistakes[0].topicName,
        title: `Revision: ${eligibleMistakes[0].topicName}`,
      });
    }
  }, [queryQuestionId, eligibleMistakes, session, activeResult, startQuiz]);

  const handleStartPractice = () => {
    if (eligibleMistakes.length === 0) return;
    const mcqs = convertMistakesToMCQs(eligibleMistakes);
    startQuiz(mcqs, {
      isRevision: true,
      title: 'Mistake Revision Practice',
    });
  };

  return (
    <Layout>
      {/* Header & Breadcrumbs */}
      <section className="paper-grid border-b border-[hsl(var(--border))] py-8 sm:py-10">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Mistake Book', href: '/mistakes' },
              { label: 'Practice Mistakes' },
            ]}
          />

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionTitle
              eyebrow="Revision Quiz Engine"
              as="h1"
              title="गलतियों का पुनरावलोकन (Mistake Practice)"
              description="अपनी पिछली गलतियों को हल करें। सही उत्तर देने पर वे 'सुधार' और 'मजबूत' स्थिति में बढ़ेंगी।"
            />

            {!session && (
              <Button href="/mistakes" variant="secondary">
                <ArrowLeft size={16} />
                <span>Mistake Book पर लौटें</span>
              </Button>
            )}
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <section className="py-8 sm:py-12">
        <Container>
          {activeResult ? (
            /* Result View: Reuses Module 5 QuizResult with Mistakes Improved Banner */
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
            /* Active Revision Quiz Layout */
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <QuestionScreen
                  question={currentQuestion}
                  currentIndex={currentIndex}
                  totalQuestions={currentQuestions.length}
                  examName={session.title}
                  subjectName="Mistake Book Revision"
                  topicName={currentQuestion.topicId || 'कमजोर प्रश्न अभ्यास'}
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

              <div className="lg:col-span-4">
                <div className="sticky top-20">
                  <QuestionNavigator
                    totalQuestions={currentQuestions.length}
                    questionIds={session.questionIds}
                    currentIndex={currentIndex}
                    getStatus={getQuestionPaletteStatus}
                    onSelectQuestion={jumpToQuestion}
                  />

                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setIsConfirmingFinish(true)}
                      className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3"
                      data-testid="button-palette-finish-revision"
                    >
                      Revision समाप्त करें
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Practice Setup Screen */
            <div className="mx-auto max-w-2xl">
              <Card className="p-6 sm:p-8" data-testid="card-mistake-practice-setup">
                <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[hsl(var(--primary))]">
                      अभ्यास के लिए प्रश्न चुनें
                    </h2>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      फ़िल्टर करें कि आप किन गलतियों का revision करना चाहते हैं
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Exam selection */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-1">
                      Exam (परीक्षा)
                    </label>
                    <select
                      value={selectedExamId}
                      onChange={(e) => {
                        setSelectedExamId(e.target.value);
                        setSelectedSubjectId('all');
                        setSelectedTopicId('all');
                      }}
                      className="focus-ring h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] outline-none"
                    >
                      <option value="all">सभी परीक्षाएं (All Mistakes - {allMistakes.length})</option>
                      {exams.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subject selection */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-1">
                      Subject (विषय)
                    </label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => {
                        setSelectedSubjectId(e.target.value);
                        setSelectedTopicId('all');
                      }}
                      disabled={selectedExamId === 'all'}
                      className="focus-ring h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] outline-none disabled:opacity-50"
                    >
                      <option value="all">सभी विषय (All Subjects)</option>
                      {subjectOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Topic selection */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-1">
                      Topic (प्रकरण)
                    </label>
                    <select
                      value={selectedTopicId}
                      onChange={(e) => setSelectedTopicId(e.target.value)}
                      disabled={selectedSubjectId === 'all'}
                      className="focus-ring h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] outline-none disabled:opacity-50"
                    >
                      <option value="all">सभी टॉपिक्स (All Topics)</option>
                      {topicOptions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-1">
                        Difficulty
                      </label>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="focus-ring h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] outline-none"
                      >
                        <option value="all">सभी स्तर (All)</option>
                        <option value="Easy">सरल (Easy)</option>
                        <option value="Moderate">मध्यम (Moderate)</option>
                        <option value="Hard">कठिन (Hard)</option>
                        <option value="Very Hard">अति कठिन (Very Hard)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] block mb-1">
                        Revision Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="focus-ring h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] outline-none"
                      >
                        <option value="all">सभी (All)</option>
                        <option value="NEEDS_REVISION">दोबारा पढ़ें (Needs Revision)</option>
                        <option value="IMPROVING">सुधार हो रहा है (Improving)</option>
                        <option value="MASTERED">मजबूत (Mastered)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Available count info */}
                <div className="mt-6 rounded-xl bg-[hsl(var(--secondary)/.6)] p-4 flex items-center justify-between text-sm">
                  <span className="text-[hsl(var(--muted-foreground))]">
                    अभ्यास के लिए उपलब्ध प्रश्न:
                  </span>
                  <span className="font-bold text-lg text-[hsl(var(--primary))]">
                    {eligibleMistakes.length} प्रश्न
                  </span>
                </div>

                {/* Start Button */}
                <div className="mt-6">
                  {eligibleMistakes.length > 0 ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleStartPractice}
                      className="w-full justify-center py-3 text-base shadow-sm"
                      data-testid="button-start-mistake-practice"
                    >
                      <Play size={18} />
                      <span>Revision शुरू करें ({eligibleMistakes.length} Questions)</span>
                    </Button>
                  ) : (
                    <div className="text-center p-3 rounded-lg border border-dashed text-xs text-[hsl(var(--muted-foreground))]">
                      चयनित फ़िल्टर के साथ कोई गलत प्रश्न नहीं मिला।
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </Container>
      </section>

      {/* Confirmation Modal when finishing active quiz */}
      {isConfirmingFinish && session && (
        <FinishConfirmModal
          totalCount={currentQuestions.length}
          attemptedCount={Object.keys(session.selectedAnswers).length}
          unansweredCount={currentQuestions.length - Object.keys(session.selectedAnswers).length}
          markedCount={Object.values(session.markedForReview).filter(Boolean).length}
          onConfirm={finishQuiz}
          onCancel={() => setIsConfirmingFinish(false)}
        />
      )}
    </Layout>
  );
}
