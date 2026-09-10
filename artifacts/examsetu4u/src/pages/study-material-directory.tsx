import {
  ArrowRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Layers,
  Play,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Breadcrumbs, ProgressBar } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import {
  exams,
  getExam,
  getSubjectsForExam,
  getTopicsForSubject,
  subjects,
  topics,
  type Topic,
} from '@/data/curriculum';
import { useProgress } from '@/lib/progress';

export default function StudyMaterialDirectoryPage() {
  const [selectedExamId, setSelectedExamId] = useState<string>('super-tet');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { isBookmarked, toggleBookmark, readingProgress } = useProgress();

  const activeExam = useMemo(
    () => getExam(selectedExamId) || exams[0],
    [selectedExamId]
  );

  const examSubjects = useMemo(
    () => (activeExam ? getSubjectsForExam(activeExam.id) : []),
    [activeExam]
  );

  // Available topics filtered by search or selected subject
  const displayedTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      // Global search across all topics in active exam or all exams
      return topics.filter((t) => {
        const matchesQuery =
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q);
        const matchesExam = !selectedExamId || selectedExamId === 'all' || t.examId === selectedExamId;
        return matchesQuery && matchesExam;
      });
    }

    if (selectedSubjectId === 'all') {
      return examSubjects.flatMap((s) => getTopicsForSubject(s.id));
    }

    return getTopicsForSubject(selectedSubjectId);
  }, [selectedExamId, selectedSubjectId, searchQuery, examSubjects]);

  const totalExamTopics = useMemo(() => {
    return examSubjects.flatMap((s) => getTopicsForSubject(s.id)).length;
  }, [examSubjects]);

  const completedCount = useMemo(() => {
    const topicList = examSubjects.flatMap((s) => getTopicsForSubject(s.id));
    return topicList.filter((t) => (readingProgress[t.id] ?? 0) >= 90).length;
  }, [examSubjects, readingProgress]);

  return (
    <Layout>
      {/* Header with Breadcrumbs */}
      <section className="paper-grid border-b border-[hsl(var(--border))] py-8 sm:py-12">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'होम (Home)', href: '/' },
              { label: 'अध्ययन सामग्री (Study Material)' },
            ]}
          />

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="eyebrow">Comprehensive Notes</span>
              <h1 className="font-display mt-2 text-3xl font-black text-[hsl(var(--primary))] sm:text-4xl">
                अध्ययन सामग्री एवं नोट्स (Study Material)
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-base">
                पाठ्यक्रम के अनुसार तैयार किए गए उच्च गुणवत्ता वाले नोट्स, महत्वपूर्ण सूत्र और अवधारणात्मक सारांश। अपनी गति से पढ़ें और प्रगति ट्रैक करें।
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-2.5 shadow-sm">
                <span className="text-xs text-[hsl(var(--muted-foreground))]">कुल अध्याय:</span>
                <p className="text-lg font-bold text-[hsl(var(--primary))]">
                  {completedCount} / {totalExamTopics} पूर्ण
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <section className="py-8 sm:py-12">
        <Container>
          {/* Exam Selector Tabs */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Target Exam Selector">
              {exams.map((ex) => (
                <button
                  key={ex.id}
                  role="tab"
                  aria-selected={selectedExamId === ex.id}
                  onClick={() => {
                    setSelectedExamId(ex.id);
                    setSelectedSubjectId('all');
                  }}
                  className={`rounded-lg px-3.5 py-2 text-xs font-bold transition focus-ring ${
                    selectedExamId === ex.id
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xs'
                      : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]'
                  }`}
                  data-testid={`tab-exam-${ex.id}`}
                >
                  {ex.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="अध्याय या टॉपिक खोजें..."
                className="focus-ring h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-9 pr-3 text-xs text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]"
                data-testid="input-search-study-material"
              />
            </div>
          </div>

          {/* Subject Filter Chips (When no search query) */}
          {!searchQuery && examSubjects.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[hsl(var(--border))] pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mr-1">
                विषय:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubjectId('all')}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  selectedSubjectId === 'all'
                    ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] font-bold'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
              >
                सभी विषय ({totalExamTopics})
              </button>
              {examSubjects.map((subj) => {
                const count = getTopicsForSubject(subj.id).length;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(subj.id)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                      selectedSubjectId === subj.id
                        ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] font-bold'
                        : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                    }`}
                    data-testid={`chip-subject-${subj.id}`}
                  >
                    {subj.name} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Topics Grid */}
          <div className="mt-8">
            {displayedTopics.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayedTopics.map((topic) => {
                  const percent = readingProgress[topic.id] ?? 0;
                  const bookmarked = isBookmarked(topic.id);
                  const isCompleted = percent >= 90;
                  const isStarted = percent > 0 && !isCompleted;

                  return (
                    <Card
                      key={topic.id}
                      className="flex flex-col justify-between p-5 transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:shadow-[var(--shadow-md)]"
                      data-testid={`card-study-topic-${topic.id}`}
                    >
                      <div>
                        {/* Top Meta Bar */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
                            <Clock size={13} />
                            <span>{topic.estimatedMinutes} मिनट पठन</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleBookmark(topic.id)}
                            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--accent-foreground))] focus-ring rounded p-1"
                            title={bookmarked ? 'बुकमार्क हटाएं' : 'बुकमार्क जोड़ें'}
                            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark topic'}
                            data-testid={`button-bookmark-${topic.id}`}
                          >
                            {bookmarked ? (
                              <BookmarkCheck size={16} className="text-amber-500 fill-amber-500" />
                            ) : (
                              <Bookmark size={16} />
                            )}
                          </button>
                        </div>

                        {/* Title & Description */}
                        <h2 className="font-display mt-3 text-base font-bold text-[hsl(var(--primary))] sm:text-lg">
                          <Link
                            href={`/study-material/${topic.examId}/${topic.subjectId}/${topic.id}`}
                            className="hover:underline"
                          >
                            {topic.name}
                          </Link>
                        </h2>

                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
                          {topic.description}
                        </p>
                      </div>

                      {/* Bottom Progress & Action */}
                      <div className="mt-5 border-t border-[hsl(var(--border))] pt-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-[hsl(var(--muted-foreground))]">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                                <CheckCircle2 size={13} /> पूरा हुआ
                              </span>
                            ) : isStarted ? (
                              <span className="font-semibold text-[hsl(var(--primary))]">
                                {percent}% पढ़ा हुआ
                              </span>
                            ) : (
                              <span>नया अध्याय</span>
                            )}
                          </span>
                        </div>

                        <ProgressBar value={percent} className="h-1.5 mb-4" />

                        <div className="flex items-center justify-between gap-2">
                          <Button
                            href={`/study-material/${topic.examId}/${topic.subjectId}/${topic.id}`}
                            variant={isStarted ? 'primary' : 'secondary'}
                            className="w-full text-xs min-h-9"
                            data-testid={`button-read-topic-${topic.id}`}
                          >
                            <BookOpen size={14} />
                            <span>{isStarted ? 'पढ़ाई जारी रखें' : 'अध्याय पढ़ें'}</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              /* Empty State */
              <Card className="p-8 sm:p-12 text-center border-dashed" data-testid="card-empty-study-material">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                  <Search size={28} />
                </div>
                <h2 className="font-display mt-4 text-xl font-bold text-[hsl(var(--primary))] sm:text-2xl">
                  कोई अध्याय नहीं मिला
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {searchQuery
                    ? `"${searchQuery}" से मेल खाता कोई अध्याय उपलब्ध नहीं है। कृपया भिन्न खोज शब्द आज़माएं।`
                    : 'इस विषय के लिए अध्याय नोट्स तैयार किए जा रहे हैं।'}
                </p>
                <div className="mt-6 flex justify-center">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedSubjectId('all');
                    }}
                  >
                    <RotateCcw size={14} />
                    <span>सभी अध्याय देखें</span>
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </Container>
      </section>
    </Layout>
  );
}
