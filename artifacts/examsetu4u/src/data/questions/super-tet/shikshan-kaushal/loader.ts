import type { MCQQuestion } from '@/data/quiz/types';
import batch001 from './questions-001.json';
import type {
  BatchValidationReport,
  MCQDifficultyEnum,
  MCQSourceTypeEnum,
  ShikshanKaushalContentCoverage,
  ShikshanKaushalMCQ,
} from './schema';
import { SHIKSHAN_KAUSHAL_TOPICS, getTopicDefinition, resolveTopicId } from './topics';
import { detectDuplicateQuestions, validateQuestionBatch } from './validator';

const IMPORTED_BATCHES_STORAGE_KEY = 'examsetu4u_sk_imported_batches_v1';

// Static files registry. As batches 002 to 010 are added, they are placed in this directory
const STATIC_BATCHES: Record<string, ShikshanKaushalMCQ[]> = {
  'batch-001': batch001 as ShikshanKaushalMCQ[],
};

// Cached in-memory questions list
let memoryCachedQuestions: ShikshanKaushalMCQ[] | null = null;

/**
 * Loads custom imported batches from client storage (localStorage) safely.
 */
export function getClientImportedQuestions(): ShikshanKaushalMCQ[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(IMPORTED_BATCHES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as ShikshanKaushalMCQ[];
    }
    return [];
  } catch (err) {
    console.warn('[ShikshanKaushalLoader] Failed to read client imported questions:', err);
    return [];
  }
}

/**
 * Persists additional valid batches to client storage.
 */
export function saveClientImportedQuestions(questions: ShikshanKaushalMCQ[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(IMPORTED_BATCHES_STORAGE_KEY, JSON.stringify(questions));
    // Invalidate in-memory cache
    memoryCachedQuestions = null;
  } catch (err) {
    console.error('[ShikshanKaushalLoader] Failed to save imported questions:', err);
  }
}

/**
 * Loads all active Shikshan Kaushal questions across static files and imported batches.
 * Deduplicates by question ID.
 */
export function loadShikshanKaushalQuestions(): ShikshanKaushalMCQ[] {
  if (memoryCachedQuestions) {
    return memoryCachedQuestions;
  }

  const map = new Map<string, ShikshanKaushalMCQ>();

  // 1. Load static files
  Object.values(STATIC_BATCHES).forEach((batch) => {
    batch.forEach((q) => {
      if (q && q.id) {
        map.set(q.id, q);
      }
    });
  });

  // 2. Overlay client imported batches
  const clientQuestions = getClientImportedQuestions();
  clientQuestions.forEach((q) => {
    if (q && q.id) {
      map.set(q.id, q);
    }
  });

  const sorted = Array.from(map.values()).sort((a, b) => a.id.localeCompare(b.id));
  memoryCachedQuestions = sorted;
  return sorted;
}

/**
 * Invalidate internal cache.
 */
export function clearShikshanKaushalCache(): void {
  memoryCachedQuestions = null;
}

/**
 * Converts a ShikshanKaushalMCQ into the existing core platform MCQQuestion structure.
 */
export function convertToMCQQuestion(sk: ShikshanKaushalMCQ): MCQQuestion {
  let difficulty: MCQQuestion['difficulty'] = 'Moderate';
  if (sk.difficulty === 'EASY') difficulty = 'Easy';
  else if (sk.difficulty === 'HARD') difficulty = 'Hard';
  else if (sk.difficulty === 'VERY_HARD') difficulty = 'Very Hard';

  let sourceType: MCQQuestion['sourceType'] = 'Practice';
  if (sk.sourceType === 'PYQ') sourceType = 'PYQ';
  else if (sk.sourceType === 'PYQ-BASED') sourceType = 'PYQ-based';

  const canonicalTopicId = resolveTopicId(sk.topicId) || sk.topicId;

  return {
    id: sk.id,
    examId: 'super-tet',
    subjectId: 'super-tet-teaching-skills',
    topicId: canonicalTopicId,
    question: sk.question,
    options: {
      A: sk.options.A,
      B: sk.options.B,
      C: sk.options.C,
      D: sk.options.D,
    },
    correctAnswer: sk.correctAnswer,
    explanation: sk.explanation,
    importantPoint: sk.importantPoint,
    additionalFact: sk.additionalFact,
    commonMistake: sk.commonMistake,
    difficulty,
    sourceType,
    year: sk.year || undefined,
    examName: sk.examName || undefined,
  };
}

/**
 * Returns all Shikshan Kaushal questions transformed to the platform MCQQuestion format.
 */
export function loadShikshanKaushalAsMCQQuestions(): MCQQuestion[] {
  const skList = loadShikshanKaushalQuestions();
  return skList.map(convertToMCQQuestion);
}

/**
 * Calculates current content coverage across all 15 syllabus topics and difficulties.
 */
