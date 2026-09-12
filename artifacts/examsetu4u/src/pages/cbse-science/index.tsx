import { useParams } from 'wouter';
import NotFoundPage from '@/pages/not-found';
import {
  getScienceChapter,
  CBSE_CLASS_10_SCIENCE_CHAPTERS,
  type ScienceSectionKey,
} from '@/data/cbse-class-10-science';
import { ScienceDashboard } from '@/components/cbse-science/ScienceDashboard';
import { ScienceChapterDetail } from '@/components/cbse-science/ScienceChapterDetail';
import { ScienceSectionViewer } from '@/components/cbse-science/ScienceSectionViewer';

/**
 * Route handler for CBSE Class 10 Science Subject Dashboard
 */
export function CbseScienceSubjectPage() {
  return <ScienceDashboard examId="cbse-class-10" />;
}

/**
 * Route handler for CBSE Class 10 Science Chapter Detail Page
 */
export function CbseScienceChapterPage() {
  const { chapterId = '' } = useParams<{ chapterId: string }>();
  const chapter = getScienceChapter(chapterId);

  if (!chapter) {
    return <NotFoundPage />;
  }

  return (
    <ScienceChapterDetail
      chapter={chapter}
      examId="cbse-class-10"
      subjectId="cbse-class-10-science"
    />
  );
}

/**
 * Route handler for CBSE Class 10 Science Chapter Sections
 */
export function CbseScienceSectionPage() {
  const { chapterId = '', section = 'study-material' } = useParams<{
    chapterId: string;
    section: string;
  }>();

  const chapter = getScienceChapter(chapterId);
  if (!chapter) {
    return <NotFoundPage />;
  }

  return (
    <ScienceSectionViewer
      chapter={chapter}
      sectionKey={section as ScienceSectionKey}
      examId="cbse-class-10"
      subjectId="cbse-class-10-science"
    />
  );
}
