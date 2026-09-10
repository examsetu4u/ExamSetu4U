import {
  exams,
  getExam,
  getSubject,
  getSubjectsForExam,
  getTopic,
  getTopicsForSubject,
  StudyMaterial,
  subjects,
  Topic,
  topics,
} from '@/data/curriculum';
import { pyqQuestions } from '@/data/pyq';
import { getAllQuizQuestions } from '@/data/quiz/questions';
import {
  calculateOverallProgress,
  calculateSubjectProgress,
  getContinueLearning,
  getLegacyPYQProgressMap,
  getLegacyTopicProgressMap,
  getRecentActivities,
  getWeakAreas,
  loadExtendedProgress,
} from '@/lib/user-progress';
import { loadQuizHistory } from '@/lib/quiz-storage';

export const SEARCH_HISTORY_KEY = 'examsetu4u_search_history';

export type SearchResultType = 'exam' | 'subject' | 'topic' | 'study' | 'pyq' | 'quiz' | 'theory';

export interface SearchResultItem {
  id: string;
  type: SearchResultType;
  title: string;
  titleHi?: string;
  subtitle: string;
  description: string;
  examId: string;
  examName: string;
  subjectId?: string;
  subjectName?: string;
  topicId?: string;
  topicName?: string;
  url: string;
  badgeLabel: string;
  badgeTone: 'saffron' | 'teal' | 'blue' | 'coral' | 'neutral';
  matchScore: number;
  highlightMatch?: string;
  difficulty?: 'Easy' | 'Moderate' | 'Hard' | 'Very Hard';
}

export interface GroupedSearchResults {
  exams: SearchResultItem[];
  subjects: SearchResultItem[];
  topics: SearchResultItem[];
  studyMaterial: SearchResultItem[];
  pyq: SearchResultItem[];
  quiz: SearchResultItem[];
  theory: SearchResultItem[];
  all: SearchResultItem[];
  totalCount: number;
}

export interface SearchFilterOptions {
  type?: SearchResultType | 'all';
  examId?: string | 'all';
  difficulty?: string | 'all';
}