export function getShikshanKaushalCoverage(): ShikshanKaushalContentCoverage {
  const questions = loadShikshanKaushalQuestions();
  const totalLoaded = questions.length;
  const totalTarget = 1000;

  const actualDiff: Record<MCQDifficultyEnum, number> = {
    EASY: 0,
    MODERATE: 0,
    HARD: 0,
    VERY_HARD: 0,
  };

  const actualSource: Record<MCQSourceTypeEnum, number> = {
    PRACTICE: 0,
    PYQ: 0,
    'PYQ-BASED': 0,
  };

  const topicCountMap: Record<string, { easy: number; moderate: number; hard: number; veryHard: number; total: number }> = {};

  SHIKSHAN_KAUSHAL_TOPICS.forEach((t) => {
    topicCountMap[t.canonicalId] = { easy: 0, moderate: 0, hard: 0, veryHard: 0, total: 0 };
  });

  questions.forEach((q) => {
    if (actualDiff[q.difficulty] !== undefined) {
      actualDiff[q.difficulty]++;
    }
    if (actualSource[q.sourceType] !== undefined) {
      actualSource[q.sourceType]++;
    }

    const resolved = resolveTopicId(q.topicId);
    if (resolved && topicCountMap[resolved]) {
      topicCountMap[resolved].total++;
      if (q.difficulty === 'EASY') topicCountMap[resolved].easy++;
      else if (q.difficulty === 'MODERATE') topicCountMap[resolved].moderate++;
      else if (q.difficulty === 'HARD') topicCountMap[resolved].hard++;
      else if (q.difficulty === 'VERY_HARD') topicCountMap[resolved].veryHard++;
    }
  });

  const diffPercentages: Record<MCQDifficultyEnum, number> = {
    EASY: totalLoaded > 0 ? Math.round((actualDiff.EASY / totalLoaded) * 100) : 0,
    MODERATE: totalLoaded > 0 ? Math.round((actualDiff.MODERATE / totalLoaded) * 100) : 0,
    HARD: totalLoaded > 0 ? Math.round((actualDiff.HARD / totalLoaded) * 100) : 0,
    VERY_HARD: totalLoaded > 0 ? Math.round((actualDiff.VERY_HARD / totalLoaded) * 100) : 0,
  };

  const topicCoverage = SHIKSHAN_KAUSHAL_TOPICS.map((topic) => {
    const stats = topicCountMap[topic.canonicalId] || { easy: 0, moderate: 0, hard: 0, veryHard: 0, total: 0 };
    return {
      topicIndex: topic.index,
      topicId: topic.canonicalId,
      topicName: topic.name,
      count: stats.total,
      target: topic.targetCount,
      completionPercent: Math.round((stats.total / topic.targetCount) * 100),
      easyCount: stats.easy,
      moderateCount: stats.moderate,
      hardCount: stats.hard,
      veryHardCount: stats.veryHard,
    };
  });

  return {
    totalTarget,
    totalLoaded,
    completionPercentage: Math.round((totalLoaded / totalTarget) * 100),
    difficultyDistribution: {
      target: {
        EASY: 300,
        MODERATE: 400,
        HARD: 200,
        VERY_HARD: 100,
      },
      actual: actualDiff,
      percentages: diffPercentages,
    },
    sourceDistribution: actualSource,
    topicCoverage,
  };
}

/**
 * Imports a batch of raw questions with automated validation and duplicate checks.
 */
export function importBatchData(
  rawInput: string | unknown[],
  saveIfValid = true
): {
  report: BatchValidationReport;
  saved: boolean;
  savedCount: number;
} {
  let parsed: unknown[] = [];
  if (typeof rawInput === 'string') {
    try {
      parsed = JSON.parse(rawInput);
    } catch {
      return {
        report: {
          timestamp: new Date().toISOString(),
          totalReceived: 0,
          validCount: 0,
          invalidCount: 0,
          duplicateIdCount: 0,
          duplicateQuestionCount: 0,
          errors: [{ questionId: 'ROOT', field: 'json', message: 'Invalid JSON string provided.', severity: 'ERROR' }],
          warnings: [],
          duplicates: [],
          difficultyCounts: { EASY: 0, MODERATE: 0, HARD: 0, VERY_HARD: 0 },
          sourceTypeCounts: { PRACTICE: 0, PYQ: 0, 'PYQ-BASED': 0 },
          topicCounts: {},
          isValid: false,
        },
        saved: false,
        savedCount: 0,
      };
    }
  } else if (Array.isArray(rawInput)) {
    parsed = rawInput;
  }

  const existing = loadShikshanKaushalQuestions();
  const report = validateQuestionBatch(parsed, existing);

  let saved = false;
  let savedCount = 0;

  if (saveIfValid && report.isValid && report.validCount > 0) {
    const validItems = parsed as ShikshanKaushalMCQ[];
    const clientItems = getClientImportedQuestions();

    const clientMap = new Map<string, ShikshanKaushalMCQ>();
    clientItems.forEach((item) => clientMap.set(item.id, item));
    validItems.forEach((item) => clientMap.set(item.id, item));

    const combined = Array.from(clientMap.values());
    saveClientImportedQuestions(combined);
    saved = true;
    savedCount = validItems.length;
  }

  return { report, saved, savedCount };
}

/**
 * Returns batch metadata boundaries (Batch 1 to 10).
 */
export function getBatchMetadataList(): Array<{
  batchNumber: number;
  batchId: string;
  startId: string;
  endId: string;
  capacity: number;
  isLoaded: boolean;
  loadedCount: number;
}> {
  const currentQuestions = loadShikshanKaushalQuestions();
  const loadedIds = new Set(currentQuestions.map((q) => q.id));

  return Array.from({ length: 10 }).map((_, i) => {
    const batchNum = i + 1;
    const startNum = i * 100 + 1;
    const endNum = (i + 1) * 100;
    const startId = `ST-SK-${String(startNum).padStart(4, '0')}`;
    const endId = `ST-SK-${String(endNum).padStart(4, '0')}`;

    let countInBatch = 0;
    for (let n = startNum; n <= endNum; n++) {
      const id = `ST-SK-${String(n).padStart(4, '0')}`;
      if (loadedIds.has(id)) countInBatch++;
    }

    return {
      batchNumber: batchNum,
      batchId: `batch-${String(batchNum).padStart(3, '0')}`,
      startId,
      endId,
      capacity: 100,
      isLoaded: countInBatch > 0,
      loadedCount: countInBatch,
    };
  });
}
