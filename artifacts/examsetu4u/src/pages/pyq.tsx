import { ArrowLeft, ArrowRight, BarChart3, BookOpenCheck, Check, ChevronRight, CircleAlert, RotateCcw, Search, SlidersHorizontal, Target, X } from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'wouter';
import { Breadcrumbs, ProgressBar } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { exams, getSubjectsForExam, getTopicsForSubject, getExam, getSubject, subjects, topics } from '@/data/curriculum';
import { getPYQExam, getPYQsForExam, getPYQsForSubject, getPYQsForTopic, getPYQSubject, getPYQTopic, pyqQuestions, uniquePYQYears, type PYQDifficulty, type PYQQuestion } from '@/data/pyq';
import { usePYQProgress } from '@/lib/progress';
import NotFoundPage from '@/pages/not-found';

const difficulties: PYQDifficulty[] = ['Easy', 'Moderate', 'Challenging'];
const fieldClass = 'focus-ring min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-sm text-[hsl(var(--foreground))] outline-none';

function SampleNotice({ compact = false }: { compact?: boolean }) {
  return <div className={`flex items-start gap-2 rounded-lg border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.1)] text-[hsl(var(--accent-foreground))] ${compact ? 'px-3 py-2 text-[11px]' : 'px-4 py-3 text-xs'}`} data-testid="notice-sample-data">
    <CircleAlert size={compact ? 14 : 16} className="mt-0.5 shrink-0" />
    <span><strong>Practice sample:</strong> these questions are locally authored examples, not official previous year questions.</span>
  </div>;
}

function EmptyState({ title, body, href = '/pyq', action = 'Reset filters' }: { title: string; body: string; href?: string; action?: string }) {
  return <Card className="border-dashed p-7 text-center sm:p-10" data-testid="empty-pyq-state">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Search size={20} /></div>
    <h2 className="font-display mt-5 text-2xl text-[hsl(var(--primary))]">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">{body}</p>
    <Button href={href} variant="secondary" className="mt-6" data-testid="button-empty-pyq-action"><RotateCcw size={15} />{action}</Button>
  </Card>;
}

function FilterSelect({ label, value, onChange, options, testId, disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; testId: string; disabled?: boolean }) {
  return <label className="grid gap-2 text-xs font-bold uppercase tracking-[.09em] text-[hsl(var(--muted-foreground))]"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={fieldClass} data-testid={testId}><option value="">All {label.toLowerCase()}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function QuestionCount({ count }: { count: number }) {
  return <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))]"><BookOpenCheck size={14} />{count} {count === 1 ? 'question' : 'questions'}</span>;
}

