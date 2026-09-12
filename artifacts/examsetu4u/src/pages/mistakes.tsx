import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Filter,
  Layers,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { MistakeDetail } from '@/components/mistakes/mistake-detail';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { exams, getSubjectsForExam, getTopicsForSubject } from '@/data/curriculum';
import {
  filterAndSortMistakes,
  getMistakeSummary,
  loadMistakes,
  MistakeFilterOptions,
  MistakeQuestion,
} from '@/lib/mistakes';

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<MistakeQuestion[]>(() => loadMistakes());
  const [examId, setExamId] = useState<string>('all');
  const [subjectId, setSubjectId] = useState<string>('all');
  const [topicId, setTopicId] = useState<string>('all');
  const [difficulty, setDifficulty] = useState<string>('all');
  const [revisionStatus, setRevisionStatus] = useState<string>('all');
  const [source, setSource] = useState<'all' | 'quiz' | 'pyq'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<
    'priority' | 'recent' | 'wrong_attempts' | 'needs_revision' | 'improving' | 'mastered'
  >('priority');

  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Sync when mistakes change or storage updates
  useEffect(() => {
    document.title = 'Mistake Book - ExamSetu4U';
    const refresh = () => {
      setMistakes(loadMistakes());
      setRefreshKey((k) => k + 1);
    };

    window.addEventListener('examsetu4u_mistakes_updated', refresh);
    return () => window.removeEventListener('examsetu4u_mistakes_updated', refresh);
  }, []);

  const summary = useMemo(() => getMistakeSummary(), [mistakes, refreshKey]);

  // Dynamic filter dropdown options
  const subjectOptions = useMemo(() => {
    if (examId === 'all') return [];
    return getSubjectsForExam(examId);
  }, [examId]);

  const topicOptions = useMemo(() => {
    if (subjectId === 'all') return [];
    return getTopicsForSubject(subjectId);
  }, [subjectId]);

  const handleExamChange = (newExam: string) => {
    setExamId(newExam);
    setSubjectId('all');
    setTopicId('all');
  };

  const handleSubjectChange = (newSub: string) => {
    setSubjectId(newSub);
    setTopicId('all');
  };

  const resetFilters = () => {
    setExamId('all');
    setSubjectId('all');
    setTopicId('all');
    setDifficulty('all');
    setRevisionStatus('all');
    setSource('all');
    setSearchQuery('');
    setSortBy('priority');
  };

  const filteredMistakes = useMemo(() => {
    return filterAndSortMistakes({
      examId,
      subjectId,
      topicId,
      difficulty,
      revisionStatus,
      source,
      searchQuery,
      sortBy,
    });
  }, [examId, subjectId, topicId, difficulty, revisionStatus, source, searchQuery, sortBy, mistakes, refreshKey]);

  const hasActiveFilters =
    examId !== 'all' ||
    subjectId !== 'all' ||
    topicId !== 'all' ||
    difficulty !== 'all' ||
    revisionStatus !== 'all' ||
    source !== 'all' ||
    searchQuery.trim().length > 0 ||
    sortBy !== 'priority';

  return (
    <Layout>
      {/* Header & Breadcrumbs - Prepare with purpose theme */}
      <section className="hero-wash text-white py-10 sm:py-16">
        <Container>
          <div className="text-blue-200">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Mistake Book' },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur-xs">
                <Sparkles size={13} className="text-blue-300" /> Smart Revision Engine
              </span>
              <h1 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Mistake Book <span className="text-blue-300">(गलती डायरी)</span>
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-blue-100/90 max-w-2xl leading-relaxed">
                क्विज़ और PYQ में गलत हुए प्रश्नों का व्यवस्थित संकलन। यहाँ से अपनी गलतियों को दोहराएं और उन्हें मजबूत ज्ञान में बदलें।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                href="/mistakes/practice"
                className="bg-white text-blue-900 hover:bg-blue-50 border-white font-bold shadow-md min-h-10 text-xs"
                data-testid="button-practice-all-mistakes"
              >
                <Play size={15} />
                <span>Practice Mistakes ({summary.total})</span>
              </Button>
              <Button
                href="/practice/weak-topics"
                variant="secondary"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-xs font-bold text-xs min-h-10"
                data-testid="button-practice-weak-topics-header"
              >
                <AlertTriangle size={15} className="text-amber-300" />
                <span>Weak Topics ({summary.weakTopicsCount})</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics Cards in Frosted Glass */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-md shadow-sm">
              <p className="text-xs font-medium text-blue-200">कुल गलतियाँ (Total)</p>
              <p className="mt-1 text-2xl font-extrabold text-white">{summary.total}</p>
            </div>

            <div className="rounded-2xl border border-rose-400/30 bg-rose-950/20 p-4 text-white backdrop-blur-md shadow-sm">
              <p className="text-xs font-medium text-rose-200">दोबारा पढ़ें (Revision)</p>
              <p className="mt-1 text-2xl font-extrabold text-rose-200">{summary.needsRevision}</p>
            </div>

            <div className="rounded-2xl border border-amber-400/30 bg-amber-950/20 p-4 text-white backdrop-blur-md shadow-sm">
              <p className="text-xs font-medium text-amber-200">सुधार हो रहा है</p>
              <p className="mt-1 text-2xl font-extrabold text-amber-200">{summary.improving}</p>
            </div>

            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-950/20 p-4 text-white backdrop-blur-md shadow-sm">
              <p className="text-xs font-medium text-emerald-200">मजबूत (Mastered)</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-200">{summary.mastered}</p>
            </div>

            <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-2xl border border-blue-400/30 bg-blue-900/30 p-4 text-white backdrop-blur-md shadow-sm">
              <p className="text-xs font-medium text-blue-200">आज का Revision</p>
              <p className="mt-1 text-2xl font-extrabold text-blue-200">{summary.todayRevisionCount}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content Area: Filters + List */}
      <section className="bg-slate-50 py-8 sm:py-12">
        <Container>
          {/* Filter Toolbar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-2xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-blue-700" />
                <h2 className="text-base font-bold text-slate-900">Filter & Sort Mistakes</h2>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-700 transition"
                  data-testid="button-reset-mistake-filters"
                >
                  <RotateCcw size={13} />
                  <span>फ़िल्टर रीसेट करें</span>
                </button>
              )}
            </div>

            {/* Filter Inputs Grid */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search text */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Search Question
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="प्रश्न, विषय या व्याख्या में खोजें..."
                    className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm text-slate-800 outline-none transition hover:border-blue-300 focus:border-blue-600 focus:bg-white"
                    data-testid="input-mistakes-search"
                  />
                </div>
              </div>

              {/* Exam */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Exam (परीक्षा)
                </label>
                <select
                  value={examId}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-800 outline-none transition hover:border-blue-300 focus:border-blue-600 focus:bg-white font-medium"
                  data-testid="select-mistake-exam"
                >
                  <option value="all">सभी परीक्षाएं (All Exams)</option>
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Revision Status */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Revision Status
                </label>
                <select
                  value={revisionStatus}
                  onChange={(e) => setRevisionStatus(e.target.value)}
                  className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-800 outline-none transition hover:border-blue-300 focus:border-blue-600 focus:bg-white font-medium"
                  data-testid="select-mistake-status"
                >
                  <option value="all">सभी स्थितियां (All Statuses)</option>
                  <option value="NEEDS_REVISION">दोबारा पढ़ें (Needs Revision)</option>
                  <option value="IMPROVING">सुधार हो रहा है (Improving)</option>
                  <option value="MASTERED">मजबूत (Mastered)</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Subject (विषय)
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  disabled={examId === 'all'}
                  className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-800 outline-none transition hover:border-blue-300 focus:border-blue-600 focus:bg-white font-medium disabled:opacity-50"
                  data-testid="select-mistake-subject"
                >
                  <option value="all">सभी विषय (All Subjects)</option>
                  {subjectOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Topic (प्रकरण)
                </label>
                <select
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  disabled={subjectId === 'all'}
                  className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-800 outline-none transition hover:border-blue-300 focus:border-blue-600 focus:bg-white font-medium disabled:opacity-50"
                  data-testid="select-mistake-topic"
                >
                  <option value="all">सभी टॉपिक्स (All Topics)</option>
                  {topicOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Difficulty (कठिनाई)
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-800 outline-none transition hover:border-blue-300 focus:border-blue-600 focus:bg-white font-medium"
                  data-testid="select-mistake-difficulty"
                >
                  <option value="all">सभी स्तर (All Difficulties)</option>
                  <option value="Easy">सरल (Easy)</option>
                  <option value="Moderate">मध्यम (Moderate)</option>
                  <option value="Hard">कठिन (Hard)</option>
                  <option value="Very Hard">अति कठिन (Very Hard)</option>
                </select>
              </div>

              {/* Sort By (Requirement 10) */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Sort By (क्रमबद्ध करें)
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="focus-ring h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-800 outline-none transition hover:border-blue-300 focus:border-blue-600 focus:bg-white font-medium"
                  data-testid="select-mistake-sort"
                >
                  <option value="priority">Revision Priority (प्राथमिकता अनुसार)</option>
                  <option value="recent">Most Recent Mistakes (हाल की गलतियाँ)</option>
                  <option value="wrong_attempts">Most Wrong Attempts (अधिकतम गलत प्रयास)</option>
                  <option value="needs_revision">Needs Revision First (दोबारा पढ़ने वाले पहले)</option>
                  <option value="improving">Improving First (सुधार हो रहे पहले)</option>
                  <option value="mastered">Mastered First (मजबूत पहले)</option>
                </select>
              </div>
            </div>

            {/* Filter Count & Practice Filtered Button */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
              <span>
                प्रदर्शित प्रश्न: <strong className="text-slate-900">{filteredMistakes.length}</strong> / {mistakes.length}
              </span>

              {filteredMistakes.length > 0 && (
                <Button
                  href={`/mistakes/practice?examId=${examId}&subjectId=${subjectId}&topicId=${topicId}&difficulty=${difficulty}&revisionStatus=${revisionStatus}`}
                  variant="secondary"
                  className="text-xs min-h-8 font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
                  data-testid="button-practice-filtered-mistakes"
                >
                  <Play size={14} />
                  <span>इन {filteredMistakes.length} प्रश्नों का अभ्यास करें</span>
                </Button>
              )}
            </div>
          </div>

          {/* Mistakes List */}
          <div className="mt-8 space-y-4">
            {filteredMistakes.length > 0 ? (
              filteredMistakes.map((m) => (
                <MistakeDetail
                  key={m.id}
                  mistake={m}
                  onUpdated={() => {
                    setMistakes(loadMistakes());
                    setRefreshKey((k) => k + 1);
                  }}
                />
              ))
            ) : mistakes.length === 0 ? (
              /* Requirement 17 Empty State */
              <Card className="p-8 sm:p-12 text-center border-dashed rounded-2xl border-slate-300 bg-white" data-testid="card-empty-mistakes">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={28} className="text-emerald-600" />
                </div>
                <h3 className="font-display mt-4 text-2xl font-bold text-slate-900">
                  अभी आपकी Mistake Book खाली है।
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
                  Quiz और PYQ practice करते रहें। गलत questions यहां revision के लिए दिखाई देंगे ताकि आप उन्हें दोबारा दोहरा सकें।
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button href="/quiz" variant="primary" className="bg-blue-700 hover:bg-blue-800 text-white font-bold shadow-xs">
                    <Play size={15} />
                    <span>Quiz शुरू करें</span>
                  </Button>
                  <Button href="/pyq" variant="secondary" className="border-blue-200 text-blue-700 hover:bg-blue-50 font-bold">
                    <BookOpenCheck size={15} />
                    <span>PYQ अभ्यास करें</span>
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center border-dashed rounded-2xl border-slate-300 bg-white">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Search size={22} />
                </div>
                <h3 className="font-display mt-3 text-xl font-bold text-slate-900">
                  चयनित फ़िल्टर के अनुसार कोई प्रश्न नहीं मिला
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  कृपया फ़िल्टर विकल्पों को बदलें या रीसेट करें।
                </p>
                <Button type="button" variant="secondary" onClick={resetFilters} className="mt-5 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold">
                  <RotateCcw size={14} />
                  <span>फ़िल्टर रीसेट करें</span>
                </Button>
              </Card>
            )}
          </div>
        </Container>
      </section>
    </Layout>
  );
}
