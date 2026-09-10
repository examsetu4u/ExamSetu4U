import { ArrowRight, BookOpen, Brain, CheckCircle2, FileQuestion, FileText, Play, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { Card, Button } from '@/components/site';
import { ProgressBar } from '@/components/curriculum-ui';
import { SmartContinueLearningItem } from '@/lib/learning-path';

interface ContinueLearningCardProps {
  item: SmartContinueLearningItem | null;
  className?: string;
  onAction?: () => void;
  title?: string;
}

export function ContinueLearningCard({
  item,
  className = '',
  onAction,
  title = 'अगला कदम (Next Step)',
}: ContinueLearningCardProps) {
  if (!item) {
    return (
      <Card className={`p-5 sm:p-6 ${className}`} id="continue-learning-empty-card">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
            <BookOpen size={18} />
          </span>
          <div>
            <h3 className="text-sm font-bold text-[hsl(var(--primary))]">तैयारी प्रारंभ करें</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              किसी भी विषय का पहला अध्याय चुनकर अपनी पढ़ाई शुरू करें।
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const actionIcon =
    item.actionType === 'study' ? (
      <FileText size={15} />
    ) : item.actionType === 'pyq' ? (
      <FileQuestion size={15} />
    ) : (
      <Brain size={15} />
    );

  return (
    <Card
      id={`continue-card-${item.topicId}`}
      className={`overflow-hidden border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--card))] shadow-2xs transition hover:border-[hsl(var(--accent))] ${className}`}
    >
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.35)] px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-[hsl(var(--primary))] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--accent))]">
              <Sparkles size={12} />
              {title}
            </span>
            <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              {item.examName} → <span className="font-bold text-[hsl(var(--primary))]">{item.subjectName}</span>
            </span>
          </div>

          <span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-0.5 text-[11px] font-bold text-[hsl(var(--foreground))]">
            प्रगति: {item.progress}%
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
              अध्याय / Topic:
            </p>
            <h3 className="mt-1 text-lg font-bold text-[hsl(var(--primary))] sm:text-xl">
              {item.topicName}
            </h3>

            {/* Deterministic Explanation Reason */}
            <div className="mt-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.4)] p-3">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--accent))]">
                  {actionIcon}
                </span>
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-[hsl(var(--primary))]">सुझाव: </span>
                  <span className="text-[hsl(var(--foreground))]">{item.actionReason}</span>
                </div>
              </div>
            </div>

            {/* Progress Visualization */}
            <div className="mt-4 max-w-md">
              <ProgressBar value={item.progress} label={`विषय प्रगति (${item.currentActivity})`} />
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 lg:max-w-xs lg:min-w-[200px]">
            <Button
              href={item.actionUrl}
              variant="primary"
              onClick={onAction}
              className="w-full justify-center gap-2 py-3 text-sm font-bold shadow-xs"
            >
              <Play size={14} className="fill-current" />
              {item.recommendedAction}
              <ArrowRight size={15} />
            </Button>
            <p className="mt-2 text-center text-[11px] text-[hsl(var(--muted-foreground))]">
              {item.actionType === 'study'
                ? 'नोट्स पढ़ें और अवधारणाएं समझें'
                : item.actionType === 'pyq'
                ? 'पूर्व वर्षों के वास्तविक प्रश्न हल करें'
                : 'समयबद्ध बहुविकल्पीय परीक्षा दें'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
