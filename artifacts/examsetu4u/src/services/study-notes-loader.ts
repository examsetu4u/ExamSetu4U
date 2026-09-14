import { useEffect, useMemo, useState } from 'react';
import {
  CBSE_10_MATHS_NOTES_SHEET_CSV_URL,
  STUDY_NOTES_SHEET_CSV_URL,
  GOOGLE_SHEET_NOTES_SOURCES,
} from '@/config/google-sheet-config';
import type { MaterialSection, StudyMaterial, StudyMaterialCallout } from '@/data/curriculum';
import { INITIAL_STUDY_NOTES, type RawStudyNote } from '@/data/notes/study-notes-data';

// Local storage cache keys
const STUDY_NOTES_CACHE_KEY = 'examsetu4u_study_notes_cache_v2';
const STUDY_NOTES_OVERRIDE_URL_KEY = 'examsetu4u_study_notes_url_override_v1';
const STUDY_NOTES_LAST_SYNC_KEY = 'examsetu4u_study_notes_last_sync_v1';

// In-memory cache
let inMemoryNotes: RawStudyNote[] = [...INITIAL_STUDY_NOTES];
let isInitializedFromStorage = false;
let isFetchingFromSheet = false;
let lastSyncTimestamp: number | null = null;

// Subscribers
type NotesSubscriber = (notes: RawStudyNote[]) => void;
const subscribers = new Set<NotesSubscriber>();

function notifySubscribers() {
  subscribers.forEach((cb) => {
    try {
      cb(inMemoryNotes);
    } catch (e) {
      console.error('[StudyNotesLoader] subscriber error:', e);
    }
  });
}

/**
 * Normalizes any Google Sheet link into a valid CSV export link
 */
export function normalizeSheetUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // If user pasted partial e/2PACX... path
  if (url.startsWith('e/2PACX') || url.startsWith('2PACX')) {
    url = `https://docs.google.com/spreadsheets/d/${url}`;
  }

  // 1. Published HTML: .../pubhtml -> .../pub?output=csv
  if (url.includes('/pubhtml')) {
    return url.replace('/pubhtml', '/pub?output=csv');
  }

  // 2. Published without output=csv
  if (url.includes('/pub') && !url.includes('output=csv')) {
    return `${url}${url.includes('?') ? '&' : '?'}output=csv`;
  }

  // 3. Regular sheet edit/view link
  const match = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match && !url.includes('/export?') && !url.includes('/pub?')) {
    const spreadsheetId = match[1];
    const gidMatch = url.match(/[?#&]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : '0';
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
  }

  return url;
}

/**
 * Gets effective URL for Study Notes
 */
export function getEffectiveStudyNotesUrl(): string {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem(STUDY_NOTES_OVERRIDE_URL_KEY);
    if (override && override.trim()) {
      return normalizeSheetUrl(override.trim());
    }
  }
  return normalizeSheetUrl(CBSE_10_MATHS_NOTES_SHEET_CSV_URL || STUDY_NOTES_SHEET_CSV_URL);
}

/**
 * RFC 4180 compliant CSV parser for notes with multiline cells, Hindi text, and escaped quotes
 */
export function parseStudyNotesCSV(csvText: string): string[][] {
  const clean = csvText.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuotes = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        if (nextChar === '\n') i++;
        currentRow.push(currentCell.trim());
        currentCell = '';
        if (currentRow.some((c) => c !== '')) rows.push(currentRow);
        currentRow = [];
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        currentCell = '';
        if (currentRow.some((c) => c !== '')) rows.push(currentRow);
        currentRow = [];
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== '')) rows.push(currentRow);
  }

  return rows;
}

/**
 * Parses raw CSV rows into validated RawStudyNote records
 * Intelligently supports:
 * 1. 16-column Maths sheet format (Exam, Subject, Chapter, Topic ID, Topic, Content Type, Title, Detailed Concept, Formula/Rule, Why/When to Use, Solved Example, Advanced Example, Important Points, Common Mistakes, Exam Application, Difficulty)
 * 2. 9-column STET format (id, examId, subjectId, topicId, title, content, importantPoint, examTip, status)
 */
