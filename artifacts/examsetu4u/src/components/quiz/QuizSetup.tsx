import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  Filter,
  History,
  Play,
  RotateCcw,
  Search,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { Button, Card } from '@/components/site';
import { exams, getSubjectsForExam, getTopicsForSubject } from '@/data/curriculum';
import { filterQuizQuestions, getAllQuizQuestions } from '@/data/quiz/questions';
import type { MCQDifficulty, MCQQuestion } from '@/data/quiz/types';
import { useQuestionBank } from '@/hooks/useQuestionBank';

interface QuizSetupProps {
  initialExamId?: string;
  initialSubjectId?: string;
  initialTopicId?: string;
  onStartQuiz: (questions: MCQQuestion[], config: {
    examId: string;
    examName: string;
    subjectId: string;
    subjectName: string;
    topicId: string;
    topicName: string;
    difficulty: string;
    random: boolean;
    title: string;
  }) => void;
  onOpenHistory: () => void;
  hasHistory: boolean;
}

export function QuizSetup({
  initialExamId,
  initialSubjectId,
  initialTopicId,
  onStartQuiz,
  onOpenHistory,
  hasHistory,
}: QuizSetupProps) {
  // State for exam selection
  const [selectedExamId, setSelectedExamId] = useState<string>(() => {
    if (initialExamId && exams.some((e) => e.id === initialExamId)) return initialExamId;
    return 'super-tet'; // Default to Super TET where we have active questions
  });

  // Dynamic subjects based on exam
  const availableSubjects = useMemo(() => {
    return getSubjectsForExam(selectedExamId);
  }, [selectedExamId]);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    if (initialSubjectId) return initialSubjectId;
    // Default to teaching-skills if super-tet
    if (selectedExamId === 'super-tet') return 'super-tet-teaching-skills';
    return availableSubjects[0]?.id || '';
  });

  // Dynamic topics based on subject
  const availableTopics = useMemo(() => {
    return getTopicsForSubject(selectedSubjectId);
  }, [selectedSubjectId]);

  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    if (initialTopicId) return initialTopicId;
    return ''; // Empty means 'All Topics' in this subject
  });

  const [difficulty, setDifficulty] = useState<'All' | MCQDifficulty>('All');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isRandom, setIsRandom] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle Exam Change
  const handleExamChange = (newExamId: string) => {
    setSelectedExamId(newExamId);
    const newSubjects = getSubjectsForExam(newExamId);
    let newSubjectId = newSubjects[0]?.id || '';
    if (newExamId === 'super-tet') {
      newSubjectId = 'super-tet-teaching-skills';
    }
    setSelectedSubjectId(newSubjectId);
    setSelectedTopicId('');
  };

  // Handle Subject Change
  const handleSubjectChange = (newSubjectId: string) => {
    setSelectedSubjectId(newSubjectId);
    setSelectedTopicId('');
  };

  const { publishedSheetCount } = useQuestionBank();

  // Calculate matching questions in real-time
  const matchingQuestions = useMemo(() => {
    return filterQuizQuestions({
      examId: selectedExamId,
      subjectId: selectedSubjectId,
      topicId: selectedTopicId || undefined,
      difficulty,
      random: isRandom,
      search: searchQuery,
    });
  }, [selectedExamId, selectedSubjectId, selectedTopicId, difficulty, isRandom, searchQuery, publishedSheetCount]);

  const currentExamObj = exams.find((e) => e.id === selectedExamId);
  const currentSubjectObj = availableSubjects.find((s) => s.id === selectedSubjectId);
  const currentTopicObj = availableTopics.find((t) => t.id === selectedTopicId);

  const handleStart = () => {
    if (matchingQuestions.length === 0) return;

    // Gracefully handle question count
    const questionsToUse = matchingQuestions.slice(0, questionCount);

    const examName = currentExamObj?.name || 'ExamSetu4U';
    const subjectName = currentSubjectObj?.name || 'शिक्षण कौशल';
    const topicName = currentTopicObj?.name || 'सभी विषय (All Topics)';

    onStartQuiz(questionsToUse, {
      examId: selectedExamId,
      examName,
      subjectId: selectedSubjectId,
      subjectName,
      topicId: selectedTopicId || 'all',
      topicName,
      difficulty,
      random: isRandom,
      title: `${examName} • ${topicName}`,
    });
  };

  const examSelectId = useId();
  const subjectSelectId = useId();
  const topicSelectId = useId();
  const difficultySelectId = useId();

  return (
    <div className="space-y-6" data-testid="quiz-setup-panel">
      {/* Title & History link */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-[hsl(var(--primary))] font-bold">
            MCQ Quiz Engine
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            परीक्षा, विषय और कठिनाई स्तर चुनकर अपनी परीक्षा तैयारी का स्व-मूल्यांकन करें।
          </p>
        </div>

        {hasHistory && (
          <Button
            type="button"
            variant="secondary"
            onClick={onOpenHistory}
            className="self-start sm:self-auto text-xs"
            data-testid="button-view-history"
          >
            <History size={15} />
            <span>पिछला इतिहास देखें</span>
          </Button>
        )}
      </div>

      {/* Main Setup Form Card */}
      <Card className="p-6 sm:p-8" data-testid="quiz-setup-card">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* 1. Exam Selector */}
          <div>
            <label htmlFor={examSelectId} className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))] mb-2">
              परीक्षा चुनें (Exam)
            </label>
            <select
              id={examSelectId}
              value={selectedExamId}
              onChange={(e) => handleExamChange(e.target.value)}
              className="focus-ring w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] shadow-xs"
              data-testid="select-exam"
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Subject Selector */}
          <div>
            <label htmlFor={subjectSelectId} className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))] mb-2">
              विषय चुनें (Subject)
            </label>
            <select
              id={subjectSelectId}
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="focus-ring w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] shadow-xs"
              data-testid="select-subject"
            >
              {availableSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Topic Selector */}
          <div>
            <label htmlFor={topicSelectId} className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))] mb-2">
              टॉपिक चुनें (Topic)
            </label>
            <select
              id={topicSelectId}
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="focus-ring w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] shadow-xs"
              data-testid="select-topic"
            >
              <option value="">सभी टॉपिक (All Topics)</option>
              {availableTopics.map((top) => (
                <option key={top.id} value={top.id}>
                  {top.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Difficulty Selector */}
          <div>
            <label htmlFor={difficultySelectId} className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))] mb-2">
              कठिनाई स्तर (Difficulty)
            </label>
            <select
              id={difficultySelectId}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'All' | MCQDifficulty)}
              className="focus-ring w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] shadow-xs"
              data-testid="select-difficulty"
            >
              <option value="All">All (सभी कठिनाई स्तर)</option>
              <option value="Easy">Easy (सरल)</option>
              <option value="Moderate">Moderate (मध्यम)</option>
              <option value="Hard">Hard (कठिन)</option>
              <option value="Very Hard">Very Hard (अति कठिन)</option>
            </select>
          </div>
        </div>

        {/* Question Count & Random Selector */}
        <div className="mt-6 pt-6 border-t border-[hsl(var(--border))] grid gap-6 sm:grid-cols-2">
          {/* Question Count */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))] mb-2">
              प्रश्नों की संख्या (Number of Questions)
            </label>
            <div className="grid grid-cols-5 gap-2" role="group" aria-label="Select number of questions">
              {[10, 20, 30, 50, 100].map((num) => {
                const isSelected = questionCount === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`focus-ring rounded-lg border py-2 text-center text-xs font-bold transition ${
                      isSelected
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xs'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]'
                    }`}
                    data-testid={`btn-count-${num}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Random Toggle */}
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))] mb-2">
              प्रश्नों का यादृच्छिक क्रम (Random Questions)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRandom(true)}
                className={`focus-ring flex-1 rounded-lg border py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  isRandom
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xs'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]'
                }`}
                data-testid="btn-random-on"
              >
                <Shuffle size={14} />
                <span>चालू (ON)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRandom(false)}
                className={`focus-ring flex-1 rounded-lg border py-2 text-xs font-bold transition ${
                  !isRandom
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-xs'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]'
                }`}
                data-testid="btn-random-off"
              >
                <span>बंद (OFF)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Text Search inside questions */}
        <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]">
          <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))] mb-2">
            प्रश्नों में खोजें (Search Question Bank)
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-[hsl(var(--muted-foreground))]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="किसी सिद्धांत, मनोवैज्ञानिक, या कीवर्ड द्वारा खोजें..."
              className="focus-ring w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-10 pr-4 py-2.5 text-sm text-[hsl(var(--foreground))] shadow-xs placeholder:text-[hsl(var(--muted-foreground))]"
              data-testid="input-search-questions"
            />
          </div>
        </div>

        {/* Availability summary & Launch CTA */}
        <div className="mt-8 flex flex-col gap-4 rounded-xl bg-[hsl(var(--secondary)/.6)] p-5 sm:flex-row sm:items-center sm:justify-between border border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-sm">
              {matchingQuestions.length}
            </div>
            <div>
              <p className="text-sm font-bold text-[hsl(var(--primary))]">
                {matchingQuestions.length} प्रश्न उपलब्ध
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {matchingQuestions.length > 0
                  ? `आपके चयन अनुसार ${Math.min(matchingQuestions.length, questionCount)} प्रश्न Quiz में शामिल होंगे।`
                  : 'इस चयन के लिए कोई प्रश्न नहीं मिले। कृपया अन्य विषय या फ़िल्टर चुनें।'}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            disabled={matchingQuestions.length === 0}
            onClick={handleStart}
            className="w-full sm:w-auto px-6 py-3 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="button-start-quiz"
          >
            <Play size={18} />
            <span>Quiz शुरू करें</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
