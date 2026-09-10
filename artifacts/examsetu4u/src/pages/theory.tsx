import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Compass,
  FileQuestion,
  GraduationCap,
  HelpCircle,
  Layers,
  Lightbulb,
  Play,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { Button, Card, Container, Layout } from '@/components/site';

interface TheoryItem {
  id: string;
  category: 'cdp' | 'teaching' | 'policy' | 'pedagogy';
  title: string;
  theorist: string;
  exam: string;
  summary: string;
  keyPoints: string[];
  examTips: string;
  studyUrl: string;
  quizUrl: string;
}

const THEORIES: TheoryItem[] = [
  {
    id: 'piaget-cognitive',
    category: 'cdp',
    title: 'जीन पियाजे: संज्ञानात्मक विकास सिद्धांत (Cognitive Development)',
    theorist: 'Jean Piaget (स्विट्ज़रलैंड)',
    exam: 'Super TET / CTET / UPTET',
    summary: 'बालक अपने ज्ञान का निर्माण स्वयं करता है (नन्हा वैज्ञानिक)। संज्ञानात्मक विकास 4 मुख्य अवस्थाओं में होता है।',
    keyPoints: [
      '1. संवेदी-गामक (Sensory-Motor): 0-2 वर्ष (वस्तु स्थायित्व / Object Permanence)',
      '2. पूर्व-संक्रियात्मक (Pre-Operational): 2-7 वर्ष (अहम-केंद्रित / Egocentrism, जीववाद)',
      '3. मूर्त संक्रियात्मक (Concrete): 7-11 वर्ष (संरक्षण / Conservation, वर्गीकरण)',
      '4. औपचारिक संक्रियात्मक (Formal): 11+ वर्ष (अमूर्त चिंतन / Abstract reasoning)',
    ],
    examTips: 'परीक्षा में "Object Permanence" और "Conservation (संरक्षण)" पर बार-बार प्रश्न आते हैं।',
    studyUrl: '/study-material/super-tet/child-dev/piaget-vygotsky',
    quizUrl: '/quiz/super-tet/child-dev/piaget-vygotsky',
  },
  {
    id: 'vygotsky-sociocultural',
    category: 'cdp',
    title: 'लेव वाइगोत्स्की: सामाजिक-सांस्कृतिक सिद्धांत (Socio-Cultural Theory)',
    theorist: 'Lev Vygotsky (रूस)',
    exam: 'Super TET / CTET / UPTET',
    summary: 'विकास में सामाजिक अंतःक्रिया (Social Interaction), भाषा और संस्कृति की केंद्रीय भूमिका होती है।',
    keyPoints: [
      'ZPD (Zone of Proximal Development): वास्तविक विकास स्तर और संभावित स्तर के बीच का अंतर।',
      'Scaffolding (पाड़/ढांचा): शिक्षक या वरिष्ठ द्वारा दी जाने वाली अस्थायी सहायता।',
      'MKO (More Knowledgeable Other): ज्ञानवान अन्य व्यक्ति (शिक्षक, सहपाठी)।',
      'Private Speech (निजी वाक): बालक अपने व्यवहार को दिशा देने के लिए स्वयं से बातें करता है।',
    ],
    examTips: 'Scaffolding और ZPD की परिभाषा तथा उदाहरण पर निश्चित रूप से प्रश्न पूछे जाते हैं।',
    studyUrl: '/study-material/super-tet/child-dev/piaget-vygotsky',
    quizUrl: '/quiz/super-tet/child-dev/piaget-vygotsky',
  },
  {
    id: 'kohlberg-moral',
    category: 'cdp',
    title: 'लॉरेंस कोहलबर्ग: नैतिक विकास का सिद्धांत (Moral Development)',
    theorist: 'Lawrence Kohlberg (USA)',
    exam: 'Super TET / CTET / UPTET',
    summary: 'नैतिक तर्क (Moral Reasoning) के 3 स्तर और 6 उप-अवस्थाएं हैं, जो हेइंज की दुविधा (Heinz Dilemma) पर आधारित हैं।',
    keyPoints: [
      'Level 1: पूर्व-पारंपरिक (Pre-conventional): दंड व आज्ञापालन, व्यक्तिगत प्रतिफल।',
      'Level 2: पारंपरिक (Conventional): अच्छा लड़का/अच्छी लड़की, कानून एवं व्यवस्था।',
      'Level 3: उत्तर-पारंपरिक (Post-conventional): सामाजिक अनुबंध, सार्वभौमिक नैतिक सिद्धांत।',
    ],
    examTips: 'कैरल गिलिगन द्वारा लैंगिक पूर्वाग्रह (Gender Bias) के आधार पर की गई आलोचना पर ध्यान दें।',
    studyUrl: '/study-material/super-tet/child-dev/piaget-vygotsky',
    quizUrl: '/quiz/super-tet/child-dev/piaget-vygotsky',
  },
  {
    id: 'blooms-taxonomy',
    category: 'teaching',
    title: 'ब्लूम का शैक्षिक उद्देश्यों का वर्गीकरण (Bloom\'s Taxonomy)',
    theorist: 'Benjamin Bloom (1956/2001)',
    exam: 'Super TET / CTET / शिक्षण कौशल',
    summary: 'ज्ञानात्मक (Cognitive), भावात्मक (Affective), और क्रियात्मक/मनोगामक (Psychomotor) डोमेन का पदानुक्रम।',
    keyPoints: [
      'ज्ञानात्मक क्षेत्र (Cognitive Revised 2001): याद करना → समझना → लागू करना → विश्लेषण → मूल्यांकन → सृजन (Create)।',
      'भावात्मक क्षेत्र (Krathwohl): आग्रहण, अनुक्रिया, अनुमूल्यन, संगठन, चारित्रीकरण।',
      'क्रियात्मक क्षेत्र (Simpson): प्रत्यक्षीकरण, व्यवस्था, निर्देशित अनुक्रिया, जटिल प्रत्यक्ष अनुक्रिया।',
    ],
    examTips: 'उच्च-स्तरीय सोच कौशल (HOTS): Analysis, Evaluation, और Creation।',
    studyUrl: '/study-material/super-tet/teaching-skills/teaching-methods',
    quizUrl: '/quiz/super-tet/teaching-skills/teaching-methods',
  },
  {
    id: 'nep-2020-rte',
    category: 'policy',
    title: 'राष्ट्रीय शिक्षा नीति (NEP 2020) एवं RTE Act 2009',
    theorist: 'कस्तूरीरंगन समिति / भारत सरकार',
    exam: 'Super TET / CTET / UPTET',
    summary: 'शिक्षा की नई संरचना 5+3+3+4, मातृभाषा में प्राथमिक शिक्षा, और 6-14 वर्ष के बच्चों के लिए निःशुल्क एवं अनिवार्य शिक्षा।',
    keyPoints: [
      '5+3+3+4 संरचना: Foundational (3-8 yr), Preparatory (8-11 yr), Middle (11-14 yr), Secondary (14-18 yr)।',
      'FLN (Foundational Literacy and Numeracy): कक्षा 3 तक बुनियादी साक्षरता और संख्याज्ञान।',
      'RTE 2009 धारा 21: विद्यालय प्रबंधन समिति (SMC) का गठन (75% अभिभावक)।',
      'छात्र-शिक्षक अनुपात: प्राथमिक स्तर 30:1, उच्च प्राथमिक 35:1।',
    ],
    examTips: 'RTE 2009 की महत्वपूर्ण धाराएं (12, 16, 21, 28) और NEP 2020 के PARAKH मूल्यांकन ढांचे पर सीधे प्रश्न आते हैं।',
    studyUrl: '/study-material/super-tet/teaching-skills/teaching-methods',
    quizUrl: '/quiz/super-tet/teaching-skills/teaching-methods',
  },
];

