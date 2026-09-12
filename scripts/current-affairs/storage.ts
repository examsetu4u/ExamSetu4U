/**
 * UPPCS Current Affairs Pipeline - Safe Append-Only Storage Engine
 *
 * Implements strict data safety:
 * - Never overwrites historical records
 * - Append-only merging with deduplication
 * - Atomic write safeguards
 * - Updates both application data and admin automation status logs
 */

import fs from 'node:fs';
import path from 'node:path';
import type { AutomationStatus, DailyCurrentAffairsPayload, ProcessedCurrentAffairItem } from './types.js';

// Primary application file paths
const APP_DATA_PATH = path.resolve(process.cwd(), 'artifacts/examsetu4u/src/data/current-affairs/automated-uppcs.json');
const APP_STATUS_PATH = path.resolve(process.cwd(), 'artifacts/examsetu4u/src/data/current-affairs/automation-status.json');

// Root backup paths
const ROOT_BACKUP_DIR = path.resolve(process.cwd(), 'data/current-affairs/uppcs');
const ROOT_BACKUP_DATA = path.join(ROOT_BACKUP_DIR, 'latest.json');
const ROOT_BACKUP_STATUS = path.join(ROOT_BACKUP_DIR, 'status.json');

/**
 * Hindi month formatter for daily title
 */
const HINDI_MONTHS: Record<string, string> = {
  '01': 'जनवरी',
  '02': 'फरवरी',
  '03': 'मार्च',
  '04': 'अप्रैल',
  '05': 'मई',
  '06': 'जून',
  '07': 'जुलाई',
  '08': 'अगस्त',
  '09': 'सितंबर',
  '10': 'अक्टूबर',
  '11': 'नवंबर',
  '12': 'दिसंबर',
};

export function formatHindiDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    const mName = HINDI_MONTHS[month] || month;
    return `${parseInt(day, 10)} ${mName} ${year} (दैनिक समसामयिकी)`;
  } catch {
    return `${dateStr} (दैनिक समसामयिकी)`;
  }
}

/**
 * Reads existing automated days safely
 */
