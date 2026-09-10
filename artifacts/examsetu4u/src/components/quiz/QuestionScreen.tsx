import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  HelpCircle,
  Info,
  Lightbulb,
  LogOut,
  RotateCcw,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import { useMemo } from 'react';
import { ProgressBar } from '@/components/curriculum-ui';
import { Button, Card } from '@/components/site';
import type { MCQQuestion } from '@/data/quiz/types';

interface QuestionScreenProps {
  question: MCQQuestion;
  currentIndex: number;
  totalQuestions: number;
  examName: string;
  subjectName: string;
  topicName: string;
  selectedAnswer?: 'A' | 'B' | 'C' | 'D';
  isSubmitted: boolean;
  isMarkedForReview: boolean;
  onSelectOption: (key: 'A' | 'B' | 'C' | 'D') => void;
  onSubmitAnswer: () => void;
  onClearAnswer: () => void;
  onToggleReview: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSkip: () => void;
  onFinishRequest: () => void;
  onExit: () => void;
}

const optionKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];

export function QuestionScreen({
  question,
  currentIndex,
  totalQuestions,
  examName,
  subjectName,
  topicName,
  selectedAnswer,
  isSubmitted,
  isMarkedForReview,
  onSelectOption,
  onSubmitAnswer,
  onClearAnswer,
  onToggleReview,
  onPrevious,
  onNext,
  onSkip,
  onFinishRequest,
  onExit,
}: QuestionScreenProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const isAnswerCorrect = isSubmitted && selectedAnswer === question.correctAnswer;

  return (
    <div className="flex flex-col gap-6" data-testid="quiz-question-screen">
      {/* Header bar with Quiz Info, Progress & Exit */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow)] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
            <span className="rounded-md bg-[hsl(var(--secondary))] px-2.5 py-1 text-[hsl(var(--primary))] font-bold">
              {examName || 'ExamSetu4U'}
            </span>
            <span>•</span>
            <span className="text-[hsl(var(--primary))] font-medium">{subjectName || 'शिक्षण कौशल'}</span>
            <span>•</span>
            <span className="truncate max-w-[200px] sm:max-w-xs">{topicName}</span>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:bg-rose-50 hover:text-rose-600 transition"
            data-testid="button-exit-quiz"
          >
            <LogOut size={14} />
            <span>Quiz से बाहर निकलें</span>
          </button>
        </div>

        {/* Progress Bar & Question Counter */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-bold text-[hsl(var(--primary))]">
            <span className="flex items-center gap-1.5">
              <span>प्रश्न {currentIndex + 1}</span>
              <span className="text-[hsl(var(--muted-foreground))]">/ {totalQuestions}</span>
            </span>
            <span className="text-[hsl(var(--muted-foreground))] font-medium">{progressPercent}% पूर्ण</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
            <div
              className="h-full rounded-full bg-[hsl(var(--accent))] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <Card className="p-5 sm:p-7" data-testid={`question-card-${question.id}`}>
        {/* Badges: Question Type, Difficulty */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[hsl(var(--border))] pb-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[hsl(var(--secondary))] px-2 py-0.5 text-[11px] font-bold text-[hsl(var(--primary))]">
              {question.sourceType}
            </span>
            {question.year && (
              <span className="rounded bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                PYQ {question.year}
              </span>
            )}
            <span
              className={`rounded px-2 py-0.5 text-[11px] font-bold ${
                question.difficulty === 'Easy'
                  ? 'bg-emerald-50 text-emerald-700'
                  : question.difficulty === 'Moderate'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {question.difficulty}
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleReview}
            className={`focus-ring inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              isMarkedForReview
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
            data-testid="button-mark-review"
            aria-pressed={isMarkedForReview}
          >
            <Bookmark size={14} className={isMarkedForReview ? 'fill-current' : ''} />
            <span>{isMarkedForReview ? 'चिन्हित है (Marked)' : 'Review के लिए चिन्हित करें'}</span>
          </button>
        </div>

        {/* Question Text */}
        <div className="mt-5">
          <p className="font-display text-lg leading-relaxed text-[hsl(var(--foreground))] sm:text-xl font-medium">
            <span className="mr-2 inline-block font-bold text-[hsl(var(--primary))]">Q.{currentIndex + 1}</span>
            {question.question}
          </p>
        </div>

        {/* Four Large Selectable Options (A, B, C, D) */}
        <div className="mt-6 grid gap-3" role="radiogroup" aria-label={`Options for Question ${currentIndex + 1}`}>
          {optionKeys.map((key) => {
            const isSelected = selectedAnswer === key;
            const isCorrectOption = question.correctAnswer === key;

            // Compute styling based on whether answer has been submitted
            let cardClasses =
              'relative flex items-center gap-3.5 rounded-xl border p-4 text-left transition text-sm sm:text-base cursor-pointer select-none';
            let badgeClasses =
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold border transition';

            if (isSubmitted) {
              if (isCorrectOption) {
                // Correct Answer always highlighted green after submit
                cardClasses += ' border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-500';
                badgeClasses += ' border-emerald-600 bg-emerald-600 text-white';
              } else if (isSelected && !isCorrectOption) {
                // User selected wrong answer: highlighted red
                cardClasses += ' border-rose-500 bg-rose-50/80 text-rose-950 ring-1 ring-rose-500';
                badgeClasses += ' border-rose-600 bg-rose-600 text-white';
              } else {
                cardClasses += ' border-[hsl(var(--border))] bg-[hsl(var(--card))] opacity-60';
                badgeClasses += ' border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]';
              }
            } else {
              // Before submit: selectable states
              if (isSelected) {
                cardClasses +=
                  ' border-[hsl(var(--accent))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] ring-2 ring-[hsl(var(--accent))] shadow-xs';
                badgeClasses += ' border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]';
              } else {
                cardClasses +=
                  ' border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--secondary)/.5)]';
                badgeClasses += ' border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]';
              }
            }

            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isSubmitted}
                onClick={() => onSelectOption(key)}
                className={cardClasses}
                data-testid={`option-${key.toLowerCase()}`}
              >
                <span className={badgeClasses}>{key}</span>
                <span className="flex-1 font-medium leading-relaxed">{question.options[key]}</span>
                {isSubmitted && isCorrectOption && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-md px-2 py-1">
                    <CheckCircle2 size={16} />
                    <span>सही उत्तर</span>
                  </span>
                )}
                {isSubmitted && isSelected && !isCorrectOption && (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 rounded-md px-2 py-1">
                    <XCircle size={16} />
                    <span>आपका उत्तर</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Submit / Clear Action Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-4">
          <div className="flex items-center gap-2">
            {!isSubmitted && selectedAnswer && (
              <Button
                type="button"
                variant="secondary"
                onClick={onClearAnswer}
                className="text-xs"
                data-testid="button-clear-answer"
              >
                <RotateCcw size={14} />
                <span>उत्तर हटाएँ (Clear)</span>
              </Button>
            )}
          </div>

          {!isSubmitted && (
            <Button
              type="button"
              variant="primary"
              disabled={!selectedAnswer}
              onClick={onSubmitAnswer}
              className={`text-sm px-5 py-2.5 font-bold ${
                !selectedAnswer ? 'opacity-50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
              data-testid="button-submit-answer"
            >
              <Check size={16} />
              <span>उत्तर जमा करें</span>
            </Button>
          )}
        </div>

        {/* Post-Submission Feedback & Detailed Explanation */}
        {isSubmitted && (
          <div
            className="mt-6 space-y-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.4)] p-4 sm:p-6 animate-in fade-in-50 duration-200"
            data-testid="answer-explanation-panel"
          >
            {/* Status Banner */}
            <div
              className={`flex items-center gap-3 rounded-lg p-3 text-sm font-bold ${
                isAnswerCorrect
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {isAnswerCorrect ? (
                <>
                  <CheckCircle2 size={20} className="text-emerald-700 shrink-0" />
                  <span>शाबाश! आपका उत्तर सही है (Option {question.correctAnswer})</span>
                </>
              ) : (
                <>
                  <XCircle size={20} className="text-rose-700 shrink-0" />
                  <span>
                    गलत उत्तर! सही उत्तर है: <strong>Option {question.correctAnswer}</strong>
                  </span>
                </>
              )}
            </div>

            {/* Detailed Explanation */}
            <div className="rounded-lg bg-[hsl(var(--card))] p-4 border border-[hsl(var(--border))]">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
                <Lightbulb size={16} className="text-amber-500" />
                <span>विस्तृत व्याख्या (Explanation)</span>
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--foreground))]">
                {question.explanation}
              </p>
            </div>

            {/* Important Point */}
            {question.importantPoint && (
              <div className="rounded-lg bg-blue-50/70 p-4 border border-blue-200">
                <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
                  <Sparkles size={16} className="text-blue-600" />
                  <span>महत्वपूर्ण बिंदु (Key Takeaway)</span>
                </h4>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-blue-950">
                  {question.importantPoint}
                </p>
              </div>
            )}

            {/* Additional Fact & Common Mistake in 2-column on desktop */}
            <div className="grid gap-3 sm:grid-cols-2">
              {question.additionalFact && (
                <div className="rounded-lg bg-emerald-50/70 p-3.5 border border-emerald-200">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <Award size={15} className="text-emerald-600" />
                    <span>अतिरिक्त परीक्षा तथ्य</span>
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-emerald-950">
                    {question.additionalFact}
                  </p>
                </div>
              )}

              {question.commonMistake && (
                <div className="rounded-lg bg-amber-50/70 p-3.5 border border-amber-200">
                  <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                    <AlertCircle size={15} className="text-amber-600" />
                    <span>सामान्य गलती (Common Mistake)</span>
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-amber-950">
                    {question.commonMistake}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Navigation Controls Bar */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={isFirst}
            onClick={onPrevious}
            className={`min-h-10 text-xs sm:text-sm ${isFirst ? 'opacity-40 cursor-not-allowed' : ''}`}
            data-testid="button-prev-question"
          >
            <ChevronLeft size={16} />
            <span>पिछला</span>
          </Button>

          <div className="flex items-center gap-2">
            {!isLast && (
              <Button
                type="button"
                variant="secondary"
                onClick={onSkip}
                className="min-h-10 text-xs sm:text-sm text-[hsl(var(--muted-foreground))]"
                data-testid="button-skip-question"
              >
                <span>छोड़ें (Skip)</span>
              </Button>
            )}

            {!isLast ? (
              <Button
                type="button"
                variant="primary"
                onClick={onNext}
                className="min-h-10 text-xs sm:text-sm"
                data-testid="button-next-question"
              >
                <span>अगला</span>
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={onFinishRequest}
                className="min-h-10 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                data-testid="button-finish-quiz"
              >
                <Check size={16} />
                <span>Quiz समाप्त करें</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
