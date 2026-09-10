import { Check, Filter, RotateCcw, X } from 'lucide-react';
import { exams } from '@/data/curriculum';

export interface FilterState {
  examId: string;
  contentType: string; // 'all' | 'study' | 'pyq' | 'quiz' | 'theory'
  difficulty: string;  // 'all' | 'Easy' | 'Moderate' | 'Hard' | 'Very Hard'
  searchQuery?: string;
}

interface ContentFiltersProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onReset?: () => void;
  showContentType?: boolean;
  showExam?: boolean;
  showDifficulty?: boolean;
  className?: string;
  totalResults?: number;
}

export const CONTENT_TYPE_OPTIONS = [
  { id: 'all', label: 'All Types', labelHi: 'सभी सामग्री' },
  { id: 'study', label: 'Study Material', labelHi: 'अध्ययन सामग्री' },
  { id: 'pyq', label: 'PYQ', labelHi: 'पिछले वर्षों के प्रश्न' },
  { id: 'quiz', label: 'Quiz / MCQs', labelHi: 'क्विज़' },
  { id: 'theory', label: 'Theory', labelHi: 'थ्योरी' },
];

export const DIFFICULTY_OPTIONS = [
  { id: 'all', label: 'All Difficulties', labelHi: 'सभी स्तर' },
  { id: 'Easy', label: 'Easy', labelHi: 'सरल' },
  { id: 'Moderate', label: 'Moderate', labelHi: 'मध्यम' },
  { id: 'Hard', label: 'Hard', labelHi: 'कठिन' },
  { id: 'Very Hard', label: 'Very Hard', labelHi: 'अति कठिन' },
];

export function ContentFilters({
  filters,
  onChange,
  onReset,
  showContentType = true,
  showExam = true,
  showDifficulty = true,
  className = '',
  totalResults,
}: ContentFiltersProps) {
  const isFiltered =
    filters.examId !== 'all' ||
    filters.contentType !== 'all' ||
    filters.difficulty !== 'all';

  return (
    <div
      className={`rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-2xs ${className}`}
      id="content-filters-container"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-3">
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[hsl(var(--primary))]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
            फिल्टर (Filters)
          </span>
          {typeof totalResults === 'number' && (
            <span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[11px] font-bold text-[hsl(var(--primary))]">
              {totalResults} परिणाम
            </span>
          )}
        </div>

        {isFiltered && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="focus-ring flex items-center gap-1 text-xs font-semibold text-[#a34f46] hover:underline"
            id="button-reset-filters"
          >
            <RotateCcw size={12} />
            फिल्टर हटाएं (Reset)
          </button>
        )}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. Exam Filter */}
        {showExam && (
          <div>
            <label
              htmlFor="filter-exam-select"
              className="block text-[11px] font-bold text-[hsl(var(--muted-foreground))]"
            >
              परीक्षा (Exam)
            </label>
            <select
              id="filter-exam-select"
              value={filters.examId}
              onChange={(e) => onChange({ ...filters, examId: e.target.value })}
              className="focus-ring mt-1 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))]"
            >
              <option value="all">सभी 8 परीक्षाएं (All Exams)</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 2. Content Type Filter */}
        {showContentType && (
          <div>
            <label
              htmlFor="filter-type-select"
              className="block text-[11px] font-bold text-[hsl(var(--muted-foreground))]"
            >
              सामग्री प्रकार (Content Type)
            </label>
            <select
              id="filter-type-select"
              value={filters.contentType}
              onChange={(e) => onChange({ ...filters, contentType: e.target.value })}
              className="focus-ring mt-1 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))]"
            >
              {CONTENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} ({opt.labelHi})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 3. Difficulty Filter */}
        {showDifficulty && (
          <div>
            <label
              htmlFor="filter-diff-select"
              className="block text-[11px] font-bold text-[hsl(var(--muted-foreground))]"
            >
              कठिनाई स्तर (Difficulty)
            </label>
            <select
              id="filter-diff-select"
              value={filters.difficulty}
              onChange={(e) => onChange({ ...filters, difficulty: e.target.value })}
              className="focus-ring mt-1 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))]"
            >
              {DIFFICULTY_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} ({opt.labelHi})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Quick Pills for Content Type */}
      {showContentType && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2">
          {CONTENT_TYPE_OPTIONS.map((opt) => {
            const isSelected = filters.contentType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ ...filters, contentType: opt.id })}
                className={`focus-ring rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  isSelected
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-2xs'
                    : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
