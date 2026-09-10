import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Card } from '@/components/site';
import { getQuestionsByIds } from '@/data/quiz/questions';
import type { MCQQuestion, QuizAttemptResult } from '@/data/quiz/types';

interface QuizResultProps {
  result: QuizAttemptResult;
  onRetry: () => void;
  onPracticeIncorrect: () => void;
  onNewQuiz: () => void;
}

function getMotivationalFeedback(percentage: number) {
  if (percentage >= 90) {
    return {
      title: 'उत्कृष्ट प्रदर्शन! (Outstanding Performance)',
      message: 'अद्भुत तैयारी! आपने अधिकांश प्रश्नों के बिल्कुल सही उत्तर दिए हैं। इस गति को बनाए रखें।',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      badge: 'उत्कृष्ट',
    };
  }
  if (percentage >= 75) {
    return {
      title: 'बहुत अच्छा प्रदर्शन! (Very Good Effort)',
      message: 'शानदार प्रयास! आपका आधार काफी मजबूत है। थोड़े और अभ्यास से आप शीर्ष स्कोर प्राप्त कर सकते हैं।',
      color: 'text-sky-700 bg-sky-50 border-sky-200',
      badge: 'बहुत अच्छा',
    };
  }
  if (percentage >= 60) {
    return {
      title: 'अच्छा प्रयास! (Good Effort)',
      message: 'सकारात्मक शुरुआत! कई महत्वपूर्ण प्रश्नों में आपकी समझ अच्छी है। कमजोर क्षेत्रों पर थोड़ा ध्यान दें।',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      badge: 'अच्छा प्रयास',
    };
  }
  if (percentage >= 40) {
    return {
      title: 'और अभ्यास की आवश्यकता (More Practice Needed)',
      message: 'हिम्मत न हारें! अध्ययन सामग्री को पुनः दोहराएं और गलत हुए प्रश्नों की व्याख्या ध्यान से पढ़ें।',
      color: 'text-orange-700 bg-orange-50 border-orange-200',
      badge: 'अभ्यास जारी रखें',
    };
  }
  return {
    title: 'आधारभूत विषयों का पुनः अभ्यास करें (Revise Fundamentals)',
    message: 'प्रत्येक गलती सीखने का एक अवसर है। संबंधित पाठ के नोट्स पढ़ें और संकल्पनाओं को स्पष्ट कर पुनः प्रयास करें।',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
    badge: 'पुनरावलोकन आवश्यक',
  };
}

