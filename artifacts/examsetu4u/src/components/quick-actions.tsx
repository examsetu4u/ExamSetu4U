import { ArrowRight, BarChart2, BookOpen, Brain, FileText, Play, RotateCcw } from 'lucide-react';
import { Link } from 'wouter';
import { Card } from '@/components/site';
import { getContinueLearning } from '@/lib/user-progress';

interface QuickActionsProps {
  className?: string;
  variant?: 'grid' | 'bar' | 'compact';
  showContinue?: boolean;
}

export function QuickActions({
  className = '',
  variant = 'grid',
  showContinue = true,
}: QuickActionsProps) {
  const continueItem = showContinue ? getContinueLearning() : null;

  const actions = [
    {
      id: 'action-study',
      title: 'Study Material',
      titleHi: 'अध्ययन सामग्री',
      desc: 'अवधारणात्मक नोट्स एवं रिवीजन',
      href: '/study-material',
      icon: BookOpen,
      tone: 'bg-[#f7e3bb] text-[#825413]',
    },
    {
      id: 'action-pyq',
      title: 'Practice PYQ',
      titleHi: 'पिछले वर्षों के प्रश्न',
      desc: 'पूर्व परीक्षा प्रश्न एवं विस्तृत हल',
      href: '/pyq',
      icon: FileText,
      tone: 'bg-[#d6ebe5] text-[#246556]',
    },
    {
      id: 'action-quiz',
      title: 'Take Quiz',
      titleHi: 'MCQ क्विज़ दें',
      desc: 'समयबद्ध वस्तुनिष्ठ टेस्ट',
      href: '/quiz',
      icon: Brain,
      tone: 'bg-[#dce4f2] text-[#34547f]',
    },
    {
      id: 'action-progress',
      title: 'View Progress',
      titleHi: 'प्रगति एवं विश्लेषण',
      desc: 'Intelligent Score एवं स्तर',
      href: '/analytics',
      icon: BarChart2,
      tone: 'bg-[#f3dcd5] text-[#9a493e]',
    },
  ];

  if (variant === 'bar') {
    return (
      <div className={`flex flex-wrap items-center gap-2 sm:gap-3 ${className}`} id="quick-actions-bar">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.id}
              href={act.href}
              className="focus-ring inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-2 text-xs font-bold text-[hsl(var(--primary))] shadow-2xs transition hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--secondary))]"
              id={act.id}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs ${act.tone}`}>
                <Icon size={13} />
              </span>
              <span>{act.title}</span>
            </Link>
          );
        })}
        {continueItem && (
          <Link
            href={continueItem.url}
            className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] shadow-xs transition hover:opacity-90"
            id="quick-action-continue"
          >
            <Play size={13} className="fill-current" />
            <span>Continue: {continueItem.topicName}</span>
          </Link>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${className}`} id="quick-actions-compact">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.id}
              href={act.href}
              className="focus-ring flex items-center gap-2.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 transition hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--secondary))]"
              id={act.id}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${act.tone}`}>
                <Icon size={16} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-[hsl(var(--primary))]">{act.title}</p>
                <p className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">{act.titleHi}</p>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`} id="quick-actions-grid">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <Link
            key={act.id}
            href={act.href}
            className="group focus-ring block"
            id={act.id}
          >
            <Card className="h-full p-4 transition duration-150 hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold ${act.tone}`}>
                  <Icon size={18} />
                </span>
                <span className="text-[hsl(var(--muted-foreground))] transition group-hover:translate-x-1 group-hover:text-[hsl(var(--primary))]">
                  <ArrowRight size={15} />
                </span>
              </div>
              <h3 className="mt-3 text-sm font-bold text-[hsl(var(--primary))]">
                {act.title}
              </h3>
              <p className="text-[11px] font-semibold text-[hsl(var(--accent-foreground))]">
                {act.titleHi}
              </p>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
                {act.desc}
              </p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