export function PYQDashboardPage() {
  const [examId, setExamId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [year, setYear] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [search, setSearch] = useState('');

  const subjectOptions = useMemo(() => subjects.filter((subject) => !examId || subject.examId === examId), [examId]);
  const topicOptions = useMemo(() => topics.filter((topic) => !subjectId || topic.subjectId === subjectId), [subjectId]);
  const years = useMemo(() => uniquePYQYears(pyqQuestions), []);
  const filteredQuestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pyqQuestions.filter((question) => {
      const matchesSearch = !query || `${question.prompt} ${question.options.map((option) => option.text).join(' ')}`.toLowerCase().includes(query);
      return (!examId || question.metadata.examId === examId)
        && (!subjectId || question.metadata.subjectId === subjectId)
        && (!topicId || question.metadata.topicId === topicId)
        && (!year || String(question.metadata.year) === year)
        && (!difficulty || question.metadata.difficulty === difficulty)
        && matchesSearch;
    });
  }, [difficulty, examId, search, subjectId, topicId, year]);

  const reset = () => {
    setExamId('');
    setSubjectId('');
    setTopicId('');
    setYear('');
    setDifficulty('');
    setSearch('');
  };

  return <Layout>
    <section className="paper-grid border-b border-[hsl(var(--border))] py-10 sm:py-14">
      <Container>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'PYQ browser' }]} />
        <div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle eyebrow="Module 4 · Practice library" as="h1" title="Previous Year Questions, organised for revision." description="Move from exam to subject to topic, then practise one focused question at a time. Filter the local sample bank by the way you actually study." />
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-sm shadow-[var(--shadow)]"><p className="eyebrow">Library pulse</p><p className="mt-2 text-2xl font-bold text-[hsl(var(--primary))]">{pyqQuestions.length}</p><p className="text-xs text-[hsl(var(--muted-foreground))]">sample questions to explore</p></div>
        </div>
        <SampleNotice />
      </Container>
    </section>
    <section className="py-10 sm:py-14">
      <Container>
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow)] sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Find a question</p><h2 className="font-display mt-1 text-2xl text-[hsl(var(--primary))]">Narrow the bank</h2></div><SlidersHorizontal className="text-[hsl(var(--accent-foreground))]" size={20} /></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FilterSelect label="Exam" value={examId} onChange={(value) => { setExamId(value); setSubjectId(''); setTopicId(''); }} options={exams.map((exam) => ({ value: exam.id, label: exam.name }))} testId="select-pyq-exam" />
            <FilterSelect label="Subject" value={subjectId} onChange={(value) => { setSubjectId(value); setTopicId(''); }} options={subjectOptions.map((subject) => ({ value: subject.id, label: subject.name }))} testId="select-pyq-subject" disabled={!subjectOptions.length} />
            <FilterSelect label="Topic" value={topicId} onChange={setTopicId} options={topicOptions.map((topic) => ({ value: topic.id, label: topic.name }))} testId="select-pyq-topic" disabled={!topicOptions.length} />
            <FilterSelect label="Year" value={year} onChange={setYear} options={years.map((item) => ({ value: String(item), label: String(item) }))} testId="select-pyq-year" />
            <FilterSelect label="Difficulty" value={difficulty} onChange={setDifficulty} options={difficulties.map((item) => ({ value: item, label: item }))} testId="select-pyq-difficulty" />
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[.09em] text-[hsl(var(--muted-foreground))]"><span>Question text</span><span className="flex min-h-11 items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try “development”" className="focus-ring min-w-0 flex-1 bg-transparent text-sm normal-case tracking-normal text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-pyq-search" /></span></label>
          </div>
          <div className="mt-5 flex flex-col gap-3 border-t border-[hsl(var(--border))] pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-[hsl(var(--muted-foreground))]" data-testid="text-pyq-filter-count"><strong className="text-[hsl(var(--primary))]">{filteredQuestions.length}</strong> matching questions</p><Button type="button" variant="text" onClick={reset} className="justify-start px-0 sm:justify-center" data-testid="button-reset-pyq-filters"><RotateCcw size={14} /> Reset filters</Button></div>
        </div>

        {filteredQuestions.length ? <div className="mt-8 grid gap-4 lg:grid-cols-2" data-testid="list-pyq-results">{filteredQuestions.map((question) => <QuestionResultCard key={question.id} question={question} />)}</div> : <div className="mt-8"><EmptyState title="No questions match that combination." body="Try opening the exam filter, removing the year, or searching for a broader phrase." /></div>}
      </Container>
    </section>
  </Layout>;
}

function QuestionResultCard({ question }: { question: PYQQuestion }) {
  const exam = getPYQExam(question.metadata.examId);
  const subject = getPYQSubject(question.metadata.subjectId);
  const topic = getPYQTopic(question.metadata.topicId);
  return <Card className="flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:shadow-[var(--shadow-md)]" data-testid={`card-pyq-result-${question.id}`}>
    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]"><span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-1">{question.metadata.year}</span><span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-1">{question.metadata.difficulty}</span><span className="text-[hsl(var(--accent-foreground))]">Sample</span></div>
    <h2 className="mt-4 text-base font-bold leading-6 text-[hsl(var(--primary))]">{question.prompt}</h2>
    <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">{exam?.name} · {subject?.name} · {topic?.name}</p>
    <div className="mt-5 flex items-center justify-between gap-3"><span className="text-xs text-[hsl(var(--muted-foreground))]">Answer hidden in practice</span><Button href={`/pyq/${question.metadata.examId}/${question.metadata.subjectId}/${question.metadata.topicId}?question=${question.id}`} variant="secondary" className="min-h-10 px-3 text-xs" data-testid={`button-practice-pyq-${question.id}`}>Practice <ArrowRight size={14} /></Button></div>
  </Card>;
}

