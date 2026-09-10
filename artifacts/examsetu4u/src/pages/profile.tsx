import { AlertTriangle, ArrowRight, Award, BookOpen, Calendar, Check, CheckCircle2, ChevronRight, Edit2, Flame, Info, LogOut, RefreshCw, RotateCcw, Sparkles, Target, Trophy, User, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Breadcrumbs, ProgressBar } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { exams, getExam } from '@/data/curriculum';
import { DEFAULT_AVATAR_COLORS, getInitials, useAuth } from '@/lib/auth';
import { calculatePreparationLevel, getAllAchievements, getDailyGoalStatus } from '@/lib/analytics';
import { calculateIntelligentScore, calculateOverallProgress, clearAllProgress, getContinueLearning, getWeakAreas, seedDemoProgress } from '@/lib/user-progress';

export function ProfilePage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, profile, updateProfile, logout } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name || user?.name || '');
  const [bioInput, setBioInput] = useState(profile?.bio || '');
  const [examInput, setExamInput] = useState(profile?.preferredExamId || 'super-tet');
  const [colorInput, setColorInput] = useState(profile?.avatarColor || DEFAULT_AVATAR_COLORS[0].value);
  const [notification, setNotification] = useState<string | null>(null);

  const overall = useMemo(() => calculateOverallProgress(), []);
  const preferredExamId = profile?.preferredExamId || 'super-tet';
  const intelligentScore = useMemo(() => calculateIntelligentScore(preferredExamId), [preferredExamId]);
  const prepLevel = useMemo(() => calculatePreparationLevel(), []);
  const achievements = useMemo(() => getAllAchievements(), []);
  const unlockedBadges = useMemo(() => achievements.filter((a) => a.isUnlocked), [achievements]);
  const dailyGoal = useMemo(() => getDailyGoalStatus(), []);
  const continueItem = useMemo(() => getContinueLearning(), []);
  const weakAreas = useMemo(() => getWeakAreas(preferredExamId), [preferredExamId]);
  const weakestTopic = weakAreas.length > 0 ? weakAreas[0] : null;

  const currentExam = getExam(preferredExamId);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: nameInput.trim(),
      bio: bioInput.trim(),
      preferredExamId: examInput,
      avatarColor: colorInput,
    });
    setIsEditing(false);
    showNotice('प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!');
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSeedDemo = () => {
    seedDemoProgress();
    showNotice('डेमो प्रगति और स्कोर सफलतापूर्वक लोड किए गए!');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleResetProgress = () => {
    if (window.confirm('क्या आप अपनी सभी अध्ययन प्रगति, PYQ रिकॉर्ड और क्विज़ इतिहास रीसेट करना चाहते हैं?')) {
      clearAllProgress();
      showNotice('सभी प्रगति रीसेट कर दी गई है।');
      setTimeout(() => {
        window.location.reload();
      }, 600);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  const displayName = profile?.name || user?.name || 'शिक्षार्थी';
  const displayEmail = profile?.email || user?.email || 'demo@examsetu4u.com';
  const initials = getInitials(displayName);

  return (
    <Layout>
      <section className="paper-grid border-b border-[hsl(var(--border))] py-8 sm:py-12">
        <Container>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'User Profile' }]} />
          
          <div className="mt-7 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: profile?.avatarColor || DEFAULT_AVATAR_COLORS[0].value }}
                data-testid="avatar-user"
              >
                {initials}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-[hsl(var(--primary))]">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--accent)/.2)] px-3 py-1 text-xs font-bold text-[hsl(var(--accent-foreground))]">
                    <Flame size={14} className="text-amber-600" /> {profile?.learningStreak || 1} Day Streak
                  </span>
                </div>
                <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                  {displayEmail} • सदस्य बने: {profile?.joinedDate || 'हाल ही में'}
                </p>
                {profile?.bio && (
                  <p className="mt-2 max-w-xl text-xs leading-5 text-[hsl(var(--foreground))] italic">
                    "{profile.bio}"
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setNameInput(profile?.name || user?.name || '');
                  setBioInput(profile?.bio || '');
                  setExamInput(profile?.preferredExamId || 'super-tet');
                  setColorInput(profile?.avatarColor || DEFAULT_AVATAR_COLORS[0].value);
                  setIsEditing(true);
                }}
                data-testid="button-edit-profile"
              >
                <Edit2 size={15} /> प्रोफ़ाइल संपादित करें
              </Button>
              <Button href="/dashboard" variant="primary" data-testid="button-view-dashboard">
                डैशबोर्ड खोलें <ArrowRight size={15} />
              </Button>
              <button
                type="button"
                onClick={handleLogout}
                className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:border-[#bb685c] hover:bg-[#f8e9e5] hover:text-[#a34f46]"
                data-testid="button-profile-logout"
              >
                <LogOut size={14} /> लॉगआउट
              </button>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          {notification && (
            <div
              className="mb-8 flex items-center gap-2 rounded-xl border border-[#5b9274] bg-[#e7f1e9] p-4 text-xs font-bold text-[#347052]"
              role="alert"
              data-testid="notice-profile-success"
            >
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Edit Profile Modal / Form */}
          {isEditing && (
            <Card className="mb-10 p-6 sm:p-8 border-[hsl(var(--accent))]" data-testid="card-edit-profile-form">
              <div className="flex items-center justify-between pb-4 border-b border-[hsl(var(--border))]">
                <h2 className="text-lg font-bold text-[hsl(var(--primary))] flex items-center gap-2">
                  <Edit2 size={18} /> प्रोफ़ाइल विवरण संपादित करें
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-[hsl(var(--muted-foreground))] hover:underline"
                >
                  रद्द करें
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">
                      पूरा नाम
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      required
                      className="focus-ring mt-1.5 min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">
                      प्राथमिक लक्ष्य परीक्षा (Target Exam)
                    </label>
                    <select
                      value={examInput}
                      onChange={(e) => setExamInput(e.target.value)}
                      className="focus-ring mt-1.5 min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm outline-none"
                    >
                      {exams.map((exam) => (
                        <option key={exam.id} value={exam.id}>
                          {exam.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">
                    परिचय / बायो (Bio)
                  </label>
                  <textarea
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    rows={2}
                    placeholder="उदा. शिक्षक भर्ती परीक्षा की तैयारी..."
                    className="focus-ring mt-1.5 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">
                    अवतार रंग चुनें (Avatar Color)
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2.5">
                    {DEFAULT_AVATAR_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setColorInput(c.value)}
                        className={`h-9 w-9 rounded-xl transition-transform ${colorInput === c.value ? 'scale-110 ring-2 ring-[hsl(var(--primary))] ring-offset-2' : 'hover:scale-105'}`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[hsl(var(--border))]">
                  <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                    रद्द करें
                  </Button>
                  <Button type="submit" variant="primary" data-testid="button-save-profile">
                    <Check size={16} /> सहेजें (Save Changes)
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Quick Metrics Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5" data-testid="card-profile-intelligent-score">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Intelligent Score
                </span>
                <Sparkles size={18} className="text-amber-500" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-[hsl(var(--primary))]">
                {intelligentScore.isBuilding ? 'निर्माणाधीन' : `${intelligentScore.score}/100`}
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                {intelligentScore.tierLabel}
              </p>
            </Card>

            <Card className="p-5" data-testid="card-profile-accuracy">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  समग्र सटीकता (Accuracy)
                </span>
                <Target size={18} className="text-emerald-600" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-[hsl(var(--primary))]">
                {overall.overallAccuracy}%
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                {overall.totalQuestionsCorrect}/{overall.totalQuestionsAttempted} प्रश्न सही
              </p>
            </Card>

            <Card className="p-5" data-testid="card-profile-materials">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  नोट्स पूर्णता
                </span>
                <BookOpen size={18} className="text-blue-600" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-[hsl(var(--primary))]">
                {overall.studyMaterialsCompleted}
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                {overall.totalStudyMaterials} में से पूर्ण अध्याय
              </p>
            </Card>

            <Card className="p-5" data-testid="card-profile-quizzes">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  क्विज़ सत्र
                </span>
                <Award size={18} className="text-purple-600" />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-[hsl(var(--primary))]">
                {overall.quizzesCompleted}
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                सर्वश्रेष्ठ स्कोर: {overall.quizBestScore}%
              </p>
            </Card>
          </div>

          {/* Preparation Level & Achievements Banner in Profile */}
          <div className="mt-8 grid gap-6 md:grid-cols-2" id="profile-prep-and-achievements">
            <Card className="p-6 border-l-4 border-l-[hsl(var(--primary))]" id="profile-card-prep-level">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-0.5 text-xs font-bold text-[hsl(var(--primary))]">
                  {prepLevel.badge}
                </span>
                <Link href="/analytics" className="text-xs font-bold text-[hsl(var(--primary))] hover:underline flex items-center gap-0.5">
                  विस्तृत विश्लेषण <ChevronRight size={13} />
                </Link>
              </div>

              <h3 className="mt-3 text-lg font-bold text-[hsl(var(--primary))]">
                तैयारी स्तर: {prepLevel.levelName} (Level {prepLevel.levelNumber}/6)
              </h3>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
                {prepLevel.requirementsText}
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                  <span>अगले स्तर की ओर:</span>
                  <span className="font-bold text-[hsl(var(--primary))]">{prepLevel.progressToNext}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--primary))]"
                    style={{ width: `${prepLevel.progressToNext}%` }}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6" id="profile-card-achievements">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-amber-500" />
                  <h3 className="text-base font-bold text-[hsl(var(--primary))]">अर्जित पदक (Badges)</h3>
                </div>
                <Link href="/achievements" className="text-xs font-bold text-[hsl(var(--primary))] hover:underline flex items-center gap-0.5">
                  सभी पदक ({unlockedBadges.length}/{achievements.length}) <ChevronRight size={13} />
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {achievements.map((badge) => (
                  <div
                    key={badge.id}
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border text-xl shadow-2xs transition ${
                      badge.isUnlocked
                        ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))] opacity-35 grayscale'
                    }`}
                    title={`${badge.title} (${badge.isUnlocked ? 'अनलॉक' : 'लॉक: ' + badge.requirement})`}
                  >
                    {badge.icon}
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs text-[hsl(var(--muted-foreground))]">
                {unlockedBadges.length > 0
                  ? `शानदार! आपने ${unlockedBadges.length} पदक अर्जित किए हैं। बाकी अनलॉक करने के लिए अभ्यास जारी रखें।`
                  : 'पहला क्विज़ या PYQ हल करके अपना पहला पदक अनलॉक करें!'}
              </p>
            </Card>
          </div>

          {/* Account Details & Preferences */}
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6" id="card-your-preparation">
                <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
                  <h2 className="text-base font-bold text-[hsl(var(--primary))] flex items-center gap-2">
                    <Target size={18} className="text-[hsl(var(--accent-foreground))]" />
                    आपकी परीक्षा तैयारी (Your Preparation)
                  </h2>
                  <span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-0.5 text-xs font-bold text-[hsl(var(--primary))]">
                    {currentExam?.name || 'Super TET'}
                  </span>
                </div>

                {/* Preferred Exam Overview */}
                <div className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.4)] p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">चयनित प्राथमिक परीक्षा</p>
                      <p className="text-base font-bold text-[hsl(var(--primary))]">{currentExam?.name || 'Super TET'}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{currentExam?.description}</p>
                    </div>
                    <Button href={`/exams/${currentExam?.id}`} variant="secondary" className="text-xs min-h-9 px-3 shrink-0">
                      सिलेबस खोलें <ArrowRight size={13} />
                    </Button>
                  </div>
                </div>

                {/* Continue Learning Item */}
                <div className="mt-5 rounded-xl border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--card))] p-4 shadow-2xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--accent))]">
                        <Play size={14} className="fill-current" />
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                          अध्ययन जारी रखें (Continue Learning)
                        </span>
                        <p className="text-xs font-bold text-[hsl(var(--primary))] mt-0.5">
                          {continueItem ? continueItem.topicName : 'शिक्षण का अर्थ एवं परिभाषा (प्रारंभिक अध्याय)'}
                        </p>
                        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                          {continueItem
                            ? `${continueItem.examName} • ${continueItem.subjectName} • ${continueItem.progress}% पूर्ण`
                            : 'Super TET • शिक्षण कौशल • अभी शुरू करें'}
                        </p>
                      </div>
                    </div>
                    <Button
                      href={continueItem ? continueItem.url : `/study-material/${currentExam?.id}/teaching-skills/teaching-meaning`}
                      variant="primary"
                      className="text-xs h-8 px-3 shrink-0"
                    >
                      पढ़ें <ArrowRight size={12} />
                    </Button>
                  </div>
                </div>

                {/* Weakest Subject / Topic & Suggested Next Action */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                      <AlertTriangle size={14} />
                      <span>कमजोर विषय / टॉपिक (Weak Area)</span>
                    </div>
                    {weakestTopic ? (
                      <div className="mt-2">
                        <p className="text-xs font-bold text-[hsl(var(--primary))]">{weakestTopic.topicName}</p>
                        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                          {weakestTopic.subjectName} • सटीकता: {weakestTopic.accuracy}% ({weakestTopic.incorrectCount} गलत)
                        </p>
                        <Link
                          href={weakestTopic.actionUrl}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--accent-foreground))] hover:underline"
                        >
                          पुनः अभ्यास करें →
                        </Link>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                        उत्कृष्ट! कोई गंभीर कमजोर क्षेत्र नहीं मिला।
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))]">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>सुझाया गया अगला कदम (Suggested Action)</span>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-[hsl(var(--foreground))]">
                      {weakestTopic
                        ? `"${weakestTopic.topicName}" का अभ्यास करके सटीकता बढ़ाएं।`
                        : continueItem
                        ? `"${continueItem.topicName}" को पूरा करके 100% अंक सुरक्षित करें।`
                        : 'दैनिक क्विज़ देकर अपना इंटेलिजेंट स्कोर बढ़ाएं।'}
                    </p>
                    <Link
                      href={weakestTopic ? weakestTopic.actionUrl : continueItem ? continueItem.url : '/quiz'}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--primary))] hover:underline"
                    >
                      शुरू करें <ChevronRight size={12} />
                    </Link>
                  </div>
                </div>

                {/* Daily Goal Progress from Module 7 */}
                <div className="mt-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.3)] p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[hsl(var(--primary))] flex items-center gap-1.5">
                      <Target size={14} /> दैनिक लक्ष्य (Daily Goal)
                    </span>
                    <span className="font-bold text-[hsl(var(--primary))]">
                      {dailyGoal.todayQuestionsAttempted} / {dailyGoal.targetQuestions} प्रश्न ({dailyGoal.percentage}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                    <div
                      className={`h-full rounded-full transition-all ${dailyGoal.isCompleted ? 'bg-emerald-600' : 'bg-[hsl(var(--primary))]'}`}
                      style={{ width: `${dailyGoal.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Overall Progress Breakdown */}
                <div className="mt-6 border-t border-[hsl(var(--border))] pt-5">
                  <h3 className="text-sm font-bold text-[hsl(var(--primary))]">तैयारी प्रगति सारांश (Overall Progress)</h3>
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span>अध्ययन सामग्री (Study Materials)</span>
                        <span>{overall.studyCompletionPercent}%</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                        <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${overall.studyCompletionPercent}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span>PYQ प्रश्न अभ्यास (Previous Year Questions)</span>
                        <span>{overall.pyqAccuracy}% Accuracy</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                        <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${overall.pyqAccuracy}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span>MCQ क्विज़ प्रदर्शन (Quiz Performance)</span>
                        <span>{overall.quizAccuracy}% Accuracy</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                        <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${overall.quizAccuracy}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Data & Testing Tools */}
              <Card className="p-6 border-dashed" data-testid="card-profile-tools">
                <h2 className="text-base font-bold text-[hsl(var(--primary))] flex items-center gap-2">
                  <RefreshCw size={17} /> डेटा एवं परीक्षण उपकरण (Data Utilities)
                </h2>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                  ExamSetu4U के इंटेलिजेंट प्रोग्रेस और स्कोरिंग इंजन का त्वरित परीक्षण करने के लिए नीचे दिए गए टूल्स का उपयोग करें।
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSeedDemo}
                    className="text-xs"
                    data-testid="button-seed-demo-progress"
                  >
                    <Sparkles size={14} className="text-amber-500" /> डेमो डेटा लोड करें (Seed Demo Progress)
                  </Button>

                  <button
                    type="button"
                    onClick={handleResetProgress}
                    className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3.5 text-xs font-bold text-[hsl(var(--muted-foreground))] hover:border-[#bb685c] hover:bg-[#f8e9e5] hover:text-[#a34f46]"
                    data-testid="button-reset-all-progress"
                  >
                    <RotateCcw size={14} /> सभी प्रगति रीसेट करें (Clean State)
                  </button>
                </div>
              </Card>
            </div>

            {/* Right column: Info & Security */}
            <div className="space-y-6">
              <Card className="p-5 bg-[hsl(var(--secondary)/.3)]">
                <h3 className="text-sm font-bold text-[hsl(var(--primary))] flex items-center gap-2">
                  <Info size={16} className="text-[hsl(var(--accent-foreground))]" /> स्थानीय भंडारण सूचना
                </h3>
                <p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                  यह प्लेटफ़ॉर्म वर्तमान में <strong>Module 6 Frontend Architecture</strong> पर चल रहा है।
                  सभी उपयोगकर्ता प्राथमिकताएँ, बुकमार्क और प्रश्न इतिहास इस डिवाइस के localStorage में सुरक्षित हैं।
                </p>
                <div className="mt-4 rounded-lg bg-[hsl(var(--card))] p-3 text-[11px] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]">
                  <strong>भविष्य की सुरक्षा:</strong> वास्तविक क्लाउड बैकएंड जोड़ने पर यह डेटा बिना किसी व्यवधान के स्वचालित रूप से सिंक हो जाएगा।
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-bold text-[hsl(var(--primary))]">त्वरित लिंक्स</h3>
                <div className="mt-3 flex flex-col gap-2">
                  <Link href="/dashboard" className="focus-ring flex items-center justify-between rounded-lg p-2 text-xs font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]">
                    <span>डैशबोर्ड एवं इंटेलिजेंट स्कोर</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link href="/quiz" className="focus-ring flex items-center justify-between rounded-lg p-2 text-xs font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]">
                    <span>MCQ क्विज़ इंजन</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link href="/pyq" className="focus-ring flex items-center justify-between rounded-lg p-2 text-xs font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]">
                    <span>Previous Year Questions</span>
                    <ArrowRight size={14} />
                  </Link>
                  <Link href="/study-material" className="focus-ring flex items-center justify-between rounded-lg p-2 text-xs font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]">
                    <span>अध्ययन सामग्री (Notes)</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
}

export default ProfilePage;