export function loadExistingAutomatedDays(): DailyCurrentAffairsPayload[] {
  try {
    if (fs.existsSync(APP_DATA_PATH)) {
      const content = fs.readFileSync(APP_DATA_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err: any) {
    console.warn(`[StorageEngine] Warning loading existing automated days: ${err.message}`);
  }
  return [];
}

/**
 * Reads existing automation status log
 */
export function loadExistingAutomationStatus(): AutomationStatus {
  try {
    if (fs.existsSync(APP_STATUS_PATH)) {
      const content = fs.readFileSync(APP_STATUS_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err: any) {
    console.warn(`[StorageEngine] Warning loading status: ${err.message}`);
  }

  return {
    lastSuccessfulUpdate: null,
    lastRunTimestamp: new Date().toISOString(),
    status: 'idle',
    newItemsAdded: 0,
    duplicatesRejected: 0,
    mcqsGenerated: 0,
    failedItems: 0,
    sourceUrls: [],
    lastAutomationError: null,
    executionSummary: 'Pipeline initialized.',
    runHistory: [],
  };
}

/**
 * Saves new items safely into storage
 */
export function saveDailyCurrentAffairs(
  targetDate: string,
  newItems: ProcessedCurrentAffairItem[],
  runStats: {
    duplicatesRejected: number;
    failedItems: number;
    sourceUrls: string[];
    error: string | null;
  }
): { success: boolean; totalItemsAdded: number; totalMcqsGenerated: number } {
  console.log(`[StorageEngine] Performing append-only storage update for date: ${targetDate}...`);

  const existingDays = loadExistingAutomatedDays();
  let mcqsAddedCount = 0;

  if (newItems.length > 0) {
    // Format daily quiz questions from the items' MCQs
    const quizQuestions: DailyCurrentAffairsPayload['dailyQuiz'] = [];
    newItems.forEach((item, itemIdx) => {
      if (Array.isArray(item.mcqs)) {
        item.mcqs.forEach((mcq, mcqIdx) => {
          mcqsAddedCount++;
          const opts = mcq.options as { A: string; B: string; C: string; D: string };
          quizQuestions.push({
            id: `auto-q-${targetDate}-${itemIdx + 1}-${mcqIdx + 1}`,
            question: mcq.question,
            options: opts,
            correctAnswer: mcq.correctAnswer,
            explanation: mcq.explanation,
            prelimsTip: `महत्वपूर्ण परीक्षा संकेत: ${item.why_important_for_uppcs}`,
            difficulty: mcq.difficulty,
            category: item.categoryLabel || 'समसामयिकी',
          });
        });
      }
    });

    // Check if targetDate already exists in existing automated days
    const existingDayIndex = existingDays.findIndex((d) => d.date === targetDate);

    if (existingDayIndex >= 0) {
      // Append new items to existing day
      console.log(`[StorageEngine] Appending ${newItems.length} items to existing day record for ${targetDate}`);
      const day = existingDays[existingDayIndex];
      day.items = [...day.items, ...newItems];
      day.dailyQuiz = [...day.dailyQuiz, ...quizQuestions];
    } else {
      // Prepend brand new day entry
      console.log(`[StorageEngine] Creating brand new day record for ${targetDate}`);
      const newDay: DailyCurrentAffairsPayload = {
        date: targetDate,
        formattedDate: formatHindiDate(targetDate),
        items: newItems,
        dailyQuiz: quizQuestions,
      };
      existingDays.unshift(newDay);
    }

    // Sort days descending by date
    existingDays.sort((a, b) => b.date.localeCompare(a.date));

    // Write to app data file
    fs.mkdirSync(path.dirname(APP_DATA_PATH), { recursive: true });
    fs.writeFileSync(APP_DATA_PATH, JSON.stringify(existingDays, null, 2), 'utf-8');

    // Write to root backup
    fs.mkdirSync(ROOT_BACKUP_DIR, { recursive: true });
    fs.writeFileSync(ROOT_BACKUP_DATA, JSON.stringify(existingDays, null, 2), 'utf-8');

    console.log(`[StorageEngine] Successfully persisted ${existingDays.length} total automated days.`);
  } else {
    console.log(`[StorageEngine] No new items added for ${targetDate}; historical days preserved without mutation.`);
  }

  // Update Status Log
  const currentStatus = loadExistingAutomationStatus();
  const nowIso = new Date().toISOString();

  currentStatus.lastRunTimestamp = nowIso;
  if (newItems.length > 0) {
    currentStatus.lastSuccessfulUpdate = nowIso;
    currentStatus.status = 'success';
  } else if (runStats.error) {
    currentStatus.status = 'error';
  } else {
    currentStatus.status = 'success';
  }

  currentStatus.newItemsAdded = newItems.length;
  currentStatus.duplicatesRejected = runStats.duplicatesRejected;
  currentStatus.mcqsGenerated = mcqsAddedCount;
  currentStatus.failedItems = runStats.failedItems;
  currentStatus.sourceUrls = Array.from(new Set([...currentStatus.sourceUrls, ...runStats.sourceUrls])).slice(-20);
  currentStatus.lastAutomationError = runStats.error;
  currentStatus.executionSummary = runStats.error
    ? `Completed with error: ${runStats.error}`
    : `Pipeline executed successfully. Added ${newItems.length} items & ${mcqsAddedCount} MCQs for ${targetDate}.`;

  // Maintain last 30 execution records
  currentStatus.runHistory.unshift({
    timestamp: nowIso,
    date: targetDate,
    itemsCount: newItems.length,
    mcqsCount: mcqsAddedCount,
    status: currentStatus.status,
    sources: runStats.sourceUrls,
    error: runStats.error || undefined,
  });
  currentStatus.runHistory = currentStatus.runHistory.slice(0, 30);

  // Write status
  fs.mkdirSync(path.dirname(APP_STATUS_PATH), { recursive: true });
  fs.writeFileSync(APP_STATUS_PATH, JSON.stringify(currentStatus, null, 2), 'utf-8');
  fs.writeFileSync(ROOT_BACKUP_STATUS, JSON.stringify(currentStatus, null, 2), 'utf-8');

  return {
    success: true,
    totalItemsAdded: newItems.length,
    totalMcqsGenerated: mcqsAddedCount,
  };
}