export function PYQExamPage() {
  const { examId = '' } = useParams<{ examId: string }>();
  const exam = getExam(examId);
  const questions = useMemo(() => getPYQsForExam(examId), [examId]);
  const { summarize } = usePYQProgress();
  const summary = summarize(questions.map((question) => question.id));
  if (!exam) return <NotFoundPage />;
  const examSubjects = getSubjectsForExam(exam.id);
  const years = uniquePYQYears(questions);
  const accuracy = summary.correct + summary.incorrect ? Math.round((summary.correct / (summary.correct + summary.incorrect)) * 100) : 0;

  return <Layout>
    <section className="paper-grid border-b border-[hsl(var(--border))] py-10 sm:py-14"><Container><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'PYQ', href: '/pyq' }, { label: exam.name }]} /><div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><SectionTitle eyebrow="Exam PYQ map" as="h1" title={`${exam.name} question bank`} description={exam.description} /><Link href="/pyq" className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-[hsl(var(--primary))]"><ArrowLeft size={16} />All PYQs</Link></div><div className="mt-6"><SampleNotice /></div></Container></section>
    <section className="py-10 sm:py-14"><Container>
      {questions.length ? <><div className="grid gap-3 sm:grid-cols-4"><StatCard label="Questions" value={questions.length} icon={<BookOpenCheck size={17} />} /><StatCard label="Viewed" value={summary.viewed} icon={<Target size={17} />} /><StatCard label="Answered" value={summary.answered} icon={<Check size={17} />} /><StatCard label="Accuracy" value={`${accuracy}%`} icon={<BarChart3 size={17} />} /></div><div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Coverage by subject</p><h2 className="font-display mt-1 text-3xl text-[hsl(var(--primary))]">Pick a route into the syllabus.</h2></div><div className="text-sm text-[hsl(var(--muted-foreground))]">{years.length ? `Years represented: ${years.join(' · ')}` : 'No year metadata yet'}</div></div><div className="mt-6 grid gap-4 md:grid-cols-2">{examSubjects.map((subject) => <SubjectCoverageCard key={subject.id} subjectId={subject.id} />)}</div></> : <EmptyState title="This exam bank is being built." body="There are no local sample questions for this exam yet. Browse another exam or return to the PYQ dashboard." />}</Container></section>
  </Layout>;
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return <Card className="p-4" data-testid={`stat-pyq-${label.toLowerCase()}`}><div className="flex items-center justify-between gap-3 text-[hsl(var(--accent-foreground))]">{icon}<span className="text-[11px] font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">{label}</span></div><p className="mt-3 text-2xl font-bold text-[hsl(var(--primary))]">{value}</p></Card>;
}

function SubjectCoverageCard({ subjectId }: { subjectId: string }) {
  const subject = getPYQSubject(subjectId);
  const subjectQuestions = getPYQsForSubject(subjectId);
  const subjectTopics = getTopicsForSubject(subjectId);
  if (!subject) return null;
  return <Card className="p-5" data-testid={`card-pyq-subject-${subjectId}`}><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold text-[hsl(var(--primary))]">{subject.name}</h3><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{subject.description}</p></div><QuestionCount count={subjectQuestions.length} /></div><div className="mt-5 space-y-3">{subjectTopics.map((topic) => { const count = getPYQsForTopic(topic.id).length; return <div key={topic.id} className="flex items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-3 text-sm"><span className="truncate text-[hsl(var(--muted-foreground))]">{topic.name}</span><span className={`shrink-0 text-xs font-bold ${count ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>{count} {count === 1 ? 'question' : 'questions'}</span></div>; })}</div><Button href={`/pyq/${subject.examId}/${subject.id}`} variant="secondary" className="mt-5 w-full">Open subject <ChevronRight size={15} /></Button></Card>;
}

