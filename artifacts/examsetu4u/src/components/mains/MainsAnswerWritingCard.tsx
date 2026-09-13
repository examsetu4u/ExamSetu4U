import { useState, useEffect, useMemo } from 'react';
import { Card, Button } from '@/components/site';
import { Check, Clock, BookOpen, Sparkles, ChevronDown, ChevronUp, RefreshCw, PenTool, Award } from 'lucide-react';
import { getMainsQuestionForTopic, MainsSubjectiveQuestion } from '@/data/mains/uppcs-mains-questions';
import { useProgress } from '@/lib/progress';

interface MainsAnswerWritingCardProps {
  topicId: string;
  subjectId?: string;
  topicName: string;
  onProgressUpdated?: () => void;
}

export function MainsAnswerWritingCard({
  topicId,
  subjectId,
  topicName,
  onProgressUpdated,
}: MainsAnswerWritingCardProps) {
  const { setTopicProgress } = useProgress();
  const question: MainsSubjectiveQuestion = useMemo(() => {
    return getMainsQuestionForTopic(topicId, subjectId) || {
      id: 'fallback-mains-01',
      paperName: 'मुख्य परीक्षा वर्णनात्मक प्रश्नपत्र',
      paperNumber: 'Mains Paper',
      subjectId: subjectId || 'uppcs-mains-gs',
      topicId,
      marks: 12,
      wordLimit: 200,
      questionHi: `${topicName} के प्रमुख आयामों, चुनौतियों एवं समाधान की समालोचनात्मक विवेचना कीजिए। (12 अंक / 200 शब्द)`,
      questionEn: `Critically examine the key dimensions, challenges and solutions related to ${topicName}. (12 Marks / 200 Words)`,
      syllabusCategory: 'मुख्य परीक्षा उत्तर लेखन',
      modelAnswer: {
        introduction: `${topicName} से संबंधित विषय वस्तु का संक्षिप्त संवैधानिक या सैद्धांतिक परिचय प्रस्तुत करते हुए सटीक भूमिका लिखें (~25-30 शब्द)।`,
        bodyPoints: [
          {
            heading: '1. प्रमुख आयाम एवं यथार्थ स्थिति',
            content: 'विषय के सामाजिक, आर्थिक, राजनीतिक एवं प्रशासनिक आयामों का बिंदुवार उल्लेख करें।',
            subpoints: ['तथ्य, सरकारी रिपोर्ट एवं आंकड़ों का प्रयोग करें', 'सरकारी नीतियों व संवैधानिक प्रावधानों का उल्लेख करें'],
          },
          {
            heading: '2. चुनौतियां एवं बाधाएं',
            content: 'कार्यान्वयन में आने वाली वास्तविक प्रशासनिक व वित्तीय बाधाओं की पहचान करें।',
          },
        ],
        diagramOrFlowchartHint: 'फ्लोचार्ट: इनपुट → नीतिगत समाधान → अपेक्षित परिणाम',
        conclusion: 'संतुलित, सकारात्मक एवं आगे की राह (Way Forward) दर्शाते हुए निष्कर्ष लिखें (~25-30 शब्द)।',
      },
      evaluationRubric: [
        'निर्धारित शब्द सीमा (200 शब्द) का पालन',
        'प्रस्तावना, मुख्य भाग और निष्कर्ष का सुगठित विभाजन',
        'प्रासंगिक नीतियों एवं उदाहरणों का समावेश',
        'सुस्पष्ट हस्तलेखन व प्रस्तुतीकरण',
      ],
    };
  }, [topicId, subjectId, topicName]);

  const storageKey = `mains_answer_${topicId}`;
  const [userAnswer, setUserAnswer] = useState<string>(() => {
    try {
      return localStorage.getItem(storageKey) || '';
    } catch {
      return '';
    }
  });

  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [checkedRubrics, setCheckedRubrics] = useState<Record<number, boolean>>({});
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Auto-save user answer
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, userAnswer);
    } catch {
      // Ignore localStorage errors
    }
  }, [userAnswer, storageKey]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const wordCount = useMemo(() => {
    const trimmed = userAnswer.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
  }, [userAnswer]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const handleRubricToggle = (index: number) => {
    setCheckedRubrics((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleMarkComplete = () => {
    setTopicProgress(topicId, 100);
    setIsCompleted(true);
    if (onProgressUpdated) onProgressUpdated();
  };

  const wordPercent = Math.min(100, Math.round((wordCount / question.wordLimit) * 100));

  return (
    <div className="flex flex-col gap-6" data-testid="mains-answer-writing-card">
      {/* Top Banner: Subjective Exam Notification */}
      <div className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 text-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs text-white">
              <PenTool size={20} />
            </span>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-100">
                UPPCS Mains Subjective Module
              </span>
              <h3 className="text-lg font-black text-white">
                मुख्य परीक्षा उत्तर लेखन एवं मॉडल उत्तर अभ्यास (Mains Answer Writing)
              </h3>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/20 border border-white/30 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
              {question.paperNumber}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-amber-900 shadow-2xs">
              {question.marks} अंक (Marks)
            </span>
            <span className="rounded-full bg-amber-950/40 border border-white/20 px-3 py-1 text-xs font-bold text-amber-100">
              शब्द सीमा: {question.wordLimit} शब्द
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs sm:text-sm text-amber-100/90 leading-relaxed max-w-3xl">
          UPPCS मुख्य परीक्षा पूर्णतः वर्णनात्मक (Subjective/Descriptive) है। वास्तविक परीक्षा की भांति निर्धारित समय एवं शब्द सीमा में अपना उत्तर प्रारूपित करें, फिर मॉडल उत्तर से तुलना कर स्व-मूल्यांकन करें।
        </p>
      </div>

      {/* Main Question & Answer Writing Box */}
      <Card className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
        {/* Question Header */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-500">
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700">
              {question.syllabusCategory}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleTimer}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                  isTimerRunning
                    ? 'border border-amber-300 bg-amber-50 text-amber-800'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
                title="Timer toggle"
              >
                <Clock size={13} />
                <span>{formatTime(timerSeconds)}</span>
                <span className="text-[10px] text-slate-500 font-normal">({isTimerRunning ? 'रोकें' : 'शुरू करें'})</span>
              </button>
              {timerSeconds > 0 && (
                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  title="Reset Timer"
                >
                  <RefreshCw size={13} />
                </button>
              )}
            </div>
          </div>

          <h2 className="mt-4 font-display text-lg font-bold leading-relaxed text-slate-900 sm:text-xl">
            <span className="mr-2 inline-block font-extrabold text-amber-700">प्र.</span>
            {question.questionHi}
          </h2>

          {question.questionEn && (
            <p className="mt-2 text-xs sm:text-sm text-slate-500 italic">
              {question.questionEn}
            </p>
          )}
        </div>

        {/* Writing Area */}
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600 mb-2">
            <div className="flex items-center gap-2">
              <span>आपकी उत्तर पुस्तिका (Answer Sheet):</span>
              <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                wordCount > question.wordLimit
                  ? 'border border-rose-200 bg-rose-50 text-rose-700'
                  : 'border border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                {wordCount} / {question.wordLimit} शब्द
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">
                {wordCount < question.wordLimit
                  ? `${question.wordLimit - wordCount} शब्द शेष`
                  : wordCount === question.wordLimit
                  ? 'सटीक शब्द सीमा'
                  : `+${wordCount - question.wordLimit} शब्द अधिक`}
              </span>
              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all ${
                    wordCount > question.wordLimit ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, wordPercent)}%` }}
                />
              </div>
            </div>
          </div>

          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="यहां अपना उत्तर लिखें:
1. प्रस्तावना (Introduction - ~20-25 शब्द)
2. मुख्य भाग (Body - बिंदुवार/आयाम/तथ्य/संवैधानिक प्रावधान - ~80-140 शब्द)
3. निष्कर्ष (Conclusion - सकारात्मक समाधान/आगे की राह - ~20-25 शब्द)..."
            rows={10}
            className="w-full rounded-xl border border-slate-300 p-4 text-sm sm:text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition font-sans"
            data-testid="mains-answer-textarea"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>स्वचालित स्थानीय रूप से सहेजा गया (Auto-saved locally)</span>
            <div className="flex items-center gap-3">
              {userAnswer && (
                <button
                  type="button"
                  onClick={() => setUserAnswer('')}
                  className="text-rose-600 hover:underline"
                >
                  उत्तर मिटाएं (Clear)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Model Answer Toggle Button */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            onClick={() => setShowModelAnswer(!showModelAnswer)}
            variant={showModelAnswer ? 'secondary' : 'primary'}
            className="text-xs sm:text-sm font-bold gap-2"
            data-testid="button-toggle-model-answer"
          >
            <BookOpen size={16} />
            <span>{showModelAnswer ? 'मॉडल उत्तर छिपाएं' : 'आधिकारिक मॉडल उत्तर एवं मूल्यांकन बिंदु देखें'}</span>
            {showModelAnswer ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </Button>

          <Button
            type="button"
            onClick={handleMarkComplete}
            variant="outline"
            className={`text-xs font-bold gap-1.5 ${
              isCompleted ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : ''
            }`}
            data-testid="button-complete-mains-topic"
          >
            <Check size={14} className={isCompleted ? 'text-emerald-600' : ''} />
            <span>{isCompleted ? 'उत्तर लेखन पूर्ण माना गया' : 'अभ्यास पूर्ण चिह्नित करें (100%)'}</span>
          </Button>
        </div>

        {/* Structured Model Answer Panel */}
        {showModelAnswer && (
          <div className="mt-6 rounded-2xl border-2 border-blue-200 bg-blue-50/30 p-5 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2 text-blue-900">
              <Sparkles size={18} className="text-blue-600" />
              <h3 className="text-base sm:text-lg font-black">
                मानक मॉडल उत्तर (Official Structured Model Answer)
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              UPPCS मुख्य परीक्षा की आदर्श उत्तर संरचना: भूमिका → बहुआयामी मुख्य भाग → संतुलित निष्कर्ष
            </p>

            {/* 1. Introduction */}
            <div className="mt-5 rounded-xl border border-blue-200/80 bg-white p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">
                1. भूमिका / प्रस्तावना (Introduction ~25 शब्द)
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">
                {question.modelAnswer.introduction}
              </p>
            </div>

            {/* 2. Body Points */}
            <div className="mt-4 flex flex-col gap-3">
              {question.modelAnswer.bodyPoints.map((bp, idx) => (
                <div key={idx} className="rounded-xl border border-blue-200/80 bg-white p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    {bp.heading}
                  </h4>
                  <p className="mt-1 text-sm text-slate-800 leading-relaxed">
                    {bp.content}
                  </p>
                  {bp.subpoints && bp.subpoints.length > 0 && (
                    <ul className="mt-2.5 flex flex-col gap-1.5 pl-4 text-xs sm:text-sm text-slate-700">
                      {bp.subpoints.map((sub, sidx) => (
                        <li key={sidx} className="list-disc leading-relaxed">
                          {sub}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Diagram or Flowchart Hint */}
            {question.modelAnswer.diagramOrFlowchartHint && (
              <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5 text-xs text-indigo-950 font-medium">
                <span className="font-bold text-indigo-700">💡 फ्लोचार्ट/डायग्राम संकेत:</span>{' '}
                {question.modelAnswer.diagramOrFlowchartHint}
              </div>
            )}

            {/* 3. Conclusion */}
            <div className="mt-4 rounded-xl border border-blue-200/80 bg-white p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                3. निष्कर्ष / आगे की राह (Conclusion ~25 शब्द)
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-800">
                {question.modelAnswer.conclusion}
              </p>
            </div>

            {/* 4. Self-Evaluation Rubric Checklist */}
            <div className="mt-6 pt-5 border-t border-blue-200">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-blue-700" />
                <h4 className="text-sm font-bold text-slate-900">
                  स्व-मूल्यांकन चेकलिस्ट (Self-Evaluation Rubric)
                </h4>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                अपने लिखे उत्तर की तुलना मॉडल उत्तर से करें और उपयुक्त बिंदुओं पर टिक करें:
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {question.evaluationRubric.map((item, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs font-medium cursor-pointer transition ${
                      checkedRubrics[idx]
                        ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(checkedRubrics[idx])}
                      onChange={() => handleRubricToggle(idx)}
                      className="mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
