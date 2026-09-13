import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
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
import { Button, Card, Container, Layout } from '@/components/site';
import {
  SCIENCE_CHAPTER_SECTIONS,
  getScienceChapter,
  getScienceQuestions,
  type ScienceChapter,
  type ScienceSectionKey,
} from '@/data/cbse-class-10-science';
import { getPYQsForTopic } from '@/data/pyq';
import { getFilteredQuestions } from '@/data/quiz/questions';
import type { MCQQuestion } from '@/data/quiz/types';
import { useQuestionBank } from '@/hooks/useQuestionBank';

interface ScienceSectionViewerProps {
  chapter: ScienceChapter;
  sectionKey: ScienceSectionKey;
  examId?: string;
  subjectId?: string;
}

export function ScienceSectionViewer({
  chapter,
  sectionKey,
  examId = 'cbse-class-10',
  subjectId = 'cbse-class-10-science',
}: ScienceSectionViewerProps) {
  const [, setLocation] = useLocation();
  const { publishedSheetCount } = useQuestionBank();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  const section = useMemo(() => {
    return (
      SCIENCE_CHAPTER_SECTIONS.find((s) => s.key === sectionKey) ||
      SCIENCE_CHAPTER_SECTIONS[0]
    );
  }, [sectionKey]);

  // Find adjacent sections for smooth navigation
  const currentIndex = SCIENCE_CHAPTER_SECTIONS.findIndex((s) => s.key === section.key);
  const prevSection = currentIndex > 0 ? SCIENCE_CHAPTER_SECTIONS[currentIndex - 1] : null;
  const nextSection =
    currentIndex < SCIENCE_CHAPTER_SECTIONS.length - 1
      ? SCIENCE_CHAPTER_SECTIONS[currentIndex + 1]
      : null;

  // Check real PYQ data for chapter
  const pyqs = useMemo(() => getPYQsForTopic(chapter.id), [chapter.id]);

  // Check real Quiz questions with reactivity from Google Sheet
  const mcqs = useMemo(() => {
    const fromQuizEngine = getFilteredQuestions({
      examId: 'cbse-class-10',
      subjectId: 'cbse-class-10-science',
      topicId: chapter.id,
    });

    const fromSlug =
      chapter.slug && chapter.slug !== chapter.id
        ? getFilteredQuestions({
            examId: 'cbse-class-10',
            subjectId: 'cbse-class-10-science',
            topicId: chapter.slug,
          })
        : [];

    const customMCQs = getScienceQuestions(chapter.id, 'MCQ');

    const map = new Map<string, MCQQuestion>();
    [...fromQuizEngine, ...fromSlug].forEach((q) => map.set(q.id, q));

    customMCQs.forEach((cm) => {
      if (!map.has(cm.id)) {
        map.set(cm.id, {
          id: cm.id,
          examId: 'cbse-class-10',
          subjectId: 'cbse-class-10-science',
          topicId: chapter.id,
          question: cm.question,
          options: {
            A: cm.options.A || '',
            B: cm.options.B || '',
            C: cm.options.C || '',
            D: cm.options.D || '',
          },
          correctAnswer: cm.correctAnswer as any,
          explanation: cm.explanation,
          importantPoint: cm.importantPoint || '',
          additionalFact: cm.additionalFact || '',
          commonMistake: cm.commonMistake || '',
          difficulty: (cm.difficulty === 'EASY' ? 'Easy' : cm.difficulty === 'HARD' ? 'Hard' : 'Moderate') as any,
          sourceType: (cm.sourceType === 'PYQ' ? 'PYQ' : 'Practice') as any,
          year: cm.year,
        });
      }
    });

    return Array.from(map.values());
  }, [chapter.id, chapter.slug, publishedSheetCount]);

  const handleSelectOption = (qId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionKey }));
  };

  const toggleSolution = (qId: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  return (
    <Layout>
      {/* 1. Header with Breadcrumbs */}
      <section className="hero-wash py-10 text-white sm:py-14">
        <Container>
          <div className="text-blue-200">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Exams', href: '/exams' },
                { label: 'CBSE Class 10', href: `/exams/${examId}` },
                { label: 'Science', href: `/exams/${examId}/science` },
                {
                  label: `Ch ${chapter.chapterNumber}: ${chapter.title}`,
                  href: `/exams/${examId}/science/${chapter.id}`,
                },
                { label: section.title },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/40 bg-blue-500/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur-xs">
                  खंड {section.order} of 11
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white">
                  अध्याय {String(chapter.chapterNumber).padStart(2, '0')}
                </span>
                <span className="rounded-full border border-blue-300/30 bg-blue-400/10 px-2.5 py-0.5 text-xs font-bold text-blue-200">
                  {section.badge}
                </span>
              </div>

              <h1 className="font-display mt-3 flex items-center gap-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </h1>
              <p className="mt-1 text-sm font-semibold text-blue-200 sm:text-base">
                {section.hindiTitle}
              </p>

              <p className="mt-2 text-xs text-blue-100/90 sm:text-sm">
                अध्याय: <strong>{chapter.title}</strong> ({chapter.hindiTitle})
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/exams/${examId}/science/${chapter.id}`}
                className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/20"
              >
                <ArrowLeft size={14} /> अध्याय पर वापस जाएं
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Main Content & Specific Section Handlers */}
      <section className="bg-slate-50/60 py-10 sm:py-14">
        <Container className="max-w-4xl">
          {/* Case 1: Conceptual Study Material & NCERT Theory */}
          {section.key === 'study-material' && (
            <div className="space-y-6">
              <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-700">
                      <BookOpen size={14} /> NCERT थ्योरी एवं मुख्य संकल्पनाएँ
                    </span>
                    <h2 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
                      {chapter.title} — अवधारणात्मक सारांश (Conceptual Notes)
                    </h2>
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                      {chapter.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Key Concepts / Focus Areas */}
                <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs sm:text-sm text-slate-700">
                  <p className="font-bold text-blue-900">🔬 मुख्य विषय एवं प्रयोगशाला क्रियाकलाप:</p>
                  <p className="mt-1 leading-relaxed text-slate-700">
                    सीबीएसई बोर्ड परीक्षा के नवीन पाठ्यक्रम अनुसार रासायनिक अभिक्रियाओं के प्रकार (संयोजन, वियोजन, विस्थापन, द्विविस्थापन, रेडॉक्स) और उनके दैनिक जीवन में अनुप्रयोग (संक्षारण व विकृतगंधिता)।
                  </p>
                </div>

                {/* Direct action buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    href={`/study-material/${examId}/${subjectId}/${chapter.id}`}
                    className="bg-blue-700 text-xs font-bold text-white hover:bg-blue-800"
                  >
                    <BookOpen size={14} />
                    <span>पूरा अध्याय नोट्स पढ़ें (Full Reader)</span>
                    <ArrowRight size={14} />
                  </Button>
                  <Button
                    href={`/exams/${examId}/science/${chapter.id}/mcq`}
                    variant="secondary"
                    className="text-xs font-bold"
                  >
                    <FileQuestion size={14} />
                    <span>MCQ अभ्यास करें</span>
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Case 2: Interactive MCQ Practice Section */}
          {section.key === 'mcq' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    {section.title} ({mcqs.length} प्रश्न उपलब्ध)
                  </h2>
                  <p className="text-xs text-slate-500">{section.description}</p>
                </div>

                {mcqs.length > 0 && (
                  <Link
                    href={`/quiz/${examId}/${subjectId}/${chapter.id}`}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700"
                  >
                    <Clock size={13} /> Timed Quiz Mode
                  </Link>
                )}
              </div>

              {mcqs.length === 0 ? (
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
                      className="focus-ring inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      Start Full Practice
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="space-y-5">
                  {mcqs.map((q, qIndex) => {
                    const selected = selectedAnswers[q.id];
                    const isRevealed = revealedSolutions[q.id] || Boolean(selected);
                    const isCorrect = selected && selected === q.correctAnswer;

                    return (
                      <Card
                        key={q.id}
                        id={`q-${q.id}`}
                        className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 transition hover:border-slate-300 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-xs font-black text-blue-800">
                              Q{qIndex + 1}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              1 Mark
                            </span>
                            {q.year && (
                              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                CBSE {q.year}
                              </span>
                            )}
                            {q.difficulty && (
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                {q.difficulty}
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

                        {/* Options */}
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

                        {/* Solution Toggle Button if not yet answered */}
                        {!selected && (
                          <div className="mt-4 flex justify-end">
                            <button
                              type="button"
                              onClick={() => toggleSolution(q.id)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {isRevealed ? 'Hide Solution' : 'Show Answer & Explanation'}
                            </button>
                          </div>
                        )}

                        {/* Solution & Explanation Box */}
                        {isRevealed && (
                          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                              <CheckCircle2 size={15} className="text-emerald-600" />
                              <span>
                                {q.correctAnswer ? `सही उत्तर (Correct Answer): Option ${q.correctAnswer}` : 'हल (Solution)'}
                              </span>
                            </div>

                            {q.explanation && (
                              <p className="mt-2 text-slate-800 leading-relaxed">
                                {q.explanation}
                              </p>
                            )}

                            {q.importantPoint && (
                              <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50/80 p-2 text-xs text-blue-900">
                                <strong>महत्वपूर्ण परीक्षा बिंदु:</strong> {q.importantPoint}
                              </div>
                            )}

                            {q.commonMistake && (
                              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/80 p-2 text-xs text-amber-900">
                                <strong>सामान्य गलती (Common Pitfall):</strong> {q.commonMistake}
                              </div>
                            )}

                            {q.additionalFact && (
                              <div className="mt-2 text-[11px] text-slate-600 italic">
                                💡 {q.additionalFact}
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

          {/* Case 3: Chapter Mock Test Module */}
          {section.key === 'chapter-test' && (
            <div className="space-y-6">
              <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-700">
                      <Award size={14} /> अध्याय वार मॉक टेस्ट
                    </span>
                    <h2 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
                      {chapter.title} — आधिकारिक बोर्ड पैटर्न मॉक टेस्ट
                    </h2>
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                      इस अध्याय के सभी महत्वपूर्ण विषयों पर आधारित 20 मिनट का समयबद्ध मॉक टेस्ट।
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
                    <span className="text-[11px] font-semibold text-slate-500">कुल प्रश्न</span>
                    <p className="mt-1 text-lg font-black text-slate-900">{mcqs.length || 10}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
                    <span className="text-[11px] font-semibold text-slate-500">समय सीमा</span>
                    <p className="mt-1 text-lg font-black text-blue-700">20 मिनट</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
                    <span className="text-[11px] font-semibold text-slate-500">मार्क्स</span>
                    <p className="mt-1 text-lg font-black text-emerald-700">{mcqs.length || 10}</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-center">
                    <span className="text-[11px] font-semibold text-slate-500">नेगेटिव मार्किंग</span>
                    <p className="mt-1 text-lg font-black text-slate-600">कोई नहीं</p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-slate-700">
                  <p className="font-bold text-blue-900">परीक्षार्थियों के लिए निर्देश:</p>
                  <ul className="mt-1.5 space-y-1 text-slate-600">
                    <li>• सभी प्रश्न अनिवार्य हैं तथा सीबीएसई बोर्ड परीक्षा पैटर्न पर आधारित हैं।</li>
                    <li>• गलत प्रश्नों का उत्तर टेस्ट समाप्त होने पर Mistake Book में स्वतः सेव हो जाता है।</li>
                    <li>• टेस्ट पूरा होने के बाद विस्तृत समाधान एवं स्कोरकार्ड उपलब्ध होगा।</li>
                  </ul>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    href={`/quiz/${examId}/${subjectId}/${chapter.id}`}
                    className="bg-blue-700 text-xs font-bold text-white hover:bg-blue-800"
                  >
                    <Clock size={14} />
                    <span>मॉक टेस्ट शुरू करें (Start Test)</span>
                    <ArrowRight size={14} />
                  </Button>
                  <Button
                    href={`/exams/${examId}/science/${chapter.id}/mcq`}
                    variant="secondary"
                    className="text-xs font-bold"
                  >
                    <span>प्रश्नों का अभ्यास करें</span>
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Case 4: Previous Year Questions */}
          {section.key === 'pyq' && pyqs.length > 0 ? (
            <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-700">
                    <BookCheck size={14} /> {pyqs.length} Board PYQ Sample Available
                  </span>
                  <h2 className="mt-3 text-xl font-bold text-slate-900">
                    विगत वर्षों के बोर्ड प्रश्न (CBSE Board Exam Questions)
                  </h2>
                  <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                    नीचे दिए गए बटन से वास्तविक PYQ अभ्यास सत्र प्रारंभ करें:
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-slate-700">
                <p className="font-semibold text-blue-900">उपलब्ध प्रश्न वर्ष:</p>
                <p className="mt-1 text-slate-600">
                  CBSE Class 10 Board Exam — 2022 (Chemical Reactions and Equations)
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  href={`/pyq/${examId}/cbse-class-10-science/${chapter.id}`}
                  className="bg-blue-700 text-xs font-bold text-white hover:bg-blue-800"
                >
                  <span>PYQ अभ्यास शुरू करें</span>
                  <ArrowRight size={14} />
                </Button>
                <Button
                  href={`/exams/${examId}/science/${chapter.id}`}
                  variant="secondary"
                  className="text-xs font-bold"
                >
                  अध्याय खंड देखें
                </Button>
              </div>
            </Card>
          ) : section.key === 'mistake-practice' ? (
            /* Case 5: Mistake Book Section */
            <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <Target size={24} />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                    त्रुटि सुधार केंद्र
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    Mistake Book (त्रुटि सुधार अभ्यास)
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {section.emptyDescription}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-600">
                <p className="font-bold text-slate-800">स्मार्ट पुनरावलोकन प्रणाली:</p>
                <p className="mt-1">
                  जब आप किसी अध्याय के MCQ या टेस्ट में किसी प्रश्न का गलत उत्तर देते हैं, तो वह प्रश्न
                  स्वतः आपकी व्यक्तिगत Mistake Book में जुड़ जाता है ताकि आप दोबारा गलती न दोहराएं।
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  href="/mistakes"
                  className="bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
                >
                  <Target size={14} />
                  <span>Mistake Book खोलें</span>
                </Button>
                <Button
                  href={`/exams/${examId}/science/${chapter.id}`}
                  variant="secondary"
                  className="text-xs font-bold"
                >
                  अध्याय पर लौटें
                </Button>
              </div>
            </Card>
          ) : section.key === 'revision' ? (
            /* Case 6: Revision Module */
            <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <RotateCcw size={24} />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                    रिवीजन योजना
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    Chapter Revision & Weak Topic Practice
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                    {section.emptyDescription}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-600">
                <p className="font-bold text-slate-800">रिवीजन टूलकिट:</p>
                <p className="mt-1">
                  कमजोर अध्यायों और प्रश्नों के त्वरित अभ्यास के लिए आप हमारे कमजोर क्षेत्र अभ्यास
                  (Weak Areas) टूल का उपयोग कर सकते हैं।
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  href="/practice/weak-topics"
                  className="bg-amber-600 text-xs font-bold text-white hover:bg-amber-700"
                >
                  <RotateCcw size={14} />
                  <span>कमजोर विषयों का अभ्यास करें</span>
                </Button>
                <Button
                  href={`/exams/${examId}/science/${chapter.id}`}
                  variant="secondary"
                  className="text-xs font-bold"
                >
                  अध्याय पर लौटें
                </Button>
              </div>
            </Card>
          ) : (
            /* Case 7: Assertion-Reason and other sections */
            <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm sm:p-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                {section.icon}
              </div>

              <h2 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
                {section.emptyHeading}
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-slate-600 sm:text-sm">
                {section.emptyDescription}
              </p>

              {/* Action buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  href={`/exams/${examId}/science/${chapter.id}/mcq`}
                  variant="primary"
                  className="text-xs font-bold"
                >
                  <FileQuestion size={14} />
                  <span>वस्तुनिष्ठ प्रश्न (MCQs) हल करें</span>
                </Button>

                {nextSection && (
                  <Button
                    href={`/exams/${examId}/science/${chapter.id}/${nextSection.targetRouteSegment}`}
                    variant="secondary"
                    className="text-xs font-bold"
                  >
                    <span>अगला खंड: {nextSection.title}</span>
                    <ArrowRight size={14} />
                  </Button>
                )}
              </div>
            </Card>
          )}

          {/* Adjacent Navigation Bar between sections */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-200/80 pt-5 text-xs">
            {prevSection ? (
              <Link
                href={`/exams/${examId}/science/${chapter.id}/${prevSection.targetRouteSegment}`}
                className="focus-ring inline-flex items-center gap-1.5 font-bold text-slate-600 hover:text-blue-700"
              >
                <ArrowLeft size={14} />
                <span>पिछला: {prevSection.title}</span>
              </Link>
            ) : (
              <span />
            )}

            {nextSection ? (
              <Link
                href={`/exams/${examId}/science/${chapter.id}/${nextSection.targetRouteSegment}`}
                className="focus-ring inline-flex items-center gap-1.5 font-bold text-blue-700 hover:underline"
              >
                <span>अगला: {nextSection.title}</span>
                <ArrowRight size={14} />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </Container>
      </section>
    </Layout>
  );
}