export function PYQSubjectPage() {
  const { examId = '', subjectId = '' } = useParams<{ examId: string; subjectId: string }>();
  const exam = getExam(examId);
  const subject = getSubject(subjectId);
  const questions = useMemo(() => getPYQsForSubject(subjectId), [subjectId]);
  if (!exam || !subject || subject.examId !== exam.id) return <NotFoundPage />;
  const subjectTopics = getTopicsForSubject(subject.id);
  const years = uniquePYQYears(questions);
  return <Layout><section className="paper-grid border-b border-[hsl(var(--border))] py-10 sm:py-14"><Container><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'PYQ', href: '/pyq' }, { label: exam.name, href: `/pyq/${exam.id}` }, { label: subject.name }]} /><div className="mt-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><SectionTitle eyebrow={`${exam.name} · Subject route`} as="h1" title={subject.name} description={subject.description} /><Button href={`/pyq/${exam.id}`} variant="secondary"><ArrowLeft size={15} />Back to exam</Button></div><div className="mt-6"><SampleNotice /></div></Container></section><section className="py-10 sm:py-14"><Container><div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[hsl(var(--muted-foreground))]"><QuestionCount count={questions.length} /><span>{years.length ? `Years: ${years.join(' · ')}` : 'Years: not available'}</span></div><div className="mt-8 grid gap-4 md:grid-cols-2">{subjectTopics.map((topic) => <TopicCoverageCard key={topic.id} examId={exam.id} subjectId={subject.id} topicId={topic.id} />)}</div></Container></section></Layout>;
}

function TopicCoverageCard({ examId, subjectId, topicId }: { examId: string; subjectId: string; topicId: string }) {
  const topic = getPYQTopic(topicId);
  const questions = getPYQsForTopic(topicId);
  if (!topic) return null;
  const years = uniquePYQYears(questions);
  return <Card className="flex flex-col p-5" data-testid={`card-pyq-topic-${topicId}`}><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Topic</p><h2 className="mt-1 text-lg font-bold text-[hsl(var(--primary))]">{topic.name}</h2></div><span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-1 text-xs font-bold text-[hsl(var(--primary))]">{questions.length}</span></div><p className="mt-3 flex-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{topic.description}</p><div className="mt-5 flex flex-wrap gap-2 text-xs text-[hsl(var(--muted-foreground))]">{years.length ? years.map((year) => <span key={year} className="rounded-full border border-[hsl(var(--border))] px-2.5 py-1">{year}</span>) : <span>No local samples yet</span>}</div>{questions.length ? <Button href={`/pyq/${examId}/${subjectId}/${topicId}`} className="mt-5 w-full">Start practice <ArrowRight size={15} /></Button> : <span className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] px-4 text-sm font-bold text-[hsl(var(--muted-foreground))]">Coming soon</span>}</Card>;
}

