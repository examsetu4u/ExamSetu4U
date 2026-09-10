import {
  AlertTriangle,
  Archive,
  BookOpen,
  Edit2,
  Filter,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useState } from 'react';
import {
  archiveAdminSubject,
  getAdminExams,
  getAdminSubjects,
  saveAdminSubject,
} from '../services/admin-service';
import type { AdminExam, AdminSubject, SubjectStatus } from '../types';

export function SubjectManager() {
  const exams: AdminExam[] = getAdminExams();
  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');
  const [subjects, setSubjects] = useState<AdminSubject[]>(() => getAdminSubjects());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Edit / Add modal state
  const [editingSubject, setEditingSubject] = useState<Partial<AdminSubject> | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Archive modal state
  const [archiveTarget, setArchiveTarget] = useState<AdminSubject | null>(null);

  const refreshList = (examId?: string) => {
    setSubjects(getAdminSubjects(examId ?? selectedExamId));
  };

  const handleExamChange = (newExamId: string) => {
    setSelectedExamId(newExamId);
    setSubjects(getAdminSubjects(newExamId));
  };

  const filteredSubjects = subjects.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    const defaultExam = selectedExamId !== 'ALL' ? selectedExamId : exams[0]?.id || 'super-tet';
    setEditingSubject({
      id: '',
      examId: defaultExam,
      name: '',
      description: '',
      order: subjects.length + 1,
      status: 'PUBLISHED',
    });
    setIsNew(true);
  };

  const handleOpenEdit = (subject: AdminSubject) => {
    setEditingSubject({ ...subject });
    setIsNew(false);
  };

  const handleSave = () => {
    if (!editingSubject || !editingSubject.name?.trim() || !editingSubject.examId) return;

    const safeSlug = editingSubject.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const id = editingSubject.id?.trim() || `${editingSubject.examId}-${safeSlug}`;

    const finalSubject: AdminSubject = {
      id,
      examId: editingSubject.examId,
      name: editingSubject.name.trim(),
      description: editingSubject.description?.trim() || '',
      order: editingSubject.order || subjects.length + 1,
      status: (editingSubject.status || 'PUBLISHED') as SubjectStatus,
      topicCount: editingSubject.topicCount || 0,
    };

    saveAdminSubject(finalSubject);
    setEditingSubject(null);
    refreshList();
  };

  const handleConfirmArchive = () => {
    if (!archiveTarget) return;
    archiveAdminSubject(archiveTarget.id);
    setArchiveTarget(null);
    refreshList();
  };

  return (
    <div className="space-y-6" data-testid="subject-manager-view">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Subject Management
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Maintain subjects categorized under target exams with stable IDs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search subjects by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-1.5 pl-9 pr-3 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        {/* Exam Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Exam:</span>
          <select
            value={selectedExamId}
            onChange={(e) => handleExamChange(e.target.value)}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
          >
            <option value="ALL">All Exams ({exams.length})</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
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
      </div>

      {/* Subjects Table */}
      <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] font-bold text-[hsl(var(--foreground))]">
            <tr>
              <th className="p-3.5 w-14">Order</th>
              <th className="p-3.5">Subject & Identifier</th>
              <th className="p-3.5">Assigned Exam</th>
              <th className="p-3.5">Topic Count</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {filteredSubjects.map((subject) => {
              const assignedExam = exams.find((e) => e.id === subject.examId);
              return (
                <tr key={subject.id} className="hover:bg-[hsl(var(--muted)/0.2)]">
                  <td className="p-3.5 font-mono text-xs font-semibold">{subject.order}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-sm text-[hsl(var(--foreground))] flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                      {subject.name}
                    </div>
                    <div className="text-[11px] font-mono text-[hsl(var(--muted-foreground))]">
                      ID: {subject.id}
                    </div>
                    {subject.description && (
                      <p className="mt-1 line-clamp-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                        {subject.description}
                      </p>
                    )}
                  </td>
                  <td className="p-3.5">
                    <span className="rounded bg-[hsl(var(--muted))] px-2 py-0.5 font-medium text-[hsl(var(--foreground))]">
                      {assignedExam?.name || subject.examId}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-[hsl(var(--foreground))]">
                    {subject.topicCount || 0} topics
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        subject.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : subject.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 line-through'
                      }`}
                    >
                      {subject.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(subject)}
                        className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      {subject.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => setArchiveTarget(subject)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-500/20 text-rose-600 hover:bg-rose-500/10 px-2 py-1 text-xs font-semibold"
                        >
                          <Archive className="h-3 w-3" />
                          Archive
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
                {isNew ? 'Create New Subject' : `Edit Subject: ${editingSubject.name}`}
              </h3>
              <button
                onClick={() => setEditingSubject(null)}
                className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Parent Exam Track *
                </label>
                <select
                  value={editingSubject.examId || ''}
                  onChange={(e) => setEditingSubject({ ...editingSubject, examId: e.target.value })}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-semibold"
                >
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} ({ex.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={editingSubject.name || ''}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  placeholder="e.g. शिक्षण कौशल"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Subject Identifier (ID)
                </label>
                <input
                  type="text"
                  disabled={!isNew}
                  value={editingSubject.id || ''}
                  onChange={(e) => setEditingSubject({ ...editingSubject, id: e.target.value })}
                  placeholder="Auto-derived e.g. super-tet-teaching-skills"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-mono disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingSubject.order || 1}
                    onChange={(e) =>
                      setEditingSubject({ ...editingSubject, order: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Publication Status
                  </label>
                  <select
                    value={editingSubject.status || 'PUBLISHED'}
                    onChange={(e) =>
                      setEditingSubject({ ...editingSubject, status: e.target.value as SubjectStatus })
                    }
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingSubject.description || ''}
                  onChange={(e) =>
                    setEditingSubject({ ...editingSubject, description: e.target.value })
                  }
                  placeholder="Subject scope, syllabus notes..."
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-[hsl(var(--border))] pt-3">
              <button
                onClick={() => setEditingSubject(null)}
                className="rounded-lg border border-[hsl(var(--border))] px-3.5 py-1.5 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editingSubject.name?.trim()}
                className="rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
              >
                Save Subject
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
                Archive Subject: {archiveTarget.name}?
              </h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              Archiving disables student discovery for this subject while preserving its underlying topics and questions.
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
                Archive Subject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
