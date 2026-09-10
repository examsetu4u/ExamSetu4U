import { exams as baseExams, getExam, getStudyMaterial, getSubject, getTopic, subjects as baseSubjects, topics as baseTopics } from '@/data/curriculum';
import { mockTestConfigs as baseMockTests } from '@/data/mock/tests';
import { pyqQuestions as basePYQQuestions } from '@/data/pyq';
import { getAllQuizQuestions } from '@/data/quiz/questions';
import type {
  AdminActivityLog,
  AdminDashboardStats,
  AdminExam,
  AdminMockTest,
  AdminQuestion,
  AdminStudyMaterial,
  AdminSubject,
  AdminTopic,
  ContentDifficulty,
  ContentSourceType,
  ContentStatus,
} from '../types';
import { validateAllQuestions } from './validation-service';

const STORAGE_KEYS = {
  CONTENT: 'examsetu4u_admin_content',
  DRAFTS: 'examsetu4u_admin_drafts',
  ACTIVITY: 'examsetu4u_admin_activity',
  IMPORT_PREVIEW: 'examsetu4u_admin_import_preview',
} as const;

interface AdminContentStore {
  exams: AdminExam[];
  subjects: AdminSubject[];
  topics: AdminTopic[];
  studyMaterials: AdminStudyMaterial[];
  questions: AdminQuestion[];
  mockTests: AdminMockTest[];
}

function safeGetStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSetStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('[AdminStorage] Write failed:', err);
  }
}