// Transliteration & common Hinglish <-> Hindi <-> English mapping dictionary
const TRANSLITERATION_PAIRS: [string[], string[]][] = [
  [['shikshan', 'sikshan', 'shikshak', 'shiksha'], ['शिक्षण', 'शिक्षक', 'शिक्षा', 'teaching', 'pedagogy']],
  [['bal vikas', 'baal vikas', 'balvikas', 'child dev'], ['बाल विकास', 'child development', 'pedagogy']],
  [['ganit', 'math', 'maths', 'ankganit', 'ank ganit'], ['गणित', 'अंकगणित', 'mathematics', 'arithmetic', 'quant']],
  [['vyakaran', 'hindi vyakaran', 'grammar'], ['व्याकरण', 'हिंदी व्याकरण', 'grammar', 'language']],
  [['samaveshi', 'samaveshi shiksha', 'inclusive'], ['समावेशी', 'समावेशी शिक्षा', 'inclusive education']],
  [['vigyan', 'bhautik', 'rasayan', 'jeev vigyan'], ['विज्ञान', 'भौतिक विज्ञान', 'रसायन', 'जीव विज्ञान', 'science', 'physics', 'chemistry', 'biology']],
  [['paryavaran', 'evs', 'environment'], ['पर्यावरण', 'पर्यावरण अध्ययन', 'environmental studies', 'evs']],
  [['itihaas', 'itihas', 'history'], ['इतिहास', 'भारतीय इतिहास', 'history']],
  [['bhugol', 'geography'], ['भूगोल', 'भारत का भूगोल', 'geography']],
  [['nagrik', 'polity', 'civics', 'samvidhan'], ['नागरिक शास्त्र', 'संविधान', 'polity', 'civics', 'constitution']],
  [['samanya gyan', 'gk', 'general knowledge', 'static gk'], ['सामान्य ज्ञान', 'general knowledge', 'gk']],
  [['current affairs', 'samayiki', 'samayik'], ['करंट अफेयर्स', 'समसामयिकी', 'current affairs']],
  [['tarka', 'reasoning', 'tarkashakti'], ['तर्कशक्ति', 'रीजनिंग', 'reasoning', 'intelligence']],
  [['adhigam', 'prerna', 'learning', 'motivation'], ['अधिगम', 'सीखना', 'प्रेरणा', 'learning', 'motivation']],
  [['mulyankan', 'assessment', 'evaluation'], ['मूल्यांकन', 'परीक्षण', 'assessment', 'evaluation']],
  [['sidhhant', 'siddhant', 'theory', 'principles'], ['सिद्धांत', 'नियम', 'theory', 'principles']],
  [['suchna praudyogiki', 'ict', 'computer'], ['सूचना प्रौद्योगिकी', 'कंप्यूटर', 'information technology', 'ict']],
  [['sankhya paddhati', 'number system'], ['संख्या पद्धति', 'number system']],
  [['percentage', 'pratishat', 'profit', 'labh'], ['प्रतिशत', 'लाभ और हानि', 'percentage and profit']],
  [['uptet', 'up tet'], ['UPTET', 'उत्तर प्रदेश शिक्षक पात्रता परीक्षा']],
  [['ctet', 'c tet'], ['CTET', 'केंद्रीय शिक्षक पात्रता परीक्षा']],
  [['super tet', 'supertet', 'stet'], ['Super TET', 'सुपर टीईटी']],
  [['ssc cgl', 'ssc', 'cgl'], ['SSC CGL', 'कंबाइंड ग्रेजुएट लेवल']],
  [['cbse 10', 'class 10', 'cbse class 10'], ['CBSE Class 10', 'कक्षा 10']],
  [['cbse 12', 'class 12', 'cbse class 12'], ['CBSE Class 12', 'कक्षा 12']],
  [['uppcs pre', 'uppcs', 'pcs pre'], ['UPPCS Pre', 'यूपीपीसीएस प्रारंभिक']],
  [['uppcs mains', 'pcs mains'], ['UPPCS Mains', 'यूपीपीसीएस मुख्य']],
  [['pyq', 'previous year', 'past papers'], ['PYQ', 'पिछले वर्षों के प्रश्न', 'पूर्व परीक्षा प्रश्न']],
  [['quiz', 'mcq', 'test', 'mock test'], ['Quiz', 'प्रश्नोत्तरी', 'बहुविकल्पीय प्रश्न', 'MCQ']],
  [['notes', 'study material', 'adhyayan samagri'], ['Study Material', 'अध्ययन सामग्री', 'नोट्स']],
  [['theory', 'siddhantik', 'descriptive'], ['Theory', 'सैद्धांतिक प्रश्न', 'थ्योरी']],
];

/**
 * Normalizes input string for multilingual matching
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, ' ') // replace punctuation with space
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Basic Levenshtein distance for typo tolerance
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Expand query with synonymous terms from transliteration dictionary
 */
function getExpandedQueryTerms(normalizedQuery: string): string[] {
  const terms = new Set<string>();
  terms.add(normalizedQuery);

  const queryWords = normalizedQuery.split(' ').filter(Boolean);
  queryWords.forEach((w) => terms.add(w));

  for (const [latinVariants, hindiEnglishVariants] of TRANSLITERATION_PAIRS) {
    const allVariants = [...latinVariants, ...hindiEnglishVariants].map((v) => normalizeText(v));
    const isMatched = allVariants.some(
      (v) => normalizedQuery.includes(v) || v.includes(normalizedQuery) || queryWords.some((qw) => v.includes(qw))
    );

    if (isMatched) {
      allVariants.forEach((v) => terms.add(v));
    }
  }

  return Array.from(terms);
}

/**
 * Calculate relevance score between a search item and a query
 */
