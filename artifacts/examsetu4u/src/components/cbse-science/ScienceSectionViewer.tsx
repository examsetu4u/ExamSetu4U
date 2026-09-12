import { useMemo } from 'react';
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
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout } from '@/components/site';
import {
  SCIENCE_CHAPTER_SECTIONS,
  getScienceChapter,
  type ScienceChapter,
  type ScienceSectionKey,
} from '@/data/cbse-class-10-science';
import { getPYQsForTopic } from '@/data/pyq';
import { getFilteredQuestions } from '@/data/quiz/questions';

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

  // Check real Quiz questions
  const mcqs = useMemo(
    () =>
      getFilteredQuestions({
        examId: 'cbse-class-10',
        subjectId: 'cbse-class-10-science',
        topicId: chapter.id,
      }),
    [chapter.id]
  );

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
          {/* Case A: Previous Year Questions with available sample */}
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
            /* Case B: Mistake Book Section */
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
            /* Case C: Revision Module */
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
            /* Case D: Standard Truthful Empty State for all coming-soon sections */
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

              {/* Truthful Status Badge */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-600">
                <Clock size={14} className="text-slate-500" />
                <span>0 प्रश्न उपलब्ध (No fake questions or statistics)</span>
              </div>

              {/* Navigation Options */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  href={`/exams/${examId}/science/${chapter.id}`}
                  variant="primary"
                  className="text-xs font-bold"
                >
                  <ArrowLeft size={14} />
                  <span>अध्याय के अन्य खंड देखें</span>
                </Button>

                {nextSection && (
                  <Button
                    href={`/exams/${examId}/science/${chapter.id}/${nextSection.targetRouteSegment}`}
                    variant="secondary"
                    className="text-xs font-bold"
                  >
                    <span>अगला: {nextSection.title}</span>
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
