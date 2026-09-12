import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  FileQuestion,
  FileText,
  History,
  Layers3,
  Library,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { exams } from '@/data/exams';
import { Button, Card, Container, ExamCard, Layout, SectionTitle } from '@/components/site';
import { ProgressBar } from '@/components/curriculum-ui';
import { QuickActions } from '@/components/quick-actions';
import { EmptyState } from '@/components/empty-state';
import {
  getContinueLearning,
  getRecentActivities,
} from '@/lib/user-progress';
import {
  getDeterministicRecommendations,
  getPopularSubjects,
  RecommendationItem,
  PopularSubjectItem,
} from '@/lib/search';

export default function Home() {
  useEffect(() => {
    document.title = 'ExamSetu4U - Free Exam Preparation Platform';
    const description =
      'Free exam preparation platform for Indian students with study material, previous year questions, MCQs and mock tests.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, []);

  const continueItem = useMemo(() => getContinueLearning(), []);
  const recommendations = useMemo(() => getDeterministicRecommendations('super-tet', 4), []);
  const popularSubjects = useMemo(() => getPopularSubjects(), []);
  const recentActivities = useMemo(() => getRecentActivities(), []);

  const getRecBadgeClass = (tone: string) => {
    switch (tone) {
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'info':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'success':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'primary':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <Layout>
      {/* 1. Hero Section */}
      <section className="hero-wash overflow-hidden text-white">
        <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-24">
          <div className="rise-in">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur-xs">
              <Sparkles size={13} className="text-blue-300" /> Free Exam Prep for Indian Aspirants
            </span>
            <h1 className="font-display mt-4 max-w-2xl text-4xl leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl font-extrabold text-white">
              Prepare with <span className="text-blue-300">purpose.</span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-blue-100/80 sm:text-base sm:leading-7">
              Free study material, previous year questions and exam-wise guidance for Indian students.
              Search by subject, topic or concept with real-time tracking.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                href="/exams"
                className="bg-white text-blue-900 hover:bg-blue-50 border-white font-bold shadow-md"
                data-testid="button-hero-browse-exams"
              >
                Browse exams <ArrowRight size={16} />
              </Button>
              <Button
                href="/search"
                variant="secondary"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-xs"
                data-testid="button-hero-search"
              >
                Smart Search
              </Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[390px] lg:justify-self-end">
            <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full border border-blue-400/20" />
            <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-blue-500/10" />
            <Card className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 text-white shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/15 pb-5">
                <div>
                  <p className="text-xs font-semibold text-blue-200">Your preparation desk</p>
                  <p className="mt-1 font-display text-2xl font-bold">One step at a time.</p>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/30 text-blue-200">
                  <Target size={22} />
                </span>
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-blue-400/20 bg-blue-900/40 p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>1. Understand the concept</span>
                    <span className="font-bold text-blue-300">01</span>
                  </div>
                  <div className="mt-2.5 h-1.5 rounded-full bg-blue-950/60 overflow-hidden">
                    <div className="h-full w-[68%] rounded-full bg-blue-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 p-3.5 text-xs text-blue-100 font-medium">
                  <span className="font-bold text-blue-300">02</span> Practice what you learn
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 p-3.5 text-xs text-blue-100 font-medium">
                  <span className="font-bold text-blue-300">03</span> Return stronger tomorrow
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* 2. Continue Learning Banner (if user has active session/topic) */}
      {continueItem && (
        <section className="border-b border-blue-100 bg-blue-50/40 py-6" id="home-continue-learning-section">
          <Container>
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-blue-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center">
              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-2xs">
                  <Play size={17} className="fill-current" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      अध्ययन जारी रखें (Continue Learning)
                    </span>
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      {continueItem.examName}
                    </span>
                  </div>
                  <h2 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">
                    {continueItem.topicName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    विषय: <span className="font-medium text-slate-700">{continueItem.subjectName}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:w-64">
                <ProgressBar value={Math.round(continueItem.progress)} label="विषय प्रगति" />
                <Button href={continueItem.url} variant="primary" className="text-xs h-9">
                  अध्ययन जारी रखें <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* 3. Popular Exams */}
      <section
        id="home-popular-exams-section"
        className="border-y-2 border-indigo-200/90 bg-gradient-to-b from-[#e3e0ff] via-[#eeeaff] to-[#ded8ff] py-14 sm:py-18 dark:border-indigo-900/80 dark:from-[#0d0a29] dark:via-[#161242] dark:to-[#0d0a29]"
      >
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="Choose your path"
              title="Popular exams"
              description="A simple place to begin. Pick an exam and see what to study next."
            />
            <Link
              href="/exams"
              className="focus-ring inline-flex w-fit items-center gap-1.5 rounded-lg border border-indigo-300/90 bg-white px-3 py-1.5 text-xs sm:text-sm font-extrabold text-indigo-950 shadow-2xs hover:bg-indigo-50 hover:text-indigo-900 dark:border-indigo-700 dark:bg-slate-900 dark:text-indigo-200 transition"
              data-testid="link-home-all-exams"
            >
              View all exams <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {exams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Practice Now (Quick Actions) */}
      <section className="border-y border-blue-100/70 bg-blue-50/30 py-12 sm:py-16">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="Practice Now"
              title="Quick Learning Actions"
              description="Jump directly into study notes, past year question drills, or timed MCQ quizzes."
            />
            <Link
              href="/search"
              className="focus-ring inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
            >
              Smart Search & Discovery <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-8">
            <QuickActions />
          </div>
        </Container>
      </section>

      {/* 5. Recommended Topics (Deterministic from local progress/performance) */}
      <section className="paper-grid border-b border-[hsl(var(--border))] py-12 sm:py-16" id="home-recommended-topics-section">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="Personalized Path"
              title="Recommended Topics"
              description="Prioritized based on your recent quiz accuracy, in-progress reading, and foundational topics."
            />
            <Link
              href="/dashboard"
              className="focus-ring inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
            >
              View in Dashboard <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((rec) => (
              <Card
                key={rec.id}
                className="flex flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold ${getRecBadgeClass(
                        rec.badgeTone
                      )}`}
                    >
                      {rec.reasonLabel}
                    </span>
                  </div>

                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-blue-600">
                    {rec.examName} · {rec.subjectName}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-slate-900">
                    {rec.topicName}
                  </h3>

                  {rec.progressPercent > 0 && (
                    <div className="mt-4">
                      <ProgressBar value={rec.progressPercent} label="प्रगति" />
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-3 border-t border-[hsl(var(--border))]">
                  <Button href={rec.actionUrl} variant="secondary" className="w-full text-xs h-9 font-bold">
                    {rec.actionLabel} <ArrowRight size={13} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. Popular Subjects Across Exams */}
      <section className="bg-slate-50/70 border-b border-[hsl(var(--border))] py-14 sm:py-18" id="home-popular-subjects-section">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="High-Demand Curriculum"
              title="Popular Subjects"
              description="Frequently practiced subjects with detailed chapter notes and question banks."
            />
            <Link
              href="/study-material"
              className="focus-ring inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
            >
              Browse All Material <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularSubjects.map((sub) => (
              <Card
                key={sub.id}
                className="flex flex-col justify-between p-5 transition hover:border-blue-300 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600">
                      {sub.examName}
                    </span>
                    <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                      {sub.topicCount} Topics
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">
                    {sub.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
                    {sub.description}
                  </p>
                </div>

                <div className="mt-5">
                  <Button href={sub.url} variant="secondary" className="w-full text-xs font-bold">
                    Explore Subject <ArrowRight size={13} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 7. Recent Activity Section */}
      <section className="py-12 sm:py-16" id="home-recent-activity-section">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="Your Learning Record"
              title="Recent Activity"
              description="Keep momentum by reviewing your latest test attempts and completed study topics."
            />
            <Link
              href="/analytics"
              className="focus-ring inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
            >
              Full Analytics <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-8">
            {recentActivities.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {recentActivities.slice(0, 4).map((act) => (
                  <Card key={act.id} className="p-4 hover:border-blue-300 transition">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {act.scoreText || 'Activity'}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock size={11} /> {new Date(act.timestamp).toLocaleDateString('hi-IN')}
                      </span>
                    </div>
                    <h3 className="mt-2 text-xs font-bold text-slate-900 line-clamp-2">
                      {act.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                      {act.subtitle}
                    </p>
                    <Link
                      href={act.url}
                      className="focus-ring mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline"
                    >
                      पुनः देखें (Review) <ArrowRight size={11} />
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                type="activity"
                title="अभी तक कोई गतिविधि दर्ज नहीं है"
                description="जब आप कोई टेस्ट देंगे या नोट्स पढ़ेंगे, आपकी दैनिक प्रगति और हालिया रिकॉर्ड यहाँ प्रदर्शित होंगे।"
                actionText="पहला क्विज़ प्रारंभ करें"
                actionHref="/quiz"
                secondaryActionText="स्टडी मटेरियल पढ़ें"
                secondaryActionHref="/study-material"
              />
            )}
          </div>
        </Container>
      </section>

      {/* 8. Active Revision Theory Prompt */}
      <section className="paper-grid border-t border-[hsl(var(--border))] py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div>
            <SectionTitle
              eyebrow="A little more depth"
              title="Theory questions for stronger recall."
              description="Reading is the first pass. Explaining an idea in your own words is where it stays."
            />
            <Button href="/theory" variant="secondary" className="mt-7 font-bold" data-testid="button-home-theory">
              Explore theory questions <ArrowRight size={16} />
            </Button>
          </div>
          <Card className="grid gap-0 overflow-hidden sm:grid-cols-2 rounded-2xl border border-blue-200/90 shadow-sm">
            <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 p-7 text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
                <Library size={20} />
              </span>
              <p className="mt-6 text-xs uppercase tracking-[.15em] text-blue-300 font-bold">
                Try this prompt
              </p>
              <h3 className="font-display mt-2.5 text-2xl font-bold leading-snug">
                Explain one idea without looking at your notes.
              </h3>
            </div>
            <div className="p-7 bg-white">
              <p className="text-sm font-bold text-slate-900">Good revision feels active.</p>
              <ul className="mt-4 space-y-3.5 text-xs sm:text-sm leading-relaxed text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  Write a short answer in your own words.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  Compare it with the key points.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  Return to it after a few days.
                </li>
              </ul>
            </div>
          </Card>
        </Container>
      </section>

      {/* 9. Why ExamSetu4U (Secondary Section) */}
      <section className="border-y border-blue-100 bg-blue-50/50 py-16 sm:py-20">
        <Container className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <SectionTitle eyebrow="Why ExamSetu4U" title="Less noise. More direction." />
          </div>
          <div className="grid gap-6 sm:grid-cols-3 md:col-span-2">
            <div className="rounded-xl border border-blue-100/90 bg-white p-5 shadow-2xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <ShieldCheck size={20} />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">Free to start</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                A focused foundation without a paywall at the door.
              </p>
            </div>
            <div className="rounded-xl border border-blue-100/90 bg-white p-5 shadow-2xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Target size={20} />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">Exam-wise</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Find relevant material without sorting through everything.
              </p>
            </div>
            <div className="rounded-xl border border-blue-100/90 bg-white p-5 shadow-2xs">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <BookOpen size={20} />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">Made for practice</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Learn, revisit and test your understanding regularly.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 10. Call to Action (Special Highlight Blue Treatment) */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-6 py-12 text-center text-white shadow-xl border border-blue-700/60 sm:px-12 sm:py-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-950/40 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-200">
              <Sparkles size={13} /> Your next session starts here
            </span>
            <h2 className="font-display mx-auto mt-4 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl text-white">
              Make today’s study time count.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-xs sm:text-sm leading-relaxed text-blue-100/80">
              Choose an exam, open a topic and take the first useful step with free study resources.
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                href="/exams"
                className="bg-white text-blue-900 hover:bg-blue-50 border-white font-extrabold shadow-md px-6 py-3 text-sm"
                data-testid="button-home-cta"
              >
                Start with an exam <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
