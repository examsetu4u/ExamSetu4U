import { loadShikshanKaushalAsMCQQuestions, resolveTopicId } from '@/data/questions/super-tet/shikshan-kaushal';
import { getPublishedGoogleSheetQuestions, registerLocalQuestionIdsSupplier } from '@/services/google-sheet-loader';
import { uppcsCurrentAffairsQuestions } from './uppcs-current-affairs-questions';
import type { MCQQuestion, QuizFilterOptions } from './types';

// Register supplier so Google Sheet validator knows existing local question IDs and avoids overwriting
registerLocalQuestionIdsSupplier(() => {
  const ids = new Set<string>();
  sampleMCQQuestions.forEach((q) => ids.add(q.id));
  try {
    const skList = loadShikshanKaushalAsMCQQuestions();
    skList.forEach((q) => ids.add(q.id));
  } catch {
    // Ignore
  }
  return ids;
});

export const sampleMCQQuestions: MCQQuestion[] = [
  ...uppcsCurrentAffairsQuestions,
  // Topic 1: शिक्षण का अर्थ एवं परिभाषा (super-tet-teaching-skills-1)
  {
    id: 'st-ts-01',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-1',
    question: 'शिक्षण की त्रिध्रुवीय (Tripolar) प्रक्रिया में जॉन डीवी (John Dewey) के अनुसार तीन प्रमुख ध्रुव कौन-से हैं?',
    options: {
      A: 'शिक्षक, शिक्षार्थी और अभिभावक',
      B: 'शिक्षक, शिक्षार्थी और पाठ्यक्रम (समाज)',
      C: 'शिक्षक, विद्यालय और परीक्षा',
      D: 'पाठ्यपुस्तक, शिक्षण विधि और कक्षा',
    },
    correctAnswer: 'B',
    explanation: 'जॉन डीवी के अनुसार शिक्षण एक त्रिध्रुवीय प्रक्रिया है जिसमें शिक्षक (स्वतंत्र चर), शिक्षार्थी (आश्रित चर) और पाठ्यक्रम या सामाजिक वातावरण (मध्यस्थ चर) शामिल होते हैं। एडम्स ने इसे द्विध्रुवीय माना था।',
    importantPoint: 'एडम्स (Adams) = द्विध्रुवीय प्रक्रिया (शिक्षक और शिक्षार्थी); जॉन डीवी (Dewey) = त्रिध्रुवीय प्रक्रिया (शिक्षक, शिक्षार्थी, पाठ्यक्रम)।',
    additionalFact: 'शिक्षण चर में शिक्षक को स्वतंत्र चर (Independent variable), छात्र को आश्रित चर (Dependent variable) तथा पाठ्यक्रम को मध्यस्थ चर (Intervening variable) कहा जाता है।',
    commonMistake: 'अभिभावक या विद्यालय को त्रिध्रुवीय प्रक्रिया का मुख्य शैक्षिक ध्रुव मान लेना सामान्य भूल है।',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-02',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-1',
    question: '‘शिक्षण अधिगम की परिस्थितियों को व्यवस्थित करने की एक कला और विज्ञान है’ — यह कथन शिक्षण की किस प्रकृति को सर्वोत्तम रूप से स्पष्ट करता है?',
    options: {
      A: 'शिक्षण केवल सैद्धांतिक ज्ञान का स्थानांतरण है',
      B: 'शिक्षण उद्देश्यपूर्ण, वैज्ञानिक और रचनात्मक प्रक्रिया है',
      C: 'शिक्षण केवल कक्षा-कक्ष तक ही सीमित प्रक्रिया है',
      D: 'शिक्षण पूरी तरह जन्मजात प्रतिभा पर निर्भर करता है',
    },
    correctAnswer: 'B',
    explanation: 'शिक्षण कला और विज्ञान दोनों है। विज्ञान के रूप में यह सुव्यवस्थित नियमों और सिद्धांतों पर आधारित है, तथा कला के रूप में यह शिक्षक के कौशल, संवेदनशीलता और रचनात्मक प्रस्तुति पर निर्भर करता है।',
    importantPoint: 'शिक्षण उद्देश्यपूर्ण, सुनियोजित, विकासात्मक तथा संप्रेषणीय प्रक्रिया है जो व्यवहार में वांछित परिवर्तन लाती है।',
    additionalFact: 'एन. एल. गेज (N.L. Gage) के अनुसार शिक्षण एक पारस्परिक प्रभाव है जिसका उद्देश्य दूसरे व्यक्ति के व्यवहार में परिवर्तन लाना है।',
    commonMistake: 'शिक्षण को केवल कला या केवल विज्ञान मान लेना; जबकि यह दोनों का समन्वित रूप है।',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },

  // Topic 2: शिक्षण के उद्देश्य (super-tet-teaching-skills-2)
  {
    id: 'st-ts-03',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-2',
    question: 'बी. एस. ब्लूम (B.S. Bloom) के शैक्षिक उद्देश्यों के वर्गीकरण (Taxonomy) के अनुसार संज्ञानात्मक क्षेत्र (Cognitive Domain) का उच्चतम स्तर कौन-सा है?',
    options: {
      A: 'अनुप्रयोग (Application)',
      B: 'विश्लेषण (Analysis)',
      C: 'मूल्यांकन (Evaluation) / सृजन (Creating)',
      D: 'बोध (Comprehension)',
    },
    correctAnswer: 'C',
    explanation: 'ब्लूम के 1956 के मूल वर्गीकरण में संज्ञानात्मक क्षेत्र का उच्चतम स्तर "मूल्यांकन" (Evaluation) था। एंडरसन और क्रैथवोहल (2001) के संशोधित वर्गीकरण में उच्चतम स्तर "सृजन" (Creating/Synthesis) है।',
    importantPoint: 'संज्ञानात्मक क्षेत्र के 6 स्तर: ज्ञान → बोध → अनुप्रयोग → विश्लेषण → संश्लेषण → मूल्यांकन (संशोधित में: याद रखना → समझना → लागू करना → विश्लेषण → मूल्यांकन → रचना)।',
    additionalFact: 'ब्लूम ने शैक्षिक उद्देश्यों को तीन क्षेत्रों में बांटा: ज्ञानात्मक (Cognitive), भावात्मक (Affective), तथा क्रियात्मक/मनोगात्मक (Psychomotor)।',
    commonMistake: 'अनुप्रयोग या विश्लेषण को उच्चतम स्तर समझना, जबकि ज्ञान आधारभूत स्तर है और मूल्यांकन/सृजन उच्चतम स्तर है।',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-04',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-2',
    question: 'भावात्मक पक्ष (Affective Domain) के उद्देश्यों का विकास मुख्य रूप से किससे संबंधित होता है?',
    options: {
      A: 'तार्किक चिंतन और समस्या समाधान से',
      B: 'मूल्यों, अभिवृत्तियों, संवेगों और अभिरुचियों से',
      C: 'शारीरिक गतियों और हस्तकौशल से',
      D: 'केवल तथ्यों को कंठस्थ करने से',
    },
    correctAnswer: 'B',
    explanation: 'भावात्मक पक्ष (क्रैथवोहल और ब्लूम, 1964) का संबंध विद्यार्थी के संवेगों, दृष्टिकोण, मूल्यों, रुचियों और प्रशंसा से होता है। इसके स्तर हैं: आग्रहण, अनुक्रिया, अनूमूल्यन, प्रत्ययीकरण, व्यवस्थापन, चरित्र-निर्माण।',
    importantPoint: 'ज्ञानात्मक = सिर (Head/मस्तिष्क), भावात्मक = हृदय (Heart/भावनाएं), क्रियात्मक = हाथ (Hand/शारीरिक कौशल) — इसे 3H कहा जाता है।',
    additionalFact: 'गांधीजी की बुनियादी शिक्षा भी 3H (Head, Heart, Hand) के विकास पर बल देती है।',
    commonMistake: 'भावात्मक पक्ष को मानसिक चिंतन (Cognitive) से भ्रमित कर देना।',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },

  // Topic 3: शिक्षण के सिद्धांत (super-tet-teaching-skills-3)
  {
    id: 'st-ts-05',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-3',
    question: 'प्राथमिक स्तर पर गणित या विज्ञान पढ़ाते समय पहले वास्तविक वस्तुएँ दिखाना और बाद में उनके सूत्रों पर चर्चा करना शिक्षण के किस सूत्र का पालन है?',
    options: {
      A: 'अमूर्त से मूर्त की ओर',
      B: 'मूर्त से अमूर्त की ओर (Concrete to Abstract)',
      C: 'अज्ञात से ज्ञात की ओर',
      D: 'कठिन से सरल की ओर',
    },
    correctAnswer: 'B',
    explanation: 'बच्चे पहले ठोस, प्रत्यक्ष वस्तुओं (मूर्त) को छूकर व देखकर आसानी से समझते हैं। इसके बाद उनके अमूर्त प्रत्यय और गणितीय सूत्रों को समझना आसान हो जाता है। अतः यह "मूर्त से अमूर्त की ओर" सूत्र है।',
    importantPoint: 'प्रमुख शिक्षण सूत्र: सरल से कठिन, ज्ञात से अज्ञात, मूर्त से अमूर्त, पूर्ण से अंश, प्रत्यक्ष से अप्रत्यक्ष, विशिष्ट से सामान्य।',
    additionalFact: 'जीन पियाजे के अनुसार 7 से 11 वर्ष के बच्चे मूर्त संक्रियात्मक अवस्था (Concrete Operational Stage) में होते हैं, इसलिए मूर्त वस्तुएँ प्रभावी होती हैं।',
    commonMistake: 'मूर्त से अमूर्त और अमूर्त से मूर्त में क्रम उलट देना।',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-06',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-3',
    question: 'गेस्टाल्ट (Gestalt) मनोविज्ञान के प्रत्यक्षीकरण सिद्धांत पर आधारित कौन-सा शिक्षण सूत्र है?',
    options: {
      A: 'अंश से पूर्ण की ओर',
      B: 'पूर्ण से अंश की ओर (Whole to Part)',
      C: 'अनिश्चित से निश्चित की ओर',
      D: 'विश्लेषण से संश्लेषण की ओर',
    },
    correctAnswer: 'B',
    explanation: 'गेस्टाल्टवादी मानते हैं कि हम किसी वस्तु या परिस्थिति का प्रत्यक्ष अनुभव पहले समग्र (पूर्ण) रूप में करते हैं, उसके बाद उसके अलग-अलग भागों (अंशों) का विश्लेषण करते हैं। जैसे पहले पूरे पेड़ को देखना, फिर पत्ती, तना आदि।',
    importantPoint: 'शिक्षण सूत्र "पूर्ण से अंश की ओर" का विकास गेस्टाल्ट मनोविज्ञान (वर्दीमर, कोहलर, कोफ्का) की देन है।',
    additionalFact: 'पाठ योजना में पहले पूरा पाठ या कहानी का सार प्रस्तुत करना इसी सूत्र का अनुप्रयोग है।',
    commonMistake: 'इसे "अंश से पूर्ण" समझ लेना, जबकि बच्चा पहले संपूर्ण दृश्य देखता है।',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },

  // Topic 4: शिक्षण की विशेषताएँ (super-tet-teaching-skills-4)
  {
    id: 'st-ts-07',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-4',
    question: 'शिक्षण की प्रकृति के संबंध में निम्नलिखित में से कौन-सा कथन सही नहीं है?',
    options: {
      A: 'शिक्षण एक अंतःक्रियात्मक प्रक्रिया (Interactive Process) है',
      B: 'शिक्षण विकासात्मक और प्रगतिशील होता है',
      C: 'शिक्षण एकतरफा सूचना प्रवाह (One-way transmission) है',
      D: 'शिक्षण कला और विज्ञान दोनों है',
    },
    correctAnswer: 'C',
    explanation: 'शिक्षण कभी भी एकतरफा (One-way) नहीं होता। यह शिक्षक और शिक्षार्थी के मध्य होने वाली जीवंत द्विपक्षीय अंतःक्रिया है, जिसमें निरंतर प्रतिपुष्टि (Feedback) मिलती रहती है।',
    importantPoint: 'आधुनिक शिक्षण में विद्यार्थी निष्क्रिय श्रोता नहीं, बल्कि ज्ञान के सक्रिय सह-निर्माता होते हैं।',
    additionalFact: 'फ्लैंडर्स की अंतःक्रिया विश्लेषण प्रणाली (FIACS) कक्षा में शिक्षक-छात्र शाब्दिक संवाद के 10 वर्गों का अध्ययन करती है।',
    commonMistake: 'पारंपरिक व्याख्यान की छवि के आधार पर शिक्षण को एकतरफा मान लेना।',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-08',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-4',
    question: 'शिक्षण में उपचारात्मक शिक्षण (Remedial Teaching) का प्राथमिक उद्देश्य क्या होता है?',
    options: {
      A: 'प्रतिभाशाली छात्रों को अगली कक्षा के लिए तैयार करना',
      B: 'अधिगम में रह गई कमियों और कठिनाइयों का निवारण करना',
      C: 'छात्रों को वार्षिक परीक्षा में अनुत्तीर्ण होने से बचाना',
      D: 'केवल गृहकार्य पूरा करवाना',
    },
    correctAnswer: 'B',
    explanation: 'निदानात्मक परीक्षण (Diagnostic Test) द्वारा पहले छात्र की अधिगम कठिनाइयों व त्रुटियों का पता लगाया जाता है, और फिर उपचारात्मक शिक्षण (Remedial Teaching) द्वारा उन कमियों को दूर किया जाता है।',
    importantPoint: 'निदान = कठिनाई का पता लगाना (Identification); उपचार = कठिनाई का समाधान (Remedy)।',
    additionalFact: 'उपचारात्मक शिक्षण व्यक्तिगत अथवा छोटे समूहों में आवश्यकतानुसार आयोजित किया जाता है।',
    commonMistake: 'निदानात्मक और उपचारात्मक शिक्षण के क्रम को उलट देना (उपचार निदान के बाद आता है)।',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },

  // Topic 5: प्रभावी शिक्षण (super-tet-teaching-skills-5)
  {
    id: 'st-ts-09',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-5',
    question: 'कक्षा में प्रभावी शिक्षण का सबसे विश्वसनीय प्रमाण निम्नलिखित में से क्या है?',
    options: {
      A: 'कक्षा में पूर्णतः पिन-ड्रॉप शांति रहना',
      B: 'विद्यार्थियों द्वारा शिक्षक से प्रश्न पूछना और जिज्ञासा व्यक्त करना',
      C: 'श्यामपट्ट पर सुंदर लिखावट का होना',
      D: 'पाठ्यपुस्तक का निर्धारित समय से पूर्व पूरा हो जाना',
    },
    correctAnswer: 'B',
    explanation: 'जीवंत और प्रभावी कक्षा वह है जहां छात्र निर्भय होकर प्रश्न पूछें, अपनी शंकाएं व्यक्त करें और विचार-विमर्श में सक्रिय भाग लें। पूर्ण शांति अक्सर डर या अरुचि का संकेत हो सकती है।',
    importantPoint: 'प्रभावी शिक्षण का मूल मंत्र है: सक्रिय अधिगम (Active Learning) और सार्थक छात्र सहभागिता।',
    additionalFact: 'राष्ट्रीय पाठ्यचर्या रूपरेखा (NCF-2005) के अनुसार कक्षा में प्रश्न पूछने की स्वतंत्रता ज्ञान निर्माण की पहली शर्त है।',
    commonMistake: 'कक्षा के पूर्ण अनुशासन या सन्नाटे को प्रभावी शिक्षण का सूचक मान लेना।',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-10',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-5',
    question: 'प्रभावी शिक्षण व्यवहार के अध्ययन में बोरिच (Gary Borich) द्वारा उल्लिखित ‘मुख्य शिक्षण व्यवहारों’ (Key Behaviors) में कौन-सा शामिल है?',
    options: {
      A: 'पाठ स्पष्टता (Lesson Clarity) एवं कार्य संलग्नता (Engagement in the Learning Process)',
      B: 'कड़ा शारीरिक दंड देना',
      C: 'बिना तैयारी के सीधे कक्षा में जाना',
      D: 'केवल व्याख्यान देकर कक्षा समाप्त करना',
    },
    correctAnswer: 'A',
    explanation: 'गैरी बोरिच ने 5 मुख्य शिक्षण व्यवहार बताए हैं: पाठ स्पष्टता (Lesson Clarity), निर्देशात्मक विविधता (Instructional Variety), कार्य निष्पादन दिशा (Teacher Task Orientation), अधिगम कार्य में संलग्नता (Engagement in the Learning Process), तथा छात्र सफलता दर (Student Success Rate)।',
    importantPoint: 'बोरिच के अनुसार स्पष्ट निर्देश और छात्रों की अधिगम में सक्रिय संलग्नता उच्च अधिगम उपलब्धि लाती है।',
    additionalFact: 'बोरिच ने 5 सहायक व्यवहार (Helping Behaviors) भी बताए हैं जिनमें छात्र विचारों का उपयोग और प्रश्न पूछना शामिल है।',
    commonMistake: 'शिक्षक की उपस्थिति या नियंत्रण को ही मुख्य व्यवहार समझना।',
    difficulty: 'Hard',
    sourceType: 'Practice',
  },

  // Topic 6: शिक्षक की भूमिका (super-tet-teaching-skills-6)
  {
    id: 'st-ts-11',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-6',
    question: 'राष्ट्रीय पाठ्यचर्या की रूपरेखा (NCF 2005) के अनुसार कक्षा-कक्ष में शिक्षक की प्रमुख भूमिका क्या है?',
    options: {
      A: 'कक्षा का एकमात्र ज्ञान-स्त्रोत (Sole Knowledge Authority)',
      B: 'सुविधादाता या सुगमकर्ता (Facilitator)',
      C: 'तानाशाह प्रशासक (Strict Ruler)',
      D: 'केवल परीक्षा नियंत्रक (Examiner)',
    },
    correctAnswer: 'B',
    explanation: 'NCF 2005 के अनुसार शिक्षक ज्ञान थोपने वाला नहीं, बल्कि सीखने के समृद्ध अवसर और वातावरण तैयार करने वाला "सुगमकर्ता/सुविधादाता" (Facilitator) है।',
    importantPoint: 'रचनावादी परिवेश में शिक्षक की भूमिका सुगमकर्ता (Facilitator), मार्गदर्शक (Guide) और परामर्शदाता (Counsellor) की है।',
    additionalFact: 'RTE Act 2009 की धारा 24 में शिक्षक के कर्तव्यों में नियमितता, पाठ्यक्रम समय पर पूरा करना और प्रत्येक बच्चे की क्षमता का आकलन शामिल है।',
    commonMistake: 'पारंपरिक मानसिकता के कारण शिक्षक को "निर्देशदाता" या "अधिनायक" मान बैठना।',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-12',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-6',
    question: 'एक शिक्षक अपनी कक्षा में लोकतांत्रिक (Democratic) नेतृत्व शैली अपनाता है। इसका विद्यार्थियों पर क्या प्रभाव पड़ेगा?',
    options: {
      A: 'विद्यार्थी पूरी तरह अनुशासनहीन हो जाएंगे',
      B: 'विद्यार्थियों में स्वतंत्र चिंतन, सहयोग और उत्तरदायित्व की भावना विकसित होगी',
      C: 'विद्यार्थियों का अधिगम स्तर न्यूनतम हो जाएगा',
      D: 'विद्यार्थी केवल शिक्षक पर पूर्णतः निर्भर रहेंगे',
    },
    correctAnswer: 'B',
    explanation: 'लोकतांत्रिक शैली में शिक्षक विद्यार्थियों को निर्णय प्रक्रिया और संवाद में शामिल करता है, जिससे छात्रों में आत्मविश्वास, सहयोग, समस्या-समाधान क्षमता और स्वतंत्र विचार का पोषण होता है।',
    importantPoint: 'तीन मुख्य नेतृत्व शैलियाँ: सत्तावादी (Authoritarian), लोकतांत्रिक (Democratic), और अहस्तक्षेपी (Laissez-faire)। शिक्षण में लोकतांत्रिक शैली सर्वश्रेष्ठ मानी जाती है।',
    additionalFact: 'कर्ट लेविन (Kurt Lewin) ने सामाजिक मनोविज्ञान में नेतृत्व की इन तीन शैलियों का अध्ययन किया था।',
    commonMistake: 'लोकतांत्रिक कक्षा को बिना किसी नियम की अराजक कक्षा समझना।',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },

  // Topic 7: विद्यार्थी की भूमिका (super-tet-teaching-skills-7)
  {
    id: 'st-ts-13',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-7',
    question: 'रचनावादी (Constructivist) कक्षा-कक्ष में विद्यार्थी की भूमिका कैसी होती है?',
    options: {
      A: 'शिक्षक द्वारा दिए गए तथ्यों को निष्क्रिय रूप से नोट करना',
      B: 'अपने पूर्व ज्ञान के आधार पर नए अनुभवों से अर्थ का सक्रिय निर्माण करना',
      C: 'बिना प्रश्न पूछे केवल दिए गए निर्देशों का पालन करना',
      D: 'केवल परीक्षा के समय रटकर उत्तर लिखना',
    },
    correctAnswer: 'B',
    explanation: 'रचनावाद (पियाजे, वाइगोत्स्की, ब्रूनर) के अनुसार बच्चा ज्ञान का सक्रिय निर्माता (Active constructor of knowledge) है, जो अपने अनुभवों व सामाजिक अंतःक्रिया से समझ बनाता है।',
    importantPoint: 'जॉन लॉक ने बच्चे को "कोरी स्लेट" (Tabula Rasa) कहा था, जिसे आधुनिक बाल मनोविज्ञान और रचनावाद पूरी तरह अस्वीकार करता है।',
    additionalFact: 'वाइगोत्स्की के अनुसार बच्चा सामाजिक संवाद और स्कैफोल्डिंग (Scaffolding) के माध्यम से अपने ZPD में सीखता है।',
    commonMistake: 'बच्चे को ज्ञान का निष्क्रिय प्राप्तकर्ता (Passive recipient) मान लेना।',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-14',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-7',
    question: 'अधिगम में ‘स्व-नियमन’ (Self-Regulation) का प्रदर्शन करने वाले विद्यार्थी की प्रमुख विशेषता क्या होती है?',
    options: {
      A: 'वह केवल शिक्षक की डांट के डर से ही पढ़ता है',
      B: 'वह अपने सीखने के लक्ष्यों का निर्धारण स्वयं करता है और अपनी प्रगति की निगरानी करता है',
      C: 'वह कभी किसी की मदद नहीं लेता',
      D: 'वह परीक्षा में बिना पढ़े भी सर्वोच्च अंक प्राप्त करता है',
    },
    correctAnswer: 'B',
    explanation: 'स्व-नियमित अधिगमकर्ता (Self-regulated learner) अपने अधिगम लक्ष्यों की योजना बनाता है, उपयुक्त रणनीतियाँ चुनता है, अपनी समझ का स्व-मूल्यांकन करता है और आवश्यकतानुसार सुधार करता है।',
    importantPoint: 'स्व-नियमन संज्ञान और परासंज्ञान (Metacognition — चिंतन के बारे में सोचना) का हिस्सा है।',
    additionalFact: 'बैण्डुरा (Bandura) के सामाजिक संज्ञानात्मक सिद्धांत में स्व-नियमन (Self-regulation) एक केंद्रीय तत्व है।',
    commonMistake: 'स्व-नियमन को अकेले रहकर पढ़ाई करने (अलगाव) से जोड़ देना।',
    difficulty: 'Hard',
    sourceType: 'Practice',
  },

  // Topic 8: शिक्षण विधियाँ (super-tet-teaching-skills-8)
  {
    id: 'st-ts-15',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-8',
    question: 'आगमन विधि (Inductive Method) में शिक्षण का सही क्रम निम्नलिखित में से क्या होता है?',
    options: {
      A: 'नियम → उदाहरण → अभ्यास → परीक्षण',
      B: 'विशिष्ट उदाहरण → अवलोकन → सामान्यीकरण (नियम निर्धारण) → सत्यापन',
      C: 'परिभाषा → सूत्र → रटना → परीक्षा',
      D: 'अमूर्त विचार → सूत्र → मूर्त वस्तु',
    },
    correctAnswer: 'B',
    explanation: 'आगमन विधि में पहले छात्रों के सामने अनेक विशिष्ट उदाहरण प्रस्तुत किए जाते हैं, छात्र उनका निरीक्षण और तुलना करते हैं, और अंत में एक सामान्य नियम या सिद्धांत तक पहुँचते हैं। (उदाहरण से नियम की ओर)।',
    importantPoint: 'आगमन विधि = उदाहरण से नियम, विशिष्ट से सामान्य, प्रत्यक्ष से प्रमाण, स्थूल से सूक्ष्म। निगमन विधि = नियम से उदाहरण, सामान्य से विशिष्ट।',
    additionalFact: 'अरस्तू (Aristotle) को आगमन और निगमन तर्क का प्रारंभिक जनक माना जाता है।',
    commonMistake: 'आगमन और निगमन विधियों के क्रम को परस्पर मिला देना।',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-16',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-8',
    question: 'प्रायोजना विधि (Project Method) के प्रतिपादक विलियम एच. किल्पैट्रिक (W.H. Kilpatrick) के अनुसार प्रोजेक्ट क्या है?',
    options: {
      A: 'कक्षा में शिक्षक द्वारा दिया गया केवल एक कठिन गृहकार्य',
      B: 'एक सोद्देश्य कार्य जो पूर्ण तन्मयता के साथ सामाजिक वातावरण में पूरा किया जाए',
      C: 'केवल प्रयोगशाला में किए जाने वाले रासायनिक प्रयोग',
      D: 'परीक्षा में अधिक अंक प्राप्त करने का त्वरित साधन',
    },
    correctAnswer: 'B',
    explanation: 'किल्पैट्रिक के अनुसार, "प्रोजेक्ट एक सोद्देश्य क्रिया (Whole-hearted purposeful activity) है जो पूरे मन से सामाजिक वातावरण में संपन्न की जाती है।" यह जॉन डीवी के प्रयोजनवाद पर आधारित है।',
    importantPoint: 'प्रोजेक्ट विधि के पद: 1. परिस्थिति उत्पन्न करना 2. योजना का चयन 3. योजना का नियोजन 4. निष्पादन 5. मूल्यांकन 6. लेखा-जोखा।',
    additionalFact: 'यह विधि "करके सीखना" (Learning by doing) और "जीवन से सीखना" (Learning through living) पर आधारित है।',
    commonMistake: 'प्रोजेक्ट विधि को केवल चार्ट बनाने या मॉडल बनाने की कला गतिविधि समझना।',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },

  // Topic 9: बाल-केंद्रित शिक्षण (super-tet-teaching-skills-9)
  {
    id: 'st-ts-17',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-9',
    question: 'बाल-केंद्रित शिक्षा (Child-Centred Education) की प्रमुख विशेषता निम्नलिखित में से क्या है?',
    options: {
      A: 'पाठ्यपुस्तक को शिक्षा का एकमात्र आधार मानना',
      B: 'बालक की रुचियों, आवश्यकताओं, क्षमताओं और अनुभवों को शिक्षण प्रक्रिया का केंद्र बनाना',
      C: 'कड़े दंड और पुरस्कार द्वारा कक्षा पर नियंत्रण रखना',
      D: 'सभी बच्चों को एक ही गति और एक ही विधि से पढ़ाना',
    },
    correctAnswer: 'B',
    explanation: 'बाल-केंद्रित शिक्षा में बालक को केंद्र बिंदु माना जाता है। पाठ्यक्रम, शिक्षण विधियाँ और कक्षा का वातावरण बालक की आयु, रुचि, योग्यता और मानसिक स्तर के अनुरूप तैयार किए जाते हैं।',
    importantPoint: 'भारत में गिजुभाई बधेका (‘मूंछों वाली मां’) ने बाल-केंद्रित शिक्षा और मोंटेसरी पद्धति के प्रचार-प्रसार में ऐतिहासिक योगदान दिया।',
    additionalFact: 'रूसो (Rousseau) ने अपनी पुस्तक "एमिल" (Emile) में प्रकृतिवादी और बाल-केंद्रित शिक्षा की मजबूत नींव रखी थी।',
    commonMistake: 'बाल-केंद्रित शिक्षा का अर्थ यह मान लेना कि शिक्षक की कोई जिम्मेदारी नहीं होती।',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-18',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-9',
    question: 'किंडरगार्टन (Kindergarten) पद्धति के जनक फ्रेडरिक फ्रोबेल (Froebel) ने शिक्षण में सर्वाधिक महत्व किसे दिया?',
    options: {
      A: 'कंठस्थीकरण और लिखित परीक्षा को',
      B: 'खेल, स्वतन्त्र आत्म-अभिव्यक्ति और उपहारों (Gifts/Occupations) को',
      C: 'व्याख्यान और शिक्षक के प्रभुत्व को',
      D: 'केवल तकनीकी उपकरणों के प्रयोग को',
    },
    correctAnswer: 'B',
    explanation: 'फ्रोबेल ने किंडरगार्टन (बच्चों का बगीचा) की स्थापना की, जहाँ शिक्षक को माली और बालक को पौधा माना गया। इसमें खेल (Play-way) और उपहारों (Gifts) के माध्यम से स्वाभाविक विकास पर बल दिया जाता है।',
    importantPoint: 'किंडरगार्टन = बालवाड़ी; जनक = फ्रोबेल (जर्मनी, 1837)। मूल सिद्धांत: खेल द्वारा शिक्षा, स्वाभाविकता, आत्म-क्रिया।',
    additionalFact: 'फ्रोबेल ने 20 उपहार (Gifts) और उनसे जुड़े व्यवसाय (Occupations) तैयार किए थे जो बच्चों के संज्ञानात्मक और गतिज विकास में सहायक थे।',
    commonMistake: 'फ्रोबेल की किंडरगार्टन और मारिया मोंटेसरी की मोंटेसरी पद्धति के उपकरणों को आपस में मिला देना।',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },

  // Topic 10: व्यक्तिगत भिन्नताएँ (super-tet-teaching-skills-10)
  {
    id: 'st-ts-19',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-10',
    question: 'कक्षा में शिक्षार्थियों की व्यक्तिगत भिन्नताओं (Individual Differences) को संबोधित करने के लिए शिक्षक को क्या करना चाहिए?',
    options: {
      A: 'मानकीकृत और एकरूप (Uniform) शिक्षण विधियों का कड़ाई से प्रयोग करना',
      B: 'विविध शिक्षण विधियों एवं बहु-संवेदी सामग्रियों (Differentiated Instruction) का उपयोग करना',
      C: 'धीमी गति से सीखने वाले बच्चों को अलग बैठाकर उपेक्षित करना',
      D: 'सभी बच्चों से एक समान परिणाम की अपेक्षा करना',
    },
    correctAnswer: 'B',
    explanation: 'प्रत्येक बच्चे की सीखने की गति, शैली, पृष्ठभूमि और क्षमताएं भिन्न होती हैं। विभेदीकृत अनुदेशन (Differentiated Instruction) और विविध शिक्षण विधियों से हर बच्चे की आवश्यकता पूरी होती है।',
    importantPoint: 'व्यक्तिगत भिन्नताओं का वैज्ञानिक अध्ययन सर्वप्रथम सर फ्रांसिस गाल्टन (Sir Francis Galton, 1869) ने अपनी पुस्तक ‘Hereditary Genius’ में किया था।',
    additionalFact: 'व्यक्तिगत भिन्नताएं दो प्रकार की होती हैं: अंतर-वैयक्तिक (Inter-individual — दो व्यक्तियों के बीच) और अंतरा-वैयक्तिक (Intra-individual — एक ही व्यक्ति के विभिन्न गुणों के बीच)।',
    commonMistake: 'सभी बच्चों के लिए "एक ही मानक तरीका" लागू करना समानता नहीं, बल्कि अन्याय है।',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-20',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-10',
    question: 'समावेशी शिक्षा (Inclusive Education) का मूल दर्शन निम्नलिखित में से किस मान्यता पर आधारित है?',
    options: {
      A: 'विशेष आवश्यकता वाले बच्चों को केवल विशेष विद्यालयों में ही पढ़ाया जाना चाहिए',
      B: 'व्यवस्था को बच्चे के अनुसार बदलना चाहिए, न कि बच्चे को व्यवस्था के अनुसार',
      C: 'दिव्यांग बच्चों को सामान्य बच्चों से पूर्णतः अलग रखना चाहिए',
      D: 'विद्यालय केवल उन्हीं बच्चों के लिए है जो तीव्र गति से सीख सकते हैं',
    },
    correctAnswer: 'B',
    explanation: 'समावेशी शिक्षा का सिद्धांत है कि सभी बच्चे (चाहे उनकी शारीरिक, बौद्धिक, सामाजिक या भाषाई स्थिति कैसी भी हो) एक साथ नियमित विद्यालय में सीखें। इसके लिए विद्यालय तंत्र व शिक्षण पद्धतियों में लचीलापन आवश्यक है।',
    importantPoint: 'समावेशी शिक्षा = नियमित विद्यालय में बिना किसी भेदभाव के सभी बच्चों का स्वागत व सीखने का अधिकार (RTE Act 2009 & NEP 2020)।',
    additionalFact: 'एकीकृत शिक्षा (Integrated Education) में बच्चे को व्यवस्था के अनुकूल ढलना पड़ता था, जबकि समावेशी शिक्षा में व्यवस्था बच्चे के अनुकूल बनती है।',
    commonMistake: 'समावेशी शिक्षा को केवल दिव्यांग बच्चों तक सीमित समझना; इसमें सामाजिक-आर्थिक रूप से वंचित वर्ग भी शामिल हैं।',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },

  // Topic 11: प्रेरणा एवं अधिगम (super-tet-teaching-skills-11)
  {
    id: 'st-ts-21',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-11',
    question: 'बी. एफ. स्किनर (B.F. Skinner) के अनुसार सीखने की प्रक्रिया में प्रेरणा (Motivation) की क्या स्थिति है?',
    options: {
      A: 'प्रेरणा सीखने का राष्ट्रीय राजमार्ग (Super Highway) है',
      B: 'प्रेरणा की अधिगम में कोई भूमिका नहीं है',
      C: 'प्रेरणा केवल जन्मजात होती है, इसे अर्जित नहीं किया जा सकता',
      D: 'प्रेरणा से सीखने की गति सदैव मंद हो जाती है',
    },
    correctAnswer: 'A',
    explanation: 'स्किनर का प्रसिद्ध कथन है: "अभिप्रेरणा सीखने का सर्वोत्तम राजमार्ग (Motivation is the super highway to learning) है।" प्रेरणा अधिगम की गति और प्रभावशीलता को कई गुना बढ़ा देती है।',
    importantPoint: 'आंतरिक प्रेरणा (Intrinsic Motivation — आत्म-संतुष्टि, रुचि, जिज्ञासा) बाह्य प्रेरणा (Extrinsic Motivation — पुरस्कार, अंक, दंड से बचाव) की तुलना में अधिक स्थायी और प्रभावी होती है।',
    additionalFact: 'मैस्लो (Abraham Maslow) ने आवश्यकताओं का पदानुक्रम सिद्धांत (Need Hierarchy Theory) दिया, जिसके शीर्ष पर आत्मसिद्धि (Self-Actualization) है।',
    commonMistake: 'केवल बाह्य पुरस्कारों (टॉफी, अंक) को ही दीर्घकालिक प्रेरणा का मुख्य आधार मान लेना।',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-22',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-11',
    question: 'जब कोई विद्यार्थी किसी गणितीय समस्या को हल करने में इसलिए आनंद लेता है क्योंकि उसे चुनौती पसंद है, तो यह किस प्रकार की प्रेरणा का उदाहरण है?',
    options: {
      A: 'बाह्य अभिप्रेरणा (Extrinsic Motivation)',
      B: 'आंतरिक अभिप्रेरणा (Intrinsic Motivation)',
      C: 'नकारात्मक अभिप्रेरणा',
      D: 'शारीरिक अभिप्रेरणा',
    },
    correctAnswer: 'B',
    explanation: 'जब कार्य करने का कारण आंतरिक आनंद, रुचि, आत्म-संतुष्टि या व्यक्तिगत चुनौती हो और किसी बाहरी पुरस्कार की लालसा न हो, तो उसे आंतरिक अभिप्रेरणा कहते हैं।',
    importantPoint: 'आंतरिक अभिप्रेरित शिक्षार्थी कठिन चुनौतियों में भी लंबे समय तक डटे रहते हैं।',
    additionalFact: 'डेसी और रयान (Deci & Ryan) का आत्म-निर्धारण सिद्धांत (Self-Determination Theory) स्वायत्तता (Autonomy), सक्षमता (Competence) और संबद्धता (Relatedness) पर बल देता है।',
    commonMistake: 'चुनौती को बाह्य दबाव समझकर इसे बाह्य अभिप्रेरणा समझ लेना।',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },

  // Topic 12: कक्षा प्रबंधन (super-tet-teaching-skills-12)
  {
    id: 'st-ts-23',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-12',
    question: 'जैकब कूनिन (Jacob Kounin) के कक्षा प्रबंधन मॉडल के अनुसार ‘Withitness’ (सर्वज्ञता/सजगता) का क्या अर्थ है?',
    options: {
      A: 'शिक्षक का हर समय कठोर शारीरिक दंड देना',
      B: 'शिक्षक को यह पूर्ण भान होना कि कक्षा के हर कोने में क्या घटित हो रहा है',
      C: 'कक्षा में केवल श्यामपट्ट की ओर देखते हुए पढ़ाना',
      D: 'छात्रों को बिना किसी नियम के पूरी तरह स्वतंत्र छोड़ देना',
    },
    correctAnswer: 'B',
    explanation: 'कूनिन का ‘Withitness’ गुण यह दर्शाता है कि शिक्षक कक्षा में होने वाली हर गतिविधि से पूरी तरह अवगत रहता है (जैसे शिक्षक के पीठ पीछे भी आंखें हों)। इससे अनुशासनहीनता शुरू होने से पहले ही रोक दी जाती है।',
    importantPoint: 'कूनिन के प्रमुख कक्षा प्रबंधन प्रत्यय: Withitness (सजगता), Overlapping (एक साथ कई कार्य संभालना), Smoothness (सुचारू प्रवाह), Momentum (गतिशीलता)।',
    additionalFact: 'प्रभावी कक्षा प्रबंधन दंड पर नहीं, बल्कि शिक्षक की सतर्कता, सुव्यवस्थित पाठ और सकारात्मक वातावरण पर निर्भर करता है।',
    commonMistake: 'कक्षा प्रबंधन को केवल छात्रों को डराकर शांत रखने की तकनीक समझ लेना।',
    difficulty: 'Hard',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-24',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-12',
    question: 'प्राथमिक विद्यालय में अनुशासन बनाए रखने का सबसे सकारात्मक और प्रभावी तरीका कौन-सा है?',
    options: {
      A: 'नियम तोड़ने वाले छात्र को कक्षा से बाहर खड़ा कर देना',
      B: 'रोचक एवं अर्थपूर्ण गतिविधियों में छात्रों को व्यस्त रखना तथा स्पष्ट सकारात्मक अपेक्षाएं तय करना',
      C: 'प्रधानाध्यापक से रोज छात्रों की शिकायत करना',
      D: 'पूरी कक्षा का खेल का कालांश (Period) निरस्त कर देना',
    },
    correctAnswer: 'B',
    explanation: 'कक्षा में अधिकांश अनुशासनहीनता बोरियत, अरुचि या अस्पष्ट निर्देशों के कारण होती है। जब छात्र रुचिकर और सक्रिय कार्यों में व्यस्त रहते हैं, तो अनुशासनहीनता की संभावना न्यूनतम हो जाती है।',
    importantPoint: 'सकारात्मक अनुशासन (Positive Discipline) दंड से नहीं, बल्कि आत्म-नियंत्रण और स्पष्ट सहयोगात्मक नियमों से विकसित होता है।',
    additionalFact: 'RTE Act 2009 की धारा 17 किसी भी प्रकार के शारीरिक दंड (Corporal Punishment) और मानसिक प्रताड़ना को पूरी तरह प्रतिबंधित करती है।',
    commonMistake: 'शारीरिक दंड या उपेक्षा को अनुशासन का प्रभावी उपाय मानना, जो कि कानूनी व मनोवैज्ञानिक रूप से गलत है।',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },

  // Topic 13: मूल्यांकन एवं शिक्षण (super-tet-teaching-skills-13)
  {
    id: 'st-ts-25',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-13',
    question: '‘सीखने के लिए आकलन’ (Assessment for Learning) की मुख्य विशेषता निम्नलिखित में से क्या है?',
    options: {
      A: 'यह सत्रांत (Term-end) में केवल श्रेणी (Grade) प्रदान करने के लिए किया जाता है',
      B: 'यह शिक्षण-अधिगम प्रक्रिया के दौरान निरंतर चलने वाला रचनात्मक (Formative) आकलन है',
      C: 'इसका उद्देश्य केवल उत्तीर्ण/अनुत्तीर्ण का फैसला करना है',
      D: 'यह पूरी तरह मानकीकृत बाह्य परीक्षा द्वारा होता है',
    },
    correctAnswer: 'B',
    explanation: 'सीखने के लिए आकलन (Assessment for Learning) रचनात्मक आकलन (Formative Assessment) है, जो शिक्षण के दौरान होता है और शिक्षक तथा छात्र दोनों को तत्काल प्रतिपुष्टि (Feedback) देकर सुधार का अवसर प्रदान करता है।',
    importantPoint: 'तीन रूप: 1. सीखने के लिए आकलन (For Learning = रचनात्मक), 2. सीखने का आकलन (Of Learning = योगात्मक/Summative), 3. सीखने के रूप में आकलन (As Learning = स्व-आकलन/Peer assessment)।',
    additionalFact: 'सतत एवं समग्र मूल्यांकन (CCE) में शैक्षिक (Scholastic) और सह-शैक्षिक (Co-scholastic) दोनों पक्षों का मूल्यांकन शामिल है।',
    commonMistake: 'Assessment FOR learning और Assessment OF learning के अंतर को भूल जाना।',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-26',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-13',
    question: 'एक अच्छे परीक्षण (Good Test) की उस विशेषता को क्या कहते हैं, जिससे यदि किसी परीक्षण को बार-बार किसी समूह पर प्रशासित किया जाए तो परिणाम लगभग एक समान आते हैं?',
    options: {
      A: 'वैधता (Validity)',
      B: 'विश्वसनीयता (Reliability)',
      C: 'वस्तुनिष्ठता (Objectivity)',
      D: 'व्यापकता (Comprehensiveness)',
    },
    correctAnswer: 'B',
    explanation: 'परिणामों की स्थिरता या संगति को विश्वसनीयता (Reliability) कहते हैं। यदि एक ही छात्र को बार-बार परीक्षा देने पर समान अंक प्राप्त होते हैं, तो परीक्षण विश्वसनीय है।',
    importantPoint: 'वैधता = परीक्षण वही मापे जिसके लिए वह बना है। विश्वसनीयता = परिणामों की निरंतरता। वस्तुनिष्ठता = परीक्षक के व्यक्तिगत प्रभाव से मुक्ति।',
    additionalFact: 'एक वैध परीक्षण हमेशा विश्वसनीय होता है, लेकिन एक विश्वसनीय परीक्षण का वैध होना आवश्यक नहीं है।',
    commonMistake: 'वैधता (Validity) और विश्वसनीयता (Reliability) की परिभाषाओं में भ्रमित होना।',
    difficulty: 'Hard',
    sourceType: 'Practice',
  },

  // Topic 14: शिक्षण में ICT (super-tet-teaching-skills-14)
  {
    id: 'st-ts-27',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-14',
    question: 'भारत सरकार द्वारा स्कूली शिक्षा में शिक्षकों और छात्रों के लिए शुरू किए गए राष्ट्रीय डिजिटल प्लेटफॉर्म ‘दीक्षा’ (DIKSHA) का पूर्ण रूप क्या है?',
    options: {
      A: 'Digital Infrastructure for Knowledge Sharing',
      B: 'Digital Information for Knowledge and School Help Access',
      C: 'Direct Institute for Knowledge and Student Homework Assistance',
      D: 'Distance Internet Knowledge for State Higher Academics',
    },
    correctAnswer: 'A',
    explanation: 'DIKSHA का पूर्ण रूप "Digital Infrastructure for Knowledge Sharing" है। यह एनसीईआरटी और शिक्षा मंत्रालय द्वारा विकसित राष्ट्रीय मंच है जो क्यूआर कोडेड पाठ्यपुस्तकें और डिजिटल शिक्षण सामग्री उपलब्ध कराता है।',
    importantPoint: 'DIKSHA पोर्टल ‘एक राष्ट्र, एक डिजिटल मंच’ की अवधारणा पर आधारित है और NEP 2020 में इसकी केंद्रीय भूमिका है।',
    additionalFact: 'SWAYAM (Study Webs of Active-Learning for Young Aspiring Minds) ऑनलाइन पाठ्यक्रमों (MOOCs) के लिए भारत सरकार का प्रमुख प्लेटफॉर्म है।',
    commonMistake: 'DIKSHA के संक्षिप्त नाम में Knowledge Sharing के स्थान पर Knowledge School या अन्य शब्द चुन लेना।',
    difficulty: 'Moderate',
    sourceType: 'Practice',
  },
  {
    id: 'st-ts-28',
    examId: 'super-tet',
    examName: 'Super TET',
    subjectId: 'super-tet-teaching-skills',
    topicId: 'super-tet-teaching-skills-14',
    question: 'शिक्षण में सूचना एवं संचार प्रौद्योगिकी (ICT) के एकीकरण का सबसे प्रभावी शैक्षिक लाभ क्या है?',
    options: {
      A: 'शिक्षक की कक्षा में उपस्थिति की आवश्यकता को समाप्त करना',
      B: 'अमूर्त एवं जटिल अवधारणाओं का दृश्यावलोकन (Visualization) और संवादात्मक शिक्षण संभव बनाना',
      C: 'विद्यार्थियों को पूरे दिन स्क्रीन के सामने बैठाए रखना',
      D: 'पारंपरिक पुस्तकों और शिक्षकों को पूरी तरह बदल देना',
    },
    correctAnswer: 'B',
    explanation: 'ICT शिक्षक का विकल्प नहीं है, बल्कि शिक्षण को सुगम बनाने का साधन है। सिमुलेशन, वीडियो, एनिमेशन और इंटरैक्टिव ऐप्स से जटिल प्रत्ययों को मूर्त रूप में समझना सहज हो जाता है।',
    importantPoint: 'ICT उपकरण शिक्षक के सहायक (Facilitative tool) हैं, प्रतिस्थापक (Replacement) नहीं।',
    additionalFact: 'मिश्रित अधिगम (Blended Learning) में प्रत्यक्ष कक्षा शिक्षण और ऑनलाइन डिजिटल संसाधनों का संतुलित संयोजन किया जाता है।',
    commonMistake: 'यह मानना कि ICT आने से शिक्षक की भूमिका खत्म हो जाती है।',
    difficulty: 'Easy',
    sourceType: 'Practice',
  },
];

