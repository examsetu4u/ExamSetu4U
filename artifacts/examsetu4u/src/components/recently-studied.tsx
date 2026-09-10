import { ArrowRight, BookOpen, Brain, Clock, FileQuestion, FileText, History } from 'lucide-react';
import { Link } from 'wouter';
import { Card, Button } from '@/components/site';
import { ActivityItem } from '@/lib/user-progress';

interface RecentlyStudiedProps {
  items: ActivityItem[];
  className?: string;
  title?: string;
}

export function RecentlyStudied({
  items,
  className = '',
  title = 'हाल ही में पढ़ा गया (Recently Studied Topics)',
}: RecentlyStudiedProps) {
  const displayItems = items.slice(0, 8);

  const getTypeIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'study':
        return <FileText size={14} className="text-amber-600 dark:text-amber-400" />;
      case 'pyq':
        return <FileQuestion size={14} className="text-teal-600 dark:text-teal-400" />;
      case 'quiz':
        return <Brain size={14} className="text-indigo-600 dark:text-indigo-400" />;
      default:
        return <BookOpen size={14} className="text-[hsl(var(--primary))]" />;
    }
  };

  const getFormatTime = (timestamp: string) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'हाल ही में';
    }
  };

  return (
    <Card className={`p-5 sm:p-6 ${className}`} id="card-recently-studied">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
            <History size={16} />
          </span>
          <h3 className="text-base font-bold text-[hsl(var(--primary))]">{title}</h3>
        </div>
        {displayItems.length > 0 && (
          <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
            {displayItems.length} रिकॉर्ड
          </span>
        )}
      </div>

      {displayItems.length === 0 ? (
        <div className="py-8 text-center">
          <Clock size={28} className="mx-auto text-[hsl(var(--muted-foreground))] opacity-50" />
          <p className="mt-3 text-xs font-semibold text-[hsl(var(--primary))]">
            अभी कोई learning activity नहीं है। पहला topic शुरू करें।
          </p>
          <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
            जब आप कोई नोट्स पढ़ेंगे, PYQ हल करेंगे या क्विज़ देंगे, वे यहाँ प्रदर्शित होंगे।
          </p>
          <Button href="/exams" variant="secondary" className="mt-4 text-xs">
            परीक्षाएं देखें <ArrowRight size={13} />
          </Button>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-[hsl(var(--border))]">
          {displayItems.map((item) => (
            <Link
              key={item.id}
              href={item.url}
              className="group flex items-center justify-between gap-3 py-3 transition hover:bg-[hsl(var(--secondary)/.3)] px-2 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--secondary))]">
                  {getTypeIcon(item.type)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[hsl(var(--primary))] group-hover:text-[hsl(var(--accent-foreground))]">
                    {item.title}
                  </p>
                  <p className="truncate text-[11px] text-[hsl(var(--muted-foreground))]">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {item.scoreText && (
                  <span className="rounded-md bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--foreground))]">
                    {item.scoreText}
                  </span>
                )}
                <span className="hidden sm:inline-block text-[10px] text-[hsl(var(--muted-foreground))]">
                  {getFormatTime(item.timestamp)}
                </span>
                <ArrowRight
                  size={13}
                  className="text-[hsl(var(--muted-foreground))] transition group-hover:translate-x-0.5 group-hover:text-[hsl(var(--primary))]"
                />
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
