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

export const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTrE6G3jc232hi18YHGANDvdgyjs1xyYw-UCbvYg2gCvrmtvpSXnDVA_FDG3izHZKk3dU2Q2L1awAAC/pub?output=csv";
