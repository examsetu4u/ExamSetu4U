/**
 * Master Visual Flow Architecture & Curriculum Hierarchy for Teaching Exams
 * Covers: CTET, UPTET, and SUPER TET
 *
 * Flow:
 * EXAMSETU4U
 *  │
 *  ▼
 * UPTET / CTET / SUPER TET
 *  │
 *  ┌──────────────┼──────────────┐
 *  ▼              ▼              ▼
 * CTET           UPTET         SUPER TET
 *  │              │              │
 *  ▼              ▼              ▼
 * PAPER-I        PAPER-I        PRIMARY
 *  │              │              │
 *  ▼              ▼              ▼
 * PAPER-II       PAPER-II    UPPER PRIMARY
 *  │              │              │
 *  └──────────────┼──────────────┘
 *  ▼
 * SUBJECT
 *  │
 *  ▼
 * CHAPTER
 *  │
 *  ▼
 * TOPIC
 *  │
 *  ▼
 * SUB-TOPIC
 *  │
 *  ┌──────────────┼──────────────┐
 *  ▼              ▼              ▼
 * STUDY MATERIAL       QUIZ            PYQ
 *  │              │              │
 *  ▼              ▼              ▼
 * NOTES          MCQ TEST     PREVIOUS YEAR
 * CONCEPTS       PRACTICE      QUESTIONS
 * EXAMPLES       MOCK TEST     PYQ ANALYSIS
 * IMPORTANT      RESULTS       PYQ CONCEPTS
 * POINTS
 *  │              │              │
 *  └──────────────┼──────────────┘
 *  ▼
 * REVISION
 *  │
 *  ▼
 * PROGRESS
 *  │
 *  ▼
 * INTELLIGENT SCORE
 *  │
 *  ▼
 * WEAK TOPIC ANALYSIS
 *  │
 *  ▼
 * PERSONALIZED REVISION
 */

export type QuestionType =
  | 'DIRECT_MCQ'
  | 'STATEMENT_BASED'
  | 'ASSERTION_REASON'
  | 'MATCHING'
  | 'CASE_BASED'
  | 'PASSAGE_BASED'
  | 'SEQUENCE_ORDER'
  | 'CLASSROOM_SITUATION'
  | 'DIAGRAM_BASED';

export interface HierarchySubTopic {
  id: string;
  name: string;
  hindiName?: string;
  description?: string;
}

export interface HierarchyTopic {
  id: string;
  name: string;
  hindiName?: string;
  description?: string;
  subTopics: (string | HierarchySubTopic)[];
  keyConcepts?: string[];
  studyNotesPreview?: string;
  hasStudyMaterial?: boolean;
  hasQuiz?: boolean;
  hasPYQ?: boolean;
}

export interface HierarchyChapter {
  id: string;
  name: string;
  title?: string;
  chapterNumber?: number | string;
  hindiName?: string;
  description?: string;
  topics: HierarchyTopic[];
}

export interface HierarchySubject {
  id: string;
  canonicalSubjectId: string;
  name: string;
  hindiName?: string;
  description: string;
  group?: 'core' | 'mathematics-science' | 'social-science' | 'language';
  groupLabel?: string;
  isCompulsory?: boolean;
  isOptional?: boolean;
  chapters: HierarchyChapter[];
}

export interface HierarchyPaper {
  id: string;
  name: string;
  shortName: string;
  hindiName: string;
  targetClass: string;
  type?: string;
  targetAudience?: string;
  description: string;
  subjects: HierarchySubject[];
  subjectGroups?: {
    id: string;
    title: string;
    description: string;
    isElective?: boolean;
    subjectIds: string[];
  }[];
}

export interface TeachingExamStructure {
  id: 'ctet' | 'uptet' | 'super-tet';
  name: string;
  hindiName: string;
  tagline: string;
  subtitle?: string;
  description: string;
  papers: HierarchyPaper[];
}

export type TeachingExamNode = TeachingExamStructure;
export type TeachingPaperNode = HierarchyPaper;
export type TeachingSubjectNode = HierarchySubject;
export type TeachingChapterNode = HierarchyChapter;
export type TeachingTopicNode = HierarchyTopic;
export type TeachingSubTopicNode = HierarchySubTopic;

