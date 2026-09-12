#!/usr/bin/env node
/**
 * UPPCS Current Affairs Automation Pipeline - Main Orchestrator
 *
 * Executes the daily scheduled pipeline:
 * 1. Computes IST date
 * 2. Fetches authoritative news from PIB, UP Govt, RBI
 * 3. Filters & generates high-yield Hindi notes + Prelims MCQs via Gemini
 * 4. Strictly validates all content and MCQs
 * 5. Runs multi-layered duplicate detection
 * 6. Safely appends approved items into application data and updates status log
 */

import { fetchLatestCurrentAffairs } from './fetch-news.js';
import { processNewsWithGemini } from './process-with-gemini.js';
import { validateCurrentAffairItem } from './validate.js';
import { deduplicateCandidates } from './deduplicate.js';
import { loadExistingAutomatedDays, saveDailyCurrentAffairs } from './storage.js';
import type { ProcessedCurrentAffairItem } from './types.js';

/**
 * Calculates current date in Indian Standard Time (IST, UTC+5:30)
 */
function getTodayIST(): string {
  const now = new Date();
  // IST is UTC + 5.5 hours
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().slice(0, 10);
}

async function runPipeline() {
  console.log('===============================================================');
  console.log('🚀 ExamSetu4U - UPPCS Current Affairs Automated Pipeline');
  console.log('===============================================================');

  // Parse command-line args
  const args = process.argv.slice(2);
  const dateArg = args.find((a) => a.startsWith('--date='))?.split('=')[1];
  const isDryRun = args.includes('--dry-run');

  const targetDate = dateArg || getTodayIST();
  console.log(`[Pipeline] Execution Date (IST): ${targetDate}`);
  console.log(`[Pipeline] Mode: ${isDryRun ? 'DRY-RUN (Simulated)' : 'PRODUCTION'}`);

  let runError: string | null = null;
  let duplicatesRejectedCount = 0;
  let failedValidationCount = 0;
  const sourceUrlsUsed: string[] = [];

  try {
    // 1. Fetch raw authoritative current affairs
    console.log('\n--- Step 1: Authoritative News Collection ---');
    const rawNews = await fetchLatestCurrentAffairs(targetDate);
    rawNews.forEach((rn) => {
      if (rn.sourceUrl && !sourceUrlsUsed.includes(rn.sourceUrl)) {
        sourceUrlsUsed.push(rn.sourceUrl);
      }
    });

    if (rawNews.length === 0) {
      console.log('[Pipeline] No qualifying government news found today. Existing data preserved.');
      saveDailyCurrentAffairs(targetDate, [], {
        duplicatesRejected: 0,
        failedItems: 0,
        sourceUrls: [],
        error: null,
      });
      return;
    }

    // 2. Gemini Processing
    console.log('\n--- Step 2: Gemini 3.8 Flash UPPCS Processing ---');
    const processedItems = await processNewsWithGemini(rawNews, targetDate);
    console.log(`[Pipeline] Gemini generated ${processedItems.length} candidate items.`);

    // 3. Validation & Quality Control
    console.log('\n--- Step 3: Strict Schema & MCQ Quality Control ---');
    const validatedItems: ProcessedCurrentAffairItem[] = [];

    processedItems.forEach((candidate, idx) => {
      const val = validateCurrentAffairItem(candidate, idx);
      if (val.isValid && val.sanitizedItem) {
        validatedItems.push(val.sanitizedItem);
      } else {
        failedValidationCount++;
        console.warn(`[Pipeline] Validation rejected candidate item #${idx + 1}: ${val.errors.join('; ')}`);
      }
    });
    console.log(`[Pipeline] Quality control passed: ${validatedItems.length}/${processedItems.length} items.`);

    // 4. Deduplication
    console.log('\n--- Step 4: Multi-Layered Duplicate Detection ---');
    const existingDays = loadExistingAutomatedDays();
    const { approvedItems, rejectedItems } = deduplicateCandidates(validatedItems, existingDays);
    duplicatesRejectedCount = rejectedItems.length;

    console.log(`[Pipeline] Approved unique items: ${approvedItems.length}`);
    console.log(`[Pipeline] Rejected duplicate items: ${duplicatesRejectedCount}`);

    // 5. Append-only Storage
    console.log('\n--- Step 5: Safe Storage & Applet Data Update ---');
    if (!isDryRun) {
      const result = saveDailyCurrentAffairs(targetDate, approvedItems, {
        duplicatesRejected: duplicatesRejectedCount,
        failedItems: failedValidationCount,
        sourceUrls: sourceUrlsUsed,
        error: null,
      });
      console.log(`[Pipeline] Successfully updated application store with ${result.totalItemsAdded} items and ${result.totalMcqsGenerated} MCQs.`);
    } else {
      console.log(`[Pipeline] DRY-RUN completed. ${approvedItems.length} items would have been committed.`);
    }
  } catch (err: any) {
    runError = err.message || 'Unknown pipeline execution error';
    console.error(`[Pipeline Error] Fatal error caught in pipeline: ${runError}`);

    // Persist error status without touching data
    saveDailyCurrentAffairs(targetDate, [], {
      duplicatesRejected: duplicatesRejectedCount,
      failedItems: failedValidationCount,
      sourceUrls: sourceUrlsUsed,
      error: runError,
    });
  }

  console.log('\n===============================================================');
  console.log('✅ UPPCS Current Affairs Pipeline Run Complete');
  console.log('===============================================================\n');
}

runPipeline().catch((err) => {
  console.error('[Fatal]', err);
  process.exit(1);
});
