import { GOOGLE_SHEET_CSV_URL, GOOGLE_SHEET_QUESTION_SOURCES } from '@/config/google-sheet-config';
import type { MCQDifficulty, MCQQuestion, MCQSourceType } from '@/data/quiz/types';
import type {
  GoogleSheetBankReport,
  GoogleSheetRowStatus,
  GoogleSheetRowValidation,
  GoogleSheetStatus,
  RawGoogleSheetRow,
} from '@/types/google-sheet';

// Session override key for live testing in Admin without editing code
const SESSION_URL_KEY = 'examsetu4u_sheets_url_override_v1';
const PLACEHOLDER_URL = 'PASTE_YOUR_GOOGLE_SHEET_CSV_URL_HERE';

import { detectDiagramRequirement } from '@/components/diagrams/auto-generator/diagram-detector';

// Canonical required headers in order
export const REQUIRED_SHEET_HEADERS = [
  'id',
  'examId',
  'subjectId',
  'topicId',
  'question',
  'optionA',
  'optionB',
  'optionC',
  'optionD',
  'correctAnswer',
  'explanation',
  'importantPoint',
  'additionalFact',
  'commonMistake',
  'difficulty',
  'sourceType',
  'year',
  'examName',
  'status',
  'sourceName',
] as const;

// Optional Diagram Headers
export const OPTIONAL_DIAGRAM_HEADERS = [
  'diagramRequired',
  'diagramType',
  'diagramData',
  'diagramCaption',
  'diagramAltText',
  'diagramImageUrl',
] as const;

export const ALL_SHEET_HEADERS = [...REQUIRED_SHEET_HEADERS, ...OPTIONAL_DIAGRAM_HEADERS];

// Header aliases for tolerant CSV parsing
const HEADER_ALIASES: Record<string, string> = {
  id: 'id',
  'question id': 'id',
  questionid: 'id',
  examid: 'examId',
  'exam id': 'examId',
  exam_id: 'examId',
  subjectid: 'subjectId',
  'subject id': 'subjectId',
  subject_id: 'subjectId',
  topicid: 'topicId',
  'topic id': 'topicId',
  topic_id: 'topicId',
  question: 'question',
  question_text: 'question',
  optiona: 'optionA',
  'option a': 'optionA',
  option_a: 'optionA',
  optionb: 'optionB',
  'option b': 'optionB',
  option_b: 'optionB',
  optionc: 'optionC',
  'option c': 'optionC',
  option_c: 'optionC',
  optiond: 'optionD',
  'option d': 'optionD',
  option_d: 'optionD',
  correctanswer: 'correctAnswer',
  'correct answer': 'correctAnswer',
  correct_answer: 'correctAnswer',
  answer: 'correctAnswer',
  explanation: 'explanation',
  importantpoint: 'importantPoint',
  'important point': 'importantPoint',
  important_point: 'importantPoint',
  additionalfact: 'additionalFact',
  'additional fact': 'additionalFact',
  additional_fact: 'additionalFact',
  commonmistake: 'commonMistake',
  'common mistake': 'commonMistake',
  common_mistake: 'commonMistake',
  difficulty: 'difficulty',
  sourcetype: 'sourceType',
  'source type': 'sourceType',
  source_type: 'sourceType',
  year: 'year',
  examname: 'examName',
  'exam name': 'examName',
  exam_name: 'examName',
  status: 'status',
  sourcename: 'sourceName',
  'source name': 'sourceName',
  source_name: 'sourceName',
  // Visual Flow Architecture Aliases
  exam: 'examId',
  paper: 'paper',
  level: 'level',
  section: 'section',
  subject: 'subjectId',
  chapter: 'chapter',
  topic: 'topicId',
  subtopic: 'subTopic',
  'sub topic': 'subTopic',
  sub_topic: 'subTopic',
  questiontype: 'questionType',
  'question type': 'questionType',
  question_type: 'questionType',
  additionalinfo: 'additionalFact',
  'additional info': 'additionalFact',
  additional_info: 'additionalFact',
  ispyq: 'isPYQ',
  'is pyq': 'isPYQ',
  is_pyq: 'isPYQ',
  pyqyear: 'year',
  'pyq year': 'year',
  pyq_year: 'year',
  pyqreference: 'sourceName',
  'pyq reference': 'sourceName',
  pyq_reference: 'sourceName',
  language: 'language',
  // Diagram optional headers
  diagramrequired: 'diagramRequired',
  'diagram required': 'diagramRequired',
  diagram_required: 'diagramRequired',
  diagramtype: 'diagramType',
  'diagram type': 'diagramType',
  diagram_type: 'diagramType',
  diagramdata: 'diagramData',
  'diagram data': 'diagramData',
  diagram_data: 'diagramData',
  diagramcaption: 'diagramCaption',
  'diagram caption': 'diagramCaption',
  diagram_caption: 'diagramCaption',
  diagramalttext: 'diagramAltText',
  'diagram alt text': 'diagramAltText',
  'diagram alt': 'diagramAltText',
  diagram_alt_text: 'diagramAltText',
  diagramimageurl: 'diagramImageUrl',
  'diagram image url': 'diagramImageUrl',
  diagram_image_url: 'diagramImageUrl',
  imageurl: 'diagramImageUrl',
  'image url': 'diagramImageUrl',
};

// In-memory cache for high performance with 10,000+ questions
let cachedPublishedQuestions: MCQQuestion[] = [];
let cachedReport: GoogleSheetBankReport | null = null;
let isCurrentlyFetching = false;
let localQuestionIdsSupplier: (() => Set<string>) | null = null;
let onCacheInvalidateCallback: (() => void) | null = null;

// Subscribers
type BankListener = (report: GoogleSheetBankReport) => void;
const listeners = new Set<BankListener>();

export function registerLocalQuestionIdsSupplier(supplier: () => Set<string>): void {
  localQuestionIdsSupplier = supplier;
}

