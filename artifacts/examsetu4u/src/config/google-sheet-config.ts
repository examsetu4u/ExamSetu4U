/**
 * ============================================================================
 * EXAMSETU4U — GOOGLE SHEETS QUESTION BANK CONFIGURATION
 * ============================================================================
 * 
 * This file connects your Google Sheet Question Bank to ExamSetu4U.
 * You can add new MCQ questions every day from Google Sheets without touching code!
 * 
 * STEP-BY-STEP INSTRUCTIONS:
 * 1. Open your Google Sheet containing questions with the 20 required column headers.
 * 2. In Google Sheets menu, click: File -> Share -> Publish to web.
 * 3. Under "Link", choose: "Entire Document" (or your specific questions tab).
 * 4. Change "Web page" to: "Comma-separated values (.csv)".
 * 5. Click "Publish" (or "Start publishing") and copy the generated link.
 * 6. Paste your copied link below, replacing PASTE_YOUR_GOOGLE_SHEET_CSV_URL_HERE.
 * 7. Save this file and deploy/run the website.
 * 
 * REQUIRED FIRST ROW COLUMNS (Must match exactly):
 * id, examId, subjectId, topicId, question, optionA, optionB, optionC, optionD,
 * correctAnswer, explanation, importantPoint, additionalFact, commonMistake,
 * difficulty, sourceType, year, examName, status, sourceName
 * 
 * IMPORTANT:
 * - Only rows with status = PUBLISHED will appear to students.
 * - Rows with status = DRAFT, REVIEW, or ARCHIVED will not appear to students.
 * - If you want to test a sheet link immediately without editing this file,
 *   you can also use the "Test CSV URL" tool in the Admin panel (/admin).
 * ============================================================================
 */

export const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTrE6G3jc232hi18YHGANDvdgyjs1xyYw-UCbvYg2gCvrmtvpSXnDVA_FDG3izHZKk3dU2Q2L1awAAC/pub?gid=436392882&single=true&output=csv";

/**
 * MULTI-TAB GOOGLE SHEETS QUESTION SOURCES
 * All published question bank tabs from the ExamSetu4U Google Spreadsheet
 */
export interface GoogleSheetSourceConfig {
  id: string;
  name: string;
  examId: string;
  subjectId: string;
  gid: string;
  url: string;
}

export const GOOGLE_SHEET_QUESTION_SOURCES: GoogleSheetSourceConfig[] = [
  {
    id: 'cbse-10-maths',
    name: 'CBSE Class 10 Mathematics',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    gid: '884882832',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrE6G3jc232hi18YHGANDvdgyjs1xyYw-UCbvYg2gCvrmtvpSXnDVA_FDG3izHZKk3dU2Q2L1awAAC/pub?gid=884882832&single=true&output=csv',
  },
  {
    id: 'cbse-10-science',
    name: 'CBSE Class 10 Science',
    examId: 'cbse-class-10',
    subjectId: 'science',
    gid: '436392882',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrE6G3jc232hi18YHGANDvdgyjs1xyYw-UCbvYg2gCvrmtvpSXnDVA_FDG3izHZKk3dU2Q2L1awAAC/pub?gid=436392882&single=true&output=csv',
  },
  {
    id: 'shikshan-kaushal',
    name: 'Super TET Shikshan Kaushal',
    examId: 'super-tet',
    subjectId: 'shikshan-kaushal',
    gid: '0',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrE6G3jc232hi18YHGANDvdgyjs1xyYw-UCbvYg2gCvrmtvpSXnDVA_FDG3izHZKk3dU2Q2L1awAAC/pub?gid=0&single=true&output=csv',
  },
  {
    id: 'bal-vikas',
    name: 'Super TET Bal Vikas Vidhiyan',
    examId: 'super-tet',
    subjectId: 'child-development',
    gid: '2052787385',
    url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTrE6G3jc232hi18YHGANDvdgyjs1xyYw-UCbvYg2gCvrmtvpSXnDVA_FDG3izHZKk3dU2Q2L1awAAC/pub?gid=2052787385&single=true&output=csv',
  },
];

/**
 * GOOGLE SHEETS STUDY NOTES / THEORY CONFIGURATION
 * Multi-tab study notes sources
 */
export interface GoogleSheetNotesSourceConfig {
  id: string;
  name: string;
  examId: string;
  subjectId: string;
  chapterId?: string;
  gid: string;
  url: string;
}

export const CBSE_10_MATHS_NOTES_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTrE6G3jc232hi18YHGANDvdgyjs1xyYw-UCbvYg2gCvrmtvpSXnDVA_FDG3izHZKk3dU2Q2L1awAAC/pub?gid=491480742&single=true&output=csv";

export const STUDY_NOTES_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTrE6G3jc232hi18YHGANDvdgyjs1xyYw-UCbvYg2gCvrmtvpSXnDVA_FDG3izHZKk3dU2Q2L1awAAC/pub?gid=867134801&single=true&output=csv";

export const GOOGLE_SHEET_NOTES_SOURCES: GoogleSheetNotesSourceConfig[] = [
  {
    id: 'cbse-10-maths-notes',
    name: 'CBSE Class 10 Mathematics Notes (Real Numbers)',
    examId: 'cbse-class-10',
    subjectId: 'cbse-class-10-mathematics',
    chapterId: 'cbse-class-10-mathematics-1',
    gid: '491480742',
    url: CBSE_10_MATHS_NOTES_SHEET_CSV_URL,
  },
  {
    id: 'stet-notes',
    name: 'Super TET CDP Notes (Bal Vikas)',
    examId: 'super-tet',
    subjectId: 'super-tet-child-development',
    gid: '867134801',
    url: STUDY_NOTES_SHEET_CSV_URL,
  },
];
