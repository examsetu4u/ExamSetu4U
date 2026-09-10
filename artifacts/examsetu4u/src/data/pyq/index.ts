import { exams, subjects, topics } from '@/data/curriculum';

export type PYQDifficulty = 'Easy' | 'Moderate' | 'Challenging';

export type PYQOption = {
  id: string;
  label: string;
  text: string;
};

export type PYQMetadata = {
  examId: string;
  subjectId: string;
  topicId: string;
  year: number;
  difficulty: PYQDifficulty;
  sourceLabel: string;
  isSample: boolean;
};

export type PYQExplanation = {
  answerReason: string;
  importantPoint: string;
  additionalFact: string;
  commonMistake: string;
};

export type PYQQuestion = {
  id: string;
  prompt: string;
  options: PYQOption[];
  correctOptionId: string;
  metadata: PYQMetadata;
  explanation: PYQExplanation;
};

const sample = (examId: string, subjectId: string, topicId: string, year: number, difficulty: PYQDifficulty, id: string, prompt: string, options: [string, string, string, string], correctOptionId: string, explanation: PYQExplanation): PYQQuestion => ({
  id,
  prompt,
  options: options.map((text, index) => ({ id: String.fromCharCode(97 + index), label: String.fromCharCode(65 + index), text })),
  correctOptionId,
  metadata: {
    examId,
    subjectId,
    topicId,
    year,
    difficulty,
    sourceLabel: 'ExamSetu4U practice sample',
    isSample: true,
  },
  explanation,
});

