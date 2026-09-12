import { ArrowRight, BookOpen, CheckCircle2, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { Card } from '@/components/site';
import { ProgressBar } from '@/components/curriculum-ui';
import type { ScienceChapter, ScienceChapterProgress } from '@/data/cbse-class-10-science';

interface ScienceChapterCardProps {
  chapter: ScienceChapter;
  progress: ScienceChapterProgress;
  examId?: string;
  subjectId?: string;
}

export function ScienceChapterCard({
  chapter,
  progress,
  examId = 'cbse-class-10',
  subjectId = 'cbse-class-10-science',
}: ScienceChapterCardProps) {
  const chapterUrl = `/exams/${examId}/science/${chapter.id}`;

  return (
    <Card
      id={`chapter-card-${chapter.id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:border-blue-400 hover:shadow-md sm:p-6"
    >
      <div>
        {/* Header Row: Chapter Number, Unit, Weightage */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-black text-white shadow-2xs">
              अध्याय {String(chapter.chapterNumber).padStart(2, '0')}
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {chapter.unitHindiName.split(':')[0] || `Unit ${chapter.unitNumber}`}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
            <Sparkles size={11} className="text-blue-500" />
            {chapter.weightageMarks} अंक (Marks)
          </span>
        </div>

        {/* Chapter Title */}
        <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-700 sm:text-xl">
          <Link href={chapterUrl} className="focus-ring hover:underline">
            {chapter.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs font-semibold text-slate-500">{chapter.hindiTitle}</p>

        {/* Description */}
        <p className="mt-2.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
          {chapter.shortDescription}
        </p>

        {/* Syllabus Key Topics Pill List */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {chapter.syllabusTopics.slice(0, 3).map((topic, i) => (
            <span
              key={i}
              className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
            >
              • {topic}
            </span>
          ))}
          {chapter.syllabusTopics.length > 3 && (
            <span className="inline-block rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400">
              +{chapter.syllabusTopics.length - 3} more topics
            </span>
          )}
        </div>

        {/* Progress Grid by Section */}
        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs">
          <div className="mb-2.5 flex items-center justify-between border-b border-slate-200/60 pb-2">
            <span className="font-bold text-slate-700">सेक्शन-वार प्रगति (Section Progress)</span>
            <span className="text-[11px] font-medium text-slate-500">
              {progress.availableQuestionsCount > 0
                ? `${progress.availableQuestionsCount} प्रश्न उपलब्ध`
                : '0 questions available'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
            {/* 1. Study Material */}
            <div>
              <span className="text-[11px] text-slate-500">📖 Study Material</span>
              <p className="font-bold text-slate-800">
                {progress.hasContent && progress.studyMaterialProgress > 0
                  ? `${progress.studyMaterialProgress}%`
                  : 'Coming soon'}
              </p>
            </div>

            {/* 2. MCQ */}
            <div>
              <span className="text-[11px] text-slate-500">📝 MCQ</span>
              <p className="font-bold text-slate-800">
                {progress.mcqProgress > 0
                  ? `${progress.mcqProgress}%`
                  : progress.totalMCQs && progress.totalMCQs > 0
                    ? `${progress.totalMCQs} Qs`
                    : '0 questions'}
              </p>
            </div>

            {/* 3. Assertion-Reason */}
            <div>
              <span className="text-[11px] text-slate-500">⚡ Assertion-Reason</span>
              <p className="font-bold text-slate-800">
                {progress.assertionReasonProgress > 0
                  ? `${progress.assertionReasonProgress}%`
                  : '0 questions'}
              </p>
            </div>

            {/* 4. Short Answer */}
            <div>
              <span className="text-[11px] text-slate-500">✍️ Short Answer</span>
              <p className="font-bold text-slate-800">
                {progress.shortAnswerProgress > 0
                  ? `${progress.shortAnswerProgress}%`
                  : 'Coming soon'}
              </p>
            </div>

            {/* 5. Case-Based */}
            <div>
              <span className="text-[11px] text-slate-500">📊 Case-Based</span>
              <p className="font-bold text-slate-800">
                {progress.caseBasedProgress > 0
                  ? `${progress.caseBasedProgress}%`
                  : 'Coming soon'}
              </p>
            </div>

            {/* 6. PYQ */}
            <div>
              <span className="text-[11px] text-slate-500">🏆 Board PYQ</span>
              <p className="font-bold text-slate-800">
                {progress.pyqProgress > 0
                  ? `${progress.pyqProgress}%`
                  : chapter.chapterNumber === 1
                  ? 'Sample available'
                  : '0 questions'}
              </p>
            </div>
          </div>
        </div>

        {/* Overall Chapter Progress */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">अध्याय पूर्णता (Overall Progress)</span>
            <span className="font-extrabold text-blue-700">{progress.overallProgress}%</span>
          </div>
          <ProgressBar value={progress.overallProgress} label={`${chapter.title} Progress`} />
        </div>
      </div>

      {/* Continue / Action Button */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          href={chapterUrl}
          className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-blue-800 active:scale-[0.99]"
          data-testid={`button-open-chapter-${chapter.id}`}
        >
          <span>अध्याय खोलें (Continue Learning)</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </Card>
  );
}