function calculateMatchScore(
  textFields: string[],
  normalizedQuery: string,
  expandedTerms: string[]
): number {
  const joinedText = normalizeText(textFields.join(' '));
  if (!joinedText) return 0;

  // 1. Exact query match
  if (joinedText === normalizedQuery) return 100;
  if (joinedText.startsWith(normalizedQuery)) return 95;
  if (joinedText.includes(normalizedQuery)) return 85;

  // 2. Query words match
  const queryWords = normalizedQuery.split(' ').filter((w) => w.length > 1);
  let matchedWordCount = 0;
  for (const word of queryWords) {
    if (joinedText.includes(word)) {
      matchedWordCount++;
    } else if (word.length >= 4) {
      // Check typo tolerance for words >= 4 letters
      const wordsInTarget = joinedText.split(' ');
      const hasCloseMatch = wordsInTarget.some(
        (tw) => Math.abs(tw.length - word.length) <= 2 && levenshteinDistance(tw, word) <= 1
      );
      if (hasCloseMatch) {
        matchedWordCount += 0.8;
      }
    }
  }

  if (queryWords.length > 0 && matchedWordCount > 0) {
    const wordRatio = matchedWordCount / queryWords.length;
    if (wordRatio >= 1) return 80;
    if (wordRatio >= 0.5) return 60 * wordRatio;
  }

  // 3. Synonym / Transliteration terms match
  for (const term of expandedTerms) {
    if (term.length > 2 && joinedText.includes(term)) {
      return 65;
    }
  }

  return 0;
}

/**
 * Global Search Content Generator
 * Indexes Exams, Subjects, Topics, Study Materials, PYQs, and Quizzes
 */
