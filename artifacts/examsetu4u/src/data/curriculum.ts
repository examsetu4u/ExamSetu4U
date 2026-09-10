export type ContentAvailability = {
  studyMaterial: boolean;
  pyq: boolean;
  quiz: boolean;
  theory: boolean;
};

export type Progress = {
  percent: number;
  completed: boolean;
};

export type Topic = {
  id: string;
  examId: string;
  subjectId: string;
  name: string;
  description: string;
  estimatedMinutes: number;
  availability: ContentAvailability;
};

export type Subject = {
  id: string;
  examId: string;
  name: string;
  description: string;
  topicIds: string[];
};

export type Exam = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  subjects: string;
  subjectIds: string[];
  tone: 'saffron' | 'teal' | 'blue' | 'coral';
};

type SubjectDefinition = {
  id: string;
  name: string;
  description: string;
  topics: string[];
};

type ExamDefinition = Omit<Exam, 'subjectIds' | 'subjects'> & {
  subjects: SubjectDefinition[];
};

function createCurriculum(definitions: ExamDefinition[]) {
  const exams: Exam[] = [];
  const subjects: Subject[] = [];
  const topics: Topic[] = [];

  definitions.forEach((definition) => {
    const subjectIds = definition.subjects.map((subject) => `${definition.id}-${subject.id}`);
    exams.push({ ...definition, subjectIds, subjects: definition.subjects.map((subject) => subject.name).slice(0, 3).join(' · ') });

    definition.subjects.forEach((subject) => {
      const subjectId = `${definition.id}-${subject.id}`;
      const topicIds = subject.topics.map((_, index) => `${subjectId}-${index + 1}`);
      subjects.push({ id: subjectId, examId: definition.id, name: subject.name, description: subject.description, topicIds });

      subject.topics.forEach((topicName, index) => {
        topics.push({
          id: topicIds[index],
          examId: definition.id,
          subjectId,
          name: topicName,
          description: `Build a clear understanding of ${topicName.toLowerCase()} with focused notes, practice and revision.`,
          estimatedMinutes: 20 + (index % 3) * 10,
          availability: {
            studyMaterial: true,
            pyq: index % 3 !== 1,
            quiz: true,
            theory: index % 2 === 0,
          },
        });
      });
    });
  });

  return { exams, subjects, topics };
}

