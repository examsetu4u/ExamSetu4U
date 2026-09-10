import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clock,
  Edit2,
  Filter,
  Plus,
  Search,
  Shuffle,
  X,
} from 'lucide-react';
import { useState } from 'react';
import {
  archiveAdminMockTest,
  getAdminExams,
  getAdminMockTests,
  getAdminSubjects,
  saveAdminMockTest,
} from '../services/admin-service';
import type { AdminExam, AdminMockTest, AdminSubject, ContentStatus } from '../types';

export function MockTestManager() {
  const exams: AdminExam[] = getAdminExams();
  const allSubjects: AdminSubject[] = getAdminSubjects();

  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');
  const [mockTests, setMockTests] = useState<AdminMockTest[]>(() => getAdminMockTests());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Edit / Add modal
  const [editingTest, setEditingTest] = useState<Partial<AdminMockTest> | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Archive modal
  const [archiveTarget, setArchiveTarget] = useState<AdminMockTest | null>(null);

  const refreshList = () => {
    setMockTests(getAdminMockTests(selectedExamId));
  };

  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId);
    setMockTests(getAdminMockTests(examId));
  };

  const filteredTests = mockTests.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    const defaultExam = selectedExamId !== 'ALL' ? selectedExamId : exams[0]?.id || 'super-tet';
    const subList = allSubjects.filter((s) => s.examId === defaultExam).map((s) => s.id);

    setEditingTest({
      id: `mt-${defaultExam}-${Date.now()}`,
      title: '',
      description: '',
      examId: defaultExam,
      subjectIds: subList,
      totalQuestions: 150,
      durationMinutes: 150,
      totalMarks: 150,
      negativeMarking: {
        enabled: false,
        penaltyPerWrong: 0.25,
      },
      sections: [],
      randomizeQuestions: true,
      status: 'DRAFT',
    });
    setIsNew(true);
  };

  const handleOpenEdit = (test: AdminMockTest) => {
    setEditingTest({
      ...test,
      subjectIds: [...test.subjectIds],
      negativeMarking: { ...test.negativeMarking },
      sections: [...test.sections],
    });
    setIsNew(false);
  };

  const handleSave = () => {
    if (!editingTest || !editingTest.title?.trim() || !editingTest.examId) return;

    const finalTest: AdminMockTest = {
      id: editingTest.id || `mt-${Date.now()}`,
      title: editingTest.title.trim(),
      description: editingTest.description?.trim() || '',
      examId: editingTest.examId,
      subjectIds: editingTest.subjectIds || [],
      totalQuestions: Number(editingTest.totalQuestions) || 150,
      durationMinutes: Number(editingTest.durationMinutes) || 150,
      totalMarks: Number(editingTest.totalMarks) || 150,
      negativeMarking: editingTest.negativeMarking || { enabled: false, penaltyPerWrong: 0 },
      sections: editingTest.sections || [],
      randomizeQuestions: editingTest.randomizeQuestions ?? true,
      status: (editingTest.status || 'DRAFT') as ContentStatus,
    };

    saveAdminMockTest(finalTest);
    setEditingTest(null);
    refreshList();
  };

  const handleConfirmArchive = () => {
    if (!archiveTarget) return;
    archiveAdminMockTest(archiveTarget.id);
    setArchiveTarget(null);
    refreshList();
  };

  return (
    <div className="space-y-6" data-testid="mock-test-manager-view">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Mock Test Configuration & Engine
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Configure full exam simulations, timing limits, negative marking penalties, and subject section distributions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create Mock Test
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search mock tests by title or exam..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-1.5 pl-9 pr-3 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        {/* Exam Filter */}
        <select
          value={selectedExamId}
          onChange={(e) => handleExamChange(e.target.value)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
        >
          <option value="ALL">All Exam Tracks</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
        >
          <option value="ALL">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Mock Tests Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTests.map((test) => {
          const exam = exams.find((e) => e.id === test.examId);
          return (
            <div
              key={test.id}
              className="flex flex-col justify-between rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm transition hover:border-[hsl(var(--primary)/0.5)]"
              data-testid={`mock-test-card-${test.id}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-[hsl(var(--border)/0.5)] pb-2.5">
                  <span className="font-bold text-xs text-[hsl(var(--primary))] uppercase tracking-wider">
                    {exam?.shortName || test.examId}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      test.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : test.status === 'DRAFT'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 line-through'
                    }`}
                  >
                    {test.status}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-[hsl(var(--foreground))]">
                  {test.title}
                </h3>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
                  {test.description}
                </p>

                {/* Exam Parameters */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-[hsl(var(--border)/0.6)] bg-[hsl(var(--muted)/0.3)] p-3 text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">
                      Questions
                    </div>
                    <div className="text-sm font-extrabold text-[hsl(var(--foreground))]">
                      {test.totalQuestions} Qs
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">
                      Duration
                    </div>
                    <div className="text-sm font-extrabold text-[hsl(var(--foreground))] flex items-center gap-1">
                      <Clock className="h-3 w-3 text-indigo-600" />
                      {test.durationMinutes} mins
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">
                      Negative Marking
                    </div>
                    <div className="font-semibold text-[hsl(var(--foreground))]">
                      {test.negativeMarking.enabled ? `-${test.negativeMarking.penaltyPerWrong}` : 'None (0.0)'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">
                      Question Order
                    </div>
                    <div className="font-semibold text-[hsl(var(--foreground))] flex items-center gap-1">
                      <Shuffle className="h-3 w-3 text-purple-600" />
                      {test.randomizeQuestions ? 'Randomized' : 'Fixed order'}
                    </div>
                  </div>
                </div>

                {/* Sections */}
                {test.sections && test.sections.length > 0 && (
                  <div className="mt-3 text-[11px] text-[hsl(var(--muted-foreground))]">
                    <span className="font-bold text-[hsl(var(--foreground))]">{test.sections.length} Sections:</span>{' '}
                    {test.sections.map((s) => s.title).join(', ')}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border)/0.5)] pt-3 text-xs">
                <div className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                  ID: {test.id}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(test)}
                    className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </button>
                  {test.status !== 'ARCHIVED' && (
                    <button
                      onClick={() => setArchiveTarget(test)}
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
      </div>

      {/* Edit / Add Modal */}
      {editingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
              <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
                {isNew ? 'Create Mock Test Configuration' : `Edit Test: ${editingTest.title}`}
              </h3>
              <button
                onClick={() => setEditingTest(null)}
                className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Exam Category *
                  </label>
                  <select
                    value={editingTest.examId || ''}
                    onChange={(e) => setEditingTest({ ...editingTest, examId: e.target.value })}
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
                    Publication Status
                  </label>
                  <select
                    value={editingTest.status || 'DRAFT'}
                    onChange={(e) =>
                      setEditingTest({ ...editingTest, status: e.target.value as ContentStatus })
                    }
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-semibold"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Mock Test Title *
                </label>
                <input
                  type="text"
                  value={editingTest.title || ''}
                  onChange={(e) => setEditingTest({ ...editingTest, title: e.target.value })}
                  placeholder="e.g. Super TET Full Mock Test 1 - Real Exam Simulation"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Description & Guidelines
                </label>
                <textarea
                  rows={2}
                  value={editingTest.description || ''}
                  onChange={(e) => setEditingTest({ ...editingTest, description: e.target.value })}
                  placeholder="Comprehensive test instructions, mark weighting..."
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                />
              </div>

              {/* Timing, Questions, Marks */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Total Questions
                  </label>
                  <input
                    type="number"
                    value={editingTest.totalQuestions || 150}
                    onChange={(e) =>
                      setEditingTest({
                        ...editingTest,
                        totalQuestions: parseInt(e.target.value, 10) || 10,
                      })
                    }
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={editingTest.durationMinutes || 150}
                    onChange={(e) =>
                      setEditingTest({
                        ...editingTest,
                        durationMinutes: parseInt(e.target.value, 10) || 10,
                      })
                    }
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={editingTest.totalMarks || 150}
                    onChange={(e) =>
                      setEditingTest({
                        ...editingTest,
                        totalMarks: parseInt(e.target.value, 10) || 10,
                      })
                    }
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-mono"
                  />
                </div>
              </div>

              {/* Negative Marking & Randomization */}
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-3">
                <div>
                  <label className="flex items-center gap-2 font-semibold text-[hsl(var(--foreground))] mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTest.negativeMarking?.enabled ?? false}
                      onChange={(e) =>
                        setEditingTest({
                          ...editingTest,
                          negativeMarking: {
                            enabled: e.target.checked,
                            penaltyPerWrong: editingTest.negativeMarking?.penaltyPerWrong || 0.25,
                          },
                        })
                      }
                      className="h-4 w-4 rounded text-[hsl(var(--primary))]"
                    />
                    Enable Negative Marking
                  </label>

                  {editingTest.negativeMarking?.enabled && (
                    <input
                      type="number"
                      step="0.05"
                      value={editingTest.negativeMarking?.penaltyPerWrong || 0.25}
                      onChange={(e) =>
                        setEditingTest({
                          ...editingTest,
                          negativeMarking: {
                            enabled: true,
                            penaltyPerWrong: parseFloat(e.target.value) || 0.25,
                          },
                        })
                      }
                      placeholder="e.g. 0.25 or 0.33"
                      className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5 font-mono text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 font-semibold text-[hsl(var(--foreground))] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTest.randomizeQuestions ?? true}
                      onChange={(e) =>
                        setEditingTest({
                          ...editingTest,
                          randomizeQuestions: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded text-[hsl(var(--primary))]"
                    />
                    Randomize Question Sequence
                  </label>
                  <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                    Shuffles order per student test session while honoring section boundaries.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[hsl(var(--border))] p-4">
              <button
                type="button"
                onClick={() => setEditingTest(null)}
                className="rounded-lg border border-[hsl(var(--border))] px-3.5 py-1.5 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!editingTest.title?.trim()}
                className="rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                Save Mock Test
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
                Archive Mock Test: {archiveTarget.title}?
              </h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              Archiving hides this mock test preset from student mock test selection without deleting question records.
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
                Archive Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