export function parseStudyNotesFromCSV(csvText: string): RawStudyNote[] {
  const rawRows = parseStudyNotesCSV(csvText);
  if (rawRows.length <= 1) return [];

  const rawHeaders = rawRows[0].map((h) => h.trim().toLowerCase());

  // Helper to find column index by several candidate names
  const findCol = (...candidates: string[]): number => {
    for (const cand of candidates) {
      const lowerCand = cand.toLowerCase();
      const exact = rawHeaders.findIndex((h) => h === lowerCand);
      if (exact !== -1) return exact;
    }
    for (const cand of candidates) {
      const lowerCand = cand.toLowerCase();
      const partial = rawHeaders.findIndex((h) => h.includes(lowerCand));
      if (partial !== -1) return partial;
    }
    return -1;
  };

  const idCol = findCol('topic id', 'id', 'topic_id');
  const examCol = findCol('exam', 'examid', 'exam_id');
  const subjectCol = findCol('subject', 'subjectid', 'subject_id');
  const chapterCol = findCol('chapter', 'chapterid', 'chapter_id');
  const topicCol = findCol('topic', 'subtopic');
  const contentTypeCol = findCol('content type', 'content_type', 'type');
  const titleCol = findCol('title', 'heading', 'topic name');
  const contentCol = findCol('detailed concept', 'concept', 'content', 'description');
  const formulaCol = findCol('formula/rule', 'formula', 'rule');
  const whyCol = findCol('why/when to use', 'when to use', 'why to use');
  const solvedExampleCol = findCol('solved example', 'example');
  const advancedExampleCol = findCol('advanced example', 'hots example');
  const importantCol = findCol('important points', 'important point', 'importantpoint', 'key points');
  const mistakesCol = findCol('common mistakes', 'mistakes', 'common mistake');
  const examAppCol = findCol('exam application', 'exam tip', 'examtip', 'tip');
  const difficultyCol = findCol('difficulty', 'level');
  const statusCol = findCol('status');

  const notes: RawStudyNote[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const r = rawRows[i];
    if (!r || r.length === 0 || r.every((c) => !c.trim())) continue;

    const rawStatus = statusCol !== -1 ? (r[statusCol] || '').trim().toUpperCase() : 'PUBLISHED';
    if (rawStatus && (rawStatus === 'DRAFT' || rawStatus === 'ARCHIVED')) continue;

    const rawExam = examCol !== -1 ? (r[examCol] || '').trim() : '';
    const rawSubject = subjectCol !== -1 ? (r[subjectCol] || '').trim() : '';
    const rawChapter = chapterCol !== -1 ? (r[chapterCol] || '').trim() : '';
    const rawTopicId = idCol !== -1 ? (r[idCol] || '').trim() : '';
    const rawTopic = topicCol !== -1 ? (r[topicCol] || '').trim() : '';
    const rawTitle = titleCol !== -1 ? (r[titleCol] || '').trim() : '';
    const rawContent = contentCol !== -1 ? (r[contentCol] || '').trim() : '';

    if (!rawContent && !rawTitle) continue;

    // Normalize exam
    let examId = 'cbse-class-10';
    const examLower = rawExam.toLowerCase();
    if (examLower.includes('tet') || examLower.includes('stet')) {
      examId = 'super-tet';
    } else if (examLower.includes('cbse') || examLower.includes('10')) {
      examId = 'cbse-class-10';
    }

    // Normalize subject
    let subjectId = 'cbse-class-10-mathematics';
    const subjectLower = rawSubject.toLowerCase();
    if (subjectLower.includes('math')) {
      subjectId = 'cbse-class-10-mathematics';
    } else if (subjectLower.includes('science')) {
      subjectId = 'cbse-class-10-science';
    } else if (subjectLower.includes('child') || subjectLower.includes('bal')) {
      subjectId = 'super-tet-child-development';
    } else if (subjectLower.includes('teach') || subjectLower.includes('shikshan')) {
      subjectId = 'super-tet-teaching-skills';
    }

    // Normalize chapter and topic
    let chapterId = 'cbse-class-10-mathematics-1';
    let topicId = 'real-numbers';
    const chapterLower = rawChapter.toLowerCase();
    const topicIdLower = rawTopicId.toLowerCase();

    if (
      chapterLower.includes('real number') ||
      chapterLower.includes('chapter 1') ||
      topicIdLower.startsWith('rn-') ||
      topicIdLower === 'real-numbers'
    ) {
      chapterId = 'cbse-class-10-mathematics-1';
      topicId = 'real-numbers';
    } else if (rawTopicId) {
      topicId = rawTopicId;
    }

    const noteId = rawTopicId ? `MATH10-${rawTopicId.replace(/[^a-zA-Z0-9_-]/g, '')}` : `N-${i}`;

    notes.push({
      id: noteId,
      examId,
      subjectId,
      chapterId,
      chapterTitle: rawChapter || 'Chapter 1: Real Numbers',
      topicId,
      topicCode: rawTopicId,
      topic: rawTopic,
      contentType: contentTypeCol !== -1 ? (r[contentTypeCol] || '').trim() : undefined,
      title: rawTitle || rawTopic || `Topic ${i}`,
      content: rawContent,
      formulaRule: formulaCol !== -1 ? (r[formulaCol] || '').trim() : undefined,
      whyWhenToUse: whyCol !== -1 ? (r[whyCol] || '').trim() : undefined,
      solvedExample: solvedExampleCol !== -1 ? (r[solvedExampleCol] || '').trim() : undefined,
      advancedExample: advancedExampleCol !== -1 ? (r[advancedExampleCol] || '').trim() : undefined,
      importantPoint: importantCol !== -1 ? (r[importantCol] || '').trim() : undefined,
      commonMistakes: mistakesCol !== -1 ? (r[mistakesCol] || '').trim() : undefined,
      examApplication: examAppCol !== -1 ? (r[examAppCol] || '').trim() : undefined,
      difficulty: difficultyCol !== -1 ? (r[difficultyCol] || '').trim() : undefined,
      examTip: examAppCol !== -1 ? (r[examAppCol] || '').trim() : undefined,
      status: 'PUBLISHED',
    });
  }

  return notes;
}

