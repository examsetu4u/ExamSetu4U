import {
  AlertCircle,
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Filter,
  History,
  Info,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { Button, Card, Footer, Header } from '@/components/site';
import { getSubject, getTopic } from '@/data/curriculum';
import { getMockTestById, getUnifiedQuestionById } from '@/data/mock/tests';
import type { MockResult } from '@/data/mock/types';
import type { MCQQuestion } from '@/data/quiz/types';
import { recordQuizMistake } from '@/lib/mistakes';
import { getMockAttemptById } from '@/lib/mock-test-storage';

export default function MockTestResultPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params.attemptId || '';
  const [, setLocation] = useLocation();

  const result: MockResult | undefined = useMemo(() => getMockAttemptById(attemptId), [attemptId]);
  const testConfig = useMemo(() => (result ? getMockTestById(result.testId) : undefined), [result]);

  // Filter for question analysis
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered' | 'marked'>('all');
  const [addedMistakeIds, setAddedMistakeIds] = useState<Record<string, boolean>>({});
  const [batchMistakeMessage, setBatchMistakeMessage] = useState<string | null>(null);

  // Re-hydrate questions for review
  const questions: MCQQuestion[] = useMemo(() => {
    if (!result) return [];
    return result.questionIds
      .map((id) => getUnifiedQuestionById(id))
      .filter((q): q is MCQQuestion => Boolean(q));
  }, [result]);

  // Questions filtered by review filter
  const filteredQuestions = useMemo(() => {
    if (!result) return [];
    return questions.filter((q) => {
      const userAns = result.userAnswers[q.id];
      const isMarked = result.markedForReviewIds.includes(q.id);
      const isCorrect = userAns === q.correctAnswer;

      if (filter === 'correct') return isCorrect;
      if (filter === 'incorrect') return userAns && !isCorrect;
      if (filter === 'unanswered') return !userAns;
      if (filter === 'marked') return isMarked;
      return true;
    });
  }, [questions, result, filter]);

  // Format Seconds to MMm SSs
  const formatTimeSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    if (mins === 0) return `${remainingSec}s`;
    return `${mins}m ${remainingSec}s`;
  };

  // Add a single question to Mistake Book (Module 10 integration)
  const handleAddToMistakeBook = (q: MCQQuestion, userAns?: 'A' | 'B' | 'C' | 'D') => {
    if (!userAns) return;
    recordQuizMistake(q, userAns);
    setAddedMistakeIds((prev) => ({ ...prev, [q.id]: true }));
  };

  // Batch Add all incorrect questions to Mistake Book (Requirement 12)
  const handleAddAllIncorrectToMistakes = () => {
    if (!result) return;
    let count = 0;
    const nextAdded = { ...addedMistakeIds };

    questions.forEach((q) => {
      const userAns = result.userAnswers[q.id];
      if (userAns && userAns !== q.correctAnswer) {
        recordQuizMistake(q, userAns);
        nextAdded[q.id] = true;
        count++;
      }
    });

    setAddedMistakeIds(nextAdded);
    setBatchMistakeMessage(`${count} गलत प्रश्न मिस्टेक बुक (Mistake Book) में जोड़ दिए गए हैं!`);
    setTimeout(() => setBatchMistakeMessage(null), 4000);
  };

  if (!result) {
    return (
      <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <Header />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center p-8 text-center">
          <AlertCircle size={48} className="text-rose-500 mb-3" />
          <h1 className="font-display text-2xl font-bold">परिणाम नहीं मिला</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            अनुरोधित मॉक टेस्ट प्रयास ({attemptId}) उपलब्ध नहीं है।
          </p>
          <Button href="/mock-tests" variant="primary" className="mt-4 text-xs">
            मॉक टेस्ट सूची पर लौटें
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isPassed = result.percentage >= 50;

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <div className="flex items-center gap-1.5">
            <Link href="/" className="hover:text-[hsl(var(--foreground))]">होम</Link>
            <span>/</span>
            <Link href="/mock-tests" className="hover:text-[hsl(var(--foreground))]">मॉक टेस्ट</Link>
            <span>/</span>
            <span className="font-semibold text-[hsl(var(--foreground))]">परिणाम विश्लेषण</span>
          </div>

          <div className="flex items-center gap-2">
            <Button href="/mock-tests/history" variant="outline" className="text-xs min-h-8 py-1 px-3">
              <History size={14} />
              <span>सभी प्रयास (History)</span>
            </Button>
          </div>
        </div>

        {/* 1. TOP RESULT HERO CARD (Requirement 10) */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--secondary)/.35)] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--secondary))] px-3 py-1 text-xs font-bold text-[hsl(var(--primary))]">
                <Trophy size={14} />
                <span>{result.examName} • मॉक टेस्ट परिणाम</span>
              </span>
              <h1 className="font-display mt-3 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
                {result.testTitle}
              </h1>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                सत्र संपन्न: {new Date(result.date).toLocaleString('hi-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>

            {/* Score Display Card */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center shadow-xs min-w-[200px]">
              <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">अंतिम स्कोर (Final Score)</span>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="text-4xl font-black tracking-tight text-[hsl(var(--foreground))]">
                  {result.finalScore}
                </span>
                <span className="text-base text-[hsl(var(--muted-foreground))] font-bold">
                  / {result.maxMarks}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {result.percentage}% अंक
                </span>
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  {result.accuracy}% सटीकता
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Metric Badges Grid (Requirement 10) */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6 border-t border-[hsl(var(--border))] pt-6 text-xs">
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
              <span className="text-[hsl(var(--muted-foreground))]">कुल प्रश्न:</span>
              <p className="text-base font-bold text-[hsl(var(--foreground))] mt-0.5">{result.totalQuestions}</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">सही (Correct):</span>
              <p className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">+{result.correct}</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
              <span className="text-rose-700 dark:text-rose-400 font-medium">गलत (Incorrect):</span>
              <p className="text-base font-bold text-rose-700 dark:text-rose-400 mt-0.5">-{result.incorrect}</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
              <span className="text-[hsl(var(--muted-foreground))]">अनुत्तरित:</span>
              <p className="text-base font-bold text-[hsl(var(--foreground))] mt-0.5">{result.unanswered}</p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
              <span className="text-[hsl(var(--muted-foreground))]">व्यतीत समय:</span>
              <p className="text-base font-bold text-[hsl(var(--foreground))] mt-0.5">
                {formatTimeSeconds(result.timeUsedSeconds)}
              </p>
            </div>
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
              <span className="text-[hsl(var(--muted-foreground))]">औसत समय/प्रश्न:</span>
              <p className="text-base font-bold text-[hsl(var(--foreground))] mt-0.5">
                {result.averageTimePerQuestionSeconds}s / प्रश्न
              </p>
            </div>
          </div>

          {/* Negative Marking Breakdown if Configured (Requirement 10) */}
          {result.negativeMarking && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs dark:border-rose-900/40 dark:bg-rose-950/20">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-medium">
                <Info size={14} className="text-rose-600" />
                <span>नकारात्मक अंकन गणना (Negative Marking Analysis):</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-semibold text-rose-950 dark:text-rose-100">
                <span>धनात्मक अंक: +{result.positiveMarks}</span>
                <span>कटौती: -{result.negativeMarksDeducted}</span>
                <span className="font-bold underline">अंतिम अंक: {result.finalScore}</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              href={`/mock-tests/start/${result.testId}`}
              variant="primary"
              className="text-xs min-h-9"
              data-testid="button-retry-test"
            >
              <RotateCcw size={14} />
              <span>Retake Test (पुनः टेस्ट दें)</span>
            </Button>
            <Button
              href="/mock-tests"
              variant="outline"
              className="text-xs min-h-9"
            >
              <span>अन्य मॉक टेस्ट</span>
            </Button>
          </div>

          {result.incorrect > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddAllIncorrectToMistakes}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 transition min-h-9"
                data-testid="button-add-all-mistakes"
              >
                <Sparkles size={14} className="text-amber-600" />
                <span>Add All Incorrect to Mistake Book</span>
              </button>
            </div>
          )}
        </div>

        {batchMistakeMessage && (
          <div className="mt-3 rounded-lg bg-emerald-600 p-2.5 text-center text-xs font-bold text-white shadow-sm animate-in fade-in">
            {batchMistakeMessage}
          </div>
        )}

        {/* 2. SUBJECT-WISE PERFORMANCE ANALYSIS (Requirement 16) */}
        {result.subjectWise && result.subjectWise.length > 0 && (
          <div className="mt-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
              <Target size={18} className="text-[hsl(var(--primary))]" />
              <span>विषयवार प्रदर्शन विश्लेषण (Subject-Wise Performance)</span>
            </h2>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              प्रत्येक विषय में आपके द्वारा हल किए गए प्रश्नों और सटीकता का विवरण:
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] font-semibold">
                    <th className="pb-3 pr-4">विषय (Subject)</th>
                    <th className="pb-3 px-3 text-center">कुल प्रश्न</th>
                    <th className="pb-3 px-3 text-center">हल किए</th>
                    <th className="pb-3 px-3 text-center text-emerald-600">सही</th>
                    <th className="pb-3 px-3 text-center text-rose-600">गलत</th>
                    <th className="pb-3 px-3 text-center">सटीकता (Accuracy)</th>
                    <th className="pb-3 pl-3 text-right">प्राप्तांक (Score)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {result.subjectWise.map((sub) => (
                    <tr key={sub.subjectId} className="hover:bg-[hsl(var(--secondary)/.3)] transition-colors">
                      <td className="py-3 pr-4 font-bold text-[hsl(var(--foreground))]">
                        {sub.subjectName}
                      </td>
                      <td className="py-3 px-3 text-center text-[hsl(var(--muted-foreground))]">
                        {sub.totalQuestions}
                      </td>
                      <td className="py-3 px-3 text-center text-[hsl(var(--foreground))] font-medium">
                        {sub.attempted}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">
                        {sub.correct}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-rose-600">
                        {sub.incorrect}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            sub.accuracy >= 75
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : sub.accuracy >= 50
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {sub.accuracy}%
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-right font-black text-[hsl(var(--foreground))]">
                        {sub.score} / {sub.maxScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. TOPIC-WISE WEAK & STRONG AREA ANALYSIS (Requirement 17) */}
        {result.topicWise && result.topicWise.length > 0 && (
          <div className="mt-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
              <Award size={18} className="text-[hsl(var(--primary))]" />
              <span>टॉपिकवार विश्लेषण एवं सुझाव (Topic Performance & Revision)</span>
            </h2>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              कमजोर टॉपिक्स को पहचानें और तुरंत अभ्यास शुरू करें:
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {result.topicWise.map((top) => (
                <div
                  key={top.topicId}
                  className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.25)] p-4 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">
                        {top.subjectName}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          top.status === 'Mastered'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : top.status === 'Needs Improvement'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {top.status === 'Mastered' ? 'मजबूत' : top.status === 'Needs Improvement' ? 'सुधार आवश्यक' : 'कमजोर (Weak)'}
                      </span>
                    </div>

                    <h3 className="font-display mt-2 font-bold text-[hsl(var(--foreground))]">
                      {top.topicName}
                    </h3>
                    <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                      सटीकता: {top.accuracy}% ({top.correct}/{top.totalQuestions} सही)
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[hsl(var(--border))]">
                    <Link
                      href={`/quiz/${result.examId}/${top.subjectId}/${top.topicId}`}
                      className="text-xs font-bold text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
                    >
                      <span>Practice Topic (अभ्यास करें)</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. QUESTION-WISE DETAILED REVIEW (Requirement 11 & 12) */}
        <div className="mt-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[hsl(var(--border))] pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[hsl(var(--foreground))]">
                विस्तृत प्रश्न समीक्षा (Question-Wise Solution & Review)
              </h2>
              <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                प्रत्येक प्रश्न का सही उत्तर, व्याख्या और महत्वपूर्ण परीक्षा बिंदु:
              </p>
            </div>

            {/* Filter Pills (Requirement 12: All, Correct, Incorrect, Unanswered, Marked) */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: `सभी (${questions.length})` },
                { id: 'correct', label: `सही (${result.correct})` },
                { id: 'incorrect', label: `गलत (${result.incorrect})` },
                { id: 'unanswered', label: `अनुत्तरित (${result.unanswered})` },
                { id: 'marked', label: `रिव्यू (${result.markedForReview})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setFilter(pill.id as any)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    filter === pill.id
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xs'
                      : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                  data-testid={`filter-review-${pill.id}`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Review Cards List */}
          <div className="mt-6 space-y-6">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q, idx) => {
                const userAns = result.userAnswers[q.id];
                const isCorrect = userAns === q.correctAnswer;
                const isUnanswered = !userAns;
                const isMarked = result.markedForReviewIds.includes(q.id);
                const isAdded = Boolean(addedMistakeIds[q.id]);

                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-5 transition text-xs sm:text-sm ${
                      isCorrect
                        ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-950/60 dark:bg-emerald-950/10'
                        : isUnanswered
                        ? 'border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.2)]'
                        : 'border-rose-200 bg-rose-50/20 dark:border-rose-950/60 dark:bg-rose-950/10'
                    }`}
                    data-testid={`review-card-${q.id}`}
                  >
                    {/* Card Top: Number, Badges, Add to Mistake Book */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[hsl(var(--border))] pb-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[hsl(var(--foreground))]">
                          प्रश्न {questions.indexOf(q) + 1}
                        </span>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px]">
                            <CheckCircle2 size={12} />
                            <span>सही (Correct)</span>
                          </span>
                        ) : isUnanswered ? (
                          <span className="rounded bg-[hsl(var(--secondary))] px-2 py-0.5 font-bold text-[hsl(var(--muted-foreground))] text-[11px]">
                            अनुत्तरित (Unanswered)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[11px]">
                            <XCircle size={12} />
                            <span>गलत (Incorrect)</span>
                          </span>
                        )}
                        {isMarked && (
                          <span className="rounded bg-indigo-100 px-2 py-0.5 font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[11px]">
                            Marked
                          </span>
                        )}
                      </div>

                      {/* Add to Mistake Book Button (Module 10 integration) */}
                      {!isCorrect && userAns && (
                        <div>
                          {isAdded ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <CheckCircle2 size={13} />
                              <span>Added to Mistakes</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddToMistakeBook(q, userAns)}
                              className="flex items-center gap-1 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1 text-[11px] font-semibold text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))] transition"
                              data-testid={`btn-add-mistake-${q.id}`}
                            >
                              <Sparkles size={12} />
                              <span>Add to Mistake Book</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Question Prompt */}
                    <div className="mt-3">
                      <p className="font-semibold text-[hsl(var(--foreground))] text-sm sm:text-base leading-relaxed">
                        {q.question}
                      </p>
                    </div>

                    {/* Options Grid */}
                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {(['A', 'B', 'C', 'D'] as const).map((key) => {
                        const isCorrectOption = q.correctAnswer === key;
                        const isUserChoice = userAns === key;

                        let style = 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]';
                        if (isCorrectOption) {
                          style = 'border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-bold ring-1 ring-emerald-500';
                        } else if (isUserChoice && !isCorrectOption) {
                          style = 'border-rose-500 bg-rose-500/10 text-rose-950 dark:text-rose-200 line-through';
                        }

                        return (
                          <div
                            key={key}
                            className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs ${style}`}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded font-bold">
                              {key}.
                            </span>
                            <span className="flex-1 leading-snug">{q.options[key]}</span>
                            {isCorrectOption && (
                              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                                (सही उत्तर)
                              </span>
                            )}
                            {isUserChoice && !isCorrectOption && (
                              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                                (आपका उत्तर)
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Detailed Explanation Box (Module 5 architecture) */}
                    <div className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-xs space-y-2.5">
                      <div>
                        <span className="font-bold text-[hsl(var(--foreground))] block mb-0.5">
                          💡 व्याख्या (Explanation):
                        </span>
                        <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>

                      {q.importantPoint && (
                        <div className="border-t border-[hsl(var(--border))] pt-2">
                          <span className="font-bold text-amber-800 dark:text-amber-300 block mb-0.5">
                            ⭐ महत्वपूर्ण परीक्षा बिंदु (Key Point):
                          </span>
                          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                            {q.importantPoint}
                          </p>
                        </div>
                      )}

                      {q.additionalFact && (
                        <div className="border-t border-[hsl(var(--border))] pt-2">
                          <span className="font-bold text-indigo-800 dark:text-indigo-300 block mb-0.5">
                            📌 अतिरिक्त तथ्य (Additional Fact):
                          </span>
                          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                            {q.additionalFact}
                          </p>
                        </div>
                      )}

                      {q.commonMistake && (
                        <div className="border-t border-[hsl(var(--border))] pt-2">
                          <span className="font-bold text-rose-800 dark:text-rose-300 block mb-0.5">
                            ⚠️ सामान्य भूल (Common Mistake):
                          </span>
                          <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                            {q.commonMistake}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-[hsl(var(--muted-foreground))]">
                इस फ़िल्टर में कोई प्रश्न नहीं है।
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
