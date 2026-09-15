import { useEffect, useMemo, useState } from 'react';
import { STUDY_NOTES_SHEET_CSV_URL } from '@/config/google-sheet-config';
import type { MaterialSection, StudyMaterial, StudyMaterialCallout } from '@/data/curriculum';
import { INITIAL_STUDY_NOTES, type RawStudyNote } from '@/data/notes/study-notes-data';

// Local storage cache keys
const STUDY_NOTES_CACHE_KEY = 'examsetu4u_study_notes_cache_v1';
const STUDY_NOTES_OVERRIDE_URL_KEY = 'examsetu4u_study_notes_url_override_v1';

// In-memory cache
let inMemoryNotes: RawStudyNote[] = [...INITIAL_STUDY_NOTES];
let isInitializedFromStorage = false;
let isFetchingFromSheet = false;

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
  return normalizeSheetUrl(STUDY_NOTES_SHEET_CSV_URL);
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

// Canonical headers for Study Notes Sheet
export const STUDY_NOTES_REQUIRED_HEADERS = [
  'id',
  'examId',
  'subjectId',
  'topicId',
  'title',
  'content',
  'importantPoint',
  'examTip',
  'status',
] as const;

export const STUDY_NOTES_DIAGRAM_HEADERS = [
  'diagramImageUrl',
  'diagramCaption',
  'diagramAltText',
] as const;

export const ALL_STUDY_NOTES_HEADERS = [
  ...STUDY_NOTES_REQUIRED_HEADERS,
  ...STUDY_NOTES_DIAGRAM_HEADERS,
];

const STUDY_NOTES_HEADER_ALIASES: Record<string, string> = {
  id: 'id',
  noteid: 'id',
  'note id': 'id',
  examid: 'examId',
  'exam id': 'examId',
  subjectid: 'subjectId',
  'subject id': 'subjectId',
  topicid: 'topicId',
  'topic id': 'topicId',
  title: 'title',
  heading: 'title',
  content: 'content',
  body: 'content',
  theory: 'content',
  notes: 'content',
  importantpoint: 'importantPoint',
  'important point': 'importantPoint',
  important_point: 'importantPoint',
  keypoint: 'importantPoint',
  examtip: 'examTip',
  'exam tip': 'examTip',
  exam_tip: 'examTip',
  status: 'status',
  diagramimageurl: 'diagramImageUrl',
  'diagram image url': 'diagramImageUrl',
  diagram_image_url: 'diagramImageUrl',
  diagramurl: 'diagramImageUrl',
  'diagram url': 'diagramImageUrl',
  diagram_url: 'diagramImageUrl',
  imageurl: 'diagramImageUrl',
  'image url': 'diagramImageUrl',
  image_url: 'diagramImageUrl',
  diagram: 'diagramImageUrl',
  image: 'diagramImageUrl',
  diagramcaption: 'diagramCaption',
  'diagram caption': 'diagramCaption',
  diagram_caption: 'diagramCaption',
  caption: 'diagramCaption',
  diagramalttext: 'diagramAltText',
  'diagram alt text': 'diagramAltText',
  diagram_alt_text: 'diagramAltText',
  alttext: 'diagramAltText',
  alt: 'diagramAltText',
};

/**
 * Parses raw CSV rows into validated RawStudyNote records with status = PUBLISHED only
 */
export function parseStudyNotesFromCSV(csvText: string): RawStudyNote[] {
  const rawRows = parseStudyNotesCSV(csvText);
  if (rawRows.length <= 1) return [];

  const notes: RawStudyNote[] = [];

  // Parse header row to map columns flexibly
  const headerRow = rawRows[0];
  const colMap = new Map<string, number>();
  headerRow.forEach((col, idx) => {
    const norm = col.trim().toLowerCase().replace(/[\s_-]+/g, '');
    const canonical = STUDY_NOTES_HEADER_ALIASES[norm] || col.trim();
    colMap.set(canonical, idx);
  });

  const getCell = (row: string[], key: string, fallbackIdx: number): string => {
    const idx = colMap.get(key);
    if (idx !== undefined && idx < row.length) {
      return (row[idx] || '').trim();
    }
    if (fallbackIdx < row.length) {
      return (row[fallbackIdx] || '').trim();
    }
    return '';
  };

  // Data starts at row 1 (row 0 is headers)
  for (let i = 1; i < rawRows.length; i++) {
    const r = rawRows[i];
    if (r.length < 5 || r.every((c) => c === '')) continue;

    const id = getCell(r, 'id', 0);
    const examId = getCell(r, 'examId', 1);
    const subjectId = getCell(r, 'subjectId', 2);
    const topicId = getCell(r, 'topicId', 3);
    const title = getCell(r, 'title', 4);
    const content = getCell(r, 'content', 5);
    const importantPoint = getCell(r, 'importantPoint', 6);
    const examTip = getCell(r, 'examTip', 7);
    const status = getCell(r, 'status', 8);

    const diagramImageUrl = getCell(r, 'diagramImageUrl', -1);
    const diagramCaption = getCell(r, 'diagramCaption', -1);
    const diagramAltText = getCell(r, 'diagramAltText', -1);

    const effectiveStatus = (status || '').trim().toUpperCase();

    // Enforce status = PUBLISHED only
    if (effectiveStatus !== 'PUBLISHED') continue;

    notes.push({
      id: (id || `N-${i}`).trim(),
      examId: (examId || '').trim(),
      subjectId: (subjectId || '').trim(),
      topicId: (topicId || '').trim(),
      title: (title || '').trim(),
      content: (content || '').trim(),
      importantPoint: (importantPoint || '').trim(),
      examTip: (examTip || '').trim(),
      status: 'PUBLISHED',
      ...(diagramImageUrl ? { diagramImageUrl } : {}),
      ...(diagramCaption ? { diagramCaption } : {}),
      ...(diagramAltText ? { diagramAltText } : {}),
    });
  }

  return notes;
}