export function PYQPracticePage() {
  const { examId = '', subjectId = '', topicId = '' } = useParams<{ examId: string; subjectId: string; topicId: string }>();
  const exam = getPYQExam(examId);
  const subject = getPYQSubject(subjectId);
  const topic = getPYQTopic(topicId);
  const questions = useMemo(() => getPYQsForTopic(topicId), [topicId]);
  const { markPYQViewed, recordPYQAnswer, getQuestionProgress } = usePYQProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [complete, setComplete] = useState(false);
  const [session, setSession] = useState({ answered: 0, correct: 0, incorrect: 0 });
  const question = questions[currentIndex];

  useEffect(() => {
    if (question) {
      markPYQViewed(question.id);
      setSelectedOption(null);
      setShowAnswer(false);
    }
  }, [currentIndex, markPYQViewed, question]);

  if (!exam || !subject || !topic || subject.examId !== exam.id || topic.subjectId !== subject.id) return <NotFoundPage />;
  if (!questions.length) return <Layout><section className="py-12 sm:py-16"><Container><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'PYQ', href: '/pyq' }, { label: exam.name, href: `/pyq/${exam.id}` }, { label: subject.name, href: `/pyq/${exam.id}/${subject.id}` }, { label: topic.name }]} /><div className="mt-8"><EmptyState title="No practice samples for this topic yet." body="This route is ready, but local sample questions have not been added here. Choose another topic from the subject page." href={`/pyq/${exam.id}/${subject.id}`} action="Back to topics" /></div></Container></section></Layout>;

  const progress = getQuestionProgress(question.id);
  const answerQuestion = (optionId: string) => {
    if (selectedOption) return;
    const isCorrect = optionId === question.correctOptionId;
    setSelectedOption(optionId);
    setSession((current) => ({ answered: current.answered + 1, correct: current.correct + (isCorrect ? 1 : 0), incorrect: current.incorrect + (isCorrect ? 0 : 1) }));
    recordPYQAnswer(question.id, isCorrect);
  };
  const next = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((index) => index + 1);
    else setComplete(true);
  };
  const restart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowAnswer(false);
    setComplete(false);
    setSession({ answered: 0, correct: 0, incorrect: 0 });
  };

  return <Layout><section className="paper-grid border-b border-[hsl(var(--border))] py-8 sm:py-12"><Container><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'PYQ', href: '/pyq' }, { label: exam.name, href: `/pyq/${exam.id}` }, { label: subject.name, href: `/pyq/${exam.id}/${subject.id}` }, { label: topic.name }]} /><div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><SectionTitle eyebrow={`${exam.name} · ${subject.name}`} as="h1" title={`Practice: ${topic.name}`} description="Choose an option, reveal the reasoning, then move when you are ready." /><Link href={`/pyq/${exam.id}/${subject.id}`} className="focus-ring inline-flex items-center gap-2 rounded-lg text-sm font-bold text-[hsl(var(--primary))]"><ArrowLeft size={16} />Topic list</Link></div></Container></section>
    <section className="py-9 sm:py-14"><Container><div className="mx-auto max-w-3xl"><SampleNotice compact />{complete ? <PracticeSummary session={session} total={questions.length} onRestart={restart} /> : <><div className="mt-6 flex items-center justify-between gap-4"><p className="eyebrow" data-testid="text-pyq-counter">Question {currentIndex + 1} of {questions.length}</p><span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">{progress.answered ? `${progress.correct} correct in saved progress` : 'Not answered yet'}</span></div><ProgressBar value={((currentIndex + 1) / questions.length) * 100} label="Practice sequence" /><Card className="mt-6 p-5 sm:p-8" data-testid={`card-pyq-practice-${question.id}`}><div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]"><span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-1">{question.metadata.year}</span><span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-1">{question.metadata.difficulty}</span><span className="text-[hsl(var(--accent-foreground))]">{question.metadata.sourceLabel}</span></div><h2 className="mt-5 text-xl font-bold leading-8 text-[hsl(var(--primary))] sm:text-2xl">{question.prompt}</h2><div className="mt-7 grid gap-3">{question.options.map((option) => { const chosen = selectedOption === option.id; const correct = option.id === question.correctOptionId; const optionTone = showAnswer && correct ? 'border-[#5b9274] bg-[#e7f1e9]' : chosen ? (correct ? 'border-[#5b9274] bg-[#e7f1e9]' : 'border-[#bb685c] bg-[#f8e9e5]') : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'; return <button key={option.id} type="button" onClick={() => answerQuestion(option.id)} disabled={Boolean(selectedOption)} className={`focus-ring flex min-h-14 items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${optionTone} disabled:cursor-default`} data-testid={`button-pyq-option-${question.id}-${option.id}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">{option.label}</span><span className="leading-6">{option.text}</span>{showAnswer && correct && <Check className="ml-auto mt-1 shrink-0 text-[#347052]" size={17} />}{showAnswer && chosen && !correct && <X className="ml-auto mt-1 shrink-0 text-[#a34f46]" size={17} />}</button>; })}</div><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Button type="button" variant="secondary" onClick={() => setShowAnswer(true)} disabled={!selectedOption || showAnswer} data-testid="button-show-pyq-answer"><BookOpenCheck size={16} />{showAnswer ? 'Answer shown' : 'Show answer'}</Button>{selectedOption && !showAnswer && <span className="text-xs text-[hsl(var(--muted-foreground))]">Reveal the explanation before moving on.</span>}</div>{showAnswer && <div className="mt-6 grid gap-4 border-t border-[hsl(var(--border))] pt-6" data-testid="panel-pyq-explanation"><ExplanationBlock label="Why this is correct" text={question.explanation.answerReason} /><ExplanationBlock label="Important point" text={question.explanation.importantPoint} /><ExplanationBlock label="Additional fact" text={question.explanation.additionalFact} /><ExplanationBlock label="Common mistake" text={question.explanation.commonMistake} /></div>}<div className="mt-7 flex flex-col-reverse gap-3 border-t border-[hsl(var(--border))] pt-5 sm:flex-row sm:justify-between"><Button type="button" variant="text" onClick={() => { setCurrentIndex((index) => Math.max(0, index - 1)); setComplete(false); }} disabled={currentIndex === 0} data-testid="button-previous-pyq"><ArrowLeft size={15} />Previous</Button><Button type="button" onClick={next} disabled={!showAnswer} data-testid="button-next-pyq">{currentIndex === questions.length - 1 ? 'Finish practice' : 'Next question'} <ArrowRight size={15} /></Button></div></Card><div className="mt-5 flex items-center justify-between gap-3 text-xs text-[hsl(var(--muted-foreground))]"><span>Saved progress: viewed {progress.viewed ? 'yes' : 'no'} · answered {progress.answered} time{progress.answered === 1 ? '' : 's'}</span><Button type="button" variant="text" className="min-h-8 px-0 text-xs" onClick={restart} data-testid="button-reset-pyq-session"><RotateCcw size={13} />Reset session</Button></div></>}</div></Container></section></Layout>;
}

function ExplanationBlock({ label, text }: { label: string; text: string }) {
  return <div><p className="text-xs font-bold uppercase tracking-[.08em] text-[hsl(var(--accent-foreground))]">{label}</p><p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p></div>;
}

function PracticeSummary({ session, total, onRestart }: { session: { answered: number; correct: number; incorrect: number }; total: number; onRestart: () => void }) {
  const accuracy = session.answered ? Math.round((session.correct / session.answered) * 100) : 0;
  return <Card className="mt-8 p-6 text-center sm:p-10" data-testid="panel-pyq-session-summary"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Target size={25} /></div><p className="eyebrow mt-5">Session complete</p><h2 className="font-display mt-2 text-3xl text-[hsl(var(--primary))]">A useful first pass.</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[hsl(var(--muted-foreground))]">You answered {session.answered} of {total} questions in this session. Your progress is saved on this device.</p><div className="mt-7 grid grid-cols-3 gap-2 border-y border-[hsl(var(--border))] py-5"><div><p className="text-xl font-bold text-[hsl(var(--primary))]">{session.correct}</p><p className="text-[11px] uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">Correct</p></div><div><p className="text-xl font-bold text-[hsl(var(--primary))]">{session.incorrect}</p><p className="text-[11px] uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">Review</p></div><div><p className="text-xl font-bold text-[hsl(var(--primary))]">{accuracy}%</p><p className="text-[11px] uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">Accuracy</p></div></div><Button type="button" onClick={onRestart} className="mt-7" data-testid="button-restart-pyq-practice"><RotateCcw size={15} />Practice again</Button></Card>;
}