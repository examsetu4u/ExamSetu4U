import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { Card } from '@/components/site';
import { ProgressBar } from '@/components/curriculum-ui';
import type { MathsChapter, MathsChapterProgress } from '@/data/cbse-class-10-maths';

interface MathsChapterCardProps {
  chapter: MathsChapter;
  progress: MathsChapterProgress;
  examId?: string;
  subjectId?: string;
}

export function MathsChapterCard({
  chapter,
  progress,
  examId = 'cbse-class-10',
  subjectId = 'cbse-class-10-mathematics',
}: MathsChapterCardProps) {
  const chapterUrl = `/exams/${examId}/mathematics/${chapter.id}`;

  return (
    <Card
      id={`math-chapter-card-${chapter.id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:border-emerald-500 hover:shadow-md sm:p-6"
    >
      <div>
        {/* Header Row: Chapter Number, Unit, Weightage */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-lg bg-emerald-700 px-2.5 py-1 text-xs font-black text-white shadow-2xs">
              अध्याय {String(chapter.chapterNumber).padStart(2, '0')}
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              {chapter.unitHindiName.split(':')[0] || `Unit ${chapter.unitNumber}`}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
            <Sparkles size={11} className="text-emerald-600" />
            {chapter.weightageMarks} अंक (Marks)
          </span>
        </div>

        {/* Chapter Title */}
        <h3 className="mt-3 text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 sm:text-xl">
          <Link href={chapterUrl} className="focus-ring hover:underline">
            {chapter.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-xs font-semibold text-slate-500">{chapter.hindiTitle}</p>

        {/* Description */}
        <p className="mt-2.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
          {chapter.shortDescription}
        </p>

        {/* Key Formulas Banner */}
        {chapter.keyFormulas && chapter.keyFormulas.length > 0 && (
          <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-2 text-[11px] text-emerald-900">
            <span className="font-bold">मुख्य सूत्र: </span>
            <span className="font-mono">{chapter.keyFormulas[0]}</span>
          </div>
        )}

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
            <span className="font-bold text-slate-700">सेक्शन-वार प्रश्न स्थिति</span>
            <span className="text-[11px] font-medium text-emerald-700">
              {progress.availableQuestionsCount > 0
                ? `${progress.availableQuestionsCount} प्रश्न उपलब्ध`
                : 'प्रश्न उपलब्ध'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
            <div>
              <span className="text-[11px] text-slate-500">📖 Formulas</span>
              <p className="font-bold text-slate-800">
                {chapter.keyFormulas.length} Formulas
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-500">📝 Section A (MCQ)</span>
              <p className="font-bold text-slate-800">
                {progress.mcqProgress > 0
                  ? `${progress.mcqProgress}%`
                  : progress.totalMCQs && progress.totalMCQs > 0
                  ? `${progress.totalMCQs} MCQs Ready`
                  : 'Practice Ready'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-500">⚡ Assertion-Reason</span>
              <p className="font-bold text-slate-800">
                {progress.assertionReasonProgress > 0
                  ? `${progress.assertionReasonProgress}%`
                  : 'Available'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-500">✍️ Short Answers</span>
              <p className="font-bold text-slate-800">
                {progress.shortAnswerProgress > 0
                  ? `${progress.shortAnswerProgress}%`
                  : 'Section B & C'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-500">📊 Case-Based</span>
              <p className="font-bold text-slate-800">
                {progress.caseBasedProgress > 0
                  ? `${progress.caseBasedProgress}%`
                  : '4 Marks Study'}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-500">🏆 Board PYQ</span>
              <p className="font-bold text-slate-800">
                {progress.pyqProgress > 0 ? `${progress.pyqProgress}%` : 'Solved 2023-24'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Total Progress Bar + Quick Links */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="mb-3">
          <ProgressBar
            value={progress.overallProgress}
            label="अध्याय तैयारी (Chapter Readiness)"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/quiz/${examId}/${subjectId}/${chapter.id}`}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
          >
            Start Quiz
          </Link>
          <Link
            href={chapterUrl}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700"
          >
            Explore Chapter <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
