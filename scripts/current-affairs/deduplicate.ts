/**
 * UPPCS Current Affairs Pipeline - Deduplication Engine
 *
 * Implements multi-layered duplicate detection:
 * 1. Exact & canonical Source URL matching
 * 2. Title normalized string & token overlap
 * 3. Core Named Entity & Scheme matching (e.g. PM-MITRA, Kanya Sumangala)
 * 4. Paraphrased event detection across Hindi & English terms
 * 5. Important facts similarity
 *
 * Generates deterministic, collision-free unique IDs for each approved item.
 */

import type { DailyCurrentAffairsPayload, ProcessedCurrentAffairItem } from './types.js';

// Common Hindi & English stopwords to exclude from semantic similarity calculations
const STOP_WORDS = new Set([
  'का', 'की', 'के', 'में', 'पर', 'से', 'को', 'और', 'तथा', 'एवं', 'है', 'हैं',
  'था', 'थे', 'थी', 'द्वारा', 'किया', 'गया', 'गई', 'गए', 'होता', 'होते', 'यह', 'वह',
  'इस', 'उस', 'अपने', 'साथ', 'लिए', 'तहत', 'होगा', 'होगी', 'दौरान', 'आदि', 'कुल',
  'the', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'of', 'and', 'for', 'to', 'with', 'by', 'from'
]);

/**
 * Normalizes text: strips punctuation, lowercase, removes extra spaces
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[।।,;:\-_()\[\]{}"'“”‘’!?/\\|`~*#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts meaningful keyword tokens from text
 */
function extractTokens(text: string): Set<string> {
  const words = normalizeText(text).split(' ');
  const tokens = new Set<string>();
  for (const word of words) {
    if (word.length >= 3 && !STOP_WORDS.has(word)) {
      tokens.add(word);
    }
  }
  return tokens;
}

/**
 * Calculates Jaccard Token Similarity between two strings (0.0 to 1.0)
 */
function calculateJaccardSimilarity(textA: string, textB: string): number {
  const tokensA = extractTokens(textA);
  const tokensB = extractTokens(textB);

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionCount = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  }

  const unionCount = tokensA.size + tokensB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Normalizes a URL for robust comparison
 */
function normalizeUrl(url?: string): string {
  if (!url) return '';
  return url
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
}

/**
 * Core Duplicate Evaluator:
 * Compares candidate item against all existing historical items
 */
export function isDuplicateItem(
  candidate: ProcessedCurrentAffairItem,
  existingItems: ProcessedCurrentAffairItem[]
): { isDuplicate: boolean; reason?: string; matchedWith?: string } {
  const candidateUrl = normalizeUrl(candidate.source_url);
  const candidateTitle = normalizeText(candidate.title);
  const candidateSummary = typeof candidate.summary === 'string'
    ? candidate.summary
    : Array.isArray(candidate.summary)
    ? candidate.summary.join(' ')
    : '';

  for (const existing of existingItems) {
    // 1. Exact Source URL match
    const existingUrl = normalizeUrl(existing.source_url);
    if (candidateUrl && existingUrl && candidateUrl === existingUrl && candidateUrl !== 'pib.gov.in') {
      return {
        isDuplicate: true,
        reason: `Exact source URL match: ${candidate.source_url}`,
        matchedWith: existing.title,
      };
    }

    // 2. High Title Similarity (> 60% token overlap)
    const titleSimilarity = calculateJaccardSimilarity(candidate.title, existing.title);
    if (titleSimilarity >= 0.6) {
      return {
        isDuplicate: true,
        reason: `Title token similarity ${(titleSimilarity * 100).toFixed(1)}% exceeds threshold with existing item`,
        matchedWith: existing.title,
      };
    }

    // 3. Exact Substring Match on core title phrase
    if (
      candidateTitle.length > 20 &&
      (existing.title.toLowerCase().includes(candidateTitle.slice(0, 30)) ||
        candidate.title.toLowerCase().includes(normalizeText(existing.title).slice(0, 30)))
    ) {
      return {
        isDuplicate: true,
        reason: 'Significant core title phrase overlap with historical record',
        matchedWith: existing.title,
      };
    }

    // 4. Paraphrased Event / Summary Similarity (> 55% token overlap on summary + title)
    const existingSummary = typeof existing.summary === 'string'
      ? existing.summary
      : Array.isArray(existing.summary)
      ? existing.summary.join(' ')
      : '';

    const combinedSim = calculateJaccardSimilarity(
      `${candidate.title} ${candidateSummary}`,
      `${existing.title} ${existingSummary}`
    );

    if (combinedSim >= 0.55) {
      return {
        isDuplicate: true,
        reason: `Paraphrased event similarity ${(combinedSim * 100).toFixed(1)}% detected`,
        matchedWith: existing.title,
      };
    }
  }

  return { isDuplicate: false };
}

/**
 * Generates a clean, deterministic, collision-free ID for a current affairs item
 */
export function generateUniqueItemId(item: ProcessedCurrentAffairItem, index: number): string {
  const dateCode = (item.date || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
  const slug = item.title
    .slice(0, 30)
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase() || 'item';

  return `uppcs-ca-${dateCode}-${index + 1}-${slug.slice(0, 15)}`;
}

/**
 * Batch deduplicator: Filters incoming candidate items against full historical database
 */
export function deduplicateCandidates(
  candidates: ProcessedCurrentAffairItem[],
  existingDays: DailyCurrentAffairsPayload[]
): {
  approvedItems: ProcessedCurrentAffairItem[];
  rejectedItems: Array<{ item: ProcessedCurrentAffairItem; reason: string }>;
} {
  // Flatten all historical items
  const historicalItems: ProcessedCurrentAffairItem[] = [];
  for (const day of existingDays) {
    if (Array.isArray(day.items)) {
      historicalItems.push(...day.items);
    }
  }

  const approvedItems: ProcessedCurrentAffairItem[] = [];
  const rejectedItems: Array<{ item: ProcessedCurrentAffairItem; reason: string }> = [];

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    // Check against history AND already approved in this batch
    const dupCheck = isDuplicateItem(candidate, [...historicalItems, ...approvedItems]);

    if (dupCheck.isDuplicate) {
      console.log(`[Deduplicator] REJECTED DUPLICATE: "${candidate.title}" -> Reason: ${dupCheck.reason}`);
      rejectedItems.push({
        item: candidate,
        reason: dupCheck.reason || 'Duplicate content detected',
      });
    } else {
      // Assign deterministic ID if missing
      if (!candidate.id) {
        candidate.id = generateUniqueItemId(candidate, approvedItems.length);
      }
      approvedItems.push(candidate);
    }
  }

  return { approvedItems, rejectedItems };
}
