import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileCheck2,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  FolderTree,
  GraduationCap,
  Layers,
  Sparkles,
  Upload,
} from 'lucide-react';
import { getAdminActivity, getAdminStats } from '../services/admin-service';
import type { AdminActivityLog, AdminDashboardStats } from '../types';

interface AdminDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export function AdminDashboard({ onNavigateTab }: AdminDashboardProps) {
  const stats: AdminDashboardStats = getAdminStats();
  const activityLogs: AdminActivityLog[] = getAdminActivity();

  return (
    <div className="space-y-8" data-testid="admin-dashboard-view">
      {/* Top Banner with Architecture Context */}
      <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--primary)/0.08)] via-[hsl(var(--primary)/0.03)] to-transparent p-6 sm:p-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary)/0.15)] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
            <Sparkles className="h-3.5 w-3.5" />
            Module 12 • Educational Content Engine
          </span>
          <h1 className="mt-2.5 text-2xl font-black tracking-tight text-[hsl(var(--foreground))] sm:text-3xl">
            ExamSetu4U Content Management & Architecture
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
            Structured administrative hub for managing curriculum hierarchies, study notes, verified PYQs,
            practice MCQs, and full mock test blueprints. High-performance architecture ready for large datasets (100–10,000+ items) with zero fake counts.
          </p>
        </div>
      </div>

      {/* Dynamic Summary Cards (Real Available Data) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
            <Layers className="h-4 w-4 text-[hsl(var(--primary))]" />
            Live Repository Metrics (Verified Real Data)
          </h2>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            Calculated dynamically • No synthetic placeholders
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {/* Total Exams */}
          <div
            onClick={() => onNavigateTab('exams')}
            className="group cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition hover:border-[hsl(var(--primary))] hover:shadow-md"
            data-testid="stat-card-exams"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              <span>Total Exams</span>
              <GraduationCap className="h-4 w-4 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[hsl(var(--foreground))]">
              {stats.totalExams}
            </div>
            <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))] flex items-center justify-between">
              <span>Core exam paths</span>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Total Subjects */}
          <div
            onClick={() => onNavigateTab('subjects')}
            className="group cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition hover:border-[hsl(var(--primary))] hover:shadow-md"
            data-testid="stat-card-subjects"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              <span>Total Subjects</span>
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[hsl(var(--foreground))]">
              {stats.totalSubjects}
            </div>
            <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))] flex items-center justify-between">
              <span>Mapped disciplines</span>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Total Topics */}
          <div
            onClick={() => onNavigateTab('topics')}
            className="group cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition hover:border-[hsl(var(--primary))] hover:shadow-md"
            data-testid="stat-card-topics"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              <span>Total Topics</span>
              <FolderTree className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[hsl(var(--foreground))]">
              {stats.totalTopics}
            </div>
            <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))] flex items-center justify-between">
              <span>Syllabus units</span>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Study Material Items */}
          <div
            onClick={() => onNavigateTab('study-material')}
            className="group cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition hover:border-[hsl(var(--primary))] hover:shadow-md"
            data-testid="stat-card-study-material"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              <span>Study Materials</span>
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[hsl(var(--foreground))]">
              {stats.studyMaterialItems}
            </div>
            <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))] flex items-center justify-between">
              <span>Active notes</span>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Mock Tests */}
          <div
            onClick={() => onNavigateTab('mock-tests')}
            className="group cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition hover:border-[hsl(var(--primary))] hover:shadow-md"
            data-testid="stat-card-mock-tests"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              <span>Mock Tests</span>
              <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[hsl(var(--foreground))]">
              {stats.mockTests}
            </div>
            <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))] flex items-center justify-between">
              <span>Active test presets</span>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Verified PYQs */}
          <div
            onClick={() => onNavigateTab('questions')}
            className="group cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition hover:border-[hsl(var(--primary))] hover:shadow-md"
            data-testid="stat-card-pyqs"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              <span>Authentic PYQs</span>
              <Award className="h-4 w-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[hsl(var(--foreground))]">
              {stats.pyqItems}
            </div>
            <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))] flex items-center justify-between">
              <span>Past year items</span>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Quiz & Practice Items */}
          <div
            onClick={() => onNavigateTab('questions')}
            className="group cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition hover:border-[hsl(var(--primary))] hover:shadow-md"
            data-testid="stat-card-quiz-items"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              <span>Quiz & Practice MCQs</span>
              <FileQuestion className="h-4 w-4 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[hsl(var(--foreground))]">
              {stats.quizItems}
            </div>
            <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))] flex items-center justify-between">
              <span>Questions</span>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Published Content */}
          <div
            onClick={() => onNavigateTab('questions')}
            className="group cursor-pointer rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-sm transition hover:border-emerald-500 hover:shadow-md"
            data-testid="stat-card-published"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span>Published Content</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">
              {stats.publishedCount}
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">
              Live in student portal
            </div>
          </div>

          {/* Draft Content */}
          <div
            onClick={() => onNavigateTab('questions')}
            className="group cursor-pointer rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition hover:border-[hsl(var(--primary))] hover:shadow-md"
            data-testid="stat-card-drafts"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))]">
              <span>Draft Content</span>
              <FileText className="h-4 w-4 text-slate-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-2 text-2xl font-extrabold text-[hsl(var(--foreground))]">
              {stats.draftCount}
            </div>
            <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
              In progress / pending review
            </div>
          </div>

          {/* Validation Status */}
          <div
            onClick={() => onNavigateTab('validation')}
            className={`group cursor-pointer rounded-xl border p-4 shadow-sm transition hover:shadow-md ${
              stats.validationErrors > 0
                ? 'border-rose-500/40 bg-rose-500/5 hover:border-rose-500'
                : 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500'
            }`}
            data-testid="stat-card-validation"
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={stats.validationErrors > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}>
                Validation Errors
              </span>
              {stats.validationErrors > 0 ? (
                <AlertTriangle className="h-4 w-4 text-rose-600 group-hover:scale-110 transition-transform" />
              ) : (
                <FileCheck2 className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              )}
            </div>
            <div className={`mt-2 text-2xl font-extrabold ${stats.validationErrors > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              {stats.validationErrors}
            </div>
            <div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))] flex items-center justify-between">
              <span>{stats.validationErrors > 0 ? 'Requires attention' : '100% Valid'}</span>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div>
        <h2 className="text-base font-bold text-[hsl(var(--foreground))] mb-4 flex items-center gap-2">
          <Database className="h-4 w-4 text-[hsl(var(--primary))]" />
          Administrative Quick Actions
        </h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <button
            onClick={() => onNavigateTab('exams')}
            className="flex flex-col items-start gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent)/0.05)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[hsl(var(--foreground))]">Manage Exams</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Hierarchy, categories & status</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('subjects')}
            className="flex flex-col items-start gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent)/0.05)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[hsl(var(--foreground))]">Manage Subjects</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Exam filtering & descriptions</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('topics')}
            className="flex flex-col items-start gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent)/0.05)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <FolderTree className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[hsl(var(--foreground))]">Manage Topics</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Sub-syllabus unit alignment</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('study-material')}
            className="flex flex-col items-start gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent)/0.05)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[hsl(var(--foreground))]">Study Material</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Notes editor & student preview</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('questions')}
            className="flex flex-col items-start gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent)/0.05)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <FileQuestion className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[hsl(var(--foreground))]">Manage Questions</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">PYQs, MCQs & pedagogical facts</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('mock-tests')}
            className="flex flex-col items-start gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent)/0.05)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[hsl(var(--foreground))]">Mock Tests</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Exam configs & timing rules</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('validation')}
            className="flex flex-col items-start gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent)/0.05)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[hsl(var(--foreground))]">Content Validation</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Integrity audit & schema checks</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('import-export')}
            className="flex flex-col items-start gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left transition hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent)/0.05)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[hsl(var(--foreground))]">Import & Export</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">JSON/CSV batch pipelines</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('google-sheets')}
            className="flex flex-col items-start gap-2 rounded-xl border border-emerald-300/80 bg-emerald-50/30 dark:border-emerald-800/60 dark:bg-emerald-950/20 p-4 text-left transition hover:border-emerald-500 hover:bg-emerald-50/60"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[hsl(var(--foreground))]">Google Sheets Bank</div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Module 19 external CSV sync</p>
            </div>
          </button>
        </div>
      </div>

      {/* Dataset Readiness Note (Module 12 Safe Architecture) */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-900 dark:text-blue-200">
        <div className="flex items-center gap-2 font-bold">
          <Database className="h-4 w-4 text-blue-600" />
          Bulk Dataset Readiness Status:
        </div>
        <p className="mt-1 leading-relaxed">
          The Content Management Architecture is fully staged to support large scale datasets (100, 1,000, 5,000, 10,000+ questions)
          via chunked validators and virtualized pagination. In adherence with Module 12 directives, synthetic bulk questions have not been generated yet.
          The 1,000 Super TET question pipeline is ready to be securely uploaded when authorized.
        </p>
      </div>

      {/* Recent Activity / Audit Change Preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
            <Clock className="h-4 w-4 text-[hsl(var(--primary))]" />
            Audit & Change History
          </h2>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            Local session audit log
          </span>
        </div>

        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] divide-y divide-[hsl(var(--border))] shadow-sm">
          {activityLogs.slice(0, 6).map((log) => (
            <div key={log.id} className="flex items-center justify-between p-3.5 text-xs">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] ${
                    log.action === 'CREATED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : log.action === 'UPDATED'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : log.action === 'IMPORTED'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {log.action}
                </span>

                <div>
                  <div className="font-semibold text-[hsl(var(--foreground))]">
                    [{log.entityType}] {log.entityTitle}
                  </div>
                  {log.details && (
                    <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      {log.details}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right text-[11px] font-mono text-[hsl(var(--muted-foreground))]">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
