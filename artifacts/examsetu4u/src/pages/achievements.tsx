import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Filter,
  Flame,
  Lock,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout } from '@/components/site';
import { AchievementItem, getAllAchievements } from '@/lib/analytics';

export default function AchievementsPage() {
  const [filterTab, setFilterTab] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const achievements = useMemo(() => getAllAchievements(), []);

  const totalCount = achievements.length;
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const lockedCount = totalCount - unlockedCount;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      if (filterTab === 'unlocked' && !item.isUnlocked) return false;
      if (filterTab === 'locked' && item.isUnlocked) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      return true;
    });
  }, [achievements, filterTab, categoryFilter]);

  // Find closest locked badge to encourage learner
  const closestLockedBadge = useMemo(() => {
    const lockedList = achievements.filter((a) => !a.isUnlocked);
    if (lockedList.length === 0) return null;
    return lockedList.sort((a, b) => b.progressPercent - a.progressPercent)[0];
  }, [achievements]);

  return (
    <Layout>
      {/* Header Section */}
      <section className="paper-grid border-b border-[hsl(var(--border))] py-8 sm:py-12" id="achievements-header">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'होम (Home)', href: '/' },
              { label: 'डैशबोर्ड (Dashboard)', href: '/dashboard' },
              { label: 'उपलब्धियां एवं पदक (Achievements)' },
            ]}
          />

          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow flex items-center gap-1.5 text-[hsl(var(--primary))]">
                <Trophy size={15} /> ExamSetu4U Badges & Milestones
              </p>
              <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-[hsl(var(--primary))] sm:text-4xl">
                उपलब्धियां एवं पदक (Achievements)
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                आपके वास्तविक अध्ययन और प्रश्नों के निरंतर अभ्यास से अनलॉक होने वाले पदक। हर उपलब्धि आपकी परीक्षा सफलता की दिशा में एक कदम है।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button href="/analytics" variant="secondary" className="text-xs">
                प्रदर्शन विश्लेषण देखें
              </Button>
              <Button href="/quiz" className="text-xs">
                अभ्यास जारी रखें
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12" id="achievements-main-content">
        <Container>
          {/* Summary Progress Card */}
          <Card className="p-6 shadow-sm sm:p-8" id="card-achievements-summary">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-[hsl(var(--border))]">
              {/* Stat 1 */}
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  कुल पदक
                </span>
                <p className="text-3xl font-bold text-[hsl(var(--primary))]">{totalCount}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">सिस्टम में उपलब्ध</p>
              </div>

              {/* Stat 2 */}
              <div className="space-y-1 lg:pl-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  अनलॉक किए गए
                </span>
                <p className="text-3xl font-bold text-emerald-600">{unlockedCount}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{completionPercentage}% पूर्ण</p>
              </div>

              {/* Stat 3 */}
              <div className="space-y-1 lg:pl-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  अनलॉक हेतु शेष
                </span>
                <p className="text-3xl font-bold text-amber-600">{lockedCount}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">प्रगति जारी रखें</p>
              </div>

              {/* Stat 4: Closest Badge */}
              <div className="space-y-1 lg:pl-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  अगला निकटतम पदक
                </span>
                {closestLockedBadge ? (
                  <div>
                    <p className="truncate text-base font-bold text-[hsl(var(--primary))]">
                      {closestLockedBadge.icon} {closestLockedBadge.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                        <div
                          className="h-full rounded-full bg-[hsl(var(--primary))]"
                          style={{ width: `${closestLockedBadge.progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[hsl(var(--primary))]">
                        {closestLockedBadge.progressPercent}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-emerald-600">सभी पदक अनलॉक! 🎉</p>
                )}
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-6 border-t border-[hsl(var(--border))] pt-4">
              <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                <span className="font-semibold">समग्र पदक प्रगति:</span>
                <span className="font-bold text-[hsl(var(--primary))]">
                  {unlockedCount} / {totalCount} ({completionPercentage}%)
                </span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Filter Bar */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" id="achievements-filter-bar">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1.5" id="tabs-achievement-status">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`focus-ring rounded-lg px-4 py-2 text-xs font-bold transition ${
                  filterTab === 'all'
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'
                }`}
              >
                सभी पदक ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('unlocked')}
                className={`focus-ring flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
                  filterTab === 'unlocked'
                    ? 'bg-emerald-600 text-white'
                    : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-emerald-600'
                }`}
              >
                <CheckCircle2 size={14} /> अनलॉक किए गए ({unlockedCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('locked')}
                className={`focus-ring flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition ${
                  filterTab === 'locked'
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'
                }`}
              >
                <Lock size={13} /> शेष ({lockedCount})
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[hsl(var(--muted-foreground))]" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="focus-ring rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--primary))]"
                id="select-achievement-category"
              >
                <option value="all">सभी श्रेणियां (All Categories)</option>
                <option value="practice">प्रश्न अभ्यास (Practice)</option>
                <option value="quiz">क्विज़ टेस्ट (Quiz)</option>
                <option value="study">अध्ययन सामग्री (Study)</option>
                <option value="streak">निरंतरता (Streak)</option>
                <option value="accuracy">सटीकता (Accuracy)</option>
              </select>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" id="grid-achievements-list">
            {filteredAchievements.map((badge) => (
              <Card
                key={badge.id}
                className={`flex flex-col justify-between p-5 transition ${
                  badge.isUnlocked
                    ? 'border-emerald-200 bg-emerald-50/20 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] opacity-85'
                }`}
                id={`card-achievement-${badge.id}`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] text-2xl shadow-xs">
                      {badge.icon}
                    </div>

                    {badge.isUnlocked ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <CheckCircle2 size={13} /> अनलॉक
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))] px-2.5 py-0.5 text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
                        <Lock size={12} /> लॉक
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-base font-bold text-[hsl(var(--primary))]">{badge.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{badge.description}</p>

                  <div className="mt-3 rounded-md bg-[hsl(var(--secondary)/.6)] p-2.5 text-xs text-[hsl(var(--primary))]">
                    <span className="font-semibold text-[hsl(var(--muted-foreground))]">शर्त: </span>
                    {badge.requirement}
                  </div>
                </div>

                <div className="mt-5 border-t border-[hsl(var(--border))] pt-3">
                  {badge.isUnlocked ? (
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      🏆 प्राप्त: {badge.unlockedAt || 'सफलतापूर्वक अनलॉक'}
                    </p>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                        <span>प्रगति:</span>
                        <span className="font-bold text-[hsl(var(--primary))]">
                          {badge.currentValue} / {badge.targetValue} ({badge.progressPercent}%)
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                        <div
                          className="h-full rounded-full bg-[hsl(var(--primary))]"
                          style={{ width: `${badge.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <Card className="mt-6 p-8 text-center" id="empty-achievements">
              <Trophy size={32} className="mx-auto text-[hsl(var(--muted-foreground))] opacity-50" />
              <p className="mt-2 text-sm font-semibold text-[hsl(var(--primary))]">कोई पदक नहीं मिला</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                चुने गए फ़िल्टर के लिए कोई उपलब्धि उपलब्ध नहीं है।
              </p>
            </Card>
          )}
        </Container>
      </section>
    </Layout>
  );
}
