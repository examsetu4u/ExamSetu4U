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
  getCbseSubjectConfig,
  calculateCbseChapterProgress,
} from '@/data/cbse-curriculum';
import { useQuestionBank } from '@/hooks/useQuestionBank';
import { CbseChapterCard } from './CbseChapterCard';

interface CbseSubjectDashboardProps {
  examId: string;
  subjectId: string;
}

export function CbseSubjectDashboard({ examId, subjectId }: CbseSubjectDashboardProps) {
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { publishedSheetCount } = useQuestionBank();

  const subjectConfig = useMemo(() => {
    return getCbseSubjectConfig(subjectId, examId);
  }, [subjectId, examId]);

  if (!subjectConfig) {
    return (
      <Layout>
        <Container className="py-16 text-center">
          <h2 className="text-xl font-bold text-slate-800">Subject Not Found</h2>
          <p className="mt-2 text-sm text-slate-500">The requested CBSE subject could not be located.</p>
          <Link href={`/exams/${examId}`} className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
            Return to Exam
          </Link>
        </Container>
      </Layout>
    );
  }

  // Calculate real progress for each chapter
  const chaptersWithProgress = useMemo(() => {
    return subjectConfig.chapters.map((chapter) => ({
      chapter,
      progress: calculateCbseChapterProgress(chapter.id, examId, subjectConfig.id),
    }));
  }, [subjectConfig, examId, publishedSheetCount]);

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

  const examLabel = examId === 'cbse-class-12' ? 'CBSE Class 12' : 'CBSE Class 10';

  return (
    <Layout>
      {/* 1. Header Section with Breadcrumbs and Hero Wash */}
      <section className="hero-wash py-10 text-white sm:py-14">
        <Container>
          <div className="text-blue-200">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Exams', href: '/exams' },
                { label: examLabel, href: `/exams/${examId}` },
                { label: subjectConfig.name },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur-xs">
                <Sparkles size={13} className="text-blue-300" /> {examLabel} Board Exam
              </span>
              <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {subjectConfig.name} <span className="text-blue-300">Learning Dashboard</span>
              </h1>
              <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-blue-100/90 sm:text-base">
                {subjectConfig.taglineHindi}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/exams/${examId}`}
                className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur-xs hover:bg-white/20"
              >
                <ArrowLeft size={14} /> Back to {examLabel}
              </Link>
            </div>
          </div>

          {/* Key Metrics / Highlights Bar */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs sm:p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-200">
                <BookOpen size={15} /> कुल अध्याय (Chapters)
              </div>
              <p className="mt-1.5 text-2xl font-black text-white sm:text-3xl">
                {subjectConfig.chapters.length}
              </p>
              <p className="text-[11px] text-blue-100/80">नवीनतम NCERT पाठ्यक्रम</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs sm:p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-200">
                <Target size={15} /> बोर्ड अंक (Theory Marks)
              </div>
              <p className="mt-1.5 text-2xl font-black text-white sm:text-3xl">
                {subjectConfig.theoryMarks}
              </p>
              <p className="text-[11px] text-blue-100/80">
                +{subjectConfig.internalMarks} अंक आंतरिक/प्रायोगिक
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs sm:p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-200">
                <Layers size={15} /> इकाइयाँ (Curriculum Units)
              </div>
              <p className="mt-1.5 text-2xl font-black text-white sm:text-3xl">
                {subjectConfig.units.length}
              </p>
              <p className="text-[11px] text-blue-100/80">इकाई-वार ब्लूप्रिंट आधारित</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-xs sm:p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-200">
                <Award size={15} /> परीक्षा अवधि (Exam Duration)
              </div>
              <p className="mt-1.5 text-2xl font-black text-white sm:text-3xl">
                {subjectConfig.examDurationMinutes / 60} घंटे
              </p>
              <p className="text-[11px] text-blue-100/80">{subjectConfig.examDurationMinutes} मिनट समयबद्ध</p>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Filters, Search & Unit Switcher Section */}
      <section className="border-b border-slate-200 bg-white py-4 shadow-xs sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Unit Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs sm:pb-0 scrollbar-none">
              <span className="flex items-center gap-1 font-bold text-slate-500 mr-1 shrink-0">
                <Filter size={13} /> इकाई:
              </span>
              <button
                type="button"
                onClick={() => setSelectedUnit('all')}
                className={`focus-ring shrink-0 rounded-xl px-3 py-1.5 font-bold transition ${
                  selectedUnit === 'all'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                सभी अध्याय ({subjectConfig.chapters.length})
              </button>

              {subjectConfig.units.map((unit) => (
                <button
                  key={unit.unitNumber}
                  type="button"
                  onClick={() => setSelectedUnit(unit.unitNumber)}
                  className={`focus-ring shrink-0 rounded-xl px-3 py-1.5 font-bold transition ${
                    selectedUnit === unit.unitNumber
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Unit {unit.unitNumber} ({unit.marks} अंक)
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="अध्याय या टॉपिक खोजें..."
                className="focus-ring w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white sm:text-sm"
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
        </Container>
      </section>

      {/* 3. Chapter Cards Grid */}
      <section className="bg-slate-50/60 py-8 sm:py-12">
        <Container>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                {selectedUnit === 'all'
                  ? 'संपूर्ण अध्याय सूची (All Chapters)'
                  : `Unit ${selectedUnit}: ${subjectConfig.units.find((u) => u.unitNumber === selectedUnit)?.name}`}
              </h2>
              <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                किसी भी अध्याय पर क्लिक कर उसके 10+ अध्ययन खंडों, वस्तुनिष्ठ प्रश्नों, नोट्स व बोर्ड पेपर्स का अभ्यास करें।
              </p>
            </div>
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
              {filteredChapters.length} अध्याय प्रदर्शित
            </span>
          </div>

          {filteredChapters.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredChapters.map(({ chapter, progress }) => (
                <CbseChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  progress={progress}
                  subjectConfig={subjectConfig}
                  examId={examId}
                />
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <Search size={36} className="text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-800">कोई अध्याय नहीं मिला</h3>
              <p className="mt-1 text-xs text-slate-500">
                "{searchQuery}" के लिए कोई परिणाम नहीं मिला। कृपया दूसरा शब्द खोजें या फ़िल्टर रीसेट करें।
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedUnit('all');
                }}
              >
                फ़िल्टर रीसेट करें (Reset Filters)
              </Button>
            </Card>
          )}
        </Container>
      </section>

      {/* 4. Unit Breakdown & Weightage Reference */}
      <section className="border-t border-slate-200 bg-white py-10">
        <Container>
          <div className="max-w-3xl">
            <h3 className="text-lg font-bold text-slate-900">
              CBSE बोर्ड परीक्षा अंक विभाजन (Unit-wise Weightage Blueprint)
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              यह विषय विभाजन आधिकारिक CBSE बोर्ड परीक्षा ब्लूप्रिंट के अनुसार संरचित है:
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subjectConfig.units.map((unit) => {
              const unitChapters = subjectConfig.chapters.filter((c) => c.unitNumber === unit.unitNumber);
              return (
                <div
                  key={unit.unitNumber}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                      Unit {unit.unitNumber}
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {unit.marks} अंक
                    </span>
                  </div>
                  <h4 className="mt-2.5 text-xs font-bold text-slate-800 line-clamp-2">
                    {unit.name}
                  </h4>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                    {unit.hindiName}
                  </p>
                  <p className="mt-3 text-[11px] font-semibold text-slate-600">
                    कुल {unitChapters.length} अध्याय सम्मिलित
                  </p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </Layout>
  );
}
