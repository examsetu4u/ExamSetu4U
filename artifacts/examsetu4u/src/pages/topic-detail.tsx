import { ArrowRight, BookOpen, Check, FileText, HelpCircle, ListChecks, RotateCcw, Sparkles } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { Breadcrumbs, ContentIcon, EstimatedTime, ProgressBar } from '@/components/curriculum-ui';
import { getExam, getSubject, getTopic } from '@/data/curriculum';
import { useProgress } from '@/lib/progress';
import NotFoundPage from '@/pages/not-found';

const contentItems = [
  { key: 'studyMaterial', type: 'study' as const, title: 'Study Material', description: 'Read concise notes and concept explanations for this topic.', icon: FileText },
  { key: 'pyq', type: 'pyq' as const, title: 'Previous Year Questions', description: 'Review question patterns and practice from previous examinations.', icon: ListChecks },
  { key: 'quiz', type: 'quiz' as const, title: 'MCQ Quiz', description: 'Test your understanding with a focused set of multiple-choice questions.', icon: HelpCircle },
  { key: 'theory', type: 'theory' as const, title: 'Theory Questions', description: 'Prepare descriptive answers and strengthen written recall.', icon: Sparkles },
] as const;

export default function TopicDetailPage() {
  const { examId = '', subjectId = '', topicId = '' } = useParams<{ examId: string; subjectId: string; topicId: string }>();
  const exam = getExam(examId);
  const subject = getSubject(subjectId);
  const topic = getTopic(topicId);
  const { getTopicProgress, setTopicProgress, resetTopicProgress } = useProgress();

  if (!exam || !subject || !topic || subject.examId !== exam.id || topic.subjectId !== subject.id) return <NotFoundPage />;

  const progress = getTopicProgress(topic.id);
  const completed = progress === 100;

  return <Layout>
    <section className="paper-grid border-b border-[hsl(var(--border))] py-10 sm:py-14">
      <Container>
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Exams', href: '/exams' }, { label: exam.name, href: `/exams/${exam.id}` }, { label: subject.name, href: `/exams/${exam.id}/${subject.id}` }, { label: topic.name }]} />
        <div className="mt-8 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle eyebrow={`${exam.name} · ${subject.name}`} as="h1" title={topic.name} description={topic.description} />
          <div className="w-full lg:max-w-xs"><ProgressBar value={progress} label="Topic progress" /><div className="mt-4 flex flex-wrap gap-2"><Button type="button" onClick={() => completed ? resetTopicProgress(topic.id) : setTopicProgress(topic.id, 100)} variant={completed ? 'secondary' : 'primary'} className="w-full sm:w-auto">{completed ? <><RotateCcw size={15} /> Reset progress</> : <><Check size={15} /> Mark as complete</>}</Button></div></div>
        </div>
      </Container>
    </section>
    <section className="py-12 sm:py-16">
      <Container>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Topic dashboard</p><h2 className="font-display mt-2 text-3xl tracking-[-.035em] text-[hsl(var(--primary))]">Choose how you want to revise.</h2></div><EstimatedTime minutes={topic.estimatedMinutes} /></div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">{contentItems.map((item) => {
          const available = topic.availability[item.key];
          return <Card key={item.key} className={`flex h-full flex-col p-5 ${available ? 'transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:shadow-[var(--shadow-md)]' : 'opacity-75'}`}>
            <div className="flex items-start justify-between gap-4"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${available ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}><ContentIcon type={item.type} /></span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${available ? 'bg-[#dcebe2] text-[#276448]' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'}`}>{available ? 'Available' : 'Coming soon'}</span></div>
            <h3 className="mt-5 text-xl font-bold text-[hsl(var(--primary))]">{item.title}</h3><p className="mt-2 flex-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{item.description}</p>
            <div className="mt-5">{available ? <Button type="button" variant="secondary" className="w-full" onClick={() => setTopicProgress(topic.id, Math.max(progress, 50))}>Open sample <ArrowRight size={15} /></Button> : <span className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[hsl(var(--secondary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--muted-foreground))]">Content will be added later</span>}</div>
          </Card>;
        })}</div>
        <div className="mt-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 sm:p-6"><div className="flex items-start gap-3"><BookOpen className="mt-0.5 shrink-0 text-[hsl(var(--accent-foreground))]" /><div><h3 className="font-bold text-[hsl(var(--primary))]">Sample content mode</h3><p className="mt-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">This Module 2 dashboard uses placeholder content cards. The data shape is ready for real notes, PYQs, quizzes and theory questions later without changing this navigation UI.</p></div></div></div>
        <Link href={`/exams/${exam.id}/${subject.id}`} className="focus-ring mt-8 inline-flex rounded text-sm font-bold text-[hsl(var(--primary))] hover:text-[hsl(var(--accent-foreground))]"><ArrowRight size={16} className="mr-2 rotate-180" />Back to topics</Link>
      </Container>
    </section>
  </Layout>;
}