const TEACHING_EXAMS_DATA: Record<string, TeachingExamStructure> = {
  // ===========================================================================
  // 1. CTET (Central Teacher Eligibility Test)
  // ===========================================================================
  ctet: {
    id: 'ctet',
    name: 'CTET',
    hindiName: 'केंद्रीय शिक्षक पात्रता परीक्षा',
    tagline: 'Paper-I (Primary) एवं Paper-II (Elementary) की व्यवस्थित तैयारी',
    description: 'CBSE द्वारा आयोजित राष्ट्रीय स्तर की केंद्रीय शिक्षक पात्रता परीक्षा का संपूर्ण पाठ्यक्रम, अध्याय, मॉक क्विज़ और विगत वर्षों के प्रश्न।',
    papers: [
      {
        id: 'paper-1',
        name: 'Paper-I (Class I - V)',
        shortName: 'Paper-I',
        hindiName: 'पेपर-1 (प्राथमिक स्तर - कक्षा 1 से 5)',
        targetClass: 'Class 1 to 5',
        description: 'प्राथमिक स्तर के शिक्षकों के लिए 5 अनिवार्य खंड: बाल विकास, गणित, पर्यावरण अध्ययन, भाषा-1 और भाषा-2।',
        subjects: [
          {
            id: 'ctet-p1-cdp',
            canonicalSubjectId: 'ctet-child-development',
            name: 'Child Development & Pedagogy',
            hindiName: 'बाल विकास एवं शिक्षाशास्त्र',
            description: 'प्राथमिक विद्यालयी बच्चों का विकास, समावेशी शिक्षा, विशेष आवश्यकता वाले बालक तथा सीखने-सिखाने की विधियाँ।',
            group: 'core',
            chapters: [
              {
                id: 'ctet-p1-cdp-ch1',
                name: 'Child Development',
                hindiName: 'बाल विकास की अवधारणा एवं सिद्धांत',
                topics: [
                  {
                    id: 'ctet-child-development-1',
                    name: 'Child Development',
                    hindiName: 'बाल विकास (अर्थ, अवस्थाएँ एवं सिद्धांत)',
                    subTopics: ['विकास की अवधारणा एवं अधिगम से संबंध', 'विकास के सिद्धांत', 'वंशानुक्रम एवं वातावरण का प्रभाव'],
                    keyConcepts: ['Cephalocaudal & Proximodistal principle', 'Maturation vs Learning', 'Nature vs Nurture'],
                  },
                  {
                    id: 'ctet-child-development-2',
                    name: 'Learning & Pedagogy',
                    hindiName: 'अधिगम एवं शिक्षाशास्त्र (Learning & Pedagogy)',
                    subTopics: ['बच्चे कैसे सोचते और सीखते हैं', 'रचनावादी उपागम (Constructivism)', 'शिक्षक की सुविधादाता के रूप में भूमिका'],
                    keyConcepts: ['Active inquiry', 'Scaffolding', 'Experiential learning'],
                  },
                  {
                    id: 'ctet-child-development-3',
                    name: 'Learning Theories',
                    hindiName: 'अधिगम सिद्धांत (Piaget, Vygotsky, Kohlberg)',
                    subTopics: ['जीन पियाजे का संज्ञानात्मक विकास सिद्धांत', 'लेव वाइगोत्स्की का सामाजिक-सांस्कृतिक सिद्धांत (ZPD, Scaffolding)', 'कोहलबर्ग का नैतिक विकास सिद्धांत'],
                    keyConcepts: ['Sensorimotor to Formal Operational stages', 'Zone of Proximal Development', 'Moral Dilemmas & Stages'],
                  },
                  {
                    id: 'ctet-child-development-4',
                    name: 'Intelligence',
                    hindiName: 'बुद्धि की संरचना एवं बहु-बुद्धि सिद्धांत',
                    subTopics: ['हावर्ड गार्डनर का बहु-बुद्धि सिद्धांत (Multiple Intelligences)', 'त्रि-चापीय सिद्धांत (Triarchic Theory)', 'बुद्धि लब्धि (IQ) एवं सीमाएं'],
                    keyConcepts: ['8 Types of Intelligences', 'Spatial, Bodily-Kinesthetic, Interpersonal, Intrapersonal'],
                  },
                  {
                    id: 'ctet-child-development-5',
                    name: 'Individual Differences',
                    hindiName: 'व्यक्तिगत विभिन्नताएँ',
                    subTopics: ['भाषा, जाति, लिंग, समुदाय व धर्म के आधार पर विभिन्नताएँ', 'लैंगिक रूढ़िवादिता (Gender Bias)', 'कक्षा में विविधता का सम्मान'],
                    keyConcepts: ['Differentiated Instruction', 'Gender as a Social Construct', 'Cultural responsiveness'],
                  },
                  {
                    id: 'ctet-child-development-6',
                    name: 'Inclusive Education',
                    hindiName: 'समावेशी शिक्षा की अवधारणा',
                    subTopics: ['समावेशी शिक्षा के मूल सिद्धांत', 'वंचित एवं पिछड़े वर्ग के बच्चों का समावेशन', 'RTE Act 2009 एवं RPwD Act 2016'],
                    keyConcepts: ['Least Restrictive Environment', 'Barrier-free access', 'Equity vs Equality'],
                  },
                  {
                    id: 'ctet-child-development-7',
                    name: 'Special Needs',
                    hindiName: 'विशेष आवश्यकता वाले बच्चे (CWSN)',
                    subTopics: ['अधिगम अक्षमताएं (Dyslexia, Dysgraphia, Dyscalculia, ADHD)', 'प्रतिभाशाली बालक (Gifted)', 'सृजनात्मक बालक (Creative Learners)'],
                    keyConcepts: ['Diagnostic identification', 'Universal Design for Learning (UDL)', 'Assistive aids'],
                  },
                  {
                    id: 'ctet-child-development-8',
                    name: 'Assessment',
                    hindiName: 'मूल्यांकन एवं सतत-व्यापक मूल्यांकन (CCE)',
                    subTopics: ['Assessment FOR Learning vs OF Learning vs AS Learning', 'सतत एवं व्यापक मूल्यांकन (CCE)', 'पोर्टफोलियो, रूब्रिक्स, उपाख्यानात्मक अभिलेख'],
                    keyConcepts: ['Formative vs Summative', 'Feedback vs Grading', 'Holistic progress cards'],
                  },
                  {
                    id: 'ctet-child-development-9',
                    name: 'Remedial Teaching',
                    hindiName: 'उपचारात्मक एवं निदानात्मक शिक्षण',
                    subTopics: ['निदानात्मक परीक्षण (Diagnostic Test)', 'उपचारात्मक शिक्षण (Remedial Teaching)', 'त्रुटियों का शैक्षिक विश्लेषण'],
                    keyConcepts: ['Identifying misconceptions', 'Targeted intervention', 'Mastery learning'],
                  },
                ],
              },
            ],
          },
          {
            id: 'ctet-p1-maths',
            canonicalSubjectId: 'ctet-mathematics',
            name: 'Mathematics',
            hindiName: 'गणित एवं गणित-शिक्षाशास्त्र',
            description: 'प्राथमिक स्तर की संख्या पद्धति, अंकगणित, ज्यामिति, मापन तथा गणितीय सोच एवं शिक्षाशास्त्र।',
            group: 'core',
            chapters: [
              {
                id: 'ctet-p1-maths-ch1',
                name: 'Content & Pedagogy',
                hindiName: 'गणित विषयवस्तु एवं शिक्षाशास्त्र',
                topics: [
                  {
                    id: 'ctet-mathematics-1',
                    name: 'Number System',
                    hindiName: 'संख्या पद्धति (Number System)',
                    subTopics: ['प्राकृतिक, पूर्ण, पूर्णांक, सम, विषम, अभाज्य संख्याएँ', 'स्थानीय मान और अंकित मान (Place Value & Face Value)', 'संक्रियाएं (जोड़, घटाव, गुणा, भाग)'],
                    keyConcepts: ['Base-10 system', 'Number sense', 'Estimation and mental arithmetic'],
                  },
                  {
                    id: 'ctet-mathematics-2',
                    name: 'Arithmetic',
                    hindiName: 'अंकगणित (Arithmetic & Operations)',
                    subTopics: ['भिन्न और दशमलव संख्याएं', 'ल.स.प. व म.स.प. (LCM & HCF)', 'प्रतिशत, अनुपात एवं ऐकिक नियम'],
                    keyConcepts: ['Fraction operations', 'Unitary method', 'Real-life applications'],
                  },
                  {
                    id: 'ctet-mathematics-3',
                    name: 'Geometry',
                    hindiName: 'ज्यामिति (Geometry & Shapes)',
                    subTopics: ['2D एवं 3D आकृतियों की पहचान', 'बिंदु, रेखा, किरण, कोण एवं त्रिभुज', 'वैन हीले का ज्यामितीय चिंतन सिद्धांत (Van Hiele Levels)'],
                    keyConcepts: ['Van Hiele Levels 0 to 4', 'Symmetry & Tessellation', 'Spatial reasoning'],
                  },
                  {
                    id: 'ctet-mathematics-4',
                    name: 'Mensuration',
                    hindiName: 'मापन एवं परिमाप (Mensuration, Weight & Time)',
                    subTopics: ['लंबाई, भार, आयतन, धारिता का मापन', 'समय, घड़ी, कैलेंडर एवं समय-अंतराल', 'परिमाप एवं क्षेत्रफल की बुनियादी समझ'],
                    keyConcepts: ['Standard units conversion', 'Time calculations', 'Perimeter of rectangle/square'],
                  },
                  {
                    id: 'ctet-mathematics-5',
                    name: 'Data Handling',
                    hindiName: 'आंकड़ों का प्रबंधन एवं पैटर्न (Data Handling)',
                    subTopics: ['आंकड़ों का संग्रह एवं प्रदर्शन', 'पैटर्न की पहचान और नियम बनाना', 'चित्रालेख एवं दंड आलेख (Bar Graph)'],
                    keyConcepts: ['Pictographs', 'Pattern recognition in sequences', 'Interpretation of charts'],
                  },
                  {
                    id: 'ctet-mathematics-6',
                    name: 'Mathematics Pedagogy',
                    hindiName: 'गणित शिक्षाशास्त्र (Pedagogical Issues)',
                    subTopics: ['गणित की प्रकृति एवं तार्किक चिंतन', 'पाठ्यक्रम में गणित का स्थान', 'गणित शिक्षण की विधियाँ (आगमन, निगमन, समस्या समाधान)', 'गणितीय त्रुटि विश्लेषण एवं मूल्यांकन'],
                    keyConcepts: ['Inductive vs Deductive', 'Concrete to Abstract (ELPS approach)', 'Math anxiety'],
                  },
                ],
              },
            ],
          },
          {
            id: 'ctet-p1-evs',
            canonicalSubjectId: 'ctet-environmental-studies',
            name: 'Environmental Studies',
            hindiName: 'पर्यावरण अध्ययन (EVS)',
            description: 'NCERT कक्षा 3 से 5 के 6 मुख्य विषय (थीम): परिवार और मित्र, भोजन, आश्रय, जल, यात्रा, हम जो बनाते हैं और करते हैं।',
            group: 'core',
            chapters: [
              {
                id: 'ctet-p1-evs-ch1',
                name: 'EVS Themes & Pedagogy',
                hindiName: 'EVS 6 मुख्य थीम एवं शिक्षाशास्त्र',
                topics: [
                  {
                    id: 'ctet-evs-1',
                    name: 'Family & Friends',
                    hindiName: 'परिवार और मित्र (Family & Friends)',
                    subTopics: ['संबंध, कार्य एवं खेल', 'पशु और उनके आवास (हाथी, बाघ, चींटी, स्लॉथ, सांप)', 'पेड़-पौधे (रेगिस्तानी ओक, घटपर्णी/नेपेंथिस, खेजड़ी)'],
                    keyConcepts: ['Animal behavior & adaptations', 'Plant adaptations', 'Biodiversity'],
                  },
                  {
                    id: 'ctet-evs-2',
                    name: 'Food',
                    hindiName: 'भोजन (Food & Nutrition)',
                    subTopics: ['विभिन्न राज्यों के पारंपरिक भोजन (हांगकांग-लिंग-हू-फेन, गोवा-मछली, केरल-टैपियोका)', 'पाचन तंत्र एवं पोषण', 'भोजन का संरक्षण (आम पापड़/मामिडी तांड्रा)'],
                    keyConcepts: ['Food habits across India', 'Food preservation methods', 'Deficiency diseases'],
                  },
                  {
                    id: 'ctet-evs-3',
                    name: 'Shelter',
                    hindiName: 'आवास (Shelter & Habitats)',
                    subTopics: ['विभिन्न क्षेत्रों के घर (लेह-लद्दाख के दो मंजिला घर, असम के बांस के घर, कश्मीर के डोंगे)', 'पक्षी एवं उनके घोंसले (कोयल, दर्जी चिड़िया, शकरखोरा)', 'स्वच्छता एवं सामुदायिक आवास'],
                    keyConcepts: ['Climate-responsive architecture', 'Avian nesting adaptations', 'Community living'],
                  },
                  {
                    id: 'ctet-evs-4',
                    name: 'Water',
                    hindiName: 'जल (Water & Conservation)',
                    subTopics: ['जल के स्रोत एवं बावड़ी (स्टेपवेल/घड़सीसर)', 'जल प्रदूषण एवं जल-जनित रोग (मलेरिया, हैजा, अनीमिया)', 'जल संरक्षण एवं वर्षा जल संचयन'],
                    keyConcepts: ['Rainwater harvesting', 'Vector-borne diseases', 'Historical stepwells'],
                  },
                  {
                    id: 'ctet-evs-5',
                    name: 'Travel',
                    hindiName: 'यात्रा (Travel & Mapping)',
                    subTopics: ['यातायात के साधन, टिकट एवं समय सारणी', 'मानचित्रण कौशल (दिशा, पैमाना, सापेक्ष स्थिति)', 'पहाड़ चढ़ने के अनुभव (बछेंद्री पाल, कर्णम मल्लेश्वरी)'],
                    keyConcepts: ['Map reading & relative direction', 'Railway tickets reading', 'Inspirational journeys'],
                  },
                  {
                    id: 'ctet-evs-6',
                    name: 'Things We Make & Do',
                    hindiName: 'हम चीजें कैसे बनाते हैं (Things We Make & Do)',
                    subTopics: ['पारंपरिक शिल्प एवं व्यवसाय (मधुबनी पेंटिंग, पश्मीना शॉल, पोचमपल्ली साड़ी)', 'मिट्टी के बर्तन, धातु एवं कपड़ा निर्माण'],
                    keyConcepts: ['Folk arts of India', 'Traditional craft heritage', 'Science of materials'],
                  },
                  {
                    id: 'ctet-evs-7',
                    name: 'EVS Pedagogy',
                    hindiName: 'EVS शिक्षाशास्त्र (EVS Pedagogy)',
                    subTopics: ['EVS का एकीकृत स्वरूप (विज्ञान, सामाजिक विज्ञान व पर्यावरण का समाकलन)', 'अन्वेषण, अवलोकन, प्रयोग एवं क्रियाकलाप', 'सतत व व्यापक मूल्यांकन एवं पोर्टफोलियो'],
                    keyConcepts: ['Integrated thematic approach', 'Hands-on learning', 'Formative evaluation in EVS'],
                  },
                ],
              },
            ],
          },
          {
            id: 'ctet-p1-lang1',
            canonicalSubjectId: 'ctet-language-1',
            name: 'Language-I',
            hindiName: 'भाषा-1 (हिंदी / मातृभाषा)',
            description: 'अपठित गद्य व पद्य, व्याकरण, शब्दावली, भाषा अर्जन एवं भाषा-शिक्षण के सिद्धांत।',
            group: 'language',
            chapters: [
              {
                id: 'ctet-p1-lang1-ch1',
                name: 'Language-I Skills & Pedagogy',
                hindiName: 'भाषा-1 समझ, व्याकरण एवं शिक्षाशास्त्र',
                topics: [
                  {
                    id: 'ctet-lang1-1',
                    name: 'Reading',
                    hindiName: 'अपठित गद्यांश एवं पद्यांश (Reading Comprehension)',
                    subTopics: ['साहित्यिक व वैज्ञानिक गद्यांश पर आधारित प्रश्न', 'पद्यांश की व्याख्या एवं भावार्थ', 'अनुमान एवं निष्कर्ष निकालने का कौशल'],
                    keyConcepts: ['Inference drawing', 'Contextual comprehension', 'Poetic appreciation'],
                  },
                  {
                    id: 'ctet-lang1-2',
                    name: 'Grammar',
                    hindiName: 'व्यावहारिक व्याकरण (Functional Grammar)',
                    subTopics: ['संज्ञा, सर्वनाम, विशेषण, क्रिया, अव्यय', 'संधि, समास, उपसर्ग, प्रत्यय', 'वाक्य भेद, लिंग, वचन, कारक'],
                    keyConcepts: ['Contextual grammar', 'Sentence structure', 'Word formation'],
                  },
                  {
                    id: 'ctet-lang1-3',
                    name: 'Vocabulary',
                    hindiName: 'शब्दावली (Vocabulary & Usage)',
                    subTopics: ['पर्यायवाची शब्द, विलोम शब्द, अनेकार्थी शब्द', 'मुहावरे और लोकोक्तियाँ', 'तत्सम, तद्भव, देशज व विदेशी शब्द'],
                    keyConcepts: ['Semantic range', 'Collocations', 'Idiomatic expressions'],
                  },
                  {
                    id: 'ctet-lang1-4',
                    name: 'Language Development',
                    hindiName: 'भाषा विकास (Language Acquisition & Chomsky LAD)',
                    subTopics: ['भाषा अर्जन बनाम भाषा अधिगम (Acquisition vs Learning)', 'नोआम चॉम्स्की का भाषा अर्जन यंत्र (LAD) सिद्धांत', 'भाषा और विचार (पियाजे बनाम वाइगोत्स्की)'],
                    keyConcepts: ['Universal Grammar', 'Private speech vs Egocentric speech', 'Critical period'],
                  },
                  {
                    id: 'ctet-lang1-5',
                    name: 'Language Pedagogy',
                    hindiName: 'भाषा शिक्षण शास्त्र (Pedagogy of Language Development)',
                    subTopics: ['चारों भाषाई कौशल (LSRW: सुनना, बोलना, पढ़ना, लिखना)', 'बहुभाषिकता संसाधन के रूप में (Multilingualism as a resource)', 'शिक्षण अधिगम सामग्री (TLM) एवं उपचारात्मक शिक्षण'],
                    keyConcepts: ['LSRW integration', 'Multilingual classroom strategies', 'Continuous language assessment'],
                  },
                ],
              },
            ],
          },
          {
            id: 'ctet-p1-lang2',
            canonicalSubjectId: 'ctet-language-2',
            name: 'Language-II',
            hindiName: 'भाषा-2 (English / Second Language)',
            description: 'Reading comprehension, functional grammar, second language acquisition and classroom pedagogy.',
            group: 'language',
            chapters: [
              {
                id: 'ctet-p1-lang2-ch1',
                name: 'Language-II Comprehension & Pedagogy',
                hindiName: 'भाषा-2 समझ एवं शिक्षण',
                topics: [
                  {
                    id: 'ctet-lang2-1',
                    name: 'Reading',
                    hindiName: 'Reading Comprehension (Two Unseen Prose Passages)',
                    subTopics: ['Discursive and literary unseen passages', 'Factual and inferential questions', 'Reading for gist (skimming) & detail (scanning)'],
                    keyConcepts: ['Skimming & Scanning', 'Contextual inference', 'Vocabulary in context'],
                  },
                  {
                    id: 'ctet-lang2-2',
                    name: 'Grammar',
                    hindiName: 'Functional Grammar for Second Language',
                    subTopics: ['Parts of Speech, Tenses and Concord', 'Prepositions, Conjunctions, Articles', 'Active-Passive Voice and Direct-Indirect Speech'],
                    keyConcepts: ['Subject-Verb agreement', 'Tense consistency', 'Syntactic correctness'],
                  },
                  {
                    id: 'ctet-lang2-3',
                    name: 'Vocabulary',
                    hindiName: 'Lexical Vocabulary & Word Power',
                    subTopics: ['Synonyms, Antonyms, Homophones, Homonyms', 'One-word substitution and idioms', 'Word formation and prefixes/suffixes'],
                    keyConcepts: ['Contextual vocabulary', 'Word families', 'Phrasal verbs'],
                  },
                  {
                    id: 'ctet-lang2-4',
                    name: 'Language Development',
                    hindiName: 'Second Language Acquisition Principles',
                    subTopics: ['Stephen Krashen’s Hypothesis (Comprehensible Input i+1)', 'Affective filter hypothesis', 'Interlanguage and error analysis'],
                    keyConcepts: ['Input hypothesis i+1', 'Natural order', 'Monitor model'],
                  },
                  {
                    id: 'ctet-lang2-5',
                    name: 'Language Pedagogy',
                    hindiName: 'Pedagogy of English Language Teaching (ELT)',
                    subTopics: ['Communicative Language Teaching (CLT)', 'Task-based learning and Direct Method', 'Remedial teaching and assessment of language proficiency'],
                    keyConcepts: ['CLT principles', 'Formative oral/written assessment', 'Error correction strategies'],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'paper-2',
        name: 'Paper-II (Class VI - VIII)',
        shortName: 'Paper-II',
        hindiName: 'पेपर-2 (उच्च प्राथमिक स्तर - कक्षा 6 से 8)',
        targetClass: 'Class 6 to 8',
        description: 'उच्च प्राथमिक स्तर के शिक्षकों के लिए: CDP, भाषा-1, भाषा-2 तथा विषय वर्ग (गणित व विज्ञान अथवा सामाजिक विज्ञान)।',
        subjectGroups: [
          {
            id: 'common',
            title: 'अनिवार्य खंड (Compulsory Subjects)',
            description: 'सभी अभ्यर्थियों के लिए समान',
            subjectIds: ['ctet-p2-cdp', 'ctet-p2-lang1', 'ctet-p2-lang2'],
          },
          {
            id: 'maths-science-group',
            title: 'विषय वर्ग 1: Mathematics & Science',
            description: 'विज्ञान एवं गणित पृष्ठभूमि के अभ्यर्थियों के लिए 60 प्रश्न',
            isElective: true,
            subjectIds: ['ctet-p2-maths-science'],
          },
          {
            id: 'social-science-group',
            title: 'विषय वर्ग 2: Social Science / Social Studies',
            description: 'कला एवं मानविकी पृष्ठभूमि के अभ्यर्थियों के लिए 60 प्रश्न',
            isElective: true,
            subjectIds: ['ctet-p2-social-science'],
          },
        ],
        subjects: [
          {
            id: 'ctet-p2-cdp',
            canonicalSubjectId: 'ctet-child-development',
            name: 'Child Development & Pedagogy',
            hindiName: 'बाल विकास एवं शिक्षाशास्त्र (उच्च प्राथमिक)',
            description: 'किशोरावस्था की दहलीज पर खड़े विद्यार्थियों (11-14 वर्ष) की विकासात्मक विशेषताएं, अमूर्त चिंतन और शिक्षाशास्त्र।',
            group: 'core',
            chapters: [
              {
                id: 'ctet-p2-cdp-ch1',
                name: 'Elementary Child Development',
                hindiName: 'उच्च प्राथमिक बाल विकास एवं शिक्षाशास्त्र',
                topics: [
                  {
                    id: 'ctet-p2-cdp-1',
                    name: 'Adolescent Development & Cognition',
                    hindiName: 'किशोरावस्था एवं संज्ञानात्मक विकास',
                    subTopics: ['किशोरावस्था की चुनौतियां एवं शारीरिक-मानसिक परिवर्तन', 'पियाजे की औपचारिक संक्रियात्मक अवस्था (Formal Operational)', 'अधिगम में सामाजिक अंतःक्रिया एवं वाइगोत्स्की का सिद्धांत'],
                    keyConcepts: ['Abstract reasoning', 'Identity formation', 'Metacognition'],
                  },
                  {
                    id: 'ctet-p2-cdp-2',
                    name: 'Inclusive Classroom & Assessment',
                    hindiName: 'समावेशी कक्षा एवं सतत व्यापक मूल्यांकन',
                    subTopics: ['वंचित, दिव्यांग एवं प्रतिभाशाली छात्रों के लिए अनुकूली शिक्षण', 'रचनात्मक व योगात्मक मूल्यांकन', 'NEP 2020 एवं NCF-SE के दिशानिर्देश'],
                    keyConcepts: ['UDL framework', 'Holistic 360-degree assessment', 'Equity in learning'],
                  },
                ],
              },
            ],
          },
          {
            id: 'ctet-p2-lang1',
            canonicalSubjectId: 'ctet-language-1',
            name: 'Language-I',
            hindiName: 'भाषा-1 (हिंदी / प्रथम भाषा)',
            description: 'उच्च प्राथमिक स्तर के अपठित गद्यांश-पद्यांश, व्याकरणिक विशलेषण एवं भाषा शिक्षण।',
            group: 'language',
            chapters: [
              {
                id: 'ctet-p2-lang1-ch1',
                name: 'Advanced Language-I Skills',
                hindiName: 'भाषा-1 उच्च स्तर समझ एवं शिक्षाशास्त्र',
                topics: [
                  {
                    id: 'ctet-p2-lang1-1',
                    name: 'Comprehension & Analysis',
                    hindiName: 'गहन पाठ समझ एवं निष्कर्ष',
                    subTopics: ['साहित्यिक व विचारात्मक गद्यांश', 'काव्य सौंदर्य एवं रस-छंद-अलंकार का प्राथमिक परिचय', 'शब्दावली एवं अर्थ-विस्तार'],
                    keyConcepts: ['Critical text reading', 'Inferential skills', 'Grammar in discourse'],
                  },
                ],
              },
            ],
          },
          {
            id: 'ctet-p2-lang2',
            canonicalSubjectId: 'ctet-language-2',
            name: 'Language-II',
            hindiName: 'Language-II (English / Second Language)',
            description: 'Advanced comprehension, discursive passages, pedagogical grammar and error analysis.',
            group: 'language',
            chapters: [
              {
                id: 'ctet-p2-lang2-ch1',
                name: 'Language-II Secondary Skills',
                hindiName: 'Language-II Advanced Reading & Pedagogy',
                topics: [
                  {
                    id: 'ctet-p2-lang2-1',
                    name: 'Reading & Pedagogy',
                    hindiName: 'Discursive Reading & ELT Methods',
                    subTopics: ['Scientific, narrative and journalistic passages', 'Vocabulary, phrases, sentence structure', 'Teaching English in multilingual context'],
                    keyConcepts: ['Critical literacy', 'Language acquisition principles', 'Communicative competence'],
                  },
                ],
              },
            ],
          },
          {
            id: 'ctet-p2-maths-science',
            canonicalSubjectId: 'ctet-science',
            name: 'Mathematics & Science',
            hindiName: 'गणित एवं विज्ञान वर्ग (Subject Group)',
            description: 'कक्षा 6 से 8 के लिए 60 अंकों का संयुक्त खंड: 30 अंक गणित + 30 अंक विज्ञान (विषयवस्तु एवं शिक्षाशास्त्र)।',
            group: 'mathematics-science',
            groupLabel: 'Mathematics & Science',
            chapters: [
              {
                id: 'ctet-p2-ms-ch1',
                name: 'Mathematics',
                hindiName: 'गणित (सामग्री व शिक्षाशास्त्र)',
                topics: [
                  {
                    id: 'ctet-p2-maths-content',
                    name: 'Mathematics',
                    hindiName: 'गणित (Number System, Algebra, Geometry, Mensuration)',
                    subTopics: ['संख्या पद्धति, परिमेय संख्याएं, घातांक व करणी', 'बीजगणित (Algebraic Expressions & Identities)', 'ज्यामिति एवं क्षेत्रमिति (Area, Perimeter, Volume)', 'सांख्यिकी एवं प्रायिकता'],
                    keyConcepts: ['Algebraic formulations', 'Geometric proofs & properties', 'Surface area & volume'],
                  },
                  {
                    id: 'ctet-p2-maths-pedagogy',
                    name: 'Mathematics Pedagogy',
                    hindiName: 'गणित शिक्षाशास्त्र (Nature of Mathematics & Methods)',
                    subTopics: ['गणित की तार्किक प्रकृति', 'आगमन-निगमन व समस्या समाधान विधियां', 'गणित प्रयोगशाला एवं ICT का उपयोग', 'मूल्यांकन व त्रुटि विश्लेषण'],
                    keyConcepts: ['Abstraction in mathematics', 'Error analysis as diagnostic tool', 'Formative evaluation in maths'],
                  },
                ],
              },
              {
                id: 'ctet-p2-ms-ch2',
                name: 'Science',
                hindiName: 'विज्ञान (सामग्री व शिक्षाशास्त्र)',
                topics: [
                  {
                    id: 'ctet-p2-science-content',
                    name: 'Science',
                    hindiName: 'विज्ञान (Food, Materials, Living World, Forces & Motion)',
                    subTopics: ['भोजन के घटक, पोषण, प्रकाश संश्लेषण', 'पदार्थ की प्रकृति, परिवर्तन, अम्ल-क्षार-लवण, धातु-अधातु', 'सजीव जगत (कोशिका, श्वसन, परिवहन, प्रजनन)', 'बल, गति, घर्षण, प्रकाश, ध्वनि, विद्युत धारा'],
                    keyConcepts: ['Photosynthesis & respiration', 'Chemical reactions & equations', 'Newton laws of motion', 'Circuits & magnets'],
                  },
                  {
                    id: 'ctet-p2-science-pedagogy',
                    name: 'Science Pedagogy',
                    hindiName: 'विज्ञान शिक्षाशास्त्र (Nature of Science & Inquiry)',
                    subTopics: ['विज्ञान की प्रकृति एवं वैज्ञानिक दृष्टिकोण (Scientific Temper)', 'अन्वेषण विधि, प्रयोग एवं परियोजनाएं', 'विज्ञान शिक्षण में उपचारात्मक रणनीति एवं मूल्यांकन'],
                    keyConcepts: ['Hands-on experiments', 'Inquiry-based approach (5E model)', 'Diagnostic science assessment'],
                  },
                ],
              },
            ],
          },
          {
            id: 'ctet-p2-social-science',
            canonicalSubjectId: 'ctet-social-studies',
            name: 'Social Science',
            hindiName: 'सामाजिक विज्ञान / सामाजिक अध्ययन वर्ग (Subject Group)',
            description: 'कक्षा 6 से 8 के लिए 60 अंकों का खंड: इतिहास, भूगोल, सामाजिक व राजनीतिक जीवन तथा सामाजिक विज्ञान शिक्षाशास्त्र।',
            group: 'social-science',
            groupLabel: 'Social Science',
            chapters: [
              {
                id: 'ctet-p2-ss-ch1',
                name: 'History',
                hindiName: 'इतिहास (History - Our Pasts I, II, III)',
                topics: [
                  {
                    id: 'ctet-p2-history',
                    name: 'History',
                    hindiName: 'प्राचीन, मध्यकालीन एवं आधुनिक भारतीय इतिहास',
                    subTopics: ['कब, कहाँ और कैसे? आखेटक-खाद्य संग्राहक से आरंभिक नगर', 'वैदिक काल, नए विचार (बौद्ध व जैन धर्म), पहला साम्राज्य (मौर्य)', 'दिल्ली के सुल्तान, मुग़ल साम्राज्य, क्षेत्रीय संस्कृतियाँ', 'कंपनी की सत्ता की स्थापना, 1857 का विद्रोह, राष्ट्रीय आंदोलन'],
                    keyConcepts: ['Archaeological & textual sources', 'Dynastic transitions', 'Colonialism and freedom struggle'],
                  },
                ],
              },
              {
                id: 'ctet-p2-ss-ch2',
                name: 'Geography',
                hindiName: 'भूगोल (Geography - The Earth Our Habitat & Environment)',
                topics: [
                  {
                    id: 'ctet-p2-geography',
                    name: 'Geography',
                    hindiName: 'भूगोल (सौरमंडल, पृथ्वी, पर्यावरण, संसाधन एवं कृषि)',
                    subTopics: ['सौरमंडल में पृथ्वी, ग्लोब: अक्षांश और देशांतर', 'पृथ्वी की गतियाँ, मानचित्र, पर्यावरण के घटक', 'वायु, जल, प्राकृतिक वनस्पति व वन्य जीवन', 'मानव संसाधन, खनिज व ऊर्जा संसाधन, कृषि एवं उद्योग'],
                    keyConcepts: ['Latitude/Longitude calculation', 'Atmospheric layers', 'Resource sustainability'],
                  },
                ],
              },
              {
                id: 'ctet-p2-ss-ch3',
                name: 'Social & Political Life',
                hindiName: 'सामाजिक एवं राजनीतिक जीवन (Civics)',
                topics: [
                  {
                    id: 'ctet-p2-spl',
                    name: 'Social & Political Life',
                    hindiName: 'विविधता, सरकार, लोकतंत्र, संविधान एवं न्यायपालिका',
                    subTopics: ['विविधता एवं भेदभाव, सरकार के प्रकार एवं स्थानीय स्वशासन', 'लोकतांत्रिक सरकार के मुख्य तत्व, राज्य सरकार का कामकाज', 'संविधान की मुख्य विशेषताएं, धर्मनिरपेक्षता की समझ', 'संसद, न्यायपालिका, हाशियाकरण एवं सामाजिक न्याय'],
                    keyConcepts: ['Preamble & Fundamental Rights', 'Separation of Powers', 'Judicial review & public interest litigation'],
                  },
                ],
              },
              {
                id: 'ctet-p2-ss-ch4',
                name: 'Social Science Pedagogy',
                hindiName: 'सामाजिक विज्ञान शिक्षाशास्त्र',
                topics: [
                  {
                    id: 'ctet-p2-ss-pedagogy',
                    name: 'Social Science Pedagogy',
                    hindiName: 'सामाजिक विज्ञान की प्रकृति, आलोचनात्मक चिंतन व स्रोत',
                    subTopics: ['सामाजिक विज्ञान की अवधारणा एवं प्रकृति', 'कक्षा-कक्ष की प्रक्रियाएं एवं परिचर्चा (Discourse)', 'आलोचनात्मक चिंतन का विकास', 'प्राथमिक एवं द्वितीयक स्रोत, परियोजना कार्य एवं मूल्यांकन'],
                    keyConcepts: ['Critical thinking in humanities', 'Primary vs secondary sources', 'Evidence-based historical inquiry'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 2. UPTET (Uttar Pradesh Teacher Eligibility Test)
  // ===========================================================================
  uptet: {
    id: 'uptet',
    name: 'UPTET',
    hindiName: 'उत्तर प्रदेश शिक्षक पात्रता परीक्षा',
    tagline: 'Paper-I (प्राथमिक स्तर) एवं Paper-II (उच्च प्राथमिक स्तर) सम्पूर्ण पाठ्यक्रम',
    description: 'उत्तर प्रदेश बेसिक शिक्षा बोर्ड द्वारा आयोजित शिक्षक पात्रता परीक्षा का मानक पाठ्यक्रम, विषय-वार नोट्स एवं अध्यायवार अभ्यास।',
    papers: [
      {
        id: 'paper-1',
        name: 'Paper-I (Primary Level - Class 1 to 5)',
        shortName: 'Paper-I Primary',
        hindiName: 'पेपर-1 (प्राथमिक स्तर: कक्षा 1 से 5)',
        targetClass: 'Class 1 to 5',
        description: 'UPTET प्राथमिक शिक्षक पात्रता के 5 अनिवार्य विषय (150 अंक, 150 प्रश्न)।',
        subjects: [
          {
            id: 'uptet-p1-cdp',
            canonicalSubjectId: 'uptet-child-development',
            name: 'Child Development & Pedagogy',
            hindiName: 'बाल विकास एवं शिक्षण विधियां',
            description: 'बाल विकास का अर्थ, आवश्यकता तथा क्षेत्र, सीखने का अर्थ व सिद्धांत, शिक्षण एवं शिक्षण विधाएं, समावेशी शिक्षा।',
            group: 'core',
            chapters: [
              {
                id: 'uptet-p1-cdp-ch1',
                name: 'Child Development & Theories',
                hindiName: 'बाल विकास एवं अधिगम सिद्धांत',
                topics: [
                  {
                    id: 'uptet-child-development-1',
                    name: 'बाल विकास',
                    hindiName: 'बाल विकास (अवस्थाएं, शारीरिक, मानसिक व संवेगात्मक विकास)',
                    subTopics: ['शैशवावस्था, बाल्यावस्था, किशोरावस्था', 'विकास को प्रभावित करने वाले कारक (वंशानुक्रम व वातावरण)', 'भाषा विकास एवं सामाजिक विकास'],
                    keyConcepts: ['Milestones of growth', 'Emotional maturation', 'Heredity vs Environment'],
                  },
                  {
                    id: 'uptet-child-development-2',
                    name: 'अधिगम सिद्धांत',
                    hindiName: 'सीखने के सिद्धांत (थार्नडाइक, पावलव, स्किनर, कोहलर)',
                    subTopics: ['थार्नडाइक का प्रयास एवं त्रुटि का सिद्धांत', 'पावलव का अनुकूलित अनुक्रिया सिद्धांत', 'स्किनर का क्रिया प्रसूत अनुबंधन', 'कोहलर का सूझ या अंतर्दृष्टि सिद्धांत'],
                    keyConcepts: ['Trial & Error, Classical Conditioning, Operant Conditioning, Insight Learning'],
                  },
                  {
                    id: 'uptet-child-development-3',
                    name: 'समावेशी शिक्षा',
                    hindiName: 'समावेशी शिक्षा, निर्देशन एवं परामर्श',
                    subTopics: ['समावेशी शिक्षा: शैक्षिक समावेशन से अभिप्राय', 'समावेशन के लिए आवश्यक उपकरण व सामग्री', 'निर्देशन एवं परामर्श का अर्थ, उद्देश्य एवं विधियां'],
                    keyConcepts: ['CWSN accommodation', 'Counseling techniques in schools', 'Guidance principles'],
                  },
                ],
              },
            ],
          },
          {
            id: 'uptet-p1-hindi',
            canonicalSubjectId: 'uptet-hindi',
            name: 'Language-I',
            hindiName: 'भाषा-1 (हिंदी)',
            description: 'अपठित अनुच्छेद, हिंदी वर्णमाला, स्वर-व्यंजन, विराम चिह्न, संज्ञा-सर्वनाम, क्रिया, विशेषण, मुहावरे, लोकोक्तियां।',
            group: 'core',
            chapters: [
              {
                id: 'uptet-p1-hindi-ch1',
                name: 'Hindi Content',
                hindiName: 'हिंदी भाषा एवं व्याकरण',
                topics: [
                  {
                    id: 'uptet-hindi-1',
                    name: 'व्याकरण',
                    hindiName: 'हिंदी वर्णमाला, वर्तनी एवं शब्द रचना',
                    subTopics: ['वर्णमाला (स्वर, व्यंजन, अयोगवाह)', 'संज्ञा, सर्वनाम, क्रिया, विशेषण, अव्यय', 'संधि, समास, उपसर्ग, प्रत्यय, विराम चिह्न'],
                    keyConcepts: ['Phonetics of Hindi', 'Grammar rules', 'Sandhi & Samas types'],
                  },
                  {
                    id: 'uptet-hindi-2',
                    name: 'गद्य और पद्य',
                    hindiName: 'अपठित गद्यांश, पद्यांश एवं रचनाकार',
                    subTopics: ['अपठित गद्यांश/पद्यांश पर आधारित प्रश्न', 'हिंदी के प्रमुख कवि, लेखक एवं उनकी रचनाएं', 'मुहावरे, लोकोक्तियाँ एवं पर्यायवाची/विलोम'],
                    keyConcepts: ['Reading comprehension', 'Famous Hindi literary works', 'Idiomatic usage'],
                  },
                  {
                    id: 'uptet-hindi-3',
                    name: 'भाषा शिक्षण',
                    hindiName: 'भाषा शिक्षण की विधियां एवं कौशल',
                    subTopics: ['भाषा सीखने और ग्रहणशीलता के सिद्धांत', 'सुनना, बोलना, पढ़ना, लिखना (भाषाई कौशल)', 'कक्षा में बहुभाषी शिक्षण एवं मूल्यांकन'],
                    keyConcepts: ['Language pedagogy', 'Remedial teaching in Hindi', 'LSRW evaluation'],
                  },
                ],
              },
            ],
          },
          {
            id: 'uptet-p1-english',
            canonicalSubjectId: 'uptet-english',
            name: 'Language-II',
            hindiName: 'भाषा-2 (Language-II: English / Sanskrit)',
            description: 'Unseen Passage, Parts of Speech, Tenses, Articles, Punctuation, Word Formation and Pedagogy.',
            group: 'core',
            chapters: [
              {
                id: 'uptet-p1-eng-ch1',
                name: 'English Language',
                hindiName: 'English Comprehension & Grammar',
                topics: [
                  {
                    id: 'uptet-english-1',
                    name: 'Grammar Basics',
                    hindiName: 'Parts of Speech & Sentence Structure',
                    subTopics: ['Nouns, Pronouns, Verbs, Adverbs, Adjectives, Prepositions, Conjunctions', 'Tenses and Subject-Verb Agreement', 'Active and Passive Voice, Direct/Indirect Speech'],
                    keyConcepts: ['Functional grammar', 'Sentence transformation', 'Error spotting'],
                  },
                  {
                    id: 'uptet-english-2',
                    name: 'Comprehension',
                    hindiName: 'Unseen Passage & Vocabulary',
                    subTopics: ['Reading unseen prose comprehension', 'Synonyms, Antonyms, Spellings, Idioms', 'One-word substitution'],
                    keyConcepts: ['Contextual reading', 'Vocabulary enrichment', 'Spelling accuracy'],
                  },
                  {
                    id: 'uptet-english-3',
                    name: 'Language Pedagogy',
                    hindiName: 'Pedagogy of English Teaching',
                    subTopics: ['Principles of teaching English', 'Methods & Approaches (Grammar-Translation, Direct, Bilingual, CLT)', 'Evaluation and Remedial Teaching'],
                    keyConcepts: ['Teaching methods in India', 'Remedial interventions', 'Oral and written testing'],
                  },
                ],
              },
            ],
          },
          {
            id: 'uptet-p1-maths',
            canonicalSubjectId: 'uptet-mathematics',
            name: 'Mathematics',
            hindiName: 'गणित (अंकगणित, ज्यामिति एवं शिक्षण)',
            description: 'संख्याएं, जोड़-घटाव-गुणा-भाग, ल.स.प.-म.स.प., भिन्न, दशमलव, ऐकिक नियम, प्रतिशत, लाभ-हानि, साधारण ब्याज, ज्यामिति, धन, मापन, समय, परिमाप, गणित-शिक्षण।',
            group: 'core',
            chapters: [
              {
                id: 'uptet-p1-maths-ch1',
                name: 'Mathematics Content & Pedagogy',
                hindiName: 'गणित सामग्री एवं शिक्षण',
                topics: [
                  {
                    id: 'uptet-mathematics-1',
                    name: 'अंकगणित',
                    hindiName: 'संख्याएं, संक्रियाएं, ल.स.प.-म.स.प. एवं भिन्न',
                    subTopics: ['संख्याएं एवं जोड़-घटाव-गुणा-भाग', 'लघुत्तम समापवर्त्य एवं महत्तम समापवर्तक', 'भिन्न, दशमलव एवं ऐकिक नियम'],
                    keyConcepts: ['Number operations', 'LCM/HCF word problems', 'Fractions & Decimals'],
                  },
                  {
                    id: 'uptet-mathematics-2',
                    name: 'बीजगणित और ज्यामिति',
                    hindiName: 'प्रतिशत, लाभ-हानि, साधारण ब्याज, ज्यामिति व मापन',
                    subTopics: ['प्रतिशत, लाभ व हानि, साधारण ब्याज', 'ज्यामिति (बिंदु, रेखा, कोण, त्रिभुज, वृत्त)', 'धन, मापन (समय, तौल, धारिता, लंबाई), परिमाप एवं क्षेत्रफल'],
                    keyConcepts: ['Percentage and Simple Interest formulas', 'Geometric shapes and properties', 'Units of measurement'],
                  },
                  {
                    id: 'uptet-mathematics-3',
                    name: 'गणित शिक्षण',
                    hindiName: 'गणित शिक्षण की प्रकृति, विधियाँ व मूल्यांकन',
                    subTopics: ['गणितीय चिंतन की प्रकृति एवं पाठ्यक्रम में स्थान', 'शिक्षण विधियां (आगमन, निगमन, विश्लेषण, संश्लेषण)', 'त्रुटि विश्लेषण तथा निदानात्मक एवं उपचारात्मक शिक्षण'],
                    keyConcepts: ['Inductive-Deductive methods', 'Error diagnostics', 'Evaluation in primary math'],
                  },
                ],
              },
            ],
          },
          {
            id: 'uptet-p1-evs',
            canonicalSubjectId: 'uptet-evs',
            name: 'Environmental Studies',
            hindiName: 'पर्यावरण अध्ययन (EVS, भूगोल, संविधान एवं पर्यावरण शिक्षण)',
            description: 'परिवार, भोजन, स्वास्थ्य व स्वच्छता, आवास, पेड़-पौधे, हमारा परिवेश, मेला, स्थानीय व्यवसाय, जल, यातायात, भारत का भूगोल, संविधान, पर्यावरण शिक्षण।',
            group: 'core',
            chapters: [
              {
                id: 'uptet-p1-evs-ch1',
                name: 'EVS Content & Pedagogy',
                hindiName: 'पर्यावरण अध्ययन एवं शिक्षण',
                topics: [
                  {
                    id: 'uptet-evs-1',
                    name: 'परिवार और भोजन',
                    hindiName: 'परिवार, भोजन, स्वास्थ्य एवं स्वच्छता, आवास',
                    subTopics: ['परिवार (एकल व संयुक्त परिवार)', 'भोजन, पोषण एवं प्रमुख पोषक तत्व, स्वच्छता', 'आवास के प्रकार, घरेलू जीव-जंतु एवं स्वच्छता'],
                    keyConcepts: ['Family structures', 'Nutritional balance and health', 'Shelter & hygienic living'],
                  },
                  {
                    id: 'uptet-evs-2',
                    name: 'जल और आवास',
                    hindiName: 'पेड़-पौधे, जीव-जंतु, जल, यातायात, भारत का भूगोल व संविधान',
                    subTopics: ['पेड़-पौधे एवं जीव-जंतुओं की उपयोगिता', 'जल के स्रोत एवं संरक्षण, यातायात व संचार', 'भारत की नदियां, पर्वत, पठार, वन, यातायात', 'हमारा संविधान, शासन व्यवस्था, स्थानीय स्वशासन'],
                    keyConcepts: ['Ecosystem balance', 'Indian physical geography', 'Basic constitutional structure'],
                  },
                  {
                    id: 'uptet-evs-3',
                    name: 'EVS शिक्षण',
                    hindiName: 'पर्यावरण शिक्षण की अवधारणा, उपागम व मूल्यांकन',
                    subTopics: ['पर्यावरण अध्ययन की अवधारणा एवं आवश्यकता', 'पर्यावरण शिक्षा के उद्देश्य एवं एकीकृत उपागम', 'क्रियाकलाप, प्रयोगात्मक कार्य एवं सतत मूल्यांकन'],
                    keyConcepts: ['Environmental pedagogy', 'Hands-on observation', 'Formative evaluation in EVS'],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'paper-2',
        name: 'Paper-II (Upper Primary - Class 6 to 8)',
        shortName: 'Paper-II Upper Primary',
        hindiName: 'पेपर-2 (उच्च प्राथमिक स्तर: कक्षा 6 से 8)',
        targetClass: 'Class 6 to 8',
        description: 'UPTET उच्च प्राथमिक शिक्षक पात्रता: बाल विकास, भाषा-1, भाषा-2 तथा विषय वर्ग (गणित व विज्ञान अथवा सामाजिक अध्ययन)।',
        subjectGroups: [
          {
            id: 'common',
            title: 'अनिवार्य खंड',
            description: 'सभी परीक्षार्थियों के लिए अनिवार्य (90 अंक)',
            subjectIds: ['uptet-p2-cdp', 'uptet-p2-lang1', 'uptet-p2-lang2'],
          },
          {
            id: 'maths-science-group',
            title: 'विषय वर्ग: Mathematics & Science',
            description: 'गणित एवं विज्ञान शिक्षक पद हेतु (60 अंक)',
            isElective: true,
            subjectIds: ['uptet-p2-maths-science'],
          },
          {
            id: 'social-science-group',
            title: 'विषय वर्ग: Social Studies / Social Science',
            description: 'सामाजिक अध्ययन शिक्षक पद हेतु (60 अंक)',
            isElective: true,
            subjectIds: ['uptet-p2-social-studies'],
          },
        ],
        subjects: [
          {
            id: 'uptet-p2-cdp',
            canonicalSubjectId: 'uptet-child-development',
            name: 'Child Development & Pedagogy',
            hindiName: 'बाल विकास एवं शिक्षण विधियां (उच्च प्राथमिक)',
            description: 'किशोरावस्था का बाल विकास, सीखने की प्रक्रिया, शिक्षण विधियां, क्रियात्मक शोध एवं शैक्षिक मूल्यांकन।',
            group: 'core',
            chapters: [
              {
                id: 'uptet-p2-cdp-ch1',
                name: 'Adolescent Pedagogy',
                hindiName: 'उच्च प्राथमिक बाल विकास एवं शिक्षाशास्त्र',
                topics: [
                  {
                    id: 'uptet-p2-cdp-1',
                    name: 'बाल विकास एवं सीखने की प्रक्रिया',
                    hindiName: 'बाल विकास एवं सीखने की प्रक्रिया (किशोरावस्था)',
                    subTopics: ['किशोरावस्था की विकासात्मक विशेषताएं व आवश्यकताएं', 'अधिगम के उच्च सिद्धांत एवं संज्ञान', 'क्रियात्मक शोध (Action Research) एवं मूल्यांकन'],
                    keyConcepts: ['Adolescent psychology', 'Action research steps', 'Cognitive development'],
                  },
                ],
              },
            ],
          },
          {
            id: 'uptet-p2-lang1',
            canonicalSubjectId: 'uptet-hindi',
            name: 'Language-I',
            hindiName: 'भाषा-1 (हिंदी उच्च प्राथमिक)',
            description: 'अपठित गद्यांश-पद्यांश, वर्ण विचार, शब्द भेद, अलंकार, रस, छंद, साहित्यकार एवं कृतियां।',
            group: 'core',
            chapters: [
              {
                id: 'uptet-p2-hindi-ch1',
                name: 'Advanced Hindi',
                hindiName: 'हिंदी उच्च प्राथमिक',
                topics: [
                  {
                    id: 'uptet-p2-hindi-1',
                    name: 'हिंदी व्याकरण एवं साहित्य',
                    hindiName: 'व्याकरण, काव्यशास्त्र एवं साहित्य',
                    subTopics: ['संज्ञा, सर्वनाम, क्रिया, विशेषण, संधि, समास', 'रस, छंद, अलंकार का परिचय', 'प्रमुख रचनाकार एवं उनकी रचनाएं, अपठित बोध'],
                    keyConcepts: ['Advanced Hindi grammar', 'Poetic devices', 'Literary history'],
                  },
                ],
              },
            ],
          },
          {
            id: 'uptet-p2-lang2',
            canonicalSubjectId: 'uptet-english',
            name: 'Language-II',
            hindiName: 'Language-II (English / Sanskrit)',
            description: 'Unseen Comprehension, Advanced Grammar, Direct/Indirect, Voice, Transformation and Pedagogy.',
            group: 'core',
            chapters: [
              {
                id: 'uptet-p2-eng-ch1',
                name: 'Advanced English',
                hindiName: 'Advanced English Language',
                topics: [
                  {
                    id: 'uptet-p2-eng-1',
                    name: 'Grammar, Comprehension & Pedagogy',
                    hindiName: 'Comprehension, Grammar & Pedagogy',
                    subTopics: ['Unseen passages of literary and analytical nature', 'Complex sentence structure, prepositions, phrasal verbs', 'Language teaching approaches and diagnostic evaluation'],
                    keyConcepts: ['Syntactic transformation', 'Lexical precision', 'Assessment of English skills'],
                  },
                ],
              },
            ],
          },
          {
            id: 'uptet-p2-maths-science',
            canonicalSubjectId: 'uptet-mathematics',
            name: 'Mathematics & Science',
            hindiName: 'गणित एवं विज्ञान वर्ग (Subject Group)',
            description: 'उच्च प्राथमिक स्तर के लिए 60 अंकों का खंड: 30 अंक गणित + 30 अंक विज्ञान (विषयवस्तु एवं शिक्षाशास्त्र)।',
            group: 'mathematics-science',
            groupLabel: 'Mathematics & Science',
            chapters: [
              {
                id: 'uptet-p2-ms-ch1',
                name: 'Mathematics',
                hindiName: 'गणित (Mathematics)',
                topics: [
                  {
                    id: 'uptet-p2-maths',
                    name: 'Mathematics',
                    hindiName: 'प्राकृतिक संख्याएं, बीजगणित, वाणिज्य गणित, ज्यामिति व सांख्यिकी',
                    subTopics: ['प्राकृतिक, पूर्ण व परिमेय संख्याएं, वर्गमूल, घनमूल', 'सर्वसमिकाएं, गुणनखंड, युगपत समीकरण', 'वाणिज्य गणित: प्रतिशत, लाभ-हानि, साधारण व चक्रवृद्धि ब्याज', 'ज्यामिति, त्रिभुज की सर्वांगसमता, वृत्त, क्षेत्रमिति व सांख्यिकी'],
                    keyConcepts: ['Algebraic factoring', 'Compound Interest', 'Congruence & Similarity', 'Mensuration 2D/3D'],
                  },
                  {
                    id: 'uptet-p2-maths-pedagogy',
                    name: 'Mathematics Pedagogy',
                    hindiName: 'गणित शिक्षण विधियाँ व मूल्यांकन',
                    subTopics: ['तार्किक चिंतन का विकास', 'शिक्षण विधियां एवं सहायक सामग्री', 'निदानात्मक एवं उपचारात्मक शिक्षण'],
                    keyConcepts: ['Mathematical logic', 'Diagnostic assessment', 'Remedial math'],
                  },
                ],
              },
              {
                id: 'uptet-p2-ms-ch2',
                name: 'Science',
                hindiName: 'विज्ञान (Science)',
                topics: [
                  {
                    id: 'uptet-p2-science',
                    name: 'Science',
                    hindiName: 'दैनिक जीवन में विज्ञान, सजीव जगत, पदार्थ, ऊर्जा, प्रकाश व विद्युत',
                    subTopics: ['दैनिक जीवन में विज्ञान, रेशे व वस्त्र', 'सजीव व निर्जीव, सूक्ष्मजीव, कोशिका, अंग तंत्र, किशोरावस्था', 'पदार्थ एवं उसकी अवस्थाएं, तत्व, यौगिक, मिश्रण', 'ऊर्जा, प्रकाश, ध्वनि, चुंबकत्व, विद्युत धारा'],
                    keyConcepts: ['Microorganisms in daily life', 'States of matter', 'Energy transformation', 'Optics and electricity'],
                  },
                  {
                    id: 'uptet-p2-science-pedagogy',
                    name: 'Science Pedagogy',
                    hindiName: 'विज्ञान शिक्षण की प्रकृति एवं विधियाँ',
                    subTopics: ['वैज्ञानिक दृष्टिकोण का विकास', 'प्रयोगशाला कार्य एवं सुरक्षा नियम', 'विज्ञान शिक्षण में नवाचार एवं सतत मूल्यांकन'],
                    keyConcepts: ['Inquiry method', 'Lab safety & experimentation', 'Science assessment'],
                  },
                ],
              },
            ],
          },
          {
            id: 'uptet-p2-social-studies',
            canonicalSubjectId: 'uptet-evs',
            name: 'Social Studies / Social Science',
            hindiName: 'सामाजिक अध्ययन / सामाजिक विज्ञान वर्ग (Subject Group)',
            description: 'इतिहास, नागरिक शास्त्र, भूगोल, पर्यावरण, गृह शिल्प, कृषि एवं सामाजिक अध्ययन शिक्षण विधियां (60 अंक)।',
            group: 'social-science',
            groupLabel: 'Social Studies / Social Science',
            chapters: [
              {
                id: 'uptet-p2-ss-ch1',
                name: 'History',
                hindiName: 'इतिहास (History)',
                topics: [
                  {
                    id: 'uptet-p2-hist',
                    name: 'History',
                    hindiName: 'प्राचीन, मध्यकालीन एवं आधुनिक भारत का इतिहास',
                    subTopics: ['इतिहास जानने के स्रोत, पाषाण काल, सिंधु घाटी सभ्यता, वैदिक काल', 'महाजनपद, मौर्य साम्राज्य, गुप्त काल, राजपूत काल', 'सल्तनत काल, मुग़ल साम्राज्य, यूरोपीय कंपनियों का आगमन', '1857 का प्रथम स्वतंत्रता संग्राम, राष्ट्रीय आंदोलन एवं स्वाधीनता'],
                    keyConcepts: ['Sources of Indian history', 'Medieval polity & culture', 'Freedom struggle movements'],
                  },
                ],
              },
              {
                id: 'uptet-p2-ss-ch2',
                name: 'Geography',
                hindiName: 'भूगोल (Geography)',
                topics: [
                  {
                    id: 'uptet-p2-geo',
                    name: 'Geography',
                    hindiName: 'सौरमंडल, पृथ्वी, वायुमंडल, भारत व उत्तर प्रदेश का भूगोल',
                    subTopics: ['सौरमंडल में पृथ्वी, अक्षांश व देशांतर, पृथ्वी की गतियां', 'स्थलमंडल, वायुमंडल, जलमंडल की संरचना', 'भारत का भूगोल: नदियां, पर्वत, जलवायु, वन, खनिज, कृषि', 'उत्तर प्रदेश: भौगोलिक स्थिति, प्रमुख नदियां, उद्योग एवं पर्यटन'],
                    keyConcepts: ['Atmospheric circulation', 'Physical divisions of India', 'UP regional geography'],
                  },
                ],
              },
              {
                id: 'uptet-p2-ss-ch3',
                name: 'Civics',
                hindiName: 'नागरिक शास्त्र (Civics)',
                topics: [
                  {
                    id: 'uptet-p2-civics',
                    name: 'Civics',
                    hindiName: 'हमारा संविधान, शासन व्यवस्था, न्यायपालिका व नागरिक अधिकार',
                    subTopics: ['संविधान की प्रस्तावना, मौलिक अधिकार एवं कर्तव्य, नीति निदेशक तत्व', 'केंद्रीय एवं राज्य शासन व्यवस्था (संसद, राष्ट्रपति, प्रधानमंत्री, राज्यपाल, मुख्यमंत्री)', 'पंचायती राज एवं नगरीय स्थानीय स्वशासन', 'न्यायपालिका (सर्वोच्च न्यायालय, उच्च न्यायालय) एवं उपभोक्ता संरक्षण'],
                    keyConcepts: ['Constitutional framework', 'Panchayati Raj system', 'Judicial hierarchy & rights protection'],
                  },
                ],
              },
              {
                id: 'uptet-p2-ss-ch4',
                name: 'Social Science Pedagogy',
                hindiName: 'सामाजिक अध्ययन शिक्षण विधियाँ',
                topics: [
                  {
                    id: 'uptet-p2-ss-ped',
                    name: 'Social Science Pedagogy',
                    hindiName: 'सामाजिक अध्ययन की अवधारणा, पद्धतियाँ एवं मूल्यांकन',
                    subTopics: ['सामाजिक अध्ययन की अवधारणा एवं उद्देश्य', 'शिक्षण विधियां (परियोजना, समस्या समाधान, स्रोत पद्धति)', 'कक्षा-कक्ष परिचर्चा, भ्रमण एवं सतत-व्यापक मूल्यांकन'],
                    keyConcepts: ['Project method', 'Field trips in social science', 'Formative evaluation in humanities'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  // ===========================================================================
  // 3. SUPER TET (UP Assistant Teacher Recruitment Exam)
  // ===========================================================================
  'super-tet': {
    id: 'super-tet',
    name: 'Super TET',
    hindiName: 'सुपर टीईटी (उत्तर प्रदेश सहायक अध्यापक भर्ती परीक्षा)',
    tagline: 'Primary (प्राथमिक) एवं Upper Primary (उच्च प्राथमिक) 150 अंकों का संपूर्ण पाठ्यक्रम',
    description: 'उत्तर प्रदेश शिक्षक भर्ती परीक्षा (Super TET) के लिए 100% उद्देश्यनिष्ठ एमसीक्यू, शिक्षण कौशल, बाल मनोविज्ञान, भाषा, गणित, विज्ञान, सामान्य ज्ञान व करंट अफेयर्स।',
    papers: [
      {
        id: 'primary',
        name: 'Primary (प्राथमिक सहायक अध्यापक - Class 1 to 5)',
        shortName: 'Primary (कक्षा 1-5)',
        hindiName: 'प्राथमिक स्तर (कक्षा 1 से 5 - 150 अंक)',
        targetClass: 'Class 1 to 5',
        description: 'सुपर टीईटी प्राथमिक सहायक अध्यापक परीक्षा: 150 बहुविकल्पीय प्रश्न, 150 अंक।',
        subjects: [
          {
            id: 'st-pri-cdp',
            canonicalSubjectId: 'super-tet-child-development',
            name: 'Child Development & Pedagogy',
            hindiName: 'बाल मनोविज्ञान (Child Psychology - 10 अंक)',
            description: 'बाल विकास को प्रभावित करने वाले कारक, सीखने की आवश्यकता की पहचान, बाल विकास के सिद्धांत, वैयक्तिक विभिन्नता।',
            group: 'core',
            chapters: [
              {
                id: 'st-pri-cdp-ch1',
                name: 'Child Psychology Core',
                hindiName: 'बाल मनोविज्ञान मूल सिद्धांत',
                topics: [
                  {
                    id: 'super-tet-child-development-1',
                    name: 'बाल विकास — अर्थ, प्रकृति एवं क्षेत्र',
                    hindiName: 'बाल विकास — अर्थ, प्रकृति एवं क्षेत्र',
                    subTopics: ['विकास की अवधारणा, वृद्धि बनाम विकास', 'बाल विकास की अवस्थाएँ', 'विकास के प्रमुख आयाम'],
                    keyConcepts: ['Growth vs Development', 'Developmental milestones'],
                  },
                  {
                    id: 'super-tet-child-development-2',
                    name: 'विकास की अवस्थाएँ',
                    hindiName: 'विकास की अवस्थाएँ (शैशवावस्था, बाल्यावस्था, किशोरावस्था)',
                    subTopics: ['शारीरिक विकास', 'मानसिक एवं संवेगात्मक विकास', 'सामाजिक विकास की विशेषताएं'],
                    keyConcepts: ['Infancy, Childhood, Adolescence characteristics'],
                  },
                  {
                    id: 'super-tet-child-development-3',
                    name: 'वंशानुक्रम एवं वातावरण',
                    hindiName: 'वंशानुक्रम एवं वातावरण की भूमिका',
                    subTopics: ['वंशानुक्रम के नियम', 'वातावरण का प्रभाव', 'प्रकृति बनाम पोषण'],
                    keyConcepts: ['Nature vs Nurture in intelligence and personality'],
                  },
                  {
                    id: 'super-tet-child-development-4',
                    name: 'व्यक्तिगत विभिन्नताएँ',
                    hindiName: 'व्यक्तिगत विभिन्नताएँ (सीखने की आवश्यकता की पहचान)',
                    subTopics: ['व्यक्तिगत भिन्नता के प्रकार एवं कारण', 'कक्षा शिक्षण में व्यक्तिगत भिन्नताओं का ध्यान रखना'],
                    keyConcepts: ['Differentiated learning needs'],
                  },
                  {
                    id: 'super-tet-child-development-5',
                    name: 'अधिगम एवं विकास का संबंध',
                    hindiName: 'अधिगम एवं विकास का संबंध',
                    subTopics: ['अधिगम की अवधारणा', 'विकास और अधिगम में अंतर्संबंध', 'परिपक्वता की भूमिका'],
                    keyConcepts: ['Learning preparedness'],
                  },
                  {
                    id: 'super-tet-child-development-6',
                    name: 'बाल विकास के सिद्धांत',
                    hindiName: 'बाल विकास के प्रमुख सिद्धांत',
                    subTopics: ['निरंतरता का सिद्धांत', 'समान प्रतिमान का सिद्धांत', 'परस्पर संबंध का सिद्धांत'],
                    keyConcepts: ['Core principles of human development'],
                  },
                  {
                    id: 'super-tet-child-development-7',
                    name: 'अधिगम और प्रेरणा',
                    hindiName: 'अधिगम और प्रेरणा (Motivation in Learning)',
                    subTopics: ['आंतरिक बनाम बाह्य प्रेरणा', 'मैस्लो का आवश्यकता पदानुक्रम', 'कक्षा में प्रेरणा का उपयोग'],
                    keyConcepts: ['Intrinsic vs Extrinsic motivation', 'Maslow hierarchy'],
                  },
                  {
                    id: 'super-tet-child-development-8',
                    name: 'समावेशी शिक्षा',
                    hindiName: 'दिव्यांग व विशेष बच्चों हेतु समावेशी शिक्षा',
                    subTopics: ['विशेष आवश्यकता वाले बालकों की पहचान', 'अनुकूली वातावरण एवं उपकरण', 'सहानुभूति बनाम संवेदनशीलता'],
                    keyConcepts: ['Inclusive practices in primary schools'],
                  },
                ],
              },
            ],
          },
          {
            id: 'st-pri-teaching-skills',
            canonicalSubjectId: 'super-tet-teaching-skills',
            name: 'Teaching Skills',
            hindiName: 'शिक्षण कौशल (Teaching Skills - 10 अंक)',
            description: 'शिक्षण की विधियां, शिक्षण अधिगम के सिद्धांत, वर्तमान भारतीय समाज एवं प्रारंभिक शिक्षा, समावेशी शिक्षा, शैक्षिक प्रबंधन।',
            group: 'core',
            chapters: [
              {
                id: 'st-pri-ts-ch1',
                name: 'Teaching Principles & Classroom Practice',
                hindiName: 'शिक्षण के सिद्धांत एवं कक्षा अभ्यास',
                topics: [
                  {
                    id: 'super-tet-teaching-skills-1',
                    name: 'शिक्षण का अर्थ एवं परिभाषा',
                    hindiName: 'शिक्षण का अर्थ, परिभाषा एवं त्रिध्रुवीय प्रक्रिया',
                    subTopics: ['जॉन डीवी की त्रिध्रुवीय प्रक्रिया', 'एडम्स की द्विध्रुवीय प्रक्रिया', 'शिक्षण के चर (स्वतंत्र, आश्रित, मध्यस्थ)'],
                    keyConcepts: ['Tripolar education concept', 'Variables of teaching'],
                  },
                  {
                    id: 'super-tet-teaching-skills-2',
                    name: 'शिक्षण के उद्देश्य',
                    hindiName: 'शिक्षण के उद्देश्य (ब्लूम का वर्गीकरण)',
                    subTopics: ['ज्ञानात्मक पक्ष', 'भावात्मक पक्ष', 'क्रियात्मक पक्ष'],
                    keyConcepts: ['Bloom taxonomy levels'],
                  },
                  {
                    id: 'super-tet-teaching-skills-3',
                    name: 'शिक्षण के सिद्धांत',
                    hindiName: 'शिक्षण के सामान्य सिद्धांत एवं सूत्र',
                    subTopics: ['क्रियाशीलता का सिद्धांत', 'रुचि एवं प्रेरणा का सिद्धांत', 'शिक्षण सूत्र: ज्ञात से अज्ञात, सरल से कठिन, मूर्त से अमूर्त'],
                    keyConcepts: ['Maxims of teaching'],
                  },
                  {
                    id: 'super-tet-teaching-skills-4',
                    name: 'शिक्षण की विशेषताएँ',
                    hindiName: 'प्रभावी शिक्षण की विशेषताएँ',
                    subTopics: ['लोकतांत्रिक शिक्षण', 'प्रगतिशील शिक्षा', 'सहयोगात्मक शिक्षण'],
                    keyConcepts: ['Characteristics of impactful teaching'],
                  },
                  {
                    id: 'super-tet-teaching-skills-8',
                    name: 'शिक्षण की विभिन्न विधियाँ',
                    hindiName: 'शिक्षण की प्रमुख विधियाँ',
                    subTopics: ['व्याख्यान विधि, प्रदर्शन विधि, खेल विधि (किंडरगार्टन/मॉन्टेसरी)', 'परियोजना विधि (प्रोजेक्ट मेथड - किलपैट्रिक)', 'समस्या समाधान विधि, खोज/ह्यूरिस्टिक विधि (आर्मस्ट्रांग)'],
                    keyConcepts: ['Student-centric teaching methodologies'],
                  },
                  {
                    id: 'super-tet-teaching-skills-12',
                    name: 'कक्षा प्रबंधन',
                    hindiName: 'कक्षा प्रबंधन, समय-सारणी एवं अनुशासन',
                    subTopics: ['सकारात्मक कक्षा वातावरण', 'समय-सारणी का निर्माण', 'अनुशासन बनाए रखने की तकनीकें'],
                    keyConcepts: ['Classroom leadership and atmosphere'],
                  },
                  {
                    id: 'super-tet-teaching-skills-13',
                    name: 'मूल्यांकन एवं शिक्षण',
                    hindiName: 'शैक्षिक मूल्यांकन एवं मापन',
                    subTopics: ['मापन बनाम मूल्यांकन', 'सतत एवं व्यापक मूल्यांकन (CCE)', 'प्रश्न पत्र निर्माण एवं ब्लूप्रिंट'],
                    keyConcepts: ['Evaluation instruments and blueprint creation'],
                  },
                  {
                    id: 'super-tet-teaching-skills-14',
                    name: 'शिक्षण में ICT',
                    hindiName: 'प्रारंभिक शिक्षा के नवीन प्रयास एवं ICT',
                    subTopics: ['सर्व शिक्षा अभियान, RTE Act 2009, मिड-डे मील', 'दीक्षा पोर्टल, निष्ठा प्रशिक्षण, स्मार्ट क्लास'],
                    keyConcepts: ['Government flagship initiatives for primary schools'],
                  },
                ],
              },
            ],
          },
          {
            id: 'st-pri-language',
            canonicalSubjectId: 'super-tet-hindi',
            name: 'Language',
            hindiName: 'भाषा — हिंदी, अंग्रेजी, संस्कृत (40 अंक)',
            description: 'हिंदी (20 अंक), अंग्रेजी (10 अंक), संस्कृत (10 अंक): व्याकरण, अपठित गद्यांश व पद्यांश।',
            group: 'language',
            chapters: [
              {
                id: 'st-pri-lang-ch1',
                name: 'Hindi Language',
                hindiName: 'भाषा हिंदी (20 अंक)',
                topics: [
                  {
                    id: 'super-tet-hindi-1',
                    name: 'हिंदी व्याकरण',
                    hindiName: 'हिंदी व्याकरण (वर्ण, संज्ञा, सर्वनाम, क्रिया, संधि, समास, कारक)',
                    subTopics: ['वर्णमाला, वर्तनी एवं विराम चिह्न', 'संधि एवं समास', 'संज्ञा, सर्वनाम, क्रिया, विशेषण, अव्यय', 'उपसर्ग, प्रत्यय, काल एवं कारक'],
                    keyConcepts: ['Comprehensive Hindi grammar'],
                  },
                  {
                    id: 'super-tet-hindi-2',
                    name: 'अपठित गद्यांश',
                    hindiName: 'अपठित गद्यांश एवं पद्यांश बोध',
                    subTopics: ['गद्यांश पर आधारित प्रश्नोत्तर', 'भावार्थ एवं शीर्षक का चयन'],
                    keyConcepts: ['Reading comprehension speed & accuracy'],
                  },
                  {
                    id: 'super-tet-hindi-3',
                    name: 'शब्द ज्ञान',
                    hindiName: 'शब्दावली, पर्यायवाची, विलोम, मुहावरे',
                    subTopics: ['पर्यायवाची, विलोम, अनेकार्थी', 'मुहावरे एवं लोकोक्तियाँ', 'तत्सम-तद्भव एवं देशज शब्द'],
                    keyConcepts: ['Hindi vocabulary dominance'],
                  },
                ],
              },
              {
                id: 'st-pri-lang-ch2',
                name: 'English Language',
                hindiName: 'भाषा अंग्रेजी (10 अंक)',
                topics: [
                  {
                    id: 'super-tet-english-1',
                    name: 'Parts of Speech',
                    hindiName: 'Parts of Speech & Grammar Basics',
                    subTopics: ['Nouns, Pronouns, Verbs, Adjectives, Adverbs, Prepositions, Conjunctions', 'Tenses and Subject-Verb Agreement', 'Active-Passive Voice and Narration'],
                    keyConcepts: ['English functional grammar'],
                  },
                  {
                    id: 'super-tet-english-2',
                    name: 'Reading Comprehension',
                    hindiName: 'Unseen Prose Comprehension',
                    subTopics: ['Short unseen prose passages', 'Inference and factual verification'],
                    keyConcepts: ['Passage analysis'],
                  },
                  {
                    id: 'super-tet-english-3',
                    name: 'Vocabulary and Usage',
                    hindiName: 'Vocabulary, Idioms & Spellings',
                    subTopics: ['Synonyms and Antonyms', 'Common idioms and phrases', 'One-word substitution and spellings'],
                    keyConcepts: ['Word power in English'],
                  },
                ],
              },
            ],
          },
          {
            id: 'st-pri-mathematics',
            canonicalSubjectId: 'super-tet-mathematics',
            name: 'Mathematics',
            hindiName: 'गणित (Mathematics - 20 अंक)',
            description: 'अंकीय क्षमता, गणितीय संक्रियाएं, दशमलव, स्थानीय मान, भिन्न, ब्याज, लाभ-हानि, प्रतिशत, विभाज्य, गुणनखंड, ऐकिक नियम, सामान्य बीजगणित, क्षेत्रफल, औसत, आयतन, अनुपात, सर्वसमिकाएं, सामान्य ज्यामिति, सामान्य सांख्यिकी।',
            group: 'core',
            chapters: [
              {
                id: 'st-pri-maths-ch1',
                name: 'Core Arithmetic & Geometry',
                hindiName: 'अंकगणित, बीजगणित एवं ज्यामिति',
                topics: [
                  {
                    id: 'super-tet-mathematics-1',
                    name: 'संख्या पद्धति',
                    hindiName: 'अंकीय क्षमता, स्थानीय मान, संख्या पद्धति व भिन्न',
                    subTopics: ['संख्याएं एवं अंकीय क्षमता', 'स्थानीय मान एवं अंकित मान', 'दशमलव, भिन्न, विभाज्यता के नियम, गुणनखंड'],
                    keyConcepts: ['Number aptitude & factorization'],
                  },
                  {
                    id: 'super-tet-mathematics-2',
                    name: 'भिन्न और दशमलव',
                    hindiName: 'व्यावहारिक अंकगणित (प्रतिशत, लाभ-हानि, साधारण ब्याज, ऐकिक नियम)',
                    subTopics: ['प्रतिशत, लाभ व हानि', 'साधारण ब्याज एवं चक्रवृद्धि ब्याज', 'औसत, अनुपात एवं समानुपात, ऐकिक नियम'],
                    keyConcepts: ['Commercial arithmetic mastery'],
                  },
                  {
                    id: 'super-tet-mathematics-3',
                    name: 'ज्यामिति और मापन',
                    hindiName: 'सामान्य बीजगणित, ज्यामिति, क्षेत्रफल, आयतन एवं सांख्यिकी',
                    subTopics: ['सामान्य बीजगणित एवं सर्वसमिकाएं', 'सामान्य ज्यामिति (त्रिभुज, चतुर्भुज, वृत्त)', 'क्षेत्रफल, आयतन एवं परिमाप', 'सामान्य सांख्यिकी (माध्य, माध्यिका, बहुलक)'],
                    keyConcepts: ['Mensuration formulas & statistical basics'],
                  },
                ],
              },
            ],
          },
          {
            id: 'st-pri-evs',
            canonicalSubjectId: 'super-tet-evs',
            name: 'Environmental Studies',
            hindiName: 'पर्यावरण एवं सामाजिक अध्ययन (10 अंक)',
            description: 'पृथ्वी की संरचना, नदियां, पर्वत, महाद्वीप, महासागर, प्राकृतिक संपदा, अक्षांश और देशांतर, सौरमंडल, भारतीय भूगोल, भारतीय स्वतंत्रता संग्राम, भारतीय संविधान, हमारी शासन व्यवस्था, यातायात एवं सड़क सुरक्षा, भारतीय अर्थव्यवस्था, पर्यावरण संरक्षण।',
            group: 'core',
            chapters: [
              {
                id: 'st-pri-evs-ch1',
                name: 'Environment & Social Studies',
                hindiName: 'पर्यावरण, भूगोल एवं संविधान',
                topics: [
                  {
                    id: 'super-tet-evs-1',
                    name: 'परिवार और समाज',
                    hindiName: 'पर्यावरण संरक्षण, प्राकृतिक संपदा एवं पारिस्थितिकी',
                    subTopics: ['पर्यावरण संरक्षण के उपाय, प्रदूषण के प्रकार व रोकथाम', 'पारिस्थितिक तंत्र एवं खाद्य श्रृंखला', 'ओजोन परत, ग्लोबल वार्मिंग, आपदा प्रबंधन'],
                    keyConcepts: ['Ecology and conservation'],
                  },
                  {
                    id: 'super-tet-evs-2',
                    name: 'प्राकृतिक संसाधन',
                    hindiName: 'भूगोल: सौरमंडल, पृथ्वी की संरचना, भारत की नदियां, पर्वत',
                    subTopics: ['सौरमंडल, अक्षांश व देशांतर रेखाएं', 'पृथ्वी की आंतरिक संरचना', 'भारत का भूगोल: नदियां, पर्वत, महाद्वीप, महासागर, खनिज'],
                    keyConcepts: ['Physical and Indian geography'],
                  },
                  {
                    id: 'super-tet-evs-3',
                    name: 'स्वास्थ्य और स्वच्छता',
                    hindiName: 'भारतीय स्वतंत्रता संग्राम, संविधान एवं शासन व्यवस्था',
                    subTopics: ['1857 का संग्राम एवं राष्ट्रीय आंदोलन', 'भारतीय संविधान: प्रस्तावना, मौलिक अधिकार व कर्तव्य', 'हमारी शासन व्यवस्था, यातायात एवं सड़क सुरक्षा, भारतीय अर्थव्यवस्था'],
                    keyConcepts: ['Indian polity and road safety essentials'],
                  },
                ],
              },
            ],
          },
          {
            id: 'st-pri-gk-ca',
            canonicalSubjectId: 'super-tet-general-knowledge',
            name: 'General Knowledge & Current Affairs',
            hindiName: 'सामान्य ज्ञान एवं समसामयिक घटनाएं (30 अंक)',
            description: 'समसामयिक महत्वपूर्ण घटनाएं (अंतरराष्ट्रीय, राष्ट्रीय, प्रदेश से संबंधित महत्वपूर्ण घटनाएं), स्थान, व्यक्तित्व, रचनाएं, अंतरराष्ट्रीय तथा राष्ट्रीय पुरस्कार, खेलकूद, भारतीय संस्कृति एवं कला।',
            group: 'core',
            chapters: [
              {
                id: 'st-pri-gk-ch1',
                name: 'Current Affairs & Static GK',
                hindiName: 'करंट अफेयर्स एवं सामान्य ज्ञान',
                topics: [
                  {
                    id: 'super-tet-general-knowledge-1',
                    name: 'भारत सामान्य ज्ञान',
                    hindiName: 'भारतीय संस्कृति, कला, प्रमुख व्यक्तित्व एवं रचनाएं',
                    subTopics: ['भारतीय शास्त्रीय एवं लोक नृत्य, मेले, त्योहार', 'प्रमुख पुस्तकें, लेखक एवं साहित्य अकादमी पुरस्कार', 'भारत के ऐतिहासिक स्थल एवं यूनेस्को धरोहर'],
                    keyConcepts: ['Indian heritage and culture'],
                  },
                  {
                    id: 'super-tet-current-affairs-1',
                    name: 'राष्ट्रीय घटनाक्रम',
                    hindiName: 'राष्ट्रीय एवं उत्तर प्रदेश समसामयिक घटनाएं',
                    subTopics: ['राष्ट्रीय नीतियां, योजनाएं एवं सूचकांक', 'उत्तर प्रदेश सरकार की प्रमुख योजनाएं एवं बजट', 'प्रमुख राष्ट्रीय नियुक्तियां, शिखर सम्मेलन'],
                    keyConcepts: ['National & UP current events'],
                  },
                  {
                    id: 'super-tet-current-affairs-3',
                    name: 'खेल और पुरस्कार',
                    hindiName: 'खेलकूद, अंतरराष्ट्रीय घटनाएं एवं पुरस्कार',
                    subTopics: ['ओलंपिक, राष्ट्रमंडल, एशियाई खेल, क्रिकेट विश्व कप', 'नोबेल पुरस्कार, भारत रत्न, पद्म पुरस्कार', 'प्रमुख अंतरराष्ट्रीय संगठन एवं सम्मेलन'],
                    keyConcepts: ['Sports championships and prestigious honors'],
                  },
                ],
              },
            ],
          },
          {
            id: 'st-pri-it',
            canonicalSubjectId: 'super-tet-information-technology',
            name: 'Information Technology',
            hindiName: 'सूचना प्रौद्योगिकी (Computer / IT - 5 अंक)',
            description: 'शिक्षण कौशल विकास, कक्षा शिक्षण तथा विद्यालय प्रबंधन के क्षेत्र में सूचना तकनीकी, कंप्यूटर, इंटरनेट, स्मार्टफोन, ओ.ई.आर. (ओपन एजुकेशनल रिसोर्स), डिजिटल शिक्षण सामग्री।',
            group: 'core',
            chapters: [
              {
                id: 'st-pri-it-ch1',
                name: 'Digital Literacy for Teachers',
                hindiName: 'कंप्यूटर एवं डिजिटल शिक्षण',
                topics: [
                  {
                    id: 'super-tet-information-technology-1',
                    name: 'कंप्यूटर की मूल बातें',
                    hindiName: 'कंप्यूटर की मूल बातें (हार्डवेयर, सॉफ्टवेयर, मेमोरी, शॉर्टकट)',
                    subTopics: ['इनपुट/आउटपुट डिवाइस, सीपीयू, रैम, रोम', 'ऑपरेटिंग सिस्टम एवं बेसिक शॉर्टकट कुंजियां', 'एमएस ऑफिस (वर्ड, एक्सेल, पावरपॉइंट) की प्राथमिक जानकारी'],
                    keyConcepts: ['Computer hardware & office productivity basics'],
                  },
                  {
                    id: 'super-tet-information-technology-2',
                    name: 'इंटरनेट और सुरक्षा',
                    hindiName: 'इंटरनेट, ईमेल, साइबर सुरक्षा एवं स्मार्टफोन का उपयोग',
                    subTopics: ['इंटरनेट ब्राउज़र, सर्च इंजन, ईमेल का उपयोग', 'साइबर सुरक्षा: पासवर्ड सुरक्षा, फ़िशिंग से बचाव', 'कक्षा शिक्षण में स्मार्टफोन एवं ऐप्स का उपयोग'],
                    keyConcepts: ['Safe web browsing & digital security'],
                  },
                  {
                    id: 'super-tet-information-technology-3',
                    name: 'डिजिटल शिक्षण',
                    hindiName: 'ओ.ई.आर. (OER), डिजिटल शिक्षण सामग्री एवं दीक्षा/स्वयं',
                    subTopics: ['ओपन एजुकेशनल रिसोर्सेज (OER) का अर्थ एवं उपयोग', 'दीक्षा पोर्टल, स्वयं, ई-पाठशाला का उपयोग', 'विद्यालय प्रबंधन में सूचना प्रौद्योगिकी की भूमिका'],
                    keyConcepts: ['OER repositories & modern EdTech'],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'upper-primary',
        name: 'Upper Primary (उच्च प्राथमिक सहायक अध्यापक - Class 6 to 8)',
        shortName: 'Upper Primary (कक्षा 6-8)',
        hindiName: 'उच्च प्राथमिक स्तर (कक्षा 6 से 8)',
        targetClass: 'Class 6 to 8',
        description: 'सुपर टीईटी उच्च प्राथमिक सहायक अध्यापक भर्ती परीक्षा: भाषा, बाल मनोविज्ञान, शिक्षण कौशल, गणित/विज्ञान अथवा सामाजिक अध्ययन।',
        subjectGroups: [
          {
            id: 'st-up-common',
            title: 'अनिवार्य खंड',
            description: 'बाल मनोविज्ञान, शिक्षण कौशल, भाषा, सामान्य ज्ञान व करंट अफेयर्स, सूचना प्रौद्योगिकी',
            subjectIds: ['st-up-cdp', 'st-up-teaching-skills', 'st-up-language', 'st-up-gk-ca', 'st-up-it'],
          },
          {
            id: 'st-up-math-science',
            title: 'विषय वर्ग 1: Mathematics & Science',
            description: 'गणित एवं विज्ञान पद हेतु',
            isElective: true,
            subjectIds: ['st-up-maths-science'],
          },
          {
            id: 'st-up-social-studies',
            title: 'विषय वर्ग 2: Social Studies',
            description: 'सामाजिक अध्ययन पद हेतु',
            isElective: true,
            subjectIds: ['st-up-social-studies'],
          },
        ],
        subjects: [
          {
            id: 'st-up-cdp',
            canonicalSubjectId: 'super-tet-child-development',
            name: 'Child Development & Pedagogy',
            hindiName: 'बाल मनोविज्ञान (Child Psychology)',
            description: 'किशोरावस्था का बाल विकास, अधिगम प्रक्रिया, व्यक्तिगत विभिन्नताएं एवं मार्गदर्शन।',
            group: 'core',
            chapters: [
              {
                id: 'st-up-cdp-ch1',
                name: 'Adolescent Development',
                hindiName: 'किशोरावस्था एवं अधिगम',
                topics: [
                  {
                    id: 'super-tet-child-development-1',
                    name: 'बाल विकास — अर्थ, प्रकृति एवं क्षेत्र',
                    hindiName: 'बाल विकास एवं किशोरावस्था की विशेषताएं',
                    subTopics: ['किशोरावस्था में संज्ञानात्मक व संवेगात्मक विकास', 'समावेशी शिक्षा एवं विशेष आवश्यकता वाले बालक'],
                    keyConcepts: ['Upper primary developmental pedagogy'],
                  },
                ],
              },
            ],
          },
          {
            id: 'st-up-language',
            canonicalSubjectId: 'super-tet-hindi',
            name: 'Language',
            hindiName: 'भाषा (हिंदी, अंग्रेजी, संस्कृत)',
            description: 'उच्च प्राथमिक स्तर की भाषा दक्षता, व्याकरण एवं साहित्य।',
            group: 'language',
            chapters: [
              {
                id: 'st-up-lang-ch1',
                name: 'Language Skills',
                hindiName: 'भाषा दक्षता एवं व्याकरण',
                topics: [
                  {
                    id: 'super-tet-hindi-1',
                    name: 'हिंदी व्याकरण',
                    hindiName: 'हिंदी भाषा, व्याकरण एवं काव्य शास्त्र',
                    subTopics: ['वर्ण, शब्द, वाक्य संरचना, संधि, समास', 'साहित्यिक विधाएं एवं लेखक परिचय'],
                    keyConcepts: ['Higher-level language fluency'],
                  },
                ],
              },
            ],
          },
          {
            id: 'st-up-maths-science',
            canonicalSubjectId: 'super-tet-science',
            name: 'Mathematics & Science',
            hindiName: 'Mathematics & Science (गणित एवं विज्ञान वर्ग)',
            description: 'कक्षा 6 से 8 के गणित एवं विज्ञान का सम्पूर्ण पाठ्यक्रम।',
            group: 'mathematics-science',
            groupLabel: 'Mathematics & Science',
            chapters: [
              {
                id: 'st-up-ms-ch1',
                name: 'Maths and Science Mastery',
                hindiName: 'गणित एवं विज्ञान',
                topics: [
                  {
                    id: 'super-tet-science-1',
                    name: 'भौतिक विज्ञान की मूल बातें',
                    hindiName: 'विज्ञान एवं गणित उच्च प्राथमिक संकल्पनाएं',
                    subTopics: ['भौतिक, रासायनिक एवं जैविक विज्ञान के नियम', 'बीजगणित, क्षेत्रमिति, त्रिकोणमिति एवं सांख्यिकी'],
                    keyConcepts: ['Secondary level STEM concepts'],
                  },
                ],
              },
            ],
          },
          {
            id: 'st-up-social-studies',
            canonicalSubjectId: 'super-tet-social-studies',
            name: 'Social Studies',
            hindiName: 'Social Studies (सामाजिक अध्ययन वर्ग)',
            description: 'इतिहास, भूगोल, नागरिक शास्त्र एवं अर्थशास्त्र।',
            group: 'social-science',
            groupLabel: 'Social Studies',
            chapters: [
              {
                id: 'st-up-ss-ch1',
                name: 'Social Studies Core',
                hindiName: 'सामाजिक अध्ययन',
                topics: [
                  {
                    id: 'super-tet-social-studies-1',
                    name: 'भारतीय इतिहास',
                    hindiName: 'इतिहास, भूगोल एवं भारतीय संविधान',
                    subTopics: ['प्राचीन, मध्यकालीन व आधुनिक भारत', 'विश्व व भारत का भूगोल, पर्यावरण', 'संविधान, शासन व्यवस्था एवं अर्थव्यवस्था'],
                    keyConcepts: ['Comprehensive social sciences'],
                  },
                ],
              },
            ],
          },
          {
            id: 'st-up-teaching-skills',
            canonicalSubjectId: 'super-tet-teaching-skills',
            name: 'Teaching Skills',
            hindiName: 'शिक्षण कौशल एवं जीवन कौशल',
            description: 'शिक्षण विधियां, व्यावसायिक आचरण, प्रेरणा एवं शैक्षिक प्रबंधन।',
            group: 'core',
            chapters: [
              {
                id: 'st-up-ts-ch1',
                name: 'Teaching Methods & Life Skills',
                hindiName: 'शिक्षण कौशल व जीवन कौशल',
                topics: [
                  {
                    id: 'super-tet-teaching-skills-1',
                    name: 'शिक्षण का अर्थ एवं परिभाषा',
                    hindiName: 'शिक्षण विधियां एवं जीवन कौशल',
                    subTopics: ['शिक्षण कौशल एवं प्रबंधन', 'व्यावसायिक नैतिकता एवं मानवीय मूल्य'],
                    keyConcepts: ['Classroom leadership & ethics'],
                  },
                ],
              },
            ],
          },
          {
            id: 'st-up-gk-ca',
            canonicalSubjectId: 'super-tet-general-knowledge',
            name: 'General Knowledge & Current Affairs',
            hindiName: 'सामान्य ज्ञान एवं करंट अफेयर्स',
            description: 'राष्ट्रीय, अंतरराष्ट्रीय व उत्तर प्रदेश की समसामयिक घटनाएं।',
            group: 'core',
            chapters: [
              {
                id: 'st-up-gk-ch1',
                name: 'GK & CA',
                hindiName: 'सामान्य ज्ञान व समसामयिकी',
                topics: [
                  {
                    id: 'super-tet-current-affairs-1',
                    name: 'राष्ट्रीय घटनाक्रम',
                    hindiName: 'समसामयिक घटनाएं एवं सामान्य ज्ञान',
                    subTopics: ['राष्ट्रीय व अंतरराष्ट्रीय घटनाक्रम', 'खेल, पुरस्कार, व्यक्तित्व एवं कला'],
                    keyConcepts: ['High-frequency current affairs'],
                  },
                ],
              },
            ],
          },
          {
            id: 'st-up-it',
            canonicalSubjectId: 'super-tet-information-technology',
            name: 'Information Technology',
            hindiName: 'सूचना प्रौद्योगिकी',
            description: 'कंप्यूटर, इंटरनेट, OER एवं डिजिटल शिक्षण उपकरण।',
            group: 'core',
            chapters: [
              {
                id: 'st-up-it-ch1',
                name: 'IT Skills',
                hindiName: 'कंप्यूटर एवं सूचना तकनीकी',
                topics: [
                  {
                    id: 'super-tet-information-technology-1',
                    name: 'कंप्यूटर की मूल बातें',
                    hindiName: 'सूचना तकनीकी एवं डिजिटल शिक्षा',
                    subTopics: ['कंप्यूटर एवं इंटरनेट के मूल सिद्धांत', 'डिजिटल शिक्षा उपकरण एवं OER'],
                    keyConcepts: ['Digital classroom literacy'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

export const TEACHING_EXAMS_LIST: TeachingExamStructure[] = [
  TEACHING_EXAMS_DATA.ctet,
  TEACHING_EXAMS_DATA.uptet,
  TEACHING_EXAMS_DATA['super-tet'],
];

/**
 * TEACHING_EXAMS_HIERARCHY is both an array of all teaching exams (.find, .map, etc.)
 * AND a record accessible by key (['ctet'], .ctet, etc.)
 */
export const TEACHING_EXAMS_HIERARCHY: TeachingExamStructure[] & Record<string, TeachingExamStructure> = Object.assign(
  [...TEACHING_EXAMS_LIST],
  TEACHING_EXAMS_DATA
);

/**
 * Retrieves the full structured teaching hierarchy for a given exam ID
 */
export function getTeachingExamHierarchy(examId: string): TeachingExamStructure | undefined {
  const norm = (examId || '').toLowerCase().trim();
  return TEACHING_EXAMS_DATA[norm];
}

/**
 * Checks if an exam is one of the three core Teaching Eligibility Exams
 */
export function isTeachingExam(examId: string): boolean {
  const norm = (examId || '').toLowerCase().trim();
  return norm === 'ctet' || norm === 'uptet' || norm === 'super-tet';
}

/**
 * Get all available papers for a teaching exam
 */
export function getPapersForTeachingExam(examId: string): HierarchyPaper[] {
  const exam = getTeachingExamHierarchy(examId);
  return exam ? exam.papers : [];
}

/**
 * Resolves a paper within a teaching exam
 */
export function getPaperHierarchy(examId: string, paperId: string): HierarchyPaper | undefined {
  const exam = getTeachingExamHierarchy(examId);
  if (!exam) return undefined;
  const norm = (paperId || '').toLowerCase().trim();
  return exam.papers.find((p) => p.id.toLowerCase() === norm || p.shortName.toLowerCase() === norm);
}

/**
 * Get subjects under a specific paper
 */
export function getSubjectsForPaper(examId: string, paperId: string): HierarchySubject[] {
  const paper = getPaperHierarchy(examId, paperId);
  return paper ? paper.subjects : [];
}
