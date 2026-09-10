import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  Clock,
  FileQuestion,
  FileText,
  Filter,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'wouter';
import { Button, Card, Container, Layout, SearchBar, SectionTitle } from '@/components/site';
import { AvailabilityList, Breadcrumbs, EstimatedTime, ProgressBar } from '@/components/curriculum-ui';
import { ContinueLearningCard } from '@/components/continue-learning-card';
import { QuickPractice } from '@/components/quick-practice';
import { getExam, getSubject, getTopicsForSubject } from '@/data/curriculum';
import {
  getSmartContinueLearning,
  getSubjectStats,
  TopicLearningDetails,
  TopicStatus,
  TOPIC_STATUS_LABELS,
} from '@/lib/learning-path';
import NotFoundPage from '@/pages/not-found';

type SortOption = 'recommended' | 'not_started' | 'in_progress' | 'completed';

export default function SubjectDetailPage() {
  const { examId = '', subjectId = '' } = useParams<{ examId: string; subjectId: string }>();
  const exam = getExam(examId);
  const subject = getSubject(subjectId);

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  const subjectStats = useMemo(() => {
    if (!subject) return null;
    return getSubjectStats(subject.id);
  }, [subject]);

  const continueItem = useMemo(() => {
    if (!exam || !subject) return null;
    return getSmartContinueLearning(exam.id, subject.id);
  }, [exam, subject]);

  const rawTopics = useMemo(() => {
    if (!subjectStats) return [];
    return subjectStats.topics;
  }, [subjectStats]);

  // Filter and sort topics
  const sortedTopics = useMemo(() => {
    let list = rawTopics.filter(
      (td) =>
        `${td.topic.name} ${td.topic.description}`.toLowerCase().includes(query.toLowerCase())
    );

    switch (sortBy) {
      case 'not_started':
        return list.filter((td) => td.status === 'NOT_STARTED');
      case 'in_progress':
        return list.filter((td) => td.status === 'IN_PROGRESS');
      case 'completed':
        return list.filter((td) => td.status === 'COMPLETED');
      case 'recommended':
      default:
        // Recommended sort: In Progress first, then Unstarted, then Completed
        return [...list].sort((a, b) => {
          const rank = (status: TopicStatus) => {
            if (status === 'IN_PROGRESS') return 1;
            if (status === 'NOT_STARTED') return 2;
            return 3;
          };
          return rank(a.status) - rank(b.status);
        });
    }
  }, [rawTopics, query, sortBy]);

  if (!exam || !subject || subject.examId !== exam.id || !subjectStats) {
    return <NotFoundPage />;
  }

  return (
    <Layout>
      {/* 1. Subject Header */}
      <section className="paper-grid border-b border-[hsl(var(--border))] py-10 sm:py-14">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Exams', href: '/exams' },
              { label: exam.name, href: `/exams/${exam.id}` },
              { label: subject.name },
            ]}
          />

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="eyebrow">{exam.name}</span>
              <h1 className="font-display mt-2 text-3xl font-bold tracking-[-.035em] text-[hsl(var(--primary))] sm:text-4xl">
                {subject.name}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-base">
                {subject.description}
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[hsl(var(--secondary))] px-3 py-1 text-xs font-bold text-[hsl(var(--primary))]">
                {subjectStats.totalTopics} Topics
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {subjectStats.completedTopics} Completed
              </span>
              {subjectStats.quizAccuracy !== null && (
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  {subjectStats.quizAccuracy}% Accuracy
                </span>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Subject Progress Card (Requirement 3: Clean progress card) */}
      <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] py-8">
        <Container>
          <Card className="p-6 border border-[hsl(var(--border))] shadow-2xs" id="subject-progress-card">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                  विषयवार तैयारी स्तर (Subject Progress)
                </p>
                <h2 className="text-2xl font-bold text-[hsl(var(--primary))]">
                  {subject.name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                  <span className="text-[hsl(var(--primary))] font-bold">
                    {subjectStats.completedTopics} / {subjectStats.totalTopics} Topics Completed
                  </span>
                  <span>•</span>
                  <span>{subjectStats.averageProgress}% Topic Progress</span>
                  {subjectStats.quizAccuracy !== null && (
                    <>
                      <span>•</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        Quiz Accuracy: {subjectStats.quizAccuracy}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="w-full md:max-w-xs space-y-3">
                <ProgressBar
                  value={subjectStats.averageProgress}
                  label={`${subject.name} संपूर्णता`}
                />
                {continueItem && (
                  <Button
                    href={continueItem.actionUrl}
                    variant="primary"
                    className="w-full text-xs h-9 justify-center gap-1.5 shadow-xs"
                  >
                    <Play size={12} className="fill-current" />
                    Continue Learning <ArrowRight size={13} />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* 3. Continue Learning Card for Subject (Requirement 8) */}
      {continueItem && (
        <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.2)] py-8">
          <Container>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[hsl(var(--accent-foreground))]" />
                <h3 className="text-sm font-bold text-[hsl(var(--primary))]">
                  इस विषय में अगला कदम (Next Step in {subject.name})
                </h3>
              </div>
            </div>
            <ContinueLearningCard item={continueItem} />
          </Container>
        </section>
      )}

      {/* 4. Topic List with Sorting and Status Badges (Requirement 8) */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">अध्याय सूची (Topic Map)</p>
              <h2 className="font-display mt-2 text-2xl font-bold tracking-[-.035em] text-[hsl(var(--primary))] sm:text-3xl">
                {subject.name} के सभी अध्याय
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
                क्रमबद्ध तरीके से नोट्स पढ़ें, पिछले वर्षों के प्रश्न हल करें और क्विज़ दें।
              </p>
            </div>

            {/* Controls: Search and Sorting Tabs */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="अध्याय खोजें..."
                className="w-full sm:w-56"
              />

              {/* Sorting Filter (Requirement 8: Recommended, Not Started, In Progress, Completed. Default: Recommended) */}
              <div className="flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
                {(
                  [
                    { id: 'recommended', label: 'अनुशंसित (Recommended)' },
                    { id: 'in_progress', label: 'प्रगति पर' },
                    { id: 'not_started', label: 'शुरू नहीं किया' },
                    { id: 'completed', label: 'पूरा किया' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={`focus-ring rounded-md px-2.5 py-1 text-xs font-bold transition ${
                      sortBy === opt.id
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xs'
                        : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic Cards List */}
          {sortedTopics.length > 0 ? (
            <div className="mt-8 grid gap-4">
              {sortedTopics.map((td) => {
                const { topic, status, statusLabelHindi, overallProgress, steps, isComplete } = td;

                const statusColor =
                  status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : status === 'IN_PROGRESS'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]';

                return (
                  <Card
                    key={topic.id}
                    id={`topic-card-${topic.id}`}
                    className="p-5 sm:p-6 transition hover:border-[hsl(var(--accent))] hover:shadow-2xs"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusColor}`}>
                            {statusLabelHindi}
                          </span>
                          <h3 className="text-base font-bold text-[hsl(var(--primary))] sm:text-lg">
                            {topic.name}
                          </h3>
                          <EstimatedTime minutes={topic.estimatedMinutes} />
                        </div>

                        <p className="mt-2 text-xs sm:text-sm text-[hsl(var(--muted-foreground))] max-w-2xl">
                          {topic.description}
                        </p>

                        {/* Step Indicators: Study Material, PYQ, Quiz */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {steps.map((st) => (
                            <span
                              key={st.type}
                              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                                !st.isAvailable
                                  ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] opacity-50'
                                  : st.status === 'completed'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                  : st.status === 'in_progress'
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]'
                              }`}
                            >
                              {st.status === 'completed' && <Check size={12} strokeWidth={3} />}
                              {st.type === 'study' && <FileText size={12} />}
                              {st.type === 'pyq' && <FileQuestion size={12} />}
                              {st.type === 'quiz' && <Brain size={12} />}
                              <span>{st.title}</span>
                              {st.isAvailable && (
                                <span className="text-[10px] opacity-70">
                                  ({st.status === 'completed' ? 'Done' : `${st.progress}%`})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Topic Progress & Continue Button */}
                      <div className="w-full lg:max-w-xs shrink-0">
                        <ProgressBar value={overallProgress} label="अध्याय संपूर्णता" />
                        <Button
                          href={`/exams/${exam.id}/${subject.id}/${topic.id}`}
                          variant={status === 'IN_PROGRESS' ? 'primary' : 'secondary'}
                          className="mt-4 w-full justify-center gap-1.5 text-xs h-9"
                        >
                          {status === 'COMPLETED' ? (
                            <>
                              रिवीज़न करें (Review) <ArrowRight size={13} />
                            </>
                          ) : status === 'IN_PROGRESS' ? (
                            <>
                              <Play size={12} className="fill-current" /> अध्ययन जारी रखें (Continue)
                            </>
                          ) : (
                            <>
                              अध्याय शुरू करें <ArrowRight size={13} />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-[hsl(var(--border))] p-10 text-center">
              <CheckCircle2 className="mx-auto text-[hsl(var(--accent-foreground))]" />
              <p className="mt-3 font-semibold text-[hsl(var(--primary))]">कोई अध्याय नहीं मिला</p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                फ़िल्टर या खोज शब्द बदलकर प्रयास करें।
              </p>
            </div>
          )}

          <div className="mt-10">
            <Link
              href={`/exams/${exam.id}`}
              className="focus-ring inline-flex items-center rounded text-sm font-bold text-[hsl(var(--primary))] hover:text-[hsl(var(--accent-foreground))]"
            >
              <ArrowRight size={15} className="mr-2 rotate-180" />
              वापस {exam.name} पाठ्यक्रम पर जाएं
            </Link>
          </div>
        </Container>
      </section>

      {/* 5. Quick Practice on Subject Page (Requirement 11) */}
      <section className="py-10 border-t border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.15)]">
        <Container>
          <QuickPractice
            examId={exam.id}
            subjectId={subject.id}
            examName={exam.name}
            subjectName={subject.name}
          />
        </Container>
      </section>
    </Layout>
  );
}
