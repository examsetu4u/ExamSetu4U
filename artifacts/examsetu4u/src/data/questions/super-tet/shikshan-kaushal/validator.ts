import type {
  BatchValidationReport,
  DuplicateMatch,
  MCQDifficultyEnum,
  MCQSourceTypeEnum,
  ShikshanKaushalMCQ,
  ValidationErrorItem,
} from './schema';
import { resolveTopicId } from './topics';

const VALID_ID_REGEX = /^ST-SK-\d{4}$/;
const VALID_DIFFICULTIES: MCQDifficultyEnum[] = ['EASY', 'MODERATE', 'HARD', 'VERY_HARD'];
const VALID_SOURCES: MCQSourceTypeEnum[] = ['PRACTICE', 'PYQ', 'PYQ-BASED'];
const VALID_STATUSES = ['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED'];

/**
 * Normalizes Hindi / Hinglish text for semantic deduplication.
 * Strips punctuation, trims whitespace, standardizes spaces and common characters.
 */
export function normalizeQuestionText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[।।,?.!;:'"“”‘’(){}\[\]<>—–\-_\/\\*&^%$#@+=]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes word-level Jaccard similarity between two text strings (0.0 to 1.0).
 */
export function computeWordSimilarity(textA: string, textB: string): number {
  const wordsA = new Set(normalizeQuestionText(textA).split(' ').filter((w) => w.length > 1));
  const wordsB = new Set(normalizeQuestionText(textB).split(' ').filter((w) => w.length > 1));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersectionCount = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) intersectionCount++;
  });

  const unionCount = new Set([...wordsA, ...wordsB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Validates a single Shikshan Kaushal MCQ against all 19 strict schema rules.
 */
export function validateSingleQuestion(
  q: unknown,
  existingIds: Set<string> = new Set(),
  checkUniqueness = true
): { isValid: boolean; errors: ValidationErrorItem[]; warnings: ValidationErrorItem[] } {
  const errors: ValidationErrorItem[] = [];
  const warnings: ValidationErrorItem[] = [];

  if (!q || typeof q !== 'object') {
    return {
      isValid: false,
      errors: [{ questionId: 'UNKNOWN', field: 'root', message: 'Question item is not a valid object.', severity: 'ERROR' }],
      warnings: [],
    };
  }

  const item = q as Partial<ShikshanKaushalMCQ>;
  const qId = item.id || 'NO_ID';

  // Rule 1 & 2: ID validity and format
  if (!item.id || typeof item.id !== 'string') {
    errors.push({ questionId: qId, field: 'id', message: 'ID is missing or not a string.', severity: 'ERROR' });
  } else if (!VALID_ID_REGEX.test(item.id)) {
    errors.push({
      questionId: qId,
      field: 'id',
      message: `ID "${item.id}" violates format. Must strictly be ST-SK-XXXX (e.g., ST-SK-0001).`,
      severity: 'ERROR',
    });
  } else if (checkUniqueness && existingIds.has(item.id)) {
    errors.push({
      questionId: qId,
      field: 'id',
      message: `Duplicate ID detected: "${item.id}" is already used in this set.`,
      severity: 'ERROR',
    });
  }

  // Rule 3: Exam ID
  if (item.examId !== 'super-tet') {
    errors.push({
      questionId: qId,
      field: 'examId',
      message: `examId must strictly be "super-tet", received: "${item.examId}".`,
      severity: 'ERROR',
    });
  }

  // Rule 4: Subject ID
  const validSubjectIds = ['shikshan-kaushal', 'teaching-skills', 'super-tet-teaching-skills'];
  if (!item.subjectId || !validSubjectIds.includes(item.subjectId)) {
    errors.push({
      questionId: qId,
      field: 'subjectId',
      message: `subjectId must strictly be "shikshan-kaushal", received: "${item.subjectId}".`,
      severity: 'ERROR',
    });
  }

  // Rule 5: Topic ID
  if (!item.topicId) {
    errors.push({ questionId: qId, field: 'topicId', message: 'topicId is required.', severity: 'ERROR' });
  } else {
    const resolved = resolveTopicId(item.topicId);
    if (!resolved) {
      errors.push({
        questionId: qId,
        field: 'topicId',
        message: `topicId "${item.topicId}" is not one of the 15 valid Super TET Shikshan Kaushal syllabus topics.`,
        severity: 'ERROR',
      });
    }
  }

  // Rule 6: Question Text
  if (!item.question || typeof item.question !== 'string' || item.question.trim().length < 10) {
    errors.push({
      questionId: qId,
      field: 'question',
      message: 'Question text must be a non-empty string of at least 10 characters.',
      severity: 'ERROR',
    });
  }

  // Rule 7 & 8: Options A, B, C, D
  if (!item.options || typeof item.options !== 'object') {
    errors.push({ questionId: qId, field: 'options', message: 'Options object is required.', severity: 'ERROR' });
  } else {
    const keys = ['A', 'B', 'C', 'D'] as const;
    for (const key of keys) {
      const optVal = item.options[key];
      if (!optVal || typeof optVal !== 'string' || optVal.trim().length === 0) {
        errors.push({
          questionId: qId,
          field: `options.${key}`,
          message: `Option ${key} is missing or empty.`,
          severity: 'ERROR',
        });
      }
    }
  }

  // Rule 9: Correct Answer
  const validAnswers = ['A', 'B', 'C', 'D'];
  if (!item.correctAnswer || !validAnswers.includes(item.correctAnswer)) {
    errors.push({
      questionId: qId,
      field: 'correctAnswer',
      message: `correctAnswer must be strictly one of 'A', 'B', 'C', 'D'. Received: "${item.correctAnswer}".`,
      severity: 'ERROR',
    });
  }

  // Rule 10: Explanation
  if (!item.explanation || typeof item.explanation !== 'string' || item.explanation.trim().length < 12) {
    errors.push({
      questionId: qId,
      field: 'explanation',
      message: 'Detailed explanation is mandatory (min 12 characters).',
      severity: 'ERROR',
    });
  }

  // Rule 11: Important Point
  if (!item.importantPoint || typeof item.importantPoint !== 'string' || item.importantPoint.trim().length === 0) {
    errors.push({
      questionId: qId,
      field: 'importantPoint',
      message: 'importantPoint is mandatory for rapid candidate revision.',
      severity: 'ERROR',
    });
  }

  // Rule 12: Additional Fact
  if (!item.additionalFact || typeof item.additionalFact !== 'string' || item.additionalFact.trim().length === 0) {
    errors.push({
      questionId: qId,
      field: 'additionalFact',
      message: 'additionalFact is mandatory for examination concept reinforcement.',
      severity: 'ERROR',
    });
  }

  // Rule 13: Common Mistake
  if (!item.commonMistake || typeof item.commonMistake !== 'string' || item.commonMistake.trim().length === 0) {
    errors.push({
      questionId: qId,
      field: 'commonMistake',
      message: 'commonMistake is mandatory explaining typical student misperceptions.',
      severity: 'ERROR',
    });
  }

  // Rule 14: Difficulty
  if (!item.difficulty || !VALID_DIFFICULTIES.includes(item.difficulty)) {
    errors.push({
      questionId: qId,
      field: 'difficulty',
      message: `difficulty must be one of EASY, MODERATE, HARD, VERY_HARD. Received: "${item.difficulty}".`,
      severity: 'ERROR',
    });
  }

  // Rule 15, 16, 17: Source Type & PYQ Metadata
  if (!item.sourceType || !VALID_SOURCES.includes(item.sourceType)) {
    errors.push({
      questionId: qId,
      field: 'sourceType',
      message: `sourceType must be one of PRACTICE, PYQ, PYQ-BASED. Received: "${item.sourceType}".`,
      severity: 'ERROR',
    });
  } else if (item.sourceType === 'PYQ') {
    if (typeof item.year !== 'number' || item.year < 2011 || item.year > 2030) {
      errors.push({
        questionId: qId,
        field: 'year',
        message: 'Verified PYQs must include a valid examination year (e.g. 2019).',
        severity: 'ERROR',
      });
    }
    if (!item.examName || typeof item.examName !== 'string' || item.examName.trim().length === 0) {
      errors.push({
        questionId: qId,
        field: 'examName',
        message: 'Verified PYQs must include examName (e.g. "Super TET 2019 69000 Bharti").',
        severity: 'ERROR',
      });
    }
  }

  // Status check (defaults to DRAFT if omitted)
  if (item.status && !VALID_STATUSES.includes(item.status)) {
    warnings.push({
      questionId: qId,
      field: 'status',
      message: `status should be DRAFT, REVIEW, PUBLISHED, or ARCHIVED. Received: "${item.status}".`,
      severity: 'WARNING',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Scans a batch of questions for duplicate or near-duplicate items.
 */
export function detectDuplicateQuestions(
  questions: ShikshanKaushalMCQ[],
  externalQuestions: ShikshanKaushalMCQ[] = []
): DuplicateMatch[] {
  const duplicates: DuplicateMatch[] = [];
  const allQuestions = [...externalQuestions, ...questions];

  for (let i = 0; i < allQuestions.length; i++) {
    const qA = allQuestions[i];
    const normA = normalizeQuestionText(qA.question);

    for (let j = i + 1; j < allQuestions.length; j++) {
      const qB = allQuestions[j];
      const normB = normalizeQuestionText(qB.question);

      // Check 1: Exact text match
      if (qA.question.trim() === qB.question.trim()) {
        duplicates.push({
          questionIdA: qA.id,
          questionIdB: qB.id,
          similarityScore: 1.0,
          reason: 'EXACT_TEXT',
          snippetA: qA.question.slice(0, 80),
          snippetB: qB.question.slice(0, 80),
        });
        continue;
      }

      // Check 2: Normalized text match
      if (normA === normB && normA.length > 10) {
        duplicates.push({
          questionIdA: qA.id,
          questionIdB: qB.id,
          similarityScore: 0.98,
          reason: 'NORMALIZED_TEXT',
          snippetA: qA.question.slice(0, 80),
          snippetB: qB.question.slice(0, 80),
        });
        continue;
      }

      // Check 3: Word-level similarity >= 0.82
      const sim = computeWordSimilarity(qA.question, qB.question);
      if (sim >= 0.82) {
        duplicates.push({
          questionIdA: qA.id,
          questionIdB: qB.id,
          similarityScore: Math.round(sim * 100) / 100,
          reason: 'SIMILAR_WORDING',
          snippetA: qA.question.slice(0, 80),
          snippetB: qB.question.slice(0, 80),
        });
        continue;
      }

      // Check 4: Identical options set with high similarity
      if (
        qA.options.A === qB.options.A &&
        qA.options.B === qB.options.B &&
        qA.options.C === qB.options.C &&
        qA.options.D === qB.options.D &&
        sim >= 0.65
      ) {
        duplicates.push({
          questionIdA: qA.id,
          questionIdB: qB.id,
          similarityScore: 0.9,
          reason: 'IDENTICAL_OPTIONS',
          snippetA: qA.question.slice(0, 80),
          snippetB: qB.question.slice(0, 80),
        });
      }
    }
  }

  return duplicates;
}

/**
 * Validates an entire batch of MCQs and outputs the comprehensive BatchValidationReport.
 */
export function validateQuestionBatch(
  batch: unknown[],
  existingQuestions: ShikshanKaushalMCQ[] = []
): BatchValidationReport {
  const existingIds = new Set(existingQuestions.map((q) => q.id));
  const seenBatchIds = new Set<string>();

  const allErrors: ValidationErrorItem[] = [];
  const allWarnings: ValidationErrorItem[] = [];
  let validCount = 0;
  let invalidCount = 0;
  let duplicateIdCount = 0;

  const validQuestions: ShikshanKaushalMCQ[] = [];
  const difficultyCounts: Record<MCQDifficultyEnum, number> = {
    EASY: 0,
    MODERATE: 0,
    HARD: 0,
    VERY_HARD: 0,
  };
  const sourceTypeCounts: Record<MCQSourceTypeEnum, number> = {
    PRACTICE: 0,
    PYQ: 0,
    'PYQ-BASED': 0,
  };
  const topicCounts: Record<string, number> = {};

  batch.forEach((item, index) => {
    const rawId = (item as Partial<ShikshanKaushalMCQ>)?.id || `INDEX_${index}`;

    if (seenBatchIds.has(rawId)) {
      duplicateIdCount++;
      allErrors.push({
        questionId: rawId,
        field: 'id',
        message: `ID "${rawId}" is duplicated inside the current batch.`,
        severity: 'ERROR',
      });
    } else {
      seenBatchIds.add(rawId);
    }

    const res = validateSingleQuestion(item, existingIds, true);
    allErrors.push(...res.errors);
    allWarnings.push(...res.warnings);

    if (res.isValid) {
      validCount++;
      const validQ = item as ShikshanKaushalMCQ;
      validQuestions.push(validQ);

      // Track distribution
      if (validQ.difficulty && difficultyCounts[validQ.difficulty] !== undefined) {
        difficultyCounts[validQ.difficulty]++;
      }
      if (validQ.sourceType && sourceTypeCounts[validQ.sourceType] !== undefined) {
        sourceTypeCounts[validQ.sourceType]++;
      }
      const canonicalTopic = resolveTopicId(validQ.topicId) || validQ.topicId;
      topicCounts[canonicalTopic] = (topicCounts[canonicalTopic] || 0) + 1;
    } else {
      invalidCount++;
    }
  });

  // Check for duplicate questions
  const duplicates = detectDuplicateQuestions(validQuestions, existingQuestions);
  if (duplicates.length > 0) {
    duplicates.forEach((d) => {
      allWarnings.push({
        questionId: d.questionIdA,
        field: 'uniqueness',
        message: `Potential duplicate with ${d.questionIdB} (${d.reason}, score: ${d.similarityScore}).`,
        severity: 'WARNING',
      });
    });
  }

  return {
    timestamp: new Date().toISOString(),
    totalReceived: batch.length,
    validCount,
    invalidCount,
    duplicateIdCount,
    duplicateQuestionCount: duplicates.length,
    errors: allErrors,
    warnings: allWarnings,
    duplicates,
    difficultyCounts,
    sourceTypeCounts,
    topicCounts,
    isValid: allErrors.length === 0,
  };
}