export function registerOnCacheInvalidate(callback: () => void): void {
  onCacheInvalidateCallback = callback;
}

export function subscribeToQuestionBank(listener: BankListener): () => void {
  listeners.add(listener);
  if (cachedReport) {
    listener(cachedReport);
  }
  return () => {
    listeners.delete(listener);
  };
}

function notifySubscribers(report: GoogleSheetBankReport): void {
  listeners.forEach((listener) => {
    try {
      listener(report);
    } catch (err) {
      console.error('[GoogleSheetLoader] Error in subscriber callback:', err);
    }
  });
}

/**
 * Gets effective Google Sheet CSV URL (session override or static config)
 */
export function getEffectiveSheetUrl(): string {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(SESSION_URL_KEY);
      if (local && local.trim() !== '') {
        return local.trim();
      }
      const override = sessionStorage.getItem(SESSION_URL_KEY);
      if (override && override.trim() !== '') {
        return override.trim();
      }
    } catch {
      // Ignore storage issues
    }
  }
  return GOOGLE_SHEET_CSV_URL.trim();
}

/**
 * Intelligently converts any Google Sheet URL (edit link, pubhtml, share link, etc.)
 * into a direct CSV export/download endpoint.
 */
export function normalizeGoogleSheetUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  // 1. Published HTML: https://docs.google.com/spreadsheets/d/e/2PACX-.../pubhtml...
  if (url.includes('/pubhtml')) {
    return url.replace('/pubhtml', '/pub?output=csv');
  }

  // 2. Published without output=csv: https://docs.google.com/spreadsheets/d/e/2PACX-.../pub
  if (url.includes('/pub') && !url.includes('output=csv')) {
    return `${url}${url.includes('?') ? '&' : '?'}output=csv`;
  }

  // 3. Regular sheet edit/view/sharing link: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit...
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
 * Sets an override URL for live testing in Admin and persisting across sessions
 */
export function setSessionSheetUrlOverride(url: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!url || url.trim() === '') {
      sessionStorage.removeItem(SESSION_URL_KEY);
      localStorage.removeItem(SESSION_URL_KEY);
    } else {
      const normalized = normalizeGoogleSheetUrl(url.trim());
      sessionStorage.setItem(SESSION_URL_KEY, normalized);
      localStorage.setItem(SESSION_URL_KEY, normalized);
    }
  } catch (err) {
    console.warn('[GoogleSheetLoader] Failed to update storage override:', err);
  }
}

/**
 * Returns true if the configured URL is ready to fetch (not empty and not the placeholder)
 */
export function isSheetConfigured(url: string = getEffectiveSheetUrl()): boolean {
  return url !== '' && url !== PLACEHOLDER_URL;
}

/**
 * Parses CSV text following RFC 4180 rules safely.
 * Handles multiline cells, quotes, escaped quotes (""), and Hindi/Unicode text.
 */
