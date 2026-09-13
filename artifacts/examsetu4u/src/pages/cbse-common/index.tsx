import { useParams } from 'wouter';
import NotFoundPage from '@/pages/not-found';
import {
  getCbseSubjectConfig,
  getCbseChapter,
} from '@/data/cbse-curriculum';
import { CbseSubjectDashboard } from '@/components/cbse-common/CbseSubjectDashboard';
import { CbseChapterDetail } from '@/components/cbse-common/CbseChapterDetail';
import { CbseSectionViewer } from '@/components/cbse-common/CbseSectionViewer';

/**
 * Route handler for any CBSE Subject Dashboard (Class 10 & 12)
 */
export function CbseGenericSubjectPage() {
  const { examId = '', subjectId = '' } = useParams<{
    examId: string;
    subjectId: string;
  }>();

  const config = getCbseSubjectConfig(subjectId, examId);
  if (!config) {
    return <NotFoundPage />;
  }

  return <CbseSubjectDashboard examId={examId} subjectId={subjectId} />;
}

/**
 * Route handler for any CBSE Chapter Detail Page (Class 10 & 12)
 */
export function CbseGenericChapterPage() {
  const {
    examId = '',
    subjectId = '',
    chapterId = '',
  } = useParams<{
    examId: string;
    subjectId: string;
    chapterId: string;
  }>();

  const config = getCbseSubjectConfig(subjectId, examId);
  const chapter = getCbseChapter(chapterId, examId, subjectId);

  if (!config || !chapter) {
    return <NotFoundPage />;
  }

  return (
    <CbseChapterDetail
      chapter={chapter}
      subjectConfig={config}
      examId={examId}
      subjectId={subjectId}
    />
  );
}

/**
 * Route handler for any CBSE Chapter Section Page (Class 10 & 12)
 */
export function CbseGenericSectionPage() {
  const {
    examId = '',
    subjectId = '',
    chapterId = '',
    section = 'study-material',
  } = useParams<{
    examId: string;
    subjectId: string;
    chapterId: string;
    section: string;
  }>();

  const config = getCbseSubjectConfig(subjectId, examId);
  const chapter = getCbseChapter(chapterId, examId, subjectId);

  if (!config || !chapter) {
    return <NotFoundPage />;
  }

  return (
    <CbseSectionViewer
      chapter={chapter}
      subjectConfig={config}
      sectionKey={section}
      examId={examId}
      subjectId={subjectId}
    />
  );
}
