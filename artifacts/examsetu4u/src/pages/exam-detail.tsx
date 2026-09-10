import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileQuestion,
  FileText,
  Filter,
  Layers3,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'wouter';
import { Button, Card, Container, Layout, SearchBar, SectionTitle } from '@/components/site';
import { AvailabilityList, Breadcrumbs, EstimatedTime, ProgressBar } from '@/components/curriculum-ui';
import { ContinueLearningCard } from '@/components/continue-learning-card';
import { QuickPractice } from '@/components/quick-practice';
import { RecentlyStudied } from '@/components/recently-studied';
import { getExam, getSubjectsForExam, getTopicsForSubject } from '@/data/curriculum';
import {
  getExamProgress,
  getRecentlyStudied,
  getSmartContinueLearning,
  getSubjectStats,
} from '@/lib/learning-path';
import NotFoundPage from '@/pages/not-found';

export default function ExamDetailPage() {
  const { examId = '' } = useParams<{ examId: string }>();
  const exam = getExam(examId);

  const [query, setQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<'all' | 'study' | 'pyq' | 'quiz'>('all');

  const subjects = useMemo(() => (exam ? getSubjectsForExam(exam.id) : []), [exam]);

  // Exam Progress from Module 9 (integrated with Module 6 Intelligent Score & Module 7 Daily Goal)
  const examProgressData = useMemo(() => (exam ? getExamProgress(exam.id) : null), [exam]);

  // Smart Continue Learning item for this exam
  const continueItem = useMemo(() => (exam ? getSmartContinueLearning(exam.id) : null), [exam]);

  // Recently Studied activities
  const recentActivities = useMemo(() => getRecentlyStudied(8), []);

  // Subject stats list
  const subjectStatsList = useMemo(() => {
    return subjects.map((subj) => ({
      subject: subj,
      stats: getSubjectStats(subj.id),
    }));
  }, [subjects]);

  const filteredSubjectStats = useMemo(() => {
    return subjectStatsList.filter(
      ({ subject }) =>
        `${subject.name} ${subject.description}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, subjectStatsList]);

  // All topics for the exam
  const allExamTopics = useMemo(() => {
    if (!exam) return [];
    return subjects.flatMap((s) => getTopicsForSubject(s.id));
  }, [exam, subjects]);

  // Filtered topics for topic discovery explorer
  const discoveredTopics = useMemo(() => {
    let list = allExamTopics;
    if (selectedSubjectId !== 'all') {
      list = list.filter((t) => t.subjectId === selectedSubjectId);
    }
    if (topicFilter === 'study') {
      list = list.filter((t) => t.availability.studyMaterial);
    } else if (topicFilter === 'pyq') {
      list = list.filter((t) => t.availability.pyq);
    } else if (topicFilter === 'quiz') {
      list = list.filter((t) => t.availability.quiz);
    }
    return list;
  }, [allExamTopics, selectedSubjectId, topicFilter]);

  if (!exam || !examProgressData) return <NotFoundPage />;

  const tones = {
    saffron: 'bg-[#f7e3bb] text-[#825413]',
    teal: 'bg-[#d6ebe5] text-[#246556]',
    blue: 'bg-[#dce4f2] text-[#34547f]',
    coral: 'bg-[#f3dcd5] text-[#9a493e]',
  };

  const { intelligentScore, dailyGoal } = examProgressData;

  return (
    <Layout>
      {/* 1. Exam Header with Breadcrumbs */}
      <section className="hero-wash text-[hsl(var(--primary-foreground))]">
        <Container className="py-10 sm:py-14">
          <div className="text-white/80">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Exams', href: '/exams' },
                { label: exam.name },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${tones[exam.tone]}`}>
                {exam.name}
              </span>
              <h1 className="font-display mt-4 text-4xl leading-tight tracking-[-.04em] sm:text-5xl">
                {exam.name} Structured Learning Path
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--primary-foreground)/.75)] sm:text-base">
                {exam.description}
              </p>
            </div>

            {/* Quick Readiness Card */}
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm sm:min-w-[260px]">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-white/80">Overall Preparation</span>
                <span className="font-bold text-[hsl(var(--accent))]">
                  {examProgressData.overallPercentage}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/20">
                <div
                  className="h-full rounded-full bg-[hsl(var(--accent))] transition-all"
                  style={{ width: `${examProgressData.overallPercentage}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-white/70">
                <span>
                  {examProgressData.completedTopics} / {examProgressData.totalTopics} Topics Completed
                </span>
                <span>{examProgressData.subjectsCompleted} / {examProgressData.totalSubjects} Subjects</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Preparation Summary (Requirement 4 & 7: Total subjects, started, completed, total topic progress, overall %, Intelligent Score, Daily Goal) */}
      <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/.6)] py-6">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Subjects Progress Metric */}
            <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                <Layers3 size={20} />
              </span>
              <div>
                <p className="text-xl font-bold text-[hsl(var(--primary))]">
                  {examProgressData.subjectsStarted} / {examProgressData.totalSubjects}
                </p>
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                  Subjects Started ({examProgressData.subjectsCompleted} Completed)
                </p>
              </div>
            </div>

            {/* Topics Progress Metric */}
            <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                <BookOpen size={20} />
              </span>
              <div>
                <p className="text-xl font-bold text-[hsl(var(--primary))]">
                  {examProgressData.completedTopics} / {examProgressData.totalTopics}
                </p>
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                  Topics Done ({examProgressData.totalTopicProgress}% avg progress)
                </p>
              </div>
            </div>

            {/* Intelligent Score Metric from Module 6 */}
            <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Award size={20} />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xl font-bold text-[hsl(var(--primary))]">
                    {intelligentScore.score}
                  </p>
                  <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))]">/100</span>
                </div>
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                  Intelligent Score ({intelligentScore.tier})
                </p>
              </div>
            </div>

            {/* Daily Goal Metric from Module 7 */}
            <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Target size={20} />
              </span>
              <div>
                <p className="text-xl font-bold text-[hsl(var(--primary))]">
                  {dailyGoal.todayQuestionsAttempted} / {dailyGoal.targetQuestions} Qs
                </p>
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                  Daily Goal ({dailyGoal.percentage}%) {dailyGoal.isCompleted ? '✓ Done' : ''}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Continue Learning (Requirement 6 & 7: Reusable ContinueLearningCard) */}
      <section className="py-8 border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.2)]">
        <Container>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[hsl(var(--accent-foreground))]" />
              <h2 className="text-base font-bold text-[hsl(var(--primary))]">
                अध्ययन जारी रखें (Continue Learning)
              </h2>
            </div>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              प्राथमिकता आधारित अनुशंसित कदम
            </span>
          </div>

          <ContinueLearningCard item={continueItem} />
        </Container>
      </section>

      {/* 4. Subjects List (Requirement 7: Subject Name, Topic Count, Completed Topics, Progress Bar, Quiz Accuracy if available, Continue button) */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionTitle
              eyebrow="विषयवार अध्ययन (Subjects Overview)"
              title="प्रत्येक विषय को क्रमबद्ध तरीके से पूरा करें"
              description="प्रत्येक विषय में चैप्टर्स, नोट्स, PYQ व क्विज़ प्रगति को एक नज़र में देखें।"
            />
            <div className="w-full md:max-w-xs">
              <SearchBar value={query} onChange={setQuery} placeholder="विषय खोजें..." />
            </div>
          </div>

          {filteredSubjectStats.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {filteredSubjectStats.map(({ subject, stats }) => {
                const totalTopicCount = stats?.totalTopics || subject.topicIds.length;
                const completedTopicCount = stats?.completedTopics || 0;
                const progressVal = stats?.averageProgress || 0;
                const quizAcc = stats?.quizAccuracy;

                return (
                  <Card
                    key={subject.id}
                    id={`subject-card-${subject.id}`}
                    className="flex h-full flex-col p-5 sm:p-6 transition hover:border-[hsl(var(--accent))] hover:shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                          Subject
                        </p>
                        <h3 className="mt-1 text-xl font-bold text-[hsl(var(--primary))]">
                          {subject.name}
                        </h3>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                        <BookOpen size={18} />
                      </span>
                    </div>

                    <p className="mt-3 flex-1 text-xs sm:text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                      {subject.description}
                    </p>

                    {/* Topic count, completed count & quiz accuracy */}
                    <div className="mt-5 grid grid-cols-2 gap-2 text-xs border-y border-[hsl(var(--border))] py-3">
                      <div>
                        <span className="text-[11px] text-[hsl(var(--muted-foreground))]">अध्याय प्रगति:</span>
                        <p className="font-bold text-[hsl(var(--primary))]">
                          {completedTopicCount} / {totalTopicCount} Topics Completed
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Quiz Accuracy:</span>
                        <p className="font-bold text-[hsl(var(--primary))]">
                          {quizAcc !== null && quizAcc !== undefined ? `${quizAcc}%` : 'अभी कोई टेस्ट नहीं'}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <ProgressBar value={progressVal} label="Subject Progress" />
                    </div>

                    {/* Action Controls */}
                    <div className="mt-5 flex items-center gap-2">
                      <Button
                        href={`/exams/${exam.id}/${subject.id}`}
                        variant="primary"
                        className="flex-1 text-xs h-9 justify-center gap-1.5"
                      >
                        <Play size={12} className="fill-current" />
                        अध्ययन जारी रखें (Continue)
                        <ArrowRight size={13} />
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSubjectId(subject.id);
                          const el = document.getElementById('topic-discovery-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="focus-ring rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]"
                        title="Explore Topics below"
                      >
                        चैप्टर सूची ({totalTopicCount})
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-[hsl(var(--border))] p-10 text-center">
              <CheckCircle2 className="mx-auto text-[hsl(var(--accent-foreground))]" />
              <p className="mt-3 font-semibold text-[hsl(var(--primary))]">कोई विषय नहीं मिला</p>
              <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                सर्च शब्द बदलकर पुनः प्रयास करें।
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* 5. Overall Progress Section (Requirement 7) */}
      <section className="paper-grid border-y border-[hsl(var(--border))] py-12 sm:py-16">
        <Container>
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="eyebrow">सम्पूर्ण परीक्षा प्रगति (Overall Progress)</span>
                <h2 className="font-display mt-2 text-2xl font-bold text-[hsl(var(--primary))] sm:text-3xl">
                  {exam.name} में आपकी तैयारी का स्तर
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  यह प्रगति आपके नोट्स अध्ययन, PYQ अभ्यास और दैनिक क्विज़ के प्रदर्शन को मिलाकर परिकलित की जाती है।
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-black text-[hsl(var(--primary))]">
                    {examProgressData.overallPercentage}%
                  </p>
                  <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mt-0.5">
                    तैयारी पूर्णता
                  </p>
                </div>
                <div className="h-12 w-px bg-[hsl(var(--border))]" />
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400">
                    {intelligentScore.score}
                  </p>
                  <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mt-0.5">
                    इंटेलिजेंट स्कोर
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">
                <span>पाठ्यक्रम कवरेज ({examProgressData.completedTopics} of {examProgressData.totalTopics} टॉपिक्स पूर्ण)</span>
                <span>{examProgressData.overallPercentage}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                <div
                  className="h-full rounded-full bg-[hsl(var(--primary))] transition-all"
                  style={{ width: `${examProgressData.overallPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 6. Quick Practice Section (Requirement 7 & 11) */}
      <section className="py-10 border-b border-[hsl(var(--border))]">
        <Container>
          <QuickPractice
            examId={exam.id}
            examName={exam.name}
          />
        </Container>
      </section>

      {/* 7. Recently Studied Topics (Requirement 7 & 10) */}
      <section className="py-10 border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.2)]">
        <Container>
          <RecentlyStudied
            items={recentActivities}
            title={`${exam.name} - हाल ही में पढ़ा गया (Recently Studied)`}
          />
        </Container>
      </section>

      {/* 8. Topic Discovery Explorer (Preserving Module 8 capability) */}
      <section
        id="topic-discovery-section"
        className="py-12 sm:py-16 bg-[hsl(var(--card))]"
      >
        <Container>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="eyebrow">Topic Discovery Explorer</p>
              <h2 className="font-display mt-2 text-2xl sm:text-3xl font-bold tracking-[-.035em] text-[hsl(var(--primary))]">
                {exam.name} के सभी टॉपिक एक्सप्लोर करें
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
                नोट्स, PYQ और क्विज़ उपलब्धता के आधार पर फ़िल्टर करें और सीधा अध्ययन करें।
              </p>
            </div>

            {/* Subject Selector & Availability Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="focus-ring rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))]"
                aria-label="Filter by subject"
              >
                <option value="all">सभी विषय ({subjects.length})</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1">
                {(['all', 'study', 'pyq', 'quiz'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setTopicFilter(filter)}
                    className={`focus-ring rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                      topicFilter === filter
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xs'
                        : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]'
                    }`}
                  >
                    {filter === 'all' && 'All'}
                    {filter === 'study' && 'Study'}
                    {filter === 'pyq' && 'PYQ'}
                    {filter === 'quiz' && 'Quiz'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic Cards Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {discoveredTopics.map((topic) => {
              const subject = subjects.find((s) => s.id === topic.subjectId);

              return (
                <Card
                  key={topic.id}
                  className="flex flex-col justify-between p-5 transition hover:border-[hsl(var(--accent))] hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                        {subject?.name || 'Subject'}
                      </span>
                      <EstimatedTime minutes={topic.estimatedMinutes} />
                    </div>

                    <h3 className="mt-2 text-base font-bold text-[hsl(var(--primary))]">
                      {topic.name}
                    </h3>

                    <p className="mt-1.5 text-xs leading-relaxed text-[hsl(var(--muted-foreground))] line-clamp-2">
                      {topic.description}
                    </p>

                    {/* Content Availability Badges */}
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                          topic.availability.studyMaterial
                            ? 'bg-[#f7e3bb] text-[#825413]'
                            : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] opacity-60'
                        }`}
                      >
                        <FileText size={10} />
                        Study Notes
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                          topic.availability.pyq
                            ? 'bg-[#d6ebe5] text-[#246556]'
                            : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] opacity-60'
                        }`}
                      >
                        <FileQuestion size={10} />
                        PYQ
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                          topic.availability.quiz
                            ? 'bg-[#dce4f2] text-[#34547f]'
                            : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] opacity-60'
                        }`}
                      >
                        <Brain size={10} />
                        Quiz
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[hsl(var(--border))]">
                    <Button
                      href={`/exams/${exam.id}/${topic.subjectId}/${topic.id}`}
                      variant="secondary"
                      className="w-full text-xs h-9 justify-center gap-1.5"
                    >
                      लर्निंग पाथ खोलें <ArrowRight size={13} />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>
    </Layout>
  );
}
