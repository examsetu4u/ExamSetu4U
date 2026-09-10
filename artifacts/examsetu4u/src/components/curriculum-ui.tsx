import { Check, Circle, Clock3, FileText, HelpCircle, ListChecks, RotateCcw } from 'lucide-react';
import { Link } from 'wouter';
import type { ContentAvailability } from '@/data/curriculum';

export function ProgressBar({ value, label = 'Progress' }: { value: number; label?: string }) {
  return <div aria-label={`${label}: ${value}%`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
    <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]"><span>{label}</span><span className="text-[hsl(var(--primary))]">{value}%</span></div>
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[hsl(var(--secondary))]"><div className="h-full rounded-full bg-[hsl(var(--accent))] transition-[width]" style={{ width: `${value}%` }} /></div>
  </div>;
}

export function AvailabilityList({ availability }: { availability: ContentAvailability }) {
  const items = [
    { label: 'Study Material', available: availability.studyMaterial, icon: FileText },
    { label: 'PYQs', available: availability.pyq, icon: ListChecks },
    { label: 'Quiz', available: availability.quiz, icon: HelpCircle },
  ];
  return <div className="flex flex-wrap gap-2">{items.map(({ label, available, icon: Icon }) => <span key={label} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${available ? 'bg-[#dcebe2] text-[#276448]' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'}`}><Icon size={12} />{label} {available ? <Check size={11} /> : <span className="opacity-70">soon</span>}</span>)}</div>;
}

export function ProgressSummary({ value }: { value: number }) {
  return <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-[hsl(var(--secondary))] text-xs font-bold text-[hsl(var(--primary))]" style={{ background: `conic-gradient(hsl(var(--accent)) ${value * 3.6}deg, transparent 0)` }}><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[hsl(var(--card))]">{value}%</span></div><span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Complete</span></div>;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
    {items.map((item, index) => <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">{index > 0 && <span aria-hidden="true">/</span>}{item.href ? <Link href={item.href} className="focus-ring rounded hover:text-[hsl(var(--primary))]">{item.label}</Link> : <span className="text-[hsl(var(--primary))]">{item.label}</span>}</span>)}
  </nav>;
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