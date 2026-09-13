import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  Filter,
  Layers,
  Search,
  Sparkles,
  Target,
  Clock,
  History,
} from 'lucide-react';
import { Link } from 'wouter';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout } from '@/components/site';
import {
  CBSE_CLASS_10_MATHS_CHAPTERS,
  calculateMathsChapterProgress,
  type MathsChapter,
} from '@/data/cbse-class-10-maths';
import { MathsChapterCard } from './MathsChapterCard';
import { useQuestionBank } from '@/hooks/useQuestionBank';

interface MathsDashboardProps {
  examId?: string;
}

export function MathsDashboard({ examId = 'cbse-class-10' }: MathsDashboardProps) {
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { publishedSheetCount } = useQuestionBank();

  // Progress for all 14 chapters
  const chaptersWithProgress = useMemo(() => {
    return CBSE_CLASS_10_MATHS_CHAPTERS.map((chapter) => ({
      chapter,
      progress: calculateMathsChapterProgress(chapter.id),
    }));
  }, [publishedSheetCount]);

  // Filter chapters by Unit and Search Query
  const filteredChapters = useMemo(() => {
    return chaptersWithProgress.filter(({ chapter }) => {
      if (selectedUnit !== 'all' && chapter.unitNumber !== selectedUnit) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = chapter.title.toLowerCase().includes(q);
        const matchHindi = chapter.hindiTitle.toLowerCase().includes(q);
        const matchUnit = chapter.unitName.toLowerCase().includes(q);
        const matchTopics = chapter.syllabusTopics.some((t) => t.toLowerCase().includes(q));
        return matchTitle || matchHindi || matchUnit || matchTopics;
      }
      return true;
    });
  }, [chaptersWithProgress, selectedUnit, searchQuery]);

  // Total weightage
  const totalMarks = useMemo(() => {
    return CBSE_CLASS_10_MATHS_CHAPTERS.reduce((acc, c) => acc + c.weightageMarks, 0);
  }, []);

  return (
    <Layout>
      {/* 1. Header Section with Breadcrumbs and ExamSetu4U Hero Wash */}
      <section className="hero-wash py-10 text-white sm:py-14">
        <Container>
          <div className="text-emerald-200">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Exams', href: '/exams' },
                { label: 'CBSE Class 10', href: `/exams/${examId}` },
                { label: 'Mathematics' },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-xs">
                <Sparkles size={13} className="text-emerald-300" /> CBSE Class 10 Board Exam
              </span>
              <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Mathematics <span className="text-emerald-300">Learning Dashboard</span>
              </h1>
              <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-emerald-100/90 sm:text-base">
                CBSE कक्षा 10 गणित का संपूर्ण 14 अध्याय-वार शिक्षण केंद्र। 7 इकाइयों में विभाजित
                थ्योरी (80 अंक), 1-अंक वस्तुनिष्ठ प्रश्न, अभिकथन-कारण, लघु-दीर्घ उत्तरीय, केस स्टडी व विगत वर्षों के प्रश्न।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/exams/${examId}`}
                className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/20"
              >
                <ArrowLeft size={14} /> Back to CBSE Class 10
              </Link>
              <Link
                href="/mistakes"
                className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
              >
                <Target size={14} /> Mistake Book
              </Link>
            </div>
          </div>

          {/* Syllabus Quick Stat Bar */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-emerald-200">कुल अध्याय (Chapters)</span>
              <p className="mt-0.5 text-xl font-black text-white">14 Chapters</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-emerald-200">इकाइयाँ (Units)</span>
              <p className="mt-0.5 text-xl font-black text-white">7 Units</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-emerald-200">थ्योरी अंक (Theory)</span>
              <p className="mt-0.5 text-xl font-black text-white">{totalMarks} Marks</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-emerald-200">आंतरिक मूल्यांकन</span>
              <p className="mt-0.5 text-xl font-black text-white">20 Marks</p>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Intended Learning Flow Guidance Banner */}
      <section className="border-b border-slate-200 bg-emerald-50/60 py-4">
        <Container>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
              <Layers size={15} className="text-emerald-700" />
              <span>अनुशंसित अध्ययन प्रवाह (Recommended Flow):</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-700">
              <span className="rounded-md bg-white px-2 py-1 font-bold text-emerald-800 shadow-2xs border border-emerald-200">
                1. Concept & Formulas
              </span>
              <span className="text-slate-400">➔</span>
              <span className="rounded-md bg-white px-2 py-1 font-bold text-emerald-800 shadow-2xs border border-emerald-200">
                2. Section A: MCQs (1M)
              </span>
              <span className="text-slate-400">➔</span>
              <span className="rounded-md bg-white px-2 py-1 font-bold text-emerald-800 shadow-2xs border border-emerald-200">
                3. Section B & C: Short (2-3M)
              </span>
              <span className="text-slate-400">➔</span>
              <span className="rounded-md bg-white px-2 py-1 font-bold text-emerald-800 shadow-2xs border border-emerald-200">
                4. Section D & E: Case & LA
              </span>
              <span className="text-slate-400">➔</span>
              <span className="rounded-md bg-white px-2 py-1 font-bold text-emerald-800 shadow-2xs border border-emerald-200">
                5. Board PYQs (2019-24)
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. CBSE Blueprint Card */}
      <section className="py-6 border-b border-slate-100 bg-white">
        <Container>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                  CBSE Class 10 Mathematics Exam Pattern (80 Marks)
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Section A: 20 MCQs (1 Mark) • Section B: 5 VSA (2 Marks) • Section C: 6 SA (3 Marks) • Section D: 4 LA (5 Marks) • Section E: 3 Case Studies (4 Marks)
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/quiz/${examId}/cbse-class-10-mathematics`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-emerald-800"
                >
                  <FileQuestion size={14} /> Full Mathematics Quiz
                </Link>
                <Link
                  href={`/pyq/${examId}/cbse-class-10-mathematics`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <History size={14} /> Board PYQs Hub
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 4. Filter & Search Controls */}
      <section className="py-8 sm:py-10">
        <Container>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Unit Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedUnit('all')}
                className={`focus-ring rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 'all'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                सभी 14 अध्याय ({CBSE_CLASS_10_MATHS_CHAPTERS.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedUnit(1)}
                className={`focus-ring rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 1
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unit 1: Number Systems (6 M)
              </button>

              <button
                type="button"
                onClick={() => setSelectedUnit(2)}
                className={`focus-ring rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 2
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unit 2: Algebra (20 M)
              </button>

              <button
                type="button"
                onClick={() => setSelectedUnit(3)}
                className={`focus-ring rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 3
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unit 3: Coordinate (6 M)
              </button>

              <button
                type="button"
                onClick={() => setSelectedUnit(4)}
                className={`focus-ring rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 4
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unit 4: Geometry (15 M)
              </button>

              <button
                type="button"
                onClick={() => setSelectedUnit(5)}
                className={`focus-ring rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 5
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unit 5: Trigonometry (12 M)
              </button>

              <button
                type="button"
                onClick={() => setSelectedUnit(6)}
                className={`focus-ring rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 6
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unit 6: Mensuration (10 M)
              </button>

              <button
                type="button"
                onClick={() => setSelectedUnit(7)}
                className={`focus-ring rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 7
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unit 7: Statistics & Prob (11 M)
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full lg:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="अध्याय या सूत्र खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus-ring w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* 5. Chapters Grid */}
          <div className="mt-8">
            {filteredChapters.length === 0 ? (
              <Card className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Filter size={24} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">कोई अध्याय नहीं मिला</h3>
                <p className="mt-1 text-xs text-slate-500">
                  '{searchQuery}' के लिए कोई परिणाम उपलब्ध नहीं है। कृपया भिन्न नाम खोजें।
                </p>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUnit('all');
                      setSearchQuery('');
                    }}
                  >
                    सभी फिल्टर हटाएं
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                {filteredChapters.map(({ chapter, progress }) => (
                  <MathsChapterCard
                    key={chapter.id}
                    chapter={chapter}
                    progress={progress}
                    examId={examId}
                    subjectId="cbse-class-10-mathematics"
                  />
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    </Layout>
  );
}