export function searchContent(
  rawQuery: string,
  filters: SearchFilterOptions = {}
): GroupedSearchResults {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return {
      exams: [],
      subjects: [],
      topics: [],
      studyMaterial: [],
      pyq: [],
      quiz: [],
      theory: [],
      all: [],
      totalCount: 0,
    };
  }

  const normalizedQuery = normalizeText(trimmed);
  const expandedTerms = getExpandedQueryTerms(normalizedQuery);

  const results: SearchResultItem[] = [];

  // 1. Search Exams
  exams.forEach((exam) => {
    const score = calculateMatchScore(
      [exam.name, exam.shortDescription, exam.description, exam.subjects, exam.id],
      normalizedQuery,
      expandedTerms
    );
    if (score > 25) {
      results.push({
        id: `exam_${exam.id}`,
        type: 'exam',
        title: exam.name,
        subtitle: `${exam.subjectIds.length} Subjects · Comprehensive Path`,
        description: exam.shortDescription || exam.description,
        examId: exam.id,
        examName: exam.name,
        url: `/exams/${exam.id}`,
        badgeLabel: 'Exam Path',
        badgeTone: exam.tone,
        matchScore: score + 10, // Slight boost for top-level exams
      });
    }
  });

  // 2. Search Subjects
  subjects.forEach((subject) => {
    const exam = getExam(subject.examId);
    const score = calculateMatchScore(
      [subject.name, subject.description, exam?.name || '', subject.id],
      normalizedQuery,
      expandedTerms
    );
    if (score > 25) {
      results.push({
        id: `subj_${subject.id}`,
        type: 'subject',
        title: subject.name,
        subtitle: `${exam?.name || 'Exam'} · ${subject.topicIds.length} Topics`,
        description: subject.description,
        examId: subject.examId,
        examName: exam?.name || 'Exam',
        subjectId: subject.id,
        subjectName: subject.name,
        url: `/exams/${subject.examId}/${subject.id}`,
        badgeLabel: 'Subject',
        badgeTone: exam?.tone || 'blue',
        matchScore: score + 5,
      });
    }
  });

  // 3. Search Topics
  topics.forEach((topic) => {
    const exam = getExam(topic.examId);
    const subject = getSubject(topic.subjectId);
    const score = calculateMatchScore(
      [topic.name, topic.description, subject?.name || '', exam?.name || '', topic.id],
      normalizedQuery,
      expandedTerms
    );
    if (score > 25) {
      results.push({
        id: `topic_${topic.id}`,
        type: 'topic',
        title: topic.name,
        subtitle: `${exam?.name || ''} › ${subject?.name || ''}`,
        description: topic.description,
        examId: topic.examId,
        examName: exam?.name || 'Exam',
        subjectId: topic.subjectId,
        subjectName: subject?.name || 'Subject',
        topicId: topic.id,
        topicName: topic.name,
        url: `/exams/${topic.examId}/${topic.subjectId}/${topic.id}`,
        badgeLabel: 'Topic',
        badgeTone: 'neutral',
        matchScore: score,
      });

      // If topic has Study Material available, also surface study material result
      if (topic.availability.studyMaterial) {
        results.push({
          id: `study_${topic.id}`,
          type: 'study',
          title: `अध्ययन सामग्री: ${topic.name}`,
          subtitle: `${exam?.name || ''} · ${subject?.name || ''} · Notes`,
          description: `विस्तृत नोट्स, मुख्य बिंदु, परीक्षा दृष्टिकोण और त्वरित रिवीजन सामग्री।`,
          examId: topic.examId,
          examName: exam?.name || 'Exam',
          subjectId: topic.subjectId,
          subjectName: subject?.name || 'Subject',
          topicId: topic.id,
          topicName: topic.name,
          url: `/study-material/${topic.examId}/${topic.subjectId}/${topic.id}`,
          badgeLabel: 'Study Material',
          badgeTone: 'saffron',
          matchScore: score + (normalizedQuery.includes('study') || normalizedQuery.includes('material') || normalizedQuery.includes('notes') || normalizedQuery.includes('सामग्री') ? 15 : 0),
        });
      }

      // If topic has PYQ available, also surface PYQ result
      if (topic.availability.pyq) {
        results.push({
          id: `pyq_${topic.id}`,
          type: 'pyq',
          title: `PYQ अभ्यास: ${topic.name}`,
          subtitle: `${exam?.name || ''} · ${subject?.name || ''} · Previous Year Questions`,
          description: `पूर्व वर्षों के प्रश्न, विस्तृत व्याख्या और परीक्षा पैटर्न पर आधारित अभ्यास।`,
          examId: topic.examId,
          examName: exam?.name || 'Exam',
          subjectId: topic.subjectId,
          subjectName: subject?.name || 'Subject',
          topicId: topic.id,
          topicName: topic.name,
          url: `/pyq/${topic.examId}/${topic.subjectId}/${topic.id}`,
          badgeLabel: 'PYQ Practice',
          badgeTone: 'teal',
          matchScore: score + (normalizedQuery.includes('pyq') || normalizedQuery.includes('previous') || normalizedQuery.includes('प्रश्न') ? 15 : 0),
        });
      }

      // If topic has Quiz available, surface Quiz result
      if (topic.availability.quiz) {
        results.push({
          id: `quiz_${topic.id}`,
          type: 'quiz',
          title: `MCQ Quiz: ${topic.name}`,
          subtitle: `${exam?.name || ''} · ${subject?.name || ''} · 10-15 MCQs`,
          description: `समयबद्ध वस्तुनिष्ठ प्रश्नोत्तरी, त्वरित स्कोरिंग एवं नकारात्मक अंकन विश्लेषण।`,
          examId: topic.examId,
          examName: exam?.name || 'Exam',
          subjectId: topic.subjectId,
          subjectName: subject?.name || 'Subject',
          topicId: topic.id,
          topicName: topic.name,
          url: `/quiz/${topic.examId}/${topic.subjectId}/${topic.id}`,
          badgeLabel: 'MCQ Quiz',
          badgeTone: 'blue',
          matchScore: score + (normalizedQuery.includes('quiz') || normalizedQuery.includes('mcq') || normalizedQuery.includes('test') || normalizedQuery.includes('क्विज़') ? 15 : 0),
        });
      }

      // If topic has Theory available
      if (topic.availability.theory) {
        results.push({
          id: `theory_${topic.id}`,
          type: 'theory',
          title: `Theory Recall: ${topic.name}`,
          subtitle: `${exam?.name || ''} · ${subject?.name || ''} · Descriptive`,
          description: `सैद्धांतिक अवधारणाएं, लिखित उत्तर अभ्यास एवं मुख्य बिंदु।`,
          examId: topic.examId,
          examName: exam?.name || 'Exam',
          subjectId: topic.subjectId,
          subjectName: subject?.name || 'Subject',
          topicId: topic.id,
          topicName: topic.name,
          url: `/theory`,
          badgeLabel: 'Theory',
          badgeTone: 'coral',
          matchScore: score - 5,
        });
      }
    }
  });

  // 6. Search Individual MCQs / Questions (including Shikshan Kaushal 1000 content dataset)
  if (normalizedQuery.length >= 2) {
    const allQuestions = getAllQuizQuestions();
    allQuestions.forEach((q) => {
      const score = calculateMatchScore(
        [
          q.id,
          q.question,
          q.options.A,
          q.options.B,
          q.options.C,
          q.options.D,
          q.explanation,
          q.importantPoint || '',
          q.additionalFact || '',
        ],
        normalizedQuery,
        expandedTerms
      );

      if (score > 35) {
        const topic = getTopic(q.topicId);
        const subject = getSubject(q.subjectId);
        const exam = getExam(q.examId);

        results.push({
          id: `q_${q.id}`,
          type: 'quiz',
          title: `${q.id}: ${q.question.length > 75 ? q.question.slice(0, 72) + '...' : q.question}`,
          subtitle: `${exam?.name || 'Super TET'} · ${subject?.name || 'शिक्षण कौशल'} · ${q.difficulty}`,
          description: q.explanation || q.importantPoint || 'अवधारणा-आधारित बहुविकल्पीय प्रश्न एवं समाधान।',
          examId: q.examId,
          examName: exam?.name || 'Super TET',
          subjectId: q.subjectId,
          subjectName: subject?.name || 'शिक्षण कौशल',
          topicId: q.topicId,
          topicName: topic?.name,
          url: `/quiz/${q.examId}/${q.subjectId}/${q.topicId}`,
          badgeLabel: `${q.id} · MCQ`,
          badgeTone: 'blue',
          matchScore: score + (q.id.toLowerCase().includes(normalizedQuery) ? 30 : 0),
          difficulty: q.difficulty,
        });
      }
    });
  }

  // Filter by options if provided
  let filteredResults = results;
  if (filters.type && filters.type !== 'all') {
    filteredResults = filteredResults.filter((r) => r.type === filters.type);
  }
  if (filters.examId && filters.examId !== 'all') {
    filteredResults = filteredResults.filter((r) => r.examId === filters.examId);
  }

  // Deduplicate by ID
  const seenIds = new Set<string>();
  const uniqueResults: SearchResultItem[] = [];
  for (const item of filteredResults) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      uniqueResults.push(item);
    }
  }

  // Sort by matchScore descending
  uniqueResults.sort((a, b) => b.matchScore - a.matchScore);

  const grouped: GroupedSearchResults = {
    exams: uniqueResults.filter((r) => r.type === 'exam'),
    subjects: uniqueResults.filter((r) => r.type === 'subject'),
    topics: uniqueResults.filter((r) => r.type === 'topic'),
    studyMaterial: uniqueResults.filter((r) => r.type === 'study'),
    pyq: uniqueResults.filter((r) => r.type === 'pyq'),
    quiz: uniqueResults.filter((r) => r.type === 'quiz'),
    theory: uniqueResults.filter((r) => r.type === 'theory'),
    all: uniqueResults,
    totalCount: uniqueResults.length,
  };

  return grouped;
}

