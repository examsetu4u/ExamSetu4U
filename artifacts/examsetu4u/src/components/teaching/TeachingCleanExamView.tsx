import React, { useState, useMemo } from 'react';
import { Link } from 'wouter';
import {
  BookOpen,
  FileText,
  FileQuestion,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Lightbulb,
  Zap,
  Brain,
  X,
  GraduationCap,
  ListOrdered,
  Award,
  BookMarked,
  Layers,
} from 'lucide-react';
import {
  getTeachingExamHierarchy,
  TeachingExamStructure,
  HierarchyPaper,
  HierarchySubject,
  HierarchyChapter,
  HierarchyTopic,
} from '@/data/teaching-curriculum-hierarchy';
import { Button, Card } from '@/components/site';

interface TeachingCleanExamViewProps {
  examId: 'ctet' | 'uptet' | 'super-tet';
}

export function TeachingCleanExamView({ examId }: TeachingCleanExamViewProps) {
  const exam = useMemo(() => getTeachingExamHierarchy(examId), [examId]);

  // Selected subject for Paper 1 & Paper 2
  const [activeSubjectPaper1, setActiveSubjectPaper1] = useState<string | null>(null);
  const [activeSubjectPaper2, setActiveSubjectPaper2] = useState<string | null>(null);

  // Expanded syllabus mode for paper 1 & 2
  const [showFullSyllabusP1, setShowFullSyllabusP1] = useState<boolean>(false);
  const [showFullSyllabusP2, setShowFullSyllabusP2] = useState<boolean>(false);

  // State for "Other" modal (Key Concepts, Formulae, Revision points)
  const [otherModalData, setOtherModalData] = useState<{
    chapter: HierarchyChapter;
    topic?: HierarchyTopic;
    subjectName: string;
    paperName: string;
  } | null>(null);

  if (!exam) {
    return null;
  }

  const paper1 = exam.papers[0]; // Primary (1-5)
  const paper2 = exam.papers[1]; // Upper Primary (6-8)

  return (
    <div className="w-full space-y-8" id="teaching-clean-exam-container">
      {/* 1. Clear Exam Title & Introduction */}
      <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1 text-xs font-bold text-blue-200 border border-white/15 backdrop-blur-xs">
              <GraduationCap size={15} />
              <span>शिक्षक पात्रता एवं भर्ती परीक्षा (Teaching Exam Portal)</span>
            </div>
            <h1 className="font-display mt-3 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {exam.name} — {exam.hindiName}
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              {exam.description}
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0">
            <span className="rounded-xl bg-blue-500/20 border border-blue-300/30 px-3.5 py-2 text-center text-xs font-bold text-blue-100">
              <span className="block text-xl font-extrabold text-white">150</span>
              कुल प्रश्न एवं अंक
            </span>
          </div>
        </div>
      </div>

      {/* 2. TILE 1 (ऊपर का टाइल): Primary Level (कक्षा 1 से 5) */}
      {paper1 && (
        <PaperTile
          paperNumber={1}
          examId={examId}
          paper={paper1}
          levelLabel="Primary Level (कक्षा 1 - 5)"
          levelHindi="प्राथमिक स्तर (कक्षा 1 से 5)"
          activeSubjectId={activeSubjectPaper1}
          onSelectSubject={(id) => {
            setActiveSubjectPaper1((prev) => (prev === id ? null : id));
          }}
          showFullSyllabus={showFullSyllabusP1}
          onToggleSyllabus={() => setShowFullSyllabusP1((prev) => !prev)}
          onOpenOtherModal={(chapter, topic, subjectName) => {
            setOtherModalData({
              chapter,
              topic,
              subjectName,
              paperName: paper1.hindiName || paper1.name,
            });
          }}
        />
      )}

      {/* 3. TILE 2 (नीचे का टाइल): Upper Primary Level (कक्षा 6 से 8) */}
      {paper2 && (
        <PaperTile
          paperNumber={2}
          examId={examId}
          paper={paper2}
          levelLabel="Upper Primary Level (कक्षा 6 - 8)"
          levelHindi="उच्च प्राथमिक स्तर (कक्षा 6 से 8)"
          activeSubjectId={activeSubjectPaper2}
          onSelectSubject={(id) => {
            setActiveSubjectPaper2((prev) => (prev === id ? null : id));
          }}
          showFullSyllabus={showFullSyllabusP2}
          onToggleSyllabus={() => setShowFullSyllabusP2((prev) => !prev)}
          onOpenOtherModal={(chapter, topic, subjectName) => {
            setOtherModalData({
              chapter,
              topic,
              subjectName,
              paperName: paper2.hindiName || paper2.name,
            });
          }}
        />
      )}

      {/* 4. MODAL FOR "OTHER" (महत्वपूर्ण सूत्र, नियम, मुख्य बिंदु व क्विक रिवीजन) */}
      {otherModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs transition-opacity"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 rounded-md px-2 py-0.5 border border-amber-200">
                  <Lightbulb size={13} /> 4. Other — महत्वपूर्ण तथ्य एवं रिवीजन
                </span>
                <h3 className="mt-1.5 text-lg sm:text-xl font-bold text-slate-900">
                  {otherModalData.chapter.hindiName || otherModalData.chapter.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {otherModalData.paperName} • {otherModalData.subjectName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOtherModalData(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 space-y-4 text-xs sm:text-sm text-slate-700">
              {/* Key Concepts */}
              {otherModalData.topic?.keyConcepts && otherModalData.topic.keyConcepts.length > 0 && (
                <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
                  <p className="font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                    <Sparkles size={15} className="text-amber-600" />
                    मुख्य सिद्धांत व परीक्षा संकल्पनाएं (Key Concepts & Rules):
                  </p>
                  <ul className="space-y-1.5 list-disc pl-5 text-amber-950 font-medium">
                    {otherModalData.topic.keyConcepts.map((kc, i) => (
                      <li key={i}>{kc}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sub-topics */}
              {otherModalData.topic?.subTopics && otherModalData.topic.subTopics.length > 0 && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                  <p className="font-bold text-blue-900 flex items-center gap-1.5 mb-2">
                    <BookMarked size={15} className="text-blue-600" />
                    पाठ्यक्रम के उप-विषय (Sub-topics covered):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {otherModalData.topic.subTopics.map((st, i) => {
                      const label = typeof st === 'string' ? st : st.name;
                      return (
                        <span
                          key={i}
                          className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 border border-slate-200 shadow-2xs"
                        >
                          ✓ {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Study Notes Preview / Revision Tips */}
              {otherModalData.topic?.studyNotesPreview && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-bold text-slate-900 mb-1.5">रिवीजन सारांश (Quick Summary):</p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {otherModalData.topic.studyNotesPreview}
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                <p className="font-bold text-indigo-900 flex items-center gap-1.5 mb-1">
                  <Award size={15} className="text-indigo-600" />
                  परीक्षा में पूछे जाने वाले प्रमुख बिंदु:
                </p>
                <p className="text-xs text-indigo-950 leading-relaxed">
                  इस अध्याय से सीधे परिभाषाएं, प्रतिपादक मनोवैज्ञानिक/वैज्ञानिकों के नाम, शिक्षण विधियां और वास्तविक कक्षा-कक्ष परिस्थितियों पर आधारित प्रश्न पूछे जाते हैं।
                </p>
              </div>
            </div>

            {/* Modal Footer with Direct Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <Button
                href={`/quiz/${examId}/${otherModalData.topic?.id || 'all'}`}
                variant="secondary"
                className="text-xs h-9 font-bold"
              >
                <Brain size={14} /> MCQ टेस्ट दें
              </Button>
              <Button
                variant="primary"
                onClick={() => setOtherModalData(null)}
                className="text-xs h-9 font-bold"
              >
                बंद करें (Close)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENT: PaperTile (Each Paper Box: Primary vs Upper Primary)
// =============================================================================

interface PaperTileProps {
  paperNumber: 1 | 2;
  examId: string;
  paper: HierarchyPaper;
  levelLabel: string;
  levelHindi: string;
  activeSubjectId: string | null;
  onSelectSubject: (subjectId: string) => void;
  showFullSyllabus: boolean;
  onToggleSyllabus: () => void;
  onOpenOtherModal: (chapter: HierarchyChapter, topic: HierarchyTopic | undefined, subjectName: string) => void;
}

function PaperTile({
  paperNumber,
  examId,
  paper,
  levelLabel,
  levelHindi,
  activeSubjectId,
  onSelectSubject,
  showFullSyllabus,
  onToggleSyllabus,
  onOpenOtherModal,
}: PaperTileProps) {
  const subjects = paper.subjects || [];

  return (
    <div
      className="rounded-2xl border-2 border-slate-200/90 bg-white shadow-xs overflow-hidden transition"
      id={`paper-tile-${paperNumber}`}
    >
      {/* TILE HEADER: Primary Level (1-5) or Upper Primary Level (6-8) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-6 py-4.5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-sm shadow-xs">
            {paperNumber}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                {levelLabel}
              </h2>
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
                {paper.targetClass}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {levelHindi} • {subjects.length} कुल विषय (Subjects)
            </p>
          </div>
        </div>

        {/* Top Right: "Syllabus" Button as explicitly drawn in diagram */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onToggleSyllabus}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
              showFullSyllabus
                ? 'bg-blue-700 border-blue-700 text-white'
                : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
            }`}
            title="पूरा पाठ्यक्रम देखें या छिपाएं"
          >
            <BookOpen size={14} />
            <span>Syllabus (पाठ्यक्रम)</span>
            {showFullSyllabus ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* TILE BODY: List of Subjects (1, 2, 3... 10) */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <ListOrdered size={15} className="text-blue-600" />
            <span>विषय सूची (Subjects — नीचे किसी भी विषय पर क्लिक करें)</span>
          </p>
          <span className="text-xs font-semibold text-slate-400">
            {subjects.length} विषय उपलब्ध
          </span>
        </div>

        {/* Subjects List / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((subj, index) => {
            const isSelected = activeSubjectId === subj.id || showFullSyllabus;
            const subjectNumber = index + 1;
            const chapterCount = subj.chapters?.length || 0;

            return (
              <button
                key={subj.id}
                type="button"
                onClick={() => onSelectSubject(subj.id)}
                className={`group flex items-start justify-between text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-500/30 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Number Badge (1, 2, 3...) */}
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold mt-0.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800'
                    }`}
                  >
                    {subjectNumber}
                  </span>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-900">
                      {subj.hindiName || subj.name}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                      {subj.name}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {chapterCount} {chapterCount === 1 ? 'Chapter' : 'Chapters'}
                      </span>
                      {subj.group && (
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded capitalize">
                          {subj.group}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 mt-1">
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isSelected ? 'rotate-180 text-blue-700' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* EXPANDED SUBJECT DETAILS (Chapters & 4 Boxes: Notes, MCQ, PYQ, Other) */}
        {subjects.map((subj) => {
          const isSelected = activeSubjectId === subj.id || showFullSyllabus;
          if (!isSelected) return null;

          return (
            <div
              key={`expanded-${subj.id}`}
              className="mt-6 rounded-2xl border-2 border-blue-200 bg-blue-50/30 p-5 sm:p-6 transition animate-in fade-in duration-200"
            >
              {/* Subject Title & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200/60 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 rounded px-2 py-0.5">
                    पाठ्यक्रम एवं अध्ययन सामग्री (Syllabus & Materials)
                  </span>
                  <h3 className="mt-1 text-xl font-black text-slate-900">
                    {subj.hindiName || subj.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed max-w-3xl">
                    {subj.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    href={`/exams/${examId}/${subj.canonicalSubjectId || subj.id}`}
                    variant="primary"
                    className="text-xs h-8 font-bold"
                  >
                    पूरा विषय खोलें <ArrowRight size={13} />
                  </Button>
                </div>
              </div>

              {/* Chapters List */}
              <div className="mt-5 space-y-4">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Layers size={14} className="text-blue-600" />
                  <span>अध्याय (Chapters) — प्रत्येक चैप्टर के लिए 4 विकल्प (Notes, MCQ, PYQ, Other):</span>
                </p>

                {subj.chapters && subj.chapters.length > 0 ? (
                  subj.chapters.map((chapter, chIdx) => {
                    const chNumber = chapter.chapterNumber ?? (chIdx + 1);
                    const firstTopic = chapter.topics?.[0];
                    const canonicalSubj = subj.canonicalSubjectId || subj.id;

                    return (
                      <div
                        key={chapter.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs hover:border-blue-300 transition"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Chapter Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-800 text-[11px] font-black">
                                {chNumber}
                              </span>
                              <h4 className="text-sm sm:text-base font-bold text-slate-900">
                                {chapter.hindiName || chapter.name}
                              </h4>
                            </div>

                            {/* Topics preview */}
                            {chapter.topics && chapter.topics.length > 0 && (
                              <div className="mt-2 pl-7 flex flex-wrap gap-1.5">
                                {chapter.topics.map((t) => (
                                  <span
                                    key={t.id}
                                    className="rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                                  >
                                    • {t.hindiName || t.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* EXACT 4 BOXES AS DRAWN IN USER'S DIAGRAM:
                              [ Notes | MCQ ]
                              [ PYQ   | Other ]
                          */}
                          <div className="w-full md:w-auto shrink-0">
                            <div className="grid grid-cols-2 gap-2 w-full md:w-[320px]">
                              {/* 1. NOTES */}
                              <Link
                                href={`/study-material/${examId}/${canonicalSubj}/${firstTopic?.id || 'all'}`}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50/80 px-3 py-2 text-center text-xs font-bold text-blue-800 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition shadow-2xs"
                                title="चैप्टर नोट्स व थ्योरी पढ़ें"
                              >
                                <FileText size={14} />
                                <span>1. Notes (नोट्स)</span>
                              </Link>

                              {/* 2. MCQ */}
                              <Link
                                href={`/quiz/${examId}/${canonicalSubj}/${firstTopic?.id || 'all'}`}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50/80 px-3 py-2 text-center text-xs font-bold text-indigo-800 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition shadow-2xs"
                                title="चैप्टर के MCQ अभ्यास प्रश्न हल करें"
                              >
                                <Brain size={14} />
                                <span>2. MCQ (क्विज़)</span>
                              </Link>

                              {/* 3. PYQ */}
                              <Link
                                href={`/pyq/${examId}/${canonicalSubj}`}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50/80 px-3 py-2 text-center text-xs font-bold text-purple-800 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition shadow-2xs"
                                title="विगत वर्षों के प्रश्न (PYQ) देखें"
                              >
                                <FileQuestion size={14} />
                                <span>3. PYQ (पुराने Q)</span>
                              </Link>

                              {/* 4. OTHER */}
                              <button
                                type="button"
                                onClick={() => onOpenOtherModal(chapter, firstTopic, subj.hindiName || subj.name)}
                                className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50/80 px-3 py-2 text-center text-xs font-bold text-amber-800 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition shadow-2xs"
                                title="महत्वपूर्ण सूत्र, नियम व त्वरित रिवीजन"
                              >
                                <Lightbulb size={14} />
                                <span>4. Other (रिवीजन)</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                    इस विषय का विस्तृत पाठ्यक्रम उपलब्ध है।
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
