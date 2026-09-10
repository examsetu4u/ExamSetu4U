import {
  AlertCircle,
  AlertTriangle,
  Archive,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Filter,
  HelpCircle,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  archiveAdminQuestion,
  getAdminExams,
  getAdminQuestions,
  getAdminSubjects,
  getAdminTopics,
  saveAdminQuestion,
} from '../services/admin-service';
import { validateQuestion } from '../services/validation-service';
import type {
  AdminExam,
  AdminQuestion,
  AdminSubject,
  AdminTopic,
  ContentDifficulty,
  ContentSourceType,
  ContentStatus,
  ValidationResult,
} from '../types';
import { QuestionPreview } from './question-preview';

export function QuestionManager() {
  const exams: AdminExam[] = getAdminExams();
  const allSubjects: AdminSubject[] = getAdminSubjects();
  const allTopics: AdminTopic[] = getAdminTopics();

  const [questions, setQuestions] = useState<AdminQuestion[]>(() => getAdminQuestions());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals
  const [previewQuestion, setPreviewQuestion] = useState<AdminQuestion | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Partial<AdminQuestion> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<AdminQuestion | null>(null);

  const refreshQuestions = () => {
    setQuestions(getAdminQuestions());
  };

  // Cascading filters
  const availableSubjects = useMemo(() => {
    if (selectedExamId === 'ALL') return allSubjects;
    return allSubjects.filter((s) => s.examId === selectedExamId);
  }, [selectedExamId, allSubjects]);

  const availableTopics = useMemo(() => {
    if (selectedSubjectId === 'ALL') {
      if (selectedExamId === 'ALL') return allTopics;
      return allTopics.filter((t) => t.examId === selectedExamId);
    }
    return allTopics.filter((t) => t.subjectId === selectedSubjectId);
  }, [selectedExamId, selectedSubjectId, allTopics]);

  // Filtering
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedExamId !== 'ALL' && q.examId !== selectedExamId) return false;
      if (selectedSubjectId !== 'ALL' && q.subjectId !== selectedSubjectId) return false;
      if (selectedTopicId !== 'ALL' && q.topicId !== selectedTopicId) return false;
      if (selectedDifficulty !== 'ALL' && q.difficulty !== selectedDifficulty) return false;
      if (selectedSourceType !== 'ALL' && q.sourceType !== selectedSourceType) return false;
      if (selectedStatus !== 'ALL' && q.status !== selectedStatus) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesText = q.question.toLowerCase().includes(query);
        const matchesId = q.id.toLowerCase().includes(query);
        const matchesExam = q.examName?.toLowerCase().includes(query);
        const matchesOptions = Object.values(q.options).some((opt) =>
          opt.toLowerCase().includes(query)
        );
        return matchesText || matchesId || matchesExam || matchesOptions;
      }

      return true;
    });
  }, [
    questions,
    selectedExamId,
    selectedSubjectId,
    selectedTopicId,
    selectedDifficulty,
    selectedSourceType,
    selectedStatus,
    searchTerm,
  ]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  // Reset page on filter changes
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Live validation on the editing question
  const editingValidation: ValidationResult | null = useMemo(() => {
    if (!editingQuestion) return null;
    return validateQuestion(editingQuestion, questions);
  }, [editingQuestion, questions]);

  const handleOpenAdd = () => {
    const defaultExam = selectedExamId !== 'ALL' ? selectedExamId : exams[0]?.id || 'super-tet';
    const sub = allSubjects.find((s) => s.examId === defaultExam) || allSubjects[0];
    const top = allTopics.find((t) => t.subjectId === sub?.id) || allTopics[0];

    setEditingQuestion({
      id: `q-${Date.now()}`,
      examId: defaultExam,
      subjectId: sub?.id || '',
      topicId: top?.id || '',
      question: '',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A',
      explanation: '',
      importantPoint: '',
      additionalFact: '',
      commonMistake: '',
      difficulty: 'MODERATE',
      sourceType: 'PRACTICE',
      status: 'DRAFT',
    });
    setIsNew(true);
  };

  const handleOpenEdit = (q: AdminQuestion) => {
    setEditingQuestion({ ...q, options: { ...q.options } });
    setIsNew(false);
  };

  const handleSave = () => {
    if (!editingQuestion || !editingQuestion.question?.trim()) return;
    if (!editingValidation || editingValidation.status === 'ERROR') return;

    const finalQuestion: AdminQuestion = {
      id: editingQuestion.id?.trim() || `q-${Date.now()}`,
      examId: editingQuestion.examId || '',
      subjectId: editingQuestion.subjectId || '',
      topicId: editingQuestion.topicId || '',
      question: editingQuestion.question.trim(),
      options: {
        A: editingQuestion.options?.A?.trim() || '',
        B: editingQuestion.options?.B?.trim() || '',
        C: editingQuestion.options?.C?.trim() || '',
        D: editingQuestion.options?.D?.trim() || '',
      },
      correctAnswer: (editingQuestion.correctAnswer || 'A') as 'A' | 'B' | 'C' | 'D',
      explanation: editingQuestion.explanation?.trim() || '',
      importantPoint: editingQuestion.importantPoint?.trim() || '',
      additionalFact: editingQuestion.additionalFact?.trim() || '',
      commonMistake: editingQuestion.commonMistake?.trim() || '',
      difficulty: (editingQuestion.difficulty || 'MODERATE') as ContentDifficulty,
      sourceType: (editingQuestion.sourceType || 'PRACTICE') as ContentSourceType,
      year: editingQuestion.year ? Number(editingQuestion.year) : undefined,
      examName: editingQuestion.examName?.trim() || undefined,
      status: (editingQuestion.status || 'DRAFT') as ContentStatus,
    };

    saveAdminQuestion(finalQuestion);
    setEditingQuestion(null);
    refreshQuestions();
  };

  const handleQuickStatusChange = (question: AdminQuestion, newStatus: ContentStatus) => {
    saveAdminQuestion({ ...question, status: newStatus });
    refreshQuestions();
  };

  const handleConfirmArchive = () => {
    if (!archiveTarget) return;
    archiveAdminQuestion(archiveTarget.id);
    setArchiveTarget(null);
    refreshQuestions();
  };

  return (
    <div className="space-y-6" data-testid="question-manager-view">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Question & MCQ Repository
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Manage practice MCQs, authentic PYQs, and rich pedagogical solutions with strict integrity validation.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Question
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search questions by text, answer choices, or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleFilterChange();
            }}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-2 pl-9 pr-3 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        {/* Filter Rows */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 text-xs">
          {/* Exam */}
          <div>
            <label className="block text-[11px] font-semibold text-[hsl(var(--muted-foreground))] mb-1">
              Exam
            </label>
            <select
              value={selectedExamId}
              onChange={(e) => {
                setSelectedExamId(e.target.value);
                setSelectedSubjectId('ALL');
                setSelectedTopicId('ALL');
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5 text-xs text-[hsl(var(--foreground))]"
            >
              <option value="ALL">All Exams</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-semibold text-[hsl(var(--muted-foreground))] mb-1">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setSelectedTopicId('ALL');
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5 text-xs text-[hsl(var(--foreground))]"
            >
              <option value="ALL">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-[11px] font-semibold text-[hsl(var(--muted-foreground))] mb-1">
              Topic
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => {
                setSelectedTopicId(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5 text-xs text-[hsl(var(--foreground))]"
            >
              <option value="ALL">All Topics</option>
              {availableTopics.map((top) => (
                <option key={top.id} value={top.id}>
                  {top.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-[11px] font-semibold text-[hsl(var(--muted-foreground))] mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5 text-xs text-[hsl(var(--foreground))]"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MODERATE">Moderate</option>
              <option value="HARD">Hard</option>
              <option value="VERY_HARD">Very Hard</option>
            </select>
          </div>

          {/* Source Type */}
          <div>
            <label className="block text-[11px] font-semibold text-[hsl(var(--muted-foreground))] mb-1">
              Source Type
            </label>
            <select
              value={selectedSourceType}
              onChange={(e) => {
                setSelectedSourceType(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5 text-xs text-[hsl(var(--foreground))]"
            >
              <option value="ALL">All Sources</option>
              <option value="PYQ">Authentic PYQ</option>
              <option value="PYQ-BASED">PYQ-Based</option>
              <option value="PRACTICE">Practice MCQ</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-[hsl(var(--muted-foreground))] mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                handleFilterChange();
              }}
              className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5 text-xs text-[hsl(var(--foreground))]"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="REVIEW">Review</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Summary & Count */}
      <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] px-1">
        <div>
          Showing <span className="font-bold text-[hsl(var(--foreground))]">{filteredQuestions.length}</span> questions
          {filteredQuestions.length !== questions.length && ` (filtered from ${questions.length})`}
        </div>
        <div>
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {paginatedQuestions.map((q) => {
          const exam = exams.find((e) => e.id === q.examId);
          const subject = allSubjects.find((s) => s.id === q.subjectId);
          const topic = allTopics.find((t) => t.id === q.topicId);

          return (
            <div
              key={q.id}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition hover:border-[hsl(var(--primary)/0.5)]"
              data-testid={`question-row-${q.id}`}
            >
              {/* Top Row: Meta Tags & ID */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[hsl(var(--border)/0.5)] pb-2.5">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  {/* Source Type */}
                  {q.sourceType === 'PYQ' && (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 font-bold text-amber-700 dark:text-amber-400">
                      <Award className="h-3 w-3" />
                      PYQ {q.year ? `(${q.year})` : ''}
                    </span>
                  )}
                  {q.sourceType === 'PYQ-BASED' && (
                    <span className="inline-flex items-center gap-1 rounded bg-purple-500/10 px-2 py-0.5 font-bold text-purple-700 dark:text-purple-400">
                      <BookOpen className="h-3 w-3" />
                      PYQ-Based
                    </span>
                  )}
                  {q.sourceType === 'PRACTICE' && (
                    <span className="inline-flex items-center gap-1 rounded bg-blue-500/10 px-2 py-0.5 font-bold text-blue-700 dark:text-blue-400">
                      <HelpCircle className="h-3 w-3" />
                      Practice
                    </span>
                  )}

                  {/* Difficulty */}
                  <span
                    className={`rounded px-2 py-0.5 font-semibold text-[11px] ${
                      q.difficulty === 'EASY'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : q.difficulty === 'MODERATE'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {q.difficulty}
                  </span>

                  {/* Status Dropdown */}
                  <select
                    value={q.status}
                    onChange={(e) => handleQuickStatusChange(q, e.target.value as ContentStatus)}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
                      q.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        : q.status === 'REVIEW'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                        : q.status === 'DRAFT'
                        ? 'bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-zinc-100 text-zinc-600 line-through border-zinc-300'
                    }`}
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>

                  <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    {exam?.shortName || q.examId} › {subject?.name || q.subjectId}
                  </span>
                </div>

                <div className="font-mono text-[11px] text-[hsl(var(--muted-foreground))]">
                  ID: {q.id}
                </div>
              </div>

              {/* Question Text */}
              <div className="mt-3 text-sm font-semibold text-[hsl(var(--foreground))] line-clamp-2">
                {q.question}
              </div>

              {/* Options Preview */}
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                {(['A', 'B', 'C', 'D'] as const).map((key) => {
                  const isCorrect = q.correctAnswer === key;
                  return (
                    <div
                      key={key}
                      className={`truncate rounded border px-2 py-1 text-[11px] ${
                        isCorrect
                          ? 'border-emerald-500/60 bg-emerald-500/10 font-bold text-emerald-800 dark:text-emerald-300'
                          : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
                      }`}
                    >
                      <span className="font-mono font-bold mr-1">({key})</span>
                      {q.options[key]}
                    </div>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-[hsl(var(--border)/0.5)] pt-2.5">
                <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  Topic: <span className="font-semibold text-[hsl(var(--foreground))]">{topic?.name || q.topicId}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewQuestion(q)}
                    className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                  >
                    <Eye className="h-3 w-3 text-blue-600" />
                    Preview
                  </button>
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </button>
                  {q.status !== 'ARCHIVED' && (
                    <button
                      onClick={() => setArchiveTarget(q)}
                      className="inline-flex items-center gap-1 rounded-md border border-rose-500/20 text-rose-600 hover:bg-rose-500/10 px-2 py-1 text-xs font-semibold"
                    >
                      <Archive className="h-3 w-3" />
                      Archive
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
            No questions found matching your filter criteria.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-4 text-xs">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 font-semibold hover:bg-[hsl(var(--muted))] disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          <div className="text-[hsl(var(--muted-foreground))]">
            Page <span className="font-bold text-[hsl(var(--foreground))]">{currentPage}</span> of {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 font-semibold hover:bg-[hsl(var(--muted))] disabled:opacity-30"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Question Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
              <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
                Question Preview & Verification
              </h3>
              <button
                onClick={() => setPreviewQuestion(null)}
                className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <QuestionPreview
                question={previewQuestion}
                examName={exams.find((e) => e.id === previewQuestion.examId)?.name}
                subjectName={allSubjects.find((s) => s.id === previewQuestion.subjectId)?.name}
                topicName={allTopics.find((t) => t.id === previewQuestion.topicId)?.name}
              />
            </div>

            <div className="flex justify-end border-t border-[hsl(var(--border))] p-3">
              <button
                onClick={() => setPreviewQuestion(null)}
                className="rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Modal with Real-Time Validation Feedback */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
              <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
                {isNew ? 'Add MCQ to Database' : `Edit MCQ: ${editingQuestion.id}`}
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 text-xs">
              {/* Live Validation Alert Banner */}
              {editingValidation && editingValidation.status !== 'VALID' && (
                <div
                  className={`rounded-lg border p-3 ${
                    editingValidation.status === 'ERROR'
                      ? 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300'
                      : 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="h-4 w-4" />
                    Validation Status: {editingValidation.status}
                  </div>
                  {editingValidation.errors.length > 0 && (
                    <ul className="mt-1 list-inside list-disc text-[11px] space-y-0.5">
                      {editingValidation.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                  {editingValidation.warnings.length > 0 && (
                    <ul className="mt-1 list-inside list-disc text-[11px] opacity-90 space-y-0.5">
                      {editingValidation.warnings.map((warn, i) => (
                        <li key={i}>Notice: {warn}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Hierarchy Assignment */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Exam Track *
                  </label>
                  <select
                    value={editingQuestion.examId || ''}
                    onChange={(e) => {
                      const examId = e.target.value;
                      const sub = allSubjects.find((s) => s.examId === examId);
                      const top = allTopics.find((t) => t.subjectId === sub?.id);
                      setEditingQuestion({
                        ...editingQuestion,
                        examId,
                        subjectId: sub?.id || '',
                        topicId: top?.id || '',
                      });
                    }}
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-semibold"
                  >
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Subject *
                  </label>
                  <select
                    value={editingQuestion.subjectId || ''}
                    onChange={(e) => {
                      const subjectId = e.target.value;
                      const top = allTopics.find((t) => t.subjectId === subjectId);
                      setEditingQuestion({
                        ...editingQuestion,
                        subjectId,
                        topicId: top?.id || '',
                      });
                    }}
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-semibold"
                  >
                    {allSubjects
                      .filter((s) => !editingQuestion.examId || s.examId === editingQuestion.examId)
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Topic *
                  </label>
                  <select
                    value={editingQuestion.topicId || ''}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, topicId: e.target.value })
                    }
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-semibold"
                  >
                    {allTopics
                      .filter(
                        (t) =>
                          !editingQuestion.subjectId || t.subjectId === editingQuestion.subjectId
                      )
                      .map((top) => (
                        <option key={top.id} value={top.id}>
                          {top.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Question Text (हिन्दी/English) *
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.question || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question: e.target.value })
                  }
                  placeholder="Enter the complete question prompt..."
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-medium"
                />
              </div>

              {/* 4 Options & Correct Answer Radio */}
              <div className="space-y-2">
                <label className="block font-semibold text-[hsl(var(--foreground))]">
                  Options & Correct Answer Selection *
                </label>
                {(['A', 'B', 'C', 'D'] as const).map((key) => {
                  const isChecked = editingQuestion.correctAnswer === key;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingQuestion({ ...editingQuestion, correctAnswer: key })
                        }
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-bold ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-600 text-white'
                            : 'border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'
                        }`}
                        title="Mark as correct answer"
                      >
                        {key}
                      </button>
                      <input
                        type="text"
                        value={editingQuestion.options?.[key] || ''}
                        onChange={(e) =>
                          setEditingQuestion({
                            ...editingQuestion,
                            options: {
                              ...editingQuestion.options,
                              A: editingQuestion.options?.A || '',
                              B: editingQuestion.options?.B || '',
                              C: editingQuestion.options?.C || '',
                              D: editingQuestion.options?.D || '',
                              [key]: e.target.value,
                            },
                          })
                        }
                        placeholder={`Option ${key} text`}
                        className={`flex-1 rounded-lg border p-2 ${
                          isChecked
                            ? 'border-emerald-500/50 bg-emerald-500/5 font-semibold'
                            : 'border-[hsl(var(--border))] bg-[hsl(var(--background))]'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Pedagogical Details */}
              <div className="space-y-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-3">
                <div className="font-bold text-[hsl(var(--foreground))]">
                  Pedagogical Enrichment (हल, मुख्य बिंदु एवं सावधानियाँ)
                </div>

                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Detailed Explanation (विस्तृत हल)
                  </label>
                  <textarea
                    rows={2}
                    value={editingQuestion.explanation || ''}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                    }
                    placeholder="Step-by-step logic, conceptual rationale, or formula..."
                    className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-700 dark:text-amber-400 mb-1">
                      Important Key Point
                    </label>
                    <input
                      type="text"
                      value={editingQuestion.importantPoint || ''}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          importantPoint: e.target.value,
                        })
                      }
                      placeholder="One-liner exam takeaway"
                      className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-blue-700 dark:text-blue-400 mb-1">
                      Additional Fact
                    </label>
                    <input
                      type="text"
                      value={editingQuestion.additionalFact || ''}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          additionalFact: e.target.value,
                        })
                      }
                      placeholder="Related factual insight"
                      className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-rose-700 dark:text-rose-400 mb-1">
                      Common Student Mistake
                    </label>
                    <input
                      type="text"
                      value={editingQuestion.commonMistake || ''}
                      onChange={(e) =>
                        setEditingQuestion({
                          ...editingQuestion,
                          commonMistake: e.target.value,
                        })
                      }
                      placeholder="Trap to avoid"
                      className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Categorization & Metadata */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Difficulty
                  </label>
                  <select
                    value={editingQuestion.difficulty || 'MODERATE'}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        difficulty: e.target.value as ContentDifficulty,
                      })
                    }
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HARD">HARD</option>
                    <option value="VERY_HARD">VERY_HARD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Source Type
                  </label>
                  <select
                    value={editingQuestion.sourceType || 'PRACTICE'}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        sourceType: e.target.value as ContentSourceType,
                      })
                    }
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                  >
                    <option value="PRACTICE">PRACTICE</option>
                    <option value="PYQ">AUTHENTIC PYQ</option>
                    <option value="PYQ-BASED">PYQ-BASED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    PYQ Year (if applicable)
                  </label>
                  <input
                    type="number"
                    value={editingQuestion.year || ''}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        year: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      })
                    }
                    placeholder="e.g. 2021"
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Lifecycle Status
                  </label>
                  <select
                    value={editingQuestion.status || 'DRAFT'}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        status: e.target.value as ContentStatus,
                      })
                    }
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[hsl(var(--border))] p-4">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="rounded-lg border border-[hsl(var(--border))] px-3.5 py-1.5 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!editingValidation || editingValidation.status === 'ERROR'}
                className="rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
                Archive Question?
              </h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              In accordance with Module 12 safe architecture, questions are archived rather than deleted.
              This prevents breaking existing student quizzes or historical results while removing this question from live randomized test pools.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setArchiveTarget(null)}
                className="rounded-lg border border-[hsl(var(--border))] px-3.5 py-1.5 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmArchive}
                className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
              >
                Archive Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