/**
 * Initializes storage cache and triggers background fetch
 */
export function initStudyNotes(): void {
  if (typeof window === 'undefined') return;

  if (!isInitializedFromStorage) {
    try {
      const cached = localStorage.getItem(STUDY_NOTES_CACHE_KEY);
      const cachedSyncTime = localStorage.getItem(STUDY_NOTES_LAST_SYNC_KEY);
      if (cachedSyncTime) {
        lastSyncTimestamp = parseInt(cachedSyncTime, 10);
      }
      if (cached) {
        const parsed = JSON.parse(cached) as RawStudyNote[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge cached notes with initial notes (avoiding duplicates by id)
          const map = new Map<string, RawStudyNote>();
          INITIAL_STUDY_NOTES.forEach((n) => map.set(n.id, n));
          parsed.forEach((n) => map.set(n.id, n));
          inMemoryNotes = Array.from(map.values());
        }
      }
    } catch {
      // Use bundled initial notes
    }
    isInitializedFromStorage = true;
  }

  // Background fetch
  fetchStudyNotesFromSheet().catch((err) => {
    console.warn('[StudyNotesLoader] Background fetch warning:', err);
  });
}

/**
 * Fetches latest notes from all configured Google Sheet CSV sources
 */
export async function fetchStudyNotesFromSheet(forceUrl?: string): Promise<RawStudyNote[]> {
  if (isFetchingFromSheet) {
    return inMemoryNotes;
  }

  isFetchingFromSheet = true;

  try {
    const sourcesToFetch = forceUrl
      ? [{ id: 'custom', name: 'Custom URL', url: normalizeSheetUrl(forceUrl) }]
      : GOOGLE_SHEET_NOTES_SOURCES;

    const allFetchedNotes: RawStudyNote[] = [];

    await Promise.all(
      sourcesToFetch.map(async (src) => {
        try {
          const res = await fetch(src.url, {
            method: 'GET',
            headers: { Accept: 'text/csv, text/plain, */*' },
            cache: 'no-cache',
          });

          if (res.ok) {
            const text = await res.text();
            const parsed = parseStudyNotesFromCSV(text);
            if (parsed.length > 0) {
              allFetchedNotes.push(...parsed);
            }
          }
        } catch (err) {
          console.warn(`[StudyNotesLoader] Failed to fetch source ${src.name}:`, err);
        }
      })
    );

    if (allFetchedNotes.length > 0) {
      // Merge with in-memory notes using Map by id
      const map = new Map<string, RawStudyNote>();
      inMemoryNotes.forEach((n) => map.set(n.id, n));
      allFetchedNotes.forEach((n) => map.set(n.id, n));
      inMemoryNotes = Array.from(map.values());

      lastSyncTimestamp = Date.now();

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STUDY_NOTES_CACHE_KEY, JSON.stringify(inMemoryNotes));
          localStorage.setItem(STUDY_NOTES_LAST_SYNC_KEY, lastSyncTimestamp.toString());
        } catch (e) {
          console.warn('[StudyNotesLoader] LocalStorage quota exceeded:', e);
        }
      }
      notifySubscribers();
    }
    return inMemoryNotes;
  } finally {
    isFetchingFromSheet = false;
  }
}

