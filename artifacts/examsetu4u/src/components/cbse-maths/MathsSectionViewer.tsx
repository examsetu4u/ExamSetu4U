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
import { getPYQsForTopic } from '@/data/pyq';
import { getFilteredQuestions } from '@/data/quiz/questions';
import { useQuestionBank } from '@/hooks/useQuestionBank';

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
          {/* Section: Study Material & Formulas */}
          {section.key === 'study-material' && (
            <div className="space-y-6">
              <Card className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                  {chapter.title} — मुख्य संकल्पनाएँ एवं सूत्र
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
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

                <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
                  <Link
                    href={`/study-material/${examId}/${subjectId}/${chapter.id}`}
                    className="focus-ring inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-800"
                  >
                    <BookOpen size={14} /> संपूर्ण स्टडी नोट्स पढ़ें
                  </Link>
                  <Link
                    href={`/exams/${examId}/mathematics/${chapter.id}/mcq`}
                    className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <FileQuestion size={14} /> वस्तुनिष्ठ प्रश्न (MCQ Practice)
                  </Link>
                </div>
              </Card>
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
            <Card className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {chapter.title} — Quick Revision Formula Sheet
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                परीक्षा से पहले त्वरित दोहराव के लिए मुख्य सूत्र एवं संकल्पनाएँ।
              </p>

              <div className="mt-6 space-y-3">
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

              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Important Exam Tips:
                </h3>
                <ul className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600">
                  <li>• प्रश्नों को हल करते समय सूत्रों को स्पष्ट लिखें; सीबीएसई मार्किंग स्कीम में स्टेप मार्किंग होती है।</li>
                  <li>• इकाई (units जैसे cm, cm², cm³) का ध्यान रखें; अंतिम उत्तर में इकाई लिखना न भूलें।</li>
                  <li>• ज्यामिति के प्रश्नों में साफ-सुथरा नामांकित चित्र (labelled diagram) अवश्य बनाएं।</li>
                </ul>
              </div>
            </Card>
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