/**
 * Initializes storage cache and starts background fetch
 */
export function initStudyNotes(): void {
  if (typeof window === 'undefined') return;

  if (!isInitializedFromStorage) {
    try {
      const cached = localStorage.getItem(STUDY_NOTES_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as RawStudyNote[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemoryNotes = parsed;
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
 * Fetches latest notes from Google Sheet CSV
 */
export async function fetchStudyNotesFromSheet(forceUrl?: string): Promise<RawStudyNote[]> {
  const targetUrl = forceUrl ? normalizeSheetUrl(forceUrl) : getEffectiveStudyNotesUrl();
  if (!targetUrl || targetUrl.includes('PASTE_YOUR_')) {
    return inMemoryNotes;
  }

  if (isFetchingFromSheet) {
    return inMemoryNotes;
  }

  isFetchingFromSheet = true;

  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: { Accept: 'text/csv, text/plain, */*' },
      cache: 'no-cache',
    });

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    const text = await res.text();
    const freshNotes = parseStudyNotesFromCSV(text);

    if (freshNotes.length > 0) {
      inMemoryNotes = freshNotes;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STUDY_NOTES_CACHE_KEY, JSON.stringify(freshNotes));
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
    .replace(/^st-sk-top-/, '');
}

/**
 * Maps standard topic IDs to sheet topic IDs and vice-versa
 */
const TOPIC_ALIASES: Record<string, string[]> = {
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
  const noteTopicNorm = normalizeId(note.topicId);
  const reqTopicNorm = normalizeId(requestedTopicId);

  if (noteTopicNorm === reqTopicNorm) return true;
  if (note.topicId.toLowerCase() === requestedTopicId.toLowerCase()) return true;

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
      const isCdp =
        (sNorm.includes('childdevelopment') || sNorm.includes('balvikas')) &&
        (noteSNorm.includes('childdevelopment') || noteSNorm.includes('balvikas'));
      if (!isCdp && noteSNorm && !noteSNorm.includes(sNorm) && !sNorm.includes(noteSNorm)) {
        return false;
      }
    }

    return doesNoteMatchTopic(note, topicId);
  });
}

/**
 * Converts a list of raw notes into the comprehensive StudyMaterial shape
 */
