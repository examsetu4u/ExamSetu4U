import { useParams } from 'wouter';
import NotFoundPage from '@/pages/not-found';
import {
  getMathsChapter,
  CBSE_CLASS_10_MATHS_CHAPTERS,
  type MathsSectionKey,
} from '@/data/cbse-class-10-maths';
import { MathsDashboard } from '@/components/cbse-maths/MathsDashboard';
import { MathsChapterDetail } from '@/components/cbse-maths/MathsChapterDetail';
import { MathsSectionViewer } from '@/components/cbse-maths/MathsSectionViewer';

/**
 * Route handler for CBSE Class 10 Mathematics Subject Dashboard
 */
export function CbseMathsSubjectPage() {
  return <MathsDashboard examId="cbse-class-10" />;
}

/**
 * Route handler for CBSE Class 10 Mathematics Chapter Detail Page
 */
export function CbseMathsChapterPage() {
  const { chapterId = '' } = useParams<{ chapterId: string }>();
  const chapter = getMathsChapter(chapterId);

  if (!chapter) {
    return <NotFoundPage />;
  }

  return (
    <MathsChapterDetail
      chapter={chapter}
      examId="cbse-class-10"
      subjectId="cbse-class-10-mathematics"
    />
  );
}

/**
 * Route handler for CBSE Class 10 Mathematics Chapter Sections
 */
export function CbseMathsSectionPage() {
  const { chapterId = '', section = 'study-material' } = useParams<{
    chapterId: string;
    section: string;
  }>();

  const chapter = getMathsChapter(chapterId);
  if (!chapter) {
    return <NotFoundPage />;
  }

  return (
    <MathsSectionViewer
      chapter={chapter}
      sectionKey={section as MathsSectionKey}
      examId="cbse-class-10"
      subjectId="cbse-class-10-mathematics"
    />
  );
}
