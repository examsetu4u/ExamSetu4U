import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  History,
  Layers,
  RotateCcw,
  Sparkles,
  Target,
  FileQuestion,
  BookCheck,
  Award,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { AutoDiagramRenderer } from '@/components/diagrams/AutoDiagramRenderer';
import { Button, Card, Container, Layout } from '@/components/site';
import {
  MATHS_CHAPTER_SECTIONS,
  getMathsChapter,
  getMathsQuestions,
  type MathsChapter,
  type MathsSectionKey,
} from '@/data/cbse-class-10-maths';
import { getStudyMaterial } from '@/data/curriculum';
import { getPYQsForTopic } from '@/data/pyq';
import { getFilteredQuestions } from '@/data/quiz/questions';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { useTopicStudyNotes } from '@/services/study-notes-loader';

interface MathsSectionViewerProps {
  chapter: MathsChapter;
  sectionKey: MathsSectionKey;
  examId?: string;
  subjectId?: string;
}

export function MathsSectionViewer({
  chapter,
  sectionKey,
  examId = 'cbse-class-10',
  subjectId = 'cbse-class-10-mathematics',
}: MathsSectionViewerProps) {
  const [, setLocation] = useLocation();
  const { publishedSheetCount } = useQuestionBank();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  // Live Study Notes synchronization from Google Sheet & Bundled Store
  const {
    notes: sheetNotes,
    isLoading: isSheetNotesLoading,
    refresh: refreshSheetNotes,
    lastSync,
  } = useTopicStudyNotes(chapter.id, examId, subjectId);

  const baseStudyMaterial = useMemo(() => {
    return getStudyMaterial(chapter.id);
  }, [chapter.id]);

  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [noteDifficultyFilter, setNoteDifficultyFilter] = useState<'ALL' | 'BASIC' | 'MODERATE' | 'ADVANCED'>('ALL');
  const [expandedNoteIds, setExpandedNoteIds] = useState<Record<string, boolean>>({});

  const toggleNoteExpand = (id: string) => {
    setExpandedNoteIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSheetNotes = useMemo(() => {
    return sheetNotes.filter((note) => {
      if (noteDifficultyFilter !== 'ALL') {
        const diff = (note.difficulty || '').toUpperCase();
        if (!diff.includes(noteDifficultyFilter)) return false;
      }
      if (noteSearchQuery.trim()) {
        const q = noteSearchQuery.toLowerCase();
        const matchTitle = (note.title || '').toLowerCase().includes(q);
        const matchTopic = (note.topic || '').toLowerCase().includes(q);
        const matchContent = (note.content || '').toLowerCase().includes(q);
        const matchCode = (note.topicCode || '').toLowerCase().includes(q);
        const matchFormula = (note.formulaRule || '').toLowerCase().includes(q);
        if (!matchTitle && !matchTopic && !matchContent && !matchCode && !matchFormula) {
          return false;
        }
      }
      return true;
    });
  }, [sheetNotes, noteDifficultyFilter, noteSearchQuery]);

  const section = useMemo(() => {
    return (
      MATHS_CHAPTER_SECTIONS.find((s) => s.key === sectionKey) ||
      MATHS_CHAPTER_SECTIONS[0]
    );
  }, [sectionKey]);

  // Find adjacent sections
  const currentIndex = MATHS_CHAPTER_SECTIONS.findIndex((s) => s.key === section.key);
  const prevSection = currentIndex > 0 ? MATHS_CHAPTER_SECTIONS[currentIndex - 1] : null;
  const nextSection =
    currentIndex < MATHS_CHAPTER_SECTIONS.length - 1
      ? MATHS_CHAPTER_SECTIONS[currentIndex + 1]
      : null;

  // Real PYQ check
  const realPYQs = useMemo(() => {
    return getPYQsForTopic(chapter.id);
  }, [chapter.id]);

  // Curated questions for this section
  const sectionQuestions = useMemo(() => {
    if (section.key === 'mcq') {
      const cur = getMathsQuestions(chapter.id, 'MCQ');
      const live = getFilteredQuestions({
        examId: 'cbse-class-10',
        subjectId: 'cbse-class-10-mathematics',
        topicId: chapter.id,
      });
      // Combine avoiding duplicates
      const ids = new Set(cur.map((q) => q.id));
      const liveConverted = live.filter((q) => !ids.has(q.id)).map((q) => ({
        id: q.id,
        examId: 'cbse-class-10',
        subjectId: 'cbse-class-10-mathematics',
        chapterId: chapter.id,
        topicId: chapter.slug,
        question: q.question,
        questionType: 'MCQ' as const,
        options: {
          A: typeof q.options?.A === 'string' ? q.options.A : (q.options as any)?.[0] || '',
          B: typeof q.options?.B === 'string' ? q.options.B : (q.options as any)?.[1] || '',
          C: typeof q.options?.C === 'string' ? q.options.C : (q.options as any)?.[2] || '',
          D: typeof q.options?.D === 'string' ? q.options.D : (q.options as any)?.[3] || '',
        },
        correctAnswer: (q.correctAnswer || (q as any).correctOption?.toUpperCase() || 'A') as 'A' | 'B' | 'C' | 'D',
        explanation: q.explanation,
        importantPoint: q.importantPoint,
        additionalFact: q.additionalFact,
        commonMistake: q.commonMistake,
        difficulty: (q.difficulty || 'MODERATE') as any,
        sourceType: (q.sourceType || 'PRACTICE') as any,
        year: q.year,
        marks: 1,
        status: 'PUBLISHED' as const,
        diagramRequired: q.diagramRequired,
        diagramType: q.diagramType,
        diagramData: q.diagramData,
        diagramCaption: q.diagramCaption,
        diagramImageUrl: q.diagramImageUrl,
        diagramAltText: q.diagramAltText,
      }));
      return [...cur, ...liveConverted];
    }
    if (section.key === 'assertion-reason') {
      return getMathsQuestions(chapter.id, 'ASSERTION_REASON');
    }
    if (section.key === 'very-short') {
      return getMathsQuestions(chapter.id, 'VERY_SHORT');
    }
    if (section.key === 'short-answer') {
      return getMathsQuestions(chapter.id, 'SHORT_ANSWER');
    }
    if (section.key === 'long-answer') {
      return getMathsQuestions(chapter.id, 'LONG_ANSWER');
    }
    if (section.key === 'case-based') {
      return getMathsQuestions(chapter.id, 'CASE_BASED');
    }
    return [];
  }, [chapter.id, chapter.slug, section.key, publishedSheetCount]);

  const handleSelectOption = (qId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionKey }));
  };

  const toggleSolution = (qId: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  return (
    <Layout>
      {/* 1. Header with Breadcrumbs */}
      <section className="hero-wash py-8 text-white sm:py-12">
        <Container>
          <div className="text-emerald-200">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Exams', href: '/exams' },
                { label: 'CBSE Class 10', href: `/exams/${examId}` },
                { label: 'Mathematics', href: `/exams/${examId}/mathematics` },
                {
                  label: `Ch ${chapter.chapterNumber}: ${chapter.title}`,
                  href: `/exams/${examId}/mathematics/${chapter.id}`,
                },
                { label: section.title },
              ]}
            />
          </div>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
                  अध्याय {chapter.chapterNumber}
                </span>
                <span className="rounded-full border border-emerald-300/30 bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-200">
                  {section.badge}
                </span>
              </div>
              <h1 className="font-display mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {section.title}
              </h1>
              <p className="mt-1 text-xs text-emerald-200 sm:text-sm">
                {chapter.title} ({chapter.hindiTitle})
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/exams/${examId}/mathematics/${chapter.id}`}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/20"
              >
                <ArrowLeft size={14} /> Back to Chapter
              </Link>
              <Link
                href={`/quiz/${examId}/${subjectId}/${chapter.id}`}
                className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-600"
              >
                <FileQuestion size={14} /> Full Chapter Quiz
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Main Section Content */}
      <section className="py-10">
        <Container>
          {/* Section: Study Material & Formulas with Seamless Google Sheet Continuity */}
          {section.key === 'study-material' && (
            <div className="space-y-8">
              {/* Part 1: App Foundation Notes & NCERT Syllabus */}
              <Card className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      भाग 1 • आधारभूत पाठ्यक्रम एवं सूत्र (Foundation Theory)
                    </span>
                    <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                      {chapter.title} — मुख्य संकल्पनाएँ एवं सूत्र
                    </h2>
                  </div>
                  <Link
                    href={`/study-material/${examId}/${subjectId}/${chapter.id}`}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                  >
                    <BookOpen size={14} /> संपूर्ण अध्ययन सामग्री रीडर खोलें
                  </Link>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {chapter.shortDescription}
                </p>

                {/* Key Formulas */}
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900">
                    📐 महत्वपूर्ण बोर्ड परीक्षा सूत्र (Key Formulas):
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm font-semibold text-emerald-950 font-mono">
                    {chapter.keyFormulas.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Detailed Syllabus Subtopics */}
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    CBSE NCERT पाठ्यक्रम के मुख्य विषय (Syllabus Sub-topics):
                  </h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {chapter.syllabusTopics.map((topic, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs sm:text-sm font-medium text-slate-700"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          {i + 1}
                        </span>
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Base Theory Sections if available */}
                {baseStudyMaterial?.sections && baseStudyMaterial.sections.length > 0 && (
                  <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      ऐप के प्राथमिक सैद्धांतिक नोट्स (App Base Concepts):
                    </h3>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {baseStudyMaterial.sections
                        .filter((s) => !s.heading.includes('Google Sheet'))
                        .map((sec, sIdx) => (
                          <div
                            key={sIdx}
                            className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4.5"
                          >
                            <h4 className="text-sm font-bold text-slate-900">{sec.heading}</h4>
                            {sec.subheading && (
                              <p className="mt-1 text-xs font-medium text-emerald-700">{sec.subheading}</p>
                            )}
                            <div className="mt-2 space-y-2 text-xs leading-relaxed text-slate-600">
                              {sec.paragraphs.map((p, pIdx) => (
                                <p key={pIdx}>{typeof p === 'string' ? p : p.text}</p>
                              ))}
                            </div>
                            {sec.bullets && sec.bullets.length > 0 && (
                              <ul className="mt-2.5 space-y-1 text-xs text-slate-700">
                                {sec.bullets.map((b, bIdx) => (
                                  <li key={bIdx} className="flex items-start gap-1.5">
                                    <span className="text-emerald-600 font-bold">•</span>
                                    <span>{typeof b === 'string' ? b : b.text}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Continuity Bridge Connector */}
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t-2 border-dashed border-emerald-300" />
                </div>
                <div className="relative flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs">
                  <Sparkles size={14} className="text-amber-300" />
                  <span>निरंतरता में आगे (In Continuity): Google Sheet सिंक विस्तृत नोट्स</span>
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* Part 2: Google Sheet Synced Detailed Notes (33 Topics) */}
              <div className="space-y-5">
                {/* Sync Header Banner & Controls */}
                <Card className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-2xs">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                          Google Sheet लाइव सिंक नोट्स
                        </span>
                        <span className="rounded-md bg-emerald-700 px-2 py-0.5 text-[11px] font-bold text-white">
                          {sheetNotes.length} विस्तृत टॉपिक्स
                        </span>
                      </div>
                      <h3 className="mt-1 text-base sm:text-lg font-bold text-slate-900">
                        {chapter.title} — विस्तृत अवधारणाएं, सूत्र एवं हल प्रश्न (Continuity Notes)
                      </h3>
                      <p className="mt-1 text-xs text-slate-600">
                        आपकी Google Sheet (gid: 491480742) से सिंक किए गए सभी 33 विशेष टॉपिक्स, हल उदाहरण व परीक्षा तकनीकें।
                        {lastSync && (
                          <span className="ml-2 font-medium text-emerald-800">
                            • अंतिम सिंक: {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="gap-1.5 rounded-xl border-emerald-300 bg-white text-xs font-bold text-emerald-800 hover:bg-emerald-100"
                        onClick={() => refreshSheetNotes()}
                        disabled={isSheetNotesLoading}
                      >
                        <RefreshCw size={13} className={isSheetNotesLoading ? 'animate-spin' : ''} />
                        {isSheetNotesLoading ? 'सिंक हो रहा है...' : 'रीफ्रेश शीट (Sync)'}
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          const allOpen = sheetNotes.every((n) => expandedNoteIds[n.id]);
                          const next: Record<string, boolean> = {};
                          sheetNotes.forEach((n) => (next[n.id] = !allOpen));
                          setExpandedNoteIds(next);
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {sheetNotes.every((n) => expandedNoteIds[n.id]) ? 'सभी समेटें (Collapse)' : 'सभी खोलें (Expand)'}
                      </button>
                    </div>
                  </div>

                  {/* Search and Difficulty Filter Toolbar */}
                  <div className="mt-4 flex flex-col gap-3 pt-3 border-t border-emerald-200/70 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="टॉपिक का नाम, सूत्र (Formula), या कॉन्सेप्ट खोजें..."
                        value={noteSearchQuery}
                        onChange={(e) => setNoteSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-emerald-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                      />
                      {noteSearchQuery && (
                        <button
                          onClick={() => setNoteSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                        <Filter size={12} /> स्तर:
                      </span>
                      {(['ALL', 'BASIC', 'MODERATE', 'ADVANCED'] as const).map((level) => {
                        const labels = {
                          ALL: `सभी (${sheetNotes.length})`,
                          BASIC: 'Basic (सरल)',
                          MODERATE: 'Moderate (मध्यम)',
                          ADVANCED: 'Advanced (उच्च)',
                        };
                        const active = noteDifficultyFilter === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setNoteDifficultyFilter(level)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                              active
                                ? 'bg-emerald-700 text-white shadow-2xs'
                                : 'bg-white border border-emerald-200 text-slate-700 hover:bg-emerald-100/50'
                            }`}
                          >
                            {labels[level]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                {/* List of Sheet Notes */}
                {filteredSheetNotes.length === 0 ? (
                  <Card className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                    <p className="text-sm font-semibold text-slate-600">
                      कोई नोट्स नहीं मिले जो आपकी खोज &quot;{noteSearchQuery}&quot; से मेल खाते हों।
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-3 text-xs"
                      onClick={() => {
                        setNoteSearchQuery('');
                        setNoteDifficultyFilter('ALL');
                      }}
                    >
                      फिल्टर साफ़ करें
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredSheetNotes.map((note) => {
                      const isExpanded = expandedNoteIds[note.id] !== false;
                      const diffColor =
                        note.difficulty?.toLowerCase().includes('adv')
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : note.difficulty?.toLowerCase().includes('mod')
                          ? 'bg-amber-100 text-amber-900 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                      return (
                        <Card
                          key={note.id}
                          className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-emerald-300 hover:shadow-xs"
                        >
                          {/* Card Top / Header */}
                          <div
                            onClick={() => toggleNoteExpand(note.id)}
                            className="flex cursor-pointer items-start justify-between gap-3 p-5 sm:p-6 bg-slate-50/40 hover:bg-slate-50 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                {note.topicCode && (
                                  <span className="rounded-md bg-emerald-800 px-2.5 py-0.5 font-mono text-xs font-bold text-white">
                                    {note.topicCode}
                                  </span>
                                )}
                                {note.topic && (
                                  <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700">
                                    {note.topic}
                                  </span>
                                )}
                                {note.contentType && (
                                  <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
                                    {note.contentType}
                                  </span>
                                )}
                                {note.difficulty && (
                                  <span className={`rounded-md border px-2 py-0.5 text-xs font-bold ${diffColor}`}>
                                    {note.difficulty}
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-2 text-base sm:text-lg font-bold text-slate-900">
                                {note.title}
                              </h3>
                            </div>

                            <button
                              type="button"
                              className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800"
                              aria-label={isExpanded ? 'Collapse note' : 'Expand note'}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>

                          {/* Expanded Content Body */}
                          {isExpanded && (
                            <div className="space-y-4 border-t border-slate-100 p-5 sm:p-6">
                              {/* Detailed Concept */}
                              {note.content && (
                                <div className="text-xs sm:text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                                  {note.content}
                                </div>
                              )}

                              {/* Formula or Rule Callout */}
                              {note.formulaRule && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                                  <div className="flex items-start gap-2.5">
                                    <span className="rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
                                      सूत्र / नियम (Formula / Rule)
                                    </span>
                                  </div>
                                  <div className="mt-2 font-mono text-xs sm:text-sm font-bold text-emerald-950 whitespace-pre-line">
                                    {note.formulaRule}
                                  </div>
                                </div>
                              )}

                              {/* Why / When to Use */}
                              {note.whyWhenToUse && (
                                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs text-blue-950">
                                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                                    <Lightbulb size={14} className="text-blue-600" />
                                    <span>कब और क्यों प्रयोग करें (Why & When to Use):</span>
                                  </div>
                                  <p className="mt-1 text-slate-700 leading-relaxed">{note.whyWhenToUse}</p>
                                </div>
                              )}

                              {/* Solved Example */}
                              {note.solvedExample && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                                  <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                                      Ex
                                    </span>
                                    <span>हल किया हुआ उदाहरण (Solved Example):</span>
                                  </div>
                                  <div className="mt-2 text-xs sm:text-sm text-slate-800 font-mono bg-white p-3 rounded-lg border border-slate-200/80 whitespace-pre-line leading-relaxed">
                                    {note.solvedExample}
                                  </div>
                                </div>
                              )}

                              {/* Advanced Example */}
                              {note.advancedExample && (
                                <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
                                  <div className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-purple-600" />
                                    <span>उच्च स्तरीय उदाहरण (Advanced / HOTS):</span>
                                  </div>
                                  <div className="mt-2 text-xs sm:text-sm text-purple-950 font-mono bg-white p-3 rounded-lg border border-purple-200 whitespace-pre-line leading-relaxed">
                                    {note.advancedExample}
                                  </div>
                                </div>
                              )}

                              {/* Key Points & Mistakes Grid */}
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
                                {note.importantPoint && (
                                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-950">
                                    <h5 className="font-bold text-amber-900">⭐ महत्वपूर्ण परीक्षा बिंदु (Key Point):</h5>
                                    <p className="mt-1 text-slate-700 leading-relaxed">{note.importantPoint}</p>
                                  </div>
                                )}

                                {note.commonMistakes && (
                                  <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5 text-xs text-rose-950">
                                    <h5 className="font-bold text-rose-900 flex items-center gap-1">
                                      <AlertTriangle size={13} />
                                      सामान्य गलती (Mistake to Avoid):
                                    </h5>
                                    <p className="mt-1 text-slate-700 leading-relaxed">{note.commonMistakes}</p>
                                  </div>
                                )}
                              </div>

                              {/* Board Exam Application */}
                              {note.examApplication && (
                                <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 flex items-start gap-2">
                                  <Target size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                                  <span>
                                    <strong>बोर्ड परीक्षा उपयोग:</strong> {note.examApplication}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">आगे क्या अभ्यास करना चाहते हैं?</h4>
                  <p className="text-xs text-slate-500">सभी सूत्रों का त्वरित रिवीजन करें अथवा वस्तुनिष्ठ प्रश्न हल करें।</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/study-material/${examId}/${subjectId}/${chapter.id}`}
                    className="focus-ring inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    <BookOpen size={14} /> संपूर्ण रीडर दृश्य
                  </Link>
                  <Link
                    href={`/exams/${examId}/mathematics/${chapter.id}/mcq`}
                    className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <FileQuestion size={14} /> MCQ अभ्यास शुरू करें
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Section: Questions (MCQ, Assertion-Reason, VSA, SA, LA, Case-based) */}
          {['mcq', 'assertion-reason', 'very-short', 'short-answer', 'long-answer', 'case-based'].includes(
            section.key
          ) && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    {section.title} ({sectionQuestions.length} प्रश्न)
                  </h2>
                  <p className="text-xs text-slate-500">{section.description}</p>
                </div>

                {section.key === 'mcq' && (
                  <Link
                    href={`/quiz/${examId}/${subjectId}/${chapter.id}`}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700"
                  >
                    <Clock size={13} /> Timed Quiz Mode
                  </Link>
                )}
              </div>

              {sectionQuestions.length === 0 ? (
                <Card className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <FileQuestion size={24} />
                  </div>
                  <h3 className="mt-3 text-base font-bold text-slate-800">{section.emptyHeading}</h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                    {section.emptyDescription}
                  </p>
                  <div className="mt-5">
                    <Link
                      href={`/quiz/${examId}/${subjectId}/${chapter.id}`}
                      className="focus-ring inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      Start Full Practice
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="space-y-5">
                  {sectionQuestions.map((q, qIndex) => {
                    const selected = selectedAnswers[q.id];
                    const isRevealed = revealedSolutions[q.id] || Boolean(selected);
                    const isCorrect = selected && selected === q.correctAnswer;

                    return (
                      <Card
                        key={q.id}
                        id={`q-${q.id}`}
                        className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 transition hover:border-slate-300"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 text-xs font-black text-emerald-800">
                              Q{qIndex + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              {q.marks || 1} Mark{q.marks && q.marks > 1 ? 's' : ''}
                            </span>
                            {q.year && (
                              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                CBSE {q.year}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-slate-400 font-mono">
                            {q.id}
                          </span>
                        </div>

                        {/* Question Text */}
                        <div className="mt-4 text-sm font-semibold leading-relaxed text-slate-900 sm:text-base whitespace-pre-line">
                          {q.question}
                        </div>

                        {/* Optional Question Diagram (Auto SVG or Hosted Image) */}
                        {q.diagramRequired && (
                          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-center">
                            {q.diagramImageUrl ? (
                              <div className="mx-auto max-w-sm">
                                <img
                                  src={q.diagramImageUrl}
                                  alt={q.diagramAltText || q.diagramCaption || 'Question Diagram'}
                                  className="mx-auto max-h-56 rounded-lg object-contain"
                                  loading="lazy"
                                />
                                {q.diagramCaption && (
                                  <p className="mt-2 text-xs font-medium text-slate-500 italic">
                                    {q.diagramCaption}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <AutoDiagramRenderer
                                type={q.diagramType as any}
                                data={q.diagramData}
                                caption={q.diagramCaption}
                              />
                            )}
                          </div>
                        )}

                        {/* Multiple Choice / Options */}
                        {q.options && (
                          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                              const optVal = q.options?.[optKey];
                              if (!optVal) return null;

                              const isThisSelected = selected === optKey;
                              const isThisCorrect = q.correctAnswer === optKey;

                              let btnClasses =
                                'flex items-center gap-3 rounded-xl border p-3 text-xs sm:text-sm font-medium text-left transition';

                              if (!isRevealed) {
                                btnClasses +=
                                  ' border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-300 text-slate-800';
                              } else {
                                if (isThisCorrect) {
                                  btnClasses += ' border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                                } else if (isThisSelected) {
                                  btnClasses += ' border-rose-500 bg-rose-50 text-rose-950';
                                } else {
                                  btnClasses += ' border-slate-200 bg-slate-50 text-slate-500 opacity-70';
                                }
                              }

                              return (
                                <button
                                  key={optKey}
                                  type="button"
                                  onClick={() => handleSelectOption(q.id, optKey)}
                                  className={btnClasses}
                                >
                                  <span
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                      isRevealed && isThisCorrect
                                        ? 'bg-emerald-600 text-white'
                                        : isRevealed && isThisSelected
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-white border border-slate-300 text-slate-700'
                                    }`}
                                  >
                                    {optKey}
                                  </span>
                                  <span className="leading-snug">{optVal}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Toggle Solution for Non-MCQs or already clicked */}
                        {!q.options && (
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSolution(q.id)}
                              className="text-xs font-bold"
                            >
                              {isRevealed ? 'Hide Solution' : 'Show Answer & Step-by-Step Solution'}
                            </Button>
                          </div>
                        )}

                        {/* Solution & Explanation Box */}
                        {isRevealed && (
                          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                              <CheckCircle2 size={15} className="text-emerald-600" />
                              <span>
                                {q.correctAnswer ? `सही उत्तर (Correct Answer): ${q.correctAnswer}` : 'हल (Solution)'}
                              </span>
                            </div>

                            {q.explanation && (
                              <p className="mt-2 text-slate-800 leading-relaxed">
                                {q.explanation}
                              </p>
                            )}

                            {q.formulaUsed && (
                              <div className="mt-2 rounded-lg border border-emerald-300/60 bg-white/90 p-2 text-xs text-emerald-950 font-mono">
                                <strong>प्रयुक्त सूत्र (Formula Used):</strong> {q.formulaUsed}
                              </div>
                            )}

                            {q.importantPoint && (
                              <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50/80 p-2 text-xs text-blue-900">
                                <strong>महत्वपूर्ण बिंदु (Key Note):</strong> {q.importantPoint}
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section: PYQ */}
          {section.key === 'pyq' && (
            <Card className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                CBSE Board Previous Years' Questions (2019 - 2024)
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                सीबीएसई बोर्ड परीक्षा में {chapter.title} से पूछे गए आधिकारिक बोर्ड प्रश्न एवं मार्किंग स्कीम।
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/pyq/${examId}/${subjectId}/${chapter.id}`}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-800"
                >
                  <History size={15} /> बोर्ड PYQ अभ्यास शुरू करें
                </Link>
                <Link
                  href={`/pyq/${examId}/${subjectId}`}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  गणित के सभी PYQs (All Maths PYQs)
                </Link>
              </div>
            </Card>
          )}

          {/* Section: Formula Sheet / Revision */}
          {section.key === 'revision' && (
            <div className="space-y-6">
              <Card className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      रैपिड फॉर्मूला शीट • परीक्षा दोहराव
                    </span>
                    <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                      {chapter.title} — Quick Revision Formula Sheet
                    </h2>
                  </div>
                  {sheetNotes.length > 0 && (
                    <span className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                      🟢 {sheetNotes.length} Google Sheet टॉपिक्स सिंक
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm text-slate-600">
                  परीक्षा से पहले त्वरित दोहराव के लिए मुख्य सूत्र, प्रमेय एवं Google Sheet से प्राप्त नियम।
                </p>

                {/* Base Formulas */}
                <div className="mt-6 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    NCERT मुख्य सूत्र (Core Formulas):
                  </h3>
                  {chapter.keyFormulas.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 font-mono text-sm text-emerald-950"
                    >
                      <span>{f}</span>
                      <span className="text-xs font-sans font-bold text-emerald-700">Formula #{i + 1}</span>
                    </div>
                  ))}
                </div>

                {/* Google Sheet Synced Formulas */}
                {sheetNotes.some((n) => n.formulaRule) && (
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <Sparkles size={14} /> Google Sheet सिंक विस्तृत सूत्र एवं नियम (Synced Rules):
                    </h3>
                    <div className="mt-3 space-y-2.5">
                      {sheetNotes
                        .filter((n) => n.formulaRule)
                        .map((n) => (
                          <div
                            key={n.id}
                            className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-slate-900">
                                {n.topicCode ? `[${n.topicCode}] ` : ''}{n.title}
                              </span>
                              {n.difficulty && (
                                <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                                  {n.difficulty}
                                </span>
                              )}
                            </div>
                            <div className="mt-1.5 font-mono text-emerald-900 font-semibold whitespace-pre-line">
                              {n.formulaRule}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Important Exam Tips & Strategy:
                  </h3>
                  <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600">
                    <li>• प्रश्नों को हल करते समय सूत्रों को स्पष्ट लिखें; सीबीएसई मार्किंग स्कीम में स्टेप मार्किंग होती है।</li>
                    <li>• इकाई (units जैसे cm, cm², cm³) का ध्यान रखें; अंतिम उत्तर में इकाई लिखना न भूलें।</li>
                    <li>• अभाज्य गुणनखंड करते समय घातांक (exponents) के नियमों का ध्यानपूर्वक पालन करें।</li>
                    {sheetNotes
                      .filter((n) => n.examTip)
                      .slice(0, 5)
                      .map((n, i) => (
                        <li key={i} className="text-emerald-900">
                          • <strong>{n.title}:</strong> {n.examTip}
                        </li>
                      ))}
                  </ul>
                </div>
              </Card>
            </div>
          )}

          {/* Section: Common Mistakes */}
          {section.key === 'mistake-practice' && (
            <Card className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {chapter.title} — सामान्य गणितीय गलतियाँ (Mistake Book)
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                सीबीएसई बोर्ड परीक्षा में छात्र अक्सर जिन बिंदुओं पर अंक खो देते हैं:
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-xs sm:text-sm text-rose-950">
                  <h3 className="font-bold text-rose-900">⚠️ चिह्न एवं कोष्ठक संबंधी गलतियाँ (Sign & Bracket Errors):</h3>
                  <p className="mt-1 leading-relaxed">
                    घटाने वाले पदों को कोष्ठक में न रखने से चिह्नों में त्रुटि हो जाती है, विशेषकर (b² - 4ac) और विभाजन करते समय।
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs sm:text-sm text-amber-950">
                  <h3 className="font-bold text-amber-900">⚠️ सूत्र में मान रखने की त्रुटि (Substitution Slips):</h3>
                  <p className="mt-1 leading-relaxed">
                    त्रिकोणमिति में standard angles के मान गलत लिख देना अथवा क्षेत्रफल में r² के स्थान पर 2r लिख देना।
                  </p>
                </div>

                {/* Mistakes from Google Sheet */}
                {sheetNotes
                  .filter((n) => n.commonMistakes)
                  .map((n) => (
                    <div
                      key={n.id}
                      className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 text-xs sm:text-sm text-rose-950"
                    >
                      <h4 className="font-bold text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-rose-600 shrink-0" />
                        <span>{n.title} — सामान्य त्रुटि:</span>
                      </h4>
                      <p className="mt-1 leading-relaxed text-slate-700">{n.commonMistakes}</p>
                    </div>
                  ))}
              </div>

              <div className="mt-6">
                <Link
                  href="/mistakes"
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <Target size={14} /> संपूर्ण मिस्टेक बुक खोलें
                </Link>
              </div>
            </Card>
          )}

          {/* Section: Chapter Mock Test */}
          {section.key === 'chapter-test' && (
            <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-700">
                    <Award size={14} /> अध्याय-वार गणित मॉक टेस्ट
                  </span>
                  <h2 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
                    {chapter.title} — सीबीएसई बोर्ड पैटर्न अध्याय टेस्ट
                  </h2>
                  <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                    {chapter.hindiTitle} के सभी मुख्य सूत्रों और संकल्पनाओं पर आधारित समयबद्ध ऑनलाइन मॉक टेस्ट।
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
                  <span className="text-[11px] font-semibold text-slate-500">प्रश्नों की संख्या</span>
                  <p className="mt-1 text-lg font-black text-slate-900">15 प्रश्न</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
                  <span className="text-[11px] font-semibold text-slate-500">समय सीमा</span>
                  <p className="mt-1 text-lg font-black text-emerald-700">25 मिनट</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
                  <span className="text-[11px] font-semibold text-slate-500">कुल अंक</span>
                  <p className="mt-1 text-lg font-black text-slate-900">15 अंक</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
                  <span className="text-[11px] font-semibold text-slate-500">नेगेटिव मार्किंग</span>
                  <p className="mt-1 text-lg font-black text-slate-600">कोई नहीं</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-xs text-slate-700">
                <p className="font-bold text-emerald-900">गणित परीक्षा अभ्यास निर्देश:</p>
                <ul className="mt-1.5 space-y-1 text-slate-600">
                  <li>• अपने साथ रफ पेपर और पेन रखें ताकि गणना और सूत्र सही प्रकार लिख सकें।</li>
                  <li>• सभी वस्तुनिष्ठ प्रश्न सीबीएसई बोर्ड स्टैंडर्ड के अनुसार तैयार किए गए हैं।</li>
                  <li>• टेस्ट पूरा करने के बाद स्टेप-बाय-स्टेप हल और स्कोरकार्ड देखें।</li>
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/quiz/${examId}/${subjectId}/${chapter.id}`}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-800"
                >
                  <Clock size={15} /> मॉक टेस्ट प्रारंभ करें (Start Test)
                </Link>
                <Link
                  href={`/exams/${examId}/mathematics/${chapter.id}/mcq`}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  MCQ अभ्यास करें
                </Link>
              </div>
            </Card>
          )}

          {/* Bottom Pagination to Adjacent Sections */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
            {prevSection ? (
              <Link
                href={`/exams/${examId}/mathematics/${chapter.id}/${prevSection.targetRouteSegment}`}
                className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft size={14} /> {prevSection.title}
              </Link>
            ) : <div />}

            {nextSection && (
              <Link
                href={`/exams/${examId}/mathematics/${chapter.id}/${nextSection.targetRouteSegment}`}
                className="focus-ring inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800"
              >
                {nextSection.title} <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </Container>
      </section>
    </Layout>
  );
}
