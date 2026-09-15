import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileSpreadsheet,
  HelpCircle,
  Info,
  Layers,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import React, { useId, useMemo, useState } from 'react';
import { GOOGLE_SHEET_CSV_URL, GOOGLE_SHEET_QUESTION_SOURCES } from '@/config/google-sheet-config';
import { getAllQuizQuestions } from '@/data/quiz/questions';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import {
  REQUIRED_SHEET_HEADERS,
  generateSampleGoogleSheetCSV,
  getEffectiveSheetUrl,
  setSessionSheetUrlOverride,
} from '@/services/google-sheet-loader';
import { generateSampleStudyNotesCSV } from '@/services/study-notes-loader';
import type { GoogleSheetRowValidation } from '@/types/google-sheet';

export function GoogleSheetManager() {
  const {
    report,
    status,
    statusMessage,
    isLoading,
    isConfigured,
    publishedSheetCount,
    totalRows,
    activeUrl,
    refresh,
  } = useQuestionBank();

  const [testUrlInput, setTestUrlInput] = useState(activeUrl);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'diagnostics' | 'guide'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const testUrlInputId = useId();
  const searchInputId = useId();
  const statusFilterId = useId();
  const difficultyFilterId = useId();

  // All active quiz questions (Local + Sheet)
  const totalPlatformQuestions = useMemo(() => {
    return getAllQuizQuestions().length;
  }, [publishedSheetCount]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleApplyTestUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = testUrlInput.trim();
    if (trimmed === GOOGLE_SHEET_CSV_URL.trim() || trimmed === '') {
      setSessionSheetUrlOverride(null);
    } else {
      setSessionSheetUrlOverride(trimmed);
    }
    await handleRefresh();
  };

  const handleResetToConfigUrl = async () => {
    setSessionSheetUrlOverride(null);
    setTestUrlInput(GOOGLE_SHEET_CSV_URL);
    await handleRefresh();
  };

  const handleCopyHeaders = async () => {
    try {
      await navigator.clipboard.writeText(REQUIRED_SHEET_HEADERS.join(','));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownloadSampleCSV = () => {
    const csvContent = generateSampleGoogleSheetCSV();
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'examsetu4u-question-bank-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadNotesCSV = () => {
    const csvContent = generateSampleStudyNotesCSV();
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'examsetu4u-study-notes-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter validations / questions
  const filteredValidations = useMemo(() => {
    if (!report?.validations) return [];
    return report.validations.filter((v) => {
      if (filterStatus === 'PUBLISHED' && !v.isPublished) return false;
      if (filterStatus === 'DRAFT' && v.status !== 'DRAFT') return false;
      if (filterStatus === 'REVIEW' && v.status !== 'REVIEW') return false;
      if (filterStatus === 'ARCHIVED' && v.status !== 'ARCHIVED') return false;
      if (filterStatus === 'INVALID' && v.isValid) return false;

      if (filterDifficulty !== 'ALL' && v.convertedMCQ?.difficulty !== filterDifficulty) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const text = `${v.id} ${v.questionPreview || ''} ${v.convertedMCQ?.question || ''} ${v.convertedMCQ?.examName || ''} ${v.convertedMCQ?.topicId || ''}`.toLowerCase();
        if (!text.includes(query)) return false;
      }

      return true;
    });
  }, [report, filterStatus, filterDifficulty, searchQuery]);

  // Column definitions for the help guide
  const columnDescriptions = [
    { name: 'id', req: 'Required', example: 'ST-SK-1001', desc: 'Unique question ID. Must not conflict with existing questions.' },
    { name: 'examId', req: 'Required', example: 'super-tet', desc: 'Target exam slug: super-tet, ctet, uptet, ssc-cgl, cbse-class-10, uppcs-pre, etc.' },
    { name: 'subjectId', req: 'Required', example: 'super-tet-teaching-skills', desc: 'Target subject ID defined in curriculum.' },
    { name: 'topicId', req: 'Required', example: 'super-tet-teaching-skills-1', desc: 'Target topic ID within the subject.' },
    { name: 'question', req: 'Required', example: 'शिक्षण की त्रिध्रुवीय प्रक्रिया...', desc: 'Full MCQ question prompt. Supports Hindi, English and Unicode.' },
    { name: 'optionA', req: 'Required', example: 'शिक्षक, शिक्षार्थी...', desc: 'Text for Option A.' },
    { name: 'optionB', req: 'Required', example: 'शिक्षक, शिक्षार्थी...', desc: 'Text for Option B.' },
    { name: 'optionC', req: 'Required', example: 'शिक्षक, विद्यालय...', desc: 'Text for Option C.' },
    { name: 'optionD', req: 'Required', example: 'पाठ्यपुस्तक...', desc: 'Text for Option D.' },
    { name: 'correctAnswer', req: 'Required', example: 'B', desc: 'Single uppercase letter: A, B, C, or D.' },
    { name: 'explanation', req: 'Recommended', example: 'जॉन डीवी के अनुसार...', desc: 'Comprehensive step-by-step conceptual explanation.' },
    { name: 'importantPoint', req: 'Recommended', example: 'एडम्स = द्विध्रुवीय...', desc: 'High-yield exam takeaway / key memory anchor.' },
    { name: 'additionalFact', req: 'Optional', example: 'एन. एल. गेज के अनुसार...', desc: 'Bonus context or syllabus link.' },
    { name: 'commonMistake', req: 'Recommended', example: 'अभिभावक को मुख्य ध्रुव...', desc: 'Common trap or misconception students fall into.' },
    { name: 'difficulty', req: 'Required', example: 'EASY / MODERATE / HARD', desc: 'Accepted values: EASY, MODERATE, HARD, VERY_HARD.' },
    { name: 'sourceType', req: 'Required', example: 'PRACTICE / PYQ / PYQ-BASED', desc: 'Use PYQ for authentic exam questions; PRACTICE for regular practice.' },
    { name: 'year', req: 'Required for PYQ', example: '2021', desc: 'Exam year (e.g. 2019, 2021). Mandatory if sourceType is PYQ.' },
    { name: 'examName', req: 'Required for PYQ', example: 'Super TET Official', desc: 'Display name of official exam. Mandatory if sourceType is PYQ.' },
    { name: 'status', req: 'Required', example: 'PUBLISHED', desc: 'DRAFT | REVIEW | PUBLISHED | ARCHIVED. Only PUBLISHED rows reach students!' },
    { name: 'sourceName', req: 'Optional', example: 'ExamSetu Question Team', desc: 'Attribution or contributor name.' },
    { name: 'diagramRequired', req: 'Optional', example: 'true / false', desc: 'Whether this question includes a diagram / image (defaults to false).' },
    { name: 'diagramType', req: 'Optional', example: 'image', desc: 'Type of diagram: image, circuit, geometry, biology, etc.' },
    { name: 'diagramData', req: 'Optional', example: '', desc: 'Optional structured JSON or parameters for procedural diagram renderers.' },
    { name: 'diagramCaption', req: 'Optional', example: 'Figure 1.6: Setup of Electrolysis', desc: 'Caption displayed underneath the diagram.' },
    { name: 'diagramAltText', req: 'Optional', example: 'Diagram showing anode, cathode...', desc: 'Screen reader accessibility description.' },
    { name: 'diagramImageUrl', req: 'Optional', example: 'https://images.unsplash.com/...', desc: 'Direct public image URL (Google Drive direct link, Cloudinary, Imgur, S3, or public CDN).' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-2xl">
              Google Sheets Question Bank
            </h1>
          </div>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
            Module 19 — Add new MCQ questions every day from a Google Sheet without rebuilding the app.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="refresh-sheet-btn"
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Question Bank</span>
          </button>

          <button
            id="download-template-csv-btn"
            onClick={handleDownloadSampleCSV}
            title="Download Questions CSV template with 26 columns (including diagram support)"
            className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-2 text-xs font-semibold text-[hsl(var(--foreground))] shadow-sm transition hover:bg-[hsl(var(--muted))]"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Download Questions CSV</span>
          </button>

          <button
            id="download-notes-csv-btn"
            onClick={handleDownloadNotesCSV}
            title="Download Study Notes & Theory CSV template with 12 columns (including diagram support)"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-950/30 px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm transition hover:bg-blue-100/70"
          >
            <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Download Notes CSV</span>
          </button>
        </div>
      </div>

      {/* Connection & Loading Status Banner */}
      <div
        id="google-sheet-status-banner"
        className={`rounded-xl border p-4 sm:p-5 shadow-sm transition-all ${
          status === 'loading' || isRefreshing
            ? 'border-blue-300 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-950/30'
            : status === 'success'
            ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30'
            : status === 'empty'
            ? 'border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/30'
            : status === 'error'
            ? 'border-rose-300 bg-rose-50/60 dark:border-rose-800 dark:bg-rose-950/30'
            : 'border-amber-200 bg-amber-50/40 dark:border-amber-800/40 dark:bg-amber-950/20'
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {status === 'loading' || isRefreshing ? (
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
              ) : status === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : status === 'empty' ? (
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              ) : status === 'error' ? (
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              ) : (
                <Info className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-sm text-[hsl(var(--foreground))]">
                  {status === 'loading' || isRefreshing
                    ? 'Loading questions...'
                    : status === 'success'
                    ? 'Questions loaded successfully'
                    : status === 'empty'
                    ? 'No published questions found'
                    : status === 'error'
                    ? 'Unable to load Google Sheet'
                    : 'Google Sheet Not Configured'}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    status === 'success'
                      ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300'
                      : status === 'loading'
                      ? 'bg-blue-600/15 text-blue-700 dark:text-blue-300'
                      : status === 'empty'
                      ? 'bg-amber-600/15 text-amber-700 dark:text-amber-300'
                      : status === 'error'
                      ? 'bg-rose-600/15 text-rose-700 dark:text-rose-300'
                      : 'bg-zinc-600/15 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {status.toUpperCase()}
                </span>
              </div>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
                {statusMessage}
              </p>
            </div>
          </div>

          {report?.lastFetchedAt && (
            <div className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--muted-foreground))]">
              <Clock className="h-3.5 w-3.5" />
              <span>Last fetched: {new Date(report.lastFetchedAt).toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Warning banner for malformed rows if any */}
        {report && report.malformedRowsCount > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-300/80 bg-amber-100/50 p-2.5 text-xs text-amber-900 dark:border-amber-700/60 dark:bg-amber-900/20 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                <strong>Warning:</strong> {report.malformedRowsCount} malformed row(s) skipped. Valid published questions remain active.
              </span>
            </div>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className="font-semibold underline hover:no-underline text-xs"
            >
              View diagnostics
            </button>
          </div>
        )}
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5">
          <div className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Total Sheet Rows</div>
          <div className="mt-1 text-xl font-black tracking-tight text-[hsl(var(--foreground))] sm:text-2xl">
            {totalRows}
          </div>
          <div className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">Parsed from CSV</div>
        </div>

        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/20 p-3.5 dark:border-emerald-800/40 dark:bg-emerald-950/20">
          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Published Active</div>
          <div className="mt-1 text-xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-2xl">
            {publishedSheetCount}
          </div>
          <div className="mt-1 text-[10px] text-emerald-600/80">Available to students</div>
        </div>

        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5">
          <div className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Draft / Review</div>
          <div className="mt-1 text-xl font-black tracking-tight text-[hsl(var(--foreground))] sm:text-2xl">
            {(report?.draftCount || 0) + (report?.reviewCount || 0)}
          </div>
          <div className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">
            {report?.draftCount || 0} drafts · {report?.reviewCount || 0} review
          </div>
        </div>

        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5">
          <div className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Archived / Skipped</div>
          <div className="mt-1 text-xl font-black tracking-tight text-[hsl(var(--foreground))] sm:text-2xl">
            {report?.archivedCount || 0}
          </div>
          <div className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">Not shown in quiz</div>
        </div>

        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5">
          <div className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">Malformed Rows</div>
          <div className={`mt-1 text-xl font-black tracking-tight sm:text-2xl ${
            (report?.malformedRowsCount || 0) > 0 ? 'text-amber-600' : 'text-[hsl(var(--foreground))]'
          }`}>
            {report?.malformedRowsCount || 0}
          </div>
          <div className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">
            {(report?.duplicateIdsCount || 0) > 0 ? `${report?.duplicateIdsCount} duplicate IDs` : 'Zero errors'}
          </div>
        </div>

        <div className="rounded-xl border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.03)] p-3.5">
          <div className="text-[11px] font-semibold text-[hsl(var(--primary))]">Total in System</div>
          <div className="mt-1 text-xl font-black tracking-tight text-[hsl(var(--foreground))] sm:text-2xl">
            {totalPlatformQuestions}
          </div>
          <div className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">Local + Google Sheets</div>
        </div>
      </div>

      {/* Live Configuration & URL Testing Box */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[hsl(var(--foreground))]">Configured Data Source</span>
              {isConfigured ? (
                <span className="rounded bg-emerald-600/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  Custom Sheet Linked
                </span>
              ) : (
                <span className="rounded bg-amber-600/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                  Default Placeholder
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
              Permanent source code location:{' '}
              <code className="rounded bg-[hsl(var(--muted))] px-1 py-0.5 text-[11px] font-mono text-[hsl(var(--foreground))]">
                /artifacts/examsetu4u/src/config/google-sheet-config.ts
              </code>
            </p>
          </div>

          <button
            onClick={handleCopyHeaders}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
          >
            <Copy className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
            <span>{copySuccess ? 'Headers Copied!' : 'Copy 20 Headers'}</span>
          </button>
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleApplyTestUrl} className="mt-4 space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <label htmlFor={testUrlInputId} className="sr-only">
                Google Sheet Published CSV URL
              </label>
              <input
                id={testUrlInputId}
                type="text"
                value={testUrlInput}
                onChange={(e) => setTestUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-xs font-mono text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isLoading || isRefreshing}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
                <span>Fetch & Test Live</span>
              </button>

              {activeUrl !== GOOGLE_SHEET_CSV_URL && (
                <button
                  type="button"
                  onClick={handleResetToConfigUrl}
                  className="rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-[hsl(var(--muted-foreground))]">
            <span>
              Tip: Test any published Google Sheet CSV URL right here in your browser without restarting the dev server!
            </span>
            {activeUrl && activeUrl.startsWith('http') && (
              <a
                href={activeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[hsl(var(--primary))] hover:underline"
              >
                <span>Open raw CSV in new tab</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </form>

        {/* Connected Multi-Tab Sources */}
        {GOOGLE_SHEET_QUESTION_SOURCES && GOOGLE_SHEET_QUESTION_SOURCES.length > 0 && (
          <div className="mt-4 border-t border-[hsl(var(--border))] pt-3">
            <div className="text-[11px] font-semibold text-[hsl(var(--foreground))] mb-2 flex items-center gap-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span>Active Auto-Synced Tabs ({GOOGLE_SHEET_QUESTION_SOURCES.length}):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {GOOGLE_SHEET_QUESTION_SOURCES.map((source) => {
                const isActive = activeUrl === source.url;
                return (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => {
                      setTestUrlInput(source.url);
                      setSessionSheetUrlOverride(source.url);
                      refresh();
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                    }`}
                  >
                    <span>{source.name}</span>
                    <span className="text-[10px] opacity-70 font-mono">gid={source.gid}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[hsl(var(--border))] gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
              : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Integration Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'preview'
              ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
              : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Questions Browser ({report?.validations.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'diagnostics'
              ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
              : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Diagnostics & Errors ({report?.malformedRowsCount || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'guide'
              ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
              : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Setup Guide & Columns (8 Steps)</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Summary of Supported Exams */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
            <h3 className="font-bold text-sm text-[hsl(var(--foreground))]">
              Supported Tracks in Single Google Sheet
            </h3>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              ExamSetu4U uses the <code className="font-mono text-[hsl(var(--foreground))]">examId</code>,{' '}
              <code className="font-mono text-[hsl(var(--foreground))]">subjectId</code>, and{' '}
              <code className="font-mono text-[hsl(var(--foreground))]">topicId</code> columns to automatically route questions to student practice modes.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'UPTET / CTET / Super TET', examId: 'super-tet / ctet / uptet', desc: 'Teaching skills, CDP, Hindi, Math, EVS' },
                { name: 'SSC CGL', examId: 'ssc-cgl', desc: 'Reasoning, General Awareness, Quant, English' },
                { name: 'CBSE Class 10', examId: 'cbse-class-10', desc: 'Math, Science, Social Science, Hindi, English' },
                { name: 'CBSE Class 12', examId: 'cbse-class-12', desc: 'Physics, Chemistry, Math, Biology, English' },
                { name: 'UPPCS Pre', examId: 'uppcs-pre', desc: 'General Studies I, CSAT Paper II' },
                { name: 'UPPCS Mains', examId: 'uppcs-mains', desc: 'General Hindi, Essay, GS Papers I - IV' },
              ].map((item, idx) => (
                <div key={idx} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-3">
                  <div className="font-semibold text-xs text-[hsl(var(--foreground))]">{item.name}</div>
                  <div className="mt-1 font-mono text-[10px] text-[hsl(var(--primary))]">{item.examId}</div>
                  <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick 8 Steps Summary */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[hsl(var(--foreground))]">
                How Daily Question Publishing Works
              </h3>
              <button
                onClick={() => setActiveTab('guide')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))] hover:underline"
              >
                <span>View Full Column Spec</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: '1', title: 'Create / Open Sheet', desc: 'Keep the 20 exact columns in row 1.' },
                { step: '2', title: 'Add Rows Daily', desc: 'Fill question, options A-D, answer, explanation.' },
                { step: '3', title: 'Set status = PUBLISHED', desc: 'Drafts/review rows stay hidden from students.' },
                { step: '4', title: 'Publish as CSV', desc: 'File > Share > Publish to web > CSV.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary)/0.15)] font-bold text-xs text-[hsl(var(--primary))]">
                    {s.step}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[hsl(var(--foreground))]">{s.title}</div>
                    <div className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS PREVIEW */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <label htmlFor={searchInputId} className="sr-only">
                Search questions
              </label>
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              <input
                id={searchInputId}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by question text, ID, topic, exam..."
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-9 pr-3 py-1.5 text-xs text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <label htmlFor={statusFilterId} className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  Status:
                </label>
                <select
                  id={statusFilterId}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PUBLISHED">PUBLISHED (Students)</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                  <option value="INVALID">INVALID / Malformed</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label htmlFor={difficultyFilterId} className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  Difficulty:
                </label>
                <select
                  id={difficultyFilterId}
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none"
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                  <option value="Very Hard">Very Hard</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions List */}
          {filteredValidations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center">
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                No questions matching the selected filters.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredValidations.map((v) => {
                const isExpanded = expandedRow === v.rowNumber;
                return (
                  <div
                    key={v.rowNumber}
                    className={`rounded-xl border transition-all ${
                      v.isPublished
                        ? 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
                        : v.isValid
                        ? 'border-amber-200/70 bg-amber-50/10'
                        : 'border-rose-200 bg-rose-50/20'
                    }`}
                  >
                    <div
                      onClick={() => setExpandedRow(isExpanded ? null : v.rowNumber)}
                      className="flex cursor-pointer flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[10px] font-mono text-[hsl(var(--muted-foreground))]">
                          #{v.rowNumber}
                        </span>

                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-[hsl(var(--foreground))]">
                              {v.id}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                v.status === 'PUBLISHED'
                                  ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300'
                                  : v.status === 'DRAFT'
                                  ? 'bg-zinc-600/15 text-zinc-700 dark:text-zinc-300'
                                  : v.status === 'REVIEW'
                                  ? 'bg-blue-600/15 text-blue-700 dark:text-blue-300'
                                  : 'bg-amber-600/15 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              {v.status}
                            </span>

                            {v.convertedMCQ?.examName && (
                              <span className="rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                                {v.convertedMCQ.examName}
                              </span>
                            )}

                            {v.convertedMCQ?.difficulty && (
                              <span className="rounded bg-sky-600/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                                {v.convertedMCQ.difficulty}
                              </span>
                            )}

                            {v.convertedMCQ?.sourceType && (
                              <span className="rounded bg-indigo-600/10 px-1.5 py-0.5 text-[10px] text-indigo-700 dark:text-indigo-300">
                                {v.convertedMCQ.sourceType} {v.convertedMCQ.year ? `(${v.convertedMCQ.year})` : ''}
                              </span>
                            )}
                          </div>

                          <p className="mt-1.5 text-xs text-[hsl(var(--foreground))] line-clamp-2">
                            {v.questionPreview || 'Question text unavailable'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        {v.errors.length > 0 && (
                          <span className="rounded bg-rose-600/15 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                            {v.errors.length} error(s)
                          </span>
                        )}
                        <span className="rounded-full p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]">
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    {isExpanded && (
                      <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.2)] p-4 text-xs space-y-3">
                        {/* Errors or Warnings */}
                        {v.errors.length > 0 && (
                          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                            <div className="font-bold">Errors:</div>
                            <ul className="mt-1 list-disc list-inside space-y-0.5">
                              {v.errors.map((err, i) => (
                                <li key={i}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {v.warnings.length > 0 && (
                          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                            <div className="font-bold">Warnings:</div>
                            <ul className="mt-1 list-disc list-inside space-y-0.5">
                              {v.warnings.map((warn, i) => (
                                <li key={i}>{warn}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Options preview */}
                        {v.convertedMCQ && (
                          <div className="space-y-2">
                            <div className="font-semibold text-[hsl(var(--foreground))]">Options:</div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                                const isCorrect = v.convertedMCQ?.correctAnswer === optKey;
                                return (
                                  <div
                                    key={optKey}
                                    className={`rounded-lg border p-2.5 text-xs ${
                                      isCorrect
                                        ? 'border-emerald-500 bg-emerald-50/50 font-semibold text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-200'
                                        : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]'
                                    }`}
                                  >
                                    <span className="font-bold">{optKey}:</span>{' '}
                                    {v.convertedMCQ?.options[optKey]}
                                    {isCorrect && (
                                      <span className="ml-2 inline-flex items-center text-[10px] font-extrabold text-emerald-600">
                                        ✓ CORRECT ANSWER
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {v.convertedMCQ.explanation && (
                              <div className="mt-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
                                <div className="font-semibold text-[hsl(var(--foreground))]">Explanation:</div>
                                <p className="mt-1 text-[hsl(var(--muted-foreground))]">
                                  {v.convertedMCQ.explanation}
                                </p>
                              </div>
                            )}

                            {v.convertedMCQ.importantPoint && (
                              <div className="rounded-lg border border-amber-200/60 bg-amber-50/30 p-2.5 dark:border-amber-800/40 dark:bg-amber-950/20">
                                <span className="font-bold text-amber-800 dark:text-amber-300">Important Point: </span>
                                <span className="text-[hsl(var(--foreground))]">{v.convertedMCQ.importantPoint}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DIAGNOSTICS & AUDIT */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
            <h3 className="font-bold text-sm text-[hsl(var(--foreground))]">
              Google Sheet Data Quality Audit
            </h3>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              Rows with errors are safely ignored so they never crash the website for students.
            </p>

            {report && report.malformedRowsCount === 0 && report.duplicateIdsCount === 0 ? (
              <div className="mt-4 flex items-center gap-2.5 rounded-lg border border-emerald-300/80 bg-emerald-50/50 p-4 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>All parsed rows in the Google Sheet satisfy required validation constraints!</span>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {report?.validations
                  .filter((v) => !v.isValid || v.errors.length > 0 || v.warnings.length > 0)
                  .map((v) => (
                    <div
                      key={v.rowNumber}
                      className="rounded-lg border border-amber-300 bg-amber-50/40 p-3 text-xs dark:border-amber-800 dark:bg-amber-950/20"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>
                          Row #{v.rowNumber} — ID: <code className="font-mono">{v.id}</code>
                        </span>
                        <span className="rounded bg-rose-600/10 px-2 py-0.5 text-[10px] text-rose-700 dark:text-rose-300">
                          {v.errors.length > 0 ? 'INVALID ROW' : 'WARNING'}
                        </span>
                      </div>
                      {v.errors.length > 0 && (
                        <ul className="mt-2 list-disc list-inside text-rose-700 dark:text-rose-300 space-y-0.5">
                          {v.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      )}
                      {v.warnings.length > 0 && (
                        <ul className="mt-1 list-disc list-inside text-amber-700 dark:text-amber-300 space-y-0.5">
                          {v.warnings.map((warn, i) => (
                            <li key={i}>{warn}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SETUP GUIDE & COLUMNS */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* 8 Clear Steps */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
            <h3 className="font-bold text-sm text-[hsl(var(--foreground))]">
              8 Steps to Setup and Update Your Google Sheet Question Bank
            </h3>
            <div className="mt-4 space-y-3">
              {[
                { step: '1', title: 'Create or Open the Google Sheet', desc: 'Create a new Google Spreadsheet or open an existing one.' },
                { step: '2', title: 'Keep Exact Column Headers in Row 1', desc: 'Row 1 must contain exactly the 20 columns listed below without typos.' },
                { step: '3', title: 'Add Questions as New Rows', desc: 'Input your questions, options A, B, C, D, correctAnswer (A/B/C/D), explanation, etc.' },
                { step: '4', title: 'Set status = PUBLISHED when Ready', desc: 'Rows with status DRAFT or REVIEW will stay hidden from students until set to PUBLISHED.' },
                { step: '5', title: 'Publish the Google Sheet as CSV', desc: 'Go to File > Share > Publish to web. Under "Link", select "Entire Document" (or tab) and change "Web page" to "Comma-separated values (.csv)". Click Publish.' },
                { step: '6', title: 'Paste CSV URL into Project Configuration', desc: 'Open /artifacts/examsetu4u/src/config/google-sheet-config.ts and paste the URL in GOOGLE_SHEET_CSV_URL. (Or test it immediately in the URL field above).' },
                { step: '7', title: 'Save / Deploy the Website', desc: 'Save your configuration and deploy/run the app.' },
                { step: '8', title: 'New Published Questions Are Instantly Available', desc: 'Students can now practice your new questions in quizzes, mock tests, weak topic drills, and search!' },
              ].map((item) => (
                <div key={item.step} className="flex gap-3 text-xs">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] font-bold text-white text-[11px]">
                    {item.step}
                  </div>
                  <div>
                    <span className="font-bold text-[hsl(var(--foreground))]">{item.title}: </span>
                    <span className="text-[hsl(var(--muted-foreground))]">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 20 Column Spec Table */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm overflow-hidden">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-[hsl(var(--foreground))]">
                  Google Sheet Column Specification (20 Columns)
                </h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  All 20 headers must appear in row 1 of your spreadsheet.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyHeaders}
                  className="rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                >
                  {copySuccess ? 'Copied!' : 'Copy Header Row'}
                </button>
                <button
                  onClick={handleDownloadSampleCSV}
                  className="rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90"
                >
                  Download CSV Template
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] text-[hsl(var(--foreground))]">
                    <th className="py-2.5 px-3 font-bold">#</th>
                    <th className="py-2.5 px-3 font-bold">Column Name</th>
                    <th className="py-2.5 px-3 font-bold">Requirement</th>
                    <th className="py-2.5 px-3 font-bold">Example</th>
                    <th className="py-2.5 px-3 font-bold">Allowed / Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[hsl(var(--border))]">
                  {columnDescriptions.map((col, index) => (
                    <tr key={col.name} className="hover:bg-[hsl(var(--muted)/0.2)]">
                      <td className="py-2 px-3 text-[hsl(var(--muted-foreground))]">{index + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-[hsl(var(--foreground))]">{col.name}</td>
                      <td className="py-2 px-3">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          col.req.includes('Required')
                            ? 'bg-rose-600/10 text-rose-700 dark:text-rose-300'
                            : 'bg-zinc-600/10 text-zinc-700 dark:text-zinc-300'
                        }`}>
                          {col.req}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-[hsl(var(--muted-foreground))]">{col.example}</td>
                      <td className="py-2 px-3 text-[hsl(var(--muted-foreground))]">{col.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
