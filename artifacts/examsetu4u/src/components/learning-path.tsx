import {
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileQuestion,
  FileText,
  Lock,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Link } from 'wouter';
import { Button, Card } from '@/components/site';
import { ProgressBar } from '@/components/curriculum-ui';
import { TopicLearningDetails, TopicStepDetails, TOPIC_STATUS_LABELS } from '@/lib/learning-path';

interface LearningPathProps {
  examName: string;
  examId: string;
  subjectName: string;
  subjectId: string;
  topicDetails: TopicLearningDetails;
  className?: string;
  onReset?: () => void;
}

export function LearningPath({
  examName,
  examId,
  subjectName,
  subjectId,
  topicDetails,
  className = '',
  onReset,
}: LearningPathProps) {
  const { topic, steps, status, statusLabelHindi, overallProgress, isComplete, nextAction } =
    topicDetails;

  const statusTone =
    status === 'COMPLETED'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
      : status === 'IN_PROGRESS'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
      : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]';

  return (
    <div className={`space-y-6 ${className}`} id={`learning-path-${topic.id}`}>
      {/* 1. Guided Flow Breadcrumb Trail */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.3)] p-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--accent-foreground))] mb-2">
          <Sparkles size={13} />
          <span>निर्देशित अध्ययन पथ (Structured Learning Path)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[hsl(var(--foreground))]">
          <Link href={`/exams/${examId}`} className="hover:text-[hsl(var(--accent-foreground))] transition">
            {examName}
          </Link>
          <ChevronRight size={14} className="text-[hsl(var(--muted-foreground))]" />
          <Link
            href={`/exams/${examId}/${subjectId}`}
            className="hover:text-[hsl(var(--accent-foreground))] transition"
          >
            {subjectName}
          </Link>
          <ChevronRight size={14} className="text-[hsl(var(--muted-foreground))]" />
          <span className="font-bold text-[hsl(var(--primary))] truncate max-w-[220px]">
            {topic.name}
          </span>
          <ChevronRight size={14} className="text-[hsl(var(--muted-foreground))]" />
          <span className="rounded-full bg-[hsl(var(--primary))] px-2.5 py-0.5 text-[10px] font-bold text-[hsl(var(--accent))]">
            {statusLabelHindi}
          </span>
        </div>
      </div>

      {/* 2. Topic Progress Overview Card */}
      <Card className="p-5 sm:p-6" id="card-topic-progress-overview">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${statusTone}`}>
                {statusLabelHindi}
              </span>
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                अनुमानित समय: ~{topic.estimatedMinutes} मिनट
              </span>
            </div>
            <h2 className="mt-2 text-xl font-bold text-[hsl(var(--primary))] sm:text-2xl">
              {topic.name}
            </h2>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] max-w-xl">
              {topic.description}
            </p>
          </div>

          <div className="w-full sm:w-56 shrink-0">
            <ProgressBar value={overallProgress} label="अध्याय संपूर्णता (Topic Progress)" />
          </div>
        </div>

        {/* 3. Sequential Learning Steps */}
        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-4">
            चरणबद्ध अध्ययन पथ (Study Steps):
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {steps.map((step, idx) => {
              const isStepDone = step.status === 'completed';
              const isStepActive = step.status === 'in_progress';
              const isAvailable = step.isAvailable;

              const stepIcon =
                step.type === 'study' ? (
                  <FileText size={16} />
                ) : step.type === 'pyq' ? (
                  <FileQuestion size={16} />
                ) : (
                  <Brain size={16} />
                );

              return (
                <div
                  key={step.type}
                  className={`relative flex flex-col justify-between rounded-xl border p-4 transition ${
                    isStepDone
                      ? 'border-emerald-500/40 bg-emerald-500/5'
                      : isStepActive
                      ? 'border-[hsl(var(--accent))] bg-[hsl(var(--secondary)/.35)] shadow-2xs'
                      : isAvailable
                      ? 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                      : 'border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/.4)] opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
                        चरण {idx + 1}
                      </span>
                      {isStepDone ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px]">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      ) : isAvailable ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isStepActive
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'
                          }`}
                        >
                          {isStepActive ? 'प्रगति पर' : 'शुरू नहीं किया'}
                        </span>
                      ) : (
                        <span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
                          शीघ्र उपलब्ध
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                        {stepIcon}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[hsl(var(--primary))]">
                          {step.title}
                        </h4>
                        <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                          {step.type === 'study'
                            ? 'अवधारणाएं एवं मुख्य बिंदु'
                            : step.type === 'pyq'
                            ? 'पूर्व वर्षों के हल प्रश्न'
                            : 'समयबद्ध ऑनलाइन टेस्ट'}
                        </p>
                      </div>
                    </div>

                    {isAvailable && (
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] font-semibold text-[hsl(var(--muted-foreground))] mb-1">
                          <span>प्रगति</span>
                          <span>{step.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isStepDone ? 'bg-emerald-600' : 'bg-[hsl(var(--primary))]'
                            }`}
                            style={{ width: `${step.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[hsl(var(--border))]">
                    {isAvailable ? (
                      <Button
                        href={step.url}
                        variant={isStepDone ? 'secondary' : isStepActive ? 'primary' : 'secondary'}
                        className="w-full text-xs h-8 justify-center gap-1.5"
                      >
                        {isStepDone ? (
                          <>
                            <RotateCcw size={12} /> {step.actionLabel}
                          </>
                        ) : isStepActive ? (
                          <>
                            <Play size={11} className="fill-current" /> {step.actionLabel}
                          </>
                        ) : (
                          <>
                            {step.actionLabel} <ArrowRight size={12} />
                          </>
                        )}
                      </Button>
                    ) : (
                      <span className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
                        सामग्री जल्द जुड़ेगी
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Next Recommended Action Banner */}
        <div className="mt-6 rounded-xl border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--secondary)/.3)] p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--accent))]">
                <Play size={13} className="fill-current" />
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                  अगला कदम (Next Action)
                </span>
                <p className="text-xs font-bold text-[hsl(var(--primary))] mt-0.5">
                  {nextAction.label}
                </p>
                <p className="text-[11px] text-[hsl(var(--foreground))] mt-0.5">
                  {nextAction.reason}
                </p>
              </div>
            </div>

            <Button
              href={nextAction.url}
              variant="primary"
              className="text-xs h-9 px-4 shrink-0 justify-center gap-1.5"
            >
              {nextAction.label} <ArrowRight size={13} />
            </Button>
          </div>
        </div>

        {/* 5. Honest Completion Confirmation Panel (Requirement 9: only when actually satisfied) */}
        <div className="mt-6 border-t border-[hsl(var(--border))] pt-5">
          {isComplete ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-200">
              <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold">
                  बधाई! यह अध्याय पूर्णतः संपन्न हो चुका है (Topic Completed).
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  आपने इस अध्याय के नोट्स, PYQ एवं आवश्यक क्विज़ सफलतापूर्वक पूरा कर लिया है।
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 text-xs text-[hsl(var(--muted-foreground))]">
              <p>
                टॉपिक को 100% पूरा करने के लिए उपलब्ध नोट्स पढ़ें, PYQ हल करें और क्विज़ में उत्तीर्ण हों।
              </p>
              <span className="font-bold text-[hsl(var(--primary))] shrink-0">
                {overallProgress}% पूर्ण
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
