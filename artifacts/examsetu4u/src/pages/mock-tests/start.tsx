import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  HelpCircle,
  Play,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { Button, Card, Footer, Header } from '@/components/site';
import { getExam, getSubject } from '@/data/curriculum';
import { getMockTestById, getQuestionsForMockTest } from '@/data/mock/tests';
import type { MockActiveAttempt, MockAnswer } from '@/data/mock/types';
import {
  clearActiveMockAttempt,
  loadActiveMockAttempt,
  saveActiveMockAttempt,
} from '@/lib/mock-test-storage';

export default function MockTestStartPage() {
  const params = useParams<{ testId: string }>();
  const testId = params.testId || '';
  const [, setLocation] = useLocation();

  const test = useMemo(() => getMockTestById(testId), [testId]);
  const exam = useMemo(() => (test ? getExam(test.examId) : undefined), [test]);
  const activeAttempt = useMemo(() => loadActiveMockAttempt(), []);
  const hasActiveForThis = Boolean(activeAttempt && activeAttempt.testId === testId && !activeAttempt.isFinished);

  // Check questions available for this test
  const availableQuestions = useMemo(() => {
    if (!test) return [];
    return getQuestionsForMockTest(test);
  }, [test]);

  const maxMarks = test ? test.questionCount * test.marksPerQuestion : 0;

  // Resolve subject display names
  const subjectNames = useMemo(() => {
    if (!test || !test.subjects) return [];
    return test.subjects.map((sId) => {
      const s = getSubject(sId);
      return s ? s.name : sId;
    });
  }, [test]);

  // Handle Starting a Fresh Test
  const handleStartFresh = () => {
    if (!test || availableQuestions.length === 0) return;

    const durationMs = test.durationMinutes * 60 * 1000;
    const now = Date.now();

    // Prepare initial answer records
    const answersRecord: Record<string, MockAnswer> = {};
    availableQuestions.forEach((q, index) => {
      answersRecord[q.id] = {
        questionId: q.id,
        visited: index === 0, // First question is visited immediately
        answered: false,
        markedForReview: false,
      };
    });

    const newAttempt: MockActiveAttempt = {
      attemptId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      testId: test.id,
      examId: test.examId,
      testTitle: test.title,
      startedAt: new Date().toISOString(),
      endTime: now + durationMs,
      durationMinutes: test.durationMinutes,
      currentIndex: 0,
      questionIds: availableQuestions.map((q) => q.id),
      answers: answersRecord,
      isFinished: false,
    };

    saveActiveMockAttempt(newAttempt);
    setLocation(`/mock-tests/live/${test.id}`);
  };

  // Handle Resuming an Active Test
  const handleResume = () => {
    if (!test) return;
    setLocation(`/mock-tests/live/${test.id}`);
  };

  if (!test) {
    return (
      <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <Header />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-8 text-center">
          <AlertCircle size={48} className="text-rose-500 mb-3" />
          <h1 className="font-display text-2xl font-bold">मॉक टेस्ट नहीं मिला</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            अनुरोधित मॉक टेस्ट ({testId}) उपलब्ध नहीं है या हटा दिया गया है।
          </p>
          <Button href="/mock-tests" variant="primary" className="mt-4 text-xs">
            मॉक टेस्ट सूची पर लौटें
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Empty State Check (Requirement 27)
  const isQuestionEmpty = availableQuestions.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <Link href="/" className="hover:text-[hsl(var(--foreground))]">होम</Link>
          <span>/</span>
          <Link href="/mock-tests" className="hover:text-[hsl(var(--foreground))]">मॉक टेस्ट</Link>
          <span>/</span>
          <span className="font-semibold text-[hsl(var(--foreground))] truncate max-w-xs">{test.title}</span>
        </div>

        {/* Test Overview Card */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="rounded-md bg-[hsl(var(--secondary))] px-3 py-1 font-bold text-[hsl(var(--primary))]">
              {exam?.name || test.examId}
            </span>
            <span className="rounded-md bg-amber-50 px-2.5 py-1 font-bold text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
              कठिनाई: {test.difficulty}
            </span>
          </div>

          <h1 className="font-display mt-3 text-2xl font-black text-[hsl(var(--foreground))] sm:text-3xl">
            {test.title}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
            {test.description}
          </p>

          {/* Test Specs Grid (Requirement 4) */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.35)] p-4 text-xs">
            <div>
              <span className="text-[hsl(var(--muted-foreground))] block">कुल प्रश्न (Questions):</span>
              <p className="text-base font-black text-[hsl(var(--foreground))] mt-0.5">
                {test.questionCount} प्रश्न
              </p>
            </div>
            <div>
              <span className="text-[hsl(var(--muted-foreground))] block">समय सीमा (Duration):</span>
              <p className="text-base font-black text-[hsl(var(--foreground))] mt-0.5">
                {test.durationMinutes} मिनट
              </p>
            </div>
            <div>
              <span className="text-[hsl(var(--muted-foreground))] block">पूर्णांक (Total Marks):</span>
              <p className="text-base font-black text-[hsl(var(--foreground))] mt-0.5">
                {maxMarks} अंक
              </p>
            </div>
            <div>
              <span className="text-[hsl(var(--muted-foreground))] block">नेगेटिव मार्किंग (Negative):</span>
              <p className={`text-base font-black mt-0.5 ${test.negativeMarking ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {test.negativeMarking ? `-${test.negativeMarks} अंक` : 'नहीं (None)'}
              </p>
            </div>
          </div>

          {/* Subjects Included */}
          {subjectNames.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[hsl(var(--foreground))]">सम्मिलित विषय:</span>
              {subjectNames.map((name, i) => (
                <span
                  key={i}
                  className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.4)] px-2.5 py-1 text-[hsl(var(--foreground))]"
                >
                  {name}
                </span>
              ))}
            </div>
          )}

          {/* Active In-Progress Banner */}
          {hasActiveForThis && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs dark:border-amber-900/60 dark:bg-amber-950/30">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <RotateCcw size={16} className="text-amber-600 animate-spin" />
                <div>
                  <p className="font-bold">एक सक्रिय टेस्ट सत्र पहले से चल रहा है</p>
                  <p className="text-[11px] opacity-80">आप इस टेस्ट को वहीं से जारी रख सकते हैं या पुनः प्रारंभ कर सकते हैं।</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleResume}
                  variant="primary"
                  className="text-xs min-h-8 bg-amber-600 hover:bg-amber-700 text-white"
                  data-testid="button-resume-test"
                >
                  <RotateCcw size={14} />
                  <span>Resume Test</span>
                </Button>
                <Button
                  onClick={handleStartFresh}
                  variant="outline"
                  className="text-xs min-h-8"
                  data-testid="button-restart-test"
                >
                  <span>Start Fresh</span>
                </Button>
              </div>
            </div>
          )}

          {/* Instructions Box (Requirement 4) */}
          <div className="mt-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="text-sm font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
              <HelpCircle size={16} className="text-[hsl(var(--primary))]" />
              <span>महत्वपूर्ण परीक्षा निर्देश (Examination Instructions)</span>
            </h2>

            <ul className="mt-3 space-y-2 text-xs text-[hsl(var(--muted-foreground))] leading-relaxed list-disc list-inside">
              {test.instructions.map((inst, index) => (
                <li key={index} className="text-[hsl(var(--foreground))]">
                  {inst}
                </li>
              ))}
              <li>
                प्रत्येक प्रश्न के 4 विकल्प हैं (A, B, C, D)। सही विकल्प चुनकर <strong>Save & Next</strong> दबाएं।
              </li>
              <li>
                परीक्षा के दौरान सही उत्तर अथवा व्याख्या प्रदर्शित नहीं की जाएगी। सबमिशन के पश्चात विस्तृत विश्लेषण मिलेगा।
              </li>
              <li>
                समय समाप्त होते ही आपका टेस्ट स्वतः सबमिट हो जाएगा।
              </li>
            </ul>
          </div>

          {/* Empty State Check if questions not available (Requirement 27) */}
          {isQuestionEmpty ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900/40 dark:bg-amber-950/20">
              <AlertCircle size={32} className="mx-auto text-amber-600 mb-2" />
              <h3 className="font-display text-base font-bold text-amber-900 dark:text-amber-200">
                इस Mock Test के लिए अभी पर्याप्त प्रश्न उपलब्ध नहीं हैं।
              </h3>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                हमारी टीम इस टेस्ट के लिए अद्यतन प्रश्न बैंक तैयार कर रही है। कृपया अन्य उपलब्ध क्विज़ या PYQ का अभ्यास करें।
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Button href={`/quiz/${test.examId}`} variant="primary" className="text-xs">
                  <BookOpen size={14} />
                  <span>Explore Practice (अभ्यास देखें)</span>
                </Button>
                <Button href="/mock-tests" variant="outline" className="text-xs">
                  अन्य मॉक टेस्ट
                </Button>
              </div>
            </div>
          ) : (
            /* Action Buttons (Requirement 4: Start Test and Back) */
            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[hsl(var(--border))] pt-6">
              <Button href="/mock-tests" variant="outline" className="text-xs min-h-10">
                <ArrowLeft size={14} />
                <span>Back (वापस जाएं)</span>
              </Button>

              <div className="flex items-center gap-2">
                {hasActiveForThis ? (
                  <Button
                    onClick={handleResume}
                    variant="primary"
                    className="text-xs min-h-10 bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
                    data-testid="button-start-test-action"
                  >
                    <RotateCcw size={15} />
                    <span>Resume Active Test</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleStartFresh}
                    variant="primary"
                    className="text-xs min-h-10 w-full sm:w-auto font-bold px-6"
                    data-testid="button-start-test-action"
                  >
                    <Play size={15} />
                    <span>Start Test (परीक्षा प्रारंभ करें)</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
