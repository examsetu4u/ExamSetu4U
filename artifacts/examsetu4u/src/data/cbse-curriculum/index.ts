import { CBSE_CLASS_10_SOCIAL_SCIENCE } from './subjects/class10-social-science';
import { CBSE_CLASS_10_ENGLISH } from './subjects/class10-english';
import { CBSE_CLASS_10_HINDI } from './subjects/class10-hindi';
import { CBSE_CLASS_12_PHYSICS } from './subjects/class12-physics';
import { CBSE_CLASS_12_CHEMISTRY } from './subjects/class12-chemistry';
import { CBSE_CLASS_12_MATHEMATICS } from './subjects/class12-mathematics';
import { CBSE_CLASS_12_BIOLOGY } from './subjects/class12-biology';
import { CBSE_CLASS_12_ENGLISH } from './subjects/class12-english';
import type { CbseChapter, CbseChapterProgress, CbseSubjectConfig } from './types';

export * from './types';
export {
  CBSE_CLASS_10_SOCIAL_SCIENCE,
  CBSE_CLASS_10_ENGLISH,
  CBSE_CLASS_10_HINDI,
  CBSE_CLASS_12_PHYSICS,
  CBSE_CLASS_12_CHEMISTRY,
  CBSE_CLASS_12_MATHEMATICS,
  CBSE_CLASS_12_BIOLOGY,
  CBSE_CLASS_12_ENGLISH,
};

export const ALL_CBSE_SUBJECT_CONFIGS: CbseSubjectConfig[] = [
  CBSE_CLASS_10_SOCIAL_SCIENCE,
  CBSE_CLASS_10_ENGLISH,
  CBSE_CLASS_10_HINDI,
  CBSE_CLASS_12_PHYSICS,
  CBSE_CLASS_12_CHEMISTRY,
  CBSE_CLASS_12_MATHEMATICS,
  CBSE_CLASS_12_BIOLOGY,
  CBSE_CLASS_12_ENGLISH,
];

/**
 * Check if a subject belongs to our new CBSE subjects engine
 */
export function isCbseSubject(subjectId: string, examId?: string): boolean {
  const normSubject = subjectId.toLowerCase().trim();
  const normExam = examId?.toLowerCase().trim();

  return ALL_CBSE_SUBJECT_CONFIGS.some((config) => {
    const matchesSubject =
      config.id.toLowerCase() === normSubject ||
      config.canonicalSubjectId.toLowerCase() === normSubject;
    if (!matchesSubject) return false;
    if (normExam) {
      return config.examId.toLowerCase() === normExam;
    }
    return true;
  });
}

/**
 * Get subject configuration for any CBSE subject
 */
export function getCbseSubjectConfig(
  subjectId: string,
  examId?: string
): CbseSubjectConfig | undefined {
  const normSubject = subjectId.toLowerCase().trim();
  const normExam = examId?.toLowerCase().trim();

  return ALL_CBSE_SUBJECT_CONFIGS.find((config) => {
    const matchesSubject =
      config.id.toLowerCase() === normSubject ||
      config.canonicalSubjectId.toLowerCase() === normSubject ||
      `${config.examId}-${config.canonicalSubjectId}`.toLowerCase() === normSubject;
    if (!matchesSubject) return false;
    if (normExam) {
      return config.examId.toLowerCase() === normExam;
    }
    return true;
  });
}

/**
 * Get a specific chapter across all CBSE subjects
 */
export function getCbseChapter(
  topicIdOrSlug: string,
  examId?: string,
  subjectId?: string
): CbseChapter | undefined {
  const q = topicIdOrSlug.toLowerCase().trim();

  // If subjectId is known, narrow down first
  const subjectConfig = subjectId ? getCbseSubjectConfig(subjectId, examId) : undefined;
  if (subjectConfig) {
    const found = subjectConfig.chapters.find(
      (c) =>
        c.id.toLowerCase() === q ||
        c.slug.toLowerCase() === q ||
        c.canonicalId.toLowerCase() === q ||
        `chapter-${c.chapterNumber}` === q ||
        String(c.chapterNumber) === q
    );
    if (found) return found;
  }

  // Otherwise search across all subjects matching examId if provided
  for (const config of ALL_CBSE_SUBJECT_CONFIGS) {
    if (examId && config.examId.toLowerCase() !== examId.toLowerCase()) continue;
    const found = config.chapters.find(
      (c) =>
        c.id.toLowerCase() === q ||
        c.slug.toLowerCase() === q ||
        c.canonicalId.toLowerCase() === q ||
        c.title.toLowerCase() === q ||
        c.title.toLowerCase().replace(/[^a-z0-9]/g, '-') === q
    );
    if (found) return found;
  }

  return undefined;
}

/**
 * Calculate chapter progress dynamically
 */
export function calculateCbseChapterProgress(
  chapterId: string,
  examId?: string,
  subjectId?: string
): CbseChapterProgress {
  const chapter = getCbseChapter(chapterId, examId, subjectId);
  if (!chapter) {
    return {
      overallProgress: 0,
      studyMaterialProgress: 0,
      mcqProgress: 0,
      pyqPracticed: 0,
      availableQuestionsCount: 0,
      hasContent: false,
    };
  }

  // Check stored progress in localStorage if running client-side
  let studyProgress = 0;
  let mcqProgress = 0;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedStudy = localStorage.getItem(`cbse_study_${chapter.id}`);
      if (storedStudy) studyProgress = parseInt(storedStudy, 10) || 0;

      const storedQuiz = localStorage.getItem(`cbse_quiz_${chapter.id}`);
      if (storedQuiz) mcqProgress = parseInt(storedQuiz, 10) || 0;
    }
  } catch {
    // Ignore storage issues in sandbox
  }

  // Chapter 1 of each subject has sample content active
  const isSampleReady = chapter.chapterNumber === 1 || chapter.chapterNumber === 2;

  return {
    overallProgress: studyProgress > 0 || mcqProgress > 0 ? Math.round((studyProgress + mcqProgress) / 2) : 0,
    studyMaterialProgress: studyProgress,
    mcqProgress: mcqProgress,
    pyqPracticed: 0,
    availableQuestionsCount: isSampleReady ? 15 : 0,
    hasContent: isSampleReady,
    totalMCQs: isSampleReady ? 12 : 0,
  };
}
