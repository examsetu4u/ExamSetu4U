import {
  AlertCircle,
  Award,
  CheckCircle2,
  Copy,
  Download,
  FileCheck2,
  FileCode,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Info,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useState } from 'react';
import {
  batchImportQuestions,
  getAdminExams,
  getAdminQuestions,
  getAdminStudyMaterials,
  getAdminSubjects,
  getAdminTopics,
} from '../services/admin-service';
import {
  exportQuestionsCSV,
  exportQuestionsJSON,
  exportStudyMaterialJSON,
  exportSyllabusJSON,
  previewImportQuestionsCSV,
  previewImportQuestionsJSON,
  SAMPLE_CSV_IMPORT_TEMPLATE,
  SAMPLE_JSON_IMPORT_TEMPLATE,
  type ImportPreviewResult,
} from '../services/import-export-service';
import type { AdminQuestion } from '../types';

export function ImportExportHub() {
  const [activeTab, setActiveTab] = useState<'EXPORT' | 'IMPORT'>('EXPORT');

  // Import State
  const [importFormat, setImportFormat] = useState<'JSON' | 'CSV'>('JSON');
  const [rawText, setRawText] = useState('');
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(null);
  const [importStatusMessage, setImportStatusMessage] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const existingQuestions = getAdminQuestions();

  // Export handlers
  const handleExportQuestionsJSON = () => {
    exportQuestionsJSON(existingQuestions);
  };

  const handleExportQuestionsCSV = () => {
    exportQuestionsCSV(existingQuestions);
  };

  const handleExportStudyMaterial = () => {
    exportStudyMaterialJSON(getAdminStudyMaterials());
  };

  const handleExportSyllabus = () => {
    exportSyllabusJSON(getAdminExams(), getAdminSubjects(), getAdminTopics());
  };

  // Import preview handler
  const handlePreviewImport = () => {
    setImportStatusMessage(null);
    if (!rawText.trim()) {
      alert('Please paste or upload question content to preview.');
      return;
    }

    if (importFormat === 'JSON') {
      const res = previewImportQuestionsJSON(rawText, existingQuestions);
      setPreviewResult(res);
    } else {
      const res = previewImportQuestionsCSV(rawText, existingQuestions);
      setPreviewResult(res);
    }
  };

  // File upload reader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        setRawText(content);
        if (file.name.endsWith('.csv')) {
          setImportFormat('CSV');
        } else if (file.name.endsWith('.json')) {
          setImportFormat('JSON');
        }
      }
    };
    reader.readAsText(file);
  };

  // Commit valid questions to admin database
  const handleCommitImport = () => {
    if (!previewResult) return;

    // Filter valid items (allow items with warnings, block fatal errors)
    const validQuestions: AdminQuestion[] = previewResult.items
      .filter((item) => item.validation.status !== 'ERROR')
      .map((item) => item.question);

    if (validQuestions.length === 0) {
      alert('No valid questions found to import.');
      return;
    }

    const count = batchImportQuestions(validQuestions);
    setImportStatusMessage(
      `Successfully imported ${count} valid questions into the ExamSetu4U repository!`
    );
    setPreviewResult(null);
    setRawText('');
  };

  const handleCopyTemplate = () => {
    const t = importFormat === 'JSON' ? SAMPLE_JSON_IMPORT_TEMPLATE : SAMPLE_CSV_IMPORT_TEMPLATE;
    navigator.clipboard.writeText(t);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleLoadTemplateIntoEditor = () => {
    const t = importFormat === 'JSON' ? SAMPLE_JSON_IMPORT_TEMPLATE : SAMPLE_CSV_IMPORT_TEMPLATE;
    setRawText(t);
  };

  return (
    <div className="space-y-6" data-testid="import-export-hub-view">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Bulk Import & Export Pipelines
          </h2>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Export backups and batch import questions in standard JSON/CSV schemas with dry-run verification.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'EXPORT'
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            Export Data
          </button>

          <button
            onClick={() => setActiveTab('IMPORT')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === 'IMPORT'
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Batch Import
          </button>
        </div>
      </div>

      {/* EXPORT SECTION */}
      {activeTab === 'EXPORT' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Export Questions JSON */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                <FileCode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
                  MCQs & PYQs (JSON Format)
                </h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Full nested structures including options, facts, and pedagogical metadata.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-xs">
              <span className="text-[hsl(var(--muted-foreground))]">
                {existingQuestions.length} Questions in database
              </span>
              <button
                onClick={handleExportQuestionsJSON}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90"
              >
                <Download className="h-3.5 w-3.5" />
                Download JSON
              </button>
            </div>
          </div>

          {/* Export Questions CSV */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
                  MCQs & PYQs (CSV Spreadsheet)
                </h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Excel / Google Sheets compatible tabular columns for editorial review.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-xs">
              <span className="text-[hsl(var(--muted-foreground))]">
                {existingQuestions.length} Rows ready
              </span>
              <button
                onClick={handleExportQuestionsCSV}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700"
              >
                <Download className="h-3.5 w-3.5" />
                Download CSV
              </button>
            </div>
          </div>

          {/* Export Study Material */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
                  Study Materials (JSON)
                </h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Structured instructional sections, key takeaways, and quick revision facts.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-xs">
              <span className="text-[hsl(var(--muted-foreground))]">
                {getAdminStudyMaterials().length} Document sets
              </span>
              <button
                onClick={handleExportStudyMaterial}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 font-semibold hover:bg-[hsl(var(--muted))]"
              >
                <Download className="h-3.5 w-3.5" />
                Export Notes
              </button>
            </div>
          </div>

          {/* Export Syllabus */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[hsl(var(--foreground))]">
                  Curriculum & Syllabus Hierarchy
                </h3>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  All active Exams, Subjects, and Topics tree relations.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 text-xs">
              <span className="text-[hsl(var(--muted-foreground))]">
                Complete Exam hierarchy
              </span>
              <button
                onClick={handleExportSyllabus}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 font-semibold hover:bg-[hsl(var(--muted))]"
              >
                <Download className="h-3.5 w-3.5" />
                Export Syllabus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT SECTION */}
      {activeTab === 'IMPORT' && (
        <div className="space-y-6">
          {/* Status Message */}
          {importStatusMessage && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {importStatusMessage}
            </div>
          )}

          {/* Import Controls & Configuration */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-3">
              {/* Format selection */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[hsl(var(--foreground))]">Data Format:</span>
                <div className="flex rounded-lg border border-[hsl(var(--border))] p-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setImportFormat('JSON');
                      setPreviewResult(null);
                    }}
                    className={`rounded px-3 py-1 text-xs font-semibold ${
                      importFormat === 'JSON'
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                        : 'text-[hsl(var(--muted-foreground))]'
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImportFormat('CSV');
                      setPreviewResult(null);
                    }}
                    className={`rounded px-3 py-1 text-xs font-semibold ${
                      importFormat === 'CSV'
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                        : 'text-[hsl(var(--muted-foreground))]'
                    }`}
                  >
                    CSV
                  </button>
                </div>
              </div>

              {/* Template shortcuts */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadTemplateIntoEditor}
                  className="inline-flex items-center gap-1 rounded border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                >
                  <Sparkles className="h-3 w-3 text-amber-600" />
                  Load Sample Template
                </button>
                <button
                  type="button"
                  onClick={handleCopyTemplate}
                  className="inline-flex items-center gap-1 rounded border border-[hsl(var(--border))] px-2.5 py-1 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
                >
                  <Copy className="h-3 w-3" />
                  {copiedTemplate ? 'Copied!' : 'Copy Template'}
                </button>
              </div>
            </div>

            {/* File Upload Drop Zone */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.2)] p-4 text-center">
              <Upload className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
              <label className="mt-2 cursor-pointer text-xs font-bold text-[hsl(var(--primary))] hover:underline">
                <span>Upload a .{importFormat.toLowerCase()} file</span>
                <input
                  type="file"
                  accept={importFormat === 'JSON' ? '.json' : '.csv'}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
                or paste raw content below
              </p>
            </div>

            {/* Raw Text Area */}
            <div>
              <label className="block text-xs font-semibold text-[hsl(var(--foreground))] mb-1">
                Paste Raw {importFormat} Content
              </label>
              <textarea
                rows={7}
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  setPreviewResult(null);
                }}
                placeholder={
                  importFormat === 'JSON'
                    ? '[\n  {\n    "id": "st-q-101",\n    "question": "...",\n    "options": { "A": "...", ... },\n    "correctAnswer": "A"\n  }\n]'
                    : 'id,examId,subjectId,topicId,question,optionA,optionB,optionC,optionD,correctAnswer,explanation...'
                }
                className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-3 font-mono text-xs leading-relaxed"
              />
            </div>

            {/* Dry Run Preview Action Button */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRawText('');
                  setPreviewResult(null);
                }}
                className="rounded-lg border border-[hsl(var(--border))] px-3.5 py-1.5 text-xs font-semibold hover:bg-[hsl(var(--muted))]"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handlePreviewImport}
                disabled={!rawText.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
              >
                <FileCheck2 className="h-4 w-4" />
                Preview & Validate Data
              </button>
            </div>
          </div>

          {/* IMPORT PREVIEW TABLE & AUDIT REPORT */}
          {previewResult && (
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
                    Dry-Run Verification Results
                  </h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Carefully review validation status before committing changes to the database.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold">
                    Parsed: {previewResult.totalParsed}
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1 text-xs font-semibold">
                    Valid: {previewResult.validCount}
                  </span>
                  {previewResult.errorCount > 0 && (
                    <span className="rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-3 py-1 text-xs font-semibold">
                      Errors: {previewResult.errorCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Parse error banner */}
              {previewResult.parseErrors.length > 0 && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-800 dark:text-rose-300">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    Parsing Errors Encountered:
                  </div>
                  <ul className="mt-1 list-inside list-disc">
                    {previewResult.parseErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Items preview table */}
              <div className="max-h-80 overflow-y-auto rounded-lg border border-[hsl(var(--border))]">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-[hsl(var(--muted))] font-bold text-[hsl(var(--foreground))]">
                    <tr>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Question ID</th>
                      <th className="p-2.5">Question Text</th>
                      <th className="p-2.5">Correct Answer</th>
                      <th className="p-2.5">Validation Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[hsl(var(--border))]">
                    {previewResult.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[hsl(var(--muted)/0.2)]">
                        <td className="p-2.5">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              item.validation.status === 'VALID'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : item.validation.status === 'WARNING'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {item.validation.status}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-[11px] text-[hsl(var(--muted-foreground))]">
                          {item.question.id}
                        </td>
                        <td className="p-2.5 max-w-xs truncate font-medium text-[hsl(var(--foreground))]">
                          {item.question.question}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-emerald-700">
                          {item.question.correctAnswer}
                        </td>
                        <td className="p-2.5 text-[11px]">
                          {item.validation.errors.length > 0 ? (
                            <span className="text-rose-600 font-semibold">
                              {item.validation.errors.join('; ')}
                            </span>
                          ) : item.validation.warnings.length > 0 ? (
                            <span className="text-amber-600">
                              {item.validation.warnings.join('; ')}
                            </span>
                          ) : (
                            <span className="text-emerald-600">Ready to import</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Commit action */}
              <div className="flex items-center justify-between border-t border-[hsl(var(--border))] pt-4">
                <div className="text-xs text-[hsl(var(--muted-foreground))]">
                  Only items without fatal errors ({previewResult.validCount} questions) will be committed.
                </div>

                <button
                  type="button"
                  onClick={handleCommitImport}
                  disabled={previewResult.validCount === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Commit & Save {previewResult.validCount} Questions
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
