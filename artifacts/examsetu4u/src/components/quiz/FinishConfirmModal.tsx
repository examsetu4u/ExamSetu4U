import { AlertTriangle, CheckCircle2, CircleDot, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/site';

interface FinishConfirmModalProps {
  isOpen: boolean;
  totalQuestions: number;
  attemptedCount: number;
  unansweredCount: number;
  markedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FinishConfirmModal({
  isOpen,
  totalQuestions,
  attemptedCount,
  unansweredCount,
  markedCount,
  onConfirm,
  onCancel,
}: FinishConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="finish-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <AlertTriangle size={22} />
            </span>
            <div>
              <h2 id="finish-modal-title" className="font-display text-xl text-[hsl(var(--primary))]">
                Quiz समाप्त करें?
              </h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                पुष्टि करने से पहले अपने प्रयास की समीक्षा करें।
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"
            aria-label="Close confirmation dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Summary counts */}
        <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-[hsl(var(--secondary))] p-3 text-center">
          <div className="rounded-lg bg-[hsl(var(--card))] p-2.5 shadow-xs">
            <p className="text-lg font-bold text-emerald-600">{attemptedCount}</p>
            <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">प्रयास किए (Attempted)</p>
          </div>
          <div className="rounded-lg bg-[hsl(var(--card))] p-2.5 shadow-xs">
            <p className="text-lg font-bold text-[hsl(var(--muted-foreground))]">{unansweredCount}</p>
            <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">छोड़े गए (Unanswered)</p>
          </div>
          <div className="rounded-lg bg-[hsl(var(--card))] p-2.5 shadow-xs">
            <p className="text-lg font-bold text-amber-600">{markedCount}</p>
            <p className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">चिन्हित (Review)</p>
          </div>
        </div>

        {unansweredCount > 0 && (
          <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            ⚠️ आपके पास अभी भी <strong>{unansweredCount}</strong> अनुत्तरित प्रश्न शेष हैं। क्या आप निश्चित रूप से Quiz जमा करना चाहते हैं?
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="w-full sm:w-auto"
            data-testid="button-cancel-finish"
          >
            जारी रखें (Cancel)
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="button-confirm-finish"
          >
            हाँ, Quiz समाप्त करें
          </Button>
        </div>
      </div>
    </div>
  );
}