export const pyqQuestions: PYQQuestion[] = [
  sample('super-tet', 'super-tet-child-development', 'super-tet-child-development-1', 2023, 'Moderate', 'st-cd-2023-01', 'बाल विकास के संदर्भ में निम्नलिखित में से कौन-सा कथन सबसे उपयुक्त है?', ['विकास केवल शारीरिक परिवर्तन है', 'विकास एक सतत और बहुआयामी प्रक्रिया है', 'सभी बच्चे समान गति से विकसित होते हैं', 'विकास केवल विद्यालय में होता है'], 'b', {
    answerReason: 'विकास में शारीरिक, संज्ञानात्मक, भावनात्मक और सामाजिक परिवर्तन शामिल होते हैं तथा इसकी गति व्यक्ति-व्यक्ति में अलग हो सकती है।',
    importantPoint: 'वृद्धि सामान्यतः मापने योग्य शारीरिक परिवर्तन है; विकास व्यापक गुणात्मक और मात्रात्मक परिवर्तन है।',
    additionalFact: 'वंशानुक्रम और वातावरण विकास को साथ मिलकर प्रभावित करते हैं।',
    commonMistake: 'विकास को केवल ऊंचाई और वजन तक सीमित न करें।',
  }),
  sample('super-tet', 'super-tet-child-development', 'super-tet-child-development-2', 2022, 'Easy', 'st-cd-2022-01', 'सीखने के लिए पूर्व अनुभवों को महत्व देने वाली कक्षा किस दृष्टिकोण के सबसे निकट है?', ['व्यवहारवाद', 'रचनावाद', 'दंडात्मक अनुशासन', 'केवल व्याख्यान पद्धति'], 'b', {
    answerReason: 'रचनावादी दृष्टिकोण में विद्यार्थी अपने पूर्व ज्ञान और अनुभवों के आधार पर अर्थ का निर्माण करते हैं।',
    importantPoint: 'शिक्षक की भूमिका केवल सूचना देने की नहीं, सीखने के अवसर बनाने की होती है।',
    additionalFact: 'खुले प्रश्न और गतिविधियां बच्चों की सोच को सामने लाती हैं।',
    commonMistake: 'रचनावाद का अर्थ यह नहीं कि शिक्षक की कोई भूमिका नहीं होती।',
  }),
  sample('super-tet', 'super-tet-teaching-skills', 'super-tet-teaching-skills-1', 2024, 'Moderate', 'st-ts-2024-01', 'ज्ञात से अज्ञात की ओर सिद्धांत का कक्षा में सही उपयोग क्या है?', ['सीधे कठिन विषय शुरू करना', 'विद्यार्थी के पूर्वज्ञान से नए विचार को जोड़ना', 'हर उत्तर को याद करवाना', 'सिर्फ पाठ्यपुस्तक पढ़ना'], 'b', {
    answerReason: 'पूर्वज्ञान से शुरुआत करने पर नया विचार विद्यार्थी के लिए अर्थपूर्ण और जुड़ा हुआ बनता है।',
    importantPoint: 'शिक्षण सिद्धांत कठोर क्रम नहीं, संदर्भ के अनुसार उपयोग किए जाने वाले मार्गदर्शक हैं।',
    additionalFact: 'सरल से कठिन और ठोस से अमूर्त भी इसी प्रकार के उपयोगी सिद्धांत हैं।',
    commonMistake: 'ज्ञात का अर्थ शिक्षक के लिए ज्ञात नहीं, विद्यार्थी के पूर्व अनुभव से है।',
  }),
  sample('ctet', 'ctet-child-development', 'ctet-child-development-1', 2023, 'Moderate', 'ct-cdp-2023-01', 'A teacher notices that two learners reach the same concept through different strategies. The best response is to:', ['Accept only the fastest strategy', 'Value both strategies and discuss the thinking', 'Give both learners the same punishment', 'Stop the activity immediately'], 'b', {
    answerReason: 'अलग रणनीतियां समझ की विविध राहें दिखाती हैं। उनकी चर्चा से शिक्षक और सहपाठी दोनों सीख सकते हैं।',
    importantPoint: 'व्यक्तिगत भिन्नता inclusive classroom की सामान्य विशेषता है।',
    additionalFact: 'Assessment can include observation, dialogue and student work, not only a written test.',
    commonMistake: 'एक सही उत्तर का अर्थ एक ही सही प्रक्रिया नहीं होता।',
  }),
  sample('ctet', 'ctet-mathematics', 'ctet-mathematics-1', 2022, 'Easy', 'ct-math-2022-01', 'Which classroom action best supports understanding of the number system?', ['Memorising tables without examples', 'Using place-value materials and asking learners to explain', 'Giving only timed tests', 'Avoiding learner questions'], 'b', {
    answerReason: 'Concrete place-value materials connect symbols with quantity and make thinking visible.',
    importantPoint: 'A good mathematics task asks learners to represent, explain and compare ideas.',
    additionalFact: 'Errors can reveal a learner’s current model of place value.',
    commonMistake: 'Speed is not the same as conceptual understanding.',
  }),
  sample('ctet', 'ctet-environmental-studies', 'ctet-environmental-studies-1', 2024, 'Challenging', 'ct-evs-2024-01', 'In EVS, starting a lesson with children’s home experiences primarily helps the teacher to:', ['Replace all curriculum content', 'Connect classroom concepts with lived experience', 'Avoid assessment', 'Teach only memorised facts'], 'b', {
    answerReason: 'EVS becomes meaningful when children relate concepts about family, food and surroundings to their own lives.',
    importantPoint: 'The child’s context is a resource for teaching, not a distraction from the syllabus.',
    additionalFact: 'Field observations and conversations can be valid learning evidence.',
    commonMistake: 'Local context should broaden examples, not stereotype a learner’s background.',
  }),
  sample('uptet', 'uptet-child-development', 'uptet-child-development-1', 2023, 'Moderate', 'up-cdp-2023-01', 'समावेशी कक्षा में शिक्षक का सबसे उपयुक्त व्यवहार क्या है?', ['सभी बच्चों को एक ही सहायता देना', 'बच्चों की जरूरत के अनुसार सहयोग और अवसर देना', 'कम उपलब्धि वाले बच्चों को अलग रखना', 'केवल परीक्षा परिणाम देखना'], 'b', {
    answerReason: 'समावेशी शिक्षा में बाधाओं को कम करने के लिए लचीला सहयोग और समान सम्मान आवश्यक है।',
    importantPoint: 'समानता का अर्थ हर बच्चे को बिल्कुल एक जैसा देना नहीं, बल्कि सीखने का उचित अवसर देना है।',
    additionalFact: 'सहपाठी सहयोग और विविध संसाधन participation बढ़ा सकते हैं।',
    commonMistake: 'सहायता देना अपेक्षाएं कम करना नहीं है।',
  }),
  sample('uptet', 'uptet-hindi', 'uptet-hindi-1', 2022, 'Easy', 'up-hindi-2022-01', 'भाषा शिक्षण में अर्थपूर्ण पठन का सबसे अच्छा संकेत क्या है?', ['शब्दों की तेज पुनरावृत्ति', 'पाठ के अर्थ पर चर्चा और प्रमाण देना', 'केवल वर्तनी लिखना', 'सभी पंक्तियां रटना'], 'b', {
    answerReason: 'अर्थपूर्ण पठन में विद्यार्थी पाठ से अर्थ बनाता, प्रश्न पूछता और अपने उत्तर के लिए प्रमाण देता है।',
    importantPoint: 'पठन केवल उच्चारण नहीं, समझ और प्रतिक्रिया की प्रक्रिया भी है।',
    additionalFact: 'पूर्वानुमान, प्रश्न और सारांश comprehension के उपयोगी संकेत हैं।',
    commonMistake: 'सही उच्चारण को पूर्ण comprehension न मानें।',
  }),
  sample('ssc-cgl', 'ssc-cgl-reasoning', 'ssc-cgl-reasoning-1', 2023, 'Moderate', 'ssc-r-2023-01', 'Find the next term in the series: 3, 8, 15, 24, ?', ['31', '33', '35', '37'], 'c', {
    answerReason: 'The differences are 5, 7, 9, so the next difference is 11 and 24 + 11 = 35.',
    importantPoint: 'Inspect the difference pattern before trying multiplication or division.',
    additionalFact: 'The terms can also be represented as n² − 1 for n = 2, 3, 4, 5, 6.',
    commonMistake: 'Do not assume every series has a constant difference.',
  }),
  sample('ssc-cgl', 'ssc-cgl-quantitative-aptitude', 'ssc-cgl-quantitative-aptitude-1', 2024, 'Moderate', 'ssc-qa-2024-01', 'A price is increased by 20% and then reduced by 20%. The net change is:', ['No change', '4% decrease', '4% increase', '8% decrease'], 'b', {
    answerReason: 'Using 100 as the base gives 120, then 80% of 120 is 96, a net decrease of 4.',
    importantPoint: 'Successive percentage changes apply to different bases.',
    additionalFact: 'For equal increase and decrease p, the net loss is p²/100 percent.',
    commonMistake: 'Do not cancel equal percentages when the base has changed.',
  }),
  sample('cbse-class-10', 'cbse-class-10-mathematics', 'cbse-class-10-mathematics-1', 2023, 'Easy', 'cb10-math-2023-01', 'If the HCF of two positive integers is 6 and their LCM is 180, which product do they have?', ['30', '186', '1080', '2160'], 'c', {
    answerReason: 'For two positive integers, product = HCF × LCM = 6 × 180 = 1080.',
    importantPoint: 'The HCF–LCM product relation applies to two positive integers.',
    additionalFact: 'Prime factorisation is a reliable way to verify the relation.',
    commonMistake: 'Do not add HCF and LCM for this identity.',
  }),
  sample('cbse-class-10', 'cbse-class-10-science', 'cbse-class-10-science-1', 2022, 'Moderate', 'cb10-sci-2022-01', 'A balanced chemical equation follows the law of:', ['Constant temperature', 'Conservation of mass', 'Universal gravitation', 'Reflection'], 'b', {
    answerReason: 'Atoms are rearranged during a chemical reaction; they are neither created nor destroyed.',
    importantPoint: 'The number of atoms of every element must be equal on both sides.',
    additionalFact: 'Coefficients balance an equation; subscripts change the substance itself.',
    commonMistake: 'Never alter chemical formula subscripts to balance an equation.',
  }),
  sample('cbse-class-12', 'cbse-class-12-physics', 'cbse-class-12-physics-1', 2024, 'Challenging', 'cb12-phy-2024-01', 'The electric field inside a conductor in electrostatic equilibrium is:', ['Maximum', 'Zero', 'Uniform but non-zero', 'Dependent only on mass'], 'b', {
    answerReason: 'Free charges redistribute on the surface until the internal electric field becomes zero.',
    importantPoint: 'This result assumes electrostatic equilibrium and an ideal conducting material.',
    additionalFact: 'Excess charge resides on the outer surface of a conductor.',
    commonMistake: 'Do not apply the statement to a conductor carrying a time-varying current.',
  }),
  sample('cbse-class-12', 'cbse-class-12-chemistry', 'cbse-class-12-chemistry-1', 2023, 'Moderate', 'cb12-chem-2023-01', 'In an electrochemical cell, oxidation takes place at the:', ['Cathode', 'Anode', 'Salt bridge only', 'Electrolyte surface only'], 'b', {
    answerReason: 'The mnemonic AnOx places oxidation at the anode, while reduction occurs at the cathode.',
    importantPoint: 'Anode and cathode are defined by the reaction, not by their positive or negative sign in every cell.',
    additionalFact: 'A salt bridge maintains electrical neutrality and completes the circuit.',
    commonMistake: 'Do not memorise anode as always negative; its sign depends on the type of cell.',
  }),
  sample('uppcs-pre', 'uppcs-pre-general-studies-1', 'uppcs-pre-general-studies-1-1', 2023, 'Moderate', 'uppcs-gs-2023-01', 'The Preamble to the Constitution describes India as a:', ['Monarchy', 'Sovereign, Socialist, Secular, Democratic Republic', 'Confederation only', 'Military state'], 'b', {
    answerReason: 'These constitutional descriptors express the character and guiding commitments of the Indian Republic.',
    importantPoint: 'The Preamble is an interpretive key, though it is not a source of independent legislative power.',
    additionalFact: 'The words Socialist, Secular and Integrity were added by the 42nd Amendment.',
    commonMistake: 'Do not treat the Preamble as an exhaustive list of enforceable rights.',
  }),
  sample('uppcs-mains', 'uppcs-mains-essay', 'uppcs-mains-essay-1', 2022, 'Challenging', 'uppcs-essay-2022-01', 'A strong analytical essay introduction should primarily:', ['Repeat the question word for word', 'Establish context and a clear line of argument', 'List unrelated facts', 'Avoid defining the issue'], 'b', {
    answerReason: 'An introduction orients the reader, frames the issue and signals the argument that the essay will develop.',
    importantPoint: 'A balanced essay connects claims with examples and acknowledges relevant complexity.',
    additionalFact: 'A short roadmap can improve clarity in a time-bound answer.',
    commonMistake: 'An introduction should not consume the space needed for analysis and examples.',
  }),
];

export function getPYQQuestion(id: string) {
  return pyqQuestions.find((question) => question.id === id);
}

export function getPYQsForExam(examId: string) {
  return pyqQuestions.filter((question) => question.metadata.examId === examId);
}

export function getPYQsForSubject(subjectId: string) {
  return pyqQuestions.filter((question) => question.metadata.subjectId === subjectId);
}

export function getPYQsForTopic(topicId: string) {
  return pyqQuestions.filter((question) => question.metadata.topicId === topicId);
}

export function getPYQExam(examId: string) {
  return exams.find((exam) => exam.id === examId);
}

export function getPYQSubject(subjectId: string) {
  return subjects.find((subject) => subject.id === subjectId);
}

export function getPYQTopic(topicId: string) {
  return topics.find((topic) => topic.id === topicId);
}

export function uniquePYQYears(questions: PYQQuestion[]) {
  return [...new Set(questions.map((question) => question.metadata.year))].sort((a, b) => b - a);
}

export function countBy<T extends string | number>(values: T[]) {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[String(value)] = (counts[String(value)] ?? 0) + 1;
    return counts;
  }, {});
}