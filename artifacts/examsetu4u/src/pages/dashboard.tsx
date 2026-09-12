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
      {/* 1. Header / Welcome Section - Prepare with purpose theme */}
      <section className="hero-wash text-white py-10 sm:py-14">
        <Container>
          <div className="text-blue-200">
            <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Learner Dashboard' }]} />
          </div>

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur-xs">
                  <Sparkles size={13} className="text-blue-300" /> Learner Dashboard
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-200 backdrop-blur-xs">
                  <Flame size={14} className="text-amber-300" /> {overall.learningStreakDays} Day Streak
                </span>
              </div>
              <h1 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                नमस्ते, <span className="text-blue-300">{displayName}</span> 👋
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-blue-100/90 max-w-2xl leading-relaxed">
                आपकी परीक्षा तैयारी का समग्र विश्लेषण, अध्ययन प्रगति और इंटेलिजेंट स्कोर।
              </p>
            </div>

            {/* Target Exam Switcher & Navigation CTAs */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-white backdrop-blur-md shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  सक्रिय परीक्षा:
                </span>
                <select
                  value={selectedExamId}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer [&>option]:text-slate-900"
                  data-testid="select-dashboard-exam"
                >
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                href="/study-planner"
                className="bg-white text-blue-900 hover:bg-blue-50 border-white font-bold shadow-md min-h-10 text-xs"
                data-testid="button-go-study-planner"
              >
                <Target size={14} /> दैनिक प्लानर
              </Button>

              <Button
                href="/analytics"
                variant="secondary"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-xs min-h-10 text-xs font-bold"
                data-testid="button-go-analytics"
              >
                <BarChart3 size={14} /> विश्लेषण
              </Button>

              <Button
                href="/achievements"
                variant="secondary"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-xs min-h-10 text-xs font-bold"
                data-testid="button-go-achievements"
              >
                <Trophy size={14} /> उपलब्धियां ({unlockedBadges.length})
              </Button>

              <Button
                href="/profile"
                variant="secondary"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-xs min-h-10 text-xs font-bold"
                data-testid="button-go-profile"
              >
                <User size={14} /> प्रोफ़ाइल
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-8 sm:py-12 bg-white">
        <Container>
          {/* Preparation Level Banner */}
          <div
            className="mb-8 flex flex-col gap-4 rounded-2xl border border-blue-200/90 bg-white p-5 sm:p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between"
            id="dashboard-prep-level-banner"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                  {prepLevel.badge}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  तैयारी स्तर (Preparation Level {prepLevel.levelNumber} of 6)
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{prepLevel.levelName}</h2>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">{prepLevel.requirementsText}</p>
            </div>

            <div className="min-w-[240px] rounded-xl border border-blue-100 bg-blue-50/40 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">अगले स्तर की प्रगति:</span>
                <span className="font-bold text-blue-700">{prepLevel.progressToNext}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${prepLevel.progressToNext}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Goal & Actionable Insight Dual Bar */}
          <div className="mb-8 grid gap-6 md:grid-cols-2" id="dashboard-daily-goals-row">
            {/* Daily Goal Card */}
            <Card className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200 shadow-2xs" id="dashboard-daily-goal-card">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <Target size={16} />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">आज का दैनिक लक्ष्य (Daily Goal)</h3>
                  </div>
                  {dailyGoal.isCompleted ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      लक्ष्य पूर्ण 🎉
                    </span>
                  ) : (
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-800">
                      {dailyGoal.remaining} प्रश्न शेष
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-slate-900">
                    {dailyGoal.todayQuestionsAttempted} <span className="text-base font-normal text-slate-500">/ {dailyGoal.targetQuestions} प्रश्न</span>
                  </p>
                  <span className="text-xs font-bold text-blue-700">{dailyGoal.percentage}%</span>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dailyGoal.isCompleted ? 'bg-emerald-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${dailyGoal.percentage}%` }}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Today's Revised Questions:</span>
                  <strong className="font-bold text-slate-800">
                    {mistakeSummary.todayRevisionCount}
                  </strong>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">लक्ष्य बदलें:</span>
                  <div className="flex items-center gap-1">
                    {DAILY_GOAL_OPTIONS.map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleGoalChange(num)}
                        className={`rounded-lg px-2.5 py-0.5 text-[11px] font-bold transition ${
                          dailyGoal.targetQuestions === num
                            ? 'bg-blue-700 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
                <Link
                  href="/study-planner"
                  className="font-bold text-blue-700 hover:text-blue-800 flex items-center justify-between pt-1 transition"
                  data-testid="link-dash-to-study-planner"
                >
                  <span>दैनिक अध्ययन प्लानर (Daily Planner) खोलें</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </Card>

            {/* Achievements & Quick Insights Card */}
            <Card className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200 shadow-2xs" id="dashboard-achievements-preview-card">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                      <Trophy size={16} />
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">उपलब्धियां (Achievements)</h3>
                  </div>
                  <Link href="/achievements" className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-0.5 transition">
                    सभी देखें <ChevronRight size={13} />
                  </Link>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {achievements.slice(0, 5).map((badge) => (
                    <div
                      key={badge.id}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg shadow-2xs ${
                        badge.isUnlocked
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-50 opacity-40 grayscale'
                      }`}
                      title={`${badge.title} (${badge.isUnlocked ? 'अनलॉक' : 'लॉक'})`}
                    >
                      {badge.icon}
                    </div>
                  ))}
                  <div className="ml-2">
                    <p className="text-xs font-bold text-slate-900">
                      {unlockedBadges.length} / {achievements.length} पदक अनलॉक
                    </p>
                    <p className="text-[11px] text-slate-500">
                      अध्ययन व क्विज़ से नए पदक अर्जित करें
                    </p>
                  </div>
                </div>

                {insights.length > 0 && (
                  <div className="mt-3 rounded-xl bg-blue-50/50 border border-blue-100 p-2.5 text-xs flex items-start gap-2">
                    <Lightbulb size={15} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="line-clamp-2 leading-relaxed text-slate-600">
                      <span className="font-bold text-slate-900">{insights[0].title}: </span>
                      {insights[0].message}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <Link href="/analytics" className="font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition">
                  विस्तृत प्रदर्शन विश्लेषण खोलें <ArrowRight size={12} />
                </Link>
                <Link href="/achievements" className="font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition">
                  पदक गैलरी <ArrowRight size={12} />
                </Link>
              </div>
            </Card>
          </div>

          {/* Recommended Action Today */}
          {recommendedStep && (
            <div
              className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 sm:p-5 shadow-2xs"
              data-testid="banner-recommended-action"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-2xs">
                  <Target size={18} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                      आज की अनुशंसित गतिविधि
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Recommended Action</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 mt-1">
                    {recommendedStep.title}
                  </p>
                  <p className="text-xs text-slate-600 max-w-xl">
                    {recommendedStep.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Button href={recommendedStep.url} variant="primary" className="min-h-10 px-4 text-xs font-bold w-full sm:w-auto shadow-xs" data-testid="button-recommended-step-action">
                  {recommendedStep.actionLabel} <ArrowRight size={14} />
                </Button>
                <Button href="/study-planner" variant="secondary" className="min-h-10 px-3 text-xs font-bold hidden sm:inline-flex" data-testid="button-recommended-to-planner">
                  पूरा प्लानर
                </Button>
              </div>
            </div>
          )}

          {/* Continue Learning Banner */}
          {continueItem && (
            <div
              className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-blue-200/90 bg-white p-4 sm:p-5 shadow-2xs"
              data-testid="banner-continue-learning"
            >
              <div className="flex items-start gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-2xs">
                  <Play size={18} fill="currentColor" />
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    जहाँ छोड़ा था वहीं से जारी रखें (Continue Learning)
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {continueItem.topicName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {continueItem.examName} • {continueItem.subjectName} • {continueItem.progress}% सहेजी गई प्रगति
                  </p>
                </div>
              </div>

              <Button href={continueItem.url} variant="primary" className="min-h-10 px-4 text-xs font-bold shrink-0 w-full sm:w-auto shadow-xs" data-testid="button-resume-continue">
                अभी पढ़ें / हल करें <ArrowRight size={14} />
              </Button>
            </div>
          )}

          {/* 2. Intelligent Score Hero Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Intelligent Score Card */}
            <Card
              className="lg:col-span-2 overflow-hidden rounded-2xl border border-blue-200/90 bg-white p-6 sm:p-8 shadow-xs"
              data-testid="card-intelligent-score"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                      <Sparkles size={16} />
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">
                      Intelligent Learning Score
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    अध्ययन सामग्री पूर्णता, PYQ सटीकता, क्विज़ स्कोर और निरंतरता का संतुलित सूचकांक
                  </p>
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                      intelligentScore.isBuilding
                        ? 'border-amber-200 bg-amber-50 text-amber-800'
                        : intelligentScore.score >= 80
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : intelligentScore.score >= 60
                        ? 'border-blue-200 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-slate-50 text-slate-800'
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
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-blue-600 bg-blue-50/50 shadow-inner">
                    <div className="text-center">
                      <span className="font-display text-4xl font-extrabold tracking-tight text-blue-900">
                        {intelligentScore.isBuilding ? '...' : intelligentScore.score}
                      </span>
                      <span className="block text-[11px] font-bold text-slate-500">
                        / 100 अंक
                      </span>
                    </div>
                  </div>
                  <span className="mt-2.5 text-xs font-bold text-slate-900">
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
                      <p className="text-sm font-semibold text-slate-800 leading-6">
                        {intelligentScore.feedback}
                      </p>

                      {/* 5-Factor Score Breakdown */}
                      <div className="mt-4 grid gap-2.5 text-xs">
                        <div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-500">नोट्स पूर्णता (Study Material - 20%)</span>
                            <span className="font-bold text-slate-900">{intelligentScore.breakdown.studyMaterialScore} / 20</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${(intelligentScore.breakdown.studyMaterialScore / 20) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-500">PYQ अभ्यास प्रदर्शन (25%)</span>
                            <span className="font-bold text-slate-900">{intelligentScore.breakdown.pyqScore} / 25</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(intelligentScore.breakdown.pyqScore / 25) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-500">क्विज़ सटीकता (Quiz Accuracy - 30%)</span>
                            <span className="font-bold text-slate-900">{intelligentScore.breakdown.quizScore} / 30</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-amber-500" style={{ width: `${(intelligentScore.breakdown.quizScore / 30) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-500">विषय कवरेज (Topic Coverage - 15%)</span>
                            <span className="font-bold text-slate-900">{intelligentScore.breakdown.topicCoverageScore} / 15</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-sky-600" style={{ width: `${(intelligentScore.breakdown.topicCoverageScore / 15) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-500">अध्ययन निरंतरता (Streak & Activity - 10%)</span>
                            <span className="font-bold text-slate-900">{intelligentScore.breakdown.consistencyScore} / 10</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${(intelligentScore.breakdown.consistencyScore / 10) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-slate-500">
                <span>* यह ExamSetu4U द्वारा डिज़ाइन किया गया अधिगम-दक्षता सूचकांक है (आधिकारिक परीक्षा अंक नहीं)।</span>
                <Link href="/quiz" className="font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 transition">
                  क्विज़ देकर स्कोर बढ़ाएँ <ArrowRight size={12} />
                </Link>
              </div>
            </Card>

            {/* Recommended Next Step Card */}
            <Card className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-blue-200/90 bg-blue-50/30 shadow-2xs" data-testid="card-recommended-step">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-blue-700 shadow-2xs">
                  <Lightbulb size={14} className="text-amber-500" /> अनुशंसित अगला कदम (AI Recommendation)
                </span>

                <h3 className="font-display mt-4 text-xl font-bold text-slate-900">
                  {recommendedStep.title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-600">
                  {recommendedStep.description}
                </p>

                <div className="mt-5 rounded-xl border border-blue-100 bg-white p-3.5 text-xs shadow-2xs">
                  <p className="font-bold text-slate-900">तैयारी टिप:</p>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    प्रत्येक थ्योरी अध्याय पढ़ने के बाद 10 प्रश्नों का अभ्यास टेस्ट देने से स्मृति 70% तक बढ़ जाती है।
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-blue-100">
                <Button href={recommendedStep.url} variant="primary" className="w-full text-xs font-bold shadow-xs">
                  {recommendedStep.actionLabel} <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          </div>

          {/* 3. Overall Performance Cards Grid */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Overall Preparation */}
            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-blue-200 hover:shadow-xs transition" data-testid="metric-overall-progress">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  समग्र तैयारी प्रगति
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <BarChart3 size={18} />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
                {overall.overallPercentage}%
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${overall.overallPercentage}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {overall.studyMaterialsCompleted} अध्याय पूर्ण • {overall.totalQuestionsSolved || overall.totalQuestionsAttempted} प्रश्न हल
              </p>
            </Card>

            {/* Study Material Progress */}
            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-blue-200 hover:shadow-xs transition" data-testid="metric-study-progress">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  अध्ययन सामग्री (Notes)
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <BookOpen size={18} />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
                {overall.studyMaterialsCompleted} / {overall.totalStudyMaterials}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: `${overall.studyCompletionPercent}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">{overall.studyCompletionPercent}% सिलेबस पढ़ा</span>
                <Link href="/study-material" className="font-bold text-blue-700 hover:text-blue-800 transition">
                  नोट्स पढ़ें →
                </Link>
              </div>
            </Card>

            {/* PYQ Practice */}
            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-blue-200 hover:shadow-xs transition" data-testid="metric-pyq-progress">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  PYQ अभ्यास (Previous Years)
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <Target size={18} />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
                {overall.pyqAccuracy}%
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${overall.pyqAccuracy}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">{overall.pyqsCorrect}/{overall.pyqsAttempted} प्रश्न सही</span>
                <Link href="/pyq" className="font-bold text-blue-700 hover:text-blue-800 transition">
                  PYQ हल करें →
                </Link>
              </div>
            </Card>

            {/* Quiz Performance */}
            <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-blue-200 hover:shadow-xs transition" data-testid="metric-quiz-progress">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  MCQ क्विज़ इंजन
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                  <Award size={18} />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
                {overall.quizAccuracy}%
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-purple-600" style={{ width: `${overall.quizAccuracy}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">{overall.quizzesCompleted} क्विज़ • बेस्ट {overall.quizBestScore}%</span>
                <Link href="/quiz" className="font-bold text-blue-700 hover:text-blue-800 transition">
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
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Subject-Wise Deep Dive</p>
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    {currentExam?.name} विषयवार प्रगति (Subject-wise Progress)
                  </h2>
                </div>
                <div className="text-xs text-slate-500">
                  कुल विषय: {activeExamSubjects.length} • शुरू किए गए: {examProgress.subjectsStarted}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subjectProgressList.map((subjectProgress) => {
                  const subject = activeExamSubjects.find((s) => s.id === subjectProgress.subjectId);
                  if (!subject) return null;

                  const statusTone =
                    subjectProgress.status === 'Completed'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : subjectProgress.status === 'Strong'
                      ? 'border-blue-200 bg-blue-50 text-blue-800'
                      : subjectProgress.status === 'In Progress'
                      ? 'border-amber-200 bg-amber-50 text-amber-800'
                      : 'border-slate-200 bg-slate-50 text-slate-600';

                  return (
                    <Card
                      key={subjectProgress.subjectId}
                      className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-200 hover:shadow-xs transition"
                      data-testid={`card-subject-progress-${subjectProgress.subjectId}`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-900 text-base">
                            {subjectProgress.subjectName}
                          </h3>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${statusTone}`}>
                            {subjectProgress.status}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {subject.description}
                        </p>

                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-500">समग्र प्रगति</span>
                            <span className="font-bold text-blue-700">{subjectProgress.overallPercent}%</span>
                          </div>
                          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{ width: `${subjectProgress.overallPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                          <span>{subjectProgress.completedTopics} / {subjectProgress.totalTopics} अध्याय पूर्ण</span>
                          <span>PYQ: {subjectProgress.pyqPercent}%</span>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                        <Button
                          href={`/exams/${currentExam?.id}/${subject.id}`}
                          variant="secondary"
                          className="flex-1 min-h-9 px-2 text-xs font-bold"
                          data-testid={`button-study-subject-${subject.id}`}
                        >
                          नोट्स पढ़ें
                        </Button>
                        <Button
                          href={`/quiz/${currentExam?.id}/${subject.id}`}
                          variant="primary"
                          className="flex-1 min-h-9 px-2 text-xs font-bold shadow-xs"
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
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Cross-Exam Tracking</p>
                  <h2 className="font-display text-xl font-bold text-slate-900">
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
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-600/30'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-2xs'
                      }`}
                      data-testid={`card-exam-matrix-${exam.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-900">
                          {exam.name}
                        </h3>
                        {isSelected && (
                          <span className="rounded-full bg-blue-700 px-2 py-0.5 text-[10px] font-bold text-white">
                            सक्रिय
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-display text-2xl font-extrabold text-slate-900">
                          {p.overallPercentage}%
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">पूर्ण</span>
                      </div>

                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{ width: `${p.overallPercentage}%` }}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
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
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Smart Revision & Error Remediation</p>
                <h2 className="font-display text-2xl font-bold text-slate-900">
                  रिवीजन सारांश (Revision Summary)
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  href="/mistakes/practice"
                  variant="primary"
                  className="min-h-9 text-xs font-bold shadow-xs"
                  data-testid="button-dash-practice-mistakes"
                >
                  <Play size={14} />
                  <span>Practice Mistakes</span>
                </Button>
                <Button
                  href="/mistakes"
                  variant="secondary"
                  className="min-h-9 text-xs font-bold"
                  data-testid="button-dash-view-mistakes"
                >
                  <BookOpen size={14} />
                  <span>View Mistake Book</span>
                </Button>
                <Button
                  href="/practice/weak-topics"
                  variant="secondary"
                  className="min-h-9 text-xs font-bold"
                  data-testid="button-dash-weak-topics"
                >
                  <AlertTriangle size={14} className="text-amber-600" />
                  <span>Weak Topics</span>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Card className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs" data-testid="metric-dash-total-mistakes">
                <p className="text-xs font-semibold text-slate-500">Total Mistakes</p>
                <p className="mt-1 font-display text-2xl font-bold text-slate-900">
                  {mistakeSummary.total}
                </p>
              </Card>

              <Card
                className="p-4 rounded-2xl border border-rose-200 bg-rose-50/60 shadow-2xs"
                data-testid="metric-dash-needs-revision"
              >
                <p className="text-xs font-semibold text-rose-800">
                  Needs Revision (दोबारा पढ़ें)
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-rose-700">
                  {mistakeSummary.needsRevision}
                </p>
              </Card>

              <Card
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 shadow-2xs"
                data-testid="metric-dash-improving"
              >
                <p className="text-xs font-semibold text-amber-800">
                  Improving (सुधार हो रहा है)
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-amber-700">
                  {mistakeSummary.improving}
                </p>
              </Card>

              <Card
                className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 shadow-2xs"
                data-testid="metric-dash-mastered"
              >
                <p className="text-xs font-semibold text-emerald-800">
                  Mastered (मजबूत)
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-emerald-700">
                  {mistakeSummary.mastered}
                </p>
              </Card>

              <Card className="p-4 col-span-2 sm:col-span-1 rounded-2xl border border-slate-200 bg-white shadow-2xs" data-testid="metric-dash-today-revision">
                <p className="text-xs font-semibold text-slate-500">
                  Today's Revision Count
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-blue-700">
                  {mistakeSummary.todayRevisionCount}
                </p>
              </Card>
            </div>
          </div>

          {/* 5. Weak Areas & Recent Activity Dual Layout */}
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Weak Areas Panel */}
            <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-2xs" data-testid="card-weak-areas">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <AlertCircle size={16} />
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">
                    सुधार की आवश्यकता (Weak Areas)
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  गलत उत्तरों के आधार पर
                </span>
              </div>

              {weakAreas.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-2" />
                  <p className="font-bold text-slate-900">कोई गंभीर कमजोर क्षेत्र नहीं मिला!</p>
                  <p className="mt-1">आपकी क्विज़ सटीकता अच्छी है। नए विषयों के टेस्ट दें।</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {weakAreas.map((area) => (
                    <div
                      key={area.topicId}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{area.topicName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
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
            <Card className="p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-2xs" data-testid="card-recent-activity">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Clock size={16} />
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">
                    हाल की अध्ययन गतिविधि (Recent Activity)
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  सक्रिय सत्र
                </span>
              </div>

              {recentActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  <p className="font-bold text-slate-900">अभी तक कोई गतिविधि दर्ज नहीं है</p>
                  <p className="mt-1">स्टडी मटेरियल पढ़ें या क्विज़ हल करें और आपकी प्रगति यहाँ दर्ज होगी।</p>
                  <div className="mt-4">
                    <Button href="/quiz" variant="secondary" className="min-h-8 text-xs font-bold">
                      पहला क्विज़ लें
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 divide-y divide-slate-100">
                  {recentActivities.slice(0, 5).map((act) => (
                    <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <Link href={act.url} className="font-semibold text-slate-900 hover:text-blue-700 hover:underline truncate block transition">
                          {act.title}
                        </Link>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {act.subtitle} • {new Date(act.timestamp).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {act.scoreText && (
                        <span className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
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
