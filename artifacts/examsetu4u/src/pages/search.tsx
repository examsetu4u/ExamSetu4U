import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  FileQuestion,
  FileText,
  Filter,
  History,
  Layers,
  RotateCcw,
  Search as SearchIcon,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { EmptyState } from '@/components/empty-state';
import { ContentFilters, FilterState } from '@/components/content-filters';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { exams } from '@/data/curriculum';
import {
  clearRecentSearches,
  getRecentSearches,
  removeRecentSearch,
  saveRecentSearch,
  searchContent,
  SearchResultItem,
  SearchResultType,
} from '@/lib/search';

const POPULAR_SEARCH_TERMS = [
  'शिक्षण',
  'बाल विकास',
  'गणित',
  'Super TET',
  'UPTET',
  'CTET',
  'SSC CGL',
  'Reasoning',
  'पर्यावरण',
  'Percentage',
];

export default function SearchPage() {
  const [location, setLocation] = useLocation();

  // Extract query from window.location.search or location
  const getQueryFromUrl = (): string => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  };

  const [query, setQuery] = useState<string>(getQueryFromUrl());
  const [activeTab, setActiveTab] = useState<SearchResultType | 'all'>('all');
  const [filterState, setFilterState] = useState<FilterState>({
    examId: 'all',
    contentType: 'all',
    difficulty: 'all',
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Update query if URL search changes
  useEffect(() => {
    const currentQ = getQueryFromUrl();
    if (currentQ !== query) {
      setQuery(currentQ);
    }
    setRecentSearches(getRecentSearches());
  }, [location]);

  // Sync tab with content type filter
  const handleTabChange = (tab: SearchResultType | 'all') => {
    setActiveTab(tab);
    setFilterState((prev) => ({
      ...prev,
      contentType: tab === 'all' ? 'all' : tab,
    }));
  };

  // Perform search
  const searchResults = useMemo(() => {
    return searchContent(query, {
      type: filterState.contentType === 'all' ? undefined : (filterState.contentType as SearchResultType),
      examId: filterState.examId === 'all' ? undefined : filterState.examId,
      difficulty: filterState.difficulty === 'all' ? undefined : filterState.difficulty,
    });
  }, [query, filterState]);

  // Execute search submission
  const handleSearchSubmit = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    setQuery(trimmed);
    if (trimmed) {
      saveRecentSearch(trimmed);
      setRecentSearches(getRecentSearches());
      window.history.replaceState(null, '', `/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      window.history.replaceState(null, '', `/search`);
    }
  };

  const handleClearQuery = () => {
    setQuery('');
    window.history.replaceState(null, '', '/search');
  };

  const handleRemoveRecent = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeRecentSearch(term);
    setRecentSearches(getRecentSearches());
  };

  const handleClearAllRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const getTypeIcon = (type: SearchResultType) => {
    switch (type) {
      case 'exam':
        return <Layers size={16} className="text-[#34547f]" />;
      case 'subject':
        return <BookOpen size={16} className="text-[#825413]" />;
      case 'topic':
        return <CheckCircle2 size={16} className="text-[#246556]" />;
      case 'study':
        return <FileText size={16} className="text-[#825413]" />;
      case 'pyq':
        return <FileQuestion size={16} className="text-[#246556]" />;
      case 'quiz':
        return <Brain size={16} className="text-[#34547f]" />;
      case 'theory':
        return <BookOpen size={16} className="text-[#9a493e]" />;
      default:
        return <SearchIcon size={16} />;
    }
  };

  const getTypeBadgeClass = (tone: string) => {
    switch (tone) {
      case 'saffron':
        return 'bg-[#f7e3bb] text-[#825413] border-[#ecd3a3]';
      case 'teal':
        return 'bg-[#d6ebe5] text-[#246556] border-[#bad8cf]';
      case 'coral':
        return 'bg-[#f3dcd5] text-[#9a493e] border-[#e7c7bd]';
      case 'blue':
      default:
        return 'bg-[#dce4f2] text-[#34547f] border-[#c7d5ea]';
    }
  };

  return (
    <Layout>
      {/* 1. Header Banner with Search Bar */}
      <section className="paper-grid border-b border-[hsl(var(--border))] py-8 sm:py-12">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Search' },
            ]}
          />

          <div className="mt-6 max-w-3xl">
            <h1 className="font-display text-3xl tracking-tight text-[hsl(var(--primary))] sm:text-4xl">
              Smart Search & Discovery
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] sm:text-base">
              Explore exams, subjects, topics, study material, previous year questions and MCQ quizzes.
              Search in Hindi, English, or mixed text.
            </p>

            {/* Main Interactive Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSubmit(query);
              }}
              className="mt-6 flex items-center gap-2"
            >
              <div className="relative flex-1">
                <SearchIcon
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="उदा. शिक्षण, Child Development, UPTET, Percentage, Reasoning..."
                  className="focus-ring w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-3.5 pl-10 pr-10 text-sm font-medium text-[hsl(var(--foreground))] shadow-xs placeholder:text-[hsl(var(--muted-foreground))]"
                  id="main-search-input"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClearQuery}
                    className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <Button type="submit" variant="primary" className="h-12 px-5 text-sm">
                सर्च करें <ArrowRight size={15} />
              </Button>
            </form>

            {/* Popular Search Suggestions */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                लोकप्रिय सर्च:
              </span>
              {POPULAR_SEARCH_TERMS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSearchSubmit(term)}
                  className="focus-ring rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--primary))] transition hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--secondary))]"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Recent Searches */}
            {recentSearches.length > 0 && !query && (
              <div className="mt-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5">
                <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
                    <History size={13} /> हालिया खोज (Recent Searches)
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllRecent}
                    className="hover:underline"
                  >
                    सभी हटाएं (Clear all)
                  </button>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      onClick={() => handleSearchSubmit(term)}
                      className="group flex cursor-pointer items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1 text-xs text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent))]"
                    >
                      <span>{term}</span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveRecent(term, e)}
                        className="rounded p-0.5 text-[hsl(var(--muted-foreground))] hover:text-red-600"
                        aria-label={`Remove ${term}`}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* 2. Results & Filters Section */}
      <section className="py-8 sm:py-12">
        <Container>
          {query ? (
            <div>
              {/* Header with Result count & Tab navigation */}
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-xl font-bold text-[hsl(var(--primary))]">
                    परिणाम (Results) &ldquo;{query}&rdquo;
                  </h2>
                  <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                    कुल {searchResults.totalCount} परिणाम पाए गए
                  </p>
                </div>

                {/* Filter reset if applied */}
                {(filterState.examId !== 'all' || filterState.difficulty !== 'all') && (
                  <button
                    type="button"
                    onClick={() =>
                      setFilterState({ examId: 'all', contentType: 'all', difficulty: 'all' })
                    }
                    className="focus-ring flex items-center gap-1 text-xs font-semibold text-[#a34f46] hover:underline"
                  >
                    <RotateCcw size={12} />
                    फ़िल्टर रीसेट करें
                  </button>
                )}
              </div>

              {/* Grouped Category Tabs */}
              <div className="no-scrollbar mt-6 flex overflow-x-auto border-b border-[hsl(var(--border))] pb-px">
                <button
                  type="button"
                  onClick={() => handleTabChange('all')}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                    activeTab === 'all'
                      ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                      : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  सभी (All)
                  <span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px]">
                    {searchResults.totalCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('exam')}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                    activeTab === 'exam'
                      ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                      : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  Exams
                  <span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px]">
                    {searchResults.exams.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('subject')}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                    activeTab === 'subject'
                      ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                      : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  Subjects
                  <span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px]">
                    {searchResults.subjects.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('topic')}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                    activeTab === 'topic'
                      ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                      : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  Topics
                  <span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px]">
                    {searchResults.topics.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('study')}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                    activeTab === 'study'
                      ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                      : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  Study Material
                  <span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px]">
                    {searchResults.studyMaterial.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('pyq')}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                    activeTab === 'pyq'
                      ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                      : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  PYQ
                  <span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px]">
                    {searchResults.pyq.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('quiz')}
                  className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                    activeTab === 'quiz'
                      ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                      : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  Quiz
                  <span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px]">
                    {searchResults.quiz.length}
                  </span>
                </button>
              </div>

              {/* Exam Filter Dropdown Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                    Filter by Exam:
                  </span>
                  <select
                    value={filterState.examId}
                    onChange={(e) => setFilterState((prev) => ({ ...prev, examId: e.target.value }))}
                    className="focus-ring rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))]"
                  >
                    <option value="all">All 8 Exams</option>
                    {exams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results List */}
              {searchResults.all.length > 0 ? (
                <div className="mt-6 space-y-3.5" id="search-results-list">
                  {searchResults.all.map((item) => (
                    <Card
                      key={item.id}
                      className="group p-4 sm:p-5 transition hover:border-[hsl(var(--accent))] hover:shadow-xs"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${getTypeBadgeClass(
                                item.badgeTone
                              )}`}
                            >
                              {getTypeIcon(item.type)}
                              {item.badgeLabel}
                            </span>
                            <span className="text-xs font-semibold text-[hsl(var(--accent-foreground))]">
                              {item.subtitle}
                            </span>
                          </div>

                          <h3 className="mt-2 text-base font-bold text-[hsl(var(--primary))] group-hover:text-[hsl(var(--accent-foreground))] sm:text-lg">
                            <Link href={item.url} className="focus-ring rounded">
                              {item.title}
                            </Link>
                          </h3>

                          <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-sm">
                            {item.description}
                          </p>
                        </div>

                        <div className="shrink-0">
                          <Button href={item.url} variant="secondary" className="w-full sm:w-auto text-xs">
                            खोलो (Open) <ArrowRight size={14} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="mt-8">
                  <EmptyState
                    type="search"
                    title={`"${query}" के लिए कोई परिणाम नहीं मिला`}
                    description="कृपया स्पेलिंग जांचें या दूसरे शब्दों (जैसे 'शिक्षण', 'गणित', 'UPTET') का उपयोग करें।"
                    actionText="सभी परीक्षाएं ब्राउज़ करें"
                    actionHref="/exams"
                  />
                </div>
              )}
            </div>
          ) : (
            // No Query entered yet: Starter Discovery View
            <div className="space-y-10">
              <div>
                <SectionTitle
                  eyebrow="Quick Explore"
                  title="Browse by Examination"
                  description="Choose an examination track to see syllabus, notes and quizzes."
                />
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {exams.map((ex) => (
                    <Card key={ex.id} className="p-4 transition hover:border-[hsl(var(--accent))]">
                      <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                        {ex.subjects}
                      </p>
                      <h3 className="mt-1 text-base font-bold text-[hsl(var(--primary))]">
                        {ex.name}
                      </h3>
                      <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
                        {ex.description}
                      </p>
                      <Button href={`/exams/${ex.id}`} variant="secondary" className="mt-4 w-full text-xs">
                        Open Path <ArrowRight size={13} />
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>
    </Layout>
  );
}
