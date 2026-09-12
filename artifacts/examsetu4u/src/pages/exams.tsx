import { useMemo, useState } from 'react';
import { exams } from '@/data/exams';
import { Container, ExamCard, Layout, SearchBar, SectionTitle, Button } from '@/components/site';
import { BookOpen } from 'lucide-react';

export default function ExamsPage() {
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () =>
      exams.filter((exam) =>
        `${exam.name} ${exam.shortDescription} ${exam.subjects}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <Layout>
      <section className="hero-wash text-white py-12 sm:py-16">
        <Container>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur-xs">
            Exam Library
          </span>
          <h1 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Find your <span className="text-blue-300">exam.</span>
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-blue-100/90 max-w-2xl leading-relaxed">
            Start with a familiar exam name. Access comprehensive subject notes, past year questions, and chapter-wise mock tests.
          </p>
          <div className="mt-7 max-w-xl">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search Super TET, CTET, SSC, UPTET..."
            />
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold text-slate-600">
              <span className="text-blue-700">{filtered.length}</span> {filtered.length === 1 ? 'exam' : 'exams'} available
            </p>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>

          {filtered.length ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50/30 p-12 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <BookOpen size={24} />
              </span>
              <p className="font-display mt-4 text-xl font-bold text-slate-900">No matching exam found</p>
              <p className="mt-2 text-sm text-slate-600">
                Try searching for general keywords like "TET", "Police", "Teaching", or "SSC".
              </p>
              <div className="mt-5">
                <Button onClick={() => setQuery('')} variant="secondary" className="text-xs font-bold">
                  View all exams
                </Button>
              </div>
            </div>
          )}
        </Container>
      </section>
    </Layout>
  );
}
