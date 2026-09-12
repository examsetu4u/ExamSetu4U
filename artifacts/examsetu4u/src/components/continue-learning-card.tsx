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
      className={`overflow-hidden border border-blue-200/90 bg-white shadow-xs transition hover:border-blue-300 hover:shadow-sm ${className}`}
    >
      <div className="border-b border-blue-100 bg-blue-50/60 px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-2xs">
              <Sparkles size={12} />
              {title}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {item.examName} → <span className="font-bold text-slate-800">{item.subjectName}</span>
            </span>
          </div>

          <span className="rounded-full border border-blue-200 bg-white px-3 py-0.5 text-[11px] font-bold text-blue-700">
            प्रगति: {item.progress}%
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              अध्याय / Topic:
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
              {item.topicName}
            </h3>

            {/* Deterministic Explanation Reason */}
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3.5">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  {actionIcon}
                </span>
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-blue-900">सुझाव: </span>
                  <span className="text-slate-700">{item.actionReason}</span>
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
            <p className="mt-2 text-center text-[11px] text-slate-500">
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
