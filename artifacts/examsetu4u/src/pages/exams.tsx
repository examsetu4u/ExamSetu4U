import { useMemo, useState } from 'react';
import { exams } from '@/data/exams';
import { Container, ExamCard, Layout, SearchBar, SectionTitle } from '@/components/site';

export default function ExamsPage() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => exams.filter((exam) => `${exam.name} ${exam.shortDescription} ${exam.subjects}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <Layout><section className="border-b border-[hsl(var(--border))] py-14 sm:py-20"><Container><SectionTitle as="h1" eyebrow="Exam library" title="Find your exam." description="Start with a familiar name. This foundation will grow with your preparation." /><div className="mt-8 max-w-xl"><SearchBar value={query} onChange={setQuery} placeholder="Search Super TET, CTET, SSC..." /></div></Container></section><section className="py-12 sm:py-16"><Container><div className="flex items-center justify-between gap-4"><p className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">{filtered.length} {filtered.length === 1 ? 'exam' : 'exams'} available</p></div>{filtered.length ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{filtered.map((exam) => <ExamCard key={exam.id} exam={exam} />)}</div> : <div className="mt-6 rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-10 text-center"><p className="font-display text-2xl text-[hsl(var(--primary))]">No exam found</p><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Try a shorter search term.</p></div>}</Container></section></Layout>;
}