import {
  AlertTriangle,
  Archive,
  BookOpen,
  Edit2,
  FileCheck,
  Filter,
  FolderTree,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { useState } from 'react';
import {
  archiveAdminTopic,
  getAdminExams,
  getAdminSubjects,
  getAdminTopics,
  saveAdminTopic,
} from '../services/admin-service';
import type { AdminExam, AdminSubject, AdminTopic, TopicStatus } from '../types';

export function TopicManager() {
  const exams: AdminExam[] = getAdminExams();
  const allSubjects: AdminSubject[] = getAdminSubjects();

  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');
  const [topics, setTopics] = useState<AdminTopic[]>(() => getAdminTopics());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Edit / Add modal
  const [editingTopic, setEditingTopic] = useState<Partial<AdminTopic> | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Archive modal
  const [archiveTarget, setArchiveTarget] = useState<AdminTopic | null>(null);

  const availableSubjects = selectedExamId === 'ALL'
    ? allSubjects
    : allSubjects.filter((s) => s.examId === selectedExamId);

  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId);
    setSelectedSubjectId('ALL');
    setTopics(getAdminTopics(examId, 'ALL'));
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    setTopics(getAdminTopics(selectedExamId, subjectId));
  };

  const refreshList = () => {
    setTopics(getAdminTopics(selectedExamId, selectedSubjectId));
  };

  const filteredTopics = topics.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    const examId = selectedExamId !== 'ALL' ? selectedExamId : exams[0]?.id || 'super-tet';
    const sub = allSubjects.find((s) => s.examId === examId) || allSubjects[0];
    setEditingTopic({
      id: '',
      examId,
      subjectId: sub?.id || '',
      name: '',
      description: '',
      order: topics.length + 1,
      status: 'PUBLISHED',
      hasStudyMaterial: false,
    });
    setIsNew(true);
  };

  const handleOpenEdit = (topic: AdminTopic) => {
    setEditingTopic({ ...topic });
    setIsNew(false);
  };

  const handleSave = () => {
    if (!editingTopic || !editingTopic.name?.trim() || !editingTopic.subjectId) return;

    const id =
      editingTopic.id?.trim() ||
      `${editingTopic.subjectId}-${topics.filter((t) => t.subjectId === editingTopic.subjectId).length + 1}`;

    const finalTopic: AdminTopic = {
      id,
      examId: editingTopic.examId || '',
      subjectId: editingTopic.subjectId,
      name: editingTopic.name.trim(),
      description: editingTopic.description?.trim() || '',
      order: editingTopic.order || topics.length + 1,
      status: (editingTopic.status || 'PUBLISHED') as TopicStatus,
      hasStudyMaterial: editingTopic.hasStudyMaterial || false,
    };

    saveAdminTopic(finalTopic);
    setEditingTopic(null);
    refreshList();
  };

  const handleConfirmArchive = () => {
    if (!archiveTarget) return;
    archiveAdminTopic(archiveTarget.id);
    setArchiveTarget(null);
    refreshList();
  };

  return (
    <div className="space-y-6" data-testid="topic-manager-view">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Topic & Syllabus Hierarchy
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Manage granular topic units nested under Exam → Subject → Topic.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Topic
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 sm:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search topics by name, keywords or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-1.5 pl-9 pr-3 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
          />
        </div>

        {/* Exam filter */}
        <select
          value={selectedExamId}
          onChange={(e) => handleExamChange(e.target.value)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
        >
          <option value="ALL">All Exams</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>

        {/* Subject filter */}
        <select
          value={selectedSubjectId}
          onChange={(e) => handleSubjectChange(e.target.value)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1.5 text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
        >
          <option value="ALL">All Subjects</option>
          {availableSubjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>

        {/* Status filter */}
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

      {/* Topics Table */}
      <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] font-bold text-[hsl(var(--foreground))]">
            <tr>
              <th className="p-3.5 w-14">Order</th>
              <th className="p-3.5">Topic & ID</th>
              <th className="p-3.5">Hierarchy (Exam › Subject)</th>
              <th className="p-3.5">Content Assets</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {filteredTopics.map((topic) => {
              const exam = exams.find((e) => e.id === topic.examId);
              const subject = allSubjects.find((s) => s.id === topic.subjectId);
              return (
                <tr key={topic.id} className="hover:bg-[hsl(var(--muted)/0.2)]">
                  <td className="p-3.5 font-mono text-xs font-semibold">{topic.order}</td>
                  <td className="p-3.5">
                    <div className="font-bold text-sm text-[hsl(var(--foreground))] flex items-center gap-1.5">
                      <FolderTree className="h-3.5 w-3.5 text-purple-600" />
                      {topic.name}
                    </div>
                    <div className="text-[11px] font-mono text-[hsl(var(--muted-foreground))]">
                      ID: {topic.id}
                    </div>
                    {topic.description && (
                      <p className="mt-1 line-clamp-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                        {topic.description}
                      </p>
                    )}
                  </td>

                  <td className="p-3.5">
                    <div className="text-xs text-[hsl(var(--foreground))] font-semibold">
                      {exam?.name || topic.examId}
                    </div>
                    <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      › {subject?.name || topic.subjectId}
                    </div>
                  </td>

                  <td className="p-3.5">
                    {topic.hasStudyMaterial ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                        <FileCheck className="h-3 w-3" />
                        Notes Active
                      </span>
                    ) : (
                      <span className="text-[11px] text-[hsl(var(--muted-foreground))] italic">
                        Notes pending
                      </span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        topic.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : topic.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 line-through'
                      }`}
                    >
                      {topic.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(topic)}
                        className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      {topic.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => setArchiveTarget(topic)}
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
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
                {isNew ? 'Create New Topic' : `Edit Topic: ${editingTopic.name}`}
              </h3>
              <button
                onClick={() => setEditingTopic(null)}
                className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Parent Subject *
                </label>
                <select
                  value={editingTopic.subjectId || ''}
                  onChange={(e) => {
                    const sub = allSubjects.find((s) => s.id === e.target.value);
                    setEditingTopic({
                      ...editingTopic,
                      subjectId: e.target.value,
                      examId: sub ? sub.examId : editingTopic.examId,
                    });
                  }}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-semibold"
                >
                  {allSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.examId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Topic Name *
                </label>
                <input
                  type="text"
                  value={editingTopic.name || ''}
                  onChange={(e) => setEditingTopic({ ...editingTopic, name: e.target.value })}
                  placeholder="e.g. शिक्षण विधियाँ"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Topic Identifier (ID)
                </label>
                <input
                  type="text"
                  disabled={!isNew}
                  value={editingTopic.id || ''}
                  onChange={(e) => setEditingTopic({ ...editingTopic, id: e.target.value })}
                  placeholder="e.g. super-tet-teaching-skills-15"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-mono disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Order Index
                  </label>
                  <input
                    type="number"
                    value={editingTopic.order || 1}
                    onChange={(e) =>
                      setEditingTopic({ ...editingTopic, order: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Status
                  </label>
                  <select
                    value={editingTopic.status || 'PUBLISHED'}
                    onChange={(e) =>
                      setEditingTopic({ ...editingTopic, status: e.target.value as TopicStatus })
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
                  value={editingTopic.description || ''}
                  onChange={(e) => setEditingTopic({ ...editingTopic, description: e.target.value })}
                  placeholder="Topic syllabus breakdown..."
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-[hsl(var(--border))] pt-3">
              <button
                onClick={() => setEditingTopic(null)}
                className="rounded-lg border border-[hsl(var(--border))] px-3.5 py-1.5 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!editingTopic.name?.trim()}
                className="rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
              >
                Save Topic
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
                Archive Topic: {archiveTarget.name}?
              </h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              Archiving hides this topic from student curriculum navigation without destroying any existing practice questions.
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
                Archive Topic
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
