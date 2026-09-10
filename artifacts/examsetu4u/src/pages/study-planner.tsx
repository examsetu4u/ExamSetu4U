import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Flame,
  HelpCircle,
  History,
  ListChecks,
  Play,
  RotateCcw,
  Settings,
  ShieldAlert,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Breadcrumbs, ProgressBar } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { exams, getExam } from '@/data/curriculum';
import { useAuth } from '@/lib/auth';
import { DAILY_GOAL_OPTIONS, getAllAchievements } from '@/lib/analytics';
import {
  DailyTask,
  DailyTaskType,
  formatReadableDate,
  getDailyPlan,
  getPlannerMotivationalInsight,
  getPlannerSettings,
  getStudyHistory,
  getStudyStreak,
  getTodayDate,
  getTodayProgress,
  savePlannerSettings,
  StudySequencePreference,
} from '@/lib/study-planner';
import { getContinueLearning } from '@/lib/user-progress';

export default function StudyPlannerPage() {
  const { profile, updateProfile } = useAuth();
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  // Load live data
  const settings = useMemo(() => getPlannerSettings(), [refreshKey]);
  const todayProgress = useMemo(() => getTodayProgress(), [refreshKey]);
  const streak = useMemo(() => getStudyStreak(), [refreshKey]);
  const dailyTasks = useMemo(() => getDailyPlan(), [refreshKey]);
  const motivationalInsight = useMemo(() => getPlannerMotivationalInsight(), [refreshKey]);
  const continueItem = useMemo(() => getContinueLearning(), [refreshKey]);
  const achievements = useMemo(() => getAllAchievements(), [refreshKey]);
  const recentBadges = useMemo(() => achievements.filter((a) => a.isUnlocked).slice(0, 3), [achievements]);

  // Form states for settings modal
  const [goalInput, setGoalInput] = useState<number>(settings.dailyGoal);
  const [examInput, setExamInput] = useState<string>(settings.preferredExamId);
  const [sequenceInput, setSequenceInput] = useState<StudySequencePreference>(settings.studySequence);

  const currentExam = getExam(settings.preferredExamId) || exams[0];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    savePlannerSettings({
      dailyGoal: goalInput,
      preferredExamId: examInput,
      studySequence: sequenceInput,
    });
    if (profile && examInput !== profile.preferredExamId) {
      updateProfile({ preferredExamId: examInput });
    }
    setSettingsOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const handleQuickGoalChange = (newGoal: number) => {
    savePlannerSettings({ dailyGoal: newGoal });
    setGoalInput(newGoal);
    setRefreshKey((k) => k + 1);
  };

  const badgeToneClasses: Record<string, string> = {
    primary: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-900',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900',
    amber: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900',
  };

  return (
    <Layout>
      {/* 1. Header Section */}
      <section className="paper-grid border-b border-[hsl(var(--border))] py-8 sm:py-12">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'दैनिक अध्ययन प्लानर' },
            ]}
          />

          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary))] px-3 py-1 text-xs font-bold text-white shadow-sm">
                  <Target size={14} className="text-amber-400" /> आज की पढ़ाई
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
                  <Flame size={14} className="text-amber-600" /> {streak.currentStreak} Day Streak
                </span>
                <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                  {formatReadableDate(todayProgress.date)}
                </span>
              </div>
              <h1 className="font-display mt-2.5 text-2xl font-bold tracking-tight text-[hsl(var(--primary))] sm:text-4xl">
                दैनिक अध्ययन प्लानर (Daily Study Planner)
              </h1>
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] max-w-2xl">
                आज क्या पढ़ना है, कितना अभ्यास करना है और कौन से विषयों का रिवीजन करना है — आपकी वास्तविक तैयारी पर आधारित योजना।
              </p>
            </div>

            {/* Actions: Settings & History */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                href="/study-planner/history"
                variant="secondary"
                className="min-h-11 text-xs font-bold"
                data-testid="button-view-planner-history"
              >
                <History size={15} /> अध्ययन इतिहास
              </Button>
              <button
                type="button"
                onClick={() => {
                  setGoalInput(settings.dailyGoal);
                  setExamInput(settings.preferredExamId);
                  setSequenceInput(settings.studySequence);
                  setSettingsOpen(true);
                }}
                className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 text-xs font-bold text-[hsl(var(--primary))] shadow-sm hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]"
                data-testid="button-open-planner-settings"
              >
                <Settings size={15} /> प्लानर सेटिंग्स
              </button>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Main Content Section */}
      <section className="py-8 sm:py-12">
        <Container>
          {/* Motivational Insight Banner */}
          <div
            className={`mb-8 flex items-center gap-3 rounded-xl border p-4 text-sm font-medium shadow-sm transition-all ${
              motivationalInsight.tone === 'emerald'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                : motivationalInsight.tone === 'amber'
                ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300'
                : motivationalInsight.tone === 'rose'
                ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
                : 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300'
            }`}
            role="status"
            id="planner-motivational-banner"
          >
            <Sparkles size={20} className="shrink-0 text-amber-500" />
            <p className="flex-1">{motivationalInsight.message}</p>
          </div>

          {/* Top Row: Daily Question Goal & Streak Summary */}
          <div className="mb-8 grid gap-6 md:grid-cols-2" id="planner-goals-streak-row">
            {/* Daily Question Goal Card (Requirement 2) */}
            <Card className="flex flex-col justify-between p-5 sm:p-6" id="planner-daily-goal-card">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                      <Target size={18} />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-[hsl(var(--primary))]">दैनिक प्रश्न लक्ष्य</h2>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Daily Question Goal</p>
                    </div>
                  </div>

                  {todayProgress.isCompleted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                      <CheckCircle2 size={13} /> आज का लक्ष्य पूरा हो गया 🎉
                    </span>
                  ) : (
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200">
                      {todayProgress.remainingQuestions} प्रश्न शेष
                    </span>
                  )}
                </div>

                {/* Progress Numbers */}
                <div className="mt-5 flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-bold text-[hsl(var(--primary))]">
                      {todayProgress.questionsTarget} में से {todayProgress.questionsAttempted} प्रश्न पूरे
                    </span>
                    <p className="mt-1 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      सही उत्तर: {todayProgress.questionsCorrect} प्रश्न
                    </p>
                  </div>
                  <span className="text-base font-bold text-[hsl(var(--primary))]">
                    {todayProgress.completionPercentage}% Complete
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3.5 h-3 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      todayProgress.isCompleted ? 'bg-emerald-500' : 'bg-[hsl(var(--primary))]'
                    }`}
                    style={{ width: `${todayProgress.completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Goal Quick Switcher Buttons */}
              <div className="mt-5 border-t border-[hsl(var(--border)/.6)] pt-4">
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2">
                  लक्ष्य बदलें (Daily Target):
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {DAILY_GOAL_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleQuickGoalChange(g)}
                      className={`focus-ring rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        todayProgress.questionsTarget === g
                          ? 'bg-[hsl(var(--primary))] text-white shadow-sm'
                          : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]'
                      }`}
                      data-testid={`button-goal-option-${g}`}
                    >
                      {g} प्रश्न
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Streak & Milestones Card (Requirement 7 & 8) */}
            <Card className="flex flex-col justify-between p-5 sm:p-6" id="planner-streak-milestones-card">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      <Flame size={18} />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-[hsl(var(--primary))]">अध्ययन निरंतरता (Streak)</h2>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">Meaningful Study Days</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
                    अगला लक्ष्य: {streak.nextMilestone} दिन
                  </span>
                </div>

                {/* 3 Metric Badges */}
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.4)] p-3">
                    <p className="text-xl sm:text-2xl font-bold text-[hsl(var(--primary))]">{streak.currentStreak}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Current Streak</p>
                  </div>
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.4)] p-3">
                    <p className="text-xl sm:text-2xl font-bold text-amber-600">{streak.bestStreak}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Best Streak</p>
                  </div>
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.4)] p-3">
                    <p className="text-xl sm:text-2xl font-bold text-emerald-600">{streak.studyDays}</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Study Days</p>
                  </div>
                </div>

                {/* Milestone Track */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2">
                    <span>Streak Milestones</span>
                    <span>{streak.daysToNextMilestone > 0 ? `${streak.daysToNextMilestone} दिन और बाकी` : 'लक्ष्य हासिल!'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[3, 7, 14, 30, 60, 100].map((m) => {
                      const isReached = streak.currentStreak >= m || streak.bestStreak >= m;
                      const isNext = streak.nextMilestone === m && !isReached;
                      return (
                        <div
                          key={m}
                          title={`${m} दिन की लकीर`}
                          className={`flex-1 rounded-md py-1.5 text-center text-[10px] font-bold transition-all ${
                            isReached
                              ? 'bg-amber-500 text-white shadow-xs'
                              : isNext
                              ? 'border-2 border-dashed border-amber-500 bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300'
                              : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] opacity-60'
                          }`}
                        >
                          {m}D
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-[hsl(var(--border)/.6)] pt-3 text-[11px] text-[hsl(var(--muted-foreground))]">
                * केवल वास्तविक अध्ययन (प्रश्न हल करना, क्विज़ या अध्याय पूर्ण करना) पर ही स्ट्रीक गिनी जाती है।
              </div>
            </Card>
          </div>

          {/* Daily Completion Metrics Bar (Requirement 9) */}
          <div className="mb-8 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm" id="planner-daily-completion-bar">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[hsl(var(--border))] pb-4 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[hsl(var(--primary))]">आज की अध्ययन प्रगति (Daily Completion)</h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">आज रिकॉर्ड की गई सभी शिक्षण गतिविधियों का विवरण</p>
              </div>
              <span className="text-xs font-bold text-[hsl(var(--primary))] bg-[hsl(var(--secondary))] px-3 py-1 rounded-full self-start sm:self-auto">
                {todayProgress.completionPercentage}% पूर्ण
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)] p-3">
                <span className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Questions</span>
                <p className="mt-1 text-base font-bold text-[hsl(var(--primary))]">
                  {todayProgress.questionsAttempted} / {todayProgress.questionsTarget}
                </p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{todayProgress.questionsCorrect} सही</p>
              </div>

              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)] p-3">
                <span className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Study Material</span>
                <p className="mt-1 text-base font-bold text-sky-700 dark:text-sky-400">
                  {todayProgress.studyMaterialsCount > 0 ? `${todayProgress.studyMaterialsCount} पढ़े गए` : 'शुरू करें'}
                </p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">सिद्धांत अध्ययन</p>
              </div>

              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)] p-3">
                <span className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">PYQ Attempted</span>
                <p className="mt-1 text-base font-bold text-amber-700 dark:text-amber-400">
                  {todayProgress.pyqsAttempted} प्रश्न
                </p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">विगत वर्ष प्रश्न</p>
              </div>

              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)] p-3">
                <span className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Quiz Completed</span>
                <p className="mt-1 text-base font-bold text-indigo-700 dark:text-indigo-400">
                  {todayProgress.quizzesCompleted} क्विज़
                </p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">समयबद्ध परीक्षण</p>
              </div>

              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)] p-3 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Mistake Revision</span>
                <p className="mt-1 text-base font-bold text-rose-700 dark:text-rose-400">
                  {todayProgress.revisionsDone} प्रश्न
                </p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]">त्रुटि सुधार</p>
              </div>
            </div>
          </div>

          {/* 3. Today's Plan: Deterministic Task List (Requirement 3, 4, 5, 6) */}
          <div className="mb-10" id="planner-task-list-section">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[hsl(var(--primary))] flex items-center gap-2">
                  <ListChecks size={22} className="text-[hsl(var(--primary))]" /> आज की प्राथमिकता सूची (Today's Plan)
                </h2>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  परीक्षा: <span className="font-bold text-[hsl(var(--primary))]">{currentExam.name}</span> • आपकी अध्ययन स्थिति पर आधारित प्राथमिकता क्रम
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span>{dailyTasks.filter((t) => t.completed).length} / {dailyTasks.length} पूरे</span>
              </div>
            </div>

            {dailyTasks.length === 0 ? (
              // Empty state: Requirement 6 & 18
              <Card className="p-8 text-center" id="planner-tasks-empty-state">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                  <BookOpen size={26} />
                </div>
                <h3 className="mt-4 text-base font-bold text-[hsl(var(--primary))]">
                  आपकी तैयारी शुरू करें — पहला topic चुनें
                </h3>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] max-w-md mx-auto">
                  पाठ्यक्रम का पहला अध्याय पढ़ें, विगत वर्ष के प्रश्न हल करें या क्विज़ देकर आज की पढ़ाई का शुभारंभ करें।
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <Button href={`/exams/${currentExam.id}`} variant="primary" data-testid="button-start-first-topic">
                    पाठ्यक्रम देखें <ArrowRight size={15} />
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {dailyTasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className={`flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between ${
                      task.completed
                        ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))]'
                    }`}
                    id={`planner-task-item-${task.id}`}
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Priority Circle */}
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          task.completed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[hsl(var(--primary))] text-white'
                        }`}
                      >
                        {task.completed ? <Check size={14} /> : idx + 1}
                      </span>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                              badgeToneClasses[task.badgeTone] || badgeToneClasses.primary
                            }`}
                          >
                            {task.badgeText}
                          </span>
                          {task.estimatedQuestions && (
                            <span className="text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
                              ~{task.estimatedQuestions} प्रश्न
                            </span>
                          )}
                          {task.completed && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 size={12} /> आज पूर्ण हुआ
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
                          {task.title}
                        </h3>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed max-w-2xl">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 sm:shrink-0">
                      <Button
                        href={task.actionUrl}
                        variant={task.completed ? 'secondary' : 'primary'}
                        className="min-h-10 text-xs font-bold px-4"
                        data-testid={`button-action-task-${task.id}`}
                      >
                        {task.actionLabel} <ArrowRight size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Continue Learning & Recommended Practice Dual Grid */}
          <div className="mb-10 grid gap-6 lg:grid-cols-2" id="planner-continue-practice-grid">
            {/* Continue Learning Card (Requirement 1 & Module 9 reuse) */}
            <Card className="flex flex-col justify-between p-5 sm:p-6" id="planner-continue-learning-card">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      <BookOpen size={18} />
                    </span>
                    <h3 className="text-base font-bold text-[hsl(var(--primary))]">अध्ययन जारी रखें</h3>
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Smart Continue</span>
                </div>

                {continueItem ? (
                  <div className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)] p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      {continueItem.examName} • {continueItem.subjectName}
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-[hsl(var(--foreground))]">
                      {continueItem.topicName}
                    </h4>
                    <div className="mt-3">
                      <ProgressBar value={continueItem.progress} label="अध्याय प्रगति" />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-[hsl(var(--border))] p-5 text-center text-xs text-[hsl(var(--muted-foreground))]">
                    कोई अधूरा अध्याय नहीं मिला। नीचे दिए गए पाठ्यक्रमों में से नया विषय चुनें।
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-[hsl(var(--border))]">
                <Button
                  href={continueItem ? continueItem.url : `/exams/${currentExam.id}`}
                  variant="primary"
                  className="w-full text-xs font-bold"
                  data-testid="button-planner-continue-learning"
                >
                  {continueItem ? 'अध्ययन जारी रखें' : 'पाठ्यक्रम देखें'} <ArrowRight size={14} />
                </Button>
              </div>
            </Card>

            {/* Recommended Practice & Revision Card (Requirement 1) */}
            <Card className="flex flex-col justify-between p-5 sm:p-6" id="planner-recommended-practice-card">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      <RotateCcw size={18} />
                    </span>
                    <h3 className="text-base font-bold text-[hsl(var(--primary))]">रिवीजन और कमजोर विषय</h3>
                  </div>
                  <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Revision Priority</span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)] p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[hsl(var(--foreground))]">Mistake Book रिवीजन</p>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">पिछली क्विज़ व PYQ में गलत हुए प्रश्नों का अभ्यास</p>
                    </div>
                    <Link
                      href="/mistakes/practice"
                      className="focus-ring rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-bold text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))]"
                      data-testid="link-planner-mistakes-practice"
                    >
                      अभ्यास करें
                    </Link>
                  </div>

                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)] p-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[hsl(var(--foreground))]">कमजोर टॉपिक अभ्यास (Weak Topics)</p>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">जिन विषयों में सटीकता 60% से कम रही है</p>
                    </div>
                    <Link
                      href="/practice/weak-topics"
                      className="focus-ring rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-bold text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))]"
                      data-testid="link-planner-weak-topics"
                    >
                      सुधारें
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[hsl(var(--border))]">
                <Button
                  href="/mistakes"
                  variant="secondary"
                  className="w-full text-xs font-bold"
                  data-testid="button-planner-view-all-mistakes"
                >
                  Mistake Book खोलें <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          </div>

          {/* 5. Today's Achievements / Milestones (Requirement 1 & 16) */}
          <div className="mb-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:p-6 shadow-sm" id="planner-achievements-row">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4 border-b border-[hsl(var(--border))] pb-3">
              <div>
                <h3 className="text-base font-bold text-[hsl(var(--primary))] flex items-center gap-2">
                  <Trophy size={18} className="text-amber-500" /> आज की उपलब्धियां एवं मील के पत्थर (Achievements)
                </h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  निरंतर अध्ययन से अर्जित बैज और आगामी मील के पत्थर
                </p>
              </div>
              <Link
                href="/achievements"
                className="text-xs font-bold text-[hsl(var(--primary))] hover:underline self-start sm:self-auto"
                data-testid="link-planner-view-all-achievements"
              >
                सभी उपलब्धियां देखें &rarr;
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {recentBadges.length > 0 ? (
                recentBadges.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)] p-3"
                  >
                    <span className="text-2xl">{b.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[hsl(var(--foreground))] truncate">{b.title}</p>
                      <p className="text-[11px] text-[hsl(var(--muted-foreground))] truncate">{b.requirement}</p>
                      <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                        अनलाक्ड {b.unlockedAt ? `• ${b.unlockedAt}` : ''}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-4 text-xs text-[hsl(var(--muted-foreground))]">
                  अभी कोई बैज अनलॉक नहीं हुआ है। पहला क्विज़ हल करें और 'First Quiz' बैज अनलॉक करें!
                </div>
              )}
            </div>
          </div>

          {/* 6. Quick Actions (Requirement 17) */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:p-6 shadow-sm" id="planner-quick-actions-bar">
            <h3 className="text-sm font-bold text-[hsl(var(--primary))] mb-1">
              त्वरित अध्ययन क्रियाएं (Quick Actions)
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">
              किसी भी अध्ययन मॉड्यूल पर तुरंत जाने के लिए सीधे बटन का उपयोग करें
            </p>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              <Button
                href={continueItem ? continueItem.url : `/exams/${currentExam.id}`}
                variant="secondary"
                className="text-xs font-bold flex-col h-auto py-2.5"
                data-testid="quick-action-continue"
              >
                <BookOpen size={16} className="text-sky-600 mb-1" />
                <span>Continue</span>
              </Button>

              <Button
                href="/mistakes/practice"
                variant="secondary"
                className="text-xs font-bold flex-col h-auto py-2.5"
                data-testid="quick-action-mistakes"
              >
                <RotateCcw size={16} className="text-rose-600 mb-1" />
                <span>Mistakes</span>
              </Button>

              <Button
                href="/practice/weak-topics"
                variant="secondary"
                className="text-xs font-bold flex-col h-auto py-2.5"
                data-testid="quick-action-weak-topics"
              >
                <AlertTriangle size={16} className="text-amber-600 mb-1" />
                <span>Weak Topics</span>
              </Button>

              <Button
                href="/pyq"
                variant="secondary"
                className="text-xs font-bold flex-col h-auto py-2.5"
                data-testid="quick-action-pyq"
              >
                <ListChecks size={16} className="text-emerald-600 mb-1" />
                <span>Practice PYQ</span>
              </Button>

              <Button
                href="/quiz"
                variant="secondary"
                className="text-xs font-bold flex-col h-auto py-2.5"
                data-testid="quick-action-quiz"
              >
                <HelpCircle size={16} className="text-blue-600 mb-1" />
                <span>Start Quiz</span>
              </Button>

              <Button
                href="/mock-tests"
                variant="secondary"
                className="text-xs font-bold flex-col h-auto py-2.5"
                data-testid="quick-action-mock-test"
              >
                <Trophy size={16} className="text-purple-600 mb-1" />
                <span>Mock Test</span>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* 7. Planner Settings Modal (Requirement 11) */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="planner-settings-modal-title"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3.5">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-[hsl(var(--primary))]" />
                <h3 id="planner-settings-modal-title" className="text-base font-bold text-[hsl(var(--primary))]">
                  प्लानर सेटिंग्स (Planner Settings)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="focus-ring rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="mt-4 space-y-4">
              {/* Daily Question Goal */}
              <div>
                <label className="text-xs font-bold text-[hsl(var(--foreground))]">
                  दैनिक प्रश्न लक्ष्य (Daily Question Goal):
                </label>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] mb-2">
                  प्रत्येक दिन आप कितने प्रश्नों का अभ्यास करना चाहते हैं?
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {DAILY_GOAL_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoalInput(g)}
                      className={`rounded-lg py-2 text-xs font-bold transition-all ${
                        goalInput === g
                          ? 'bg-[hsl(var(--primary))] text-white shadow-xs'
                          : 'border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.3)] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]'
                      }`}
                    >
                      {g} Q
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Exam */}
              <div>
                <label className="text-xs font-bold text-[hsl(var(--foreground))]">
                  प्राथमिकता परीक्षा (Preferred Exam):
                </label>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] mb-2">
                  दैनिक टास्क किस परीक्षा के पाठ्यक्रम से चुने जाएं?
                </p>
                <select
                  value={examInput}
                  onChange={(e) => setExamInput(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-bold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]"
                >
                  {exams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Study Sequence Preference */}
              <div>
                <label className="text-xs font-bold text-[hsl(var(--foreground))]">
                  पसंदीदा अध्ययन क्रम (Study Sequence Preference):
                </label>
                <p className="text-[11px] text-[hsl(var(--muted-foreground))] mb-2">
                  आज की प्राथमिकता सूची में किस प्रकार के कार्य को शीर्ष पर रखना चाहते हैं?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'study_first', label: 'अध्याय पहले (Study First)' },
                    { id: 'pyq_first', label: 'विगत वर्ष प्रश्न पहले (PYQ First)' },
                    { id: 'quiz_first', label: 'क्विज़ पहले (Quiz First)' },
                    { id: 'revision_first', label: 'गलत प्रश्नों का रिवीजन पहले' },
                  ].map((seq) => (
                    <button
                      key={seq.id}
                      type="button"
                      onClick={() => setSequenceInput(seq.id as StudySequencePreference)}
                      className={`rounded-lg p-2.5 text-left text-xs font-semibold transition-all ${
                        sequenceInput === seq.id
                          ? 'border-2 border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)] text-[hsl(var(--primary))] font-bold'
                          : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]'
                      }`}
                    >
                      {seq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[hsl(var(--border))] pt-4">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="focus-ring rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="focus-ring rounded-lg bg-[hsl(var(--primary))] px-5 py-2 text-xs font-bold text-white hover:bg-[hsl(var(--primary)/.9)] shadow-sm"
                  data-testid="button-save-planner-settings"
                >
                  सेटिंग्स सहेजें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
