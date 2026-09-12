import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'wouter';
import { Button, Card } from '@/components/site';
import { getExam } from '@/data/curriculum';
import type { MockTestConfig } from '@/data/mock/types';
import { getMockTestSummary } from '@/lib/mock-test-storage';

interface MockTestCardProps {
  test: MockTestConfig;
  className?: string;
}

export function MockTestCard({ test, className = '' }: MockTestCardProps) {
  const exam = useMemo(() => getExam(test.examId), [test.examId]);
  const summary = useMemo(() => getMockTestSummary(test.id), [test.id]);

  const maxMarks = test.questionCount * test.marksPerQuestion;
  const isAttempted = summary.attemptCount > 0;
  const hasActive = summary.hasActiveAttempt;

  const difficultyColors = {
    Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
    Moderate: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
    Hard: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300',
    Mixed: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300',
  };

  return (
    <Card
      className={`flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-200 hover:shadow-xs transition ${className}`}
      data-testid={`card-mock-test-${test.id}`}
    >
      <div>
        {/* Top Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 font-bold text-blue-700">
              {exam?.name || test.examId}
            </span>
            <span
              className={`rounded-md border px-2 py-0.5 font-bold ${
                difficultyColors[test.difficulty] || difficultyColors.Moderate
              }`}
            >
              {test.difficulty}
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-600">
              {test.testType === 'full'
                ? 'Full Length'
                : test.testType === 'subject'
                ? 'Subject Test'
                : test.testType === 'topic'
                ? 'Topic Test'
                : 'Practice Test'}
            </span>
          </div>

          {/* Attempt Status Badge */}
          <div>
            {hasActive ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-bold text-amber-800 text-[11px] animate-pulse">
                <span>In Progress</span>
              </span>
            ) : isAttempted ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-800 text-[11px]">
                <CheckCircle2 size={12} />
                <span>Attempted ({summary.attemptCount})</span>
              </span>
            ) : (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-semibold text-slate-500 text-[11px]">
                Not Attempted
              </span>
            )}
          </div>
        </div>

        {/* Test Title & Description */}
        <h3 className="font-display mt-3 text-lg font-bold text-slate-900 line-clamp-2">
          {test.title}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {test.description}
        </p>

        {/* Specifications Grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50/70 p-3 text-xs sm:grid-cols-4 border border-slate-200">
          <div>
            <span className="text-slate-500">Questions:</span>
            <p className="font-bold text-slate-900">{test.questionCount} प्रश्न</p>
          </div>
          <div>
            <span className="text-slate-500">Duration:</span>
            <p className="font-bold text-slate-900">{test.durationMinutes} मिनट</p>
          </div>
          <div>
            <span className="text-slate-500">Max Marks:</span>
            <p className="font-bold text-slate-900">{maxMarks} अंक</p>
          </div>
          <div>
            <span className="text-slate-500">Negative:</span>
            <p className="font-bold text-slate-900">
              {test.negativeMarking ? `-${test.negativeMarks}` : 'नहीं (None)'}
            </p>
          </div>
        </div>

        {/* Best Score Banner if Attempted */}
        {isAttempted && (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 text-xs">
            <div className="flex items-center gap-1.5 text-amber-800 font-medium">
              <Trophy size={14} className="text-amber-600" />
              <span>Best Score:</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <span>
                {summary.bestScore} / {maxMarks}
              </span>
              <span className="rounded bg-amber-200/60 px-1.5 py-0.5 text-[10px] text-amber-900">
                {summary.bestAccuracy}% Acc
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
        {isAttempted && summary.lastAttemptId ? (
          <Button
            href={`/mock-tests/result/${summary.lastAttemptId}`}
            variant="ghost"
            className="text-xs px-2.5 text-slate-500 hover:text-blue-700"
            data-testid={`button-view-result-${test.id}`}
          >
            <span>पिछला परिणाम</span>
          </Button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {hasActive ? (
            <Button
              href={`/mock-tests/live/${test.id}`}
              variant="primary"
              className="text-xs min-h-9 bg-amber-600 hover:bg-amber-700 text-white font-bold"
              data-testid={`button-resume-${test.id}`}
            >
              <RotateCcw size={14} />
              <span>Resume Test</span>
            </Button>
          ) : isAttempted ? (
            <Button
              href={`/mock-tests/start/${test.id}`}
              variant="secondary"
              className="text-xs min-h-9 font-bold"
              data-testid={`button-retake-${test.id}`}
            >
              <RotateCcw size={14} />
              <span>Retake Test</span>
            </Button>
          ) : (
            <Button
              href={`/mock-tests/start/${test.id}`}
              variant="primary"
              className="text-xs min-h-9 font-bold shadow-xs"
              data-testid={`button-start-${test.id}`}
            >
              <Play size={14} />
              <span>Start Test</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
