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
import { getScienceChapter } from '@/data/cbse-class-10-science';
import { ScienceChapterDetail } from '@/components/cbse-science/ScienceChapterDetail';
import { getMathsChapter } from '@/data/cbse-class-10-maths';
import { MathsChapterDetail } from '@/components/cbse-maths/MathsChapterDetail';
import { getCbseSubjectConfig, getCbseChapter } from '@/data/cbse-curriculum';
import { CbseChapterDetail } from '@/components/cbse-common/CbseChapterDetail';
import { MainsAnswerWritingCard } from '@/components/mains/MainsAnswerWritingCard';

export default function TopicDetailPage() {
  const { examId = '', subjectId = '', topicId = '' } = useParams<{
    examId: string;
    subjectId: string;
    topicId: string;
  }>();

  const exam = getExam(examId);
  const subject = getSubject(subjectId, examId);
  const topic = getTopic(topicId);

  // Dedicated CBSE Class 10 Science Chapter delegation
  if (
    exam?.id === 'cbse-class-10' &&
    (subject?.id === 'cbse-class-10-science' ||
      subjectId === 'science' ||
      subjectId === 'cbse-class-10-science')
  ) {
    const sciChapter = getScienceChapter(topicId);
    if (sciChapter) {
      return (
        <ScienceChapterDetail
          chapter={sciChapter}
          examId={exam.id}
          subjectId="cbse-class-10-science"
        />
      );
    }
  }

  // Dedicated CBSE Class 10 Mathematics Chapter delegation
  if (
    exam?.id === 'cbse-class-10' &&
    (subject?.id === 'cbse-class-10-mathematics' ||
      subjectId === 'mathematics' ||
      subjectId === 'maths' ||
      subjectId === 'cbse-class-10-mathematics')
  ) {
    const mathChapter = getMathsChapter(topicId);
    if (mathChapter) {
      return (
        <MathsChapterDetail
          chapter={mathChapter}
          examId={exam.id}
          subjectId="cbse-class-10-mathematics"
        />
      );
    }
  }

  // Dedicated CBSE Board Chapter delegation (Social Science, English, Hindi, Class 12 Physics, Chemistry, Maths, Biology, etc.)
  const cbseConfig = getCbseSubjectConfig(subjectId, examId || exam?.id);
  if (cbseConfig) {
    const cbseChapter = getCbseChapter(topicId, examId || exam?.id, subjectId);
    if (cbseChapter) {
      return (
        <CbseChapterDetail
          chapter={cbseChapter}
          subjectConfig={cbseConfig}
          examId={examId || cbseConfig.examId}
          subjectId={subjectId}
        />
      );
    }
  }
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

  const isUppcsMains =
    exam.id === 'uppcs-mains' ||
    subject.name.startsWith('Mains:') ||
    subject.id.startsWith('uppcs-mains') ||
    subject.id.startsWith('gs-paper') ||
    subject.id === 'general-hindi' ||
    subject.id === 'essay';

  const isUppcsPre =
    exam.id === 'uppcs-pre' ||
    (exam.id === 'uppcs' &&
      (subject.name.startsWith('Pre:') ||
        subject.id.startsWith('pre-') ||
        subject.id === 'general-studies-1' ||
        subject.id === 'general-studies-2'));

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
      {/* 1. Breadcrumbs, Header & Topic Progress */}
      <section className="paper-grid border-b border-blue-100 bg-blue-50/40 py-10 sm:py-14">
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
                <span className="rounded-md border border-blue-200 bg-white px-2.5 py-1 text-xs font-bold text-blue-700 shadow-2xs">
                  {exam.name}
                </span>
                <span className="text-xs text-slate-400">/</span>
                <span className="text-xs font-bold text-blue-700">
                  {subject.name}
                </span>
              </div>

              <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {topic.name}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {topic.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {exam.id === 'ssc-cgl' && (
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-800">
                    100% Objective MCQ Topic
                  </span>
                )}
                {isUppcsMains && (
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-800">
                    UPPCS Mains: वर्णनात्मक उत्तर लेखन (Subjective)
                  </span>
                )}
                {isUppcsPre && (
                  <span className="rounded-full border border-blue-300 bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-800">
                    UPPCS Pre: 100% वस्तुनिष्ठ बहुविकल्पीय प्रश्न (MCQ)
                  </span>
                )}
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                    isComplete
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                      : status === 'IN_PROGRESS'
                      ? 'border border-blue-200 bg-blue-50 text-blue-800'
                      : 'border border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {statusLabelHindi}
                </span>
                <EstimatedTime minutes={topic.estimatedMinutes} />
              </div>
            </div>

            {/* Topic Progress Card */}
            <div className="w-full lg:max-w-xs rounded-2xl border border-blue-200/90 bg-white p-5 shadow-xs">
              <ProgressBar value={overallProgress} label="अध्याय संपूर्णता (Topic Progress)" />
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <span className="text-[11px] font-medium text-slate-500">
                  {isComplete ? 'पूर्ण माना गया' : 'अध्ययन प्रगति पर'}
                </span>
                <button
                  type="button"
                  onClick={handleManualToggle}
                  className="focus-ring text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
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
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {exam.id === 'ssc-cgl'
                ? '100% बहुविकल्पीय परीक्षा प्रारूप (Objective MCQ Sequence)'
                : isUppcsMains
                ? 'UPPCS मुख्य परीक्षा: वर्णनात्मक उत्तर लेखन (Subjective Mains Writing)'
                : isUppcsPre
                ? 'UPPCS प्रारंभिक परीक्षा: 100% वस्तुनिष्ठ तैयारी (Pre MCQ Pattern)'
                : 'सीखने के चरण (Learning Steps)'}
            </p>
            <h2 className="font-display mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
              {exam.id === 'ssc-cgl'
                ? 'SSC CGL टॉपिक अभ्यास (PYQ MCQs → Timed Quiz)'
                : isUppcsMains
                ? 'UPPCS Mains उत्तर लेखन अभ्यास (अभ्यास प्रश्न → टाइमर लेखन → मॉडल उत्तर)'
                : isUppcsPre
                ? 'UPPCS Pre चरणबद्ध अभ्यास (नोट्स → विगत वर्ष MCQs → निगेटिव मार्किंग टेस्ट)'
                : 'क्रमबद्ध अध्ययन चरण (Study Material → PYQ → Quiz)'}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              {exam.id === 'ssc-cgl'
                ? 'SSC CGL परीक्षा में केवल वस्तुनिष्ठ बहुविकल्पीय प्रश्न (MCQs) पूछे जाते हैं। पहले पिछले वर्षों के वास्तविक PYQ हल करें, फिर समयबद्ध क्विज़ से गति और सटीकता परखें।'
                : isUppcsMains
                ? 'UPPCS Mains में सफलता गुणवत्तापूर्ण उत्तर लेखन पर निर्भर करती है। निर्धारित शब्द सीमा (125/200 शब्द) में उत्तर लिखें, टाइमर ट्रैक करें और मॉडल उत्तर व मूल्यांकन रूब्रिक से मिलान करें।'
                : isUppcsPre
                ? 'UPPCS Pre परीक्षा 100% वस्तुनिष्ठ MCQ आधारित होती है जिसमें कथन, कारण, सुमेलन एवं CSAT प्रश्न आते हैं। 1/3 निगेटिव मार्किंग के साथ अभ्यास करें।'
                : 'अवधारणाओं को पढ़ें, पूर्व वर्षों के वास्तविक प्रश्नों का अभ्यास करें और क्विज़ के साथ स्कोर जांचें।'}
            </p>
          </div>

          {/* If UPPCS Mains, render interactive subjective answer writing card */}
          {isUppcsMains && (
            <div className="mb-10">
              <MainsAnswerWritingCard
                topicId={topic.id}
                subjectId={subject.id}
                topicName={topic.name}
                onProgressUpdated={() => {
                  setTopicProgress(topic.id, Math.max(overallProgress, 100));
                  setRefreshKey((k) => k + 1);
                }}
              />
            </div>
          )}

          {/* Learning Steps Detail Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Step 1: For SSC CGL show PYQ Practice as Step 1 or Study Material for others */}
            {exam.id === 'ssc-cgl' ? (
              <Card
                className={`flex flex-col justify-between p-6 transition hover:border-indigo-300 hover:shadow-xs ${
                  pyqStatus === 'completed'
                    ? 'border-emerald-300/80 bg-emerald-50/20'
                    : pyqPracticed
                    ? 'border-indigo-300 shadow-xs'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      चरण 1 (Step 1)
                    </span>
                    {pyqStatus === 'completed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        <Check size={12} strokeWidth={3} />
                        Completed
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {pyqPracticed ? 'In Progress' : 'Not Started'}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                      <FileQuestion size={20} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        PYQ MCQs Practice
                      </h3>
                      <p className="text-xs text-slate-500">
                        पूर्व वर्षों में पूछे गए वास्तविक MCQs
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                      <span>
                        {pyqPracticed
                          ? `${pyqAttempted} प्रश्न हल किए (${pyqAccuracy}% सटीकता)`
                          : 'अभी अभ्यास नहीं किया'}
                      </span>
                      <span className="font-bold text-indigo-700">{pyqStatus === 'completed' ? '100%' : pyqPracticed ? '50%' : '0%'}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pyqStatus === 'completed' ? 'bg-emerald-600' : 'bg-indigo-600'
                        }`}
                        style={{ width: pyqStatus === 'completed' ? '100%' : pyqPracticed ? '50%' : '0%' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button
                    href={`/pyq/${exam.id}/${subject.id}/${topic.id}`}
                    variant={pyqStatus === 'completed' ? 'secondary' : 'primary'}
                    className="w-full justify-center gap-1.5 text-xs h-9 font-bold"
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
                        PYQ MCQs हल करें <ArrowRight size={13} />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card
                className={`flex flex-col justify-between p-6 transition hover:border-blue-300 hover:shadow-xs ${
                  studyMaterialStatus === 'completed'
                    ? 'border-emerald-300/80 bg-emerald-50/20'
                    : studyMaterialStatus === 'in_progress'
                    ? 'border-blue-300 shadow-xs'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      चरण 1 (Step 1)
                    </span>
                    {studyMaterialStatus === 'completed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        <Check size={12} strokeWidth={3} />
                        Completed
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {studyMaterialStatus === 'in_progress' ? 'In Progress' : 'Not Started'}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <FileText size={20} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Study Material
                      </h3>
                      <p className="text-xs text-slate-500">
                        अवधारणात्मक नोट्स व मुख्य बिंदु
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                      <span>नोट्स अध्ययन प्रगति</span>
                      <span className="font-bold text-blue-700">{studyMaterialProgress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          studyMaterialStatus === 'completed' ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${studyMaterialProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button
                    href={`/study-material/${exam.id}/${subject.id}/${topic.id}`}
                    variant={studyMaterialStatus === 'completed' ? 'secondary' : 'primary'}
                    className="w-full justify-center gap-1.5 text-xs h-9 font-bold"
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
            )}

            {/* Step 2: For SSC CGL show Timed Topic Quiz, for others show PYQ */}
            {exam.id === 'ssc-cgl' ? (
              <Card
                className={`flex flex-col justify-between p-6 transition hover:border-sky-300 hover:shadow-xs ${
                  quizStatus === 'completed'
                    ? 'border-emerald-300/80 bg-emerald-50/20'
                    : quizAttempted
                    ? 'border-sky-300 shadow-xs'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                      चरण 2 (Step 2)
                    </span>
                    {quizStatus === 'completed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        <Check size={12} strokeWidth={3} />
                        Completed
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {quizAttempted ? 'In Progress' : 'Not Started'}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <Brain size={20} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Timed MCQ Quiz
                      </h3>
                      <p className="text-xs text-slate-500">
                        निगेटिव मार्किंग के साथ टाइमर टेस्ट
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                      <span>
                        {quizAttempted
                          ? `क्विज़ सटीकता: ${quizAccuracy}%`
                          : 'अभी टेस्ट नहीं दिया'}
                      </span>
                      <span className="font-bold text-sky-700">{quizStatus === 'completed' ? '100%' : quizAttempted ? '50%' : '0%'}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          quizStatus === 'completed' ? 'bg-emerald-600' : 'bg-sky-600'
                        }`}
                        style={{ width: quizStatus === 'completed' ? '100%' : quizAttempted ? '50%' : '0%' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button
                    href={`/quiz/${exam.id}/${subject.id}/${topic.id}`}
                    variant={quizStatus === 'completed' ? 'secondary' : 'primary'}
                    className="w-full justify-center gap-1.5 text-xs h-9 font-bold"
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
                        MCQ Quiz शुरू करें <ArrowRight size={13} />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card
                className={`flex flex-col justify-between p-6 transition hover:border-indigo-300 hover:shadow-xs ${
                  pyqStatus === 'completed'
                    ? 'border-emerald-300/80 bg-emerald-50/20'
                    : pyqPracticed
                    ? 'border-indigo-300 shadow-xs'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      चरण 2 (Step 2)
                    </span>
                    {pyqStatus === 'completed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        <Check size={12} strokeWidth={3} />
                        Completed
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {pyqPracticed ? 'In Progress' : 'Not Started'}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                      <FileQuestion size={20} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        PYQ Practice
                      </h3>
                      <p className="text-xs text-slate-500">
                        परीक्षा में पूछे गए पिछले प्रश्न
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                      <span>
                        {pyqPracticed
                          ? `${pyqAttempted} प्रश्न हल किए (${pyqAccuracy}% सटीकता)`
                          : 'अभी अभ्यास नहीं किया'}
                      </span>
                      <span className="font-bold text-indigo-700">{pyqStatus === 'completed' ? '100%' : pyqPracticed ? '50%' : '0%'}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pyqStatus === 'completed' ? 'bg-emerald-600' : 'bg-indigo-600'
                        }`}
                        style={{ width: pyqStatus === 'completed' ? '100%' : pyqPracticed ? '50%' : '0%' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button
                    href={`/pyq/${exam.id}/${subject.id}/${topic.id}`}
                    variant={pyqStatus === 'completed' ? 'secondary' : 'primary'}
                    className="w-full justify-center gap-1.5 text-xs h-9 font-bold"
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
            )}

            {/* Step 3: For SSC CGL show Full Mock & Speed Drill, for others show MCQ Quiz */}
            {exam.id === 'ssc-cgl' ? (
              <Card className="flex flex-col justify-between p-6 border-slate-200 transition hover:border-amber-300 hover:shadow-xs bg-amber-50/20">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                      चरण 3 (Step 3)
                    </span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                      Exam Simulation
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                      <Sparkles size={20} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Full Mock &amp; Speed Drill
                      </h3>
                      <p className="text-xs text-slate-500">
                        वास्तविक परीक्षा वातावरण में अभ्यास
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                      <span>गति एवं नेगेटिव मार्किंग जांच</span>
                      <span className="font-bold text-amber-700">Recommended</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button
                    href="/mock/ssc-cgl-tier1-mock-01"
                    variant="primary"
                    className="w-full justify-center gap-1.5 text-xs h-9 font-bold bg-amber-600 hover:bg-amber-700"
                  >
                    टियर-1 फुल मॉक टेस्ट <ArrowRight size={13} />
                  </Button>
                </div>
              </Card>
            ) : (
              <Card
                className={`flex flex-col justify-between p-6 transition hover:border-sky-300 hover:shadow-xs ${
                  quizStatus === 'completed'
                    ? 'border-emerald-300/80 bg-emerald-50/20'
                    : quizAttempted
                    ? 'border-sky-300 shadow-xs'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                      चरण 3 (Step 3)
                    </span>
                    {quizStatus === 'completed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        <Check size={12} strokeWidth={3} />
                        Completed
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                        {quizAttempted ? 'In Progress' : 'Not Started'}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <Brain size={20} />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        MCQ Quiz
                      </h3>
                      <p className="text-xs text-slate-500">
                        समयबद्ध बहुविकल्पीय परीक्षा
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                      <span>
                        {quizAttempted
                          ? `क्विज़ सटीकता: ${quizAccuracy}%`
                          : 'अभी टेस्ट नहीं दिया'}
                      </span>
                      <span className="font-bold text-sky-700">{quizStatus === 'completed' ? '100%' : quizAttempted ? '50%' : '0%'}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${
                          quizStatus === 'completed' ? 'bg-emerald-600' : 'bg-sky-600'
                        }`}
                        style={{ width: quizStatus === 'completed' ? '100%' : quizAttempted ? '50%' : '0%' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <Button
                    href={`/quiz/${exam.id}/${subject.id}/${topic.id}`}
                    variant={quizStatus === 'completed' ? 'secondary' : 'primary'}
                    className="w-full justify-center gap-1.5 text-xs h-9 font-bold"
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
            )}
          </div>

          {/* 3. Next Recommended Action Banner */}
          <div className="mt-10 rounded-2xl border border-blue-200 bg-blue-50/70 p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white shadow-2xs">
                  <Sparkles size={18} />
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    सिफारिश किया गया अगला कदम (Recommended Action)
                  </span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {nextAction.label}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {nextAction.reason}
                  </p>
                </div>
              </div>

              <Button
                href={nextAction.url}
                variant="primary"
                className="text-xs h-10 px-5 shrink-0 justify-center gap-1.5 shadow-xs font-bold"
              >
                {nextAction.label} <ArrowRight size={14} />
              </Button>
            </div>
          </div>

          {/* 4. Bottom Topic Completion Criteria Banner */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs" id="topic-completion-criteria-card">
            <h3 className="text-sm font-bold text-slate-900">
              अध्याय संपूर्णता मानदंड (Topic Completion Criteria)
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              किसी अध्याय को 'Completed' दर्जा तभी प्राप्त होता है जब निम्न मानदंड वास्तव में पूर्ण होते हैं:
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
              <div
                className={`flex items-center gap-2 rounded-xl border p-3 ${
                  exam.id === 'ssc-cgl' || studyMaterialStatus === 'completed'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                <Check
                  size={15}
                  className={exam.id === 'ssc-cgl' || studyMaterialStatus === 'completed' ? 'text-emerald-600' : 'opacity-40'}
                />
                <span className="font-semibold">
                  {exam.id === 'ssc-cgl' ? '1. 100% Objective MCQ प्रारूप' : '1. Study Material पूर्ण (≥80%)'}
                </span>
              </div>

              <div
                className={`flex items-center gap-2 rounded-xl border p-3 ${
                  pyqStatus === 'completed' || pyqPracticed
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                <Check
                  size={15}
                  className={pyqStatus === 'completed' || pyqPracticed ? 'text-emerald-600' : 'opacity-40'}
                />
                <span className="font-semibold">2. PYQ प्रश्न हल किए</span>
              </div>

              <div
                className={`flex items-center gap-2 rounded-xl border p-3 ${
                  quizStatus === 'completed' || (quizAttempted && quizAccuracy >= 50)
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
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
                <span className="font-semibold">3. Quiz में ≥50% स्कोर</span>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              {isComplete ? (
                <div className="flex items-center gap-3 text-emerald-700">
                  <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
                  <span className="text-xs font-bold">
                    ✓ सभी मानदंड पूरे हैं! यह टॉपिक 'पूरा किया गया' (Completed) चिह्नित है।
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  वर्तमान स्थिति: <span className="font-bold text-slate-800">{statusLabelHindi}</span> ({overallProgress}% प्रगति)। ऊपर दिए गए शेष चरणों को पूरा करें।
                </p>
              )}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/exams/${exam.id}/${subject.id}`}
              className="focus-ring inline-flex items-center rounded text-sm font-bold text-blue-700 hover:text-blue-800 transition"
            >
              <ArrowRight size={15} className="mr-2 rotate-180" />
              वापस {subject.name} अध्याय सूची पर जाएं
            </Link>

            <Link
              href={`/exams/${exam.id}`}
              className="focus-ring inline-flex items-center rounded text-sm font-bold text-slate-500 hover:text-blue-700 transition"
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
