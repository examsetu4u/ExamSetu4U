import { ArrowRight, BookOpen, CheckCircle2, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'wouter';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { AvailabilityList, Breadcrumbs, EstimatedTime, ProgressBar } from '@/components/curriculum-ui';
import { getExam, getSubject, getTopicsForSubject } from '@/data/curriculum';
import { useProgress } from '@/lib/progress';
import NotFoundPage from '@/pages/not-found';

export default function SubjectDetailPage() {
  const { examId = '', subjectId = '' } = useParams<{ examId: string; subjectId: string }>();
  const exam = getExam(examId);
  const subject = getSubject(subjectId);
  const { getSubjectProgress, getTopicProgress } = useProgress();
  const [query, setQuery] = useState('');
  const topics = subject && subject.examId === exam?.id ? getTopicsForSubject(subject.id) : [];
  const filteredTopics = useMemo(() => topics.filter((topic) => `${topic.name} ${topic.description}`.toLowerCase().includes(query.toLowerCase())), [query, topics]);
  
  if (!exam || !subject || subject.examId !== exam.id) return <NotFoundPage />;

  const subjectProgress = getSubjectProgress(subject.id);

  return <Layout>
    <section className="paper-grid border-b border-[hsl(var(--border))] py-10 sm:py-14">
      <Container>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Exams', href: '/exams' }, { label: exam.name, href: `/exams/${exam.id}` }, { label: subject.name }]} />
        <div className="mt-8 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle eyebrow={exam.name} as="h1" title={subject.name} description={subject.description} />
          <div className="w-full lg:max-w-xs"><ProgressBar value={subjectProgress} label="Overall subject progress" /></div>
        </div>
      </Container>
    </section>
    <section className="py-12 sm:py-16">
      <Container>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div><p className="eyebrow">Topic map</p><h2 className="font-display mt-2 text-3xl tracking-[-.035em] text-[hsl(var(--primary))]">Pick your next topic.</h2><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">{topics.length} topics organised for focused revision.</p></div>
          <label className="flex min-h-11 w-full items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 shadow-[var(--shadow)] md:max-w-xs"><Search size={16} className="text-[hsl(var(--muted-foreground))]" /><span className="sr-only">Search topics</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search topics..." className="focus-ring min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]" /></label>
        </div>
        {filteredTopics.length ? <div className="mt-8 grid gap-4">{filteredTopics.map((topic) => {
          const progress = getTopicProgress(topic.id);
          return <Card key={topic.id} className="p-5 transition hover:border-[hsl(var(--accent))] hover:shadow-[var(--shadow-md)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-bold text-[hsl(var(--primary))]">{topic.name}</h3><EstimatedTime minutes={topic.estimatedMinutes} /></div><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{topic.description}</p><div className="mt-4"><AvailabilityList availability={topic.availability} /></div></div>
              <div className="w-full lg:max-w-xs"><ProgressBar value={progress} label="Topic progress" /><Button href={`/exams/${exam.id}/${subject.id}/${topic.id}`} variant="secondary" className="mt-4 w-full">Open topic <ArrowRight size={15} /></Button></div>
            </div>
          </Card>;
        })}</div> : <div className="mt-8 rounded-xl border border-dashed border-[hsl(var(--border))] p-10 text-center"><CheckCircle2 className="mx-auto text-[hsl(var(--accent-foreground))]" /><p className="mt-3 font-semibold text-[hsl(var(--primary))]">No topic found</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Try a different search term.</p></div>}
        <Link href={`/exams/${exam.id}`} className="focus-ring mt-8 inline-flex rounded text-sm font-bold text-[hsl(var(--primary))] hover:text-[hsl(var(--accent-foreground))]"><BookOpen size={16} className="mr-2" />Back to {exam.name}</Link>
      </Container>
    </section>
  </Layout>;
}