// Unified getter for all quiz questions including Shikshan Kaushal 1000 MCQ system and Google Sheets
export function getAllQuizQuestions(): MCQQuestion[] {
  const map = new Map<string, MCQQuestion>();
  sampleMCQQuestions.forEach((q) => map.set(q.id, q));
  try {
    const skList = loadShikshanKaushalAsMCQQuestions();
    skList.forEach((q) => map.set(q.id, q));
  } catch (err) {
    console.warn('[QuizQuestions] Failed to load Shikshan Kaushal batch questions:', err);
  }
  try {
    const sheetQuestions = getPublishedGoogleSheetQuestions();
    sheetQuestions.forEach((q) => {
      // Rule: Do not overwrite an existing local question having the same ID
      if (!map.has(q.id)) {
        map.set(q.id, q);
      }
    });
  } catch (err) {
    console.warn('[QuizQuestions] Failed to load Google Sheet questions:', err);
  }
  return Array.from(map.values());
}

function getIndexedQuestions(): Map<string, MCQQuestion> {
  const map = new Map<string, MCQQuestion>();
  sampleMCQQuestions.forEach((q) => map.set(q.id, q));
  try {
    const skList = loadShikshanKaushalAsMCQQuestions();
    skList.forEach((q) => map.set(q.id, q));
  } catch (err) {
    console.warn('[QuizQuestions] Failed to index Shikshan Kaushal questions:', err);
  }
  try {
    const sheetQuestions = getPublishedGoogleSheetQuestions();
    sheetQuestions.forEach((q) => {
      if (!map.has(q.id)) {
        map.set(q.id, q);
      }
    });
  } catch (err) {
    console.warn('[QuizQuestions] Failed to index Google Sheet questions:', err);
  }
  try {
    if (typeof window !== 'undefined') {
      const adminRaw = localStorage.getItem('examsetu4u_admin_content');
      if (adminRaw) {
        const parsed = JSON.parse(adminRaw);
        if (Array.isArray(parsed?.questions)) {
          parsed.questions.forEach((q: any) => {
            if (q && q.id && (q.status === 'PUBLISHED' || !q.status)) {
              map.set(q.id, {
                id: q.id,
                examId: q.examId,
                examName: q.examName,
                subjectId: q.subjectId,
                topicId: q.topicId,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || '',
                importantPoint: q.importantPoint,
                additionalFact: q.additionalFact,
                commonMistake: q.commonMistake,
                difficulty: q.difficulty || 'Moderate',
                sourceType: q.sourceType || 'Practice',
                year: q.year,
              });
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn('[QuizQuestions] Failed to index admin stored questions:', err);
  }
  return map;
}

export function getQuestionById(id: string): MCQQuestion | undefined {
  return getIndexedQuestions().get(id);
}

export function getQuestionsByIds(ids: string[]): MCQQuestion[] {
  const map = getIndexedQuestions();
  const list: MCQQuestion[] = [];
  for (const id of ids) {
    const q = map.get(id);
    if (q) list.push(q);
  }
  return list;
}

export function areExamsEquivalent(a?: string, b?: string): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a === b) return true;
  const normA = a.trim().toLowerCase().replace(/[\s_]+/g, '-');
  const normB = b.trim().toLowerCase().replace(/[\s_]+/g, '-');
  if (normA === normB) return true;
  const superTetAliases = new Set(['super-tet', 'supertet', 'super-tet-exam']);
  if (superTetAliases.has(normA) && superTetAliases.has(normB)) return true;
  return false;
}

export function areSubjectsEquivalent(a?: string, b?: string): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a === b) return true;
  const normA = a.trim().toLowerCase().replace(/[\s_]+/g, '-');
  const normB = b.trim().toLowerCase().replace(/[\s_]+/g, '-');
  if (normA === normB) return true;

  const skAliases = new Set([
    'shikshan-kaushal',
    'teaching-skills',
    'super-tet-teaching-skills',
    'super-tet-shikshan-kaushal',
  ]);
  if (skAliases.has(normA) && skAliases.has(normB)) return true;

  const cdpAliases = new Set([
    'bal-vikas-shikshan-vidhiyan',
    'bal-vikas',
    'child-development',
    'super-tet-child-development',
    'cdp',
    'super-tet-cdp',
    'super-tet-bal-vikas',
    'super-tet-bal-vikas-shikshan-vidhiyan',
  ]);
  if (cdpAliases.has(normA) && cdpAliases.has(normB)) return true;

  return false;
}

export function filterQuizQuestions(options: QuizFilterOptions): MCQQuestion[] {
  const { examId, subjectId, topicId, difficulty, count, random, search } = options;
  const query = (search || '').trim().toLowerCase();
  const allQuestions = getAllQuizQuestions();

  const isMatchingTopic = (qTopicId: string, filterTopicId?: string): boolean => {
    if (!filterTopicId || filterTopicId === 'all') return true;
    if (qTopicId === filterTopicId) return true;
    const normQ = qTopicId.trim().toLowerCase().replace(/[\s_]+/g, '-');
    const normFilter = filterTopicId.trim().toLowerCase().replace(/[\s_]+/g, '-');
    if (normQ === normFilter) return true;

    const resolvedFilter = resolveTopicId(filterTopicId) || normFilter;
    const resolvedQ = resolveTopicId(qTopicId) || normQ;
    if (resolvedFilter === resolvedQ) return true;

    // Child Development curriculum topics mapping:
    // super-tet-child-development-1 = 'बाल विकास के सिद्धांत'
    if (
      (normFilter === 'super-tet-child-development-1' || normFilter === 'bal-vikas-ke-siddhant') &&
      [
        'bal-vikas',
        'vikas-siddhant',
        'vanshanukram-vatavaran',
        'vyaktigat-bhinnata',
        'piaget',
        'vygotsky',
        'kohlberg',
        'erikson',
        'buddhi',
        'bahubuddhi',
        'srijanatmakta',
      ].includes(normQ)
    ) {
      return true;
    }

    // super-tet-child-development-2 = 'अधिगम और प्रेरणा'
    if (
      (normFilter === 'super-tet-child-development-2' || normFilter === 'adhigam-aur-prerna') &&
      [
        'adhigam',
        'adhigam-prerna',
        'behaviorism',
        'rachnavad',
        'mulyankan',
        'rachnatmak-mulyankan',
        'portfolio',
        'naidanik-mulyankan',
      ].includes(normQ)
    ) {
      return true;
    }

    // super-tet-child-development-3 = 'समावेशी शिक्षा'
    if (
      (normFilter === 'super-tet-child-development-3' || normFilter === 'samaveshi-shikshan') &&
      [
        'samaveshi-shikshan',
        'vishesh-avashyakta',
        'adhigam-kathinaiyan',
        'autism',
        'pratibhashali-vidyarthi',
        'bal-adhikar',
        'saman-avsar',
      ].includes(normQ)
    ) {
      return true;
    }

    return false;
  };

  let filtered = allQuestions.filter((q) => {
    if (examId && !areExamsEquivalent(q.examId, examId)) return false;
    if (subjectId && !areSubjectsEquivalent(q.subjectId, subjectId)) return false;
    if (topicId && !isMatchingTopic(q.topicId, topicId)) return false;
    if (difficulty && difficulty !== 'All' && q.difficulty !== difficulty) return false;
    if (query) {
      const matchText = `${q.question} ${q.options.A} ${q.options.B} ${q.options.C} ${q.options.D} ${q.explanation} ${q.importantPoint} ${q.id}`.toLowerCase();
      if (!matchText.includes(query)) return false;
    }
    return true;
  });

  // Create a copy so we never mutate the original dataset
  let result = [...filtered];

  if (random) {
    // Fisher-Yates shuffle
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
  }

  if (count && count > 0 && result.length > count) {
    result = result.slice(0, count);
  }

  return result;
}
