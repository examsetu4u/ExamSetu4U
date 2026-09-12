import { useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  Layers,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Breadcrumbs, ProgressBar } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout } from '@/components/site';
import {
  SCIENCE_CHAPTER_SECTIONS,
  calculateScienceChapterProgress,
  getScienceChapter,
  type ScienceChapter,
} from '@/data/cbse-class-10-science';

interface ScienceChapterDetailProps {
  chapter: ScienceChapter;
  examId?: string;
  subjectId?: string;
}

export function ScienceChapterDetail({
  chapter,
  examId = 'cbse-class-10',
  subjectId = 'cbse-class-10-science',
}: ScienceChapterDetailProps) {
  const [, setLocation] = useLocation();
  const progress = useMemo(
    () => calculateScienceChapterProgress(chapter.id),
    [chapter.id]
  );

  return (
    <Layout>
      {/* 1. Chapter Header with Breadcrumbs */}
      <section className="hero-wash py-10 text-white sm:py-14">
        <Container>
          <div className="text-blue-200">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Exams', href: '/exams' },
                { label: 'CBSE Class 10', href: `/exams/${examId}` },
                { label: 'Science', href: `/exams/${examId}/science` },
                { label: `Chapter ${chapter.chapterNumber}: ${chapter.title}` },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur-xs">
                  <Sparkles size={12} className="text-blue-300" />
                  {chapter.unitHindiName.split(':')[0] || `Unit ${chapter.unitNumber}`}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white">
                  अध्याय {String(chapter.chapterNumber).padStart(2, '0')}
                </span>
                <span className="rounded-full border border-blue-300/30 bg-blue-400/10 px-2.5 py-0.5 text-xs font-bold text-blue-200">
                  {chapter.weightageMarks} अंक (Marks)
                </span>
              </div>

              <h1 className="font-display mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {chapter.title}
              </h1>
              <p className="mt-1 text-sm font-semibold text-blue-200 sm:text-base">
                {chapter.hindiTitle}
              </p>

              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-blue-100/90 sm:text-sm">
                {chapter.shortDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/exams/${examId}/science`}
                className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/20"
              >
                <ArrowLeft size={14} /> सभी अध्याय (All Chapters)
              </Link>
            </div>
          </div>

          {/* Chapter Progress Summary Card */}
          <div className="mt-7 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xs sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  समग्र अध्याय प्रगति (Overall Chapter Progress)
                </span>
                <p className="mt-0.5 text-xs text-blue-100/80">
                  वास्तविक पूर्ण की गई गतिविधियों के आधार पर गणना
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-white">{progress.overallProgress}%</span>
                <span className="rounded-lg bg-blue-500/30 px-2.5 py-1 text-xs font-bold text-blue-100 border border-blue-400/30">
                  {progress.overallProgress === 100
                    ? 'पूर्ण (Completed)'
                    : progress.overallProgress > 0
                    ? 'प्रगति पर (In Progress)'
                    : 'शुरू नहीं हुआ (Not Started)'}
                </span>
              </div>
            </div>
            <div className="mt-3">
              <ProgressBar value={progress.overallProgress} label="Overall Progress" />
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Mandatory Learning Flow Banner */}
      <section className="border-b border-slate-200 bg-blue-50/60 py-3.5">
        <Container>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
              <Layers size={14} />
              <span>अध्याय शिक्षण प्रवाह (Chapter Flow):</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-700">
              <span className="rounded-md bg-white px-2 py-0.5 font-bold text-blue-700 shadow-2xs border border-blue-200">
                1. Study Material
              </span>
              <span className="text-slate-400">➔</span>
              <span className="rounded-md bg-white px-2 py-0.5 font-bold text-blue-700 shadow-2xs border border-blue-200">
                2. Practice Questions
              </span>
              <span className="text-slate-400">➔</span>
              <span className="rounded-md bg-white px-2 py-0.5 font-bold text-blue-700 shadow-2xs border border-blue-200">
                3. PYQ
              </span>
              <span className="text-slate-400">➔</span>
              <span className="rounded-md bg-white px-2 py-0.5 font-bold text-blue-700 shadow-2xs border border-blue-200">
                4. Chapter Test
              </span>
              <span className="text-slate-400">➔</span>
              <span className="rounded-md bg-white px-2 py-0.5 font-bold text-blue-700 shadow-2xs border border-blue-200">
                5. Revision
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. The 11 Mandatory Learning Sections in Exact Sequence */}
      <section className="bg-slate-50/60 py-8 sm:py-12">
        <Container>
          <div className="mb-6 flex flex-col gap-1">
            <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
              अध्याय अध्ययन खंड (Learning Modules)
            </h2>
            <p className="text-xs text-slate-600 sm:text-sm">
              नीचे दिए गए 11 खंडों में से किसी भी मॉड्यूल पर क्लिक कर अध्ययन या अभ्यास आरंभ करें:
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCIENCE_CHAPTER_SECTIONS.map((section) => {
              const targetUrl = `/exams/${examId}/science/${chapter.id}/${section.targetRouteSegment}`;

              // Determine status text based on section
              let statusBadge = 'Content coming soon';
              let isAvailable = false;

              if (section.key === 'study-material') {
                if (progress.hasContent && progress.studyMaterialProgress > 0) {
                  statusBadge = `${progress.studyMaterialProgress}% Read`;
                  isAvailable = true;
                } else {
                  statusBadge = 'तैयार किया जा रहा है';
                }
              } else if (section.key === 'mcq') {
                if (progress.mcqProgress > 0) {
                  statusBadge = `${progress.mcqProgress}% Accuracy`;
                  isAvailable = true;
                } else {
                  statusBadge = '0 questions available';
                }
              } else if (section.key === 'pyq') {
                if (chapter.chapterNumber === 1) {
                  statusBadge = 'Sample PYQ available';
                  isAvailable = true;
                } else {
                  statusBadge = '0 PYQs available';
                }
              } else if (section.key === 'mistake-practice') {
                statusBadge = 'Mistake Book';
                isAvailable = true;
              } else if (section.key === 'revision') {
                statusBadge = 'Quick Revision';
              } else {
                statusBadge = '0 questions available';
              }

              return (
                <Link
                  key={section.key}
                  href={targetUrl}
                  id={`section-card-${section.key}`}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:border-blue-400 hover:shadow-md active:scale-[0.99]"
                >
                  <div>
                    {/* Header Row: Number + Icon + Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-black text-blue-700">
                          {section.order}
                        </span>
                        <span className="text-xl" role="img" aria-label={section.title}>
                          {section.icon}
                        </span>
                      </div>
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {section.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-blue-700">
                      {section.title}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                      {section.hindiTitle}
                    </p>

                    {/* Description */}
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {section.description}
                    </p>
                  </div>

                  {/* Footer Row: Status & Button */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        isAvailable
                          ? 'border border-blue-200 bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {statusBadge}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-blue-700 group-hover:underline">
                      <span>खोलें</span>
                      <ChevronRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Chapter Outline / Syllabus Detail Reference */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">
              पाठ्यक्रम विषय सूची (Syllabus Outline for Chapter {chapter.chapterNumber}):
            </h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {chapter.syllabusTopics.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-xs text-slate-700"
                >
                  <span className="font-bold text-blue-600">§ {i + 1}.</span>
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
