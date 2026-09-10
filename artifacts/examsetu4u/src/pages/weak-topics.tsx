import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Breadcrumbs, ProgressBar } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { exams, getExam, getSubject, getTopic, subjects, topics } from '@/data/curriculum';
import { getTopicPerformanceList, TopicPerformanceItem } from '@/lib/analytics';
import { loadMistakes } from '@/lib/mistakes';
import { getWeakAreas, WeakAreaItem } from '@/lib/user-progress';

export default function WeakTopicsPage() {
  const [selectedExamId, setSelectedExamId] = useState<string>('all');

  useEffect(() => {
    document.title = 'Weak Topic Practice - ExamSetu4U';
  }, []);

  const mistakes = useMemo(() => loadMistakes(), []);

  // Use existing Module 7 analytics topic performance
  const allTopicPerformances = useMemo(() => {
    return getTopicPerformanceList();
  }, []);

  // Weak topics using existing Module 7 threshold (strength === 'Weak' or 'Needs Improvement')
  const weakTopics = useMemo(() => {
    const list = allTopicPerformances.filter(
      (item) => item.strength === 'Weak' || item.strength === 'Needs Improvement' || item.accuracy < 70
    );

    // Also blend in any weak areas recorded by quiz/pyq user-progress
    const progressWeakAreas = getWeakAreas();
    progressWeakAreas.forEach((wa) => {
      const exists = list.find((item) => item.topicId === wa.topicId);
      if (!exists && wa.topicId) {
        list.push({
          topicId: wa.topicId,
          topicName: wa.topicName,
          subjectId: wa.subjectId,
          subjectName: wa.subjectName,
          examId: wa.examId,
          examName: wa.examName,
          accuracy: wa.accuracy,
          studyProgress: 0,
          questionsAttempted: wa.incorrectCount,
          questionsCorrect: 0,
          strength: wa.accuracy < 50 ? 'Weak' : 'Needs Improvement',
          url: `/study-material/${wa.examId}/${wa.subjectId}/${wa.topicId}`,
          quizUrl: wa.practiceUrl,
        });
      }
    });

    return list;
  }, [allTopicPerformances]);

  // Filter by selected exam
  const filteredWeakTopics = useMemo(() => {
    if (selectedExamId === 'all') return weakTopics;
    return weakTopics.filter((t) => t.examId === selectedExamId);
  }, [weakTopics, selectedExamId]);

  // Map mistakes count per topic
  const topicMistakesCount = useMemo(() => {
    const map: Record<string, number> = {};
    mistakes.forEach((m) => {
      if (m.topicId) {
        map[m.topicId] = (map[m.topicId] || 0) + 1;
      }
    });
    return map;
  }, [mistakes]);

  return (
    <Layout>
      {/* Header & Breadcrumbs */}
      <section className="paper-grid border-b border-[hsl(var(--border))] py-8 sm:py-12">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Analytics', href: '/analytics' },
              { label: 'Weak Topics' },
            ]}
          />

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionTitle
              eyebrow="Module 10 · Targeted Remediation"
              as="h1"
              title="कमजोर विषय अभ्यास (Weak Topic Practice)"
              description="एनालिटिक्स द्वारा चिन्हित वे प्रकरण जहाँ आपकी Quiz सटीकता 70% से कम है या गलतियाँ अधिक हुई हैं। इन पर विशेष ध्यान दें।"
            />

            <div className="flex flex-wrap items-center gap-3">
              <Button href="/mistakes" variant="secondary">
                <span>Mistake Book देखें</span>
              </Button>
              <Button href="/analytics" variant="secondary">
                <span>Analytics डैशबोर्ड</span>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12">
        <Container>
          {/* Exam Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[hsl(var(--border))] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mr-2">
              परीक्षा फ़िल्टर:
            </span>
            <button
              type="button"
              onClick={() => setSelectedExamId('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                selectedExamId === 'all'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary)/.8)]'
              }`}
            >
              सभी परीक्षाएं ({weakTopics.length})
            </button>
            {exams.map((ex) => {
              const count = weakTopics.filter((w) => w.examId === ex.id).length;
              if (count === 0 && selectedExamId !== ex.id) return null;
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setSelectedExamId(ex.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    selectedExamId === ex.id
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary)/.8)]'
                  }`}
                >
                  {ex.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Weak Topics Grid */}
          <div className="mt-8 space-y-4">
            {filteredWeakTopics.length > 0 ? (
              filteredWeakTopics.map((item) => {
                const mistakeCount = topicMistakesCount[item.topicId] || 0;
                const isVeryWeak = item.accuracy < 50;

                return (
                  <Card
                    key={`${item.examId}-${item.subjectId}-${item.topicId}`}
                    className="p-5 sm:p-6 transition hover:border-[hsl(var(--accent)/.7)] shadow-sm"
                    data-testid={`card-weak-topic-${item.topicId}`}
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                      {/* Topic Metadata & Reason */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-md bg-[hsl(var(--secondary))] px-2.5 py-0.5 font-bold text-[hsl(var(--primary))]">
                            {item.examName}
                          </span>
                          <span className="text-[hsl(var(--muted-foreground))]">
                            {item.subjectName}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 font-bold border ${
                              isVeryWeak
                                ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                                : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}
                          >
                            {isVeryWeak ? 'कमजोर (Weak)' : 'सुधार योग्य (Needs Improvement)'}
                          </span>
                        </div>

                        <h3 className="font-display mt-2 text-lg sm:text-xl font-bold text-[hsl(var(--foreground))]">
                          {item.topicName}
                        </h3>

                        {/* Explicit Reason as required by Requirement 6 */}
                        <div className="mt-3 rounded-lg bg-[hsl(var(--secondary)/.4)] p-3 border border-[hsl(var(--border))] text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 font-semibold text-[hsl(var(--foreground))]">
                            <AlertTriangle
                              size={15}
                              className={isVeryWeak ? 'text-rose-600' : 'text-amber-600'}
                            />
                            <span>कमजोरी का कारण (Diagnosis):</span>
                          </div>
                          <p className="mt-1 text-[hsl(var(--muted-foreground))] leading-relaxed">
                            {isVeryWeak
                              ? `इस topic में आपकी Quiz Accuracy बहुत कम (${item.accuracy}%) है। अवधारणाओं (Concepts) का अध्ययन पुनः करें और बुनियादी प्रश्नों का अभ्यास करें।`
                              : `इस topic में आपकी accuracy (${item.accuracy}%) कम है। थोड़े और अभ्यास और रिवीजन से यह सुरक्षित स्तर (75%+) पर पहुँच सकता है।`}
                          </p>
                        </div>
                      </div>

                      {/* Accuracy & Progress Metrics */}
                      <div className="flex shrink-0 flex-col gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 min-w-[220px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[hsl(var(--muted-foreground))] font-semibold">Quiz Accuracy:</span>
                          <span
                            className={`font-extrabold text-base ${
                              isVeryWeak ? 'text-rose-600' : 'text-amber-600'
                            }`}
                          >
                            {item.accuracy}%
                          </span>
                        </div>
                        <ProgressBar
                          progress={item.accuracy}
                          tone={isVeryWeak ? 'danger' : 'warning'}
                          ariaLabel={`Quiz accuracy for ${item.topicName}`}
                        />

                        {item.studyProgress !== undefined && item.studyProgress > 0 && (
                          <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
                            Study Progress: <strong>{item.studyProgress}%</strong>
                          </div>
                        )}

                        {mistakeCount > 0 && (
                          <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                            Mistake Book में {mistakeCount} प्रश्न दर्ज
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5 border-t border-[hsl(var(--border))] pt-4">
                      <Button
                        href={item.url}
                        variant="secondary"
                        className="text-xs min-h-9"
                        data-testid={`button-study-${item.topicId}`}
                      >
                        <BookOpen size={14} />
                        <span>अध्ययन सामग्री पढ़ें</span>
                      </Button>

                      {mistakeCount > 0 && (
                        <Button
                          href={`/mistakes/practice?topicId=${item.topicId}`}
                          variant="secondary"
                          className="text-xs min-h-9 border-rose-300 text-rose-900 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30"
                          data-testid={`button-revise-mistakes-${item.topicId}`}
                        >
                          <RotateCcw size={14} className="text-rose-600" />
                          <span>Revise Mistakes ({mistakeCount})</span>
                        </Button>
                      )}

                      <Button
                        href={item.quizUrl}
                        variant="primary"
                        className="text-xs min-h-9"
                        data-testid={`button-practice-quiz-${item.topicId}`}
                      >
                        <Play size={14} />
                        <span>Practice Quiz</span>
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              /* Requirement 17 Empty State for Weak Topics */
              <Card className="p-8 sm:p-12 text-center border-dashed" data-testid="card-empty-weak-topics">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="font-display mt-4 text-2xl font-bold text-[hsl(var(--primary))]">
                  अभी कोई weak topic नहीं मिला। आपकी preparation अच्छी चल रही है।
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                  आपकी अधिकांश क्विज़ में सटीकता 70% से अधिक है। इस गति को बनाए रखने के लिए नए विषयों के क्विज़ और PYQ अभ्यास जारी रखें।
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button href="/quiz" variant="primary">
                    <Play size={15} />
                    <span>नया Quiz शुरू करें</span>
                  </Button>
                  <Button href="/pyq" variant="secondary">
                    <span>PYQ अभ्यास</span>
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
