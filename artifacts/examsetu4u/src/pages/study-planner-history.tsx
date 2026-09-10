import {
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  HelpCircle,
  History,
  ListChecks,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'wouter';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout } from '@/components/site';
import {
  formatReadableDate,
  getStudyHistory,
  getStudyStreak,
  StudyHistoryEntry,
} from '@/lib/study-planner';

export default function StudyPlannerHistoryPage() {
  const history = useMemo(() => getStudyHistory(), []);
  const streak = useMemo(() => getStudyStreak(), []);

  // Aggregate stats across recorded history
  const totalQuestionsAllDays = useMemo(
    () => history.reduce((acc, h) => acc + h.questionsAttempted, 0),
    [history]
  );
  const totalCorrectAllDays = useMemo(
    () => history.reduce((acc, h) => acc + h.questionsCorrect, 0),
    [history]
  );
  const totalGoalsCompletedDays = useMemo(
    () => history.filter((h) => h.isGoalCompleted).length,
    [history]
  );
  const overallAccuracy =
    totalQuestionsAllDays > 0
      ? Math.round((totalCorrectAllDays / totalQuestionsAllDays) * 100)
      : 0;

  return (
    <Layout>
      {/* Header Section */}
      <section className="paper-grid border-b border-[hsl(var(--border))] py-8 sm:py-12">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'दैनिक अध्ययन प्लानर', href: '/study-planner' },
              { label: 'अध्ययन इतिहास' },
            ]}
          />

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-xs font-bold text-white shadow-sm">
                  <History size={14} className="text-amber-400" /> दैनिक इतिहास
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
                  <Flame size={14} className="text-amber-600" /> {streak.currentStreak} Day Streak
                </span>
              </div>
              <h1 className="font-display mt-2.5 text-2xl font-bold tracking-tight text-[hsl(var(--primary))] sm:text-4xl">
                दैनिक अध्ययन इतिहास (Study History)
              </h1>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] max-w-2xl">
                आपके पिछले दिनों की पढ़ाई, प्रश्न अभ्यास, क्विज़, PYQ और दैनिक लक्ष्यों की पूर्ति का प्रामाणिक रिकॉर्ड।
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button href="/study-planner" variant="primary" className="min-h-11 text-xs font-bold" data-testid="button-back-to-planner">
                <ArrowLeft size={15} /> आज की पढ़ाई पर लौटें
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12">
        <Container>
          {/* Summary Stat Cards */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4" id="study-history-summary-cards">
            <Card className="p-4 sm:p-5">
              <span className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">कुल अध्ययन दिवस</span>
              <p className="mt-1 text-2xl sm:text-3xl font-bold text-[hsl(var(--primary))]">{history.length}</p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">सक्रिय अध्ययन दिन</p>
            </Card>

            <Card className="p-4 sm:p-5">
              <span className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">लक्ष्य पूर्ण दिवस</span>
              <p className="mt-1 text-2xl sm:text-3xl font-bold text-emerald-600">{totalGoalsCompletedDays}</p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">100% लक्ष्य हासिल</p>
            </Card>

            <Card className="p-4 sm:p-5">
              <span className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">कुल प्रश्न अभ्यास</span>
              <p className="mt-1 text-2xl sm:text-3xl font-bold text-sky-700 dark:text-sky-400">{totalQuestionsAllDays}</p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{totalCorrectAllDays} सही उत्तर</p>
            </Card>

            <Card className="p-4 sm:p-5">
              <span className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">औसत सटीकता</span>
              <p className="mt-1 text-2xl sm:text-3xl font-bold text-amber-600">{overallAccuracy}%</p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))]">समग्र शुद्धता दर</p>
            </Card>
          </div>

          {/* History List or Empty State */}
          {history.length === 0 ? (
            <Card className="p-10 text-center" id="study-history-empty-card">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
                <History size={28} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-[hsl(var(--primary))]">
                अभी कोई study history उपलब्ध नहीं है।
              </h2>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
                जब आप दैनिक लक्ष्य के अनुसार प्रश्न हल करेंगे, क्विज़ देंगे या अध्याय पढ़ेंगे, तो आपका दैनिक इतिहास यहाँ स्वतः दर्ज होगा।
              </p>
              <div className="mt-6 flex justify-center">
                <Button href="/study-planner" variant="primary" data-testid="button-start-first-study">
                  आज की पढ़ाई शुरू करें <ArrowRight size={15} />
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4" id="study-history-timeline">
              <h2 className="text-base font-bold text-[hsl(var(--primary))] flex items-center gap-2">
                <Calendar size={18} /> प्रतिदिन का अध्ययन विवरण ({history.length} दिन)
              </h2>

              <div className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.date}
                    className="flex flex-col gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between"
                    id={`history-row-${entry.date}`}
                  >
                    {/* Left Date & Goal Status */}
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm sm:text-base font-bold text-[hsl(var(--foreground))]">
                            {entry.formattedDate}
                          </h3>
                          <span className="text-[11px] text-[hsl(var(--muted-foreground))] font-mono">
                            ({entry.date})
                          </span>
                          {entry.isGoalCompleted ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                              <CheckCircle2 size={12} /> लक्ष्य पूर्ण
                            </span>
                          ) : (
                            <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200">
                              {entry.completionPercentage}% पूर्ण
                            </span>
                          )}
                        </div>

                        {/* Detail metrics chips */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                          <span className="font-semibold text-[hsl(var(--foreground))]">
                            प्रश्न: <span className="text-[hsl(var(--primary))] font-bold">{entry.questionsAttempted}</span> / {entry.goalTarget}
                          </span>
                          {entry.questionsCorrect > 0 && (
                            <span>
                              सही: <span className="text-emerald-600 font-bold">{entry.questionsCorrect}</span>
                            </span>
                          )}
                          {entry.studyMaterialsCount > 0 && (
                            <span>
                              अध्याय: <span className="font-bold">{entry.studyMaterialsCount}</span>
                            </span>
                          )}
                          {entry.pyqsAttempted > 0 && (
                            <span>
                              PYQ: <span className="font-bold">{entry.pyqsAttempted}</span>
                            </span>
                          )}
                          {entry.quizzesCompleted > 0 && (
                            <span>
                              क्विज़: <span className="font-bold">{entry.quizzesCompleted}</span>
                            </span>
                          )}
                          {entry.revisionsDone > 0 && (
                            <span>
                              रिवीजन: <span className="font-bold">{entry.revisionsDone}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Progress bar & Action */}
                    <div className="flex flex-col sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[hsl(var(--border))]">
                      <div className="w-full sm:w-36">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[hsl(var(--muted-foreground))] mb-1">
                          <span>प्रगति</span>
                          <span>{entry.completionPercentage}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                          <div
                            className={`h-full rounded-full ${
                              entry.isGoalCompleted ? 'bg-emerald-500' : 'bg-[hsl(var(--primary))]'
                            }`}
                            style={{ width: `${entry.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </Layout>
  );
}
