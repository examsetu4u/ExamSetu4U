import { ArrowLeft, BookOpen, Clock, FileText, GraduationCap, Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useParams } from 'wouter';
import { MockTestCard } from '@/components/mock-test/MockTestCard';
import { Button, Card, Footer, Header } from '@/components/site';
import { getExam } from '@/data/curriculum';
import { getMockTestsForExam, normalizeExamId } from '@/data/mock/tests';

export default function ExamMockTestsPage() {
  const params = useParams<{ examId: string }>();
  const examId = params.examId || '';
  const normalizedId = normalizeExamId(examId);

  const exam = useMemo(() => getExam(normalizedId), [normalizedId]);
  const examTests = useMemo(() => getMockTestsForExam(examId), [examId]);

  if (!exam) {
    return (
      <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <Header />
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center p-8 text-center">
          <GraduationCap size={48} className="text-[hsl(var(--muted-foreground))] opacity-50 mb-3" />
          <h1 className="font-display text-2xl font-bold">परीक्षा नहीं मिली</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            अनुरोधित परीक्षा ID ({examId}) मान्य नहीं है।
          </p>
          <Button href="/mock-tests" variant="primary" className="mt-4 text-xs">
            सभी मॉक टेस्ट देखें
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-4 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <Link href="/" className="hover:text-[hsl(var(--foreground))]">होम</Link>
          <span>/</span>
          <Link href="/mock-tests" className="hover:text-[hsl(var(--foreground))]">मॉक टेस्ट</Link>
          <span>/</span>
          <span className="font-semibold text-[hsl(var(--foreground))]">{exam.name}</span>
        </div>

        {/* Exam Hero Banner */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--secondary)/.35)] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-[hsl(var(--primary))]">
                <GraduationCap size={14} />
                <span>{exam.name} टेस्ट सीरीज़</span>
              </span>
              <h1 className="font-display mt-3 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
                {exam.name} मॉक टेस्ट एवं अभ्यास परीक्षा
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                {exam.description || exam.shortDescription}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button href={`/exams/${exam.id}`} variant="outline" className="text-xs min-h-8">
                <BookOpen size={14} />
                <span>पाठ्यक्रम देखें</span>
              </Button>
              <Button href={`/pyq/${exam.id}`} variant="secondary" className="text-xs min-h-8">
                <FileText size={14} />
                <span>PYQ प्रश्न</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tests Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-[hsl(var(--foreground))]">
                उपलब्ध मॉक टेस्ट ({examTests.length})
              </h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                वास्तविक परीक्षा प्रारूप, टाइमर और नकारात्मक अंकन के साथ अभ्यास करें
              </p>
            </div>
            <Button href="/mock-tests" variant="ghost" className="text-xs">
              <ArrowLeft size={14} />
              <span>अन्य परीक्षाएं</span>
            </Button>
          </div>

          {examTests.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {examTests.map((test) => (
                <MockTestCard key={test.id} test={test} />
              ))}
            </div>
          ) : (
            <Card className="mt-6 flex flex-col items-center justify-center p-12 text-center">
              <Clock size={36} className="text-[hsl(var(--muted-foreground))] opacity-50 mb-3" />
              <h3 className="font-display text-base font-bold text-[hsl(var(--foreground))]">
                इस परीक्षा के लिए अभी मॉक टेस्ट तैयार किए जा रहे हैं
              </h3>
              <p className="mt-1 max-w-md text-xs text-[hsl(var(--muted-foreground))]">
                तब तक आप इस परीक्षा के अध्यायवार प्रश्नोत्तरी (Quiz) और विगत वर्षों के प्रश्न (PYQ) हल कर सकते हैं।
              </p>
              <div className="mt-4 flex gap-2">
                <Button href={`/quiz/${exam.id}`} variant="primary" className="text-xs">
                  क्विज़ अभ्यास करें
                </Button>
                <Button href={`/pyq/${exam.id}`} variant="outline" className="text-xs">
                  PYQ देखें
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
