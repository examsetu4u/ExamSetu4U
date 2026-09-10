import { useCallback, useState } from 'react';
import { getSubjectsForExam, getTopicsForSubject } from '@/data/curriculum';

const STORAGE_KEY = 'examsetu4u-module-2-progress';
const BOOKMARKS_STORAGE_KEY = 'examsetu4u-study-bookmarks';
const READING_PROGRESS_STORAGE_KEY = 'examsetu4u-study-reading-progress';
type ProgressMap = Record<string, number>;
type BookmarkMap = Record<string, boolean>;
type ReadingProgressMap = Record<string, number>;

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