export function convertNotesToStudyMaterial(
  topicId: string,
  notes: RawStudyNote[]
): StudyMaterial | undefined {
  if (!notes || notes.length === 0) return undefined;

  const firstNote = notes[0];
  const intro =
    firstNote.content.length > 180
      ? `${firstNote.content.slice(0, 180)}...`
      : firstNote.content;

  const sections: MaterialSection[] = notes.map((note, index) => {
    // Break up content into paragraphs or bullet points if it has multiple sentences or semicolons
    const sentences = note.content
      .split(/(?<=[।?!])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const paragraphs: string[] = [];
    const bullets: string[] = [];

    if (sentences.length > 2 && note.content.includes(';')) {
      paragraphs.push(sentences[0]);
      const bulletParts = note.content
        .split(';')
        .map((p) => p.trim())
        .filter(Boolean);
      bullets.push(...bulletParts);
    } else {
      paragraphs.push(note.content);
    }

    return {
      heading: note.title || `Concept ${index + 1}`,
      subheading: note.importantPoint ? `मुख्य परीक्षा बिंदु: ${note.importantPoint}` : undefined,
      paragraphs,
      bullets: bullets.length > 0 ? bullets : undefined,
      images: note.diagramImageUrl
        ? [
            {
              src: note.diagramImageUrl,
              alt: note.diagramAltText || note.diagramCaption || note.title,
              caption: note.diagramCaption,
            },
          ]
        : undefined,
    };
  });

  const callouts: StudyMaterialCallout[] = [];
  const quickRevision: string[] = [];
  const keyTakeaways: string[] = [];

  notes.forEach((note) => {
    if (note.importantPoint && !keyTakeaways.includes(note.importantPoint)) {
      keyTakeaways.push(note.importantPoint);
    }
    if (note.examTip && !quickRevision.includes(note.examTip)) {
      quickRevision.push(note.examTip);
    }
  });

  // Highlight first two callouts if present
  if (firstNote.importantPoint) {
    callouts.push({
      label: 'Exam Focus (परीक्षा बिंदु)',
      title: firstNote.title,
      body: firstNote.importantPoint,
    });
  }
  if (firstNote.examTip) {
    callouts.push({
      label: 'Exam Tip (परीक्षा टिप)',
      title: 'स्मार्ट तैयारी संकेत',
      body: firstNote.examTip,
    });
  }

  return {
    topicId,
    intro,
    sections,
    callouts,
    keyTakeaways:
      keyTakeaways.length > 0
        ? keyTakeaways.slice(0, 8)
        : ['सभी अवधारणाओं को ध्यानपूर्वक पढ़ें व समझें।', 'परीक्षा के दृष्टिकोण से महत्वपूर्ण बिंदुओं को दोहराएं।'],
    quickRevision:
      quickRevision.length > 0
        ? quickRevision.slice(0, 8)
        : ['मुख्य परिभाषाओं को याद रखें।', 'विभिन्न अवधारणाओं के अंतर को समझें।'],
  };
}

/**
 * React hook to access Study Notes for a topic with live updates
 */
export function useTopicStudyNotes(
  topicId: string,
  examId?: string,
  subjectId?: string
) {
  const [notes, setNotes] = useState<RawStudyNote[]>(() =>
    getStudyNotesForTopic(topicId, examId, subjectId)
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initStudyNotes();
    const initial = getStudyNotesForTopic(topicId, examId, subjectId);
    setNotes((prev) => {
      if (prev.length === initial.length && prev.every((p, i) => p.id === initial[i]?.id)) {
        return prev;
      }
      return initial;
    });

    const unsubscribe = (_allNotes: RawStudyNote[]) => {
      const filtered = getStudyNotesForTopic(topicId, examId, subjectId);
      setNotes((prev) => {
        if (prev.length === filtered.length && prev.every((p, i) => p.id === filtered[i]?.id)) {
          return prev;
        }
        return filtered;
      });
    };

    subscribers.add(unsubscribe);
    return () => {
      subscribers.delete(unsubscribe);
    };
  }, [topicId, examId, subjectId]);

  const material = useMemo(
    () => convertNotesToStudyMaterial(topicId, notes),
    [topicId, notes]
  );

  const refresh = async () => {
    setIsLoading(true);
    try {
      await fetchStudyNotesFromSheet();
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
 * Generates sample CSV template content for Study Notes with Diagram columns
 */
export function generateSampleStudyNotesCSV(): string {
  const headers = ALL_STUDY_NOTES_HEADERS.join(',');
  const sampleRows = [
    [
      'NOTE-BIO-12-01',
      'cbse-class-12',
      'biology',
      'sexual-reproduction-in-flowering-plants',
      '"Structure of an Anatropous Ovule"',
      '"An anatropous ovule is the most common type of ovule found in angiosperms (approx. 82% of families). It consists of funicle (stalk), hilum (junction between ovule and stalk), integuments (outer and inner protective coats), micropyle (small opening for pollen tube entry), chalaza (basal part), nucellus (nutritive tissue), and the female gametophyte (embryo sac)."',
      '"In anatropous ovule, the body of the ovule turns completely through 180 degrees so that the micropyle comes close to the funicle."',
      '"Remember: Typical angiosperm embryo sac at maturity is 8-nucleate and 7-celled."',
      'PUBLISHED',
      '"https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80"',
      '"Figure 2.1: Diagrammatic view of a typical anatropous ovule showing integuments, micropyle and embryo sac"',
      '"Anatropous ovule diagram with labeled micropyle and chalaza"',
    ].join(','),
    [
      'NOTE-CDP-01',
      'super-tet',
      'bal-vikas-shikshan-vidhiyan',
      'bal-vikas-arth-prakriti',
      '"वृद्धि और विकास में अंतर (Growth vs Development)"',
      '"वृद्धि (Growth) शारीरिक और मात्रात्मक परिवर्तन है जिसे प्रत्यक्ष मापा जा सकता है (जैसे ऊँचाई और वजन)। विकास (Development) एक व्यापक व बहुआयामी प्रक्रिया है जिसमें शारीरिक, संज्ञानात्मक, संवेगात्मक, नैतिक और सामाजिक सभी प्रकार के गुणात्मक व मात्रात्मक परिवर्तन शामिल हैं।"',
      '"विकास गर्भधारण से लेकर जीवनपर्यंत (Womb to Tomb) चलने वाली निरंतर प्रक्रिया है।"',
      '"विकास के सिद्धांत: सिर से पैर की ओर (Cephalocaudal) तथा केंद्र से बाहर की ओर (Proximodistal)।"',
      'PUBLISHED',
      '""',
      '""',
      '""',
    ].join(','),
  ];

  return [headers, ...sampleRows].join('\n');
}