/**
 * Normalizes an ID for topic matching
 */
function normalizeId(id: string): string {
  return (id || '')
    .toLowerCase()
    .trim()
    .replace(/^super-tet-/, '')
    .replace(/^child-development-/, '')
    .replace(/^teaching-skills-/, '')
    .replace(/^st-cd-top-/, '')
    .replace(/^st-sk-top-/, '')
    .replace(/^cbse-class-10-mathematics-/, '')
    .replace(/^cbse-10-maths-/, '')
    .replace(/^cbse-10-math-/, '')
    .replace(/^ch1-/, '')
    .replace(/^chapter-?/, '');
}

/**
 * Maps standard topic IDs to sheet topic IDs and vice-versa
 */
const TOPIC_ALIASES: Record<string, string[]> = {
  // CBSE Class 10 Maths: Chapter 1 Real Numbers
  'real-numbers': [
    'real-numbers',
    'real-number',
    'cbse-class-10-mathematics-1',
    'ch1-real-numbers',
    'chapter-1',
    'cbse-10-math-1',
    'cbse-10-maths-1',
    'maths-ch-1',
    '1',
  ],
  'cbse-class-10-mathematics-1': [
    'real-numbers',
    'real-number',
    'cbse-class-10-mathematics-1',
    'ch1-real-numbers',
    'chapter-1',
    'cbse-10-math-1',
    'cbse-10-maths-1',
    'maths-ch-1',
    '1',
  ],
  // Super TET CDP
  'bal-vikas-arth-prakriti': [
    'bal-vikas-arth-prakriti',
    'super-tet-child-development-1',
    'child-development-1',
    'bal-vikas-ke-siddhant',
    '1',
  ],
  'vikas-ki-avasthayen': [
    'vikas-ki-avasthayen',
    'super-tet-child-development-2',
    'child-development-2',
    '2',
  ],
  'vanshanukram-evam-vatavaran': [
    'vanshanukram-evam-vatavaran',
    'super-tet-child-development-3',
    'child-development-3',
    '3',
  ],
  'vyaktigat-vibhinnataen': [
    'vyaktigat-vibhinnataen',
    'super-tet-child-development-4',
    'child-development-4',
    '4',
  ],
  'adhigam-evam-vikas-ka-sambandh': [
    'adhigam-evam-vikas-ka-sambandh',
    'super-tet-child-development-5',
    'child-development-5',
    'adhigam-aur-prerna',
    '5',
  ],
};

/**
 * Checks if a note matches the requested topic
 */
function doesNoteMatchTopic(note: RawStudyNote, requestedTopicId: string): boolean {
  if (!requestedTopicId) return false;
  const noteTopicNorm = normalizeId(note.topicId);
  const reqTopicNorm = normalizeId(requestedTopicId);

  if (noteTopicNorm === reqTopicNorm) return true;
  if (note.topicId.toLowerCase() === requestedTopicId.toLowerCase()) return true;

  if (note.chapterId && (normalizeId(note.chapterId) === reqTopicNorm || note.chapterId === requestedTopicId)) {
    return true;
  }

  // Maths Real Numbers specific check
  const isReqMathsCh1 =
    reqTopicNorm === 'realnumbers' ||
    reqTopicNorm === 'real-numbers' ||
    reqTopicNorm === '1' ||
    requestedTopicId === 'cbse-class-10-mathematics-1' ||
    requestedTopicId === 'real-numbers' ||
    requestedTopicId === 'ch1-real-numbers';

  const isNoteMathsCh1 =
    note.subjectId === 'cbse-class-10-mathematics' &&
    (note.topicId === 'real-numbers' ||
      note.chapterId === 'cbse-class-10-mathematics-1' ||
      (note.topicCode && note.topicCode.startsWith('RN-')));

  if (isReqMathsCh1 && isNoteMathsCh1) {
    return true;
  }

  // Check aliases
  for (const [key, aliases] of Object.entries(TOPIC_ALIASES)) {
    const isNoteInGroup = key === noteTopicNorm || aliases.some((a) => normalizeId(a) === noteTopicNorm);
    const isReqInGroup = key === reqTopicNorm || aliases.some((a) => normalizeId(a) === reqTopicNorm);
    if (isNoteInGroup && isReqInGroup) return true;
  }

  return false;
}

/**
 * Returns all published study notes for a specific topic
 */
