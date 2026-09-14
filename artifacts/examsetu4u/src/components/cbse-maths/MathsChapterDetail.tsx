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
  FileQuestion,
  BookCheck,
  History,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Breadcrumbs, ProgressBar } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout } from '@/components/site';
import {
  MATHS_CHAPTER_SECTIONS,
  calculateMathsChapterProgress,
  getMathsChapter,
  type MathsChapter,
  type MathsSectionKey,
} from '@/data/cbse-class-10-maths';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { useTopicStudyNotes } from '@/services/study-notes-loader';

interface MathsChapterDetailProps {
  chapter: MathsChapter;
  examId?: string;
  subjectId?: string;
}

export function MathsChapterDetail({
  chapter,
  examId = 'cbse-class-10',
  subjectId = 'cbse-class-10-mathematics',
}: MathsChapterDetailProps) {
  const [, setLocation] = useLocation();
  const { publishedSheetCount } = useQuestionBank();
  const { notes: sheetNotes } = useTopicStudyNotes(chapter.id, examId, subjectId);
  const progress = useMemo(
    () => calculateMathsChapterProgress(chapter.id),
    [chapter.id, publishedSheetCount]
  );

  return (
    <Layout>
      {/* 1. Chapter Header with Breadcrumbs */}
      <section className="hero-wash py-10 text-white sm:py-14">
        <Container>
          <div className="text-emerald-200">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Exams', href: '/exams' },
                { label: 'CBSE Class 10', href: `/exams/${examId}` },
                { label: 'Mathematics', href: `/exams/${examId}/mathematics` },
                { label: `Chapter ${chapter.chapterNumber}: ${chapter.title}` },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-xs">
                  <Sparkles size={12} className="text-emerald-300" />
                  {chapter.unitHindiName.split(':')[0] || `Unit ${chapter.unitNumber}`}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white">
                  अध्याय {String(chapter.chapterNumber).padStart(2, '0')}
                </span>
                <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-bold text-emerald-200">
                  {chapter.weightageMarks} अंक (Marks)
                </span>
              </div>

              <h1 className="font-display mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {chapter.title}
              </h1>
              <p className="mt-1 text-sm font-semibold text-emerald-200 sm:text-base">
                {chapter.hindiTitle}
              </p>

              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-emerald-100/90 sm:text-sm">
                {chapter.shortDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/exams/${examId}/mathematics`}
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
                <span className="text-xs font-bold tracking-wide text-emerald-200 uppercase">
                  अध्याय तैयारी स्थिति (Overall Chapter Readiness)
                </span>
                <p className="text-xl font-black text-white sm:text-2xl">
                  {progress.overallProgress}% Complete
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/quiz/${examId}/${subjectId}/${chapter.id}`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-950 shadow-xs hover:bg-emerald-50"
                >
                  <FileQuestion size={14} className="text-emerald-600" /> Start MCQ Quiz
                </Link>
                <Link
                  href={`/pyq/${examId}/${subjectId}/${chapter.id}`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/25"
                >
                  <History size={14} /> Board PYQs
                </Link>
              </div>
            </div>

            <div className="mt-3 w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(4, progress.overallProgress)}%` }}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Key Formulas Banner */}
      {chapter.keyFormulas && chapter.keyFormulas.length > 0 && (
        <section className="border-b border-emerald-100 bg-emerald-50/60 py-4">
          <Container>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
                <Sparkles size={15} className="text-emerald-600" />
                <span>अध्याय के मुख्य गणितीय सूत्र (Key Formulas):</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-emerald-900">
                {chapter.keyFormulas.map((f, i) => (
                  <span
                    key={i}
                    className="rounded-md border border-emerald-200 bg-white px-2.5 py-1 shadow-2xs font-mono"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* 3. Section Grid: CBSE Question Formats */}
      <section className="py-10 sm:py-14">
        <Container>
          <div className="mb-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              CBSE बोर्ड परीक्षा प्रश्न प्रारूप एवं अध्ययन खंड
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              बोर्ड परीक्षा के 80 अंकों के प्रश्नपत्र के अनुरूप सभी खंड (MCQ, VSA, SA, LA, केस आधारित प्रश्न व PYQs)।
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {MATHS_CHAPTER_SECTIONS.map((sec) => {
              const sectionUrl = `/exams/${examId}/mathematics/${chapter.id}/${sec.targetRouteSegment}`;

              // Icon resolution
              const IconComponent =
                sec.key === 'study-material'
                  ? BookOpen
                  : sec.key === 'mcq'
                  ? FileQuestion
                  : sec.key === 'assertion-reason'
                  ? Sparkles
                  : sec.key === 'very-short'
                  ? CheckCircle2
                  : sec.key === 'short-answer'
                  ? Layers
                  : sec.key === 'long-answer'
                  ? Target
                  : sec.key === 'case-based'
                  ? BookCheck
                  : sec.key === 'pyq'
                  ? History
                  : sec.key === 'chapter-test'
                  ? Clock
                  : sec.key === 'revision'
                  ? RotateCcw
                  : HelpCircle;

              return (
                <Card
                  key={sec.key}
                  id={`section-card-${sec.key}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:border-emerald-400 hover:shadow-md sm:p-6"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                        <IconComponent size={20} />
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        {sec.key === 'study-material' && sheetNotes.length > 0
                          ? `🟢 ${sheetNotes.length} शीट नोट्स सिंक`
                          : sec.badge}
                      </span>
                    </div>

                    <h3 className="mt-4 text-base font-bold text-slate-900 group-hover:text-emerald-700">
                      <Link href={sectionUrl} className="focus-ring hover:underline">
                        {sec.title}
                      </Link>
                    </h3>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">{sec.hindiTitle}</p>

                    <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      {sec.description}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-3">
                    <Link
                      href={sectionUrl}
                      className="focus-ring flex items-center justify-between text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      <span>अभ्यास शुरू करें (Open Section)</span>
                      <ChevronRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>
    </Layout>
  );
}
