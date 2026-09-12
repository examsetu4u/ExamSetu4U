import { Bookmark, Check, Circle, HelpCircle } from 'lucide-react';
import type { PaletteQuestionStatus } from '@/hooks/useQuizEngine';

interface QuestionNavigatorProps {
  totalQuestions: number;
  questionIds: string[];
  currentIndex: number;
  getStatus: (qId: string, index: number) => PaletteQuestionStatus;
  onSelectQuestion: (index: number) => void;
}

export function QuestionNavigator({
  totalQuestions,
  questionIds,
  currentIndex,
  getStatus,
  onSelectQuestion,
}: QuestionNavigatorProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:p-5" data-testid="question-palette">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>Question Palette</span>
          <span className="text-xs font-normal text-slate-500">
            ({currentIndex + 1}/{totalQuestions})
          </span>
        </h3>
      </div>

      {/* Responsive Grid of Question Numbers */}
      <div
        className="mt-4 grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1 sm:grid-cols-6 sm:max-h-72 md:grid-cols-5 lg:grid-cols-5"
        role="navigation"
        aria-label="Question numbers navigation"
      >
        {questionIds.map((qId, idx) => {
          const status = getStatus(qId, idx);
          const isCurrent = idx === currentIndex;

          let bgClass = 'bg-slate-50 text-slate-700 border-slate-200';
          let ariaLabel = `Question ${idx + 1}, Unanswered`;

          if (status === 'current') {
            bgClass = 'bg-blue-700 text-white border-blue-700 ring-2 ring-blue-500 ring-offset-2';
            ariaLabel = `Question ${idx + 1}, Current question`;
          } else if (status === 'answered_marked') {
            bgClass = 'bg-purple-600 text-white border-purple-700 relative';
            ariaLabel = `Question ${idx + 1}, Answered and Marked for review`;
          } else if (status === 'marked') {
            bgClass = 'bg-amber-500 text-white border-amber-600';
            ariaLabel = `Question ${idx + 1}, Marked for review`;
          } else if (status === 'answered') {
            bgClass = 'bg-emerald-600 text-white border-emerald-700';
            ariaLabel = `Question ${idx + 1}, Answered`;
          }

          return (
            <button
              key={qId}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              aria-label={ariaLabel}
              aria-current={isCurrent ? 'true' : undefined}
              className={`focus-ring flex h-10 w-full items-center justify-center rounded-xl border text-xs font-bold transition ${bgClass} hover:opacity-90 active:scale-95`}
              data-testid={`palette-question-${idx + 1}`}
            >
              <span className="flex items-center gap-0.5">
                {idx + 1}
                {status === 'marked' && <span className="sr-only">(Review)</span>}
                {status === 'answered' && <span className="sr-only">(Answered)</span>}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend with clear text and icon indicators so color alone is not used */}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-blue-700 ring-1 ring-blue-500"></span>
          <span>वर्तमान (Current)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-emerald-600 text-[9px] text-white">✓</span>
          <span>उत्तर दिया (Answered)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-amber-500 text-[9px] text-white">★</span>
          <span>Review (चिन्हित)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-purple-600 text-[9px] text-white">✓★</span>
          <span>उत्तर + Review</span>
        </div>
        <div className="flex items-center gap-1.5 col-span-2">
          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50"></span>
          <span>अनुत्तरित (Unanswered)</span>
        </div>
      </div>
    </div>
  );
}
