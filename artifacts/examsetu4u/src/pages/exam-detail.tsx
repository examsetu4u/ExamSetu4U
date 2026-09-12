import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Calendar,
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

  const tones: Record<string, string> = {
    saffron: 'border border-blue-200 bg-blue-50 text-blue-700',
    teal: 'border border-blue-200 bg-blue-50 text-blue-700',
    blue: 'border border-blue-200 bg-blue-50 text-blue-700',
    coral: 'border border-blue-200 bg-blue-50 text-blue-700',
  };

  const { intelligentScore, dailyGoal } = examProgressData;

  return (
    <Layout>
      {/* 1. Exam Header with Breadcrumbs */}
      <section className="hero-wash text-white">
        <Container className="py-10 sm:py-14">
          <div className="text-blue-200">
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
              <span className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-blue-200 backdrop-blur-xs">
                {exam.name}
              </span>
              <h1 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white">
                {exam.name} Structured Learning Path
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-blue-100/80 sm:text-base sm:leading-7">
                {exam.description}
              </p>
            </div>

            {/* Quick Readiness Card */}
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md sm:min-w-[260px]">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-blue-100">Overall Preparation</span>
                <span className="font-extrabold text-blue-300">
                  {examProgressData.overallPercentage}%
                </span>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-blue-950/60">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all duration-300"
                  style={{ width: `${examProgressData.overallPercentage}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-blue-200/80">
                <span>
                  {examProgressData.completedTopics} / {examProgressData.totalTopics} Topics Completed
                </span>
                <span>{examProgressData.subjectsCompleted} / {examProgressData.totalSubjects} Subjects</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Preparation Summary */}
      <section className="border-b border-slate-200 bg-white py-6">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Subjects Progress Metric */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Layers3 size={20} />
              </span>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {examProgressData.subjectsStarted} / {examProgressData.totalSubjects}
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  Subjects Started ({examProgressData.subjectsCompleted} Completed)
                </p>
              </div>
            </div>

            {/* Topics Progress Metric */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <BookOpen size={20} />
              </span>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {examProgressData.completedTopics} / {examProgressData.totalTopics}
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  Topics Done ({examProgressData.totalTopicProgress}% avg)
                </p>
              </div>
            </div>

            {/* Intelligent Score Metric */}
            <div className="flex items-center gap-3 rounded-xl border border-amber-200/70 bg-amber-50/40 p-4 shadow-2xs">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Award size={20} />
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xl font-bold text-slate-900">
                    {intelligentScore.score}
                  </p>
                  <span className="text-[10px] font-bold text-slate-500">/100</span>
                </div>
                <p className="text-xs font-semibold text-amber-800">
                  Intelligent Score ({intelligentScore.tier})
                </p>
              </div>
            </div>

            {/* Daily Goal Metric */}
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-4 shadow-2xs">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Target size={20} />
              </span>
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {dailyGoal.todayQuestionsAttempted} / {dailyGoal.targetQuestions} Qs
                </p>
                <p className="text-xs font-semibold text-emerald-800">
                  Daily Goal ({dailyGoal.percentage}%) {dailyGoal.isCompleted ? '✓ Done' : ''}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Continue Learning (Secondary Blue Section) */}
      <section className="py-8 border-b border-blue-100 bg-blue-50/40">
        <Container>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-700" />
              <h2 className="text-base font-bold text-slate-900">
                अध्ययन जारी रखें (Continue Learning)
              </h2>
            </div>
            <span className="text-xs font-medium text-slate-500">
              प्राथमिकता आधारित अनुशंसित कदम
            </span>
          </div>

          <ContinueLearningCard item={continueItem} />
        </Container>
      </section>

      {/* 4. Subjects List */}
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

          {/* Special UPPCS Pre Current Affairs Spotlight */}
          {exam.id === 'uppcs-pre' && (
            <div className="mt-8 overflow-hidden rounded-2xl border-2 border-indigo-300/90 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-6 text-white shadow-md">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-400/20 border border-violet-300/40 px-3 py-0.5 text-xs font-bold text-violet-200">
                      <Sparkles size={13} /> UPPCS Pre Special
                    </span>
                    <span className="rounded-full bg-emerald-400/20 border border-emerald-300/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-200">
                      30-35 प्रश्न वेटेज (GS Paper-1)
                    </span>
                  </div>
                  <h3 className="font-display mt-2.5 text-2xl font-black text-white">
                    समसामयिकी एवं करेंट अफेयर्स केंद्र (Current Affairs Hub)
                  </h3>
                  <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                    दैनिक (Daily), साप्ताहिक (Weekly), मासिक (Monthly) एवं वार्षिकी (Yearly) नोट्स — उत्तर प्रदेश बजट, रामसर स्थल, जीआई टैग और वास्तविक UPPCS प्रीलिम्स MCQ क्विज़।
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <Link
                    href="/exams/uppcs-pre/current-affairs"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-black text-indigo-950 shadow-sm hover:bg-indigo-50 transition"
                  >
                    करेंट अफेयर्स केंद्र खोलें <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="/quiz/uppcs-pre/uppcs-pre-current-affairs"
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-500/90 border border-violet-300/40 px-4 py-2.5 text-xs sm:text-sm font-black text-white hover:bg-violet-600 transition"
                  >
                    <Zap size={14} /> सभी क्विज़ हल करें
                  </Link>
                </div>
              </div>

              {/* 4 quick format pills */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/15 text-center">
                <Link
                  href="/exams/uppcs-pre/current-affairs"
                  className="rounded-xl bg-white/10 hover:bg-white/20 p-2.5 transition backdrop-blur-xs text-left"
                >
                  <p className="text-[10px] font-bold text-indigo-200 uppercase">1. दैनिक</p>
                  <p className="text-xs sm:text-sm font-extrabold text-white">Daily CA & Quiz</p>
                </Link>
                <Link
                  href="/exams/uppcs-pre/current-affairs"
                  className="rounded-xl bg-white/10 hover:bg-white/20 p-2.5 transition backdrop-blur-xs text-left"
                >
                  <p className="text-[10px] font-bold text-indigo-200 uppercase">2. साप्ताहिक</p>
                  <p className="text-xs sm:text-sm font-extrabold text-white">Weekly Roundup</p>
                </Link>
                <Link
                  href="/exams/uppcs-pre/current-affairs"
                  className="rounded-xl bg-white/10 hover:bg-white/20 p-2.5 transition backdrop-blur-xs text-left"
                >
                  <p className="text-[10px] font-bold text-indigo-200 uppercase">3. मासिक</p>
                  <p className="text-xs sm:text-sm font-extrabold text-white">Monthly Dossier</p>
                </Link>
                <Link
                  href="/exams/uppcs-pre/current-affairs"
                  className="rounded-xl bg-white/10 hover:bg-white/20 p-2.5 transition backdrop-blur-xs text-left"
                >
                  <p className="text-[10px] font-bold text-indigo-200 uppercase">4. वार्षिकी</p>
                  <p className="text-xs sm:text-sm font-extrabold text-white">Yearly & UP Special</p>
                </Link>
              </div>
            </div>
          )}

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
                    className="flex h-full flex-col p-5 sm:p-6 transition hover:border-blue-300 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          Subject
                        </p>
                        <h3 className="mt-1 text-xl font-bold text-slate-900">
                          {subject.name}
                        </h3>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <BookOpen size={18} />
                      </span>
                    </div>

                    <p className="mt-3 flex-1 text-xs sm:text-sm leading-relaxed text-slate-600">
                      {subject.description}
                    </p>

                    {/* Topic count, completed count & quiz accuracy */}
                    <div className="mt-5 grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3">
                      <div>
                        <span className="text-[11px] text-slate-500">अध्याय प्रगति:</span>
                        <p className="font-bold text-slate-900">
                          {completedTopicCount} / {totalTopicCount} Topics Done
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500">Quiz Accuracy:</span>
                        <p className="font-bold text-slate-900">
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
                        className="focus-ring rounded-xl border border-blue-200 bg-blue-50/60 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
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
            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/30 p-10 text-center">
              <CheckCircle2 className="mx-auto text-blue-700" size={28} />
              <p className="mt-3 font-bold text-slate-900">कोई विषय नहीं मिला</p>
              <p className="mt-1 text-sm text-slate-600">
                सर्च शब्द बदलकर पुनः प्रयास करें।
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* 5. Overall Progress Section */}
      <section className="paper-grid border-y border-slate-200 bg-slate-50/40 py-12 sm:py-16">
        <Container>
          <div className="rounded-2xl border border-blue-200/90 bg-white p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">सम्पूर्ण परीक्षा प्रगति (Overall Progress)</span>
                <h2 className="font-display mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                  {exam.name} में आपकी तैयारी का स्तर
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  यह प्रगति आपके नोट्स अध्ययन, PYQ अभ्यास और दैनिक क्विज़ के प्रदर्शन को मिलाकर परिकलित की जाती है।
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-blue-700">
                    {examProgressData.overallPercentage}%
                  </p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    तैयारी पूर्णता
                  </p>
                </div>
                <div className="h-12 w-px bg-slate-200" />
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-amber-600">
                    {intelligentScore.score}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    इंटेलिजेंट स्कोर
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>पाठ्यक्रम कवरेज ({examProgressData.completedTopics} of {examProgressData.totalTopics} टॉपिक्स पूर्ण)</span>
                <span className="font-bold text-blue-700">{examProgressData.overallPercentage}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-100/70">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${examProgressData.overallPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 6. Quick Practice Section */}
      <section className="py-10 border-b border-slate-200 bg-white">
        <Container>
          <QuickPractice
            examId={exam.id}
            examName={exam.name}
          />
        </Container>
      </section>

      {/* 7. Recently Studied Topics */}
      <section className="py-10 border-b border-blue-100 bg-blue-50/30">
        <Container>
          <RecentlyStudied
            items={recentActivities}
            title={`${exam.name} - हाल ही में पढ़ा गया (Recently Studied)`}
          />
        </Container>
      </section>

      {/* 8. Topic Discovery Explorer */}
      <section
        id="topic-discovery-section"
        className="py-12 sm:py-16 bg-white"
      >
        <Container>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Topic Discovery Explorer</p>
              <h2 className="font-display mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                {exam.name} के सभी टॉपिक एक्सप्लोर करें
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">
                नोट्स, PYQ और क्विज़ उपलब्धता के आधार पर फ़िल्टर करें और सीधा अध्ययन करें।
              </p>
            </div>

            {/* Subject Selector & Availability Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="focus-ring rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800"
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
                    className={`focus-ring rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      topicFilter === filter
                        ? 'bg-blue-700 text-white shadow-2xs'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
                  className="flex flex-col justify-between p-5 transition hover:border-blue-300 hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        {subject?.name || 'Subject'}
                      </span>
                      <EstimatedTime minutes={topic.estimatedMinutes} />
                    </div>

                    <h3 className="mt-2 text-base font-bold text-slate-900">
                      {topic.name}
                    </h3>

                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {topic.description}
                    </p>

                    {/* Content Availability Badges */}
                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          topic.availability.studyMaterial
                            ? 'border border-blue-200 bg-blue-50 text-blue-700'
                            : 'border border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                        }`}
                      >
                        <FileText size={10} />
                        Study Notes
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          topic.availability.pyq
                            ? 'border border-indigo-200 bg-indigo-50 text-indigo-700'
                            : 'border border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                        }`}
                      >
                        <FileQuestion size={10} />
                        PYQ
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          topic.availability.quiz
                            ? 'border border-sky-200 bg-sky-50 text-sky-700'
                            : 'border border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                        }`}
                      >
                        <Brain size={10} />
                        Quiz
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <Button
                      href={`/exams/${exam.id}/${topic.subjectId}/${topic.id}`}
                      variant="secondary"
                      className="w-full text-xs h-9 justify-center gap-1.5 font-bold"
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
