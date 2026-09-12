import {
  Clock,
  Filter,
  GraduationCap,
  History,
  Layers,
  Search,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { MockTestCard } from '@/components/mock-test/MockTestCard';
import { Button, Card, Footer, Header, SectionHeading } from '@/components/site';
import { exams } from '@/data/curriculum';
import { getAllMockTests } from '@/data/mock/tests';
import type { MockTestType } from '@/data/mock/types';
import { loadMockAttempts } from '@/lib/mock-test-storage';

export default function MockTestsListPage() {
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allTests = useMemo(() => getAllMockTests(), []);
  const attempts = useMemo(() => loadMockAttempts(), []);

  // Filter mock tests
  const filteredTests = useMemo(() => {
    return allTests.filter((test) => {
      if (selectedExam !== 'all' && test.examId !== selectedExam) {
        // Support alias matching
        if (selectedExam === 'cbse-10' && test.examId === 'cbse-class-10') return true;
        if (selectedExam === 'cbse-12' && test.examId === 'cbse-class-12') return true;
        return false;
      }
      if (selectedType !== 'all' && test.testType !== selectedType) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const match =
          test.title.toLowerCase().includes(query) ||
          test.description.toLowerCase().includes(query) ||
          test.examId.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });
  }, [allTests, selectedExam, selectedType, searchQuery]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Link href="/" className="hover:text-blue-700 transition">होम</Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">मॉक टेस्ट (Mock Tests)</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              href="/mock-tests/history"
              variant="outline"
              className="text-xs min-h-8 py-1 px-3 font-semibold border-slate-200 hover:border-blue-300"
              data-testid="link-mock-history"
            >
              <History size={14} className="text-blue-700" />
              <span>प्रयास इतिहास ({attempts.length})</span>
            </Button>
          </div>
        </div>

        {/* Page Hero Header - Prepare with purpose theme */}
        <div className="hero-wash rounded-3xl border border-white/20 p-6 sm:p-10 text-white shadow-xl">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-500/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur-xs">
              <GraduationCap size={14} className="text-blue-300" />
              <span>रियल एग्जाम एनवायरनमेंट (Real Exam Mode)</span>
            </div>
            <h1 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              फुल मॉक टेस्ट और <span className="text-blue-300">रियल एग्जाम मोड</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl">
              सुपर टीईटी, एसएससी सीजीएल, सीबीएसई बोर्ड और यूपीपीसीएस के लिए समय-बद्ध परीक्षा सिमुलेशन।
              नेगेटिव मार्किंग, क्वेश्चन पैलेट, सब्जेक्ट-वाइज एक्यूरेसी और मिस्टेक बुक इंटीग्रेशन के साथ अभ्यास करें।
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-white/15 pt-6 text-xs sm:text-sm">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs">
              <span className="text-blue-200 text-xs">उपलब्ध मॉक टेस्ट:</span>
              <p className="mt-0.5 text-xl font-extrabold text-white">{allTests.length} टेस्ट्स</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs">
              <span className="text-blue-200 text-xs">कवर की गई परीक्षाएं:</span>
              <p className="mt-0.5 text-xl font-extrabold text-white">{exams.length} मुख्य परीक्षाएं</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs">
              <span className="text-blue-200 text-xs">आपके कुल प्रयास:</span>
              <p className="mt-0.5 text-xl font-extrabold text-white">{attempts.length} बार</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xs">
              <span className="text-blue-200 text-xs">परीक्षा मोड्स:</span>
              <p className="mt-0.5 text-xl font-extrabold text-white">फुल, सेक्शनल व स्पीड</p>
            </div>
          </div>
        </div>

        {/* Exam Quick Select Pills */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">परीक्षा अनुसार फ़िल्टर करें:</h2>
            <span className="text-xs text-slate-500">
              {filteredTests.length} टेस्ट उपलब्ध
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedExam('all')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedExam === 'all'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
              }`}
              data-testid="filter-exam-all"
            >
              सभी परीक्षाएं (All Exams)
            </button>
            {exams.map((exam) => (
              <button
                key={exam.id}
                onClick={() => setSelectedExam(exam.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  selectedExam === exam.id
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
                }`}
                data-testid={`filter-exam-${exam.id}`}
              >
                {exam.name}
              </button>
            ))}
          </div>
        </div>

        {/* Type & Search Filter Controls */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 mr-1">टेस्ट प्रकार:</span>
            {[
              { id: 'all', label: 'सभी' },
              { id: 'full', label: 'फुल लेंथ' },
              { id: 'subject', label: 'सब्जेक्ट टेस्ट' },
              { id: 'practice', label: 'स्पीड/अभ्यास' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  selectedType === type.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="मॉक टेस्ट खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
              data-testid="input-search-mock"
            />
          </div>
        </div>

        {/* Mock Test Cards Grid */}
        <div className="mt-6">
          {filteredTests.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredTests.map((test) => (
                <MockTestCard key={test.id} test={test} />
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <Filter size={36} className="text-slate-400 mb-3 opacity-60" />
              <h3 className="font-display text-lg font-bold text-slate-900">
                कोई मॉक टेस्ट नहीं मिला
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                आपके द्वारा चुने गए फ़िल्टर या खोज के अनुरूप कोई मॉक टेस्ट उपलब्ध नहीं है। कृपया फ़िल्टर रीसेट करें।
              </p>
              <Button
                variant="outline"
                className="mt-4 text-xs font-semibold"
                onClick={() => {
                  setSelectedExam('all');
                  setSelectedType('all');
                  setSearchQuery('');
                }}
              >
                फ़िल्टर रीसेट करें
              </Button>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
