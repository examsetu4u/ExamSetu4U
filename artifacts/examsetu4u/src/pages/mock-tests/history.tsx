import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  History,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'wouter';
import { Button, Card, Footer, Header } from '@/components/site';
import type { MockResult } from '@/data/mock/types';
import { loadMockAttempts } from '@/lib/mock-test-storage';

export default function MockTestHistoryPage() {
  const attempts: MockResult[] = useMemo(() => loadMockAttempts(), []);

  const formatTimeSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    if (mins === 0) return `${rem}s`;
    return `${mins}m ${rem}s`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <Link href="/" className="hover:text-[hsl(var(--foreground))]">होम</Link>
          <span>/</span>
          <Link href="/mock-tests" className="hover:text-[hsl(var(--foreground))]">मॉक टेस्ट</Link>
          <span>/</span>
          <span className="font-semibold text-[hsl(var(--foreground))]">प्रयास इतिहास (History)</span>
        </div>

        {/* Page Header */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--secondary)/.3)] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-[hsl(var(--primary))]">
                <History size={14} />
                <span>मॉक टेस्ट लॉग</span>
              </span>
              <h1 className="font-display mt-3 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
                मॉक टेस्ट प्रयास इतिहास (Attempt History)
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
                आपके द्वारा दिए गए सभी मॉक टेस्ट सत्र, प्राप्तांक और प्रदर्शन का रिकॉर्ड।
              </p>
            </div>

            <Button href="/mock-tests" variant="primary" className="text-xs min-h-9 w-fit">
              <span>नया मॉक टेस्ट दें</span>
            </Button>
          </div>
        </div>

        {/* History List or Empty State */}
        <div className="mt-8">
          {attempts.length > 0 ? (
            <div className="space-y-4">
              {attempts.map((att) => {
                const maxMarks = att.maxMarks || att.totalQuestions * (att.marksPerQuestion || 1);

                return (
                  <Card
                    key={att.attemptId}
                    className="p-5 sm:p-6 transition hover:border-[hsl(var(--primary)/.6)] shadow-xs"
                    data-testid={`history-card-${att.attemptId}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-md bg-[hsl(var(--secondary))] px-2.5 py-0.5 font-bold text-[hsl(var(--primary))]">
                            {att.examName}
                          </span>
                          <span className="text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(att.date).toLocaleString('hi-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>

                        <h3 className="font-display text-base sm:text-lg font-bold text-[hsl(var(--foreground))]">
                          {att.testTitle}
                        </h3>

                        {/* Quick metrics */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--muted-foreground))] pt-1">
                          <span>
                            हल किए: <strong className="text-[hsl(var(--foreground))]">{att.attempted} / {att.totalQuestions}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 dark:text-emerald-400">
                            सही: <strong>{att.correct}</strong>
                          </span>
                          <span>•</span>
                          <span className="text-rose-700 dark:text-rose-400">
                            गलत: <strong>{att.incorrect}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            समय: <strong className="text-[hsl(var(--foreground))]">{formatTimeSeconds(att.timeUsedSeconds)}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Right: Score & Actions */}
                      <div className="flex flex-wrap items-center md:flex-col md:items-end justify-between gap-3 border-t md:border-t-0 border-[hsl(var(--border))] pt-3 md:pt-0">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-[hsl(var(--foreground))]">
                            {att.finalScore}
                          </span>
                          <span className="text-xs text-[hsl(var(--muted-foreground))] font-semibold">
                            / {maxMarks}
                          </span>
                          <span className="ml-2 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {att.accuracy}% Acc
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            href={`/mock-tests/result/${att.attemptId}`}
                            variant="outline"
                            className="text-xs min-h-8 py-1 px-3"
                            data-testid={`btn-view-result-${att.attemptId}`}
                          >
                            <span>परिणाम देखें</span>
                            <ExternalLink size={12} />
                          </Button>
                          <Button
                            href={`/mock-tests/start/${att.testId}`}
                            variant="primary"
                            className="text-xs min-h-8 py-1 px-3"
                            data-testid={`btn-retry-${att.attemptId}`}
                          >
                            <RotateCcw size={12} />
                            <span>Retry</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <History size={48} className="text-[hsl(var(--muted-foreground))] opacity-40 mb-3" />
              <h2 className="font-display text-lg font-bold text-[hsl(var(--foreground))]">
                अभी तक कोई मॉक टेस्ट नहीं दिया गया है
              </h2>
              <p className="mt-1 max-w-sm text-xs text-[hsl(var(--muted-foreground))]">
                वास्तविक परीक्षा वातावरण में अभ्यास करने के लिए पहला मॉक टेस्ट शुरू करें।
              </p>
              <Button href="/mock-tests" variant="primary" className="mt-4 text-xs">
                मॉक टेस्ट सूची देखें
              </Button>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
