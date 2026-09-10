import { ArrowRight, BookOpen, CheckCircle2, Layers3, Target } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { Button, Card, Container, Layout, SearchBar, SectionTitle } from '@/components/site';
import { AvailabilityList, ProgressBar, ProgressSummary } from '@/components/curriculum-ui';
import { getExam, getSubjectsForExam, getTopicsForSubject } from '@/data/curriculum';
import { useProgress } from '@/lib/progress';
import NotFoundPage from '@/pages/not-found';
import { useMemo, useState } from 'react';

export default function ExamDetailPage() {
  const { examId = '' } = useParams<{ examId: string }>();
  const exam = getExam(examId);
  const { getExamProgress, getSubjectProgress } = useProgress();
  const [query, setQuery] = useState('');
  const subjects = exam ? getSubjectsForExam(exam.id) : [];
  const filteredSubjects = useMemo(() => subjects.filter((subject) => `${subject.name} ${subject.description}`.toLowerCase().includes(query.toLowerCase())), [query, subjects]);
  
  if (!exam) return <NotFoundPage />;

  const totalTopics = subjects.reduce((total, subject) => total + subject.topicIds.length, 0);
  const examProgress = getExamProgress(exam.id);
  const tones = { saffron: 'bg-[#f7e3bb] text-[#825413]', teal: 'bg-[#d6ebe5] text-[#246556]', blue: 'bg-[#dce4f2] text-[#34547f]', coral: 'bg-[#f3dcd5] text-[#9a493e]' };

  return <Layout>
    <section className="hero-wash text-[hsl(var(--primary-foreground))]">
      <Container className="py-12 sm:py-16">
        <Link href="/exams" className="focus-ring inline-flex rounded text-sm font-semibold text-[hsl(var(--primary-foreground)/.72)] hover:text-[hsl(var(--primary-foreground))]">← All exams</Link>
        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${tones[exam.tone]}`}>{exam.name}</span>
            <h1 className="font-display mt-4 text-4xl leading-tight tracking-[-.04em] sm:text-5xl">{exam.name} preparation path</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[hsl(var(--primary-foreground)/.75)] sm:text-base">{exam.description}</p>
          </div>
          <ProgressSummary value={examProgress} />
        </div>
      </Container>
    </section>
    <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card)/.55)]">
      <Container className="grid gap-4 py-7 sm:grid-cols-3">
        <div className="flex items-center gap-3"><Layers3 size={20} className="text-[hsl(var(--accent-foreground))]" /><div><p className="text-2xl font-bold text-[hsl(var(--primary))]">{subjects.length}</p><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Total subjects</p></div></div>
        <div className="flex items-center gap-3"><BookOpen size={20} className="text-[hsl(var(--accent-foreground))]" /><div><p className="text-2xl font-bold text-[hsl(var(--primary))]">{totalTopics}</p><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Topics to explore</p></div></div>
        <div className="flex items-center gap-3"><Target size={20} className="text-[hsl(var(--accent-foreground))]" /><div><p className="text-2xl font-bold text-[hsl(var(--primary))]">{examProgress}%</p><p className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">Your progress</p></div></div>
      </Container>
    </section>
    <section className="py-12 sm:py-16">
      <Container>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionTitle eyebrow="Choose a subject" title="Follow one clear path at a time." description="Each subject brings its topics, available content and your saved progress into one view." />
          <div className="w-full md:max-w-xs"><SearchBar value={query} onChange={setQuery} placeholder="Search subjects..." /></div>
        </div>
        {filteredSubjects.length ? <div className="mt-8 grid gap-5 md:grid-cols-2">{filteredSubjects.map((subject) => {
          const subjectProgress = getSubjectProgress(subject.id);
          const subjectTopics = getTopicsForSubject(subject.id);
          const available = subjectTopics.filter((topic) => topic.availability.studyMaterial || topic.availability.pyq || topic.availability.quiz).length;
          return <Card key={subject.id} className="flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:shadow-[var(--shadow-md)]">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[hsl(var(--accent-foreground))]">Subject</p><h2 className="mt-2 text-xl font-bold text-[hsl(var(--primary))]">{subject.name}</h2></div><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><BookOpen size={18} /></span></div>
            <p className="mt-3 flex-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{subject.description}</p>
            <div className="mt-5 flex items-center justify-between gap-3 text-xs font-semibold text-[hsl(var(--muted-foreground))]"><span>{subjectTopics.length} topics</span><span>{available} with content</span></div>
            <div className="mt-4"><ProgressBar value={subjectProgress} label="Subject progress" /></div>
            <Button href={`/exams/${exam.id}/${subject.id}`} variant="secondary" className="mt-5 w-full">Continue subject <ArrowRight size={15} /></Button>
          </Card>;
        })}</div> : <div className="mt-8 rounded-xl border border-dashed border-[hsl(var(--border))] p-10 text-center"><CheckCircle2 className="mx-auto text-[hsl(var(--accent-foreground))]" /><p className="mt-3 font-semibold text-[hsl(var(--primary))]">No subject found</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Try a shorter search term.</p></div>}
      </Container>
    </section>
  </Layout>;
}