import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Filter,
  Layers,
  Search,
  Sparkles,
  Target,
} from 'lucide-react';
import { Link } from 'wouter';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout } from '@/components/site';
import {
  CBSE_CLASS_10_SCIENCE_CHAPTERS,
  calculateScienceChapterProgress,
} from '@/data/cbse-class-10-science';
import { ScienceChapterCard } from './ScienceChapterCard';

interface ScienceDashboardProps {
  examId?: string;
}

export function ScienceDashboard({ examId = 'cbse-class-10' }: ScienceDashboardProps) {
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate real progress for each chapter
  const chaptersWithProgress = useMemo(() => {
    return CBSE_CLASS_10_SCIENCE_CHAPTERS.map((chapter) => ({
      chapter,
      progress: calculateScienceChapterProgress(chapter.id),
    }));
  }, []);

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
    return CBSE_CLASS_10_SCIENCE_CHAPTERS.reduce((acc, c) => acc + c.weightageMarks, 0);
  }, []);

  return (
    <Layout>
      {/* 1. Header Section with Breadcrumbs and ExamSetu4U Hero Wash */}
      <section className="hero-wash py-10 text-white sm:py-14">
        <Container>
          <div className="text-blue-200">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Exams', href: '/exams' },
                { label: 'CBSE Class 10', href: `/exams/${examId}` },
                { label: 'Science' },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur-xs">
                <Sparkles size={13} className="text-blue-300" /> CBSE Class 10 Board Exam
              </span>
              <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Science <span className="text-blue-300">Learning Dashboard</span>
              </h1>
              <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-blue-100/90 sm:text-base">
                CBSE कक्षा 10 विज्ञान का संपूर्ण अध्याय-वार शिक्षण केंद्र। 13 अध्यायों में विभाजित
                थ्योरी (80 अंक), वस्तुनिष्ठ प्रश्न, केस स्टडी व विगत वर्षों के प्रश्न।
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
                className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-600"
              >
                <Target size={14} /> Mistake Book
              </Link>
            </div>
          </div>

          {/* Syllabus Quick Stat Bar */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-blue-200">कुल अध्याय (Chapters)</span>
              <p className="mt-0.5 text-xl font-black text-white">13 Chapters</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-blue-200">इकाइयाँ (Units)</span>
              <p className="mt-0.5 text-xl font-black text-white">5 Units</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-blue-200">थ्योरी अंक (Theory)</span>
              <p className="mt-0.5 text-xl font-black text-white">{totalMarks} Marks</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-blue-200">आंतरिक मूल्यांकन</span>
              <p className="mt-0.5 text-xl font-black text-white">20 Marks</p>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Intended Learning Flow Guidance Banner */}
      <section className="border-b border-slate-200 bg-blue-50/60 py-4">
        <Container>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
              <Layers size={15} />
              <span>अनुशंसित अध्ययन प्रवाह (Recommended Flow):</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-700">
              <span className="rounded-md bg-white px-2 py-1 font-bold text-blue-700 shadow-2xs border border-blue-200">
                1. Study Material
              </span>
              <span className="text-slate-400">➔</span>
              <span className="rounded-md bg-white px-2 py-1 font-bold text-blue-700 shadow-2xs border border-blue-200">
                2. Practice Questions
              </span>
              <span className="text-slate-400">➔</span>
              <span className="rounded-md bg-white px-2 py-1 font-bold text-blue-700 shadow-2xs border border-blue-200">
                3. Board PYQs
              </span>
              <span className="text-slate-400">➔</span>
              <span className="rounded-md bg-white px-2 py-1 font-bold text-blue-700 shadow-2xs border border-blue-200">
                4. Chapter Test
              </span>
              <span className="text-slate-400">➔</span>
              <span className="rounded-md bg-white px-2 py-1 font-bold text-blue-700 shadow-2xs border border-blue-200">
                5. Revision
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Main Dashboard Content Area */}
      <section className="bg-slate-50/50 py-8 sm:py-12">
        <Container>
          {/* Controls: Unit Filtering & Search */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Unit Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedUnit('all')}
                className={`focus-ring min-h-9 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 'all'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                सभी 13 अध्याय (All)
              </button>
              <button
                type="button"
                onClick={() => setSelectedUnit(1)}
                className={`focus-ring min-h-9 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 1
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Unit 1: रासायनिक पदार्थ (25 अंक)
              </button>
              <button
                type="button"
                onClick={() => setSelectedUnit(2)}
                className={`focus-ring min-h-9 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 2
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Unit 2: जैव जगत (25 अंक)
              </button>
              <button
                type="button"
                onClick={() => setSelectedUnit(3)}
                className={`focus-ring min-h-9 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 3
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Unit 3: प्राकृतिक घटनाएँ (12 अंक)
              </button>
              <button
                type="button"
                onClick={() => setSelectedUnit(4)}
                className={`focus-ring min-h-9 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 4
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Unit 4: विद्युत प्रभाव (13 अंक)
              </button>
              <button
                type="button"
                onClick={() => setSelectedUnit(5)}
                className={`focus-ring min-h-9 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  selectedUnit === 5
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Unit 5: पर्यावरण (5 अंक)
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="अध्याय या विषय खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus-ring min-h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 text-xs text-slate-900 shadow-2xs outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Chapter Grid */}
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredChapters.map(({ chapter, progress }) => (
              <ScienceChapterCard
                key={chapter.id}
                chapter={chapter}
                progress={progress}
                examId={examId}
                subjectId="cbse-class-10-science"
              />
            ))}
          </div>

          {/* Empty search results fallback */}
          {filteredChapters.length === 0 && (
            <Card className="mt-8 border-dashed border-slate-300 p-8 text-center sm:p-12">
              <Search size={32} className="mx-auto text-slate-400" />
              <h3 className="mt-3 text-lg font-bold text-slate-800">कोई अध्याय नहीं मिला</h3>
              <p className="mt-1 text-xs text-slate-500">
                "{searchQuery}" से मेल खाता कोई अध्याय उपलब्ध नहीं है। कृपया फ़िल्टर रीसेट करें।
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedUnit('all');
                  setSearchQuery('');
                }}
                className="mt-4 text-xs font-bold"
              >
                सभी अध्याय दिखाएं
              </Button>
            </Card>
          )}

          {/* Quick Notice about Content Addition */}
          <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 text-xs text-slate-600 sm:p-6">
            <div className="flex items-start gap-3">
              <BookOpen size={18} className="mt-0.5 shrink-0 text-blue-700" />
              <div>
                <h4 className="font-bold text-slate-900">
                  CBSE Class 10 Science — Scalable Architecture Ready
                </h4>
                <p className="mt-1 leading-relaxed text-slate-600">
                  यह डैशबोर्ड आगामी 10,000+ प्रश्नों, Google Sheets सिंक और NCERT नोट्स के लिए
                  संरचित है। कोई भी कृत्रिम (fake) आँकड़े या प्रश्न प्रदर्शित नहीं किए गए हैं। सामग्री
                  जुड़ने पर प्रगति स्वतः वास्तविक गतिविधियों से गणना होगी।
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
