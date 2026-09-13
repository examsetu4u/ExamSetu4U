export interface CbseChapter {
  id: string; // e.g. 'cbse-class-10-social-science-1'
  canonicalId: string;
  chapterNumber: number;
  slug: string;
  title: string;
  hindiTitle: string;
  examId: 'cbse-class-10' | 'cbse-class-12';
  subjectId: string;
  unitNumber: number;
  unitName: string;
  unitHindiName: string;
  weightageMarks: number;
  syllabusTopics: string[];
  shortDescription: string;
}

export interface CbseSectionMetadata {
  key: string;
  order: number;
  icon: string;
  title: string;
  hindiTitle: string;
  description: string;
  badge: string;
  emptyHeading: string;
  emptyDescription: string;
  marksBadge?: string;
}

export interface CbseSubjectConfig {
  id: string; // e.g. 'cbse-class-10-social-science' or 'social-science'
  canonicalSubjectId: string;
  examId: 'cbse-class-10' | 'cbse-class-12';
  name: string;
  hindiName: string;
  tagline: string;
  taglineHindi: string;
  theoryMarks: number;
  internalMarks: number;
  examDurationMinutes: number;
  accentColor: 'blue' | 'emerald' | 'amber' | 'indigo' | 'violet' | 'rose' | 'teal' | 'cyan' | 'orange';
  units: Array<{
    unitNumber: number;
    name: string;
    hindiName: string;
    marks: number;
  }>;
  sections: CbseSectionMetadata[];
  chapters: CbseChapter[];
}

export interface CbseChapterProgress {
  overallProgress: number;
  studyMaterialProgress: number;
  mcqProgress: number;
  pyqPracticed: number;
  availableQuestionsCount: number;
  hasContent: boolean;
  totalMCQs?: number;
}
