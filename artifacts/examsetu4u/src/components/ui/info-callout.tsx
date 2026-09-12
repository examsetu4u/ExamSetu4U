import { ReactNode } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Check,
  CheckCircle2,
  Info,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface CalloutProps {
  id?: string;
  title?: string;
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
}

/**
 * 1. Important Point (महत्वपूर्ण बिंदु)
 * Clean, modern light blue container with blue accent icon and high-contrast readable text.
 */
export function ImportantPoint({
  id,
  title = 'महत्वपूर्ण बिंदु (Important Point)',
  children,
  className = '',
  'data-testid': testId,
}: CalloutProps) {
  return (
    <aside
      id={id}
      data-testid={testId || 'callout-important-point'}
      className={`rounded-xl border border-blue-200/90 bg-blue-50/70 p-4.5 sm:p-5 text-blue-950 transition-all ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
          <Info size={16} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          {title && (
            <h4 className="text-sm font-bold tracking-tight text-blue-900 sm:text-[15px]">
              {title}
            </h4>
          )}
          <div className="mt-1 text-xs leading-relaxed text-blue-900/90 sm:text-sm">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * 2. Exam Tip (परीक्षा सुझाव)
 * Soft indigo/sky background with lightbulb icon for key exam tactics and memory hooks.
 */
export function ExamTip({
  id,
  title = 'परीक्षा टिप (Exam Tip)',
  children,
  className = '',
  'data-testid': testId,
}: CalloutProps) {
  return (
    <aside
      id={id}
      data-testid={testId || 'callout-exam-tip'}
      className={`rounded-xl border border-sky-200/90 bg-sky-50/70 p-4.5 sm:p-5 text-sky-950 transition-all ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
          <Lightbulb size={16} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          {title && (
            <h4 className="text-sm font-bold tracking-tight text-sky-900 sm:text-[15px]">
              {title}
            </h4>
          )}
          <div className="mt-1 text-xs leading-relaxed text-sky-900/90 sm:text-sm">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * 3. Quick Revision (त्वरित दोहराव)
 * Authoritative deep blue card treatment for memorable, high-yield takeaways.
 */
interface QuickRevisionProps {
  id?: string;
  title?: string;
  subtitle?: string;
  points?: string[];
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
}

export function QuickRevision({
  id,
  title = 'त्वरित दोहराव (Quick Revision)',
  subtitle = 'परीक्षा से पहले इन प्रमुख बिंदुओं को कंठस्थ रखें:',
  points,
  children,
  className = '',
  'data-testid': testId,
}: QuickRevisionProps) {
  return (
    <aside
      id={id}
      data-testid={testId || 'callout-quick-revision'}
      className={`rounded-2xl border border-blue-800/40 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 p-5 sm:p-7 text-white shadow-md ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20 text-blue-300">
          <Sparkles size={14} />
        </span>
        <p className="text-[11px] font-bold uppercase tracking-widest text-blue-300">
          Quick Revision
        </p>
      </div>

      <h3 className="font-display mt-2 text-xl font-bold tracking-tight text-white sm:text-2xl">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1.5 text-xs text-blue-200/80 sm:text-sm">
          {subtitle}
        </p>
      )}

      {points && points.length > 0 && (
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {points.map((point, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 rounded-lg bg-white/5 p-2.5 text-xs leading-relaxed text-blue-100 sm:text-sm"
            >
              <Check size={16} className="mt-0.5 shrink-0 text-blue-400" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}

      {children && <div className="mt-4 text-xs leading-relaxed sm:text-sm">{children}</div>}
    </aside>
  );
}

/**
 * 4. Warning (सावधानी)
 * Dedicated amber caution box used strictly for genuine exam traps or negative marking cautions.
 */
export function WarningCallout({
  id,
  title = 'सावधानी / चेतावनी (Warning)',
  children,
  className = '',
  'data-testid': testId,
}: CalloutProps) {
  return (
    <aside
      id={id}
      data-testid={testId || 'callout-warning'}
      className={`rounded-xl border border-amber-200/90 bg-amber-50/80 p-4.5 sm:p-5 text-amber-950 transition-all ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <AlertTriangle size={16} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          {title && (
            <h4 className="text-sm font-bold tracking-tight text-amber-900 sm:text-[15px]">
              {title}
            </h4>
          )}
          <div className="mt-1 text-xs leading-relaxed text-amber-900/90 sm:text-sm">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * 5. Success (सफलता / सही उत्तर)
 * Fresh emerald tint for mastery confirmation and correct solution summaries.
 */
export function SuccessCallout({
  id,
  title = 'सफलता (Success)',
  children,
  className = '',
  'data-testid': testId,
}: CalloutProps) {
  return (
    <aside
      id={id}
      data-testid={testId || 'callout-success'}
      className={`rounded-xl border border-emerald-200/90 bg-emerald-50/80 p-4.5 sm:p-5 text-emerald-950 transition-all ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <CheckCircle2 size={16} strokeWidth={2.4} />
        </span>
        <div className="min-w-0 flex-1">
          {title && (
            <h4 className="text-sm font-bold tracking-tight text-emerald-900 sm:text-[15px]">
              {title}
            </h4>
          )}
          <div className="mt-1 text-xs leading-relaxed text-emerald-900/90 sm:text-sm">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * 6. Progress (अध्ययन प्रगति)
 * Standardized progress block with percentage meter and milestone feedback.
 */
interface ProgressCalloutProps {
  id?: string;
  value: number;
  label: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  'data-testid'?: string;
}

export function ProgressCallout({
  id,
  value,
  label,
  subtitle,
  badge,
  className = '',
  'data-testid': testId,
}: ProgressCalloutProps) {
  const clampedValue = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      id={id}
      data-testid={testId || 'callout-progress'}
      className={`rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 sm:p-5 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <TrendingUp size={15} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-900">
              {label}
            </p>
            {subtitle && (
              <p className="text-[11px] text-slate-600">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-base font-extrabold text-blue-700 sm:text-lg">
            {clampedValue}%
          </span>
          {badge && (
            <span className="ml-2 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
              {badge}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
