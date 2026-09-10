import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  History,
  Info,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import { Button, Card } from '@/components/site';
import {
  MistakeQuestion,
  REVISION_STATUS_LABELS,
  markMistakeForReview,
  removeMistake,
} from '@/lib/mistakes';

interface MistakeDetailProps {
  mistake: MistakeQuestion;
  onUpdated?: () => void;
  onPracticeSingle?: (mistake: MistakeQuestion) => void;
  expandedDefault?: boolean;
}

export function MistakeDetail({
  mistake,
  onUpdated,
  onPracticeSingle,
  expandedDefault = false,
}: MistakeDetailProps) {
  const [isExpanded, setIsExpanded] = useState(expandedDefault);
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);
  const [justMarkedForReview, setJustMarkedForReview] = useState(false);

  const statusMeta = REVISION_STATUS_LABELS[mistake.revisionStatus] || REVISION_STATUS_LABELS.NEEDS_REVISION;

  const handleRemove = () => {
    removeMistake(mistake.id);
    setShowConfirmRemove(false);
    onUpdated?.();
  };

  const handleMarkReview = () => {
    markMistakeForReview(mistake.id);
    setJustMarkedForReview(true);
    setTimeout(() => setJustMarkedForReview(false), 3000);
    onUpdated?.();
  };

  const formattedDate = mistake.lastAttemptedAt
    ? new Date(mistake.lastAttemptedAt).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <Card
      className="p-5 sm:p-6 transition border-[hsl(var(--border))] hover:border-[hsl(var(--accent)/.6)] shadow-sm"
      data-testid={`card-mistake-${mistake.questionId}`}
    >
      {/* Header Badges & Source Info */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-[hsl(var(--border))] text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Genuine PYQ Badge preservation (Requirement 13) */}
          {mistake.source === 'pyq' && (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-bold text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <BookOpenCheck size={13} />
              PYQ {mistake.pyqYear ? `(${mistake.pyqYear})` : ''}
              {mistake.pyqExamName ? ` · ${mistake.pyqExamName}` : ''}
            </span>
          )}

          {/* Exam, Subject, Topic Hierarchy */}
          <span className="rounded-md bg-[hsl(var(--secondary))] px-2.5 py-0.5 font-bold text-[hsl(var(--primary))]">
            {mistake.examName}
          </span>
          <span className="text-[hsl(var(--muted-foreground))]">
            {mistake.subjectName} • {mistake.topicName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Difficulty */}
          <span className="rounded-md bg-[hsl(var(--secondary))] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
            {mistake.difficulty}
          </span>

          {/* Revision Status Badge (Requirement 5) */}
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold border ${statusMeta.tone}`}
            data-testid={`badge-status-${mistake.questionId}`}
          >
            {statusMeta.hindi}
          </span>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="mt-4">
        <h3 className="text-base sm:text-lg font-bold text-[hsl(var(--foreground))] leading-snug">
          {mistake.questionText}
        </h3>
      </div>

      {/* Answer Comparison Block: Last Selected Answer vs Correct Answer */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {/* User's Last Selected Answer */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-900/50 dark:bg-rose-950/30">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
            <XCircle size={15} className="text-rose-600" />
            <span>आपका पिछला उत्तर (Your Last Answer)</span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-rose-950 dark:text-rose-100">
            {mistake.lastSelectedAnswerText ? (
              <>
                <span className="mr-1.5 inline-block rounded bg-rose-200/80 dark:bg-rose-900/80 px-1.5 py-0.5 text-xs font-bold text-rose-900 dark:text-rose-200">
                  {mistake.lastSelectedAnswer}
                </span>
                {mistake.lastSelectedAnswerText}
              </>
            ) : (
              <span className="font-bold">{mistake.lastSelectedAnswer || 'अनुत्तरित'}</span>
            )}
          </p>
        </div>

        {/* Correct Answer */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>सही उत्तर (Correct Answer)</span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-emerald-950 dark:text-emerald-100">
            {mistake.correctAnswerText ? (
              <>
                <span className="mr-1.5 inline-block rounded bg-emerald-200/80 dark:bg-emerald-900/80 px-1.5 py-0.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  {mistake.correctAnswer}
                </span>
                {mistake.correctAnswerText}
              </>
            ) : (
              <span className="font-bold">{mistake.correctAnswer}</span>
            )}
          </p>
        </div>
      </div>

      {/* Progress & History Micro-bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-[hsl(var(--muted-foreground))]">
        <div className="flex items-center gap-4">
          <span title="गलत प्रयास संख्या">
            गलत प्रयास: <strong className="text-rose-600 font-bold">{mistake.wrongAttempts}</strong>
          </span>
          <span title="सफल revision संख्या">
            सफल revision: <strong className="text-emerald-600 font-bold">{mistake.successfulRevisions}</strong>
          </span>
        </div>
        {formattedDate && (
          <div className="flex items-center gap-1.5">
            <Calendar size={13} />
            <span>अंतिम प्रयास: {formattedDate}</span>
          </div>
        )}
      </div>

      {/* Expandable Explanation, Important Point, Additional Fact, Common Mistake */}
      {isExpanded && (
        <div className="mt-5 space-y-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.35)] p-4 text-sm animate-in fade-in duration-200">
          {mistake.explanation && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
                <Info size={14} className="text-[hsl(var(--accent-foreground))]" />
                <span>विस्तृत व्याख्या (Explanation)</span>
              </div>
              <p className="mt-1.5 leading-relaxed text-[hsl(var(--foreground))]">
                {mistake.explanation}
              </p>
            </div>
          )}

          {mistake.importantPoint && (
            <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 dark:bg-amber-950/20 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                <Lightbulb size={14} className="text-amber-600" />
                <span>महत्वपूर्ण बिंदु (Important Point)</span>
              </div>
              <p className="mt-1 leading-relaxed text-amber-950 dark:text-amber-100 text-xs sm:text-sm">
                {mistake.importantPoint}
              </p>
            </div>
          )}

          {mistake.additionalFact && (
            <div className="rounded-lg border border-sky-200/80 bg-sky-50/50 dark:bg-sky-950/20 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-300">
                <Sparkles size={14} className="text-sky-600" />
                <span>अतिरिक्त तथ्य (Additional Fact)</span>
              </div>
              <p className="mt-1 leading-relaxed text-sky-950 dark:text-sky-100 text-xs sm:text-sm">
                {mistake.additionalFact}
              </p>
            </div>
          )}

          {mistake.commonMistake && (
            <div className="rounded-lg border border-rose-200/80 bg-rose-50/50 dark:bg-rose-950/20 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-300">
                <AlertTriangle size={14} className="text-rose-600" />
                <span>सामान्य गलती (Common Mistake)</span>
              </div>
              <p className="mt-1 leading-relaxed text-rose-950 dark:text-rose-100 text-xs sm:text-sm">
                {mistake.commonMistake}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Banner for Removal (Requirement 12) */}
      {showConfirmRemove && (
        <div className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-950 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold">क्या आप इस प्रश्न को Mistake Book से हटाना चाहते हैं?</p>
              <p className="mt-1 text-rose-800 text-xs">
                यह केवल आपकी Mistake Book सूची से हटेगा। आपकी क्विज़ हिस्ट्री, एनालिटिक्स और उपलब्धियाँ सुरक्षित रहेंगी।
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  className="min-h-8 px-3 text-xs bg-rose-700 hover:bg-rose-800"
                  onClick={handleRemove}
                  data-testid={`button-confirm-remove-${mistake.questionId}`}
                >
                  हाँ, हटाएं
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-8 px-3 text-xs"
                  onClick={() => setShowConfirmRemove(false)}
                >
                  रद्द करें
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions Toolbar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2.5 border-t border-[hsl(var(--border))] pt-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Review / Toggle details */}
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 px-3 text-xs"
            onClick={() => setIsExpanded((prev) => !prev)}
            data-testid={`button-review-mistake-${mistake.questionId}`}
          >
            <Info size={14} />
            <span>{isExpanded ? 'कम देखें (Hide)' : 'व्याख्या देखें (Review)'}</span>
          </Button>

          {/* Mark for Review */}
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 px-3 text-xs"
            onClick={handleMarkReview}
            data-testid={`button-mark-review-${mistake.questionId}`}
          >
            <RotateCcw size={14} />
            <span>{justMarkedForReview ? 'दोबारा पढ़ने के लिए चिन्हित!' : 'Mark for Review'}</span>
          </Button>

          {/* Remove Button */}
          {!showConfirmRemove && (
            <Button
              type="button"
              variant="text"
              className="min-h-9 px-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              onClick={() => setShowConfirmRemove(true)}
              data-testid={`button-remove-mistake-${mistake.questionId}`}
            >
              <Trash2 size={14} />
              <span>हटाएं (Remove)</span>
            </Button>
          )}
        </div>

        {/* Practice Again CTA */}
        {onPracticeSingle ? (
          <Button
            type="button"
            variant="primary"
            className="min-h-9 px-3 text-xs"
            onClick={() => onPracticeSingle(mistake)}
            data-testid={`button-practice-single-${mistake.questionId}`}
          >
            <Play size={14} />
            <span>Practice Again</span>
          </Button>
        ) : (
          <Button
            href={`/mistakes/practice?questionId=${mistake.questionId}`}
            variant="primary"
            className="min-h-9 px-3 text-xs"
            data-testid={`button-practice-single-${mistake.questionId}`}
          >
            <Play size={14} />
            <span>Practice Again</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
