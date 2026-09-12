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
import { CurrentAffairsHub } from '@/components/current-affairs-hub';
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

import { ScienceDashboard } from '@/components/cbse-science/ScienceDashboard';

export default function SubjectDetailPage() {
  const { examId = '', subjectId = '' } = useParams<{ examId: string; subjectId: string }>();
  const exam = getExam(examId);
  const subject = getSubject(subjectId, examId);

  // Dedicated CBSE Class 10 Science Dashboard delegation
  if (
    exam?.id === 'cbse-class-10' &&
    (subject?.id === 'cbse-class-10-science' ||
      subjectId === 'science' ||
      subjectId === 'cbse-class-10-science')
  ) {
    return <ScienceDashboard examId={exam.id} />;
  }

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

  const isUppcsCurrentAffairs =
    exam?.id === 'uppcs-pre' &&
    (subject?.id === 'uppcs-pre-current-affairs' || subject?.id === 'current-affairs');

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
      {/* 1. Subject Header - Prepare with purpose theme */}
      <section className="hero-wash text-white py-10 sm:py-14">
        <Container>
          <div className="text-blue-200">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Exams', href: '/exams' },
                { label: exam.name, href: `/exams/${exam.id}` },
                { label: subject.name },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-blue-200 backdrop-blur-xs">
                {exam.name}
              </span>
              <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                <span className="text-blue-300">{subject.name}</span>
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-blue-100/90 sm:text-base">
                {subject.description}
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-xs shadow-xs">
                {subjectStats.totalTopics} Topics
              </span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-200 backdrop-blur-xs">
                {subjectStats.completedTopics} Completed
              </span>
              {subjectStats.quizAccuracy !== null && (
                <span className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-blue-200 backdrop-blur-xs shadow-xs">
                  {subjectStats.quizAccuracy}% Accuracy
                </span>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Subject Progress Card */}
      <section className="border-b border-slate-200 bg-white py-8">
        <Container>
          <Card className="p-6 border border-blue-200/90 shadow-xs" id="subject-progress-card">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  विषयवार तैयारी स्तर (Subject Progress)
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  {subject.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                  <span className="text-slate-900 font-bold">
                    {subjectStats.completedTopics} / {subjectStats.totalTopics} Topics Done
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>{subjectStats.averageProgress}% Progress</span>
                  {subjectStats.quizAccuracy !== null && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="text-blue-700 font-bold">
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
                    className="w-full text-xs h-9 justify-center gap-1.5 shadow-xs font-bold"
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

      {/* 3. Continue Learning Card for Subject */}
      {continueItem && (
        <section className="border-b border-blue-100 bg-blue-50/40 py-8">
          <Container>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  इस विषय में अगला कदम (Next Step in {subject.name})
                </h3>
              </div>
            </div>
            <ContinueLearningCard item={continueItem} />
          </Container>
        </section>
      )}

      {/* Interactive Current Affairs Hub for UPPCS Pre */}
      {isUppcsCurrentAffairs && (
        <section className="border-b-2 border-indigo-200/80 bg-white py-10 dark:bg-slate-950">
          <Container>
            <CurrentAffairsHub />
          </Container>
        </section>
      )}

      {/* 4. Topic List with Sorting and Status Badges */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">अध्याय सूची (Topic Map)</p>
              <h2 className="font-display mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {subject.name} के सभी अध्याय
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">
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

              {/* Sorting Filter */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
                {(
                  [
                    { id: 'recommended', label: 'अनुशंसित' },
                    { id: 'in_progress', label: 'प्रगति पर' },
                    { id: 'not_started', label: 'शुरू नहीं किया' },
                    { id: 'completed', label: 'पूरा किया' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={`focus-ring rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      sortBy === opt.id
                        ? 'bg-blue-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-blue-700'
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
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                    : status === 'IN_PROGRESS'
                    ? 'border border-blue-200 bg-blue-50 text-blue-800'
                    : 'border border-slate-200 bg-slate-50 text-slate-600';

                return (
                  <Card
                    key={topic.id}
                    id={`topic-card-${topic.id}`}
                    className="p-5 sm:p-6 transition hover:border-blue-300 hover:shadow-xs"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${statusColor}`}>
                            {statusLabelHindi}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                            {topic.name}
                          </h3>
                          <EstimatedTime minutes={topic.estimatedMinutes} />
                        </div>

                        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl">
                          {topic.description}
                        </p>

                        {/* Step Indicators: Study Material, PYQ, Quiz */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {steps.map((st) => (
                            <span
                              key={st.type}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                                !st.isAvailable
                                  ? 'border border-slate-200 bg-slate-50 text-slate-400 opacity-50'
                                  : st.status === 'completed'
                                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                                  : st.status === 'in_progress'
                                  ? 'border border-blue-200 bg-blue-50 text-blue-800'
                                  : 'border border-slate-200 bg-white text-slate-700'
                              }`}
                            >
                              {st.status === 'completed' && <Check size={12} strokeWidth={3} />}
                              {st.type === 'study' && <FileText size={12} />}
                              {st.type === 'pyq' && <FileQuestion size={12} />}
                              {st.type === 'quiz' && <Brain size={12} />}
                              <span>{st.title}</span>
                              {st.isAvailable && (
                                <span className="text-[10px] opacity-75">
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
                          className="mt-4 w-full justify-center gap-1.5 text-xs h-9 font-bold"
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
            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/30 p-10 text-center">
              <CheckCircle2 className="mx-auto text-blue-700" size={28} />
              <p className="mt-3 font-bold text-slate-900">कोई अध्याय नहीं मिला</p>
              <p className="mt-1 text-sm text-slate-600">
                फ़िल्टर या खोज शब्द बदलकर प्रयास करें।
              </p>
            </div>
          )}

          <div className="mt-10">
            <Link
              href={`/exams/${exam.id}`}
              className="focus-ring inline-flex items-center rounded text-sm font-bold text-blue-700 hover:text-blue-800 transition"
            >
              <ArrowRight size={15} className="mr-2 rotate-180" />
              वापस {exam.name} पाठ्यक्रम पर जाएं
            </Link>
          </div>
        </Container>
      </section>

      {/* 5. Quick Practice on Subject Page */}
      <section className="py-10 border-t border-slate-200 bg-white">
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