export function parseCSV(csvText: string): string[][] {
  const clean = csvText.replace(/^\uFEFF/, ''); // Strip UTF-8 BOM
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
          // Escaped quote: "" -> "
          currentCell += '"';
          i++; // Skip subsequent quote
        } else {
          // End of quoted cell
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
        if (nextChar === '\n') {
          i++; // Skip \n in \r\n
        }
        currentRow.push(currentCell.trim());
        currentCell = '';
        if (currentRow.some((c) => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        currentCell = '';
        if (currentRow.some((c) => c !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentCell += char;
      }
    }
  }

  // Trailing cell
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalizes difficulty input to existing MCQDifficulty
 */
function normalizeDifficulty(val: string): MCQDifficulty {
  const clean = (val || '').trim().toUpperCase().replace(/[\s_-]+/g, '');
  if (clean === 'EASY') return 'Easy';
  if (clean === 'HARD') return 'Hard';
  if (clean === 'VERYHARD') return 'Very Hard';
  return 'Moderate';
}

/**
 * Normalizes sourceType input to existing MCQSourceType
 */
function normalizeSourceType(val: string): MCQSourceType {
  const clean = (val || '').trim().toUpperCase().replace(/[\s_]+/g, '-');
  if (clean === 'PYQ') return 'PYQ';
  if (clean === 'PYQ-BASED' || clean === 'PYQBASED') return 'PYQ-based';
  return 'Practice';
}

/**
 * Normalizes status input to GoogleSheetRowStatus
 */
function normalizeStatus(val: string): GoogleSheetRowStatus | 'UNKNOWN' {
  const clean = (val || '').trim().toUpperCase();
  if (clean === 'PUBLISHED') return 'PUBLISHED';
  if (clean === 'DRAFT') return 'DRAFT';
  if (clean === 'REVIEW') return 'REVIEW';
  if (clean === 'ARCHIVED') return 'ARCHIVED';
  return 'UNKNOWN';
}

/**
 * Normalizes exam/subject names if not provided
 */
function formatExamNameFallback(examId: string): string {
  const map: Record<string, string> = {
    'super-tet': 'Super TET',
    'supertet': 'Super TET',
    'ctet': 'CTET',
    'ctet-paper-1': 'CTET Paper 1',
    'ctet-paper-2': 'CTET Paper 2',
    'uptet': 'UPTET',
    'ssc-cgl': 'SSC CGL',
    'cbse-class-10': 'CBSE Class 10',
    'cbse-10': 'CBSE Class 10',
    'cbse-class-12': 'CBSE Class 12',
    'cbse-12': 'CBSE Class 12',
    'uppcs-pre': 'UPPCS Pre',
    'uppcs-mains': 'UPPCS Mains',
  };
  return map[examId.toLowerCase()] || examId.toUpperCase();
}

/**
 * Canonical chapter names and canonical topicId normalization for CBSE Class 10 Mathematics.
 * Handles shorthand sheet codes like REAL_01, POLY_02, LE_03, QUAD_04, AP_05, TRI_06, COORD_07,
 * TRIG_08, CIRC_09, CONST_10, AREA_11, MENS_12, STAT_PROB_13, etc.
 */
export const CBSE_10_MATHS_CHAPTER_MAP: Record<string, { id: string; name: string; hindiName: string }> = {
  'cbse-class-10-mathematics-1': { id: 'cbse-class-10-mathematics-1', name: 'Real Numbers', hindiName: 'वास्तविक संख्याएँ' },
  'cbse-class-10-mathematics-2': { id: 'cbse-class-10-mathematics-2', name: 'Polynomials', hindiName: 'बहुपद' },
  'cbse-class-10-mathematics-3': { id: 'cbse-class-10-mathematics-3', name: 'Pair of Linear Equations in Two Variables', hindiName: 'दो चरों वाले रैखिक समीकरण युग्म' },
  'cbse-class-10-mathematics-4': { id: 'cbse-class-10-mathematics-4', name: 'Quadratic Equations', hindiName: 'द्विघात समीकरण' },
  'cbse-class-10-mathematics-5': { id: 'cbse-class-10-mathematics-5', name: 'Arithmetic Progressions', hindiName: 'समान्तर श्रेढ़ी' },
  'cbse-class-10-mathematics-6': { id: 'cbse-class-10-mathematics-6', name: 'Triangles', hindiName: 'त्रिभुज' },
  'cbse-class-10-mathematics-7': { id: 'cbse-class-10-mathematics-7', name: 'Coordinate Geometry', hindiName: 'निर्देशांक ज्यामिति' },
  'cbse-class-10-mathematics-8': { id: 'cbse-class-10-mathematics-8', name: 'Introduction to Trigonometry', hindiName: 'त्रिकोणमिति का परिचय' },
  'cbse-class-10-mathematics-9': { id: 'cbse-class-10-mathematics-9', name: 'Some Applications of Trigonometry', hindiName: 'त्रिकोणमिति के कुछ अनुप्रयोग' },
  'cbse-class-10-mathematics-10': { id: 'cbse-class-10-mathematics-10', name: 'Circles', hindiName: 'वृत्त' },
  'cbse-class-10-mathematics-11': { id: 'cbse-class-10-mathematics-11', name: 'Areas Related to Circles', hindiName: 'वृत्तों से संबंधित क्षेत्रफल' },
  'cbse-class-10-mathematics-12': { id: 'cbse-class-10-mathematics-12', name: 'Surface Areas and Volumes', hindiName: 'पृष्ठीय क्षेत्रफल और आयतन' },
  'cbse-class-10-mathematics-13': { id: 'cbse-class-10-mathematics-13', name: 'Statistics', hindiName: 'सांख्यिकी' },
  'cbse-class-10-mathematics-14': { id: 'cbse-class-10-mathematics-14', name: 'Probability', hindiName: 'प्रायिकता' },
};

export function normalizeMathsTopicAndChapter(
  rawTopic: string,
  questionText: string = '',
  existingChapter?: string
): { topicId: string; chapter: string; chapterId: string } {
  const clean = (rawTopic || '').trim();
  const norm = clean.toUpperCase().replace(/[\s-]+/g, '_');

  // If already canonical cbse-class-10-mathematics-X
  const canonicalMatch = clean.toLowerCase().match(/^cbse-class-10-mathematics-(\d+)$/);
  if (canonicalMatch) {
    const id = clean.toLowerCase();
    const info = CBSE_10_MATHS_CHAPTER_MAP[id];
    return {
      topicId: id,
      chapter: existingChapter || info?.name || `Chapter ${canonicalMatch[1]}`,
      chapterId: id,
    };
  }

  let resolvedId = '';
  if (norm === 'REAL_01' || norm === 'REAL_NUMBERS' || norm === 'REAL_NUMBER' || norm === 'REAL') {
    resolvedId = 'cbse-class-10-mathematics-1';
  } else if (norm === 'POLY_02' || norm === 'POLYNOMIALS' || norm === 'POLYNOMIAL') {
    resolvedId = 'cbse-class-10-mathematics-2';
  } else if (
    norm === 'LE_03' ||
    norm === 'LINEAR_EQUATIONS' ||
    norm === 'PAIR_OF_LINEAR_EQUATIONS' ||
    norm === 'PAIR_OF_LINEAR_EQUATIONS_IN_TWO_VARIABLES' ||
    norm.includes('LINEAR')
  ) {
    resolvedId = 'cbse-class-10-mathematics-3';
  } else if (norm === 'QUAD_04' || norm === 'QUADRATIC_EQUATIONS' || norm === 'QUADRATIC_EQUATION' || norm.includes('QUADRATIC')) {
    resolvedId = 'cbse-class-10-mathematics-4';
  } else if (norm === 'AP_05' || norm === 'ARITHMETIC_PROGRESSIONS' || norm === 'ARITHMETIC_PROGRESSION' || norm === 'AP') {
    resolvedId = 'cbse-class-10-mathematics-5';
  } else if (norm === 'TRI_06' || norm === 'TRIANGLES' || norm === 'TRIANGLE') {
    resolvedId = 'cbse-class-10-mathematics-6';
  } else if (norm === 'COORD_07' || norm === 'COORDINATE_GEOMETRY' || norm.includes('COORDINATE')) {
    resolvedId = 'cbse-class-10-mathematics-7';
  } else if (norm === 'TRIG_08' || norm === 'INTRODUCTION_TO_TRIGONOMETRY' || norm === 'TRIGONOMETRY') {
    const q = (questionText || '').toLowerCase();
    if (
      q.includes('height') ||
      q.includes('shadow') ||
      q.includes('elevation') ||
      q.includes('depression') ||
      q.includes('pole') ||
      q.includes('tower') ||
      q.includes('ऊँचाई') ||
      q.includes('अवनमन') ||
      q.includes('उन्नयन')
    ) {
      resolvedId = 'cbse-class-10-mathematics-9';
    } else {
      resolvedId = 'cbse-class-10-mathematics-8';
    }
  } else if (norm === 'SOME_APPLICATIONS_OF_TRIGONOMETRY' || norm === 'HEIGHTS_AND_DISTANCES') {
    resolvedId = 'cbse-class-10-mathematics-9';
  } else if (
    norm === 'CIRC_09' ||
    norm === 'CIRCLES' ||
    norm === 'CIRCLE' ||
    norm === 'CONST_10' ||
    norm === 'CONSTRUCTIONS'
  ) {
    resolvedId = 'cbse-class-10-mathematics-10';
  } else if (
    norm === 'AREA_10' ||
    norm === 'AREA_11' ||
    norm === 'AREAS_RELATED_TO_CIRCLES' ||
    norm.includes('AREA')
  ) {
    resolvedId = 'cbse-class-10-mathematics-11';
  } else if (
    norm === 'MENS_11' ||
    norm === 'MENS_12' ||
    norm === 'SURFACE_AREAS_AND_VOLUMES' ||
    norm === 'MENSURATION' ||
    norm.includes('SURFACE')
  ) {
    resolvedId = 'cbse-class-10-mathematics-12';
  } else if (
    norm === 'STAT_PROB_12' ||
    norm === 'STAT_PROB_13' ||
    norm === 'STATISTICS' ||
    norm === 'PROBABILITY' ||
    norm === 'STAT_PROB'
  ) {
    const q = (questionText || '').toLowerCase();
    const isProb =
      q.includes('probab') ||
      q.includes('die') ||
      q.includes('dice') ||
      q.includes('coin') ||
      q.includes('card') ||
      q.includes('event') ||
      q.includes('प्रायिकता') ||
      q.includes('सिक्का') ||
      q.includes('पासा') ||
      q.includes('ताश');
    resolvedId = isProb ? 'cbse-class-10-mathematics-14' : 'cbse-class-10-mathematics-13';
  }

  if (resolvedId && CBSE_10_MATHS_CHAPTER_MAP[resolvedId]) {
    const info = CBSE_10_MATHS_CHAPTER_MAP[resolvedId];
    return {
      topicId: resolvedId,
      chapter: existingChapter || info.name,
      chapterId: resolvedId,
    };
  }

  return {
    topicId: clean,
    chapter: existingChapter || clean,
    chapterId: clean,
  };
}

/**
 * Validates and converts raw CSV parsed rows into structured MCQQuestions
 */
export function validateAndConvertSheetRows(
  rawRows: string[][],
  existingLocalIds: Set<string> = new Set(),
  seenSheetIds: Set<string> = new Set()
): {
  validations: GoogleSheetRowValidation[];
  publishedQuestions: MCQQuestion[];
  counts: {
    totalRows: number;
    publishedCount: number;
    draftCount: number;
    reviewCount: number;
    archivedCount: number;
    malformedCount: number;
    duplicateCount: number;
  };
} {
  if (rawRows.length === 0) {
    return {
      validations: [],
      publishedQuestions: [],
      counts: {
        totalRows: 0,
        publishedCount: 0,
        draftCount: 0,
        reviewCount: 0,
        archivedCount: 0,
        malformedCount: 0,
        duplicateCount: 0,
      },
    };
  }

  // 1. Parse header row
  const headerRow = rawRows[0];
  const columnIndices = new Map<string, number>();

  headerRow.forEach((colName, index) => {
    const normalizedKey = colName.trim().toLowerCase().replace(/[\s_-]+/g, '');
    const canonical = HEADER_ALIASES[normalizedKey] || colName.trim();
    columnIndices.set(canonical, index);
  });

  const getCell = (row: string[], colKey: string): string => {
    const idx = columnIndices.get(colKey);
    if (idx === undefined || idx >= row.length) return '';
    return row[idx]?.trim() || '';
  };

  const validations: GoogleSheetRowValidation[] = [];
  const publishedQuestions: MCQQuestion[] = [];
  const seenIds = seenSheetIds;

  let draftCount = 0;
  let reviewCount = 0;
  let archivedCount = 0;
  let malformedCount = 0;
  let duplicateCount = 0;

  // Process rows starting from row 2 (index 1)
  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    // Skip completely empty rows
    if (row.length === 0 || row.every((c) => c === '')) continue;

    const id = getCell(row, 'id');
    const examId = getCell(row, 'examId');
    // Skip duplicate headers inside CSV (e.g. line 462 duplicate row)
    if (id.toLowerCase() === 'id' && examId.toLowerCase().includes('examid')) {
      continue;
    }

    const rowNum = r + 1;
    const errors: string[] = [];
    const warnings: string[] = [];

    const subjectId = getCell(row, 'subjectId');
    const topicId = getCell(row, 'topicId');
    const question = getCell(row, 'question');
    const optionA = getCell(row, 'optionA');
    const optionB = getCell(row, 'optionB');
    const optionC = getCell(row, 'optionC');
    const optionD = getCell(row, 'optionD');
    const rawAnswer = getCell(row, 'correctAnswer').toUpperCase();
    const explanation = getCell(row, 'explanation');
    const importantPoint = getCell(row, 'importantPoint');
    const additionalFact = getCell(row, 'additionalFact');
    const commonMistake = getCell(row, 'commonMistake');
    const rawDifficulty = getCell(row, 'difficulty');
    const rawSourceType = getCell(row, 'sourceType');
    const rawYear = getCell(row, 'year');
    const examName = getCell(row, 'examName');
    const rawStatus = getCell(row, 'status');

    // Visual Flow Architecture Fields
    const paper = getCell(row, 'paper');
    const level = getCell(row, 'level');
    const section = getCell(row, 'section');
    const chapter = getCell(row, 'chapter');
    const chapterId = getCell(row, 'chapterId');
    const subTopic = getCell(row, 'subTopic');
    const rawQuestionType = getCell(row, 'questionType').toUpperCase().replace(/[\s-]+/g, '_');
    const rawIsPYQ = getCell(row, 'isPYQ').toLowerCase().trim();
    const rawPyqYear = getCell(row, 'pyqYear') || getCell(row, 'year');
    const pyqReference = getCell(row, 'pyqReference') || getCell(row, 'sourceName');
    const language = getCell(row, 'language');

    // Diagram Columns
    const rawDiagramRequired = getCell(row, 'diagramRequired');
    const rawDiagramType = getCell(row, 'diagramType');
    const rawDiagramData = getCell(row, 'diagramData');
    const diagramCaption = getCell(row, 'diagramCaption');
    const diagramAltText = getCell(row, 'diagramAltText');
    const diagramImageUrl = getCell(row, 'diagramImageUrl');

    const status = normalizeStatus(rawStatus);

    if (status === 'DRAFT') draftCount++;
    else if (status === 'REVIEW') reviewCount++;
    else if (status === 'ARCHIVED') archivedCount++;
    else if (status === 'UNKNOWN') {
      warnings.push(`Unrecognized or missing status "${rawStatus}". Defaulting to DRAFT.`);
      draftCount++;
    }

    // Required Field Validations
    if (!id) errors.push('Missing "id"');
    if (!examId) errors.push('Missing "examId"');
    if (!subjectId) errors.push('Missing "subjectId"');
    if (!topicId) errors.push('Missing "topicId"');
    if (!question) errors.push('Missing "question" text');
    if (!optionA) errors.push('Missing "optionA"');
    if (!optionB) errors.push('Missing "optionB"');
    if (!optionC) errors.push('Missing "optionC"');
    if (!optionD) errors.push('Missing "optionD"');

    // Validate Correct Answer
    let normalizedAnswer: 'A' | 'B' | 'C' | 'D' = 'A';
    if (!rawAnswer) {
      errors.push('Missing "correctAnswer"');
    } else if (['A', 'B', 'C', 'D'].includes(rawAnswer)) {
      normalizedAnswer = rawAnswer as 'A' | 'B' | 'C' | 'D';
    } else {
      errors.push(`Invalid "correctAnswer" "${rawAnswer}". Must be A, B, C, or D.`);
    }

    // Duplicate ID checks
    if (id) {
      if (seenSheetIds.has(id)) {
        errors.push(`Duplicate ID "${id}" inside Google Sheet.`);
        duplicateCount++;
      } else {
        seenSheetIds.add(id);
      }

      // Check against existing local JSON questions
      if (existingLocalIds.has(id)) {
        errors.push(`Question ID "${id}" conflicts with an existing local question. Local question preserved.`);
        duplicateCount++;
      }
    }

    // Source Rules Validations
    const sourceType = normalizeSourceType(rawSourceType);
    let parsedYear: number | undefined;

    if (sourceType === 'PYQ') {
      if (!rawYear) {
        warnings.push('PYQ question is missing "year"');
      } else {
        const yNum = parseInt(rawYear, 10);
        if (Number.isNaN(yNum) || yNum < 1990 || yNum > 2030) {
          warnings.push(`"year" (${rawYear}) is not a recognized 4-digit exam year`);
        } else {
          parsedYear = yNum;
        }
      }
      if (!examName) {
        warnings.push('PYQ question is missing "examName"');
      }
    }

    const isValid = errors.length === 0;
    if (!isValid) {
      malformedCount++;
    }

    const isPublished = isValid && status === 'PUBLISHED';

    let convertedMCQ: MCQQuestion | undefined;
    if (isValid) {
      const isExplicitPYQ = ['true', 'yes', '1', 'y', 'हाँ'].includes(rawIsPYQ) || sourceType === 'PYQ';

      let effectiveTopicId = topicId;
      let effectiveChapter = chapter;
      let effectiveChapterId = chapterId;

      let effectiveExamId = examId;
      let effectiveSubjectId = subjectId;
      let effectiveExamName = examName;

      const normSubject = (subjectId || '').trim().toLowerCase();
      const normExam = (examId || '').trim().toLowerCase();
      if (
        normSubject === 'cbse-class-10-mathematics' ||
        normSubject === 'mathematics' ||
        normSubject === 'maths' ||
        (normExam === 'cbse-class-10' && (normSubject.includes('math') || !normSubject))
      ) {
        const normalizedMaths = normalizeMathsTopicAndChapter(topicId, question, chapter);
        effectiveTopicId = normalizedMaths.topicId;
        effectiveChapter = normalizedMaths.chapter;
        effectiveChapterId = normalizedMaths.chapterId;
        effectiveSubjectId = 'cbse-class-10-mathematics';
        effectiveExamId = 'cbse-class-10';
        effectiveExamName = examName || 'CBSE Class 10 Board';
      }

      convertedMCQ = {
        id,
        examId: effectiveExamId,
        examName: effectiveExamName || formatExamNameFallback(effectiveExamId),
        subjectId: effectiveSubjectId,
        topicId: effectiveTopicId,
        question,
        options: {
          A: optionA,
          B: optionB,
          C: optionC,
          D: optionD,
        },
        correctAnswer: normalizedAnswer,
        explanation: explanation || 'विस्तृत व्याख्या उपलब्ध नहीं है।',
        importantPoint: importantPoint || '',
        additionalFact: additionalFact || '',
        commonMistake: commonMistake || '',
        difficulty: normalizeDifficulty(rawDifficulty),
        sourceType: isExplicitPYQ ? 'PYQ' : sourceType,
        ...(parsedYear ? { year: parsedYear } : {}),
        ...(examName ? { examName } : {}),
        ...(paper ? { paper } : {}),
        ...(level ? { level } : {}),
        ...(section ? { section } : {}),
        ...(effectiveChapter ? { chapter: effectiveChapter } : {}),
        ...(effectiveChapterId ? { chapterId: effectiveChapterId } : {}),
        ...(subTopic ? { subTopic } : {}),
        ...(rawQuestionType ? { questionType: rawQuestionType } : {}),
        ...(isExplicitPYQ ? { isPYQ: true } : {}),
        ...(rawPyqYear && !Number.isNaN(parseInt(rawPyqYear, 10)) ? { pyqYear: parseInt(rawPyqYear, 10) } : {}),
        ...(pyqReference ? { pyqReference } : {}),
        ...(language ? { language } : {}),
      };

      // Handle Diagram properties from Sheet or fallback to automatic detection
      const trimmedDiagramRequired = rawDiagramRequired.toLowerCase().trim();
      const trimmedDiagramType = rawDiagramType.trim();
      const trimmedImageUrl = diagramImageUrl.trim();
      const isExplicitDiagram = ['true', 'yes', '1', 'y', 'required', 'हाँ', 'सही'].includes(trimmedDiagramRequired) || Boolean(trimmedDiagramType) || Boolean(trimmedImageUrl);

      let parsedDiagramData: any = undefined;
      if (rawDiagramData) {
        try {
          parsedDiagramData = JSON.parse(rawDiagramData);
        } catch {
          parsedDiagramData = { rawText: rawDiagramData };
        }
      }

      if (isExplicitDiagram) {
        convertedMCQ.diagramRequired = true;
        if (trimmedDiagramType) convertedMCQ.diagramType = trimmedDiagramType;
        if (parsedDiagramData) convertedMCQ.diagramData = parsedDiagramData;
        if (diagramCaption) convertedMCQ.diagramCaption = diagramCaption.trim();
        if (diagramAltText) convertedMCQ.diagramAltText = diagramAltText.trim();
        if (trimmedImageUrl) convertedMCQ.diagramImageUrl = trimmedImageUrl;
      } else {
        // Run smart detector automatically for Mathematics and Science questions
        const autoDetected = detectDiagramRequirement(question, {
          subjectId,
          topicId,
          explanation,
        });

        if (autoDetected.required && autoDetected.confidence >= 0.8) {
          convertedMCQ.diagramRequired = true;
          convertedMCQ.diagramType = autoDetected.type;
          convertedMCQ.diagramData = autoDetected.data;
          convertedMCQ.diagramCaption = autoDetected.caption;
          convertedMCQ.diagramAltText = autoDetected.altText;
        }
      }

      if (isPublished) {
        publishedQuestions.push(convertedMCQ);
      }
    }

    validations.push({
      rowNumber: rowNum,
      id: id || `Row #${rowNum}`,
      status,
      isValid,
      isPublished,
      errors,
      warnings,
      questionPreview: question ? (question.length > 70 ? `${question.slice(0, 70)}...` : question) : undefined,
      convertedMCQ,
    });
  }

  return {
    validations,
    publishedQuestions,
    counts: {
      totalRows: validations.length,
      publishedCount: publishedQuestions.length,
      draftCount,
      reviewCount,
      archivedCount,
      malformedCount,
      duplicateCount,
    },
  };
}

/**
 * Fetches and processes Google Sheet questions from the published CSV URL.
 * Never throws an uncaught error to prevent crashing student views.
 */
export async function fetchGoogleSheetQuestions(
  options: { forceRefresh?: boolean; targetUrl?: string } = {}
): Promise<GoogleSheetBankReport> {
  const targetUrl = options.targetUrl?.trim();

  // Determine all source URLs to fetch
  let urlsToFetch: string[] = [];
  if (targetUrl) {
    urlsToFetch = [normalizeGoogleSheetUrl(targetUrl)];
  } else {
    // 1. All configured sources (Class 10 Science, Shikshan Kaushal, Bal Vikas)
    const configuredSources = (GOOGLE_SHEET_QUESTION_SOURCES || []).map((s) =>
      normalizeGoogleSheetUrl(s.url)
    );
    // 2. The effective sheet URL (which might include session overrides)
    const effective = normalizeGoogleSheetUrl(getEffectiveSheetUrl());
    urlsToFetch = Array.from(new Set([...configuredSources, effective])).filter((u) =>
      isSheetConfigured(u)
    );
  }

  const primaryUrl = urlsToFetch[0] || normalizeGoogleSheetUrl(targetUrl || getEffectiveSheetUrl());

  // If no valid URLs are configured:
  if (urlsToFetch.length === 0) {
    const unconfiguredReport: GoogleSheetBankReport = {
      url: primaryUrl,
      isConfigured: false,
      status: 'unconfigured',
      statusMessage:
        'Google Sheet CSV URL is not configured yet. Set GOOGLE_SHEET_CSV_URL in src/config/google-sheet-config.ts or enter a URL in Admin.',
      lastFetchedAt: null,
      totalRows: 0,
      publishedCount: 0,
      draftCount: 0,
      reviewCount: 0,
      archivedCount: 0,
      malformedRowsCount: 0,
      duplicateIdsCount: 0,
      validations: [],
      publishedQuestions: [],
    };
    cachedReport = unconfiguredReport;
    cachedPublishedQuestions = [];
    notifySubscribers(unconfiguredReport);
    return unconfiguredReport;
  }

  // Prevent multiple concurrent fetches unless forced
  if (isCurrentlyFetching && !options.forceRefresh && cachedReport && cachedPublishedQuestions.length > 0) {
    return cachedReport;
  }

  isCurrentlyFetching = true;

  // Emit loading state
  const loadingReport: GoogleSheetBankReport = {
    url: primaryUrl,
    isConfigured: true,
    status: 'loading',
    statusMessage: 'Loading questions from Google Sheet...',
    lastFetchedAt: cachedReport?.lastFetchedAt || null,
    totalRows: cachedReport?.totalRows || 0,
    publishedCount: cachedPublishedQuestions.length,
    draftCount: cachedReport?.draftCount || 0,
    reviewCount: cachedReport?.reviewCount || 0,
    archivedCount: cachedReport?.archivedCount || 0,
    malformedRowsCount: cachedReport?.malformedRowsCount || 0,
    duplicateIdsCount: cachedReport?.duplicateIdsCount || 0,
    validations: cachedReport?.validations || [],
    publishedQuestions: cachedPublishedQuestions,
  };
  notifySubscribers(loadingReport);

  try {
    const localIds = localQuestionIdsSupplier ? localQuestionIdsSupplier() : new Set<string>();
    const seenIds = new Set<string>();
    const allValidations: GoogleSheetRowValidation[] = [];
    const allPublishedQuestions: MCQQuestion[] = [];
    let totalDraft = 0;
    let totalReview = 0;
    let totalArchived = 0;
    let totalMalformed = 0;
    let totalDuplicate = 0;
    let successfulFetches = 0;

    // Fetch all URLs in parallel
    const fetchPromises = urlsToFetch.map(async (u) => {
      const fetchUrl = options.forceRefresh
        ? `${u}${u.includes('?') ? '&' : '?'}_t=${Date.now()}`
        : u;
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          Accept: 'text/csv, text/plain, */*',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} - ${response.statusText}`);
      }
      const text = await response.text();
      return { url: u, text };
    });

    const results = await Promise.allSettled(fetchPromises);

    for (const res of results) {
      if (res.status === 'fulfilled' && res.value.text && res.value.text.trim().length > 0) {
        successfulFetches++;
        const parsedRows = parseCSV(res.value.text);
        const { validations, publishedQuestions, counts } = validateAndConvertSheetRows(
          parsedRows,
          localIds,
          seenIds
        );
        allValidations.push(...validations);
        allPublishedQuestions.push(...publishedQuestions);
        totalDraft += counts.draftCount;
        totalReview += counts.reviewCount;
        totalArchived += counts.archivedCount;
        totalMalformed += counts.malformedCount;
        totalDuplicate += counts.duplicateCount;
      } else if (res.status === 'rejected') {
        console.warn('[GoogleSheetLoader] Failed to fetch a sheet URL:', res.reason);
      }
    }

    if (successfulFetches === 0) {
      throw new Error('All configured Google Sheet URLs failed to return valid data.');
    }

    let status: GoogleSheetStatus = 'success';
    let statusMessage = `Loaded ${allPublishedQuestions.length} published questions across ${successfulFetches} sheet(s).`;

    if (allPublishedQuestions.length === 0) {
      status = 'empty';
      statusMessage = allValidations.length > 0
        ? `No published questions found (${allValidations.length} rows in Sheet, but none marked as PUBLISHED).`
        : 'No questions found in Google Sheet.';
    } else if (totalMalformed > 0) {
      statusMessage = `Loaded ${allPublishedQuestions.length} published questions (${totalMalformed} malformed rows skipped).`;
    }

    const successReport: GoogleSheetBankReport = {
      url: primaryUrl,
      isConfigured: true,
      status,
      statusMessage,
      lastFetchedAt: new Date().toISOString(),
      totalRows: allValidations.length,
      publishedCount: allPublishedQuestions.length,
      draftCount: totalDraft,
      reviewCount: totalReview,
      archivedCount: totalArchived,
      malformedRowsCount: totalMalformed,
      duplicateIdsCount: totalDuplicate,
      validations: allValidations,
      publishedQuestions: allPublishedQuestions,
    };

    cachedReport = successReport;
    cachedPublishedQuestions = allPublishedQuestions;

    // Invalidate mock test pool & other consumers
    if (onCacheInvalidateCallback) {
      try {
        onCacheInvalidateCallback();
      } catch (err) {
        console.warn('[GoogleSheetLoader] Invalidate callback error:', err);
      }
    }

    notifySubscribers(successReport);
    return successReport;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.warn('[GoogleSheetLoader] Failed to fetch Google Sheet CSV:', errorMsg);

    const errorReport: GoogleSheetBankReport = {
      url: primaryUrl,
      isConfigured: true,
      status: 'error',
      statusMessage: `Unable to load Google Sheet. Please check the published CSV link. (${errorMsg})`,
      lastFetchedAt: cachedReport?.lastFetchedAt || null,
      totalRows: cachedReport?.totalRows || 0,
      publishedCount: cachedPublishedQuestions.length,
      draftCount: cachedReport?.draftCount || 0,
      reviewCount: cachedReport?.reviewCount || 0,
      archivedCount: cachedReport?.archivedCount || 0,
      malformedRowsCount: cachedReport?.malformedRowsCount || 0,
      duplicateIdsCount: cachedReport?.duplicateIdsCount || 0,
      validations: cachedReport?.validations || [],
      publishedQuestions: cachedPublishedQuestions,
    };

    cachedReport = errorReport;
    notifySubscribers(errorReport);
    return errorReport;
  } finally {
    isCurrentlyFetching = false;
  }
}

/**
 * Returns all active published questions from Google Sheets currently held in memory.
 * Never mutates original data and does NOT touch localStorage.
 */
export function getPublishedGoogleSheetQuestions(): MCQQuestion[] {
  return cachedPublishedQuestions;
}

/**
 * Gets the current Google Sheet report snapshot
 */
export function getGoogleSheetReport(): GoogleSheetBankReport | null {
  return cachedReport;
}

/**
 * Re-fetches the published Google Sheet questions (forces fresh network request)
 */
export async function refreshGoogleSheetQuestions(): Promise<GoogleSheetBankReport> {
  return fetchGoogleSheetQuestions({ forceRefresh: true });
}

/**
 * Generates sample CSV template content with the 20 columns and sample rows
 */
export function generateSampleGoogleSheetCSV(): string {
  const headers = ALL_SHEET_HEADERS.join(',');
  const sampleRows = [
    [
      'ST-SK-1001',
      'super-tet',
      'super-tet-teaching-skills',
      'super-tet-teaching-skills-1',
      '"शिक्षण अधिगम की परिस्थितियों को व्यवस्थित करने की कला और विज्ञान दोनों है। यह कथन शिक्षण की किस प्रकृति को स्पष्ट करता है?"',
      '"शिक्षण केवल सैद्धांतिक ज्ञान का स्थानांतरण है"',
      '"शिक्षण उद्देश्यपूर्ण, वैज्ञानिक और रचनात्मक प्रक्रिया है"',
      '"शिक्षण केवल कक्षा-कक्ष तक ही सीमित प्रक्रिया है"',
      '"शिक्षण पूरी तरह जन्मजात प्रतिभा पर निर्भर करता है"',
      'B',
      '"शिक्षण कला और विज्ञान दोनों है। विज्ञान के रूप में यह सुव्यवस्थित नियमों पर आधारित है तथा कला के रूप में रचनात्मक प्रस्तुति पर।"',
      '"शिक्षण उद्देश्यपूर्ण, सुनियोजित तथा संप्रेषणीय प्रक्रिया है।"',
      '"एन. एल. गेज के अनुसार शिक्षण एक पारस्परिक प्रभाव है।"',
      '"शिक्षण को केवल कला या केवल विज्ञान मान लेना सामान्य भूल है।"',
      'EASY',
      'PRACTICE',
      '',
      'Super TET',
      'PUBLISHED',
      'ExamSetu Question Team',
      'false',
      '',
      '',
      '',
      '',
      '',
    ].join(','),
    [
      'CBSE10-SCI-4001',
      'cbse-class-10',
      'cbse-class-10-science',
      'cbse-class-10-science-1',
      '"In the given experimental setup of electrolysis of water, identify the gas collected in test tube A and test tube B respectively."',
      '"A: Oxygen, B: Hydrogen"',
      '"A: Hydrogen, B: Oxygen"',
      '"A: Nitrogen, B: Hydrogen"',
      '"A: Carbon dioxide, B: Oxygen"',
      'B',
      '"Water decomposes into hydrogen and oxygen in a 2:1 volume ratio: 2H2O(l) -> 2H2(g) + O2(g). The cathode collects twice the volume of gas (Hydrogen), while the anode collects Oxygen."',
      '"Volume of gas collected at cathode (Hydrogen) is double that of anode (Oxygen)."',
      '"Cathode is negatively charged; Anode is positively charged."',
      '"Confusing cathode and anode gas collections."',
      'MODERATE',
      'PRACTICE',
      '',
      'CBSE Class 10 Science',
      'PUBLISHED',
      'CBSE Science Desk',
      'true',
      'image',
      '',
      '"Figure 1.6: Electrolysis of water experimental setup"',
      '"Electrolysis of water showing anode, cathode and graduated test tubes"',
      '"https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80"',
    ].join(','),
    [
      'CTET-CDP-2001',
      'ctet',
      'ctet-child-development',
      'ctet-child-development-1',
      '"लेव वाइगोत्स्की (Lev Vygotsky) के सामाजिक-सांस्कृतिक सिद्धांत के अनुसार बालक के विकास में सबसे महत्वपूर्ण कारक कौन सा है?"',
      '"आनुवंशिकी और जैविक परिपक्वता"',
      '"सामाजिक अंतःक्रिया और भाषा"',
      '"सजा और पुरस्कार"',
      '"भौतिक पर्यावरण"',
      'B',
      '"वाइगोत्स्की के अनुसार संज्ञानात्मक विकास सामाजिक संपर्क और भाषा के माध्यम से होता है। Zone of Proximal Development (ZPD) और Scaffolding इनकी प्रमुख अवधारणाएं हैं।"',
      '"ZPD: वास्तविक विकास स्तर और संभावित विकास स्तर के बीच की दूरी।"',
      '"वाइगोत्स्की ने निजी वार्ता (Private Speech) को स्वनियमन का साधन माना।"',
      '"पियाजे और वाइगोत्स्की के दृष्टिकोण में भ्रमित होना।"',
      'MODERATE',
      'PYQ',
      '2021',
      'CTET Paper 1',
      'PUBLISHED',
      'CTET Official PYQ',
      'false',
      '',
      '',
      '',
      '',
      '',
    ].join(','),
    [
      'UPPCS-GS-5001',
      'uppcs-pre',
      'uppcs-pre-general-studies-1',
      'uppcs-pre-general-studies-1-1',
      '"उत्तर प्रदेश की सीमा भारत के कुल कितने राज्यों एवं केंद्रशासित प्रदेशों से स्पर्श करती है?"',
      '"7 राज्य और 1 केंद्रशासित प्रदेश"',
      '"8 राज्य और 1 केंद्रशासित प्रदेश (कुल 9)"',
      '"9 राज्य और 1 केंद्रशासित प्रदेश"',
      '"8 राज्य और 2 केंद्रशासित प्रदेश"',
      'B',
      '"उत्तर प्रदेश की सीमा 8 राज्यों (उत्तराखंड, हिमाचल प्रदेश, हरियाणा, राजस्थान, मध्य प्रदेश, छत्तीसगढ़, झारखंड, बिहार) और 1 केंद्रशासित प्रदेश (दिल्ली) को स्पर्श करती है। कुल मिलाकर 9 हैं।"',
      '"मध्य प्रदेश के साथ उत्तर प्रदेश की सबसे लंबी सीमा लगती है (11 जिले)।"',
      '"सोनभद्र जिला 4 राज्यों (मध्य प्रदेश, छत्तीसगढ़, झारखंड, बिहार) की सीमा को स्पर्श करता है।"',
      '"दिल्ली को अलग से न गिनकर केवल 8 लगा देना."',
      'MODERATE',
      'PYQ',
      '2019',
      'UPPCS Pre GS 1',
      'PUBLISHED',
      'UPPCS Previous Year Paper',
      'false',
      '',
      '',
      '',
      '',
      '',
    ].join(','),
  ];

  return [headers, ...sampleRows].join('\n');
}