// Convert initial system data to Admin format
function buildInitialData(): AdminContentStore {
  // 1. Exams
  const exams: AdminExam[] = baseExams.map((ex, index) => {
    let category = 'State / Teaching';
    if (ex.id.includes('ssc')) category = 'Staff Selection Commission';
    else if (ex.id.includes('cbse')) category = 'Secondary Education (CBSE)';
    else if (ex.id.includes('uppcs')) category = 'Civil Services (State PCS)';

    const exSubjects = baseSubjects.filter((s) => s.examId === ex.id);
    const exTopics = baseTopics.filter((t) => t.examId === ex.id);

    return {
      id: ex.id,
      name: ex.name,
      shortName: ex.name,
      description: ex.description || ex.shortDescription,
      category,
      status: 'PUBLISHED',
      order: index + 1,
      subjectCount: exSubjects.length,
      topicCount: exTopics.length,
    };
  });

  // 2. Subjects
  const subjects: AdminSubject[] = baseSubjects.map((sub, index) => {
    const subTopics = baseTopics.filter((t) => t.subjectId === sub.id);
    return {
      id: sub.id,
      examId: sub.examId,
      name: sub.name,
      description: sub.description,
      order: index + 1,
      status: 'PUBLISHED',
      topicCount: subTopics.length,
    };
  });

  // 3. Topics
  const topics: AdminTopic[] = baseTopics.map((top, index) => {
    return {
      id: top.id,
      examId: top.examId,
      subjectId: top.subjectId,
      name: top.name,
      description: top.description,
      order: index + 1,
      status: 'PUBLISHED',
      hasStudyMaterial: top.availability.studyMaterial,
    };
  });

  // 4. Study Materials from curriculum
  const studyMaterials: AdminStudyMaterial[] = [];
  baseTopics.forEach((top) => {
    const sm = getStudyMaterial(top.id);
    if (sm) {
      studyMaterials.push({
        id: `sm-${top.id}`,
        examId: top.examId,
        subjectId: top.subjectId,
        topicId: top.id,
        title: `${top.name} - Detailed Study Notes`,
        description: top.description,
        intro: sm.intro,
        sections: sm.sections || [],
        keyPoints: sm.keyTakeaways || [],
        importantFacts: sm.quickRevision || [],
        status: 'PUBLISHED',
        version: 1,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    }
  });

  // 5. Questions (Quiz + PYQ unified without generating fake questions)
  const questions: AdminQuestion[] = [];

  // 5a. Practice / Quiz questions
  const rawQuiz = getAllQuizQuestions();
  rawQuiz.forEach((q) => {
    let diff: ContentDifficulty = 'MODERATE';
    if (q.difficulty === 'Easy') diff = 'EASY';
    else if (q.difficulty === 'Hard') diff = 'HARD';
    else if (q.difficulty === 'Very Hard') diff = 'VERY_HARD';

    let srcType: ContentSourceType = 'PRACTICE';
    if (q.sourceType === 'PYQ') srcType = 'PYQ';
    else if (q.sourceType === 'PYQ-based') srcType = 'PYQ-BASED';

    questions.push({
      id: q.id,
      examId: q.examId,
      subjectId: q.subjectId,
      topicId: q.topicId,
      question: q.question,
      options: {
        A: q.options.A,
        B: q.options.B,
        C: q.options.C,
        D: q.options.D,
      },
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      importantPoint: q.importantPoint || '',
      additionalFact: q.additionalFact || '',
      commonMistake: q.commonMistake || '',
      difficulty: diff,
      sourceType: srcType,
      year: q.year,
      examName: q.examName,
      status: 'PUBLISHED',
      createdAt: '2026-01-01',
      updatedAt: '2026-03-01',
    });
  });

  // 5b. Authentic PYQ questions
  basePYQQuestions.forEach((pyq) => {
    // Avoid duplicates if already present in quiz list
    if (questions.some((existing) => existing.id === pyq.id)) return;

    let diff: ContentDifficulty = 'MODERATE';
    if (pyq.metadata.difficulty === 'Easy') diff = 'EASY';
    else if (pyq.metadata.difficulty === 'Challenging') diff = 'HARD';

    const letterMap = ['A', 'B', 'C', 'D'] as const;
    const correctIdx = pyq.options.findIndex((o) => o.id === pyq.correctOptionId);
    const correctLetter = correctIdx >= 0 ? letterMap[correctIdx] : 'A';

    questions.push({
      id: pyq.id,
      examId: pyq.metadata.examId,
      subjectId: pyq.metadata.subjectId,
      topicId: pyq.metadata.topicId,
      question: pyq.prompt,
      options: {
        A: pyq.options[0]?.text || '',
        B: pyq.options[1]?.text || '',
        C: pyq.options[2]?.text || '',
        D: pyq.options[3]?.text || '',
      },
      correctAnswer: correctLetter,
      explanation: pyq.explanation.answerReason,
      importantPoint: pyq.explanation.importantPoint || '',
      additionalFact: pyq.explanation.additionalFact || '',
      commonMistake: pyq.explanation.commonMistake || '',
      difficulty: diff,
      sourceType: 'PYQ',
      year: pyq.metadata.year,
      examName: getExam(pyq.metadata.examId)?.name || 'Official Exam',
      status: 'PUBLISHED',
      createdAt: '2026-01-15',
      updatedAt: '2026-03-01',
    });
  });

  // 6. Mock tests
  const mockTests: AdminMockTest[] = baseMockTests.map((mt) => ({
    ...mt,
    status: 'PUBLISHED',
    updatedAt: '2026-03-01',
  }));

  return { exams, subjects, topics, studyMaterials, questions, mockTests };
}

// In-memory / localStorage bridge
function getStore(): AdminContentStore {
  const initial = buildInitialData();
  const saved = safeGetStorage<Partial<AdminContentStore>>(STORAGE_KEYS.CONTENT, {});

  return {
    exams: saved.exams && saved.exams.length > 0 ? saved.exams : initial.exams,
    subjects: saved.subjects && saved.subjects.length > 0 ? saved.subjects : initial.subjects,
    topics: saved.topics && saved.topics.length > 0 ? saved.topics : initial.topics,
    studyMaterials: saved.studyMaterials && saved.studyMaterials.length > 0 ? saved.studyMaterials : initial.studyMaterials,
    questions: saved.questions && saved.questions.length > 0 ? saved.questions : initial.questions,
    mockTests: saved.mockTests && saved.mockTests.length > 0 ? saved.mockTests : initial.mockTests,
  };
}

function setStore(store: AdminContentStore): void {
  safeSetStorage(STORAGE_KEYS.CONTENT, store);
}

// Activity logging
export function logAdminActivity(
  action: AdminActivityLog['action'],
  entityType: AdminActivityLog['entityType'],
  entityId: string,
  entityTitle: string,
  details?: string
): void {
  const currentLogs = safeGetStorage<AdminActivityLog[]>(STORAGE_KEYS.ACTIVITY, []);
  const newLog: AdminActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    entityType,
    entityId,
    entityTitle,
    details,
  };
  // Keep last 100 activities
  const updated = [newLog, ...currentLogs].slice(0, 100);
  safeSetStorage(STORAGE_KEYS.ACTIVITY, updated);
}

export function getAdminActivity(): AdminActivityLog[] {
  return safeGetStorage<AdminActivityLog[]>(STORAGE_KEYS.ACTIVITY, [
    {
      id: 'log-init-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      action: 'CREATED',
      entityType: 'EXAM',
      entityId: 'super-tet',
      entityTitle: 'Super TET Curriculum Initialized',
      details: 'Initial system curriculum baseline verified',
    },
    {
      id: 'log-init-2',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      action: 'STATUS_CHANGED',
      entityType: 'QUESTION',
      entityId: 'batch-published',
      entityTitle: 'Baseline Questions Published',
      details: 'All verified questions set to Published status',
    },
  ]);
}

// -------------------------------------------------------------
// DASHBOARD STATS
// -------------------------------------------------------------
export function getAdminStats(): AdminDashboardStats {
  const store = getStore();
  const validationSummary = validateAllQuestions(store.questions);

  let draftCount = 0;
  let reviewCount = 0;
  let publishedCount = 0;
  let archivedCount = 0;

  // Aggregate status across all primary content entities
  const allEntities: { status: ContentStatus | string }[] = [
    ...store.exams,
    ...store.subjects,
    ...store.topics,
    ...store.studyMaterials,
    ...store.questions,
    ...store.mockTests,
  ];

  allEntities.forEach((item) => {
    if (item.status === 'DRAFT') draftCount++;
    else if (item.status === 'REVIEW') reviewCount++;
    else if (item.status === 'PUBLISHED') publishedCount++;
    else if (item.status === 'ARCHIVED') archivedCount++;
  });

  const pyqCount = store.questions.filter((q) => q.sourceType === 'PYQ').length;
  const quizCount = store.questions.filter((q) => q.sourceType !== 'PYQ').length;

  return {
    totalExams: store.exams.length,
    totalSubjects: store.subjects.length,
    totalTopics: store.topics.length,
    studyMaterialItems: store.studyMaterials.length,
    pyqItems: pyqCount,
    quizItems: quizCount,
    mockTests: store.mockTests.length,
    draftCount,
    reviewCount,
    publishedCount,
    archivedCount,
    validationErrors: validationSummary.errorCount,
    validationWarnings: validationSummary.warningCount,
  };
}

// -------------------------------------------------------------
// EXAM OPERATIONS
// -------------------------------------------------------------
export function getAdminExams(filterStatus?: string): AdminExam[] {
  const store = getStore();
  let list = store.exams;
  if (filterStatus && filterStatus !== 'ALL') {
    list = list.filter((e) => e.status === filterStatus);
  }
  return [...list].sort((a, b) => a.order - b.order);
}

export function saveAdminExam(exam: AdminExam): AdminExam {
  const store = getStore();
  const index = store.exams.findIndex((e) => e.id === exam.id);
  const isNew = index < 0;

  let nextExams = [...store.exams];
  if (isNew) {
    nextExams.push(exam);
    logAdminActivity('CREATED', 'EXAM', exam.id, exam.name);
  } else {
    nextExams[index] = exam;
    logAdminActivity('UPDATED', 'EXAM', exam.id, exam.name);
  }

  setStore({ ...store, exams: nextExams });
  return exam;
}

export function archiveAdminExam(examId: string): void {
  const store = getStore();
  const target = store.exams.find((e) => e.id === examId);
  if (!target) return;

  const nextExams = store.exams.map((e) => (e.id === examId ? { ...e, status: 'ARCHIVED' as const } : e));
  setStore({ ...store, exams: nextExams });
  logAdminActivity('ARCHIVED', 'EXAM', examId, target.name);
}

export function reorderAdminExams(sourceIndex: number, destIndex: number): AdminExam[] {
  const store = getStore();
  const sorted = [...store.exams].sort((a, b) => a.order - b.order);
  const [removed] = sorted.splice(sourceIndex, 1);
  sorted.splice(destIndex, 0, removed);

  const reordered = sorted.map((ex, idx) => ({ ...ex, order: idx + 1 }));
  setStore({ ...store, exams: reordered });
  logAdminActivity('UPDATED', 'EXAM', removed.id, removed.name, 'Reordered exams');
  return reordered;
}

// -------------------------------------------------------------
// SUBJECT OPERATIONS
// -------------------------------------------------------------
export function getAdminSubjects(examId?: string): AdminSubject[] {
  const store = getStore();
  let list = store.subjects;
  if (examId && examId !== 'ALL') {
    list = list.filter((s) => s.examId === examId);
  }
  return [...list].sort((a, b) => a.order - b.order);
}

export function saveAdminSubject(subject: AdminSubject): AdminSubject {
  const store = getStore();
  const index = store.subjects.findIndex((s) => s.id === subject.id);
  const isNew = index < 0;

  let nextSubjects = [...store.subjects];
  if (isNew) {
    nextSubjects.push(subject);
    logAdminActivity('CREATED', 'SUBJECT', subject.id, subject.name);
  } else {
    nextSubjects[index] = subject;
    logAdminActivity('UPDATED', 'SUBJECT', subject.id, subject.name);
  }

  setStore({ ...store, subjects: nextSubjects });
  return subject;
}

export function archiveAdminSubject(subjectId: string): void {
  const store = getStore();
  const target = store.subjects.find((s) => s.id === subjectId);
  if (!target) return;

  const nextSubjects = store.subjects.map((s) =>
    s.id === subjectId ? { ...s, status: 'ARCHIVED' as const } : s
  );
  setStore({ ...store, subjects: nextSubjects });
  logAdminActivity('ARCHIVED', 'SUBJECT', subjectId, target.name);
}

// -------------------------------------------------------------
// TOPIC OPERATIONS
// -------------------------------------------------------------
export function getAdminTopics(examId?: string, subjectId?: string): AdminTopic[] {
  const store = getStore();
  let list = store.topics;
  if (examId && examId !== 'ALL') {
    list = list.filter((t) => t.examId === examId);
  }
  if (subjectId && subjectId !== 'ALL') {
    list = list.filter((t) => t.subjectId === subjectId);
  }
  return [...list].sort((a, b) => a.order - b.order);
}

export function saveAdminTopic(topic: AdminTopic): AdminTopic {
  const store = getStore();
  const index = store.topics.findIndex((t) => t.id === topic.id);
  const isNew = index < 0;

  let nextTopics = [...store.topics];
  if (isNew) {
    nextTopics.push(topic);
    logAdminActivity('CREATED', 'TOPIC', topic.id, topic.name);
  } else {
    nextTopics[index] = topic;
    logAdminActivity('UPDATED', 'TOPIC', topic.id, topic.name);
  }

  setStore({ ...store, topics: nextTopics });
  return topic;
}

export function archiveAdminTopic(topicId: string): void {
  const store = getStore();
  const target = store.topics.find((t) => t.id === topicId);
  if (!target) return;

  const nextTopics = store.topics.map((t) =>
    t.id === topicId ? { ...t, status: 'ARCHIVED' as const } : t
  );
  setStore({ ...store, topics: nextTopics });
  logAdminActivity('ARCHIVED', 'TOPIC', topicId, target.name);
}

// -------------------------------------------------------------
// STUDY MATERIAL OPERATIONS
// -------------------------------------------------------------
export function getAdminStudyMaterials(
  examId?: string,
  subjectId?: string,
  topicId?: string
): AdminStudyMaterial[] {
  const store = getStore();
  let list = store.studyMaterials;
  if (examId && examId !== 'ALL') {
    list = list.filter((m) => m.examId === examId);
  }
  if (subjectId && subjectId !== 'ALL') {
    list = list.filter((m) => m.subjectId === subjectId);
  }
  if (topicId && topicId !== 'ALL') {
    list = list.filter((m) => m.topicId === topicId);
  }
  return [...list];
}

export function saveAdminStudyMaterial(material: AdminStudyMaterial): AdminStudyMaterial {
  const store = getStore();
  const index = store.studyMaterials.findIndex((m) => m.id === material.id);
  const isNew = index < 0;

  let nextList = [...store.studyMaterials];
  const updatedMaterial = {
    ...material,
    version: isNew ? 1 : material.version + 1,
    updatedAt: new Date().toISOString().split('T')[0],
  };

  if (isNew) {
    nextList.push(updatedMaterial);
    logAdminActivity('CREATED', 'STUDY_MATERIAL', updatedMaterial.id, updatedMaterial.title);
  } else {
    nextList[index] = updatedMaterial;
    logAdminActivity('UPDATED', 'STUDY_MATERIAL', updatedMaterial.id, updatedMaterial.title);
  }

  setStore({ ...store, studyMaterials: nextList });
  return updatedMaterial;
}

export function archiveAdminStudyMaterial(materialId: string): void {
  const store = getStore();
  const target = store.studyMaterials.find((m) => m.id === materialId);
  if (!target) return;

  const nextList = store.studyMaterials.map((m) =>
    m.id === materialId ? { ...m, status: 'ARCHIVED' as const } : m
  );
  setStore({ ...store, studyMaterials: nextList });
  logAdminActivity('ARCHIVED', 'STUDY_MATERIAL', materialId, target.title);
}

// -------------------------------------------------------------
// QUESTION OPERATIONS
// -------------------------------------------------------------
export interface QuestionFilterCriteria {
  examId?: string;
  subjectId?: string;
  topicId?: string;
  difficulty?: string;
  sourceType?: string;
  status?: string;
  search?: string;
}

export function getAdminQuestions(filters: QuestionFilterCriteria = {}): AdminQuestion[] {
  const store = getStore();
  let list = store.questions;

  if (filters.examId && filters.examId !== 'ALL') {
    list = list.filter((q) => q.examId === filters.examId);
  }
  if (filters.subjectId && filters.subjectId !== 'ALL') {
    list = list.filter((q) => q.subjectId === filters.subjectId);
  }
  if (filters.topicId && filters.topicId !== 'ALL') {
    list = list.filter((q) => q.topicId === filters.topicId);
  }
  if (filters.difficulty && filters.difficulty !== 'ALL') {
    list = list.filter((q) => q.difficulty === filters.difficulty);
  }
  if (filters.sourceType && filters.sourceType !== 'ALL') {
    list = list.filter((q) => q.sourceType === filters.sourceType);
  }
  if (filters.status && filters.status !== 'ALL') {
    list = list.filter((q) => q.status === filters.status);
  }
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (item) =>
        item.id.toLowerCase().includes(q) ||
        item.question.toLowerCase().includes(q) ||
        item.options.A.toLowerCase().includes(q) ||
        item.options.B.toLowerCase().includes(q) ||
        item.options.C.toLowerCase().includes(q) ||
        item.options.D.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q)
    );
  }

  return [...list];
}

