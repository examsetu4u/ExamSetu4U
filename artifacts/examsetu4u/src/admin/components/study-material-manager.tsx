import {
  AlertTriangle,
  Archive,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Plus,
  Save,
  Search,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { STUDY_NOTES_SHEET_CSV_URL } from '@/config/google-sheet-config';
import { FALLBACK_STUDY_NOTES } from '@/data/notes/study-notes-data';
import { generateSampleStudyNotesCSV } from '@/services/study-notes-loader';
import {
  archiveAdminStudyMaterial,
  getAdminExams,
  getAdminStudyMaterials,
  getAdminSubjects,
  getAdminTopics,
  saveAdminStudyMaterial,
} from '../services/admin-service';
import type { AdminExam, AdminStudyMaterial, AdminSubject, AdminTopic, ContentStatus } from '../types';
import { StudyMaterialPreview } from './study-material-preview';

export function StudyMaterialManager() {
  const exams: AdminExam[] = getAdminExams();
  const allSubjects: AdminSubject[] = getAdminSubjects();
  const allTopics: AdminTopic[] = getAdminTopics();

  const [selectedExamId, setSelectedExamId] = useState<string>('ALL');
  const [materials, setMaterials] = useState<AdminStudyMaterial[]>(() => getAdminStudyMaterials());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Preview modal
  const [previewMaterial, setPreviewMaterial] = useState<AdminStudyMaterial | null>(null);

  // Edit / Add modal
  const [editingMaterial, setEditingMaterial] = useState<Partial<AdminStudyMaterial> | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Archive modal
  const [archiveTarget, setArchiveTarget] = useState<AdminStudyMaterial | null>(null);

  const handleDownloadNotesTemplate = () => {
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

  const refreshList = () => {
    setMaterials(getAdminStudyMaterials(selectedExamId));
  };

  const handleExamChange = (examId: string) => {
    setSelectedExamId(examId);
    setMaterials(getAdminStudyMaterials(examId));
  };

  const filteredMaterials = materials.filter((m) => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    const defaultExam = selectedExamId !== 'ALL' ? selectedExamId : exams[0]?.id || 'super-tet';
    const sub = allSubjects.find((s) => s.examId === defaultExam) || allSubjects[0];
    const top = allTopics.find((t) => t.subjectId === sub?.id) || allTopics[0];

    setEditingMaterial({
      id: `sm-${Date.now()}`,
      examId: defaultExam,
      subjectId: sub?.id || '',
      topicId: top?.id || '',
      title: '',
      description: '',
      intro: '',
      sections: [
        {
          heading: 'Overview & Core Principles',
          paragraphs: ['Add your structured instructional content here.'],
          bullets: ['Key point 1', 'Key point 2'],
        },
      ],
      keyPoints: ['Core takeaway for examination'],
      importantFacts: ['Quick revision highlight'],
      status: 'DRAFT',
      version: 1,
    });
    setIsNew(true);
  };

  const handleOpenEdit = (material: AdminStudyMaterial) => {
    setEditingMaterial({ ...material });
    setIsNew(false);
  };

  const handleSave = (statusToSave?: ContentStatus) => {
    if (!editingMaterial || !editingMaterial.title?.trim() || !editingMaterial.topicId) return;

    const topic = allTopics.find((t) => t.id === editingMaterial.topicId);
    const finalMaterial: AdminStudyMaterial = {
      id: editingMaterial.id || `sm-${editingMaterial.topicId}`,
      examId: editingMaterial.examId || topic?.examId || '',
      subjectId: editingMaterial.subjectId || topic?.subjectId || '',
      topicId: editingMaterial.topicId,
      title: editingMaterial.title.trim(),
      description: editingMaterial.description?.trim() || '',
      intro: editingMaterial.intro?.trim() || '',
      sections: editingMaterial.sections || [],
      keyPoints: editingMaterial.keyPoints || [],
      importantFacts: editingMaterial.importantFacts || [],
      status: statusToSave || editingMaterial.status || 'DRAFT',
      version: editingMaterial.version || 1,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    saveAdminStudyMaterial(finalMaterial);
    setEditingMaterial(null);
    refreshList();
  };

  const handleConfirmArchive = () => {
    if (!archiveTarget) return;
    archiveAdminStudyMaterial(archiveTarget.id);
    setArchiveTarget(null);
    refreshList();
  };

  return (
    <div className="space-y-6" data-testid="study-material-manager-view">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Study Material Architecture
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Manage comprehensive notes, key takeaways, and quick revision facts for students.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-xs font-semibold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create Study Notes
        </button>
      </div>

      {/* Google Sheets Study Notes Live Status Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Google Sheets Study Notes Integration</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active & Live
                </span>
              </div>
              <p className="mt-0.5 text-slate-600 text-xs">
                Connected to published CSV ({FALLBACK_STUDY_NOTES.length} published notes across 5 chapters). Formatted in Hindi with Exam Tips and Important Points.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadNotesTemplate}
              title="Download Study Notes & Theory CSV template with diagram support"
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 font-medium text-emerald-800 shadow-2xs hover:bg-emerald-100 transition"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" /> Download CSV Template
            </button>
            <a
              href="https://docs.google.com/spreadsheets/d/e/2PACX-1vTrE6G3jc232hi18YHGANDvdgyjs1xyYw-UCbvYg2gCvrmtvpSXnDVA_FDG3izHZKk3dU2Q2L1awAAC/pubhtml?gid=867134801&single=true"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" /> View Google Sheet
            </a>
            <a
              href="/study-material/super-tet/super-tet-cdp/bal-vikas-arth-prakriti"
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white shadow-2xs hover:bg-blue-700 transition"
            >
              <Eye className="h-3.5 w-3.5" /> Preview Reader
            </a>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="Search study materials by title or topic..."
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
          <option value="ALL">All Exams ({exams.length})</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
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
          <option value="REVIEW">Review</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Study Materials Table */}
      <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] font-bold text-[hsl(var(--foreground))]">
            <tr>
              <th className="p-3.5">Title & Topic</th>
              <th className="p-3.5">Exam & Subject</th>
              <th className="p-3.5">Sections / Facts</th>
              <th className="p-3.5">Version & Date</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {filteredMaterials.map((material) => {
              const exam = exams.find((e) => e.id === material.examId);
              const subject = allSubjects.find((s) => s.id === material.subjectId);
              const topic = allTopics.find((t) => t.id === material.topicId);

              return (
                <tr key={material.id} className="hover:bg-[hsl(var(--muted)/0.2)]">
                  <td className="p-3.5">
                    <div className="font-bold text-sm text-[hsl(var(--foreground))] flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      {material.title}
                    </div>
                    <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      Topic: <span className="font-semibold text-[hsl(var(--foreground))]">{topic?.name || material.topicId}</span>
                    </div>
                    <div className="text-[10px] font-mono text-[hsl(var(--muted-foreground))]">
                      ID: {material.id}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-xs text-[hsl(var(--foreground))]">
                      {exam?.name || material.examId}
                    </div>
                    <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      {subject?.name || material.subjectId}
                    </div>
                  </td>

                  <td className="p-3.5 text-[hsl(var(--muted-foreground))]">
                    <span className="font-bold text-[hsl(var(--foreground))]">{material.sections.length}</span> sections •{' '}
                    <span className="font-bold text-[hsl(var(--foreground))]">{material.keyPoints.length}</span> key takeaways
                  </td>

                  <td className="p-3.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                    <div>v{material.version}</div>
                    <div className="font-mono">{material.updatedAt || 'Recent'}</div>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        material.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : material.status === 'REVIEW'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : material.status === 'DRAFT'
                          ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 line-through'
                      }`}
                    >
                      {material.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewMaterial(material)}
                        className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                        title="Student View Preview"
                      >
                        <Eye className="h-3 w-3 text-blue-600" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleOpenEdit(material)}
                        className="inline-flex items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      {material.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => setArchiveTarget(material)}
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

      {/* Student View Live Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-[hsl(var(--primary))]" />
                <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
                  Exact Student Display Simulation
                </h3>
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <StudyMaterialPreview material={previewMaterial} />
            </div>

            <div className="flex justify-end border-t border-[hsl(var(--border))] p-3">
              <button
                onClick={() => setPreviewMaterial(null)}
                className="rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))]"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {editingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
              <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
                {isNew ? 'Create Study Material Document' : `Edit Notes: ${editingMaterial.title}`}
              </h3>
              <button
                onClick={() => setEditingMaterial(null)}
                className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Target Topic *
                  </label>
                  <select
                    value={editingMaterial.topicId || ''}
                    onChange={(e) => {
                      const top = allTopics.find((t) => t.id === e.target.value);
                      setEditingMaterial({
                        ...editingMaterial,
                        topicId: e.target.value,
                        examId: top ? top.examId : editingMaterial.examId,
                        subjectId: top ? top.subjectId : editingMaterial.subjectId,
                        title: editingMaterial.title || (top ? `${top.name} - Detailed Study Notes` : ''),
                      });
                    }}
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-semibold"
                  >
                    {allTopics.map((top) => (
                      <option key={top.id} value={top.id}>
                        {top.name} ({top.examId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                    Workflow Status
                  </label>
                  <select
                    value={editingMaterial.status || 'DRAFT'}
                    onChange={(e) =>
                      setEditingMaterial({
                        ...editingMaterial,
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

              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  value={editingMaterial.title || ''}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, title: e.target.value })}
                  placeholder="e.g. बाल विकास के सिद्धांत - संपूर्ण नोट्स"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Introductory Overview
                </label>
                <textarea
                  rows={2}
                  value={editingMaterial.intro || ''}
                  onChange={(e) => setEditingMaterial({ ...editingMaterial, intro: e.target.value })}
                  placeholder="Chapter learning objectives..."
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                />
              </div>

              {/* Sections Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-[hsl(var(--foreground))]">
                    Instructional Sections ({editingMaterial.sections?.length || 0})
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const current = editingMaterial.sections || [];
                      setEditingMaterial({
                        ...editingMaterial,
                        sections: [
                          ...current,
                          {
                            heading: `Section ${current.length + 1}: New Concept`,
                            paragraphs: ['Enter concept explanation...'],
                            bullets: ['Supporting bullet item'],
                          },
                        ],
                      });
                    }}
                    className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Section
                  </button>
                </div>

                <div className="space-y-3">
                  {editingMaterial.sections?.map((sec, secIdx) => (
                    <div key={secIdx} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[hsl(var(--foreground))]">Section #{secIdx + 1}</span>
                        {editingMaterial.sections && editingMaterial.sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editingMaterial.sections?.filter((_, i) => i !== secIdx);
                              setEditingMaterial({ ...editingMaterial, sections: updated });
                            }}
                            className="text-rose-600 hover:text-rose-700 font-semibold text-[11px]"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={sec.heading}
                        onChange={(e) => {
                          const updated = [...(editingMaterial.sections || [])];
                          updated[secIdx].heading = e.target.value;
                          setEditingMaterial({ ...editingMaterial, sections: updated });
                        }}
                        placeholder="Section Heading"
                        className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5 font-semibold"
                      />

                      <textarea
                        rows={2}
                        value={typeof sec.paragraphs[0] === 'string' ? sec.paragraphs[0] : (sec.paragraphs[0]?.text || '')}
                        onChange={(e) => {
                          const updated = [...(editingMaterial.sections || [])];
                          updated[secIdx].paragraphs = [e.target.value];
                          setEditingMaterial({ ...editingMaterial, sections: updated });
                        }}
                        placeholder="Paragraph explanation..."
                        className="w-full rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-1.5"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Points (comma / newline separated) */}
              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Key Exam Takeaways (One per line)
                </label>
                <textarea
                  rows={2}
                  value={editingMaterial.keyPoints?.join('\n') || ''}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      keyPoints: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    })
                  }
                  placeholder="Key Takeaway 1&#10;Key Takeaway 2"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                />
              </div>

              {/* Quick Revision Facts */}
              <div>
                <label className="block font-semibold text-[hsl(var(--foreground))] mb-1">
                  Quick Revision Facts (One per line)
                </label>
                <textarea
                  rows={2}
                  value={editingMaterial.importantFacts?.join('\n') || ''}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      importantFacts: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    })
                  }
                  placeholder="Revision Fact 1&#10;Revision Fact 2"
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[hsl(var(--border))] p-4">
              <button
                type="button"
                onClick={() => setEditingMaterial(null)}
                className="rounded-lg border border-[hsl(var(--border))] px-3.5 py-1.5 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSave('DRAFT')}
                  className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3.5 py-1.5 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('PUBLISHED')}
                  disabled={!editingMaterial.title?.trim()}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Publish Live
                </button>
              </div>
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
                Archive Study Notes: {archiveTarget.title}?
              </h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              Archiving hides this note set from student view while retaining all section and fact formatting safely in the admin repository.
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
                Archive Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