/**
 * Lightweight quick search suggestions (for header dropdown)
 */
export function getSearchSuggestions(query: string, limit = 6): SearchResultItem[] {
  if (!query.trim()) return [];
  const results = searchContent(query);
  return results.all.slice(0, limit);
}

/**
 * Recent Searches Management in localStorage (key: examsetu4u_search_history)
 */
export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(rawQuery: string): void {
  if (typeof window === 'undefined') return;
  const term = rawQuery.trim();
  if (!term || term.length < 2) return;

  try {
    const current = getRecentSearches();
    const updated = [term, ...current.filter((q) => q.toLowerCase() !== term.toLowerCase())].slice(0, 8);
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export function removeRecentSearch(termToRemove: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getRecentSearches();
    const updated = current.filter((q) => q.toLowerCase() !== termToRemove.toLowerCase());
    window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {}
}

/**
 * Deterministic Recommendations Engine
 * Strictly uses local user progress and curriculum structure (NO fake AI).
 */
export interface RecommendationItem {
  id: string;
  topicId: string;
  topicName: string;
  subjectId: string;
  subjectName: string;
  examId: string;
  examName: string;
  reason: 'continue' | 'weak_area' | 'unstarted' | 'practice_test' | 'popular';
  reasonLabel: string;
  badgeTone: 'warning' | 'info' | 'success' | 'primary';
  actionUrl: string;
  actionLabel: string;
  progressPercent: number;
}

export function getDeterministicRecommendations(
  preferredExamId = 'super-tet',
  limit = 4
): RecommendationItem[] {
  const recommendations: RecommendationItem[] = [];
  const weakAreas = getWeakAreas();
  const continueItem = getContinueLearning();
  const topicMap = getLegacyTopicProgressMap();

  // 1. Weak Areas: If quiz/pyq accuracy is low on a topic, prioritize review
  if (weakAreas.length > 0) {
    weakAreas.slice(0, 2).forEach((wa) => {
      recommendations.push({
        id: `rec_weak_${wa.topicId}`,
        topicId: wa.topicId,
        topicName: wa.topicName,
        subjectId: wa.subjectId,
        subjectName: wa.subjectName,
        examId: wa.examId,
        examName: wa.examName,
        reason: 'weak_area',
        reasonLabel: `सटीकता ${wa.accuracy}% (सुधार आवश्यक)`,
        badgeTone: 'warning',
        actionUrl: wa.practiceUrl,
        actionLabel: 'कमजोरी दूर करें',
        progressPercent: wa.accuracy,
      });
    });
  }

  // 2. In-Progress Topic: If user started a topic but hasn't finished (progress > 0 and < 100)
  if (continueItem && continueItem.progress < 100) {
    if (!recommendations.some((r) => r.topicId === continueItem.topicId)) {
      recommendations.push({
        id: `rec_continue_${continueItem.topicId}`,
        topicId: continueItem.topicId,
        topicName: continueItem.topicName,
        subjectId: continueItem.subjectId,
        subjectName: continueItem.subjectName,
        examId: continueItem.examId,
        examName: continueItem.examName,
        reason: 'continue',
        reasonLabel: `${Math.round(continueItem.progress)}% पूर्ण • जारी रखें`,
        badgeTone: 'info',
        actionUrl: continueItem.url,
        actionLabel: 'अध्ययन जारी रखें',
        progressPercent: Math.round(continueItem.progress),
      });
    }
  }

  // 3. Completed Topics: If topic is completed (>= 80%), recommend taking PYQs or Quiz
  const completedTopics = topics.filter((t) => (topicMap[t.id] ?? 0) >= 80 && t.examId === preferredExamId);
  if (completedTopics.length > 0) {
    const compTopic = completedTopics[0];
    const exam = getExam(compTopic.examId);
    const subject = getSubject(compTopic.subjectId);
    if (!recommendations.some((r) => r.topicId === compTopic.id)) {
      recommendations.push({
        id: `rec_quiz_${compTopic.id}`,
        topicId: compTopic.id,
        topicName: compTopic.name,
        subjectId: compTopic.subjectId,
        subjectName: subject?.name || 'Subject',
        examId: compTopic.examId,
        examName: exam?.name || 'Exam',
        reason: 'practice_test',
        reasonLabel: 'नोट्स पूर्ण • अब PYQ/क्विज़ दें',
        badgeTone: 'success',
        actionUrl: `/quiz/${compTopic.examId}/${compTopic.subjectId}/${compTopic.id}`,
        actionLabel: 'MCQ टेस्ट दें',
        progressPercent: 100,
      });
    }
  }

  // 4. Unstarted foundational topics in preferred exam
  const examTopics = topics.filter((t) => t.examId === preferredExamId);
  const unstarted = examTopics.filter((t) => !topicMap[t.id] && !recommendations.some((r) => r.topicId === t.id));

  for (const topic of unstarted) {
    if (recommendations.length >= limit) break;
    const exam = getExam(topic.examId);
    const subject = getSubject(topic.subjectId);
    recommendations.push({
      id: `rec_start_${topic.id}`,
      topicId: topic.id,
      topicName: topic.name,
      subjectId: topic.subjectId,
      subjectName: subject?.name || 'Subject',
      examId: topic.examId,
      examName: exam?.name || 'Exam',
      reason: 'unstarted',
      reasonLabel: 'नया अध्याय • अभी शुरू करें',
      badgeTone: 'primary',
      actionUrl: `/exams/${topic.examId}/${topic.subjectId}/${topic.id}`,
      actionLabel: 'अध्याय शुरू करें',
      progressPercent: 0,
    });
  }

  // Fallback if still under limit
  if (recommendations.length === 0) {
    const defaultTopic = topics[0];
    const exam = getExam(defaultTopic.examId);
    const subject = getSubject(defaultTopic.subjectId);
    recommendations.push({
      id: 'rec_fallback',
      topicId: defaultTopic.id,
      topicName: defaultTopic.name,
      subjectId: defaultTopic.subjectId,
      subjectName: subject?.name || 'Subject',
      examId: defaultTopic.examId,
      examName: exam?.name || 'Super TET',
      reason: 'unstarted',
      reasonLabel: 'सुझाया गया प्रारंभिक विषय',
      badgeTone: 'primary',
      actionUrl: `/study-material/${defaultTopic.examId}/${defaultTopic.subjectId}/${defaultTopic.id}`,
      actionLabel: 'अध्ययन प्रारंभ करें',
      progressPercent: 0,
    });
  }

  return recommendations.slice(0, limit);
}

/**
 * Get Popular Subjects across exams for fast discovery
 */
export interface PopularSubjectItem {
  id: string;
  name: string;
  examId: string;
  examName: string;
  description: string;
  topicCount: number;
  url: string;
  tone: 'saffron' | 'teal' | 'blue' | 'coral';
}

export function getPopularSubjects(): PopularSubjectItem[] {
  const popularSubjectIds = [
    'super-tet-teaching-skills',
    'super-tet-child-development',
    'ssc-cgl-reasoning',
    'ssc-cgl-quantitative-aptitude',
    'uptet-mathematics',
    'cbse-class-10-science',
  ];

  return popularSubjectIds
    .map((id) => {
      const subject = getSubject(id);
      if (!subject) return null;
      const exam = getExam(subject.examId);
      return {
        id: subject.id,
        name: subject.name,
        examId: subject.examId,
        examName: exam?.name || 'Exam',
        description: subject.description,
        topicCount: subject.topicIds.length,
        url: `/exams/${subject.examId}/${subject.id}`,
        tone: (exam?.tone || 'blue') as 'saffron' | 'teal' | 'blue' | 'coral',
      };
    })
    .filter((s): s is PopularSubjectItem => Boolean(s));
}
