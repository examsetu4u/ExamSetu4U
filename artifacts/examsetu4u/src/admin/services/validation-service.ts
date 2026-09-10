import { getExam, getSubject, getTopic } from '@/data/curriculum';
import type { AdminQuestion, QuestionValidationItem, ValidationReportSummary, ValidationResult } from '../types';

/**
 * Validates a single question against all editorial and integrity rules.
 */
export function validateQuestion(
  q: Partial<AdminQuestion>,
  allQuestions: AdminQuestion[] = []
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const fieldErrors: Record<string, string> = {};

  // 1. ID check
  if (!q.id || !q.id.trim()) {
    errors.push('Question ID is required.');
    fieldErrors.id = 'ID cannot be blank';
  } else {
    // Duplicate ID check
    const duplicateId = allQuestions.find((other) => other.id === q.id && other !== q);
    if (duplicateId) {
      errors.push(`Duplicate question ID "${q.id}" already exists.`);
      fieldErrors.id = 'Duplicate ID';
    }
  }

  // 2. Exam check
  if (!q.examId || !q.examId.trim()) {
    errors.push('Exam ID is required.');
    fieldErrors.examId = 'Exam is required';
  } else {
    const exam = getExam(q.examId);
    if (!exam) {
      errors.push(`Referenced exam ID "${q.examId}" is invalid or does not exist.`);
      fieldErrors.examId = 'Invalid exam';
    }
  }

  // 3. Subject check
  if (!q.subjectId || !q.subjectId.trim()) {
    errors.push('Subject ID is required.');
    fieldErrors.subjectId = 'Subject is required';
  } else {
    const subject = getSubject(q.subjectId);
    if (!subject) {
      errors.push(`Referenced subject ID "${q.subjectId}" is invalid.`);
      fieldErrors.subjectId = 'Invalid subject';
    } else if (q.examId && subject.examId !== q.examId) {
      errors.push(`Subject "${subject.name}" does not belong to Exam "${q.examId}".`);
      fieldErrors.subjectId = 'Subject-exam mismatch';
    }
  }

  // 4. Topic check
  if (!q.topicId || !q.topicId.trim()) {
    errors.push('Topic ID is required.');
    fieldErrors.topicId = 'Topic is required';
  } else {
    const topic = getTopic(q.topicId);
    if (!topic) {
      errors.push(`Referenced topic ID "${q.topicId}" is invalid.`);
      fieldErrors.topicId = 'Invalid topic';
    } else if (q.subjectId && topic.subjectId !== q.subjectId) {
      errors.push(`Topic "${topic.name}" does not belong to Subject "${q.subjectId}".`);
      fieldErrors.topicId = 'Topic-subject mismatch';
    }
  }

  // 5. Question text check
  if (!q.question || !q.question.trim()) {
    errors.push('Question text is required.');
    fieldErrors.question = 'Question text cannot be empty';
  } else if (q.question.trim().length < 5) {
    errors.push('Question text is too short (minimum 5 characters).');
    fieldErrors.question = 'Too short';
  } else {
    // Duplicate question text within same exam/topic
    const duplicateQuestion = allQuestions.find(
      (other) =>
        other.id !== q.id &&
        other.examId === q.examId &&
        other.topicId === q.topicId &&
        other.question.trim().toLowerCase() === q.question?.trim().toLowerCase()
    );
    if (duplicateQuestion) {
      errors.push('Duplicate question text found in the same exam and topic.');
      fieldErrors.question = 'Duplicate question text';
    }
  }

  // 6. Options checks
  if (!q.options || typeof q.options !== 'object') {
    errors.push('Options object with choices A, B, C, D is required.');
    fieldErrors.options = 'Options missing';
  } else {
    const validKeys: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    validKeys.forEach((key) => {
      const val = q.options?.[key];
      if (!val || !val.trim()) {
        errors.push(`Option ${key} cannot be empty.`);
        fieldErrors[`option_${key}`] = `Option ${key} is empty`;
      }
    });
  }

  // 7. Correct answer check
  if (!q.correctAnswer || !['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
    errors.push('Correct answer must be explicitly set to A, B, C, or D.');
    fieldErrors.correctAnswer = 'Must be A, B, C, or D';
  }

  // 8. Explanation check
  if (!q.explanation || !q.explanation.trim()) {
    errors.push('Explanation is required to help students learn.');
    fieldErrors.explanation = 'Explanation cannot be blank';
  }

  // 9. Difficulty check
  if (!q.difficulty || !['EASY', 'MODERATE', 'HARD', 'VERY_HARD'].includes(q.difficulty)) {
    errors.push('Valid difficulty level (EASY, MODERATE, HARD, VERY_HARD) is required.');
    fieldErrors.difficulty = 'Invalid difficulty';
  }

  // 10. Source Type check
  if (!q.sourceType || !['PYQ', 'PYQ-BASED', 'PRACTICE'].includes(q.sourceType)) {
    errors.push('Source type (PYQ, PYQ-BASED, PRACTICE) is required.');
    fieldErrors.sourceType = 'Invalid source type';
  } else if (q.sourceType === 'PYQ') {
    // PYQ specific check: year and examName should be present
    if (!q.year || q.year < 1990 || q.year > 2030) {
      warnings.push('PYQ questions should specify a valid examination year (e.g. 2018-2024).');
      fieldErrors.year = 'PYQ year recommended';
    }
    if (!q.examName || !q.examName.trim()) {
      warnings.push('PYQ questions should specify the authentic exam name (e.g. "UPTET Paper 1").');
      fieldErrors.examName = 'Exam name recommended';
    }
  }

  // Pedagogical quality warnings
  if (!q.importantPoint || !q.importantPoint.trim()) {
    warnings.push('Adding an "Important Point" enhances student memory retention.');
  }
  if (!q.commonMistake || !q.commonMistake.trim()) {
    warnings.push('Adding a "Common Mistake" helps prevent student exam errors.');
  }

  let status: 'VALID' | 'WARNING' | 'ERROR' = 'VALID';
  if (errors.length > 0) {
    status = 'ERROR';
  } else if (warnings.length > 0) {
    status = 'WARNING';
  }

  return {
    status,
    errors,
    warnings,
    fieldErrors,
  };
}

/**
 * Validates the entire question repository and generates a summary audit report.
 */
export function validateAllQuestions(questions: AdminQuestion[]): ValidationReportSummary {
  let validCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  const items: QuestionValidationItem[] = questions.map((q) => {
    const result = validateQuestion(q, questions);
    if (result.status === 'ERROR') errorCount++;
    else if (result.status === 'WARNING') warningCount++;
    else validCount++;

    return {
      questionId: q.id,
      questionText: q.question,
      examId: q.examId,
      subjectId: q.subjectId,
      topicId: q.topicId,
      sourceType: q.sourceType,
      status: q.status,
      result,
    };
  });

  return {
    totalQuestions: questions.length,
    validCount,
    warningCount,
    errorCount,
    items,
    checkedAt: new Date().toISOString(),
  };
}
