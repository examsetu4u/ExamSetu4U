import { useCallback, useState } from 'react';
import { getSubjectsForExam, getTopicsForSubject } from '@/data/curriculum';

const STORAGE_KEY = 'examsetu4u-module-2-progress';
const BOOKMARKS_STORAGE_KEY = 'examsetu4u-study-bookmarks';
const READING_PROGRESS_STORAGE_KEY = 'examsetu4u-study-reading-progress';
const PYQ_PROGRESS_STORAGE_KEY = 'examsetu4u-module-4-pyq-progress';
type ProgressMap = Record<string, number>;
type BookmarkMap = Record<string, boolean>;
type ReadingProgressMap = Record<string, number>;
export type PYQProgressRecord = {
  viewed: boolean;
  answered: number;
  correct: number;
  incorrect: number;
};
export type PYQProgressMap = Record<string, PYQProgressRecord>;

function readProgress(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') as unknown;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, percent]) => typeof percent === 'number')) as ProgressMap;
  } catch {
    return {};
  }
}

function writeProgress(progress: ProgressMap) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function readBookmarks(): BookmarkMap {
  if (typeof window === 'undefined') return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(BOOKMARKS_STORAGE_KEY) ?? '{}') as unknown;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, bookmarked]) => bookmarked === true)) as BookmarkMap;
  } catch {
    return {};
  }
}

function writeBookmarks(bookmarks: BookmarkMap) {
  window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
}

function readReadingProgress(): ReadingProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(READING_PROGRESS_STORAGE_KEY) ?? '{}') as unknown;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, percent]) => typeof percent === 'number')) as ReadingProgressMap;
  } catch {
    return {};
  }
}

function writeReadingProgress(progress: ReadingProgressMap) {
  window.localStorage.setItem(READING_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

function readPYQProgress(): PYQProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const value = JSON.parse(window.localStorage.getItem(PYQ_PROGRESS_STORAGE_KEY) ?? '{}') as unknown;
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).map(([id, record]) => {
      const item = record && typeof record === 'object' ? record as Partial<PYQProgressRecord> : {};
      return [id, {
        viewed: item.viewed === true,
        answered: typeof item.answered === 'number' ? Math.max(0, item.answered) : 0,
        correct: typeof item.correct === 'number' ? Math.max(0, item.correct) : 0,
        incorrect: typeof item.incorrect === 'number' ? Math.max(0, item.incorrect) : 0,
      }];
    })) as PYQProgressMap;
  } catch {
    return {};
  }
}

function writePYQProgress(progress: PYQProgressMap) {
  window.localStorage.setItem(PYQ_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

export function getPYQProgressRecord(questionId: string, progress = readPYQProgress()): PYQProgressRecord {
  return progress[questionId] ?? { viewed: false, answered: 0, correct: 0, incorrect: 0 };
}

export function summarizePYQProgress(questionIds: string[], progress = readPYQProgress()) {
  return questionIds.reduce((summary, questionId) => {
    const record = getPYQProgressRecord(questionId, progress);
    summary.viewed += record.viewed ? 1 : 0;
    summary.answered += record.answered;
    summary.correct += record.correct;
    summary.incorrect += record.incorrect;
    return summary;
  }, { viewed: 0, answered: 0, correct: 0, incorrect: 0 });
}

export function getTopicProgress(topicId: string, progress = readProgress()) {
  return Math.max(0, Math.min(100, progress[topicId] ?? 0));
}

export function getSubjectProgress(subjectId: string, progress = readProgress()) {
  const topicIds = getTopicsForSubject(subjectId).map((topic) => topic.id);
  if (!topicIds.length) return 0;
  return Math.round(topicIds.reduce((total, topicId) => total + getTopicProgress(topicId, progress), 0) / topicIds.length);
}

export function getExamProgress(examId: string, progress = readProgress()) {
  const subjectIds = getSubjectsForExam(examId).map((subject) => subject.id);
  if (!subjectIds.length) return 0;
  return Math.round(subjectIds.reduce((total, subjectId) => total + getSubjectProgress(subjectId, progress), 0) / subjectIds.length);
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(() => readProgress());
  const [bookmarks, setBookmarks] = useState<BookmarkMap>(() => readBookmarks());
  const [readingProgress, setReadingProgressState] = useState<ReadingProgressMap>(() => readReadingProgress());

  const setTopicProgress = useCallback((topicId: string, percent: number) => {
    const next = { ...progress, [topicId]: Math.max(0, Math.min(100, Math.round(percent))) };
    setProgress(next);
    writeProgress(next);
  }, [progress]);

  const resetTopicProgress = useCallback((topicId: string) => {
    const next = { ...progress };
    delete next[topicId];
    setProgress(next);
    writeProgress(next);
  }, [progress]);

  const toggleBookmark = useCallback((topicId: string) => {
    const next = { ...bookmarks };
    if (next[topicId]) delete next[topicId];
    else next[topicId] = true;
    setBookmarks(next);
    writeBookmarks(next);
  }, [bookmarks]);

  const setReadingProgress = useCallback((topicId: string, percent: number) => {
    const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
    setReadingProgressState((current) => {
      const next = { ...current, [topicId]: safePercent };
      writeReadingProgress(next);
      return next;
    });
  }, []);

  return {
    progress,
    bookmarks,
    readingProgress,
    setTopicProgress,
    resetTopicProgress,
    toggleBookmark,
    setReadingProgress,
    isBookmarked: (topicId: string) => Boolean(bookmarks[topicId]),
    getReadingProgress: (topicId: string) => Math.max(0, Math.min(100, readingProgress[topicId] ?? 0)),
    getTopicProgress: (topicId: string) => getTopicProgress(topicId, progress),
    getSubjectProgress: (subjectId: string) => getSubjectProgress(subjectId, progress),
    getExamProgress: (examId: string) => getExamProgress(examId, progress),
  };
}

export function usePYQProgress() {
  const [pyqProgress, setPYQProgress] = useState<PYQProgressMap>(() => readPYQProgress());

  const markPYQViewed = useCallback((questionId: string) => {
    setPYQProgress((current) => {
      const next = { ...current, [questionId]: { ...getPYQProgressRecord(questionId, current), viewed: true } };
      writePYQProgress(next);
      return next;
    });
  }, []);

  const recordPYQAnswer = useCallback((questionId: string, correct: boolean) => {
    setPYQProgress((current) => {
      const record = getPYQProgressRecord(questionId, current);
      const next = {
        ...current,
        [questionId]: {
          ...record,
          viewed: true,
          answered: record.answered + 1,
          correct: record.correct + (correct ? 1 : 0),
          incorrect: record.incorrect + (correct ? 0 : 1),
        },
      };
      writePYQProgress(next);
      return next;
    });
  }, []);

  return {
    pyqProgress,
    markPYQViewed,
    recordPYQAnswer,
    getQuestionProgress: (questionId: string) => getPYQProgressRecord(questionId, pyqProgress),
    summarize: (questionIds: string[]) => summarizePYQProgress(questionIds, pyqProgress),
  };
}