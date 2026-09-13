import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookCheck,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  FileQuestion,
  HelpCircle,
  History,
  Layers,
  MapPin,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout } from '@/components/site';
import type { CbseChapter, CbseSubjectConfig, CbseSubjectSection } from '@/data/cbse-curriculum';
import { getPYQsForTopic } from '@/data/pyq';
import { getFilteredQuestions } from '@/data/quiz/questions';
import type { MCQQuestion } from '@/data/quiz/types';
import { useQuestionBank } from '@/hooks/useQuestionBank';

interface CbseSectionViewerProps {
  chapter: CbseChapter;
  subjectConfig: CbseSubjectConfig;
  sectionKey: string;
  examId?: string;
  subjectId?: string;
}

export function CbseSectionViewer({
  chapter,
  subjectConfig,
  sectionKey,
  examId = 'cbse-class-10',
  subjectId,
}: CbseSectionViewerProps) {
  const [, setLocation] = useLocation();
  const { publishedSheetCount } = useQuestionBank();
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [isStudyCompleted, setIsStudyCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`cbse_study_${chapter.id}`) === '100';
    } catch {
      return false;
    }
  });

  const section = useMemo(() => {
    return (
      subjectConfig.sections.find((s) => s.key === sectionKey) ||
      subjectConfig.sections[0]
    );
  }, [subjectConfig, sectionKey]);

  // Section Index & Adjacent Sections
  const currentIndex = subjectConfig.sections.findIndex((s) => s.key === section.key);
  const prevSection = currentIndex > 0 ? subjectConfig.sections[currentIndex - 1] : null;
  const nextSection =
    currentIndex < subjectConfig.sections.length - 1
      ? subjectConfig.sections[currentIndex + 1]
      : null;

  // Real PYQ data for chapter
  const pyqs = useMemo(() => getPYQsForTopic(chapter.id), [chapter.id]);

  // Real Quiz questions from Quiz Engine
  const mcqs = useMemo(() => {
    const fromQuiz = getFilteredQuestions({
      examId: examId,
      subjectId: subjectConfig.id,
      topicId: chapter.id,
    });
    const fromSlug =
      chapter.slug && chapter.slug !== chapter.id
        ? getFilteredQuestions({
            examId: examId,
            subjectId: subjectConfig.id,
            topicId: chapter.slug,
          })
        : [];

    const map = new Map<string, MCQQuestion>();
    [...fromQuiz, ...fromSlug].forEach((q) => map.set(q.id, q));
    return Array.from(map.values());
  }, [chapter.id, chapter.slug, examId, subjectConfig.id, publishedSheetCount]);

  const handleSelectOption = (qId: string, optionKey: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionKey }));
  };

  const toggleSolution = (qId: string) => {
    setRevealedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const toggleStudyCompleted = () => {
    const nextState = !isStudyCompleted;
    setIsStudyCompleted(nextState);
    try {
      localStorage.setItem(`cbse_study_${chapter.id}`, nextState ? '100' : '0');
    } catch {
      // Ignore
    }
  };

  const examLabel = examId === 'cbse-class-12' ? 'CBSE Class 12' : 'CBSE Class 10';
  const canonicalSub = subjectConfig.canonicalSubjectId;

  return (
    <Layout>
      {/* 1. Header with Breadcrumbs & Hero Wash */}
      <section className="hero-wash py-8 text-white sm:py-12">
        <Container>
          <div className="text-blue-200">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Exams', href: '/exams' },
                { label: examLabel, href: `/exams/${examId}` },
                { label: subjectConfig.name, href: `/exams/${examId}/${canonicalSub}` },
                {
                  label: `Ch ${chapter.chapterNumber}`,
                  href: `/exams/${examId}/${canonicalSub}/${chapter.id}`,
                },
                { label: section.title },
              ]}
            />
          </div>

          <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white">
                  अध्याय {String(chapter.chapterNumber).padStart(2, '0')}: {chapter.title}
                </span>
                <span className="rounded-md border border-blue-300/40 bg-blue-500/30 px-2 py-0.5 text-xs font-bold text-blue-100">
                  {section.badge}
                </span>
                {section.marksBadge && (
                  <span className="rounded-md border border-emerald-300/40 bg-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-100">
                    {section.marksBadge}
                  </span>
                )}
              </div>

              <h1 className="font-display mt-2.5 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                {section.title}
              </h1>
              <p className="mt-1 text-sm font-semibold text-blue-200">{section.hindiTitle}</p>
              <p className="mt-2 max-w-2xl text-xs text-blue-100/90 sm:text-sm">
                {section.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href={`/exams/${examId}/${canonicalSub}/${chapter.id}`}
                className="focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/20"
              >
                <ArrowLeft size={13} /> अध्याय मुख्य पृष्ठ (Overview)
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Quick Section Switcher Bar */}
      <section className="border-b border-slate-200 bg-white py-2.5 shadow-2xs sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <Container>
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none pb-0.5">
            <span className="font-bold text-slate-500 shrink-0 mr-1 text-[11px]">
              खंड सूची (Sections):
            </span>
            {subjectConfig.sections.map((s) => {
              const isActive = s.key === section.key;
              return (
                <Link
                  key={s.key}
                  href={`/exams/${examId}/${canonicalSub}/${chapter.id}/${s.key}`}
                  className={`focus-ring shrink-0 rounded-xl px-2.5 py-1 text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-[10px] opacity-75">{s.order}.</span>
                  <span>{s.badge}</span>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 3. Section Main Content Area */}
      <section className="bg-slate-50/60 py-8 sm:py-12">
        <Container>
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left/Main Column: Section Body */}
            <div className="lg:col-span-8">
              {/* SECTION: Study Material */}
              {section.key === 'study-material' && (
                <div className="space-y-6">
                  <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          NCERT Textbook Curriculum
                        </span>
                        <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                          {chapter.title} — विस्तृत अध्याय नोट्स
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">{chapter.hindiTitle}</p>
                      </div>
                      <Button
                        variant={isStudyCompleted ? 'default' : 'outline'}
                        size="sm"
                        onClick={toggleStudyCompleted}
                        className="shrink-0 gap-1.5"
                      >
                        <CheckCircle2 size={15} />
                        {isStudyCompleted ? 'अध्ययन पूर्ण (Completed)' : 'पूर्ण चिह्नित करें'}
                      </Button>
                    </div>

                    {/* Chapter Core Concepts List */}
                    <div className="mt-6 space-y-4">
                      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs leading-relaxed text-slate-800">
                        <h4 className="font-bold text-blue-900 mb-1">अध्याय परिचय एवं अधिगम उद्देश्य:</h4>
                        <p>{chapter.shortDescription}</p>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 pt-2">
                        मुख्य सिद्धांत एवं विषय-वस्तु (Key Topics & Concepts):
                      </h3>

                      <div className="grid gap-3">
                        {chapter.syllabusTopics.map((topic, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs"
                          >
                            <div className="flex items-start gap-3">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-xs font-black text-blue-700">
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{topic}</h4>
                                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                  इस विषय से संबंधित NCERT की मुख्य परिभाषाएं, क्रियाकलाप, आरेख एवं बोर्ड परीक्षा में पूछे जाने वाले महत्वपूर्ण प्रश्न बिंदु।
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* SECTION: Map Work (Specialized for Social Science) */}
              {section.key === 'map-work' && (
                <div className="space-y-6">
                  <Card className="rounded-2xl border border-amber-200 bg-amber-50/30 p-6 sm:p-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                      <MapPin size={16} /> CBSE Class 10 Social Science Section F (5 Marks)
                    </div>
                    <h2 className="mt-2 text-xl font-extrabold text-slate-900">
                      मानचित्र कार्य (Map Skill Work — History & Geography)
                    </h2>
                    <p className="mt-1 text-xs text-slate-600">
                      सीबीएसई बोर्ड परीक्षा के प्रश्न पत्र का अंतिम खंड F (प्रश्न 37 - 5 अंक)। 2 अंक इतिहास से तथा 3 अंक भूगोल से पूछे जाते हैं।
                    </p>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-amber-200 bg-white p-4">
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                          इतिहास मानचित्र सूची (2 अंक)
                        </span>
                        <h4 className="mt-2 font-bold text-slate-800 text-xs">
                          भारतीय राष्ट्रीय आंदोलन के प्रमुख केंद्र:
                        </h4>
                        <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                          <li>• <strong>कलकत्ता (सितंबर 1920)</strong> — कांग्रेस अधिवेशन</li>
                          <li>• <strong>नागपुर (दिसंबर 1920)</strong> — असहयोग प्रस्ताव पारित</li>
                          <li>• <strong>मद्रास (1927)</strong> — पूर्ण स्वराज संकल्प</li>
                          <li>• <strong>चंपारण (बिहार)</strong> — नील किसानों का सत्याग्रह</li>
                          <li>• <strong>खेड़ा (गुजरात)</strong> — किसान सत्याग्रह</li>
                          <li>• <strong>अहमदाबाद</strong> — सूती मिल मजदूर सत्याग्रह</li>
                          <li>• <strong>अमृतसर (पंजाब)</strong> — जलियांवाला बाग हत्याकांड</li>
                          <li>• <strong>चौरी-चौरा (गोरखपुर)</strong> — असहयोग आंदोलन वापसी</li>
                          <li>• <strong>दांडी (गुजरात)</strong> — सविनय अवज्ञा आंदोलन / नमक मार्च</li>
                        </ul>
                      </div>

                      <div className="rounded-xl border border-blue-200 bg-white p-4">
                        <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-900">
                          भूगोल मानचित्र सूची (3 अंक)
                        </span>
                        <h4 className="mt-2 font-bold text-slate-800 text-xs">
                          संसाधन, कृषि, ऊर्जा व विनिर्माण केंद्र:
                        </h4>
                        <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                          <li>• <strong>प्रमुख बांध:</strong> सलाल, भाखड़ा नांगल, टिहरी, राणा प्रताप सागर, सरदार सरोवर, हीराकुड, नागार्जुन सागर, तुंगभद्रा</li>
                          <li>• <strong>तापीय व आण्विक ऊर्जा संयंत्र:</strong> नरोरा, रावतभाटा, काकरापार, तारापुर, कलपक्कम</li>
                          <li>• <strong>लौह-इस्पात संयंत्र:</strong> दुर्गापुर, बोकारो, जमशेदपुर, भिलाई, विजयनगर, सेलम</li>
                          <li>• <strong>सॉफ्टवेयर टेक्नोलॉजी पार्क:</strong> नोएडा, गांधीनगर, मुंबई, पुणे, हैदराबाद, बेंगलुरु, चेन्नई</li>
                          <li>• <strong>प्रमुख समुद्री पत्तन व हवाई अड्डे:</strong> कांडला, मुंबई, कोच्चि, चेन्नई, विशाखापट्टनम, पारादीप</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* SECTION: Extract-Based Questions (Specialized for English/Literature) */}
              {section.key === 'extract-based' && (
                <div className="space-y-6">
                  <Card className="rounded-2xl border border-indigo-200 bg-indigo-50/20 p-6 sm:p-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-800">
                      <FileQuestion size={16} /> Reference to Context (RTC Extracts)
                    </div>
                    <h2 className="mt-2 text-xl font-extrabold text-slate-900">
                      काव्यांश एवं गद्यांश आधारित संदर्भ प्रश्न (Extract Questions)
                    </h2>
                    <p className="mt-1 text-xs text-slate-600">
                      बोर्ड परीक्षा में पाठ्यपुस्तक के अंश देकर उन पर आधारित बहुविकल्पीय एवं विचारणीय प्रश्न पूछे जाते हैं।
                    </p>

                    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                      <div className="border-l-4 border-indigo-500 pl-4 italic text-xs leading-relaxed text-slate-700 bg-slate-50 py-3 rounded-r-xl">
                        "अध्याय {chapter.chapterNumber} से संबंधित प्रमुख उद्धरण एवं पद्यांश बोर्ड परीक्षा में विश्लेषणात्मक चिंतन (Analytical thinking) व शब्दावली बोध की जांच हेतु पूछे जाते हैं।"
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs">
                          <p className="font-bold text-slate-800">प्र. 1. कवि/लेखक का इस अंश में क्या दृष्टिकोण है?</p>
                          <p className="mt-1 text-slate-600">
                            उत्तर संकेत: केंद्रीय विचार, प्रतीकात्मकता (Symbolism) और मनोदशा (Mood) की पहचान करें।
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs">
                          <p className="font-bold text-slate-800">प्र. 2. इस अंश में प्रयुक्त अलंकार / काव्य सौंदर्य (Poetic Device) क्या है?</p>
                          <p className="mt-1 text-slate-600">
                            उत्तर संकेत: रूपक (Metaphor), उपमा (Simile), अनुप्रास (Alliteration) या विरोधाभास (Oxymoron/Irony)।
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* SECTION: Objective Questions (MCQs / Assertion-Reason) */}
              {(section.key === 'mcq' ||
                section.key === 'assertion-reason' ||
                section.key === 'objective-grammar') && (
                <div className="space-y-6">
                  <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          {section.title}
                        </span>
                        <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                          वस्तुनिष्ठ प्रश्न अभ्यास (Objective Practice)
                        </h2>
                      </div>
                      <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {mcqs.length > 0 ? `${mcqs.length} प्रश्न` : 'अभ्यास बैंक'}
                      </span>
                    </div>

                    {mcqs.length > 0 ? (
                      <div className="mt-6 space-y-5">
                        {mcqs.map((q, idx) => {
                          const userAns = selectedAnswers[q.id];
                          const isRevealed = revealedSolutions[q.id];
                          const isCorrect = userAns === q.correctAnswer;

                          return (
                            <div
                              key={q.id}
                              className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 sm:p-5"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
                                  {idx + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="text-xs font-bold text-slate-900 sm:text-sm">
                                    {q.question}
                                  </p>

                                  {/* Options A, B, C, D */}
                                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                                      const text = q.options[opt];
                                      if (!text) return null;
                                      const isSelected = userAns === opt;
                                      const isRight = opt === q.correctAnswer;

                                      let optStyle =
                                        'border-slate-200 bg-white text-slate-700 hover:border-blue-300';
                                      if (userAns) {
                                        if (isRight) {
                                          optStyle =
                                            'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                                        } else if (isSelected) {
                                          optStyle =
                                            'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                                        }
                                      }

                                      return (
                                        <button
                                          key={opt}
                                          type="button"
                                          onClick={() => handleSelectOption(q.id, opt)}
                                          className={`flex items-center gap-2 rounded-lg border p-2.5 text-left text-xs transition ${optStyle}`}
                                        >
                                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold">
                                            {opt}
                                          </span>
                                          <span className="flex-1">{text}</span>
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Solution Toggle & Explanation */}
                                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60">
                                    <button
                                      type="button"
                                      onClick={() => toggleSolution(q.id)}
                                      className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                      <HelpCircle size={13} />
                                      {isRevealed ? 'स्पष्टीकरण छिपाएं' : 'सही उत्तर व व्याख्या देखें'}
                                    </button>
                                    {userAns && (
                                      <span
                                        className={`text-xs font-bold ${
                                          isCorrect ? 'text-emerald-600' : 'text-rose-600'
                                        }`}
                                      >
                                        {isCorrect ? '✓ सही उत्तर!' : '✗ गलत प्रयास'}
                                      </span>
                                    )}
                                  </div>

                                  {isRevealed && (
                                    <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs text-slate-700">
                                      <p className="font-bold text-blue-900">
                                        सही विकल्प: ({q.correctAnswer})
                                      </p>
                                      <p className="mt-1 leading-relaxed">{q.explanation}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                        <FileQuestion size={32} className="mx-auto text-slate-400" />
                        <h4 className="mt-2 text-sm font-bold text-slate-800">
                          {section.emptyHeading}
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">{section.emptyDescription}</p>
                        <p className="mt-3 text-xs text-blue-600">
                          Google Sheets प्रश्न बैंक के साथ स्वचालित रूप से सिंक किया जा रहा है।
                        </p>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* SECTION: PYQ (Board Exam Papers) */}
              {section.key === 'pyq' && (
                <div className="space-y-6">
                  <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          CBSE Board Papers (2018–2024)
                        </span>
                        <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                          विगत वर्षों के बोर्ड प्रश्न (PYQ)
                        </h2>
                      </div>
                      <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {pyqs.length} बोर्ड प्रश्न
                      </span>
                    </div>

                    {pyqs.length > 0 ? (
                      <div className="mt-6 space-y-4">
                        {pyqs.map((p, idx) => (
                          <div
                            key={p.id}
                            className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-900">
                                CBSE {p.year} Board Exam
                              </span>
                              <span className="text-xs font-semibold text-slate-500">
                                {p.marks} अंक
                              </span>
                            </div>
                            <p className="mt-2 text-xs font-bold text-slate-800">{p.question}</p>
                            {p.solution && (
                              <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-slate-700">
                                <p className="font-bold text-emerald-900">मॉडल उत्तर व स्टेप मार्किंग:</p>
                                <p className="mt-1 leading-relaxed">{p.solution}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                        <History size={32} className="mx-auto text-slate-400" />
                        <h4 className="mt-2 text-sm font-bold text-slate-800">
                          विगत वर्षों के प्रश्न जोड़े जा रहे हैं
                        </h4>
                        <p className="mt-1 text-xs text-slate-500">
                          सीबीएसई 2018 से 2024 तक के आधिकारिक बोर्ड पेपर्स व मार्किंग स्कीम जल्द उपलब्ध होगी।
                        </p>
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {/* DEFAULT / OTHER SECTIONS: Descriptive questions, Revision, Mistake Book, etc. */}
              {!['study-material', 'map-work', 'extract-based', 'mcq', 'assertion-reason', 'objective-grammar', 'pyq'].includes(
                section.key
              ) && (
                <Card className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
                  <div className="border-b border-slate-100 pb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      {section.badge}
                    </span>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">{section.title}</h2>
                    <p className="mt-0.5 text-xs text-slate-500">{section.hindiTitle}</p>
                  </div>

                  <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-5 text-xs leading-relaxed text-slate-700">
                    <p className="font-bold text-blue-900 mb-1">सेक्शन विवरण एवं बोर्ड निर्देश:</p>
                    <p>{section.description}</p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="font-bold text-slate-900 text-xs">
                        अध्याय {chapter.chapterNumber} हेतु मुख्य बिंदु:
                      </h4>
                      <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                        {chapter.syllabusTopics.map((t, idx) => (
                          <li key={idx}>• {t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              {/* Bottom Pagination: Prev & Next Sections */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
                {prevSection ? (
                  <Link
                    href={`/exams/${examId}/${canonicalSub}/${chapter.id}/${prevSection.key}`}
                    className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
                  >
                    <ArrowLeft size={14} /> पिछला खंड: {prevSection.badge}
                  </Link>
                ) : (
                  <div />
                )}

                {nextSection && (
                  <Link
                    href={`/exams/${examId}/${canonicalSub}/${chapter.id}/${nextSection.key}`}
                    className="focus-ring inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700"
                  >
                    अगला खंड: {nextSection.badge} <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column: Chapter Overview Card */}
            <div className="space-y-5 lg:col-span-4">
              <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <BookOpen size={15} className="text-blue-600" /> अध्याय विनिर्देश
                </div>
                <h3 className="mt-2 text-base font-bold text-slate-900">
                  {chapter.title}
                </h3>
                <p className="text-xs text-slate-500">{chapter.hindiTitle}</p>

                <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">अध्याय संख्या:</span>
                    <span className="font-bold text-slate-800">
                      Ch {chapter.chapterNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">इकाई (Unit):</span>
                    <span className="font-bold text-slate-800">
                      Unit {chapter.unitNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">बोर्ड अंक (Weightage):</span>
                    <span className="font-bold text-blue-700">
                      {chapter.weightageMarks} Marks
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <Link
                    href={`/exams/${examId}/${canonicalSub}`}
                    className="focus-ring flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <ArrowLeft size={13} /> सभी {subjectConfig.name} अध्याय
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
