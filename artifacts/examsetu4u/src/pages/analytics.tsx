import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Award,
  BarChart2,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Flame,
  HelpCircle,
  Lightbulb,
  Lock,
  Minus,
  RotateCcw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { exams, getExam } from '@/data/curriculum';
import {
  DAILY_GOAL_OPTIONS,
  STUDY_TIME_OPTIONS,
  StrengthCategory,
  SubjectStrengthItem,
  TopicPerformanceItem,
  calculatePreparationLevel,
  generateMotivationalInsights,
  getAllAchievements,
  getDailyGoalStatus,
  getPersonalMilestones,
  getQuizPerformanceTrend,
  getSubjectStrengthList,
  getTopicPerformanceList,
  setDailyQuestionGoal,
  setStudyTimeGoal,
} from '@/lib/analytics';
import { calculateIntelligentScore, calculateOverallProgress } from '@/lib/user-progress';

export default function AnalyticsPage() {
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [subjectStrengthFilter, setSubjectStrengthFilter] = useState<string>('all');
  const [topicStrengthFilter, setTopicStrengthFilter] = useState<string>('all');
  const [sortWeakTopicsFirst, setSortWeakTopicsFirst] = useState<boolean>(true);
  const [goalRefreshKey, setGoalRefreshKey] = useState<number>(0);

  // Overall & Intelligent Score
  const overall = useMemo(() => calculateOverallProgress(), [goalRefreshKey]);
  const intelligentScore = useMemo(
    () => calculateIntelligentScore(selectedExamId !== 'all' ? selectedExamId : 'super-tet'),
    [selectedExamId, goalRefreshKey]
  );

  // Preparation Level
  const prepLevel = useMemo(() => calculatePreparationLevel(), [goalRefreshKey]);

  // Daily Goal Status
  const dailyGoal = useMemo(() => getDailyGoalStatus(), [goalRefreshKey]);

  // Motivational Insights
  const insights = useMemo(
    () => generateMotivationalInsights(selectedExamId !== 'all' ? selectedExamId : undefined),
    [selectedExamId, goalRefreshKey]
  );

  // Quiz Performance & Trend
  const quizTrend = useMemo(() => getQuizPerformanceTrend(), [goalRefreshKey]);

  // Subject Strength
  const subjectList = useMemo(
    () => getSubjectStrengthList(selectedExamId !== 'all' ? selectedExamId : undefined),
    [selectedExamId, goalRefreshKey]
  );

  const filteredSubjects = useMemo(() => {
    if (subjectStrengthFilter === 'all') return subjectList;
    return subjectList.filter((s) => s.strength.toLowerCase() === subjectStrengthFilter.toLowerCase());
  }, [subjectList, subjectStrengthFilter]);

  // Topic Performance
  const topicList = useMemo(
    () => getTopicPerformanceList(selectedExamId !== 'all' ? selectedExamId : undefined),
    [selectedExamId, goalRefreshKey]
  );

  const filteredTopics = useMemo(() => {
    let list = [...topicList];
    if (topicStrengthFilter !== 'all') {
      list = list.filter((t) => t.strength.toLowerCase() === topicStrengthFilter.toLowerCase());
    }
    if (sortWeakTopicsFirst) {
      list.sort((a, b) => a.accuracy - b.accuracy);
    } else {
      list.sort((a, b) => b.accuracy - a.accuracy);
    }
    return list;
  }, [topicList, topicStrengthFilter, sortWeakTopicsFirst]);

  // Personal Milestones
  const milestones = useMemo(() => getPersonalMilestones(), [goalRefreshKey]);

  const handleGoalChange = (newGoal: number) => {
    setDailyQuestionGoal(newGoal);
    setGoalRefreshKey((k) => k + 1);
  };

  const handleStudyTimeChange = (minutes: number) => {
    setStudyTimeGoal(minutes);
    setGoalRefreshKey((k) => k + 1);
  };

  const getStrengthBadgeTone = (strength: StrengthCategory) => {
    switch (strength) {
      case 'Strong':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'Good':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
      case 'Needs Improvement':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      case 'Weak':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
    }
  };

  return (
    <Layout>
      {/* Header Section */}
      <section className="paper-grid border-b border-[hsl(var(--border))] py-8 sm:py-12" id="analytics-header">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'होम (Home)', href: '/' },
              { label: 'डैशबोर्ड (Dashboard)', href: '/dashboard' },
              { label: 'प्रदर्शन विश्लेषण (Performance Analytics)' },
            ]}
          />

          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow flex items-center gap-1.5 text-[hsl(var(--primary))]">
                <BarChart3 size={15} /> Real-Time Learning Analytics
              </p>
              <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-[hsl(var(--primary))] sm:text-4xl">
                छात्र प्रदर्शन एवं प्रगति विश्लेषण
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                आपके वास्तविक अध्ययन, PYQ हल और क्विज़ परिणामों पर आधारित पारदर्शी विश्लेषण। अपने मजबूत व कमजोर क्षेत्रों को पहचानें।
              </p>
            </div>

            {/* Exam Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="exam-filter" className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                परीक्षा चुनें:
              </label>
              <select
                id="exam-filter"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="focus-ring rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-semibold text-[hsl(var(--primary))] shadow-sm"
              >
                <option value="all">सभी 8 परीक्षाएं (All Exams)</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
              <Button href="/achievements" variant="secondary" className="text-xs">
                <Trophy size={14} /> उपलब्धियां (Achievements)
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-8 sm:py-12" id="analytics-main-content">
        <Container>
          {/* Top Key Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" id="analytics-overview-cards">
            {/* Intelligent Score Card */}
            <Card className="p-5" id="card-analytics-intelligent-score">
              <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
                <span className="text-xs font-bold uppercase tracking-wider">Intelligent Score</span>
                <Sparkles size={18} className="text-amber-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[hsl(var(--primary))]">
                  {intelligentScore.isBuilding ? '--' : `${intelligentScore.score}`}
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">/ 100</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                {intelligentScore.tierLabel}
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                <div
                  className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
                  style={{ width: `${intelligentScore.isBuilding ? intelligentScore.buildingProgress : intelligentScore.score}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                {intelligentScore.isBuilding ? 'डेटा संचय जारी (Building)' : '5 घटकों पर आधारित मूल्यांकन'}
              </p>
            </Card>

            {/* Overall Progress */}
            <Card className="p-5" id="card-analytics-syllabus-progress">
              <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
                <span className="text-xs font-bold uppercase tracking-wider">पाठ्यक्रम कवरेज</span>
                <BookOpen size={18} className="text-sky-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[hsl(var(--primary))]">{overall.overallPercentage}%</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">समग्र पूर्ण</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                {overall.studyMaterialsCompleted} / {overall.totalStudyMaterials} अध्याय पूर्ण
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                <div
                  className="h-full rounded-full bg-sky-600 transition-all duration-500"
                  style={{ width: `${overall.overallPercentage}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                स्टडी नोट्स + PYQ + क्विज़ आधारित
              </p>
            </Card>

            {/* Questions Attempted & Accuracy */}
            <Card className="p-5" id="card-analytics-questions-accuracy">
              <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
                <span className="text-xs font-bold uppercase tracking-wider">कुल प्रश्न एवं सटीकता</span>
                <Target size={18} className="text-emerald-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[hsl(var(--primary))]">{overall.totalQuestionsAttempted}</span>
                <span className="text-xs font-bold text-emerald-600">({overall.overallAccuracy}% सटीकता)</span>
              </div>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                <span className="font-semibold text-emerald-600">{overall.totalQuestionsCorrect} सही</span> ·{' '}
                <span className="font-semibold text-rose-500">{overall.totalQuestionsAttempted - overall.totalQuestionsCorrect} गलत</span>
              </p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${overall.overallAccuracy}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                PYQ ({overall.pyqsAttempted}) + क्विज़ ({overall.quizQuestionsAttempted})
              </p>
            </Card>

            {/* Learning Streak */}
            <Card className="p-5" id="card-analytics-learning-streak">
              <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
                <span className="text-xs font-bold uppercase tracking-wider">अध्ययन निरंतरता (Streak)</span>
                <Flame size={18} className="text-orange-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[hsl(var(--primary))]">{overall.learningStreakDays}</span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">दिन लगातार</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-orange-600">
                {overall.learningStreakDays >= 7 ? 'शानदार साप्ताहिक लकीर!' : 'दैनिक अभ्यास बनाए रखें'}
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => (
                  <div
                    key={dayNum}
                    className={`h-2 flex-1 rounded-full ${
                      dayNum <= overall.learningStreakDays ? 'bg-orange-500' : 'bg-[hsl(var(--secondary))]'
                    }`}
                    title={`Day ${dayNum}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-[11px] text-[hsl(var(--muted-foreground))]">
                लक्ष्य: 7 दिवसीय निरंतर अध्ययन
              </p>
            </Card>
          </div>

          {/* Section: Preparation Level Banner */}
          <Card className="mt-6 border-l-4 border-l-[hsl(var(--primary))] p-6 shadow-sm" id="card-preparation-level">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[hsl(var(--secondary))] px-3 py-0.5 text-xs font-bold text-[hsl(var(--primary))]">
                    {prepLevel.badge}
                  </span>
                  <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                    तैयारी स्तर (Level {prepLevel.levelNumber} of 6)
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-[hsl(var(--primary))]">
                  {prepLevel.levelName}
                </h2>
                <p className="max-w-2xl text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                  {prepLevel.description}
                </p>
              </div>

              <div className="min-w-[280px] rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.2)] p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[hsl(var(--muted-foreground))]">
                    {prepLevel.nextLevelName ? `अगले स्तर (${prepLevel.nextLevelName}) की ओर:` : 'अधिकतम स्तर प्राप्त'}
                  </span>
                  <span className="font-bold text-[hsl(var(--primary))]">{prepLevel.progressToNext}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
                    style={{ width: `${prepLevel.progressToNext}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] font-medium leading-4 text-[hsl(var(--muted-foreground))]">
                  {prepLevel.requirementsText}
                </p>
              </div>
            </div>
          </Card>

          {/* Section: Daily Learning Goals & Motivational Insights */}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {/* Daily Goal Widget */}
            <Card className="p-6 lg:col-span-1" id="card-daily-learning-goal">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                    <Target size={18} />
                  </div>
                  <h3 className="font-bold text-[hsl(var(--primary))]">आज का दैनिक लक्ष्य</h3>
                </div>
                {dailyGoal.isCompleted ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    पूर्ण 🎉
                  </span>
                ) : (
                  <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                    प्रगति में
                  </span>
                )}
              </div>

              {/* Progress Count */}
              <div className="mt-5 text-center">
                <p className="text-4xl font-bold text-[hsl(var(--primary))]">
                  {dailyGoal.todayQuestionsAttempted} <span className="text-xl text-[hsl(var(--muted-foreground))]">/ {dailyGoal.targetQuestions}</span>
                </p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  आज हल किए गए प्रश्न (PYQ + Quiz)
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="h-3 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      dailyGoal.isCompleted ? 'bg-emerald-600' : 'bg-[hsl(var(--primary))]'
                    }`}
                    style={{ width: `${dailyGoal.percentage}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                  <span>{dailyGoal.percentage}% पूर्ण</span>
                  <span>{dailyGoal.isCompleted ? 'दैनिक लक्ष्य हासिल!' : `${dailyGoal.remaining} प्रश्न शेष`}</span>
                </div>
              </div>

              {/* Goal Selector */}
              <div className="mt-6 border-t border-[hsl(var(--border))] pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  दैनिक प्रश्न लक्ष्य बदलें:
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {DAILY_GOAL_OPTIONS.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleGoalChange(num)}
                      className={`focus-ring flex-1 rounded-md py-1.5 text-xs font-bold transition ${
                        dailyGoal.targetQuestions === num
                          ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                          : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'
                      }`}
                      id={`button-set-goal-${num}`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Time Goal */}
              <div className="mt-4 border-t border-[hsl(var(--border))] pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  दैनिक अध्ययन समय लक्ष्य:
                </label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {STUDY_TIME_OPTIONS.map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => handleStudyTimeChange(min)}
                      className={`focus-ring rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                        dailyGoal.selectedStudyTimeGoalMinutes === min
                          ? 'bg-[hsl(var(--secondary))] font-bold text-[hsl(var(--primary))]'
                          : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'
                      }`}
                    >
                      {min} मिनट
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 text-[11px] leading-4 text-[hsl(var(--muted-foreground))] italic">
                  * Study time tracking will be enhanced in a future version.
                </p>
              </div>
            </Card>

            {/* Motivational & Diagnostic Insights */}
            <div className="space-y-3 lg:col-span-2" id="panel-motivational-insights">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-base font-bold text-[hsl(var(--primary))]">
                  <Lightbulb size={18} className="text-amber-500" />
                  प्रेरक एवं सुधारात्मक सुझाव (Actionable Insights)
                </h3>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">वास्तविक डेटा आधारित</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {insights.map((item) => (
                  <Card key={item.id} className="flex flex-col justify-between p-4" id={`insight-${item.id}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        {item.tone === 'success' && <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />}
                        {item.tone === 'warning' && <AlertTriangle size={16} className="text-amber-600 shrink-0" />}
                        {item.tone === 'info' && <Zap size={16} className="text-sky-600 shrink-0" />}
                        {item.tone === 'primary' && <Target size={16} className="text-[hsl(var(--primary))] shrink-0" />}
                        <h4 className="text-sm font-bold text-[hsl(var(--primary))]">{item.title}</h4>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                        {item.message}
                      </p>
                    </div>
                    {item.actionLabel && item.actionUrl && (
                      <div className="mt-3 border-t border-[hsl(var(--border))] pt-2">
                        <Link
                          href={item.actionUrl}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))] hover:underline"
                        >
                          {item.actionLabel} <ChevronRight size={13} />
                        </Link>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Quiz Performance & Trend */}
          <div className="mt-10" id="section-quiz-performance-trend">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow">क्विज़ प्रदर्शन रुझान</p>
                <h2 className="font-display text-2xl font-bold text-[hsl(var(--primary))]">
                  MCQ क्विज़ विस्तृत विश्लेषण
                </h2>
              </div>
              <Button href="/quiz" variant="secondary" className="text-xs">
                नया क्विज़ प्रारंभ करें
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-4" id="stat-quiz-total-completed">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  कुल क्विज़ संपन्न
                </span>
                <p className="mt-1 text-2xl font-bold text-[hsl(var(--primary))]">{quizTrend.totalQuizzes}</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  {quizTrend.totalQuestions} प्रश्न पूछे गए
                </p>
              </Card>

              <Card className="p-4" id="stat-quiz-average-score">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  औसत प्राप्तांक (Avg %)
                </span>
                <p className="mt-1 text-2xl font-bold text-[hsl(var(--primary))]">{quizTrend.averageScore}%</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  सटीकता: {quizTrend.averageAccuracy}%
                </p>
              </Card>

              <Card className="p-4" id="stat-quiz-best-score">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  सर्वश्रेष्ठ क्विज़ स्कोर
                </span>
                <p className="mt-1 text-2xl font-bold text-emerald-600">{quizTrend.bestScore}%</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  व्यक्तिगत उच्चतम
                </p>
              </Card>

              <Card className="p-4" id="stat-quiz-correct-ratio">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  सही बनाम गलत
                </span>
                <p className="mt-1 text-2xl font-bold text-[hsl(var(--primary))]">
                  <span className="text-emerald-600">{quizTrend.totalCorrect}</span> /{' '}
                  <span className="text-rose-500">{quizTrend.totalIncorrect}</span>
                </p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  अनुत्तरित: {quizTrend.totalUnanswered}
                </p>
              </Card>
            </div>

            {/* Quiz Trend Timeline Card */}
            <Card className="mt-4 p-6" id="card-quiz-trend-timeline">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--primary))]">
                    हालिया क्विज़ का प्रदर्शन रुझान (Last Recent Quizzes)
                  </h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    आपके पिछले क्विज़ टेस्टों के प्रतिशत स्कोर
                  </p>
                </div>

                {quizTrend.hasEnoughData && (
                  <div className="flex items-center gap-2">
                    {quizTrend.trendDirection === 'improving' && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <TrendingUp size={14} /> सुधार की ओर (+{quizTrend.trendDiffPercentage}%)
                      </span>
                    )}
                    {quizTrend.trendDirection === 'declining' && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <TrendingDown size={14} /> गिरावट दर्ज ({quizTrend.trendDiffPercentage}%)
                      </span>
                    )}
                    {quizTrend.trendDirection === 'steady' && (
                      <span className="flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                        <Minus size={14} /> स्थिर प्रदर्शन (Consistent)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {!quizTrend.hasEnoughData ? (
                <div className="mt-6 rounded-lg border border-dashed border-[hsl(var(--border))] py-8 text-center" id="notice-insufficient-quiz-data">
                  <BarChart2 size={32} className="mx-auto text-[hsl(var(--muted-foreground))] opacity-50" />
                  <p className="mt-2 text-sm font-semibold text-[hsl(var(--primary))]">
                    रुझान विश्लेषण के लिए अधिक डेटा आवश्यक है
                  </p>
                  <p className="mx-auto mt-1 max-w-md text-xs text-[hsl(var(--muted-foreground))]">
                    Complete more quizzes to see your performance trend. कम से कम 2 क्विज़ संपन्न करने पर आपका प्रदर्शन रुझान यहाँ प्रदर्शित होगा।
                  </p>
                  <Button href="/quiz" className="mt-4 text-xs">
                    अभी क्विज़ हल करें
                  </Button>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {quizTrend.recentQuizzes.map((quiz, idx) => (
                      <div
                        key={quiz.attemptId || idx}
                        className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm"
                        id={`quiz-trend-item-${idx}`}
                      >
                        <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                          <span>{new Date(quiz.date).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}</span>
                          <span className="font-bold text-[hsl(var(--primary))]">
                            {quiz.score} / {quiz.total} अंक
                          </span>
                        </div>
                        <h4 className="mt-2 truncate text-sm font-bold text-[hsl(var(--primary))]">
                          {quiz.topicName}
                        </h4>
                        <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                          {quiz.subjectName}
                        </p>

                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[hsl(var(--muted-foreground))]">प्रतिशत</span>
                            <span
                              className={`font-bold ${
                                quiz.percentage >= 75
                                  ? 'text-emerald-600'
                                  : quiz.percentage >= 50
                                  ? 'text-amber-600'
                                  : 'text-rose-500'
                              }`}
                            >
                              {quiz.percentage}%
                            </span>
                          </div>
                          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                quiz.percentage >= 75
                                  ? 'bg-emerald-600'
                                  : quiz.percentage >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${quiz.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Section: Subject Strength Analysis */}
          <div className="mt-12" id="section-subject-strength">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">विषयवार मजबूती विश्लेषण</p>
                <h2 className="font-display text-2xl font-bold text-[hsl(var(--primary))]">
                  Subject Strength Categorization
                </h2>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  वर्गीकरण: Strong (85-100%), Good (70-84%), Needs Improvement (50-69%), Weak (0-49%)
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1.5" id="tabs-subject-strength-filter">
                {['all', 'weak', 'needs improvement', 'good', 'strong'].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSubjectStrengthFilter(filter)}
                    className={`focus-ring rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                      subjectStrengthFilter === filter
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                        : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'
                    }`}
                  >
                    {filter === 'all' ? 'सभी विषय' : filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" id="grid-subject-strength-cards">
              {filteredSubjects.map((subj) => (
                <Card key={`${subj.examId}-${subj.subjectId}`} className="flex flex-col justify-between p-5" id={`subject-card-${subj.subjectId}`}>
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                        {subj.examName}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStrengthBadgeTone(
                          subj.strength
                        )}`}
                      >
                        {subj.strength}
                      </span>
                    </div>

                    <h3 className="mt-2 text-base font-bold text-[hsl(var(--primary))]">
                      {subj.subjectName}
                    </h3>

                    <div className="mt-4 grid grid-cols-2 gap-2 border-y border-[hsl(var(--border))] py-3 text-xs">
                      <div>
                        <span className="text-[hsl(var(--muted-foreground))]">सटीकता (Accuracy):</span>
                        <p className="mt-0.5 font-bold text-[hsl(var(--primary))]">{subj.accuracy}%</p>
                      </div>
                      <div>
                        <span className="text-[hsl(var(--muted-foreground))]">हल किए प्रश्न:</span>
                        <p className="mt-0.5 font-bold text-[hsl(var(--primary))]">
                          {subj.questionsAttempted} ({subj.questionsCorrect} सही)
                        </p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                        <span>अध्ययन सामग्री पूर्ण:</span>
                        <span className="font-semibold text-[hsl(var(--primary))]">{subj.studyPercent}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                        <div
                          className="h-full rounded-full bg-[hsl(var(--primary))]"
                          style={{ width: `${subj.studyPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-[hsl(var(--border))] pt-4">
                    <Button href={subj.url} variant="secondary" className="flex-1 text-xs">
                      विषय सामग्री
                    </Button>
                    <Button href={subj.quizUrl} className="flex-1 text-xs">
                      क्विज़ अभ्यास
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Section: Topic Performance */}
          <div className="mt-12" id="section-topic-performance">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">अध्यायवार प्रदर्शन</p>
                <h2 className="font-display text-2xl font-bold text-[hsl(var(--primary))]">
                  Topic-Level Detailed Performance
                </h2>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  जिन विषयों पर आपने अध्ययन किया है या प्रश्न हल किए हैं उनकी विस्तृत सूची।
                </p>
              </div>

              {/* Sorting & Filter controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSortWeakTopicsFirst(!sortWeakTopicsFirst)}
                  className="focus-ring flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--primary))] shadow-sm"
                  id="button-toggle-weak-topics-first"
                >
                  <AlertTriangle size={13} className="text-amber-500" />
                  {sortWeakTopicsFirst ? 'कमजोर क्षेत्र पहले (Weak Areas First)' : 'उच्च स्कोर पहले'}
                </button>

                <div className="flex flex-wrap gap-1">
                  {['all', 'weak', 'needs improvement', 'good', 'strong'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTopicStrengthFilter(cat)}
                      className={`focus-ring rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                        topicStrengthFilter === cat
                          ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                          : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      {cat === 'all' ? 'सभी टॉपिक' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredTopics.length === 0 ? (
              <Card className="mt-6 p-8 text-center" id="card-no-topic-data">
                <BookOpen size={32} className="mx-auto text-[hsl(var(--muted-foreground))] opacity-50" />
                <h3 className="mt-2 text-base font-bold text-[hsl(var(--primary))]">कोई अध्याय डेटा नहीं मिला</h3>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  चुने गए फिल्टर के लिए कोई टॉपिक रिकॉर्ड नहीं है। स्टडी मटेरियल पढ़ें या क्विज़ अभ्यास करें।
                </p>
                <Button href="/study-material" className="mt-4 text-xs">
                  स्टडी मटेरियल देखें
                </Button>
              </Card>
            ) : (
              <div className="mt-6 space-y-3" id="list-topic-performance">
                {filteredTopics.map((topic) => (
                  <Card
                    key={topic.topicId}
                    className="flex flex-col gap-4 p-4 transition hover:border-[hsl(var(--primary))] sm:flex-row sm:items-center sm:justify-between"
                    id={`topic-item-${topic.topicId}`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">
                          {topic.examName} · {topic.subjectName}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStrengthBadgeTone(
                            topic.strength
                          )}`}
                        >
                          {topic.strength}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[hsl(var(--primary))]">
                        {topic.topicName}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 sm:justify-end">
                      <div className="text-right">
                        <span className="text-[11px] text-[hsl(var(--muted-foreground))]">सटीकता</span>
                        <p
                          className={`text-base font-bold ${
                            topic.accuracy >= 70
                              ? 'text-emerald-600'
                              : topic.accuracy >= 50
                              ? 'text-amber-600'
                              : 'text-rose-500'
                          }`}
                        >
                          {topic.accuracy}%
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-[hsl(var(--muted-foreground))]">अध्ययन पूर्ण</span>
                        <p className="text-base font-bold text-[hsl(var(--primary))]">{topic.studyProgress}%</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button href={topic.url} variant="secondary" className="px-3 py-1.5 text-xs">
                          नोट्स
                        </Button>
                        <Button href={topic.quizUrl} className="px-3 py-1.5 text-xs">
                          क्विज़ दें
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Section: Personal Milestones */}
          <div className="mt-12" id="section-personal-milestones">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">अध्ययन मील के पत्थर</p>
                <h2 className="font-display text-2xl font-bold text-[hsl(var(--primary))]">
                  व्यक्तिगत मील के पत्थर (Personal Milestones)
                </h2>
              </div>
              <span className="text-xs font-bold text-[hsl(var(--primary))]">
                {milestones.filter((m) => m.isAchieved).length} / {milestones.length} प्राप्त
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" id="grid-personal-milestones">
              {milestones.map((m) => (
                <Card
                  key={m.id}
                  className={`p-5 transition ${
                    m.isAchieved
                      ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                      : 'opacity-70'
                  }`}
                  id={`milestone-card-${m.id}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{m.icon}</span>
                    {m.isAchieved ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 size={12} /> {m.achievedAt || 'पूर्ण'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
                        <Lock size={12} /> प्रगति पर
                      </span>
                    )}
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-[hsl(var(--primary))]">{m.title}</h4>
                  <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{m.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
