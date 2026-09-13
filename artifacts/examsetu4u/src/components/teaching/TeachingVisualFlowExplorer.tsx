import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  FileQuestion,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  History,
  Layers3,
  Lightbulb,
  ListOrdered,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  TEACHING_EXAMS_HIERARCHY,
  TEACHING_EXAMS_LIST,
  TeachingExamNode,
  TeachingPaperNode,
  TeachingSubjectNode,
  TeachingChapterNode,
  TeachingTopicNode,
  TeachingSubTopicNode,
} from '@/data/teaching-curriculum-hierarchy';
import { filterQuizQuestions } from '@/data/quiz/questions';
import { QuestionType } from '@/data/quiz/types';
import { Button, Card } from '@/components/site';
import { useQuestionBank } from '@/hooks/useQuestionBank';

interface TeachingVisualFlowExplorerProps {
  initialExamId?: 'ctet' | 'uptet' | 'super-tet';
  initialPaperId?: string;
  initialSubjectId?: string;
  className?: string;
}

export function TeachingVisualFlowExplorer({
  initialExamId = 'ctet',
  initialPaperId,
  initialSubjectId,
  className = '',
}: TeachingVisualFlowExplorerProps) {
  const [, navigate] = useLocation();
  const { publishedSheetCount } = useQuestionBank();

  // Normalize list of teaching exams
  const examsList = useMemo(() => {
    if (Array.isArray(TEACHING_EXAMS_LIST) && TEACHING_EXAMS_LIST.length > 0) {
      return TEACHING_EXAMS_LIST;
    }
    if (Array.isArray(TEACHING_EXAMS_HIERARCHY) && TEACHING_EXAMS_HIERARCHY.length > 0) {
      return TEACHING_EXAMS_HIERARCHY;
    }
    return Object.values(TEACHING_EXAMS_HIERARCHY);
  }, []);

  // Active navigation states in the visual hierarchy
  const [activeExamId, setActiveExamId] = useState<'ctet' | 'uptet' | 'super-tet'>(initialExamId);
  const currentExam = useMemo(() => {
    const found = examsList.find((e) => e.id === activeExamId);
    return found || examsList[0];
  }, [examsList, activeExamId]);

  const [activePaperId, setActivePaperId] = useState<string>(() => {
    if (initialPaperId && currentExam?.papers?.some((p) => p.id === initialPaperId)) {
      return initialPaperId;
    }
    return currentExam?.papers?.[0]?.id || '';
  });

  // Keep paper in sync when exam changes
  const currentPaper = useMemo(() => {
    const found = currentExam?.papers?.find((p) => p.id === activePaperId);
    return found || currentExam?.papers?.[0];
  }, [currentExam, activePaperId]);

  const [activeSubjectId, setActiveSubjectId] = useState<string>(() => {
    if (initialSubjectId && currentPaper?.subjects?.some((s) => s.id === initialSubjectId)) {
      return initialSubjectId;
    }
    return currentPaper?.subjects?.[0]?.id || '';
  });

  // Keep subject in sync when paper changes
  const currentSubject = useMemo(() => {
    const found = currentPaper?.subjects?.find((s) => s.id === activeSubjectId);
    return found || currentPaper?.subjects?.[0];
  }, [currentPaper, activeSubjectId]);

  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const currentChapter = useMemo(() => {
    if (!activeChapterId) return currentSubject?.chapters?.[0];
    return currentSubject?.chapters?.find((c) => c.id === activeChapterId) || currentSubject?.chapters?.[0];
  }, [currentSubject, activeChapterId]);

  const [activeTopicId, setActiveTopicId] = useState<string>('');
  const currentTopic = useMemo(() => {
    if (!activeTopicId) return currentChapter?.topics?.[0];
    return currentChapter?.topics?.find((t) => t.id === activeTopicId) || currentChapter?.topics?.[0];
  }, [currentChapter, activeTopicId]);

  // Selected Question Type filter
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType | 'All'>('All');

  // Active Flow Tab: 'study' | 'quiz' | 'pyq' | 'revision'
  const [activeFlowTab, setActiveFlowTab] = useState<'study' | 'quiz' | 'pyq' | 'revision'>('study');

  // Calculate live question count for this selected node
  const questionStats = useMemo(() => {
    const allForSubject = filterQuizQuestions({
      examId: activeExamId,
      paper: currentPaper?.id,
      subjectId: currentSubject?.canonicalSubjectId || currentSubject?.id,
    });

    const pyqs = allForSubject.filter((q) => q.isPYQ || q.sourceType === 'PYQ');
    const practice = allForSubject.filter((q) => !q.isPYQ && q.sourceType !== 'PYQ');

    const byType = allForSubject.reduce<Record<string, number>>((acc, q) => {
      const type = q.questionType || 'DIRECT_MCQ';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: allForSubject.length,
      pyqs: pyqs.length,
      practice: practice.length,
      byType,
    };
  }, [activeExamId, currentPaper, currentSubject, publishedSheetCount]);

  const handleExamSelect = (examId: 'ctet' | 'uptet' | 'super-tet') => {
    setActiveExamId(examId);
    const targetExam = examsList.find((e) => e.id === examId) || examsList[0];
    const defaultPaper = targetExam?.papers?.[0];
    setActivePaperId(defaultPaper?.id || '');
    setActiveSubjectId(defaultPaper?.subjects?.[0]?.id || '');
    setActiveChapterId('');
    setActiveTopicId('');
  };

  const handlePaperSelect = (paperId: string) => {
    setActivePaperId(paperId);
    const targetPaper = currentExam?.papers?.find((p) => p.id === paperId);
    setActiveSubjectId(targetPaper?.subjects?.[0]?.id || '');
    setActiveChapterId('');
    setActiveTopicId('');
  };

  const handleSubjectSelect = (subjectId: string) => {
    setActiveSubjectId(subjectId);
    setActiveChapterId('');
    setActiveTopicId('');
  };

  if (!currentExam || !currentPaper) {
    return null;
  }

  return (
    <section className={`w-full rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden ${className}`} id="teaching-visual-flow-explorer">
      {/* Top Banner: Visual Flow Architecture Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-6 text-white sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-200">
              <Sparkles size={13} className="text-blue-300" /> Teaching Exams Visual Flow Architecture
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              CTET • UPTET • SUPER TET <span className="text-blue-300">Hierarchy Flow</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-blue-100/80 max-w-2xl">
              Single source of truth hierarchy (Exam → Paper → Subject → Chapter → Topic → Sub-topic) with integrated Study Material, MCQ Quizzes, and authentic PYQs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold backdrop-blur-xs">
              📊 Live Question Bank: <span className="text-emerald-400 font-extrabold">{questionStats.total}</span> Available
            </span>
          </div>
        </div>

        {/* Visual Architecture Breadcrumb Pipeline Diagram */}
        <div className="mt-6 flex flex-wrap items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 p-2.5 text-xs font-semibold backdrop-blur-xs">
          <span className="text-blue-200 uppercase tracking-wider">Visual Flow:</span>
          <span className="rounded bg-blue-500/30 px-2 py-0.5 text-white font-bold">{currentExam.name}</span>
          <ChevronRight size={14} className="text-blue-300" />
          <span className="rounded bg-indigo-500/30 px-2 py-0.5 text-white">{currentPaper.name}</span>
          <ChevronRight size={14} className="text-blue-300" />
          <span className="rounded bg-purple-500/30 px-2 py-0.5 text-white">{currentSubject?.name || 'Subject'}</span>
          <ChevronRight size={14} className="text-blue-300" />
          <span className="rounded bg-slate-500/30 px-2 py-0.5 text-white truncate max-w-[140px]">{currentChapter?.title || currentChapter?.name || 'All Chapters'}</span>
          <ChevronRight size={14} className="text-blue-300" />
          <span className="rounded bg-emerald-500/30 px-2 py-0.5 text-emerald-200 font-bold uppercase">{activeFlowTab}</span>
        </div>
      </div>

      {/* Level 1: Exam Selection (CTET | UPTET | SUPER TET) */}
      <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-4 sm:px-8">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          1. Select Exam (परीक्षा चयन)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {examsList.map((exam) => {
            const isSelected = exam.id === activeExamId;
            return (
              <button
                key={exam.id}
                type="button"
                onClick={() => handleExamSelect(exam.id)}
                className={`relative flex items-center justify-between rounded-xl border p-3.5 text-left transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-950 shadow-2xs ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50 text-slate-800'
                }`}
                data-testid={`exam-tab-${exam.id}`}
              >
                <div>
                  <p className="font-bold text-sm sm:text-base flex items-center gap-2">
                    {exam.name}
                    {isSelected && <CheckCircle2 size={16} className="text-blue-600" />}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{exam.subtitle || exam.tagline}</p>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 rounded-lg px-2 py-1">
                  {exam.papers?.length || 0} Papers
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Level 2: Paper Selection (Paper-I / Paper-II / Primary / Upper Primary) */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 sm:px-8">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          2. Select Paper / Level (पेपर / स्तर चयन)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentExam.papers?.map((paper) => {
            const isSelected = paper.id === activePaperId;
            return (
              <button
                key={paper.id}
                type="button"
                onClick={() => handlePaperSelect(paper.id)}
                className={`relative rounded-xl border p-3.5 text-left transition ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 shadow-2xs ring-1 ring-indigo-600'
                    : 'border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-white text-slate-800'
                }`}
                data-testid={`paper-tab-${paper.id}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/60 rounded px-2 py-0.5">
                    {paper.type || paper.shortName}
                  </span>
                  {isSelected && <CheckCircle2 size={16} className="text-indigo-600" />}
                </div>
                <p className="font-bold text-sm mt-1.5">{paper.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{paper.targetAudience || paper.targetClass || paper.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Level 3: Subject & Section Selection */}
      <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 sm:px-8">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            3. Select Subject (विषय चयन)
          </p>
          <span className="text-xs text-slate-500 font-medium">
            {currentPaper.subjects?.length || 0} Subjects available
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentPaper.subjects?.map((subj) => {
            const isSelected = subj.id === activeSubjectId;
            const isCompulsory = subj.isCompulsory ?? (subj.group === 'core');
            const isOptional = subj.isOptional ?? (subj.group !== 'core');
            return (
              <button
                key={subj.id}
                type="button"
                onClick={() => handleSubjectSelect(subj.id)}
                className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                }`}
                data-testid={`subject-button-${subj.id}`}
              >
                <span>{subj.name}</span>
                {isCompulsory && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                    Compulsory
                  </span>
                )}
                {isOptional && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    Optional
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Level 4 & 5: Chapter & Topic Breakdown with Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        {/* Left Column: Chapters & Topics Tree (5 cols) */}
        <div className="p-6 sm:p-8 lg:col-span-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Layers3 size={18} className="text-blue-600" />
              <span>Chapters & Topics</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">
              {currentSubject?.chapters?.length || 0} Chapters
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4">
            विषय के किसी भी अध्याय पर क्लिक करके उसके नोट्स, क्विज व PYQ प्रश्न देखें:
          </p>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {currentSubject?.chapters?.map((chapter, chIdx) => {
              const isChapterSelected = (currentChapter?.id === chapter.id);
              const chNum = chapter.chapterNumber ?? (chIdx + 1);
              const chTitle = chapter.title || chapter.name;
              return (
                <div
                  key={chapter.id}
                  className={`rounded-xl border transition p-3 ${
                    isChapterSelected
                      ? 'border-blue-400 bg-blue-50/60 shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveChapterId(chapter.id);
                      setActiveTopicId(chapter.topics?.[0]?.id || '');
                    }}
                    className="w-full flex items-start justify-between text-left gap-2 font-semibold text-xs sm:text-sm text-slate-800"
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700 text-[10px] font-bold">
                        {chNum}
                      </span>
                      <span>{chTitle}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`shrink-0 transition-transform ${isChapterSelected ? 'rotate-90 text-blue-600' : 'text-slate-400'}`}
                    />
                  </button>

                  {/* If chapter is selected, show nested topics */}
                  {isChapterSelected && (
                    <div className="mt-3 pl-7 border-l-2 border-blue-200 space-y-1.5">
                      {chapter.topics?.map((t) => {
                        const isTopicSelected = currentTopic?.id === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTopicId(t.id)}
                            className={`w-full text-left rounded-md px-2.5 py-1 text-xs transition flex items-center justify-between ${
                              isTopicSelected
                                ? 'bg-blue-600 text-white font-bold'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <span className="truncate">{t.name}</span>
                            {t.subTopics && t.subTopics.length > 0 && (
                              <span className={`text-[10px] px-1 rounded ${isTopicSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                                {t.subTopics.length}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual Flow Nodes (Study Material | Quiz | PYQ | Revision) (7 cols) */}
        <div className="p-6 sm:p-8 lg:col-span-7 bg-slate-50/40">
          {/* Selected Chapter/Topic Header */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs mb-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
              Selected Concept Node
            </span>
            <h4 className="mt-1.5 font-display text-lg font-bold text-slate-900">
              {currentChapter?.title || currentChapter?.name || currentSubject?.name}
            </h4>
            {currentTopic && (
              <p className="text-xs text-slate-600 mt-0.5">
                Topic: <span className="font-semibold text-slate-800">{currentTopic.name}</span>
              </p>
            )}

            {/* Sub-topics tags if present */}
            {currentTopic?.subTopics && currentTopic.subTopics.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-medium text-slate-500 self-center mr-1">Sub-topics:</span>
                {currentTopic.subTopics.map((st, sIdx) => {
                  const label = typeof st === 'string' ? st : st.name;
                  const key = typeof st === 'string' ? `${st}-${sIdx}` : st.id;
                  return (
                    <span
                      key={key}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4 Visual Architecture Pillars Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setActiveFlowTab('study')}
              className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                activeFlowTab === 'study'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-1 ring-blue-600 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BookOpen size={18} className={activeFlowTab === 'study' ? 'text-blue-600' : 'text-slate-400'} />
              <span className="text-xs mt-1.5">Study Material</span>
              <span className="text-[10px] text-slate-400">Notes & Concepts</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFlowTab('quiz')}
              className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                activeFlowTab === 'quiz'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold ring-1 ring-indigo-600 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileQuestion size={18} className={activeFlowTab === 'quiz' ? 'text-indigo-600' : 'text-slate-400'} />
              <span className="text-xs mt-1.5">Quiz Engine</span>
              <span className="text-[10px] text-slate-400">MCQ Practice</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFlowTab('pyq')}
              className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                activeFlowTab === 'pyq'
                  ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold ring-1 ring-purple-600 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <History size={18} className={activeFlowTab === 'pyq' ? 'text-purple-600' : 'text-slate-400'} />
              <span className="text-xs mt-1.5">PYQ Bank</span>
              <span className="text-[10px] text-slate-400">Previous Papers</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFlowTab('revision')}
              className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                activeFlowTab === 'revision'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-600 shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Brain size={18} className={activeFlowTab === 'revision' ? 'text-emerald-600' : 'text-slate-400'} />
              <span className="text-xs mt-1.5">Revision</span>
              <span className="text-[10px] text-slate-400">Smart Score</span>
            </button>
          </div>

          {/* Active Flow Content Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            {activeFlowTab === 'study' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">Study Material & Theory Notes</h5>
                    <p className="text-xs text-slate-500">Comprehensive structured concepts for {currentSubject?.name}</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <BookOpen size={16} />
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText size={14} className="text-blue-600" />
                      <span>1. Clear Concepts</span>
                    </p>
                    <p className="text-slate-500 mt-1">
                      पियाजे, कोहलबर्ग, वाइगोत्स्की, समावेशी शिक्षा व शिक्षण विधियों के विस्तृत नोट्स।
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Lightbulb size={14} className="text-amber-500" />
                      <span>2. Examples & Cases</span>
                    </p>
                    <p className="text-slate-500 mt-1">
                      वास्तविक कक्षा-कक्ष स्थितियों और व्यावहारिक उदाहरणों के साथ समझ।
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-indigo-600" />
                      <span>3. Important Points</span>
                    </p>
                    <p className="text-slate-500 mt-1">
                      परीक्षा हॉल में दोहराने योग्य त्वरित बिंदु और की-कॉन्सेप्ट्स।
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>4. Common Mistakes</span>
                    </p>
                    <p className="text-slate-500 mt-1">
                      अभ्यर्थियों द्वारा की जाने वाली सामान्य त्रुटियों का स्पष्टीकरण।
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <Button
                    href={`/study-material/${activeExamId}/${currentSubject?.canonicalSubjectId || currentSubject?.id}/${currentTopic?.id || 'topic-1'}`}
                    variant="primary"
                    className="text-xs h-9 font-bold"
                  >
                    <span>Read Complete Notes</span>
                    <ArrowRight size={14} />
                  </Button>
                  <Button
                    href={`/exams/${activeExamId}/${currentSubject?.canonicalSubjectId || currentSubject?.id}`}
                    variant="secondary"
                    className="text-xs h-9 font-bold"
                  >
                    <span>Explore Full Subject</span>
                  </Button>
                </div>
              </div>
            )}

            {activeFlowTab === 'quiz' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">Quiz & MCQ Test Engine</h5>
                    <p className="text-xs text-slate-500">Timed, untimed, chapter-wise and multi-type MCQ practice</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FileQuestion size={16} />
                  </span>
                </div>

                {/* Question Type Selector */}
                <div>
                  <p className="text-[11px] font-bold text-slate-600 mb-1.5">Filter by Question Format:</p>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {(['All', 'DIRECT_MCQ', 'STATEMENT_BASED', 'ASSERTION_REASON', 'CLASSROOM_SITUATION', 'MATCHING', 'DIAGRAM_BASED'] as (QuestionType | 'All')[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedQuestionType(type)}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold border transition ${
                          selectedQuestionType === type
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {type === 'All' ? 'All Formats' : type.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs text-indigo-950">
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>Target Node Questions:</span>
                    <span className="text-indigo-700 font-extrabold">{questionStats.total} Questions Available</span>
                  </div>
                  <p className="text-indigo-800/80">
                    Instant feedback with explanations, important points, common mistakes & key takeaways.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <Button
                    href={`/quiz/${activeExamId}/${currentSubject?.canonicalSubjectId || currentSubject?.id}`}
                    variant="primary"
                    className="text-xs h-9 font-bold bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Play size={14} className="fill-current" />
                    <span>Start Practice Quiz (10 Qs)</span>
                  </Button>
                  <Button
                    href={`/mock-tests`}
                    variant="secondary"
                    className="text-xs h-9 font-bold"
                  >
                    <span>Full Mock Test (150 Qs)</span>
                  </Button>
                </div>
              </div>
            )}

            {activeFlowTab === 'pyq' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">Authentic Previous Year Questions (PYQs)</h5>
                    <p className="text-xs text-slate-500">Official past papers categorized by exam year, shift & paper</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                    <History size={16} />
                  </span>
                </div>

                <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3.5 text-xs text-purple-950">
                  <p className="font-bold mb-1 flex items-center gap-1.5 text-purple-900">
                    <FileCheck2 size={15} />
                    <span>Real Exam Questions from Official Papers</span>
                  </p>
                  <p className="text-purple-800/80">
                    CTET (2024, 2023, 2022, 2021) & UPTET official papers with authentic answer keys and comprehensive explanations.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  {['2024', '2023', '2022', '2021'].map((yr) => (
                    <div key={yr} className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="font-bold text-slate-800">{yr} Series</p>
                      <p className="text-[10px] text-slate-500">Paper I & II</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <Button
                    href={`/pyq/${activeExamId}/${currentSubject?.canonicalSubjectId || currentSubject?.id}`}
                    variant="primary"
                    className="text-xs h-9 font-bold bg-purple-600 hover:bg-purple-700"
                  >
                    <History size={14} />
                    <span>Solve {currentExam.name} PYQs</span>
                  </Button>
                  <Button
                    href="/pyq"
                    variant="secondary"
                    className="text-xs h-9 font-bold"
                  >
                    <span>All Exams PYQ Hub</span>
                  </Button>
                </div>
              </div>
            )}

            {activeFlowTab === 'revision' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">Intelligent Revision & Weak Topic Analysis</h5>
                    <p className="text-xs text-slate-500">Weighted mastery engine, spaced revision cycles & error logs</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Brain size={16} />
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                    <p className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Award size={14} className="text-emerald-600" />
                      <span>Intelligent Score</span>
                    </p>
                    <p className="text-emerald-800 mt-1">
                      Quiz accuracy, topic completion, and revision retention calculated live.
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                    <p className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Target size={14} className="text-amber-600" />
                      <span>Weak Topic Analysis</span>
                    </p>
                    <p className="text-amber-800 mt-1">
                      Identifies concepts with high mistake rates and prioritizes revision.
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                    <p className="font-bold text-blue-900 flex items-center gap-1.5">
                      <RotateCcw size={14} className="text-blue-600" />
                      <span>Mistakes Practice</span>
                    </p>
                    <p className="text-blue-800 mt-1">
                      Directly re-attempt incorrect questions until mastered with 100% confidence.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <Button
                    href="/dashboard"
                    variant="primary"
                    className="text-xs h-9 font-bold bg-emerald-600 hover:bg-emerald-700"
                  >
                    <TrendingUp size={14} />
                    <span>View Intelligent Dashboard</span>
                  </Button>
                  <Button
                    href="/mistakes/practice"
                    variant="secondary"
                    className="text-xs h-9 font-bold"
                  >
                    <span>Practice Incorrect Questions</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