export function saveAdminQuestion(question: AdminQuestion): AdminQuestion {
  const store = getStore();
  const index = store.questions.findIndex((q) => q.id === question.id);
  const isNew = index < 0;

  let nextQuestions = [...store.questions];
  const now = new Date().toISOString().split('T')[0];
  const itemToSave = {
    ...question,
    updatedAt: now,
    createdAt: question.createdAt || now,
  };

  if (isNew) {
    nextQuestions.push(itemToSave);
    logAdminActivity('CREATED', 'QUESTION', itemToSave.id, itemToSave.question.slice(0, 40));
  } else {
    nextQuestions[index] = itemToSave;
    logAdminActivity('UPDATED', 'QUESTION', itemToSave.id, itemToSave.question.slice(0, 40));
  }

  setStore({ ...store, questions: nextQuestions });
  return itemToSave;
}

export function updateQuestionStatus(questionId: string, status: ContentStatus): void {
  const store = getStore();
  const target = store.questions.find((q) => q.id === questionId);
  if (!target) return;

  const nextQuestions = store.questions.map((q) => (q.id === questionId ? { ...q, status } : q));
  setStore({ ...store, questions: nextQuestions });
  logAdminActivity(
    status === 'ARCHIVED' ? 'ARCHIVED' : 'STATUS_CHANGED',
    'QUESTION',
    questionId,
    target.question.slice(0, 40),
    `Status transitioned to ${status}`
  );
}

