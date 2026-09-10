import type {
  AdminExam,
  AdminQuestion,
  AdminStudyMaterial,
  AdminSubject,
  AdminTopic,
  ContentDifficulty,
  ContentSourceType,
  ContentStatus,
  ValidationResult,
} from '../types';
import { validateQuestion } from './validation-service';

export interface ImportPreviewResult {
  totalParsed: number;
  validCount: number;
  errorCount: number;
  items: {
    question: AdminQuestion;
    validation: ValidationResult;
  }[];
  parseErrors: string[];
}

// Robust CSV Line Parser (handles quoted strings with commas and escaped quotes)
function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Split CSV text into rows respecting multiline quotes
function splitCSVLines(csvText: string): string[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = '';
      if (char === '\r' && csvText[i + 1] === '\n') {
        i++; // skip CRLF
      }
    } else {
      currentLine += char;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  return lines;
}

/**
 * Preview and validate questions from a JSON string without mutating database.
 */
export function previewImportQuestionsJSON(
  rawJson: string,
  existingQuestions: AdminQuestion[] = []
): ImportPreviewResult {
  const parseErrors: string[] = [];
  let parsedRaw: any[] = [];

  try {
    const data = JSON.parse(rawJson);
    if (Array.isArray(data)) {
      parsedRaw = data;
    } else if (data && typeof data === 'object' && Array.isArray(data.questions)) {
      parsedRaw = data.questions;
    } else {
      parseErrors.push('JSON root must be an array of question objects or an object with a "questions" array.');
      return { totalParsed: 0, validCount: 0, errorCount: 0, items: [], parseErrors };
    }
  } catch (err: any) {
    parseErrors.push(`JSON Syntax Error: ${err.message || 'Invalid JSON format'}`);
    return { totalParsed: 0, validCount: 0, errorCount: 0, items: [], parseErrors };
  }

  const items: { question: AdminQuestion; validation: ValidationResult }[] = [];
  let validCount = 0;
  let errorCount = 0;

  parsedRaw.forEach((row, idx) => {
    try {
      const q: AdminQuestion = {
        id: String(row.id || `imp-q-${Date.now()}-${idx + 1}`).trim(),
        examId: String(row.examId || '').trim(),
        subjectId: String(row.subjectId || '').trim(),
        topicId: String(row.topicId || '').trim(),
        question: String(row.question || '').trim(),
        options: {
          A: String(row.options?.A || row.optionA || '').trim(),
          B: String(row.options?.B || row.optionB || '').trim(),
          C: String(row.options?.C || row.optionC || '').trim(),
          D: String(row.options?.D || row.optionD || '').trim(),
        },
        correctAnswer: (['A', 'B', 'C', 'D'].includes(String(row.correctAnswer).toUpperCase())
          ? String(row.correctAnswer).toUpperCase()
          : 'A') as 'A' | 'B' | 'C' | 'D',
        explanation: String(row.explanation || '').trim(),
        importantPoint: String(row.importantPoint || '').trim(),
        additionalFact: String(row.additionalFact || '').trim(),
        commonMistake: String(row.commonMistake || '').trim(),
        difficulty: (['EASY', 'MODERATE', 'HARD', 'VERY_HARD'].includes(String(row.difficulty).toUpperCase())
          ? String(row.difficulty).toUpperCase()
          : 'MODERATE') as ContentDifficulty,
        sourceType: (['PYQ', 'PYQ-BASED', 'PRACTICE'].includes(String(row.sourceType).toUpperCase())
          ? String(row.sourceType).toUpperCase()
          : 'PRACTICE') as ContentSourceType,
        year: row.year ? Number(row.year) : undefined,
        examName: row.examName ? String(row.examName).trim() : undefined,
        status: (['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'].includes(String(row.status).toUpperCase())
          ? String(row.status).toUpperCase()
          : 'DRAFT') as ContentStatus,
      };

      const validation = validateQuestion(q, existingQuestions);
      if (validation.status === 'ERROR') errorCount++;
      else validCount++;

      items.push({ question: q, validation });
    } catch (itemErr: any) {
      parseErrors.push(`Item #${idx + 1} mapping error: ${itemErr.message}`);
    }
  });

  return {
    totalParsed: items.length,
    validCount,
    errorCount,
    items,
    parseErrors,
  };
}

/**
 * Preview and validate questions from CSV format without mutating database.
 */