const curriculumDefinitions: ExamDefinition[] = [
  {
    id: 'super-tet',
    name: 'Super TET',
    shortDescription: 'Prepare for teaching eligibility with focused practice and clear concepts.',
    description: 'A guided preparation path for Super TET with pedagogy, languages, subject knowledge and general awareness.',
    subjects: [
      { id: 'child-development', name: 'बाल विकास एवं शिक्षाशास्त्र', description: 'Understand how children learn, grow and respond to different teaching approaches.', topics: ['बाल विकास के सिद्धांत', 'अधिगम और प्रेरणा', 'समावेशी शिक्षा'] },
      { id: 'teaching-skills', name: 'शिक्षण कौशल', description: 'Strengthen classroom practice, assessment and learner-centred teaching skills.', topics: ['शिक्षण की विधियाँ', 'मूल्यांकन और मापन', 'कक्षा प्रबंधन'] },
      { id: 'hindi', name: 'भाषा हिंदी', description: 'Revise Hindi language understanding, grammar and comprehension.', topics: ['हिंदी व्याकरण', 'अपठित गद्यांश', 'शब्द ज्ञान'] },
      { id: 'english', name: 'भाषा अंग्रेजी', description: 'Build practical English comprehension and grammar skills.', topics: ['Parts of Speech', 'Reading Comprehension', 'Vocabulary and Usage'] },
      { id: 'mathematics', name: 'गणित', description: 'Practice foundational mathematics concepts used in the teaching eligibility syllabus.', topics: ['संख्या पद्धति', 'भिन्न और दशमलव', 'ज्यामिति और मापन'] },
      { id: 'evs', name: 'पर्यावरण अध्ययन', description: 'Connect everyday life, environment and learning through core EVS themes.', topics: ['परिवार और समाज', 'प्राकृतिक संसाधन', 'स्वास्थ्य और स्वच्छता'] },
      { id: 'science', name: 'विज्ञान', description: 'Revise basic science concepts with classroom-friendly explanations.', topics: ['भौतिक विज्ञान की मूल बातें', 'जीव विज्ञान की मूल बातें', 'दैनिक जीवन में विज्ञान'] },
      { id: 'social-studies', name: 'सामाजिक अध्ययन', description: 'Cover history, geography and civics through structured revision.', topics: ['भारतीय इतिहास', 'भारत का भूगोल', 'नागरिक शास्त्र'] },
      { id: 'general-knowledge', name: 'सामान्य ज्ञान', description: 'Build a reliable base of static general awareness topics.', topics: ['भारत सामान्य ज्ञान', 'विश्व सामान्य ज्ञान', 'महत्वपूर्ण दिवस'] },
      { id: 'current-affairs', name: 'करंट अफेयर्स', description: 'Keep revision organised around important national and international events.', topics: ['राष्ट्रीय घटनाक्रम', 'अंतरराष्ट्रीय घटनाक्रम', 'खेल और पुरस्कार'] },
      { id: 'information-technology', name: 'सूचना प्रौद्योगिकी', description: 'Learn the digital literacy concepts relevant to modern teaching.', topics: ['कंप्यूटर की मूल बातें', 'इंटरनेट और सुरक्षा', 'डिजिटल शिक्षण'] },
    ],
    tone: 'saffron',
  },
  {
    id: 'ctet',
    name: 'CTET',
    shortDescription: 'Build a steady foundation for the Central Teacher Eligibility Test.',
    description: 'Organise CTET preparation by subject, topic and content type so every revision session has a clear next step.',
    subjects: [
      { id: 'child-development', name: 'Child Development & Pedagogy', description: 'Study child development, learning theories and inclusive classroom practice.', topics: ['Child Development', 'Learning and Pedagogy', 'Inclusive Education'] },
      { id: 'mathematics', name: 'Mathematics', description: 'Revise primary and elementary mathematics concepts with teaching methods.', topics: ['Number System', 'Geometry and Measurement', 'Pedagogical Issues'] },
      { id: 'environmental-studies', name: 'Environmental Studies', description: 'Connect environment, family, food and community with classroom learning.', topics: ['Family and Friends', 'Food and Shelter', 'EVS Pedagogy'] },
      { id: 'language-1', name: 'Language I', description: 'Practice language comprehension and the pedagogy of language development.', topics: ['Reading Comprehension', 'Language Development', 'Language Pedagogy'] },
      { id: 'language-2', name: 'Language II', description: 'Strengthen comprehension, communication and language teaching strategies.', topics: ['Unseen Passages', 'Grammar and Communication', 'Language Learning'] },
      { id: 'social-studies', name: 'Social Studies/Social Science', description: 'Build concepts across history, geography, civics and social science pedagogy.', topics: ['History', 'Geography and Resources', 'Social and Political Life'] },
      { id: 'science', name: 'Science', description: 'Revise science concepts and the methods used to teach them effectively.', topics: ['Food and Materials', 'How Things Work', 'Science Pedagogy'] },
    ],
    tone: 'teal',
  },
  {
    id: 'uptet',
    name: 'UPTET',
    shortDescription: 'Revise the Uttar Pradesh TET syllabus with simple study paths.',
    description: 'A subject-wise UPTET route for building fundamentals, tracking revision and finding practice content quickly.',
    subjects: [
      { id: 'child-development', name: 'बाल विकास एवं शिक्षाशास्त्र', description: 'Cover learner development and the principles of effective teaching.', topics: ['बाल विकास', 'अधिगम सिद्धांत', 'समावेशी शिक्षा'] },
      { id: 'hindi', name: 'भाषा हिंदी', description: 'Revise Hindi comprehension, grammar and language pedagogy.', topics: ['व्याकरण', 'गद्य और पद्य', 'भाषा शिक्षण'] },
      { id: 'english', name: 'Language English', description: 'Practice English language understanding and pedagogy.', topics: ['Grammar Basics', 'Comprehension', 'Language Pedagogy'] },
      { id: 'mathematics', name: 'गणित', description: 'Strengthen arithmetic, geometry and mathematics teaching concepts.', topics: ['अंकगणित', 'बीजगणित और ज्यामिति', 'गणित शिक्षण'] },
      { id: 'evs', name: 'पर्यावरण अध्ययन', description: 'Study environment and everyday experiences through the UPTET syllabus.', topics: ['परिवार और भोजन', 'जल और आवास', 'EVS शिक्षण'] },
    ],
    tone: 'blue',
  },
  {
    id: 'ssc-cgl',
    name: 'SSC CGL',
    shortDescription: 'Keep your SSC preparation organised across aptitude and reasoning.',
    description: 'Prepare for SSC CGL with compact subject routes for reasoning, awareness, quantitative aptitude and English.',
    subjects: [
      { id: 'reasoning', name: 'General Intelligence & Reasoning', description: 'Build speed and accuracy across verbal and non-verbal reasoning.', topics: ['Analogy and Classification', 'Series and Coding', 'Non-verbal Reasoning'] },
      { id: 'general-awareness', name: 'General Awareness', description: 'Organise static GK, current affairs and core general awareness topics.', topics: ['Indian Polity', 'History and Geography', 'Science and Current Affairs'] },
      { id: 'quantitative-aptitude', name: 'Quantitative Aptitude', description: 'Practice arithmetic, algebra and data interpretation step by step.', topics: ['Percentage and Profit', 'Ratio and Average', 'Data Interpretation'] },
      { id: 'english-comprehension', name: 'English Comprehension', description: 'Improve grammar, vocabulary and reading comprehension for SSC exams.', topics: ['Spotting Errors', 'Vocabulary', 'Reading Comprehension'] },
    ],
    tone: 'coral',
  },
  {
    id: 'cbse-class-10',
    name: 'CBSE Class 10',
    shortDescription: 'Build a clear Class 10 revision plan across core CBSE subjects.',
    description: 'A lightweight Class 10 curriculum map for concept revision, practice and board exam preparation.',
    subjects: [
      { id: 'mathematics', name: 'Mathematics', description: 'Revise the core mathematics chapters in a manageable order.', topics: ['Real Numbers', 'Polynomials', 'Triangles'] },
      { id: 'science', name: 'Science', description: 'Keep physics, chemistry and biology revision connected to the syllabus.', topics: ['Chemical Reactions', 'Light and Human Eye', 'Life Processes'] },
      { id: 'social-science', name: 'Social Science', description: 'Study history, geography, political science and economics together.', topics: ['Nationalism in India', 'Resources and Development', 'Power Sharing'] },
      { id: 'english', name: 'English', description: 'Prepare literature, reading and writing skills for board exams.', topics: ['Reading Skills', 'Writing Skills', 'Literature Reader'] },
      { id: 'hindi', name: 'Hindi', description: 'Revise Hindi language, writing and prescribed literature.', topics: ['अपठित बोध', 'लेखन कौशल', 'क्षितिज और कृतिका'] },
    ],
    tone: 'blue',
  },
  {
    id: 'cbse-class-12',
    name: 'CBSE Class 12',
    shortDescription: 'Organise senior secondary revision with subject-wise topic routes.',
    description: 'An extensible Class 12 sample structure for board preparation and topic-level progress tracking.',
    subjects: [
      { id: 'physics', name: 'Physics', description: 'Move through the major Class 12 physics units with focused revision.', topics: ['Electrostatics', 'Current Electricity', 'Optics'] },
      { id: 'chemistry', name: 'Chemistry', description: 'Revise physical, organic and inorganic chemistry concepts.', topics: ['Solutions', 'Electrochemistry', 'Amines'] },
      { id: 'mathematics', name: 'Mathematics', description: 'Build a structured path across calculus, algebra and vectors.', topics: ['Relations and Functions', 'Integrals', 'Vectors and 3D Geometry'] },
      { id: 'biology', name: 'Biology', description: 'Cover reproduction, genetics, ecology and human welfare topics.', topics: ['Reproduction', 'Genetics and Evolution', 'Ecology'] },
      { id: 'english', name: 'English Core', description: 'Prepare reading, writing and literature sections for the board exam.', topics: ['Reading Comprehension', 'Writing Skills', 'Literature'] },
    ],
    tone: 'teal',
  },
  {
    id: 'uppcs-pre',
    name: 'UPPCS Pre',
    shortDescription: 'Prepare for UPPCS Prelims with a focused general studies route.',
    description: 'A sample UPPCS Prelims structure organised around General Studies I and CSAT practice.',
    subjects: [
      { id: 'general-studies-1', name: 'General Studies I', description: 'Cover history, polity, geography, economy, science and current affairs.', topics: ['Indian History and Culture', 'Indian Polity', 'Geography and Economy'] },
      { id: 'general-studies-2', name: 'General Studies II / CSAT', description: 'Practice comprehension, reasoning, numeracy and decision-making skills.', topics: ['Comprehension', 'Logical Reasoning', 'Numeracy and Data Interpretation'] },
    ],
    tone: 'saffron',
  },
  {
    id: 'uppcs-mains',
    name: 'UPPCS Mains',
    shortDescription: 'Map UPPCS Mains preparation paper by paper.',
    description: 'A paper-wise UPPCS Mains structure that can later expand into detailed notes and answer practice.',
    subjects: [
      { id: 'general-hindi', name: 'General Hindi', description: 'Build accuracy in grammar, précis, comprehension and writing.', topics: ['व्याकरण', 'संक्षेपण', 'निबंध और पत्र लेखन'] },
      { id: 'essay', name: 'Essay', description: 'Practice structured arguments, examples and balanced essay writing.', topics: ['Essay Structure', 'Social Issues', 'Governance and Economy'] },
      { id: 'gs-paper-1', name: 'General Studies Paper I', description: 'Study history, culture, society and geography for the mains paper.', topics: ['History and Culture', 'Indian Society', 'World and Indian Geography'] },
      { id: 'gs-paper-2', name: 'General Studies Paper II', description: 'Revise polity, governance, social justice and international relations.', topics: ['Constitution and Polity', 'Governance and Social Justice', 'International Relations'] },
      { id: 'gs-paper-3', name: 'General Studies Paper III', description: 'Cover economy, agriculture, science, technology and security.', topics: ['Indian Economy', 'Agriculture and Environment', 'Science and Security'] },
      { id: 'gs-paper-4', name: 'General Studies Paper IV', description: 'Develop clarity around ethics, integrity and aptitude case studies.', topics: ['Ethics and Human Values', 'Emotional Intelligence', 'Case Studies'] },
    ],
    tone: 'coral',
  },
];

export const { exams, subjects, topics } = createCurriculum(curriculumDefinitions);

export function getExam(examId: string) {
  return exams.find((exam) => exam.id === examId);
}

export function getSubject(subjectId: string) {
  return subjects.find((subject) => subject.id === subjectId);
}

export function getTopic(topicId: string) {
  return topics.find((topic) => topic.id === topicId);
}

export function getSubjectsForExam(examId: string) {
  return subjects.filter((subject) => subject.examId === examId);
}

export function getTopicsForSubject(subjectId: string) {
  return topics.filter((topic) => topic.subjectId === subjectId);
}