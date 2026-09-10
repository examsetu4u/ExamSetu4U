import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Eye,
  FileCheck2,
  Filter,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { getAdminQuestions, saveAdminQuestion } from '../services/admin-service';
import { validateAllQuestions, validateQuestion } from '../services/validation-service';
import type { AdminQuestion, ValidationResult } from '../types';
import { QuestionPreview } from './question-preview';

export function ValidationReport() {
  const [questions, setQuestions] = useState<AdminQuestion[]>(() => getAdminQuestions());
  const [filterType, setFilterType] = useState<'ALL' | 'ERROR' | 'WARNING' | 'VALID'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestion | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<AdminQuestion | null>(null);

  // Run full validation suite
  const validationMap = useMemo(() => {
    return validateAllQuestions(questions);
  }, [questions]);

  // Aggregate metrics
  const stats = useMemo(() => {
    let valid = 0;
    let warnings = 0;
    let errors = 0;

    questions.forEach((q) => {
      const res = validationMap[q.id];
      if (!res || res.status === 'VALID') valid++;
      else if (res.status === 'WARNING') warnings++;
      else if (res.status === 'ERROR') errors++;
    });

    return {
      total: questions.length,
      valid,
      warnings,
      errors,
    };
  }, [questions, validationMap]);

  // Filtered issues list
  const filteredList = useMemo(() => {
    return questions.filter((q) => {
      const res = validationMap[q.id] || { status: 'VALID', errors: [], warnings: [] };

      if (filterType !== 'ALL' && res.status !== filterType) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          q.question.toLowerCase().includes(query) ||
          q.id.toLowerCase().includes(query) ||
          res.errors.some((e) => e.toLowerCase().includes(query)) ||
          res.warnings.some((w) => w.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [questions, validationMap, filterType, searchTerm]);

  const handleRefresh = () => {
    setQuestions(getAdminQuestions());
  };

  const handleSaveFixedQuestion = (updated: AdminQuestion) => {
    saveAdminQuestion(updated);
    setSelectedQuestion(null);
    setQuestions(getAdminQuestions());
  };

  return (
    <div className="space-y-6" data-testid="validation-report-view">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Pedagogical & Structural Validation Engine
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Automated integrity auditor checking ID uniqueness, curriculum hierarchy links, options, and pedagogical depth.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))] shadow-sm hover:bg-[hsl(var(--muted))]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Re-run Full Audit
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Questions */}
        <div
          onClick={() => setFilterType('ALL')}
          className={`cursor-pointer rounded-xl border p-4 shadow-sm transition ${
            filterType === 'ALL'
              ? 'border-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary))] bg-[hsl(var(--card))]'
              : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--primary)/0.5)]'
          }`}
        >
          <div className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
            Total Audited Questions
          </div>
          <div className="mt-2 text-2xl font-extrabold text-[hsl(var(--foreground))]">
            {stats.total}
          </div>
          <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
            100% Repository Coverage
          </div>
        </div>

        {/* Valid Questions */}
        <div
          onClick={() => setFilterType('VALID')}
          className={`cursor-pointer rounded-xl border p-4 shadow-sm transition ${
            filterType === 'VALID'
              ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-500/10'
              : 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span>Valid & Clean</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">
            {stats.valid}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
            Passes all checks
          </div>
        </div>

        {/* Warnings */}
        <div
          onClick={() => setFilterType('WARNING')}
          className={`cursor-pointer rounded-xl border p-4 shadow-sm transition ${
            filterType === 'WARNING'
              ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-500/10'
              : 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
            <span>Pedagogical Warnings</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-800 dark:text-amber-300">
            {stats.warnings}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
            Missing extra notes / facts
          </div>
        </div>

        {/* Fatal Errors */}
        <div
          onClick={() => setFilterType('ERROR')}
          className={`cursor-pointer rounded-xl border p-4 shadow-sm transition ${
            filterType === 'ERROR'
              ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-500/10'
              : stats.errors > 0
              ? 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500'
              : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-rose-700 dark:text-rose-400">
            <span>Schema / Linking Errors</span>
            <AlertCircle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-700 dark:text-rose-400">
            {stats.errors}
          </div>
          <div className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
            {stats.errors > 0 ? 'Blocks live publication' : '0 Fatal Errors'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search by issue description or question ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-1.5 pl-9 pr-3 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
          >
            <option value="ALL">Show All ({questions.length})</option>
            <option value="ERROR">Errors Only ({stats.errors})</option>
            <option value="WARNING">Warnings Only ({stats.warnings})</option>
            <option value="VALID">Clean & Valid ({stats.valid})</option>
          </select>
        </div>
      </div>

      {/* Questions Audit List */}
      <div className="space-y-3">
        {filteredList.map((q) => {
          const res = validationMap[q.id] || { status: 'VALID', errors: [], warnings: [] };

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-4 shadow-sm transition ${
                res.status === 'ERROR'
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : res.status === 'WARNING'
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[hsl(var(--border)/0.5)] pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      res.status === 'ERROR'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : res.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {res.status === 'ERROR' && <AlertCircle className="h-3 w-3" />}
                    {res.status === 'WARNING' && <AlertTriangle className="h-3 w-3" />}
                    {res.status === 'VALID' && <CheckCircle2 className="h-3 w-3" />}
                    {res.status}
                  </span>

                  <span className="font-mono text-xs font-semibold text-[hsl(var(--foreground))]">
                    ID: {q.id}
                  </span>

                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    • {q.examId} › {q.subjectId}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewQuestion(q)}
                    className="inline-flex items-center gap-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                  >
                    <Eye className="h-3 w-3 text-blue-600" />
                    Preview
                  </button>

                  <button
                    onClick={() => setSelectedQuestion(q)}
                    className="inline-flex items-center gap-1 rounded border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.1)] px-2.5 py-1 text-xs font-semibold text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.2)]"
                  >
                    <Edit2 className="h-3 w-3" />
                    Inspect & Fix
                  </button>
                </div>
              </div>

              <div className="mt-2.5 text-xs font-medium text-[hsl(var(--foreground))] line-clamp-2">
                {q.question}
              </div>

              {/* Error messages */}
              {res.errors.length > 0 && (
                <div className="mt-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs text-rose-800 dark:text-rose-300">
                  <div className="font-bold flex items-center gap-1 mb-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Fatal Validation Errors:
                  </div>
                  <ul className="list-inside list-disc space-y-0.5 text-[11px]">
                    {res.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warning messages */}
              {res.warnings.length > 0 && (
                <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <div className="font-bold flex items-center gap-1 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Pedagogical Enhancements Recommended:
                  </div>
                  <ul className="list-inside list-disc space-y-0.5 text-[11px]">
                    {res.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
            No questions matching the selected filter ({filterType}).
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
              <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
                Validation Question Preview
              </h3>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              <QuestionPreview question={previewQuestion} />
            </div>
          </div>
        </div>
      )}

      {/* Quick Fix Modal */}
      {selectedQuestion && (
        <QuickFixModal
          question={selectedQuestion}
          existingQuestions={questions}
          onClose={() => setSelectedQuestion(null)}
          onSave={handleSaveFixedQuestion}
        />
      )}
    </div>
  );
}

// Quick Fix Inline Modal
interface QuickFixModalProps {
  question: AdminQuestion;
  existingQuestions: AdminQuestion[];
  onClose: () => void;
  onSave: (updated: AdminQuestion) => void;
}

function QuickFixModal({ question, existingQuestions, onClose, onSave }: QuickFixModalProps) {
  const [form, setForm] = useState<AdminQuestion>({ ...question, options: { ...question.options } });

  const validation = validateQuestion(form, existingQuestions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
          <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
            Fix Question: {form.id}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4 text-xs">
          {/* Validation Status */}
          <div
            className={`rounded-lg border p-3 ${
              validation.status === 'ERROR'
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300'
                : validation.status === 'WARNING'
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              Status: {validation.status}
            </div>
            {validation.errors.map((e, i) => (
              <div key={i} className="text-[11px] mt-0.5">• {e}</div>
            ))}
            {validation.warnings.map((w, i) => (
              <div key={i} className="text-[11px] mt-0.5 opacity-90">• Notice: {w}</div>
            ))}
          </div>

          <div>
            <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
              Question Text
            </label>
            <textarea
              rows={2}
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-medium"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2">
            {(['A', 'B', 'C', 'D'] as const).map((optKey) => (
              <div key={optKey}>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-0.5">
                  Option {optKey} {form.correctAnswer === optKey && '(Correct Answer)'}
                </label>
                <input
                  type="text"
                  value={form.options[optKey]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      options: { ...form.options, [optKey]: e.target.value },
                    })
                  }
                  className={`w-full rounded border p-1.5 text-xs ${
                    form.correctAnswer === optKey
                      ? 'border-emerald-500 bg-emerald-500/5 font-semibold'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--background))]'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Correct Answer Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                Correct Answer Key
              </label>
              <select
                value={form.correctAnswer}
                onChange={(e) => setForm({ ...form, correctAnswer: e.target.value as any })}
                className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                Publication Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5"
              >
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="REVIEW">REVIEW</option>
                <option value="DRAFT">DRAFT</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
              Explanation (हल)
            </label>
            <textarea
              rows={2}
              value={form.explanation}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
            />
          </div>

          <div>
            <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
              Important Key Point
            </label>
            <input
              type="text"
              value={form.importantPoint || ''}
              onChange={(e) => setForm({ ...form, importantPoint: e.target.value })}
              className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[hsl(var(--border))] p-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[hsl(var(--border))] px-3.5 py-1.5 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={validation.status === 'ERROR'}
            className="rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
          >
            Save Corrections
          </button>
        </div>
      </div>
    </div>
  );
}
