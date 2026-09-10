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
        return 'bg-[#f7e3bb] text-[#825413] border-[#ecd3a3]';
      case 'info':
        return 'bg-[#dce4f2] text-[#34547f] border-[#c7d5ea]';
      case 'success':
        return 'bg-[#d6ebe5] text-[#246556] border-[#bad8cf]';
      case 'primary':
      default:
        return 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] border-[hsl(var(--border))]';
    }
  };

  return (
    <Layout>
      {/* 1. Hero Section */}
      <section className="hero-wash overflow-hidden text-[hsl(var(--primary-foreground))]">
        <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-24">
          <div className="rise-in">
            <p className="eyebrow text-[hsl(var(--accent))]">A clear start for your preparation</p>
            <h1 className="font-display mt-4 max-w-2xl text-5xl leading-[.98] tracking-[-.055em] sm:text-6xl lg:text-7xl">
              Prepare with <span className="text-[hsl(var(--accent))]">purpose.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[hsl(var(--primary-foreground)/.75)] sm:text-lg">
              Free study material, previous year questions and exam-wise guidance for Indian students.
              Search by subject, topic or concept.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/exams" data-testid="button-hero-browse-exams">
                Browse exams <ArrowRight size={16} />
              </Button>
              <Button
                href="/search"
                variant="secondary"
                className="border-[hsl(var(--primary-foreground)/.25)] bg-transparent text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-foreground)/.1)]"
                data-testid="button-hero-search"
              >
                Smart Search
              </Button>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[390px] lg:justify-self-end">
            <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full border border-[hsl(var(--accent)/.35)]" />
            <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-[hsl(var(--accent)/.1)]" />
            <Card className="relative overflow-hidden border-[hsl(var(--primary-foreground)/.16)] bg-[hsl(var(--primary-foreground)/.08)] p-6 text-[hsl(var(--primary-foreground))] shadow-none">
              <div className="flex items-center justify-between border-b border-[hsl(var(--primary-foreground)/.14)] pb-5">
                <div>
                  <p className="text-xs text-[hsl(var(--primary-foreground)/.55)]">Your preparation desk</p>
                  <p className="mt-1 font-display text-2xl">One step at a time.</p>
                </div>
                <Target size={26} className="text-[hsl(var(--accent))]" />
              </div>
              <div className="mt-6 space-y-3">
                <div className="rounded-lg bg-[hsl(var(--primary-foreground)/.09)] p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span>Understand the concept</span>
                    <span className="text-[hsl(var(--accent))]">01</span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-[hsl(var(--primary-foreground)/.13)]">
                    <div className="h-full w-[68%] rounded-full bg-[hsl(var(--accent))]" />
                  </div>
                </div>
                <div className="rounded-lg border border-[hsl(var(--primary-foreground)/.14)] p-4 text-sm text-[hsl(var(--primary-foreground)/.7)]">
                  <span className="mr-2 text-[hsl(var(--accent))]">02</span> Practice what you learn
                </div>
                <div className="rounded-lg border border-[hsl(var(--primary-foreground)/.14)] p-4 text-sm text-[hsl(var(--primary-foreground)/.7)]">
                  <span className="mr-2 text-[hsl(var(--accent))]">03</span> Return stronger tomorrow
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* 2. Continue Learning Banner (if user has active session/topic) */}
      {continueItem && (
        <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] py-6" id="home-continue-learning-section">
          <Container>
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[hsl(var(--accent)/.3)] bg-[hsl(var(--card))] p-5 shadow-xs sm:flex-row sm:items-center">
              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--accent))]">
                  <Play size={18} className="fill-current" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                      अध्ययन जारी रखें (Continue Learning)
                    </span>
                    <span className="rounded bg-[hsl(var(--secondary))] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">
                      {continueItem.examName}
                    </span>
                  </div>
                  <h2 className="mt-1 text-base font-bold text-[hsl(var(--primary))] sm:text-lg">
                    {continueItem.topicName}
                  </h2>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    विषय: {continueItem.subjectName}
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

      {/* 3. Practice Now (Quick Actions) */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="Practice Now"
              title="Quick Learning Actions"
              description="Jump directly into study notes, past year question drills, or timed MCQ quizzes."
            />
            <Link
              href="/search"
              className="focus-ring inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))] hover:underline"
            >
              Smart Search & Discovery <ArrowRight size={14} />
            </Link>
          </div>
          <div className="mt-8">
            <QuickActions />
          </div>
        </Container>
      </section>

      {/* 4. Recommended Topics (Deterministic from local progress/performance) */}
      <section className="paper-grid border-y border-[hsl(var(--border))] py-12 sm:py-16" id="home-recommended-topics-section">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="Personalized Path"
              title="Recommended Topics"
              description="Prioritized based on your recent quiz accuracy, in-progress reading, and foundational topics."
            />
            <Link
              href="/dashboard"
              className="focus-ring inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))] hover:underline"
            >
              View in Dashboard <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((rec) => (
              <Card
                key={rec.id}
                className="flex flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:shadow-xs"
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

                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                    {rec.examName} · {rec.subjectName}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-[hsl(var(--primary))]">
                    {rec.topicName}
                  </h3>

                  {rec.progressPercent > 0 && (
                    <div className="mt-4">
                      <ProgressBar value={rec.progressPercent} label="प्रगति" />
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-3 border-t border-[hsl(var(--border))]">
                  <Button href={rec.actionUrl} variant="secondary" className="w-full text-xs h-9">
                    {rec.actionLabel} <ArrowRight size={13} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 5. Popular Exams */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="Choose your path"
              title="Popular exams"
              description="A simple place to begin. Pick an exam and see what to study next."
            />
            <Link
              href="/exams"
              className="focus-ring flex w-fit items-center gap-2 rounded px-1 py-2 text-sm font-bold text-[hsl(var(--primary))]"
              data-testid="link-home-all-exams"
            >
              View all exams <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {exams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        </Container>
      </section>

      {/* 6. Popular Subjects Across Exams */}
      <section className="bg-[hsl(var(--secondary)/.4)] border-y border-[hsl(var(--border))] py-14 sm:py-18" id="home-popular-subjects-section">
        <Container>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <SectionTitle
              eyebrow="High-Demand Curriculum"
              title="Popular Subjects"
              description="Frequently practiced subjects with detailed chapter notes and question banks."
            />
            <Link
              href="/study-material"
              className="focus-ring inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))] hover:underline"
            >
              Browse All Material <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popularSubjects.map((sub) => (
              <Card
                key={sub.id}
                className="flex flex-col justify-between p-5 transition hover:border-[hsl(var(--accent))] hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[hsl(var(--accent-foreground))]">
                      {sub.examName}
                    </span>
                    <span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--primary))]">
                      {sub.topicCount} Topics
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-[hsl(var(--primary))]">
                    {sub.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))] line-clamp-2">
                    {sub.description}
                  </p>
                </div>

                <div className="mt-5">
                  <Button href={sub.url} variant="secondary" className="w-full text-xs">
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
              className="focus-ring inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))] hover:underline"
            >
              Full Analytics <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-8">
            {recentActivities.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {recentActivities.slice(0, 4).map((act) => (
                  <Card key={act.id} className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--primary))]">
                        {act.scoreText || 'Activity'}
                      </span>
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                        <Clock size={11} /> {new Date(act.timestamp).toLocaleDateString('hi-IN')}
                      </span>
                    </div>
                    <h3 className="mt-2 text-xs font-bold text-[hsl(var(--primary))] line-clamp-2">
                      {act.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))] line-clamp-1">
                      {act.subtitle}
                    </p>
                    <Link
                      href={act.url}
                      className="focus-ring mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--accent-foreground))] hover:underline"
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
            <Button href="/theory" variant="secondary" className="mt-7" data-testid="button-home-theory">
              Explore theory questions <ArrowRight size={16} />
            </Button>
          </div>
          <Card className="grid gap-0 overflow-hidden sm:grid-cols-2">
            <div className="bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))]">
              <Library size={22} className="text-[hsl(var(--accent))]" />
              <p className="mt-8 text-xs uppercase tracking-[.15em] text-[hsl(var(--primary-foreground)/.55)]">
                Try this prompt
              </p>
              <h3 className="font-display mt-3 text-2xl leading-tight">
                Explain one idea without looking at your notes.
              </h3>
            </div>
            <div className="p-7">
              <p className="text-sm font-bold text-[hsl(var(--primary))]">Good revision feels active.</p>
              <ul className="mt-5 space-y-4 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--accent))]" />
                  Write a short answer in your own words.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--accent))]" />
                  Compare it with the key points.
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--accent))]" />
                  Return to it after a few days.
                </li>
              </ul>
            </div>
          </Card>
        </Container>
      </section>

      {/* 9. Why ExamSetu4U */}
      <section className="bg-[#e9e2d2] py-16 sm:py-20">
        <Container className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <SectionTitle eyebrow="Why ExamSetu4U" title="Less noise. More direction." />
          </div>
          <div className="grid gap-7 sm:grid-cols-3 md:col-span-2">
            <div>
              <ShieldCheck size={20} className="text-[hsl(var(--primary))]" />
              <h3 className="mt-4 font-bold">Free to start</h3>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                A focused foundation without a paywall at the door.
              </p>
            </div>
            <div>
              <Target size={20} className="text-[hsl(var(--primary))]" />
              <h3 className="mt-4 font-bold">Exam-wise</h3>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                Find relevant material without sorting through everything.
              </p>
            </div>
            <div>
              <BookOpen size={20} className="text-[hsl(var(--primary))]" />
              <h3 className="mt-4 font-bold">Made for practice</h3>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                Learn, revisit and test your understanding regularly.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 10. Call to Action */}
      <section className="py-16 sm:py-20">
        <Container>
          <div className="rounded-xl bg-[hsl(var(--primary))] px-6 py-10 text-center text-[hsl(var(--primary-foreground))] sm:px-10">
            <p className="eyebrow">Your next session starts here</p>
            <h2 className="font-display mx-auto mt-3 max-w-xl text-3xl leading-tight sm:text-4xl">
              Make today’s study time count.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[hsl(var(--primary-foreground)/.7)]">
              Choose an exam, open a topic and take the first useful step.
            </p>
            <Button href="/exams" className="mt-7" data-testid="button-home-cta">
              Start with an exam <ArrowRight size={16} />
            </Button>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
