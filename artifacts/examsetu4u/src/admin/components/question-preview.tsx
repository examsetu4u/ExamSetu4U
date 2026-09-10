import { AlertCircle, Award, BookOpen, CheckCircle, Clock, FileText, HelpCircle, Info } from 'lucide-react';
import type { AdminQuestion } from '../types';

interface QuestionPreviewProps {
  question: AdminQuestion;
  examName?: string;
  subjectName?: string;
  topicName?: string;
  className?: string;
}

export function QuestionPreview({
  question,
  examName,
  subjectName,
  topicName,
  className = '',
}: QuestionPreviewProps) {
  const isPYQ = question.sourceType === 'PYQ';
  const isPYQBased = question.sourceType === 'PYQ-BASED';
  const isPractice = question.sourceType === 'PRACTICE';

  return (
    <article
      className={`rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm text-[hsl(var(--card-foreground))] ${className}`}
      data-testid={`question-preview-${question.id}`}
    >
      {/* Header Metadata Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[hsl(var(--border)/0.6)] pb-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {/* Source Type Badge */}
          {isPYQ && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-0.5 text-amber-700 dark:text-amber-400 font-semibold border border-amber-500/20">
              <Award className="h-3 w-3" />
              PYQ {question.year ? `(${question.year})` : ''}
            </span>
          )}
          {isPYQBased && (
            <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2.5 py-0.5 text-purple-700 dark:text-purple-400 font-semibold border border-purple-500/20">
              <BookOpen className="h-3 w-3" />
              PYQ-Based
            </span>
          )}
          {isPractice && (
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2.5 py-0.5 text-blue-700 dark:text-blue-400 font-semibold border border-blue-500/20">
              <HelpCircle className="h-3 w-3" />
              Practice
            </span>
          )}

          {/* Difficulty Badge */}
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-medium border ${
              question.difficulty === 'EASY'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                : question.difficulty === 'MODERATE'
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
            }`}
          >
            {question.difficulty}
          </span>

          {/* Status Badge */}
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
              question.status === 'PUBLISHED'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : question.status === 'REVIEW'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : question.status === 'DRAFT'
                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 line-through'
            }`}
          >
            {question.status}
          </span>

          {question.examName && (
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              • {question.examName}
            </span>
          )}
        </div>

        <div className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
          ID: {question.id}
        </div>
      </div>

      {/* Curriculum Context Breadcrumbs */}
      {(examName || subjectName || topicName) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
          {examName && <span className="font-semibold text-[hsl(var(--foreground))]">{examName}</span>}
          {subjectName && <span>› {subjectName}</span>}
          {topicName && <span>› {topicName}</span>}
        </div>
      )}

      {/* Question Text */}
      <div className="mt-3 text-base font-semibold leading-relaxed text-[hsl(var(--foreground))]">
        {question.question}
      </div>

      {/* Options List */}
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(['A', 'B', 'C', 'D'] as const).map((key) => {
          const isCorrect = question.correctAnswer === key;
          const text = question.options[key];
          return (
            <div
              key={key}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                isCorrect
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 font-medium'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--background)/0.5)] text-[hsl(var(--foreground))]'
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isCorrect
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                }`}
              >
                {key}
              </span>
              <span className="text-sm leading-snug break-words flex-1">{text || <span className="italic text-rose-500">[Empty option]</span>}</span>
              {isCorrect && (
                <span className="shrink-0 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                  Correct Answer
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Pedagogical Details & Solutions */}
      <div className="mt-5 space-y-3 rounded-lg border border-[hsl(var(--border)/0.8)] bg-[hsl(var(--background)/0.6)] p-4 text-xs">
        {question.explanation && (
          <div>
            <div className="flex items-center gap-1.5 font-bold text-[hsl(var(--foreground))]">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Detailed Explanation (हल एवं व्याख्या):
            </div>
            <p className="mt-1 text-sm leading-relaxed text-[hsl(var(--foreground)/0.9)]">
              {question.explanation}
            </p>
          </div>
        )}

        {question.importantPoint && (
          <div className="border-t border-[hsl(var(--border)/0.5)] pt-2.5">
            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
              <Info className="h-3.5 w-3.5" />
              Key Point (मुख्य बिंदु):
            </div>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              {question.importantPoint}
            </p>
          </div>
        )}

        {question.additionalFact && (
          <div className="border-t border-[hsl(var(--border)/0.5)] pt-2.5">
            <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400">
              <FileText className="h-3.5 w-3.5" />
              Additional Fact (अतिरिक्त तथ्य):
            </div>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              {question.additionalFact}
            </p>
          </div>
        )}

        {question.commonMistake && (
          <div className="border-t border-[hsl(var(--border)/0.5)] pt-2.5">
            <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" />
              Common Student Trap (सामान्य भूल):
            </div>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              {question.commonMistake}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
