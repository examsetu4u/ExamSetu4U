import {
  AlertTriangle,
  Archive,
  ArrowDown,
  ArrowUp,
  Check,
  Edit2,
  Filter,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useState } from 'react';
import {
  archiveAdminExam,
  getAdminExams,
  reorderAdminExams,
  saveAdminExam,
} from '../services/admin-service';
import type { AdminExam, ExamStatus } from '../types';

export function ExamManager() {
  const [exams, setExams] = useState<AdminExam[]>(() => getAdminExams());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Edit / Add modal state
  const [editingExam, setEditingExam] = useState<Partial<AdminExam> | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Archive modal state
  const [archiveTarget, setArchiveTarget] = useState<AdminExam | null>(null);

  const refreshList = () => {
    setExams(getAdminExams());
  };

  const filteredExams = exams.filter((e) => {
    if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.shortName.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingExam({
      id: '',
      name: '',
      shortName: '',
      description: '',
      category: 'State / Teaching',
      status: 'PUBLISHED',
      order: exams.length + 1,
    });
    setIsNew(true);
  };

  const handleOpenEdit = (exam: AdminExam) => {
    setEditingExam({ ...exam });
    setIsNew(false);
  };

  const handleSave = () => {
    if (!editingExam || !editingExam.name?.trim()) return;

    const id = (editingExam.id?.trim() || editingExam.name.toLowerCase().replace(/[^a-z0-9]/g, '-')) as string;
    const finalExam: AdminExam = {
      id,
      name: editingExam.name.trim(),
      shortName: editingExam.shortName?.trim() || editingExam.name.trim(),
      description: editingExam.description?.trim() || '',
      category: editingExam.category?.trim() || 'General',
      status: (editingExam.status || 'PUBLISHED') as ExamStatus,
      order: editingExam.order || exams.length + 1,
      subjectCount: editingExam.subjectCount || 0,
      topicCount: editingExam.topicCount || 0,
    };

    saveAdminExam(finalExam);
    setEditingExam(null);
    refreshList();
  };

  const handleConfirmArchive = () => {
    if (!archiveTarget) return;
    archiveAdminExam(archiveTarget.id);
    setArchiveTarget(null);
    refreshList();
  };

  const handleMove = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= exams.length) return;
    const updated = reorderAdminExams(index, targetIndex);
    setExams(updated);
  };

  return (
    <div className="space-y-6" data-testid="exam-manager-view">
      {/* Action Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Exam Management
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Target exam tracks, category classification, order and lifecycle states.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add New Exam
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search exams by name, shortname, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-1.5 pl-9 pr-3 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Draft Only</option>
            <option value="ARCHIVED">Archived Only</option>
          </select>
        </div>
      </div>

      {/* Exams Table / Cards */}
      <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] font-bold text-[hsl(var(--foreground))]">
            <tr>
              <th className="p-3.5 w-14">Order</th>
              <th className="p-3.5">Exam Name & ID</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Hierarchy Scope</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {filteredExams.map((exam, index) => (
              <tr key={exam.id} className="hover:bg-[hsl(var(--muted)/0.2)]">
                {/* Order & Reorder Arrows */}
                <td className="p-3.5">
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-xs font-semibold">{exam.order}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleMove(index, 'UP')}
                        disabled={index === 0}
                        className="rounded p-0.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleMove(index, 'DOWN')}
                        disabled={index === exams.length - 1}
                        className="rounded p-0.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </td>

                {/* Name & ID */}
                <td className="p-3.5">
                  <div className="font-bold text-sm text-[hsl(var(--foreground))]">{exam.name}</div>
                  <div className="text-[11px] font-mono text-[hsl(var(--muted-foreground))]">
                    ID: {exam.id} • Short: {exam.shortName}
                  </div>
                  <p className="mt-1 line-clamp-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                    {exam.description}
                  </p>
                </td>

                {/* Category */}
                <td className="p-3.5">
                  <span className="rounded-md bg-[hsl(var(--muted))] px-2 py-0.5 font-medium text-[hsl(var(--foreground))]">
                    {exam.category}
                  </span>
                </td>

                {/* Counts */}
                <td className="p-3.5 text-[hsl(var(--muted-foreground))]">
                  <span className="font-semibold text-[hsl(var(--foreground))]">{exam.subjectCount || 0}</span> subjects •{' '}
                  <span className="font-semibold text-[hsl(var(--foreground))]">{exam.topicCount || 0}</span> topics
                </td>

                {/* Status */}
                <td className="p-3.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      exam.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : exam.status === 'DRAFT'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 line-through'
                    }`}
                  >
                    {exam.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(exam)}
                      className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </button>

                    {exam.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => setArchiveTarget(exam)}
                        className="inline-flex items-center gap-1 rounded-md border border-rose-500/20 text-rose-600 hover:bg-rose-500/10 px-2 py-1 text-xs font-semibold"
                        title="Archive Exam"
                      >
                        <Archive className="h-3 w-3" />
                        Archive
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Modal */}
      {editingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
                {isNew ? 'Create New Exam' : `Edit Exam: ${editingExam.name}`}
              </h3>
              <button
                onClick={() => setEditingExam(null)}
                className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Exam Identifier (ID)
                </label>
                <input
                  type="text"
                  disabled={!isNew}
                  value={editingExam.id || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, id: e.target.value })}
                  placeholder="e.g. super-tet, ssc-cgl"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-mono disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Exam Full Name *
                </label>
                <input
                  type="text"
                  value={editingExam.name || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, name: e.target.value })}
                  placeholder="e.g. UPTET / CTET / Super TET"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Short Name
                </label>
                <input
                  type="text"
                  value={editingExam.shortName || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, shortName: e.target.value })}
                  placeholder="e.g. Super TET"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingExam.category || ''}
                    onChange={(e) => setEditingExam({ ...editingExam, category: e.target.value })}
                    placeholder="e.g. Teaching / State PCS"
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Publication Status
                  </label>
                  <select
                    value={editingExam.status || 'PUBLISHED'}
                    onChange={(e) =>
                      setEditingExam({ ...editingExam, status: e.target.value as ExamStatus })
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
                  value={editingExam.description || ''}
                  onChange={(e) => setEditingExam({ ...editingExam, description: e.target.value })}
                  placeholder="Comprehensive exam overview..."
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-[hsl(var(--border))] pt-3">
              <button
                onClick={() => setEditingExam(null)}
                className="rounded-lg border border-[hsl(var(--border))] px-3.5 py-1.5 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editingExam.name?.trim()}
                className="rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
              >
                Save Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Archive Confirmation Modal */}
      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
                Archive Exam: {archiveTarget.name}?
              </h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              In accordance with Module 12 data safety rules, permanent deletion is disabled.
              Archiving sets this exam to inactive state without destroying questions or study material linked to it.
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
                Archive Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