export function getStudyNotesForTopic(
  topicId: string,
  examId?: string,
  subjectId?: string
): RawStudyNote[] {
  if (!topicId) return [];
  initStudyNotes();

  return inMemoryNotes.filter((note) => {
    if (note.status !== 'PUBLISHED') return false;

    // Optional exam filter
    if (examId) {
      const eNorm = examId.toLowerCase().replace(/[-_]/g, '');
      const noteENorm = note.examId.toLowerCase().replace(/[-_]/g, '');
      if (noteENorm && !noteENorm.includes(eNorm) && !eNorm.includes(noteENorm)) {
        return false;
      }
    }

    // Optional subject filter with aliases
    if (subjectId) {
      const sNorm = subjectId.toLowerCase().replace(/[-_]/g, '');
      const noteSNorm = note.subjectId.toLowerCase().replace(/[-_]/g, '');
      const isMaths =
        (sNorm.includes('math') || sNorm.includes('ganit')) &&
        (noteSNorm.includes('math') || noteSNorm.includes('ganit'));
      const isCdp =
        (sNorm.includes('childdevelopment') || sNorm.includes('balvikas')) &&
        (noteSNorm.includes('childdevelopment') || noteSNorm.includes('balvikas'));

      if (!isMaths && !isCdp && noteSNorm && !noteSNorm.includes(sNorm) && !sNorm.includes(noteSNorm)) {
        return false;
      }
    }

    return doesNoteMatchTopic(note, topicId);
  });
}

/**
 * Converts a list of raw notes into the comprehensive StudyMaterial shape
 * CRITICAL USER INTENT: Supports combining base notes (app ke banaye notes)
 * with the Google Sheet notes in seamless continuity (app ke notes ke baad Google sheet notes)!
 */
export function convertNotesToStudyMaterial(
  topicId: string,
  notes: RawStudyNote[],
  baseMaterial?: StudyMaterial
): StudyMaterial | undefined {
  if ((!notes || notes.length === 0) && !baseMaterial) return undefined;
  if (!notes || notes.length === 0) return baseMaterial;

  const baseSections = baseMaterial?.sections || [];
  const baseCallouts = baseMaterial?.callouts || [];
  const baseTakeaways = baseMaterial?.keyTakeaways || [];
  const baseQuickRevision = baseMaterial?.quickRevision || [];

  // Convert Google Sheet notes into rich MaterialSection items
  const sheetSections: MaterialSection[] = notes.map((note, index) => {
    const codeBadge = note.topicCode ? `[${note.topicCode}] ` : '';
    const diffBadge = note.difficulty ? ` (${note.difficulty})` : '';
    const typeBadge = note.contentType ? ` • ${note.contentType}` : '';

    const paragraphs: string[] = [];
    if (note.content) paragraphs.push(note.content);
    if (note.formulaRule) {
      paragraphs.push(`📌 सूत्र / नियम (Formula/Rule): ${note.formulaRule}`);
    }
    if (note.whyWhenToUse) {
      paragraphs.push(`💡 कब और क्यों प्रयोग करें (When to Use): ${note.whyWhenToUse}`);
    }

    const bullets: string[] = [];
    if (note.solvedExample) {
      bullets.push(`📝 हल किया हुआ उदाहरण (Solved Example): ${note.solvedExample}`);
    }
    if (note.advancedExample) {
      bullets.push(`🚀 उच्च स्तरीय उदाहरण (Advanced / HOTS): ${note.advancedExample}`);
    }
    if (note.importantPoint) {
      bullets.push(`⭐ महत्वपूर्ण परीक्षा बिंदु (Key Point): ${note.importantPoint}`);
    }
    if (note.commonMistakes) {
      bullets.push(`⚠️ सामान्य गलतियाँ (Mistakes to Avoid): ${note.commonMistakes}`);
    }
    if (note.examApplication) {
      bullets.push(`🎯 बोर्ड परीक्षा उपयोग (Board Exam Focus): ${note.examApplication}`);
    }

    return {
      heading: `${codeBadge}${note.title || `Concept ${index + 1}`}${typeBadge}${diffBadge}`,
      subheading: note.topic ? `विषय: ${note.topic}` : (note.importantPoint ? `परीक्षा बिंदु: ${note.importantPoint}` : undefined),
      paragraphs,
      bullets: bullets.length > 0 ? bullets : undefined,
    };
  });

  // Combine sections: Base Material (App Notes) FIRST, followed by Google Sheet notes in continuity!
  const combinedSections: MaterialSection[] = [
    ...baseSections,
    ...(baseSections.length > 0 && sheetSections.length > 0
      ? [
          {
            heading: `📊 Google Sheet सिंक स्टडी नोट्स: विस्तृत अवधारणाएं एवं हल उदाहरण (${notes.length} Topics in Continuity)`,
            subheading: 'आपके द्वारा Google Sheet में जोड़े गए सभी विस्तृत टॉपिक्स, सूत्र, हल किए गए उदाहरण व परीक्षा टिप्स',
            paragraphs: [
              'नीचे दिए गए सभी नोट्स सीधे आपकी Google Sheet से सिंक किए गए हैं। प्रत्येक टॉपिक में बेसिक कांसेप्ट, सूत्र, सोल्व्ड उदाहरण, सामान्य गलतियां और बोर्ड परीक्षा उपयोग शामिल हैं।'
            ],
          },
          ...sheetSections,
        ]
      : sheetSections),
  ];

  const callouts: StudyMaterialCallout[] = [...baseCallouts];
  const quickRevision: string[] = [...baseQuickRevision];
  const keyTakeaways: string[] = [...baseTakeaways];

  notes.forEach((note) => {
    if (note.importantPoint && !keyTakeaways.includes(note.importantPoint)) {
      keyTakeaways.push(note.importantPoint);
    }
    if (note.examTip && !quickRevision.includes(note.examTip)) {
      quickRevision.push(note.examTip);
    }
    if (note.formulaRule && !keyTakeaways.includes(note.formulaRule)) {
      keyTakeaways.push(`सूत्र: ${note.formulaRule}`);
    }
  });

  const firstNote = notes[0];
  if (firstNote?.importantPoint && callouts.length < 4) {
    callouts.push({
      label: 'Google Sheet Live Note',
      title: firstNote.title,
      body: firstNote.importantPoint,
    });
  }

  return {
    topicId,
    intro:
      baseMaterial?.intro ||
      (firstNote.content.length > 180
        ? `${firstNote.content.slice(0, 180)}...`
        : firstNote.content),
    sections: combinedSections,
    callouts,
    keyTakeaways: keyTakeaways.slice(0, 16),
    quickRevision: quickRevision.slice(0, 16),
  };
}

