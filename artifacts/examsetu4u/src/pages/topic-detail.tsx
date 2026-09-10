import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileQuestion,
  FileText,
  ListChecks,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'wouter';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { Breadcrumbs, EstimatedTime, ProgressBar } from '@/components/curriculum-ui';
import { LearningPath } from '@/components/learning-path';
import { getExam, getSubject, getTopic } from '@/data/curriculum';
import { useProgress } from '@/lib/progress';
import { getTopicLearningDetails, TOPIC_STATUS_LABELS } from '@/lib/learning-path';
import NotFoundPage from '@/pages/not-found';

export default function TopicDetailPage() {
  const { examId = '', subjectId = '', topicId = '' } = useParams<{
    examId: string;
    subjectId: string;
    topicId: string;
  }>();

  const exam = getExam(examId);
  const subject = getSubject(subjectId);
  const topic = getTopic(topicId);
  const { setTopicProgress, resetTopicProgress } = useProgress();
  const [refreshKey, setRefreshKey] = useState(0);

  const topicDetails = useMemo(() => {
    if (!topic) return null;
    return getTopicLearningDetails(topic.id);
  }, [topic, refreshKey]);

  if (!exam || !subject || !topic || subject.examId !== exam.id || topic.subjectId !== subject.id) {
    return <NotFoundPage />;
  }

  if (!topicDetails) return <NotFoundPage />;

  const {
    steps,
    status,
    statusLabelHindi,
    overallProgress,
    studyMaterialProgress,
    studyMaterialStatus,
    pyqPracticed,
    pyqAttempted,
    pyqAccuracy,
    pyqStatus,
    quizAttempted,
    quizAccuracy,
    quizStatus,
    isComplete,
    nextAction,
  } = topicDetails;

  const handleManualToggle = () => {
    if (isComplete) {
      resetTopicProgress(topic.id);
    } else {
      setTopicProgress(topic.id, 100);
    }
    setRefreshKey((k) => k + 1);
  };

  return (
    <Layout>
      {/* 1. Breadcrumbs, Header & Topic Progress (Requirement 9) */}
      <section className="paper-grid border-b border-[hsl(var(--border))] py-10 sm:py-14">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Exams', href: '/exams' },
              { label: exam.name, href: `/exams/${exam.id}` },
              { label: subject.name, href: `/exams/${exam.id}/${subject.id}` },
              { label: topic.name },
            ]}
          />

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[hsl(var(--secondary))] px-2.5 py-1 text-xs font-bold text-[hsl(var(--primary))]">
                  {exam.name}
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">/</span>
                <span className="text-xs font-bold text-[hsl(var(--accent-foreground))]">
                  {subject.name}
                </span>
              </div>

              <h1 className="font-display mt-3 text-3xl font-bold tracking-[-.035em] text-[hsl(var(--primary))] sm:text-4xl">
                {topic.name}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {topic.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                    isComplete
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : status === 'IN_PROGRESS'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'
                  }`}
                >
                  {statusLabelHindi}
                </span>
                <EstimatedTime minutes={topic.estimatedMinutes} />
              </div>
            </div>

            {/* Topic Progress Card */}
            <div className="w-full lg:max-w-xs rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-2xs">
              <ProgressBar value={overallProgress} label="अध्याय संपूर्णता (Topic Progress)" />
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-[hsl(var(--border))] pt-3">
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  {isComplete ? 'पूर्ण माना गया' : 'अध्ययन प्रगति पर'}
                </span>
                <button
                  type="button"
                  onClick={handleManualToggle}
                  className="focus-ring text-xs font-bold text-[hsl(var(--primary))] hover:underline"
                >
                  {isComplete ? 'प्रगति रीसेट करें' : '100% मार्क करें'}
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Structured Learning Path Overview & Sequential Steps */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="mb-8">
            <p className="eyebrow">सीखने के चरण (Learning Steps)</p>
            <h2 className="font-display mt-2 text-2xl sm:text-3xl font-bold text-[hsl(var(--primary))]">
              क्रमबद्ध अध्ययन चरण (Study Material → PYQ → Quiz)
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
              अवधारणाओं को पढ़ें, पूर्व वर्षों के वास्तविक प्रश्नों का अभ्यास करें और क्विज़ के साथ स्कोर जांचें।
            </p>
          </div>

          {/* Learning Steps Detail Cards (Requirement 9: 1. Study Material, 2. PYQ, 3. Quiz) */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Step 1: Study Material */}
            <Card
              className={`flex flex-col justify-between p-6 transition ${
                studyMaterialStatus === 'completed'
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : studyMaterialStatus === 'in_progress'
                  ? 'border-[hsl(var(--accent))] shadow-xs'
                  : 'border-[hsl(var(--border))]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                    चरण 1 (Step 1)
                  </span>
                  {studyMaterialStatus === 'completed' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                      <Check size={12} strokeWidth={3} />
                      Completed
                    </span>
                  ) : (
                    <span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-0.5 text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
                      {studyMaterialStatus === 'in_progress' ? 'In Progress' : 'Not Started'}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                    <FileText size={20} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[hsl(var(--primary))]">
                      Study Material
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      अवधारणात्मक नोट्स व मुख्य बिंदु
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">
                    <span>नोट्स अध्ययन प्रगति</span>
                    <span>{studyMaterialProgress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        studyMaterialStatus === 'completed' ? 'bg-emerald-600' : 'bg-[hsl(var(--primary))]'
                      }`}
                      style={{ width: `${studyMaterialProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[hsl(var(--border))]">
                <Button
                  href={`/study-material/${exam.id}/${subject.id}/${topic.id}`}
                  variant={studyMaterialStatus === 'completed' ? 'secondary' : 'primary'}
                  className="w-full justify-center gap-1.5 text-xs h-9"
                  onClick={() => setTopicProgress(topic.id, Math.max(overallProgress, 25))}
                >
                  {studyMaterialStatus === 'completed' ? (
                    <>
                      <RotateCcw size={12} /> दोबारा पढ़ें (Re-read)
                    </>
                  ) : studyMaterialStatus === 'in_progress' ? (
                    <>
                      <Play size={12} className="fill-current" /> पढ़ना जारी रखें
                    </>
                  ) : (
                    <>
                      नोट्स पढ़ना शुरू करें <ArrowRight size={13} />
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Step 2: Previous Year Questions (PYQ) */}
            <Card
              className={`flex flex-col justify-between p-6 transition ${
                pyqStatus === 'completed'
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : pyqPracticed
                  ? 'border-[hsl(var(--accent))] shadow-xs'
                  : 'border-[hsl(var(--border))]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                    चरण 2 (Step 2)
                  </span>
                  {pyqStatus === 'completed' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                      <Check size={12} strokeWidth={3} />
                      Completed
                    </span>
                  ) : (
                    <span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-0.5 text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
                      {pyqPracticed ? 'In Progress' : 'Not Started'}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                    <FileQuestion size={20} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[hsl(var(--primary))]">
                      PYQ Practice
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      परीक्षा में पूछे गए पिछले प्रश्न
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">
                    <span>
                      {pyqPracticed
                        ? `${pyqAttempted} प्रश्न हल किए (${pyqAccuracy}% सटीकता)`
                        : 'अभी अभ्यास नहीं किया'}
                    </span>
                    <span>{pyqStatus === 'completed' ? '100%' : pyqPracticed ? '50%' : '0%'}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pyqStatus === 'completed' ? 'bg-emerald-600' : 'bg-[hsl(var(--primary))]'
                      }`}
                      style={{ width: pyqStatus === 'completed' ? '100%' : pyqPracticed ? '50%' : '0%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[hsl(var(--border))]">
                <Button
                  href={`/pyq/${exam.id}/${subject.id}/${topic.id}`}
                  variant={pyqStatus === 'completed' ? 'secondary' : 'primary'}
                  className="w-full justify-center gap-1.5 text-xs h-9"
                  onClick={() => setTopicProgress(topic.id, Math.max(overallProgress, 50))}
                >
                  {pyqStatus === 'completed' ? (
                    <>
                      <RotateCcw size={12} /> पुनः अभ्यास करें
                    </>
                  ) : pyqPracticed ? (
                    <>
                      <Play size={12} className="fill-current" /> Practice PYQ जारी रखें
                    </>
                  ) : (
                    <>
                      Practice PYQ <ArrowRight size={13} />
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Step 3: MCQ Quiz */}
            <Card
              className={`flex flex-col justify-between p-6 transition ${
                quizStatus === 'completed'
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : quizAttempted
                  ? 'border-[hsl(var(--accent))] shadow-xs'
                  : 'border-[hsl(var(--border))]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                    चरण 3 (Step 3)
                  </span>
                  {quizStatus === 'completed' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                      <Check size={12} strokeWidth={3} />
                      Completed
                    </span>
                  ) : (
                    <span className="rounded-full bg-[hsl(var(--secondary))] px-2.5 py-0.5 text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
                      {quizAttempted ? 'In Progress' : 'Not Started'}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                    <Brain size={20} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[hsl(var(--primary))]">
                      MCQ Quiz
                    </h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      समयबद्ध बहुविकल्पीय परीक्षा
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">
                    <span>
                      {quizAttempted
                        ? `क्विज़ सटीकता: ${quizAccuracy}%`
                        : 'अभी टेस्ट नहीं दिया'}
                    </span>
                    <span>{quizStatus === 'completed' ? '100%' : quizAttempted ? '50%' : '0%'}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        quizStatus === 'completed' ? 'bg-emerald-600' : 'bg-[hsl(var(--primary))]'
                      }`}
                      style={{ width: quizStatus === 'completed' ? '100%' : quizAttempted ? '50%' : '0%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[hsl(var(--border))]">
                <Button
                  href={`/quiz/${exam.id}/${subject.id}/${topic.id}`}
                  variant={quizStatus === 'completed' ? 'secondary' : 'primary'}
                  className="w-full justify-center gap-1.5 text-xs h-9"
                  onClick={() => setTopicProgress(topic.id, Math.max(overallProgress, 75))}
                >
                  {quizStatus === 'completed' ? (
                    <>
                      <RotateCcw size={12} /> दोबारा टेस्ट दें
                    </>
                  ) : quizAttempted ? (
                    <>
                      <Play size={12} className="fill-current" /> स्कोर सुधारें (Retake)
                    </>
                  ) : (
                    <>
                      Start Quiz <ArrowRight size={13} />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* 3. Next Recommended Action Banner */}
          <div className="mt-10 rounded-2xl border border-[hsl(var(--accent)/.5)] bg-[hsl(var(--secondary)/.3)] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--accent))]">
                  <Sparkles size={16} />
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
                    सिफारिश किया गया अगला कदम (Recommended Action)
                  </span>
                  <p className="text-base font-bold text-[hsl(var(--primary))] mt-0.5">
                    {nextAction.label}
                  </p>
                  <p className="text-xs text-[hsl(var(--foreground))] mt-0.5">
                    {nextAction.reason}
                  </p>
                </div>
              </div>

              <Button
                href={nextAction.url}
                variant="primary"
                className="text-xs h-10 px-5 shrink-0 justify-center gap-1.5 shadow-xs"
              >
                {nextAction.label} <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* 4. Bottom Topic Completion Criteria Banner (Requirement 9: only when defined learning criteria are satisfied) */}
          <div className="mt-8 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6" id="topic-completion-criteria-card">
            <h3 className="text-sm font-bold text-[hsl(var(--primary))]">
              अध्याय संपूर्णता मानदंड (Topic Completion Criteria)
            </h3>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              किसी अध्याय को 'Completed' दर्जा तभी प्राप्त होता है जब निम्न मानदंड वास्तव में पूर्ण होते हैं:
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
              <div
                className={`flex items-center gap-2 rounded-lg border p-3 ${
                  studyMaterialStatus === 'completed'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.3)] text-[hsl(var(--muted-foreground))]'
                }`}
              >
                <Check
                  size={15}
                  className={studyMaterialStatus === 'completed' ? 'text-emerald-600' : 'opacity-40'}
                />
                <span>1. Study Material पूर्ण (≥80%)</span>
              </div>

              <div
                className={`flex items-center gap-2 rounded-lg border p-3 ${
                  pyqStatus === 'completed' || pyqPracticed
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.3)] text-[hsl(var(--muted-foreground))]'
                }`}
              >
                <Check
                  size={15}
                  className={pyqStatus === 'completed' || pyqPracticed ? 'text-emerald-600' : 'opacity-40'}
                />
                <span>2. PYQ प्रश्न हल किए</span>
              </div>

              <div
                className={`flex items-center gap-2 rounded-lg border p-3 ${
                  quizStatus === 'completed' || (quizAttempted && quizAccuracy >= 50)
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.3)] text-[hsl(var(--muted-foreground))]'
                }`}
              >
                <Check
                  size={15}
                  className={
                    quizStatus === 'completed' || (quizAttempted && quizAccuracy >= 50)
                      ? 'text-emerald-600'
                      : 'opacity-40'
                  }
                />
                <span>3. Quiz में ≥50% स्कोर</span>
              </div>
            </div>

            <div className="mt-5 border-t border-[hsl(var(--border))] pt-4">
              {isComplete ? (
                <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
                  <span className="text-xs font-bold">
                    ✓ सभी मानदंड पूरे हैं! यह टॉपिक 'पूरा किया गया' (Completed) चिह्नित है।
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  वर्तमान स्थिति: <span className="font-bold text-[hsl(var(--primary))]">{statusLabelHindi}</span> ({overallProgress}% प्रगति)। ऊपर दिए गए शेष चरणों को पूरा करें।
                </p>
              )}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/exams/${exam.id}/${subject.id}`}
              className="focus-ring inline-flex items-center rounded text-sm font-bold text-[hsl(var(--primary))] hover:text-[hsl(var(--accent-foreground))]"
            >
              <ArrowRight size={15} className="mr-2 rotate-180" />
              वापस {subject.name} अध्याय सूची पर जाएं
            </Link>

            <Link
              href={`/exams/${exam.id}`}
              className="focus-ring inline-flex items-center rounded text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {exam.name} पाठ्यक्रम देखें
              <ChevronRight size={15} className="ml-1" />
            </Link>
          </div>
        </Container>
      </section>
    </Layout>
  );
}
