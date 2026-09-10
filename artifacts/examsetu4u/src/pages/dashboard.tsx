import { AlertCircle, AlertTriangle, ArrowRight, Award, BarChart3, BookOpen, Check, CheckCircle2, ChevronRight, Clock, ExternalLink, Flame, HelpCircle, Lightbulb, Play, RotateCcw, Sparkles, Target, TrendingUp, Trophy, User, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Breadcrumbs, ProgressBar } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { exams, getExam, getSubject, getSubjectsForExam, getTopic, getTopicsForSubject } from '@/data/curriculum';
import { useAuth } from '@/lib/auth';
import { getMistakeSummary } from '@/lib/mistakes';
import {
  DAILY_GOAL_OPTIONS,
  calculatePreparationLevel,
  generateMotivationalInsights,
  getAllAchievements,
  getDailyGoalStatus,
  setDailyQuestionGoal,
} from '@/lib/analytics';
import {
  calculateExamProgress,
  calculateIntelligentScore,
  calculateOverallProgress,
  calculateSubjectProgress,
  getContinueLearning,
  getRecentActivities,
  getWeakAreas,
  seedDemoProgress,
} from '@/lib/user-progress';

export function DashboardPage() {
  const { isAuthenticated, user, profile, updateProfile } = useAuth();
  const preferredExamId = profile?.preferredExamId || 'super-tet';
  const [selectedExamId, setSelectedExamId] = useState<string>(preferredExamId);
  const [goalRefreshKey, setGoalRefreshKey] = useState<number>(0);

  const overall = useMemo(() => calculateOverallProgress(), [goalRefreshKey]);
  const intelligentScore = useMemo(() => calculateIntelligentScore(selectedExamId), [selectedExamId, goalRefreshKey]);
  const examProgress = useMemo(() => calculateExamProgress(selectedExamId), [selectedExamId, goalRefreshKey]);
  const activeExamSubjects = useMemo(() => getSubjectsForExam(selectedExamId), [selectedExamId]);
  const subjectProgressList = useMemo(
    () => activeExamSubjects.map((s) => calculateSubjectProgress(s.id)),
    [activeExamSubjects, goalRefreshKey]
  );
  const continueItem = useMemo(() => getContinueLearning(), []);
  const weakAreas = useMemo(() => getWeakAreas(), [goalRefreshKey]);
  const recentActivities = useMemo(() => getRecentActivities(), [goalRefreshKey]);

  // Module 7 states
  const prepLevel = useMemo(() => calculatePreparationLevel(), [goalRefreshKey]);
  const dailyGoal = useMemo(() => getDailyGoalStatus(), [goalRefreshKey]);
  const achievements = useMemo(() => getAllAchievements(), [goalRefreshKey]);
  const unlockedBadges = useMemo(() => achievements.filter((a) => a.isUnlocked), [achievements]);
  const insights = useMemo(() => generateMotivationalInsights(selectedExamId), [selectedExamId, goalRefreshKey]);
  const mistakeSummary = useMemo(() => getMistakeSummary(), [goalRefreshKey]);

  const currentExam = getExam(selectedExamId);
  const displayName = profile?.name || user?.name || 'अध्येता (Learner)';

  const handleExamChange = (newExamId: string) => {
    setSelectedExamId(newExamId);
    if (profile) {
      updateProfile({ preferredExamId: newExamId });
    }
  };

  const handleGoalChange = (newGoal: number) => {
    setDailyQuestionGoal(newGoal);
    setGoalRefreshKey((k) => k + 1);
  };

  // Recommended next step logic
  const recommendedStep = useMemo(() => {
    if (weakAreas.length > 0) {
      return {
        title: `कमजोर विषय का अभ्यास: ${weakAreas[0].topicName}`,
        description: `इस विषय में आपकी सटीकता ${weakAreas[0].accuracy}% है। संकल्पनाओं को मजबूत करने के लिए अतिरिक्त अभ्यास करें।`,
        actionLabel: 'अभ्यास प्रारंभ करें',
        url: weakAreas[0].practiceUrl,
        type: 'revision',
      };
    }
    if (continueItem) {
      return {
        title: `अध्ययन जारी रखें: ${continueItem.topicName}`,
        description: `${continueItem.subjectName} में आपकी प्रगति सहेजी हुई है। अगला भाग पूरा करें।`,
        actionLabel: 'अध्ययन जारी रखें',
        url: continueItem.url,
        type: 'continue',
      };
    }
    return {
      title: 'Super TET शिक्षण कौशल 10 MCQ क्विज़ लें',
      description: 'शिक्षण की विधियों और सिद्धांतों पर अपनी समझ का परीक्षण करें और Intelligent Score बढ़ाएँ।',
      actionLabel: 'क्विज़ शुरू करें',
      url: '/quiz',
      type: 'quiz',
    };
  }, [weakAreas, continueItem]);

  return (
    <Layout>
      {/* 1. Header / Welcome Section */}
      <section className="paper-grid border-b border-[hsl(var(--border))] py-8 sm:py-12">
        <Container>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Learner Dashboard' }]} />

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <p className="eyebrow">ExamSetu4U Learner Dashboard</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--accent)/.2)] px-2.5 py-0.5 text-xs font-bold text-[hsl(var(--accent-foreground))]">
                  <Flame size={14} className="text-amber-600" /> {overall.learningStreakDays} Day Streak
                </span>
              </div>
              <h1 className="font-display mt-2 text-2xl font-bold tracking-tight text-[hsl(var(--primary))] sm:text-4xl">
                नमस्ते, {displayName} 👋
              </h1>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                आपकी परीक्षा तैयारी का समग्र विश्लेषण, अध्ययन प्रगति और इंटेलिजेंट स्कोर।
              </p>
            </div>

            {/* Target Exam Switcher & Navigation CTAs */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  सक्रिय परीक्षा:
                </span>
                <select
                  value={selectedExamId}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[hsl(var(--primary))] outline-none cursor-pointer"
                  data-testid="select-dashboard-exam"
                >
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button href="/analytics" variant="secondary" className="min-h-10 text-xs" data-testid="button-go-analytics">
                <BarChart3 size={14} /> विश्लेषण
              </Button>

              <Button href="/achievements" variant="secondary" className="min-h-10 text-xs" data-testid="button-go-achievements">
                <Trophy size={14} /> उपलब्धियां ({unlockedBadges.length})
              </Button>

              <Button href="/profile" variant="secondary" className="min-h-10 text-xs" data-testid="button-go-profile">
                <User size={14} /> प्रोफ़ाइल
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-8 sm:py-12">
        <Container>
          {/* Preparation Level Banner */}
          <div
            className="mb-8 flex flex-col gap-4 rounded-xl border-l-4 border-l-[hsl(var(--primary))] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            id="dashboard-prep-level-banner"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-0.5 text-xs font-bold text-[hsl(var(--primary))]">
                  {prepLevel.badge}
                </span>
                <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                  तैयारी स्तर (Preparation Level {prepLevel.levelNumber} of 6)
                </span>
              </div>
              <h2 className="text-xl font-bold text-[hsl(var(--primary))]">{prepLevel.levelName}</h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))] max-w-xl">{prepLevel.requirementsText}</p>
            </div>

            <div className="min-w-[240px] rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[hsl(var(--muted-foreground))]">अगले स्तर की प्रगति:</span>
                <span className="font-bold text-[hsl(var(--primary))]">{prepLevel.progressToNext}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                <div
                  className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
                  style={{ width: `${prepLevel.progressToNext}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Goal & Actionable Insight Dual Bar */}
          <div className="mb-8 grid gap-6 md:grid-cols-2" id="dashboard-daily-goals-row">
            {/* Daily Goal Card */}
            <Card className="flex flex-col justify-between p-5" id="dashboard-daily-goal-card">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                      <Target size={16} />
                    </span>
                    <h3 className="text-sm font-bold text-[hsl(var(--primary))]">आज का दैनिक लक्ष्य (Daily Goal)</h3>
                  </div>
                  {dailyGoal.isCompleted ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      लक्ष्य पूर्ण 🎉
                    </span>
                  ) : (
                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      {dailyGoal.remaining} प्रश्न शेष
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-[hsl(var(--primary))]">
                    {dailyGoal.todayQuestionsAttempted} <span className="text-base text-[hsl(var(--muted-foreground))]">/ {dailyGoal.targetQuestions} प्रश्न</span>
                  </p>
                  <span className="text-xs font-bold text-[hsl(var(--primary))]">{dailyGoal.percentage}%</span>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dailyGoal.isCompleted ? 'bg-emerald-600' : 'bg-[hsl(var(--primary))]'
                    }`}
                    style={{ width: `${dailyGoal.percentage}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))]">
                  <span>Today's Revised Questions:</span>
                  <strong className="font-bold text-[hsl(var(--primary))]">
                    {mistakeSummary.todayRevisionCount}
                  </strong>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-xs">
                <span className="text-[hsl(var(--muted-foreground))]">लक्ष्य बदलें:</span>
                <div className="flex items-center gap-1">
                  {DAILY_GOAL_OPTIONS.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleGoalChange(num)}
                      className={`rounded px-2 py-0.5 text-[11px] font-bold transition ${
                        dailyGoal.targetQuestions === num
                          ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                          : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Achievements & Quick Insights Card */}
            <Card className="flex flex-col justify-between p-5" id="dashboard-achievements-preview-card">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40">
                      <Trophy size={16} />
                    </span>
                    <h3 className="text-sm font-bold text-[hsl(var(--primary))]">उपलब्धियां (Achievements)</h3>
                  </div>
                  <Link href="/achievements" className="text-xs font-bold text-[hsl(var(--primary))] hover:underline flex items-center gap-0.5">
                    सभी देखें <ChevronRight size={13} />
                  </Link>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {achievements.slice(0, 5).map((badge) => (
                    <div
                      key={badge.id}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg shadow-2xs ${
                        badge.isUnlocked
                          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                          : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))] opacity-40 grayscale'
                      }`}
                      title={`${badge.title} (${badge.isUnlocked ? 'अनलॉक' : 'लॉक'})`}
                    >
                      {badge.icon}
                    </div>
                  ))}
                  <div className="ml-2">
                    <p className="text-xs font-bold text-[hsl(var(--primary))]">
                      {unlockedBadges.length} / {achievements.length} पदक अनलॉक
                    </p>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      अध्ययन व क्विज़ से नए पदक अर्जित करें
                    </p>
                  </div>
                </div>

                {insights.length > 0 && (
                  <div className="mt-3 rounded-lg bg-[hsl(var(--secondary)/.4)] p-2.5 text-xs text-[hsl(var(--primary))] flex items-start gap-2">
                    <Lightbulb size={15} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="line-clamp-2 leading-relaxed text-[hsl(var(--muted-foreground))]">
                      <span className="font-bold text-[hsl(var(--primary))]">{insights[0].title}: </span>
                      {insights[0].message}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-xs">
                <Link href="/analytics" className="font-bold text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                  विस्तृत प्रदर्शन विश्लेषण खोलें <ArrowRight size={12} />
                </Link>
                <Link href="/achievements" className="font-bold text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                  पदक गैलरी <ArrowRight size={12} />
                </Link>
              </div>
            </Card>
          </div>

          {/* Continue Learning Banner (if available) */}
          {continueItem && (
            <div
              className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--accent)/.08)] p-4 sm:p-5 shadow-sm"
              data-testid="banner-continue-learning"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--accent))]">
                  <Play size={18} fill="currentColor" />
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                    जहाँ छोड़ा था वहीं से जारी रखें (Continue Learning)
                  </span>
                  <p className="text-sm font-bold text-[hsl(var(--primary))] mt-0.5">
                    {continueItem.topicName}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {continueItem.examName} • {continueItem.subjectName} • {continueItem.progress}% सहेजी गई प्रगति
                  </p>
                </div>
              </div>

              <Button href={continueItem.url} variant="primary" className="min-h-10 px-4 text-xs font-bold shrink-0 w-full sm:w-auto" data-testid="button-resume-continue">
                अभी पढ़ें / हल करें <ArrowRight size={14} />
              </Button>
            </div>
          )}

          {/* 2. Intelligent Score Hero Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Intelligent Score Card */}
            <Card
              className="lg:col-span-2 overflow-hidden border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--secondary)/.4)] p-6 sm:p-8"
              data-testid="card-intelligent-score"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600">
                      <Sparkles size={16} />
                    </span>
                    <h2 className="text-lg font-bold text-[hsl(var(--primary))]">
                      Intelligent Learning Score
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    अध्ययन सामग्री पूर्णता, PYQ सटीकता, क्विज़ स्कोर और निरंतरता का संतुलित सूचकांक
                  </p>
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      intelligentScore.isBuilding
                        ? 'bg-amber-100 text-amber-800'
                        : intelligentScore.score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : intelligentScore.score >= 60
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-zinc-100 text-zinc-800'
                    }`}
                  >
                    {intelligentScore.tierLabel}
                  </span>
                </div>
              </div>

              {/* Score Display & Feedback */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-8">
                {/* Score Dial / Number */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-[hsl(var(--accent))] bg-[hsl(var(--card))] shadow-inner">
                    <div className="text-center">
                      <span className="font-display text-4xl font-bold tracking-tight text-[hsl(var(--primary))]">
                        {intelligentScore.isBuilding ? '...' : intelligentScore.score}
                      </span>
                      <span className="block text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
                        / 100 अंक
                      </span>
                    </div>
                  </div>
                  <span className="mt-2.5 text-xs font-bold text-[hsl(var(--primary))]">
                    {currentExam?.name} तैयारी सूचकांक
                  </span>
                </div>

                {/* Score Details or Building State */}
                <div className="flex-1 w-full space-y-3">
                  {intelligentScore.isBuilding ? (
                    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-4 text-xs">
                      <p className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertCircle size={15} /> स्कोर तैयार हो रहा है (Score Building)
                      </p>
                      <p className="mt-1 text-amber-800 leading-5">
                        {intelligentScore.feedback}
                      </p>
                      <div className="mt-3">
                        <div className="flex justify-between text-[11px] font-bold text-amber-900">
                          <span>अनलॉक प्रगति</span>
                          <span>{overall.totalQuestionsAttempted} / 5 प्रश्न</span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-amber-200">
                          <div
                            className="h-full rounded-full bg-amber-600 transition-all"
                            style={{ width: `${intelligentScore.buildingProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))] leading-6">
                        {intelligentScore.feedback}
                      </p>

                      {/* 5-Factor Score Breakdown */}
                      <div className="mt-4 grid gap-2.5 text-xs">
                        <div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-[hsl(var(--muted-foreground))]">नोट्स पूर्णता (Study Material - 20%)</span>
                            <span className="font-bold text-[hsl(var(--primary))]">{intelligentScore.breakdown.studyMaterialScore} / 20</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${(intelligentScore.breakdown.studyMaterialScore / 20) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-[hsl(var(--muted-foreground))]">PYQ अभ्यास प्रदर्शन (25%)</span>
                            <span className="font-bold text-[hsl(var(--primary))]">{intelligentScore.breakdown.pyqScore} / 25</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(intelligentScore.breakdown.pyqScore / 25) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-[hsl(var(--muted-foreground))]">क्विज़ सटीकता (Quiz Accuracy - 30%)</span>
                            <span className="font-bold text-[hsl(var(--primary))]">{intelligentScore.breakdown.quizScore} / 30</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                            <div className="h-full rounded-full bg-amber-500" style={{ width: `${(intelligentScore.breakdown.quizScore / 30) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-[hsl(var(--muted-foreground))]">विषय कवरेज (Topic Coverage - 15%)</span>
                            <span className="font-bold text-[hsl(var(--primary))]">{intelligentScore.breakdown.topicCoverageScore} / 15</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                            <div className="h-full rounded-full bg-purple-600" style={{ width: `${(intelligentScore.breakdown.topicCoverageScore / 15) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-[hsl(var(--muted-foreground))]">अध्ययन निरंतरता (Streak & Activity - 10%)</span>
                            <span className="font-bold text-[hsl(var(--primary))]">{intelligentScore.breakdown.consistencyScore} / 10</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                            <div className="h-full rounded-full bg-rose-500" style={{ width: `${(intelligentScore.breakdown.consistencyScore / 10) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-[hsl(var(--border))] pt-4 flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))]">
                <span>* यह ExamSetu4U द्वारा डिज़ाइन किया गया अधिगम-दक्षता सूचकांक है (आधिकारिक परीक्षा अंक नहीं)।</span>
                <Link href="/quiz" className="font-bold text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
                  क्विज़ देकर स्कोर बढ़ाएँ <ArrowRight size={12} />
                </Link>
              </div>
            </Card>

            {/* Recommended Next Step Card */}
            <Card className="flex flex-col justify-between p-6 sm:p-7 border-[hsl(var(--accent)/.4)] bg-[hsl(var(--card))]" data-testid="card-recommended-step">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--secondary))] px-3 py-1 text-xs font-bold text-[hsl(var(--primary))]">
                  <Lightbulb size={14} className="text-amber-500" /> अनुशंसित अगला कदम (AI Recommendation)
                </span>

                <h3 className="font-display mt-4 text-xl font-bold text-[hsl(var(--primary))]">
                  {recommendedStep.title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-[hsl(var(--muted-foreground))]">
                  {recommendedStep.description}
                </p>

                <div className="mt-5 rounded-lg bg-[hsl(var(--secondary)/.5)] p-3 text-xs">
                  <p className="font-bold text-[hsl(var(--primary))]">तैयारी टिप:</p>
                  <p className="text-[hsl(var(--muted-foreground))] mt-0.5">
                    प्रत्येक थ्योरी अध्याय पढ़ने के बाद 10 प्रश्नों का अभ्यास टेस्ट देने से स्मृति 70% तक बढ़ जाती है।
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[hsl(var(--border))]">
                <Button href={recommendedStep.url} variant="primary" className="w-full text-xs font-bold">
                  {recommendedStep.actionLabel} <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          </div>

          {/* 3. Overall Performance Cards Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Overall Preparation */}
            <Card className="p-5" data-testid="metric-overall-progress">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  समग्र तैयारी प्रगति
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <BarChart3 size={18} />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-[hsl(var(--primary))]">
                {overall.overallPercentage}%
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${overall.overallPercentage}%` }} />
              </div>
              <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                {overall.studyMaterialsCompleted} अध्याय पूर्ण • {overall.totalQuestionsSolved || overall.totalQuestionsAttempted} प्रश्न हल
              </p>
            </Card>

            {/* Study Material Progress */}
            <Card className="p-5" data-testid="metric-study-progress">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  अध्ययन सामग्री (Notes)
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <BookOpen size={18} />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-[hsl(var(--primary))]">
                {overall.studyMaterialsCompleted} / {overall.totalStudyMaterials}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: `${overall.studyCompletionPercent}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-[hsl(var(--muted-foreground))]">{overall.studyCompletionPercent}% सिलेबस पढ़ा</span>
                <Link href="/study-material" className="font-bold text-[hsl(var(--primary))] hover:underline">
                  नोट्स पढ़ें →
                </Link>
              </div>
            </Card>

            {/* PYQ Practice */}
            <Card className="p-5" data-testid="metric-pyq-progress">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  PYQ अभ्यास (Previous Years)
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Target size={18} />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-[hsl(var(--primary))]">
                {overall.pyqAccuracy}%
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${overall.pyqAccuracy}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-[hsl(var(--muted-foreground))]">{overall.pyqsCorrect}/{overall.pyqsAttempted} प्रश्न सही</span>
                <Link href="/pyq" className="font-bold text-[hsl(var(--primary))] hover:underline">
                  PYQ हल करें →
                </Link>
              </div>
            </Card>

            {/* Quiz Performance */}
            <Card className="p-5" data-testid="metric-quiz-progress">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  MCQ क्विज़ इंजन
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Award size={18} />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-[hsl(var(--primary))]">
                {overall.quizAccuracy}%
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                <div className="h-full rounded-full bg-purple-600" style={{ width: `${overall.quizAccuracy}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-[hsl(var(--muted-foreground))]">{overall.quizzesCompleted} क्विज़ • बेस्ट {overall.quizBestScore}%</span>
                <Link href="/quiz" className="font-bold text-[hsl(var(--primary))] hover:underline">
                  क्विज़ शुरू करें →
                </Link>
              </div>
            </Card>
          </div>

          {/* 4. Exam-wise & Subject-wise Progress */}
          <div className="mt-12 space-y-10">
            {/* Subject-wise Progress for Selected Exam */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Subject-Wise Deep Dive</p>
                  <h2 className="font-display text-2xl font-bold text-[hsl(var(--primary))]">
                    {currentExam?.name} विषयवार प्रगति (Subject-wise Progress)
                  </h2>
                </div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  कुल विषय: {activeExamSubjects.length} • शुरू किए गए: {examProgress.subjectsStarted}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subjectProgressList.map((subjectProgress) => {
                  const subject = activeExamSubjects.find((s) => s.id === subjectProgress.subjectId);
                  if (!subject) return null;

                  const statusTone =
                    subjectProgress.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : subjectProgress.status === 'Strong'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : subjectProgress.status === 'In Progress'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200';

                  return (
                    <Card
                      key={subjectProgress.subjectId}
                      className="flex flex-col justify-between p-5 transition-shadow hover:shadow-md"
                      data-testid={`card-subject-progress-${subjectProgress.subjectId}`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-[hsl(var(--primary))] text-base">
                            {subjectProgress.subjectName}
                          </h3>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${statusTone}`}>
                            {subjectProgress.status}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
                          {subject.description}
                        </p>

                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>समग्र प्रगति</span>
                            <span className="font-bold text-[hsl(var(--primary))]">{subjectProgress.overallPercent}%</span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                            <div
                              className="h-full rounded-full bg-[hsl(var(--primary))]"
                              style={{ width: `${subjectProgress.overallPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))]">
                          <span>{subjectProgress.completedTopics} / {subjectProgress.totalTopics} अध्याय पूर्ण</span>
                          <span>PYQ: {subjectProgress.pyqPercent}%</span>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2 border-t border-[hsl(var(--border))] pt-4">
                        <Button
                          href={`/exams/${currentExam?.id}/${subject.id}`}
                          variant="secondary"
                          className="flex-1 min-h-9 px-2 text-xs"
                          data-testid={`button-study-subject-${subject.id}`}
                        >
                          नोट्स पढ़ें
                        </Button>
                        <Button
                          href={`/quiz/${currentExam?.id}/${subject.id}`}
                          variant="primary"
                          className="flex-1 min-h-9 px-2 text-xs"
                          data-testid={`button-quiz-subject-${subject.id}`}
                        >
                          क्विज़ लें
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* All 8 Exams Comparison Matrix */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Cross-Exam Tracking</p>
                  <h2 className="font-display text-xl font-bold text-[hsl(var(--primary))]">
                    सभी 8 परीक्षाओं का प्रगति तुलनात्मक विश्लेषण
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {exams.map((exam) => {
                  const p = calculateExamProgress(exam.id);
                  const isSelected = exam.id === selectedExamId;

                  return (
                    <div
                      key={exam.id}
                      onClick={() => handleExamChange(exam.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'border-[hsl(var(--accent))] bg-[hsl(var(--accent)/.06)] shadow-sm'
                          : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/.4)]'
                      }`}
                      data-testid={`card-exam-matrix-${exam.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-[hsl(var(--primary))]">
                          {exam.name}
                        </h3>
                        {isSelected && (
                          <span className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--accent-foreground))]">
                            सक्रिय
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-display text-2xl font-bold text-[hsl(var(--primary))]">
                          {p.overallPercentage}%
                        </span>
                        <span className="text-[11px] text-[hsl(var(--muted-foreground))]">पूर्ण</span>
                      </div>

                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                        <div
                          className="h-full rounded-full bg-[hsl(var(--primary))]"
                          style={{ width: `${p.overallPercentage}%` }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))]">
                        <span>{p.totalSubjects} विषय</span>
                        <span>सटीकता: {p.accuracy}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Revision Summary Section (Module 10) */}
          <div className="mt-12" data-testid="section-dashboard-revision">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Smart Revision & Error Remediation</p>
                <h2 className="font-display text-2xl font-bold text-[hsl(var(--primary))]">
                  रिवीजन सारांश (Revision Summary)
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  href="/mistakes/practice"
                  variant="primary"
                  className="min-h-9 text-xs"
                  data-testid="button-dash-practice-mistakes"
                >
                  <Play size={14} />
                  <span>Practice Mistakes</span>
                </Button>
                <Button
                  href="/mistakes"
                  variant="secondary"
                  className="min-h-9 text-xs"
                  data-testid="button-dash-view-mistakes"
                >
                  <BookOpen size={14} />
                  <span>View Mistake Book</span>
                </Button>
                <Button
                  href="/practice/weak-topics"
                  variant="secondary"
                  className="min-h-9 text-xs"
                  data-testid="button-dash-weak-topics"
                >
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span>Weak Topics</span>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Card className="p-4" data-testid="metric-dash-total-mistakes">
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Total Mistakes</p>
                <p className="mt-1 font-display text-2xl font-bold text-[hsl(var(--foreground))]">
                  {mistakeSummary.total}
                </p>
              </Card>

              <Card
                className="p-4 border-rose-200 bg-rose-50/60 dark:border-rose-900/40 dark:bg-rose-950/20"
                data-testid="metric-dash-needs-revision"
              >
                <p className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                  Needs Revision (दोबारा पढ़ें)
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-rose-700 dark:text-rose-200">
                  {mistakeSummary.needsRevision}
                </p>
              </Card>

              <Card
                className="p-4 border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20"
                data-testid="metric-dash-improving"
              >
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Improving (सुधार हो रहा है)
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-amber-700 dark:text-amber-200">
                  {mistakeSummary.improving}
                </p>
              </Card>

              <Card
                className="p-4 border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                data-testid="metric-dash-mastered"
              >
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  Mastered (मजबूत)
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-emerald-700 dark:text-emerald-200">
                  {mistakeSummary.mastered}
                </p>
              </Card>

              <Card className="p-4 col-span-2 sm:col-span-1" data-testid="metric-dash-today-revision">
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                  Today's Revision Count
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-[hsl(var(--primary))]">
                  {mistakeSummary.todayRevisionCount}
                </p>
              </Card>
            </div>
          </div>

          {/* 5. Weak Areas & Recent Activity Dual Layout */}
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Weak Areas Panel */}
            <Card className="p-6 sm:p-7" data-testid="card-weak-areas">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <AlertCircle size={16} />
                  </span>
                  <h3 className="font-bold text-[hsl(var(--primary))] text-base">
                    सुधार की आवश्यकता (Weak Areas)
                  </h3>
                </div>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  गलत उत्तरों के आधार पर
                </span>
              </div>

              {weakAreas.length === 0 ? (
                <div className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-2" />
                  <p className="font-bold text-[hsl(var(--primary))]">कोई गंभीर कमजोर क्षेत्र नहीं मिला!</p>
                  <p className="mt-1">आपकी क्विज़ सटीकता अच्छी है। नए विषयों के टेस्ट दें।</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {weakAreas.map((area) => (
                    <div
                      key={area.topicId}
                      className="flex items-center justify-between gap-3 rounded-lg border border-[hsl(var(--border))] p-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-[hsl(var(--primary))]">{area.topicName}</p>
                        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                          {area.examName} • {area.subjectName} • {area.incorrectCount} गलतियाँ
                        </p>
                      </div>

                      <Button href={area.practiceUrl} variant="secondary" className="min-h-8 px-3 text-xs font-bold shrink-0">
                        अभ्यास करें <ArrowRight size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Recent Activity Timeline */}
            <Card className="p-6 sm:p-7" data-testid="card-recent-activity">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Clock size={16} />
                  </span>
                  <h3 className="font-bold text-[hsl(var(--primary))] text-base">
                    हाल की अध्ययन गतिविधि (Recent Activity)
                  </h3>
                </div>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  सक्रिय सत्र
                </span>
              </div>

              {recentActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
                  <p className="font-bold text-[hsl(var(--primary))]">अभी तक कोई गतिविधि दर्ज नहीं है</p>
                  <p className="mt-1">स्टडी मटेरियल पढ़ें या क्विज़ हल करें और आपकी प्रगति यहाँ दर्ज होगी।</p>
                  <div className="mt-4">
                    <Button href="/quiz" variant="secondary" className="min-h-8 text-xs">
                      पहला क्विज़ लें
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 divide-y divide-[hsl(var(--border))]">
                  {recentActivities.slice(0, 5).map((act) => (
                    <div key={act.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <Link href={act.url} className="font-semibold text-[hsl(var(--primary))] hover:underline truncate block">
                          {act.title}
                        </Link>
                        <p className="text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5">
                          {act.subtitle} • {new Date(act.timestamp).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {act.scoreText && (
                        <span className="shrink-0 rounded-md bg-[hsl(var(--secondary))] px-2 py-0.5 text-[11px] font-bold text-[hsl(var(--primary))]">
                          {act.scoreText}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </Container>
      </section>
    </Layout>
  );
}

export default DashboardPage;
