import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BookOpen,
  Clock,
  Download,
  ExternalLink,
  FileCheck2,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  Menu,
  RotateCcw,
  Shield,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { resetAdminStoreToDefaults } from '../services/admin-service';
import { AdminDashboard } from './admin-dashboard';
import { ExamManager } from './exam-manager';
import { GoogleSheetManager } from './google-sheet-manager';
import { ImportExportHub } from './import-export-hub';
import { MockTestManager } from './mock-test-manager';
import { QuestionManager } from './question-manager';
import { StudyMaterialManager } from './study-material-manager';
import { SubjectManager } from './subject-manager';
import { TopicManager } from './topic-manager';
import { ValidationReport } from './validation-report';

interface AdminLayoutProps {
  onReturnToStudentApp: () => void;
}

export type AdminTabId =
  | 'overview'
  | 'exams'
  | 'subjects'
  | 'topics'
  | 'study-material'
  | 'questions'
  | 'google-sheets'
  | 'mock-tests'
  | 'validation'
  | 'import-export';

interface NavItem {
  id: AdminTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'exams', label: 'Exams', icon: GraduationCap },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'topics', label: 'Topics', icon: FolderTree },
  { id: 'study-material', label: 'Study Material', icon: FileText },
  { id: 'questions', label: 'Questions & MCQs', icon: FileQuestion },
  { id: 'google-sheets', label: 'Google Sheets Bank', icon: FileSpreadsheet, badge: 'M19' },
  { id: 'mock-tests', label: 'Mock Tests', icon: Clock },
  { id: 'validation', label: 'Content Audit', icon: FileCheck2 },
  { id: 'import-export', label: 'Import / Export', icon: Download },
];

export function AdminLayout({ onReturnToStudentApp }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleTabClick = (tabId: AdminTabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetData = () => {
    resetAdminStoreToDefaults();
    setResetConfirmOpen(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/0.95)] backdrop-blur px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Brand & Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] lg:hidden"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div
              onClick={() => handleTabClick('overview')}
              className="flex cursor-pointer items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white font-bold text-sm shadow-sm">
                ES
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm sm:text-base">
                  <span>ExamSetu4U</span>
                  <span className="rounded bg-[hsl(var(--primary)/0.15)] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[hsl(var(--primary))]">
                    Admin
                  </span>
                </div>
                <div className="hidden text-[10px] text-[hsl(var(--muted-foreground))] sm:block">
                  Educational Content Management Architecture
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Reset + Return to Student App */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-2.5 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
              title="Reset Demo Data to Initial Curriculum"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Defaults
            </button>

            <button
              onClick={onReturnToStudentApp}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:opacity-90"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to Student App</span>
              <span className="sm:hidden">Student App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main App Body with Responsive Sidebar + Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Desktop Navigation Sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-sm">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Content Modules
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        isActive
                          ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                          : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
                      }`}
                      data-testid={`admin-nav-${item.id}`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-4 border-t border-[hsl(var(--border))] pt-3">
                <button
                  onClick={() => setResetConfirmOpen(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restore Factory State</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Mobile Drawer Navigation */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="relative z-10 flex w-4/5 max-w-xs flex-col bg-[hsl(var(--card))] p-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
                  <div className="font-bold text-sm">Admin Navigation</div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg p-1 hover:bg-[hsl(var(--muted))]"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="mt-4 space-y-1 overflow-y-auto">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold ${
                          isActive
                            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold'
                            : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-auto border-t border-[hsl(var(--border))] pt-4">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setResetConfirmOpen(true);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset All Demo Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Horizontal Pill Scroller on Mobile/Tablet */}
          <div className="flex overflow-x-auto pb-1 lg:hidden gap-1.5 no-scrollbar">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                    isActive
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <main className="min-w-0 flex-1">
            {activeTab === 'overview' && (
              <AdminDashboard onNavigateTab={(tab) => handleTabClick(tab as AdminTabId)} />
            )}
            {activeTab === 'exams' && <ExamManager />}
            {activeTab === 'subjects' && <SubjectManager />}
            {activeTab === 'topics' && <TopicManager />}
            {activeTab === 'study-material' && <StudyMaterialManager />}
            {activeTab === 'questions' && <QuestionManager />}
            {activeTab === 'google-sheets' && <GoogleSheetManager />}
            {activeTab === 'mock-tests' && <MockTestManager />}
            {activeTab === 'validation' && <ValidationReport />}
            {activeTab === 'import-export' && <ImportExportHub />}
          </main>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
                Reset Demo Content to Defaults?
              </h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              This will restore all default curriculum tracks (UPTET/Super TET, SSC CGL, CBSE 10/12, UPPCS)
              and base practice questions from static project files. Any drafts created during this session will be cleared.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="rounded-lg border border-[hsl(var(--border))] px-3.5 py-1.5 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
