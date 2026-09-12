import { Check, Circle, Clock3, FileText, HelpCircle, ListChecks, RotateCcw } from 'lucide-react';
import { Link } from 'wouter';
import type { ContentAvailability } from '@/data/curriculum';

export function ProgressBar({ value, label = 'Progress' }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div aria-label={`${label}: ${clamped}%`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamped}>
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
        <span>{label}</span>
        <span className="font-bold text-blue-700">{clamped}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100/70">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function AvailabilityList({ availability }: { availability: ContentAvailability }) {
  const items = [
    { label: 'Study Material', available: availability.studyMaterial, icon: FileText },
    { label: 'PYQs', available: availability.pyq, icon: ListChecks },
    { label: 'Quiz', available: availability.quiz, icon: HelpCircle },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ label, available, icon: Icon }) => (
        <span
          key={label}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            available
              ? 'border border-blue-200 bg-blue-50 text-blue-700'
              : 'border border-slate-200 bg-slate-50 text-slate-500'
          }`}
        >
          <Icon size={12} />
          {label} {available ? <Check size={11} strokeWidth={2.5} /> : <span className="text-[10px] font-normal opacity-75">soon</span>}
        </span>
      ))}
    </div>
  );
}

export function ProgressSummary({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-100 text-xs font-bold text-blue-700 shadow-2xs"
        style={{ background: `conic-gradient(#2563eb ${clamped * 3.6}deg, #dbeafe 0)` }}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-extrabold text-blue-800">
          {clamped}%
        </span>
      </div>
      <span className="text-xs font-bold text-slate-600">Complete</span>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
          {index > 0 && <span aria-hidden="true" className="text-slate-300">/</span>}
          {item.href ? (
            <Link href={item.href} className="focus-ring rounded text-slate-600 hover:text-blue-700 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="font-bold text-slate-900">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function ContentIcon({ type }: { type: 'study' | 'pyq' | 'quiz' | 'theory' }) {
  const icons = { study: FileText, pyq: ListChecks, quiz: HelpCircle, theory: Circle };
  const Icon = icons[type];
  return <Icon size={20} />;
}

export function CompleteIcon({ complete }: { complete: boolean }) {
  return complete ? <Check size={16} /> : <RotateCcw size={16} />;
}

export function EstimatedTime({ minutes }: { minutes: number }) {
  return <span className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]"><Clock3 size={14} />{minutes} min</span>;
}