export function previewImportQuestionsCSV(
  csvContent: string,
  existingQuestions: AdminQuestion[] = []
): ImportPreviewResult {
  const parseErrors: string[] = [];
  const lines = splitCSVLines(csvContent);

  if (lines.length < 2) {
    parseErrors.push('CSV requires at least a header row and one question data row.');
    return { totalParsed: 0, validCount: 0, errorCount: 0, items: [], parseErrors };
  }

  const headerRow = parseCSVRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const getColIdx = (...names: string[]) => {
    for (const name of names) {
      const idx = headerRow.indexOf(name.toLowerCase());
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const colId = getColIdx('id', 'qid');
  const colExamId = getColIdx('examid', 'exam');
  const colSubjectId = getColIdx('subjectid', 'subject');
  const colTopicId = getColIdx('topicid', 'topic');
  const colQuestion = getColIdx('question', 'prompt', 'questiontext');
  const colA = getColIdx('optiona', 'a', 'choicea');
  const colB = getColIdx('optionb', 'b', 'choiceb');
  const colC = getColIdx('optionc', 'c', 'choicec');
  const colD = getColIdx('optiond', 'd', 'choiced');
  const colAnswer = getColIdx('correctanswer', 'answer', 'correctoption');
  const colExplanation = getColIdx('explanation', 'reason');
  const colPoint = getColIdx('importantpoint', 'point');
  const colFact = getColIdx('additionalfact', 'fact');
  const colMistake = getColIdx('commonmistake', 'mistake');
  const colDifficulty = getColIdx('difficulty');
  const colSourceType = getColIdx('sourcetype', 'source');
  const colYear = getColIdx('year');
  const colExamName = getColIdx('examname');
  const colStatus = getColIdx('status');

  const items: { question: AdminQuestion; validation: ValidationResult }[] = [];
  let validCount = 0;
  let errorCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVRow(lines[i]);
    if (cols.length < 5) continue; // Skip malformed empty rows

    const q: AdminQuestion = {
      id: (colId !== -1 ? cols[colId] : '') || `imp-csv-${Date.now()}-${i}`,
      examId: colExamId !== -1 ? cols[colExamId] : '',
      subjectId: colSubjectId !== -1 ? cols[colSubjectId] : '',
      topicId: colTopicId !== -1 ? cols[colTopicId] : '',
      question: colQuestion !== -1 ? cols[colQuestion] : '',
      options: {
        A: colA !== -1 ? cols[colA] : '',
        B: colB !== -1 ? cols[colB] : '',
        C: colC !== -1 ? cols[colC] : '',
        D: colD !== -1 ? cols[colD] : '',
      },
      correctAnswer: ((colAnswer !== -1 && ['A', 'B', 'C', 'D'].includes(cols[colAnswer]?.toUpperCase()))
        ? cols[colAnswer].toUpperCase()
        : 'A') as 'A' | 'B' | 'C' | 'D',
      explanation: colExplanation !== -1 ? cols[colExplanation] : '',
      importantPoint: colPoint !== -1 ? cols[colPoint] : '',
      additionalFact: colFact !== -1 ? cols[colFact] : '',
      commonMistake: colMistake !== -1 ? cols[colMistake] : '',
      difficulty: (colDifficulty !== -1 && ['EASY', 'MODERATE', 'HARD', 'VERY_HARD'].includes(cols[colDifficulty]?.toUpperCase())
        ? cols[colDifficulty].toUpperCase()
        : 'MODERATE') as ContentDifficulty,
      sourceType: (colSourceType !== -1 && ['PYQ', 'PYQ-BASED', 'PRACTICE'].includes(cols[colSourceType]?.toUpperCase())
        ? cols[colSourceType].toUpperCase()
        : 'PRACTICE') as ContentSourceType,
      year: colYear !== -1 && cols[colYear] ? parseInt(cols[colYear], 10) || undefined : undefined,
      examName: colExamName !== -1 ? cols[colExamName] : undefined,
      status: (colStatus !== -1 && ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'].includes(cols[colStatus]?.toUpperCase())
        ? cols[colStatus].toUpperCase()
        : 'DRAFT') as ContentStatus,
    };

    const validation = validateQuestion(q, existingQuestions);
    if (validation.status === 'ERROR') errorCount++;
    else validCount++;

    items.push({ question: q, validation });
  }

  return {
    totalParsed: items.length,
    validCount,
    errorCount,
    items,
    parseErrors,
  };
}

// -------------------------------------------------------------
// EXPORT UTILITIES (DOWNLOADABLE AS BLOBS)
// -------------------------------------------------------------
function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportQuestionsJSON(questions: AdminQuestion[]): void {
  const json = JSON.stringify(questions, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(json, `examsetu4u_questions_${dateStr}.json`, 'application/json');
}

export function exportQuestionsCSV(questions: AdminQuestion[]): void {
  const headers = [
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
  ];

  const escapeCSV = (str: string | number | undefined) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = questions.map((q) =>
    [
      escapeCSV(q.id),
      escapeCSV(q.examId),
      escapeCSV(q.subjectId),
      escapeCSV(q.topicId),
      escapeCSV(q.question),
      escapeCSV(q.options.A),
      escapeCSV(q.options.B),
      escapeCSV(q.options.C),
      escapeCSV(q.options.D),
      escapeCSV(q.correctAnswer),
      escapeCSV(q.explanation),
      escapeCSV(q.importantPoint),
      escapeCSV(q.additionalFact),
      escapeCSV(q.commonMistake),
      escapeCSV(q.difficulty),
      escapeCSV(q.sourceType),
      escapeCSV(q.year),
      escapeCSV(q.examName),
      escapeCSV(q.status),
    ].join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `examsetu4u_questions_${dateStr}.csv`, 'text/csv;charset=utf-8;');
}

export function exportStudyMaterialJSON(materials: AdminStudyMaterial[]): void {
  const json = JSON.stringify(materials, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(json, `examsetu4u_study_material_${dateStr}.json`, 'application/json');
}

export function exportSyllabusJSON(exams: AdminExam[], subjects: AdminSubject[], topics: AdminTopic[]): void {
  const payload = {
    generatedAt: new Date().toISOString(),
    exams,
    subjects,
    topics,
  };
  const json = JSON.stringify(payload, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(json, `examsetu4u_syllabus_${dateStr}.json`, 'application/json');
}

// -------------------------------------------------------------
// SAMPLE TEMPLATES FOR ADMIN PREVIEW & IMPORT TESTING
// -------------------------------------------------------------
export const SAMPLE_JSON_IMPORT_TEMPLATE = `[
  {
    "id": "st-pedagogy-demo-01",
    "examId": "super-tet",
    "subjectId": "super-tet-teaching-skills",
    "topicId": "super-tet-teaching-skills-1",
    "question": "प्रभावी कक्षा शिक्षण में शिक्षक की सबसे महत्वपूर्ण भूमिका क्या होती है?",
    "options": {
      "A": "केवल व्याख्यान देना",
      "B": "अधिगम को सुगम बनाने वाले (Facilitator) के रूप में कार्य करना",
      "C": "केवल अनुशासन बनाए रखना",
      "D": "कठोर गृहकार्य देना"
    },
    "correctAnswer": "B",
    "explanation": "राष्ट्रीय पाठ्यचर्या रूपरेखा (NCF 2005) के अनुसार शिक्षक ज्ञान का निर्माता या सुगमकर्ता (Facilitator) है।",
    "importantPoint": "NCF 2005 = शिक्षक की भूमिका सुगमकर्ता की है।",
    "additionalFact": "रचनावादी उपागम (Constructivism) में छात्र स्वयं ज्ञान का सृजन करते हैं।",
    "commonMistake": "शिक्षक को केवल सूचना प्रदाता समझ लेना।",
    "difficulty": "EASY",
    "sourceType": "PRACTICE",
    "status": "DRAFT"
  }
]`;

export const SAMPLE_CSV_IMPORT_TEMPLATE = `id,examId,subjectId,topicId,question,optionA,optionB,optionC,optionD,correctAnswer,explanation,importantPoint,additionalFact,commonMistake,difficulty,sourceType,year,examName,status
"st-pyq-demo-02","super-tet","super-tet-child-development","super-tet-child-development-1","जीन पियाजे के अनुसार संज्ञानात्मक विकास की मूर्त संक्रियात्मक अवस्था (Concrete Operational Stage) की आयु क्या है?","0 से 2 वर्ष","2 से 7 वर्ष","7 से 11 वर्ष","11 से 15 वर्ष","C","मूर्त संक्रियात्मक अवस्था 7 से 11 वर्ष की होती है जिसमें बच्चा मूर्त वस्तुओं पर तार्किक चिंतन शुरू करता है।","मूर्त संक्रियात्मक = 7-11 वर्ष (संरक्षण, वर्गीकरण, प्रतिवर्तीता)।","पियाजे ने संज्ञानात्मक विकास को 4 प्रमुख अवस्थाओं में विभाजित किया।","पूर्व संक्रियात्मक (2-7 वर्ष) से भ्रमित होना।","MODERATE","PYQ","2021","UPTET Paper 1","PUBLISHED"`;