export function archiveAdminQuestion(questionId: string): void {
  updateQuestionStatus(questionId, 'ARCHIVED');
}

export function batchImportQuestions(newQuestions: AdminQuestion[]): number {
  if (!newQuestions || newQuestions.length === 0) return 0;

  const store = getStore();
  const existingMap = new Map<string, AdminQuestion>();
  store.questions.forEach((q) => existingMap.set(q.id, q));

  let addedCount = 0;
  newQuestions.forEach((item) => {
    existingMap.set(item.id, item);
    addedCount++;
  });

  const merged = Array.from(existingMap.values());
  setStore({ ...store, questions: merged });

  logAdminActivity(
    'IMPORTED',
    'QUESTION',
    `batch-${Date.now()}`,
    `Batch Imported ${addedCount} Questions`,
    `Total repository questions now: ${merged.length}`
  );

  return addedCount;
}

// -------------------------------------------------------------
// MOCK TEST OPERATIONS
// -------------------------------------------------------------
export function getAdminMockTests(examId?: string): AdminMockTest[] {
  const store = getStore();
  let list = store.mockTests;
  if (examId && examId !== 'ALL') {
    list = list.filter((m) => m.examId === examId);
  }
  return [...list];
}

export function saveAdminMockTest(test: AdminMockTest): AdminMockTest {
  const store = getStore();
  const index = store.mockTests.findIndex((m) => m.id === test.id);
  const isNew = index < 0;

  let nextList = [...store.mockTests];
  const now = new Date().toISOString().split('T')[0];
  const itemToSave = { ...test, updatedAt: now };

  if (isNew) {
    nextList.push(itemToSave);
    logAdminActivity('CREATED', 'MOCK_TEST', itemToSave.id, itemToSave.title);
  } else {
    nextList[index] = itemToSave;
    logAdminActivity('UPDATED', 'MOCK_TEST', itemToSave.id, itemToSave.title);
  }

  setStore({ ...store, mockTests: nextList });
  return itemToSave;
}

export function archiveAdminMockTest(testId: string): void {
  const store = getStore();
  const target = store.mockTests.find((m) => m.id === testId);
  if (!target) return;

  const nextList = store.mockTests.map((m) =>
    m.id === testId ? { ...m, status: 'ARCHIVED' as const } : m
  );
  setStore({ ...store, mockTests: nextList });
  logAdminActivity('ARCHIVED', 'MOCK_TEST', testId, target.title);
}

// -------------------------------------------------------------
// FACTORY RESET (CLEARS DEMO OVERLAYS SAFELY)
// -------------------------------------------------------------
export function resetAdminDataToDefaults(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.CONTENT);
    localStorage.removeItem(STORAGE_KEYS.DRAFTS);
    localStorage.removeItem(STORAGE_KEYS.IMPORT_PREVIEW);
  }
  logAdminActivity('UPDATED', 'EXAM', 'system', 'Database Restored to System Defaults');
}

export const resetAdminStoreToDefaults = resetAdminDataToDefaults;