/**
 * React hook to access Study Notes for a topic with live updates & continuity
 */
export function useTopicStudyNotes(
  topicId: string,
  examId?: string,
  subjectId?: string,
  baseMaterial?: StudyMaterial
) {
  const [notes, setNotes] = useState<RawStudyNote[]>(() =>
    getStudyNotesForTopic(topicId, examId, subjectId)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(() => lastSyncTimestamp);

  useEffect(() => {
    initStudyNotes();
    const initial = getStudyNotesForTopic(topicId, examId, subjectId);
    setNotes((prev) => {
      if (prev.length === initial.length && prev.every((p, i) => p.id === initial[i]?.id)) {
        return prev;
      }
      return initial;
    });
    setLastSync(lastSyncTimestamp);

    const unsubscribe = (_allNotes: RawStudyNote[]) => {
      const filtered = getStudyNotesForTopic(topicId, examId, subjectId);
      setNotes((prev) => {
        if (prev.length === filtered.length && prev.every((p, i) => p.id === filtered[i]?.id)) {
          return prev;
        }
        return filtered;
      });
      setLastSync(lastSyncTimestamp);
    };

    subscribers.add(unsubscribe);
    return () => {
      subscribers.delete(unsubscribe);
    };
  }, [topicId, examId, subjectId]);

  const material = useMemo(
    () => convertNotesToStudyMaterial(topicId, notes, baseMaterial),
    [topicId, notes, baseMaterial]
  );

  const refresh = async () => {
    setIsLoading(true);
    try {
      await fetchStudyNotesFromSheet();
      setLastSync(Date.now());
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notes,
    material,
    isLoading,
    totalNotes: notes.length,
    totalBankNotes: inMemoryNotes.length,
    sheetUrl: getEffectiveStudyNotesUrl(),
    lastSync,
    refresh,
  };
}

/**
 * Returns all published study notes across all topics
 */
export function getAllStudyNotes(): RawStudyNote[] {
  initStudyNotes();
  return inMemoryNotes.filter((n) => n.status === 'PUBLISHED');
}

/**
 * Returns the last sync timestamp
 */
export function getLastSyncTimestamp(): number | null {
  return lastSyncTimestamp;
}