export default function TheoryGuidePage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'cdp' | 'teaching' | 'policy'>('all');

  const filteredTheories = THEORIES.filter((t) =>
    activeCategory === 'all' ? true : t.category === activeCategory
  );

  return (
    <Layout>
      {/* Header Section */}
      <section className="paper-grid border-b border-[hsl(var(--border))] py-8 sm:py-12">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'होम (Home)', href: '/' },
              { label: 'सिद्धांत एवं अवधारणा गाइड (Theory Guide)' },
            ]}
          />

          <div className="mt-6 max-w-3xl">
            <span className="eyebrow">Concept & Theory Handbook</span>
            <h1 className="font-display mt-2 text-3xl font-black text-[hsl(var(--primary))] sm:text-4xl">
              शैक्षिक सिद्धांत एवं मुख्य अवधारणाएं (Key Theories)
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-base">
              शिक्षक भर्ती परीक्षाओं (Super TET, CTET, UPTET) और प्रतियोगी परीक्षाओं के लिए सर्वाधिक महत्वपूर्ण बाल विकास, शिक्षण विधियों और शैक्षिक नीतियों के त्वरित पुनरावलोकन (Revision) नोट्स।
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12">
        <Container>
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-[hsl(var(--border))] pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mr-2">
              श्रेणी:
            </span>
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeCategory === 'all'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary)/.8)]'
              }`}
              data-testid="tab-theory-all"
            >
              सभी सिद्धांत ({THEORIES.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('cdp')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeCategory === 'cdp'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary)/.8)]'
              }`}
              data-testid="tab-theory-cdp"
            >
              बाल विकास सिद्धांत (CDP)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('teaching')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeCategory === 'teaching'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary)/.8)]'
              }`}
              data-testid="tab-theory-teaching"
            >
              शिक्षण कौशल एवं ब्लूम
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('policy')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                activeCategory === 'policy'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary)/.8)]'
              }`}
              data-testid="tab-theory-policy"
            >
              NEP 2020 एवं RTE 2009
            </button>
          </div>

          {/* Theory Cards */}
          <div className="mt-8 space-y-6">
            {filteredTheories.map((theory) => (
              <Card
                key={theory.id}
                className="p-6 sm:p-8 transition hover:border-[hsl(var(--accent))] shadow-sm"
                data-testid={`card-theory-${theory.id}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded-md bg-[hsl(var(--secondary))] px-2.5 py-0.5 font-bold text-[hsl(var(--primary))]">
                        {theory.theorist}
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))]">
                        {theory.exam}
                      </span>
                    </div>

                    <h2 className="font-display mt-2 text-xl font-bold text-[hsl(var(--primary))] sm:text-2xl">
                      {theory.title}
                    </h2>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--foreground))]">
                  {theory.summary}
                </p>

                {/* Key Points */}
                <div className="mt-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.35)] p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>मुख्य अवस्थाएं एवं बिंदु (Key Stages & Concepts):</span>
                  </h3>
                  <ul className="mt-2.5 space-y-1.5 text-xs sm:text-sm text-[hsl(var(--foreground))]">
                    {theory.keyPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[hsl(var(--accent-foreground))] font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exam Tip Alert */}
                <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                  <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <strong className="font-bold">परीक्षा टिप (Exam Tip): </strong>
                    <span>{theory.examTips}</span>
                  </div>
                </div>

                {/* Action Links */}
                <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-[hsl(var(--border))] pt-4">
                  <Button
                    href={theory.studyUrl}
                    variant="secondary"
                    className="text-xs min-h-9"
                    data-testid={`button-study-theory-${theory.id}`}
                  >
                    <BookOpen size={14} />
                    <span>विस्तृत नोट्स पढ़ें</span>
                  </Button>

                  <Button
                    href={theory.quizUrl}
                    variant="primary"
                    className="text-xs min-h-9"
                    data-testid={`button-quiz-theory-${theory.id}`}
                  >
                    <Play size={14} />
                    <span>क्विज़ में अभ्यास करें</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </Layout>
  );
}