export function QuizResult({ result, onRetry, onPracticeIncorrect, onNewQuiz }: QuizResultProps) {
  const [reviewFilter, setReviewFilter] = useState<'All' | 'Correct' | 'Incorrect' | 'Unanswered'>('All');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const feedback = getMotivationalFeedback(result.percentage);

  // Retrieve questions for review
  const questions = useMemo(() => {
    return getQuestionsByIds(result.questionIds);
  }, [result.questionIds]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const userAns = result.userAnswers[q.id];
      const isAnswered = Boolean(userAns);
      const isCorrect = userAns === q.correctAnswer;

      if (reviewFilter === 'Correct') return isCorrect;
      if (reviewFilter === 'Incorrect') return isAnswered && !isCorrect;
      if (reviewFilter === 'Unanswered') return !isAnswered;
      return true;
    });
  }, [questions, result.userAnswers, reviewFilter]);

  const toggleExpand = (qId: string) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const hasIncorrect = result.incorrect > 0;

  return (
    <div className="flex flex-col gap-8" data-testid="quiz-result-view">
      {/* Top Banner: Score & Motivational Feedback */}
      <Card className="overflow-hidden border-2 border-[hsl(var(--accent)/.3)] p-6 sm:p-8" data-testid="card-result-score">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[hsl(var(--secondary))] px-2.5 py-1 text-xs font-bold text-[hsl(var(--primary))]">
                {result.examName}
              </span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">• {result.topicName}</span>
            </div>
            <h1 className="font-display mt-3 text-3xl sm:text-4xl text-[hsl(var(--primary))] font-bold">
              Quiz परिणाम (Result)
            </h1>

            {/* Motivational message card */}
            <div className={`mt-4 rounded-xl border p-4 ${feedback.color}`}>
              <div className="flex items-center gap-2">
                <Trophy size={18} className="shrink-0" />
                <h3 className="font-bold text-sm sm:text-base">{feedback.title}</h3>
              </div>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed">{feedback.message}</p>
            </div>
          </div>

          {/* Big Score Circle */}
          <div className="flex shrink-0 items-center justify-center">
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-md text-center min-w-[180px]">
              <span className="text-4xl sm:text-5xl font-extrabold text-[hsl(var(--primary))]">
                {result.score}
                <span className="text-xl font-normal text-[hsl(var(--muted-foreground))]">/{result.totalQuestions}</span>
              </span>
              <div className="mt-2 rounded-full bg-[hsl(var(--accent))] px-3 py-0.5 text-xs font-bold text-[hsl(var(--accent-foreground))]">
                {result.percentage}% प्राप्तांक
              </div>
              <span className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                सटीकता (Accuracy): {result.accuracy}%
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 border-t border-[hsl(var(--border))] pt-6 text-center">
          <div className="rounded-lg bg-[hsl(var(--secondary)/.6)] p-3">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">कुल प्रश्न</p>
            <p className="mt-1 text-lg font-bold text-[hsl(var(--foreground))]">{result.totalQuestions}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-100">
            <p className="text-xs text-emerald-800">सही उत्तर (Correct)</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">{result.correct}</p>
          </div>
          <div className="rounded-lg bg-rose-50 p-3 border border-rose-100">
            <p className="text-xs text-rose-800">गलत उत्तर (Incorrect)</p>
            <p className="mt-1 text-lg font-bold text-rose-700">{result.incorrect}</p>
          </div>
          <div className="rounded-lg bg-[hsl(var(--secondary)/.6)] p-3">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">प्रयास किए</p>
            <p className="mt-1 text-lg font-bold text-[hsl(var(--primary))]">{result.attempted}</p>
          </div>
          <div className="rounded-lg bg-[hsl(var(--secondary)/.6)] p-3">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">अनुत्तरित (Skipped)</p>
            <p className="mt-1 text-lg font-bold text-[hsl(var(--muted-foreground))]">{result.unanswered}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3 border border-amber-100">
            <p className="text-xs text-amber-800">सटीकता (Accuracy)</p>
            <p className="mt-1 text-lg font-bold text-amber-700">{result.accuracy}%</p>
          </div>
        </div>

        {/* Mistakes Improved Banner for Revision Practicing */}
        {(result.isRevision || (result.mistakesImproved !== undefined && result.mistakesImproved > 0)) && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50/90 p-4 text-emerald-900 shadow-sm" data-testid="banner-mistakes-improved">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Revision Outcome</p>
                <h4 className="text-base font-bold text-emerald-950">
                  Mistakes Improved (गलतियां सुधारी गईं): <span className="text-emerald-700 underline decoration-2">{result.mistakesImproved || 0}</span>
                </h4>
              </div>
            </div>
            <p className="text-xs text-emerald-800 sm:text-right max-w-xs">
              जो प्रश्न पहले गलत थे, उनमें से {result.mistakesImproved || 0} अब सही हो गए हैं।
            </p>
          </div>
        )}

        {/* Action Buttons: Retry, Practice Incorrect, New Quiz */}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-[hsl(var(--border))] pt-6">
          <Button
            type="button"
            variant="primary"
            onClick={onRetry}
            className="flex-1 sm:flex-initial"
            data-testid="button-retry-quiz"
          >
            <RotateCcw size={16} />
            <span>Quiz दोबारा दें (Retry)</span>
          </Button>

          {hasIncorrect ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onPracticeIncorrect}
              className="flex-1 sm:flex-initial border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100"
              data-testid="button-practice-incorrect"
            >
              <AlertTriangle size={16} className="text-amber-600" />
              <span>गलत प्रश्नों का अभ्यास करें ({result.incorrect})</span>
            </Button>
          ) : (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 border border-emerald-200">
              🎉 कोई गलत प्रश्न नहीं! आपने सभी सही उत्तर दिए।
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            onClick={onNewQuiz}
            className="w-full sm:w-auto"
            data-testid="button-new-quiz"
          >
            <span>नया Quiz चुनें</span>
            <ArrowRight size={15} />
          </Button>

          <Button
            href="/mistakes"
            variant="secondary"
            className="w-full sm:w-auto border-[hsl(var(--accent)/.4)]"
            data-testid="button-view-mistakes"
          >
            <span>Mistake Book देखें</span>
          </Button>
        </div>
      </Card>

      {/* Question-wise Review Section ("सभी प्रश्न देखें") */}
      <section className="space-y-5" data-testid="section-question-review">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[hsl(var(--border))] pb-4">
          <div>
            <h2 className="font-display text-2xl text-[hsl(var(--primary))] font-bold">
              सभी प्रश्न देखें (Question-wise Review)
            </h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              प्रत्येक प्रश्न का अपना उत्तर, सही उत्तर एवं विस्तृत व्याख्या देखें।
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.5)] p-1">
            {(['All', 'Correct', 'Incorrect', 'Unanswered'] as const).map((tab) => {
              const isActive = reviewFilter === tab;
              const count =
                tab === 'All'
                  ? questions.length
                  : tab === 'Correct'
                  ? result.correct
                  : tab === 'Incorrect'
                  ? result.incorrect
                  : result.unanswered;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setReviewFilter(tab)}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                    isActive
                      ? 'bg-[hsl(var(--card))] text-[hsl(var(--primary))] shadow-xs'
                      : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                  data-testid={`filter-tab-${tab.toLowerCase()}`}
                >
                  {tab === 'All'
                    ? 'सभी'
                    : tab === 'Correct'
                    ? 'सही'
                    : tab === 'Incorrect'
                    ? 'गलत'
                    : 'अनुत्तरित'}{' '}
                  ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* List of reviewed questions */}
        {filteredQuestions.length === 0 ? (
          <Card className="p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
            इस फ़िल्टर में कोई प्रश्न नहीं है।
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const userAns = result.userAnswers[q.id];
              const isAnswered = Boolean(userAns);
              const isCorrect = userAns === q.correctAnswer;
              const isExpanded = expandedQuestions[q.id] !== false; // Default expanded for clear review

              return (
                <Card
                  key={q.id}
                  className={`p-5 transition border ${
                    isCorrect
                      ? 'border-emerald-200 bg-emerald-50/20'
                      : isAnswered
                      ? 'border-rose-200 bg-rose-50/20'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                  }`}
                  data-testid={`review-card-${q.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : isAnswered
                            ? 'bg-rose-600 text-white'
                            : 'bg-zinc-200 text-zinc-700'
                        }`}
                      >
                        {isCorrect ? '✓' : isAnswered ? '✗' : '—'}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold text-[hsl(var(--primary))]">Q.{idx + 1}</span>
                          <span className="rounded bg-[hsl(var(--secondary))] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
                            {q.difficulty}
                          </span>
                          <span className="rounded bg-[hsl(var(--secondary))] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
                            {q.sourceType}
                          </span>
                        </div>
                        <p className="mt-2 text-sm sm:text-base font-semibold leading-relaxed text-[hsl(var(--foreground))]">
                          {q.question}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleExpand(q.id)}
                      className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"
                      aria-label="Toggle question details"
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] space-y-3">
                      {/* Options breakdown */}
                      <div className="grid gap-2 sm:grid-cols-2">
                        {(['A', 'B', 'C', 'D'] as const).map((key) => {
                          const isUserChoice = userAns === key;
                          const isCorrectChoice = q.correctAnswer === key;

                          let optionStyle = 'border-[hsl(var(--border))] bg-[hsl(var(--card))]';
                          if (isCorrectChoice) {
                            optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500';
                          } else if (isUserChoice && !isCorrectChoice) {
                            optionStyle = 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400';
                          }

                          return (
                            <div
                              key={key}
                              className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-xs sm:text-sm ${optionStyle}`}
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded font-bold bg-[hsl(var(--secondary))] text-xs">
                                {key}
                              </span>
                              <span className="flex-1">{q.options[key]}</span>
                              {isCorrectChoice && (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">
                                  सही उत्तर
                                </span>
                              )}
                              {isUserChoice && !isCorrectChoice && (
                                <span className="text-[11px] font-bold text-rose-700 bg-rose-100 rounded px-1.5 py-0.5">
                                  आपका उत्तर
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      <div className="rounded-lg bg-[hsl(var(--secondary)/.6)] p-3.5 text-xs sm:text-sm">
                        <h4 className="flex items-center gap-1.5 font-bold text-[hsl(var(--primary))]">
                          <Lightbulb size={15} className="text-amber-500" />
                          <span>व्याख्या (Explanation)</span>
                        </h4>
                        <p className="mt-1 leading-relaxed text-[hsl(var(--foreground))]">{q.explanation}</p>
                      </div>

                      {/* Important Point & Additional Fact */}
                      <div className="grid gap-2 sm:grid-cols-2 text-xs">
                        {q.importantPoint && (
                          <div className="rounded-lg bg-blue-50/70 p-3 border border-blue-200">
                            <span className="font-bold text-blue-900 block mb-0.5">★ महत्वपूर्ण बिंदु:</span>
                            <span className="text-blue-950 leading-relaxed">{q.importantPoint}</span>
                          </div>
                        )}
                        {q.additionalFact && (
                          <div className="rounded-lg bg-emerald-50/70 p-3 border border-emerald-200">
                            <span className="font-bold text-emerald-900 block mb-0.5">✦ अतिरिक्त परीक्षा तथ्य:</span>
                            <span className="text-emerald-950 leading-relaxed">{q.additionalFact}</span>
                          </div>
                        )}
                      </div>

                      {q.commonMistake && (
                        <div className="rounded-lg bg-amber-50/70 p-3 border border-amber-200 text-xs">
                          <span className="font-bold text-amber-900 block mb-0.5">⚠️ सामान्य गलती:</span>
                          <span className="text-amber-950 leading-relaxed">{q.commonMistake}</span>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
