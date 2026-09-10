import { Calendar, History, Trash2, Trophy, X } from 'lucide-react';
import { Button } from '@/components/site';
import type { QuizAttemptResult } from '@/data/quiz/types';

interface QuizHistoryModalProps {
  isOpen: boolean;
  history: QuizAttemptResult[];
  onClose: () => void;
  onSelectAttempt: (attempt: QuizAttemptResult) => void;
  onClearHistory: () => void;
}

export function QuizHistoryModal({
  isOpen,
  history,
  onClose,
  onSelectAttempt,
  onClearHistory,
}: QuizHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="w-full max-w-2xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
              <History size={20} />
            </span>
            <div>
              <h2 id="history-modal-title" className="font-display text-xl text-[hsl(var(--primary))] font-bold">
                पिछले Quiz प्रयास (Attempt History)
              </h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                आपके हाल के प्रयासों का रिकॉर्ड (कुल {history.length} प्रयास)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"
            aria-label="Close history dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* List of attempts */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {history.length === 0 ? (
            <div className="p-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
              अभी तक कोई Quiz प्रयास दर्ज नहीं हुआ है।
            </div>
          ) : (
            history.map((item) => {
              const formattedDate = new Date(item.date).toLocaleDateString('hi-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.attemptId}
                  className="flex flex-col gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.4)] p-4 transition hover:bg-[hsl(var(--secondary)/.7)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-[hsl(var(--primary))] bg-[hsl(var(--card))] px-2 py-0.5 rounded border border-[hsl(var(--border))]">
                        {item.examName}
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))]">• {item.topicName}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                      <Calendar size={13} />
                      <span>{formattedDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[hsl(var(--border))]">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[hsl(var(--primary))]">
                        {item.score} / {item.totalQuestions} ({item.percentage}%)
                      </p>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">सटीकता: {item.accuracy}%</p>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onSelectAttempt(item)}
                      className="text-xs py-1.5"
                    >
                      परिणाम देखें
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Clear and Close buttons */}
        <div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
          {history.length > 0 ? (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:underline"
            >
              <Trash2 size={14} />
              <span>इतिहास साफ़ करें</span>
            </button>
          ) : (
            <div></div>
          )}

          <Button type="button" variant="secondary" onClick={onClose}>
            बंद करें
          </Button>
        </div>
      </div>
    </div>
  );
}
