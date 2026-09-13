import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Search,
  Filter,
  ArrowRight,
  Bookmark,
  Share2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  TrendingUp,
  MapPin,
  Layers,
  FileText,
} from 'lucide-react';
import {
  UPPCS_DAILY_CURRENT_AFFAIRS,
  UPPCS_WEEKLY_ROUNDUPS,
  UPPCS_MONTHLY_DOSSIERS,
  UPPCS_YEARLY_COMPILATIONS,
  type CurrentAffairsQuizQuestion,
  type CurrentAffairItem,
} from '@/data/current-affairs/uppcs-data';

interface CurrentAffairsHubProps {
  initialTab?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  standalone?: boolean;
}

export function CurrentAffairsHub({ initialTab = 'daily', standalone = false }: CurrentAffairsHubProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(initialTab);
  const [activeMode, setActiveMode] = useState<'notes' | 'quiz'>('notes');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Daily State & Date-wise Navigation
  const [selectedDailyDate, setSelectedDailyDate] = useState<string>(UPPCS_DAILY_CURRENT_AFFAIRS[0].date);
  const [showDateArchive, setShowDateArchive] = useState<boolean>(false);

  // Weekly State
  const [selectedWeeklyId, setSelectedWeeklyId] = useState<string>(UPPCS_WEEKLY_ROUNDUPS[0].id);
  const [weeklyYearFilter, setWeeklyYearFilter] = useState<number>(2026);

  // Monthly State
  const [selectedMonthlyId, setSelectedMonthlyId] = useState<string>(UPPCS_MONTHLY_DOSSIERS[0].id);
  const [monthlyYearFilter, setMonthlyYearFilter] = useState<number>(2026);

  // Daily Archive Filter State
  const [dailyMonthFilter, setDailyMonthFilter] = useState<string>('ALL');

  // Yearly State
  const [selectedYearlyId, setSelectedYearlyId] = useState<string>(UPPCS_YEARLY_COMPILATIONS[0].id);

  // Quiz Interaction State
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [submittedQuizIds, setSubmittedQuizIds] = useState<Set<string>>(new Set());

  // Date-wise navigation calculations
  const currentDailyIndex = useMemo(() => {
    return UPPCS_DAILY_CURRENT_AFFAIRS.findIndex((d) => d.date === selectedDailyDate);
  }, [selectedDailyDate]);

  const hasNewerDay = currentDailyIndex > 0;
  const hasOlderDay = currentDailyIndex < UPPCS_DAILY_CURRENT_AFFAIRS.length - 1;

  const handlePrevDay = () => {
    if (hasOlderDay) {
      setSelectedDailyDate(UPPCS_DAILY_CURRENT_AFFAIRS[currentDailyIndex + 1].date);
      setUserAnswers({});
    }
  };

  const handleNextDay = () => {
    if (hasNewerDay) {
      setSelectedDailyDate(UPPCS_DAILY_CURRENT_AFFAIRS[currentDailyIndex - 1].date);
      setUserAnswers({});
    }
  };

  const formatShortDate = (dateStr: string, idx: number) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[parseInt(parts[1], 10) - 1] || 'Feb';
      if (idx === 0) return `${day} ${month} (आज)`;
      return `${day} ${month}`;
    }
    return dateStr;
  };

  // Current active daily data
  const currentDaily = useMemo(() => {
    return (
      UPPCS_DAILY_CURRENT_AFFAIRS.find((d) => d.date === selectedDailyDate) ||
      UPPCS_DAILY_CURRENT_AFFAIRS[0]
    );
  }, [selectedDailyDate]);

  // Current active weekly data
  const currentWeekly = useMemo(() => {
    return (
      UPPCS_WEEKLY_ROUNDUPS.find((w) => w.id === selectedWeeklyId) ||
      UPPCS_WEEKLY_ROUNDUPS[0]
    );
  }, [selectedWeeklyId]);

  // Current active monthly data
  const currentMonthly = useMemo(() => {
    return (
      UPPCS_MONTHLY_DOSSIERS.find((m) => m.id === selectedMonthlyId) ||
      UPPCS_MONTHLY_DOSSIERS[0]
    );
  }, [selectedMonthlyId]);

  // Current active yearly data
  const currentYearly = useMemo(() => {
    return (
      UPPCS_YEARLY_COMPILATIONS.find((y) => y.id === selectedYearlyId) ||
      UPPCS_YEARLY_COMPILATIONS[0]
    );
  }, [selectedYearlyId]);

  // Active quiz questions based on tab
  const activeQuizQuestions: CurrentAffairsQuizQuestion[] = useMemo(() => {
    if (activeTab === 'daily') return currentDaily.dailyQuiz;
    if (activeTab === 'weekly') return currentWeekly.quiz;
    if (activeTab === 'monthly') return currentMonthly.mockTest;
    if (activeTab === 'yearly') return currentYearly.megaQuiz;
    return [];
  }, [activeTab, currentDaily, currentWeekly, currentMonthly, currentYearly]);

  // Filtered daily items
  const filteredDailyItems = useMemo(() => {
    return currentDaily.items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory;
      const summaryMatches = Array.isArray(item.summary)
        ? item.summary.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
        : typeof item.summary === 'string'
        ? (item.summary as string).toLowerCase().includes(searchQuery.toLowerCase())
        : false;
      const tagsMatches = Array.isArray(item.tags)
        ? item.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
        : false;
      const matchesQuery =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summaryMatches ||
        tagsMatches;
      return matchesCategory && matchesQuery;
    });
  }, [currentDaily, selectedCategory, searchQuery]);

  // Handle quiz answer selection
  const handleSelectAnswer = (qId: string, option: 'A' | 'B' | 'C' | 'D') => {
    setUserAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setSubmittedQuizIds(new Set());
  };

  // Calculate score for active quiz
  const quizScore = useMemo(() => {
    let correct = 0;
    let attempted = 0;
    activeQuizQuestions.forEach((q) => {
      if (userAnswers[q.id]) {
        attempted++;
        if (userAnswers[q.id] === q.correctAnswer) {
          correct++;
        }
      }
    });
    return { correct, attempted, total: activeQuizQuestions.length };
  }, [activeQuizQuestions, userAnswers]);

  return (
    <div id="uppcs-current-affairs-hub" className="w-full">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-200/90 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-400/20 border border-violet-300/40 px-3 py-0.5 text-xs font-bold text-violet-200 backdrop-blur-xs">
                <Sparkles size={13} className="text-violet-300" /> UPPCS Pre 2025-26 Special
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 border border-emerald-300/40 px-3 py-0.5 text-xs font-bold text-emerald-200">
                <CheckCircle2 size={13} /> 100% Exam-Oriented Notes & MCQ
              </span>
            </div>
            <h2 className="font-display mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              समसामयिकी एवं करेंट अफेयर्स केंद्र
            </h2>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-indigo-100/90">
              UPPCS प्रारंभिक परीक्षा के सामान्य अध्ययन (GS Paper-1) हेतु दैनिक, साप्ताहिक, मासिक व वार्षिकी नोट्स, उत्तर प्रदेश विशेषांक और त्वरित अभ्यास क्विज़।
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">दैनिक अपडेट</p>
              <p className="mt-0.5 text-lg font-black text-white">हर सुबह 7 AM</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
              <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">यूपी विशेषांक</p>
              <p className="mt-0.5 text-lg font-black text-violet-200">बजट + योजनाएं</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Format Selector Tabs (Daily, Weekly, Monthly, Yearly) */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 p-1.5 rounded-xl border border-indigo-200/90 bg-[#f4f2ff] dark:bg-[#15123a] dark:border-indigo-900/80">
          <button
            onClick={() => {
              setActiveTab('daily');
              setUserAnswers({});
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeTab === 'daily'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/60'
            }`}
          >
            <Calendar size={15} /> दैनिक (Daily)
          </button>
          <button
            onClick={() => {
              setActiveTab('weekly');
              setUserAnswers({});
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeTab === 'weekly'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/60'
            }`}
          >
            <Clock size={15} /> साप्ताहिक (Weekly)
          </button>
          <button
            onClick={() => {
              setActiveTab('monthly');
              setUserAnswers({});
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeTab === 'monthly'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/60'
            }`}
          >
            <BookOpen size={15} /> मासिक (Monthly)
          </button>
          <button
            onClick={() => {
              setActiveTab('yearly');
              setUserAnswers({});
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition ${
              activeTab === 'yearly'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-indigo-950/60'
            }`}
          >
            <Award size={15} /> वार्षिकी व यूपी स्पेशल (Yearly)
          </button>
        </div>

        {/* View Mode Switcher: Notes vs Quiz */}
        <div className="flex items-center gap-1 rounded-xl border border-indigo-200 bg-white dark:bg-slate-900 p-1 shadow-2xs">
          <button
            onClick={() => setActiveMode('notes')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeMode === 'notes'
                ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-800'
            }`}
          >
            <FileText size={14} /> अध्ययन नोट्स (Notes)
          </button>
          <button
            onClick={() => setActiveMode('quiz')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeMode === 'quiz'
                ? 'bg-violet-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-violet-800'
            }`}
          >
            <HelpCircle size={14} /> अभ्यास क्विज़ ({activeQuizQuestions.length} Qs)
          </button>
        </div>
      </div>

      {/* 3. Sub-Navigation (Dates / Weeks / Months) */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-[#f8f7ff] dark:bg-[#120f30] dark:border-indigo-950 p-3">
        {activeTab === 'daily' && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1">
              <Calendar size={13} /> दिनांक चुनें:
            </span>

            {/* Stepper: Previous Day */}
            <button
              onClick={handlePrevDay}
              disabled={!hasOlderDay}
              className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-bold text-indigo-900 dark:text-indigo-200 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition"
              title="पिछली तारीख (पुराना दिन)"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">पिछला</span>
            </button>

            {/* Date Pills */}
            <div className="flex flex-wrap gap-1.5">
              {UPPCS_DAILY_CURRENT_AFFAIRS.map((d, idx) => (
                <button
                  key={d.date}
                  onClick={() => {
                    setSelectedDailyDate(d.date);
                    setUserAnswers({});
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    selectedDailyDate === d.date
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-indigo-900 dark:bg-slate-800 dark:text-indigo-200 border border-indigo-200/80 hover:bg-indigo-50'
                  }`}
                >
                  {formatShortDate(d.date, idx)}
                </button>
              ))}
            </div>

            {/* Stepper: Next Day */}
            <button
              onClick={handleNextDay}
              disabled={!hasNewerDay}
              className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-bold text-indigo-900 dark:text-indigo-200 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition"
              title="अगली तारीख (नया दिन)"
            >
              <span className="hidden sm:inline">अगला</span>
              <ChevronRight size={14} />
            </button>

            {/* Date Dropdown Select */}
            <select
              value={selectedDailyDate}
              onChange={(e) => {
                setSelectedDailyDate(e.target.value);
                setUserAnswers({});
              }}
              className="rounded-lg border border-indigo-200 bg-white dark:bg-slate-800 dark:border-indigo-800 px-2.5 py-1 text-xs font-bold text-indigo-950 dark:text-indigo-100 shadow-2xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {UPPCS_DAILY_CURRENT_AFFAIRS.map((d, idx) => (
                <option key={d.date} value={d.date}>
                  {idx === 0 ? `आज - ${d.formattedDate.split('(')[0].trim()}` : d.formattedDate.split('(')[0].trim()}
                </option>
              ))}
            </select>

            {/* Toggle Full Date Archive Grid */}
            <button
              onClick={() => setShowDateArchive(!showDateArchive)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                showDateArchive
                  ? 'bg-indigo-900 text-white shadow-2xs'
                  : 'border border-indigo-300 bg-indigo-50 dark:bg-slate-800 text-indigo-900 dark:text-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <CalendarDays size={14} />
              <span>{showDateArchive ? 'पुरालेख बंद करें' : 'तिथि पुरालेख'}</span>
            </button>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">वर्ष:</span>
              <div className="flex rounded-lg bg-indigo-100/70 dark:bg-slate-800 p-0.5">
                {[2026, 2025].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => {
                      setWeeklyYearFilter(yr);
                      const first = UPPCS_WEEKLY_ROUNDUPS.find((w) => w.weekLabel.includes(String(yr)));
                      if (first) {
                        setSelectedWeeklyId(first.id);
                        setUserAnswers({});
                      }
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                      weeklyYearFilter === yr
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-indigo-900 dark:text-indigo-200 hover:text-indigo-600'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 shrink-0">सप्ताह चुनें:</span>
              <div className="flex flex-wrap gap-1.5">
                {UPPCS_WEEKLY_ROUNDUPS.filter((w) => w.weekLabel.includes(String(weeklyYearFilter))).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setSelectedWeeklyId(w.id);
                      setUserAnswers({});
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      selectedWeeklyId === w.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-indigo-900 dark:bg-slate-800 dark:text-indigo-200 border border-indigo-200/80 hover:bg-indigo-50'
                    }`}
                  >
                    {w.weekLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'monthly' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">वर्ष:</span>
              <div className="flex rounded-lg bg-indigo-100/70 dark:bg-slate-800 p-0.5">
                {[2026, 2025].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => {
                      setMonthlyYearFilter(yr);
                      const first = UPPCS_MONTHLY_DOSSIERS.find((m) => m.year === yr);
                      if (first) {
                        setSelectedMonthlyId(first.id);
                        setUserAnswers({});
                      }
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                      monthlyYearFilter === yr
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-indigo-900 dark:text-indigo-200 hover:text-indigo-600'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 shrink-0">माह चुनें:</span>
              <div className="flex flex-wrap gap-1.5">
                {UPPCS_MONTHLY_DOSSIERS.filter((m) => m.year === monthlyYearFilter).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMonthlyId(m.id);
                      setUserAnswers({});
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      selectedMonthlyId === m.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-indigo-900 dark:bg-slate-800 dark:text-indigo-200 border border-indigo-200/80 hover:bg-indigo-50'
                    }`}
                  >
                    {m.month} {m.year} विशेषांक
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'yearly' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">वार्षिकी संकलन:</span>
            <div className="flex flex-wrap gap-1.5">
              {UPPCS_YEARLY_COMPILATIONS.map((y) => (
                <button
                  key={y.id}
                  onClick={() => {
                    setSelectedYearlyId(y.id);
                    setUserAnswers({});
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    selectedYearlyId === y.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-indigo-900 dark:bg-slate-800 dark:text-indigo-200 border border-indigo-200/80 hover:bg-indigo-50'
                  }`}
                >
                  {y.title.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search inside section */}
        {activeMode === 'notes' && (
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="टॉपिक या कीवर्ड खोजें..."
              className="w-full rounded-lg border border-indigo-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:bg-slate-800 dark:border-indigo-800 dark:text-white"
            />
          </div>
        )}
      </div>

      {/* Date Archive Drawer / Calendar View for Daily Affairs */}
      {activeTab === 'daily' && showDateArchive && (
        <div className="mt-4 rounded-2xl border-2 border-indigo-200 bg-[#f6f5ff] dark:bg-[#15123d] dark:border-indigo-900 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-indigo-200/80 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-sm sm:text-base font-extrabold text-indigo-950 dark:text-indigo-100">
                दैनिक समसामयिकी पुरालेख (Date-wise Current Affairs Archive)
              </h4>
            </div>
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
              कुल {UPPCS_DAILY_CURRENT_AFFAIRS.length} तिथियां उपलब्ध
            </span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            प्रत्येक दिन के महत्वपूर्ण राष्ट्रीय, अंतर्राष्ट्रीय और उत्तर प्रदेश विशेष घटनाक्रमों के विस्तृत नोट्स पढ़ने या उस विशिष्ट तारीख की 5-प्रश्नों की डेली ड्रिल क्विज़ हल करने हेतु नीचे दी गई तिथि चुनें:
          </p>

          {/* Quick Month Filter Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-indigo-200/60 dark:border-indigo-900/60">
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 mr-1">माह चुनें:</span>
            {[
              { label: 'सभी (2026 व 2025)', val: 'ALL' },
              { label: 'सितंबर 2026', val: '2026-09' },
              { label: 'अगस्त 2026', val: '2026-08' },
              { label: 'जुलाई 2026', val: '2026-07' },
              { label: 'जून 2026', val: '2026-06' },
              { label: 'मई 2026', val: '2026-05' },
              { label: 'अप्रैल 2026', val: '2026-04' },
              { label: 'मार्च 2026', val: '2026-03' },
              { label: 'फ़रवरी 2026', val: '2026-02' },
              { label: 'जनवरी 2026', val: '2026-01' },
              { label: 'फ़रवरी 2025', val: '2025-02' },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => setDailyMonthFilter(f.val)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  dailyMonthFilter === f.val
                    ? 'bg-indigo-700 text-white shadow-2xs'
                    : 'bg-white text-indigo-900 dark:bg-slate-800 dark:text-indigo-200 border border-indigo-200 hover:bg-indigo-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {UPPCS_DAILY_CURRENT_AFFAIRS.filter((d) => dailyMonthFilter === 'ALL' || d.date.startsWith(dailyMonthFilter)).map((dayData, idx) => {
              const isSelected = selectedDailyDate === dayData.date;
              return (
                <div
                  key={dayData.date}
                  className={`rounded-xl border p-4 transition ${
                    isSelected
                      ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-indigo-200/80 bg-white/80 dark:bg-slate-900/80 hover:border-indigo-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-indigo-950 dark:text-white">
                      {dayData.formattedDate.split('(')[0].trim()}
                    </span>
                    {idx === 0 ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        नवीनतम (Today)
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-500">
                        {dayData.date}
                      </span>
                    )}
                  </div>

                  {/* Headlines Preview */}
                  <ul className="mt-2.5 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {dayData.items.slice(0, 2).map((it) => (
                      <li key={it.id} className="flex items-start gap-1.5 text-[11px] leading-tight">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />
                        <span className="line-clamp-2">{it.title}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Quick Actions */}
                  <div className="mt-3.5 flex items-center gap-2 pt-2.5 border-t border-indigo-100 dark:border-indigo-950">
                    <button
                      onClick={() => {
                        setSelectedDailyDate(dayData.date);
                        setActiveMode('notes');
                        setShowDateArchive(false);
                      }}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold text-center transition ${
                        isSelected && activeMode === 'notes'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 dark:bg-slate-800 dark:text-indigo-200'
                      }`}
                    >
                      नोट्स ({dayData.items.length})
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDailyDate(dayData.date);
                        setActiveMode('quiz');
                        setShowDateArchive(false);
                        setUserAnswers({});
                      }}
                      className={`flex-1 rounded-lg py-1.5 text-xs font-bold text-center transition ${
                        isSelected && activeMode === 'quiz'
                          ? 'bg-violet-600 text-white'
                          : 'bg-violet-50 text-violet-900 hover:bg-violet-100 dark:bg-slate-800 dark:text-violet-200'
                      }`}
                    >
                      क्विज़ ({dayData.dailyQuiz.length} Qs)
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. MAIN CONTENT AREA */}
      <div className="mt-6">
        {/* ========================================================= */}
        {/* A. NOTES VIEW */}
        {/* ========================================================= */}
        {activeMode === 'notes' && (
          <div className="space-y-6">
            {/* 1. DAILY NOTES */}
            {activeTab === 'daily' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-indigo-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">
                        <Calendar size={13} /> दिनांक: {currentDaily.date}
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-indigo-950 dark:text-indigo-100">
                        {currentDaily.formattedDate}
                      </h3>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      UPPCS प्री-ओरिएंटेड तथ्य, 'परीक्षा दृष्टि' प्वाइंटर्स व स्टेटिक जीएस लिंकेज
                    </p>
                  </div>

                  {/* Day-by-Day Stepper Navigation in Header */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevDay}
                      disabled={!hasOlderDay}
                      className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition"
                      title="पिछली तारीख"
                    >
                      <ChevronLeft size={14} /> पिछला दिन
                    </button>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {filteredDailyItems.length} विषय
                    </span>
                    <button
                      onClick={handleNextDay}
                      disabled={!hasNewerDay}
                      className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-200 hover:bg-indigo-50 disabled:opacity-30 disabled:pointer-events-none transition"
                      title="अगली तारीख"
                    >
                      अगला दिन <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {filteredDailyItems.map((item, idx) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border-2 border-indigo-200/80 bg-[#fbfaff] dark:bg-[#16133b] dark:border-indigo-900 p-6 shadow-xs hover:border-indigo-400 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
                        {item.categoryLabel}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {item.date}
                      </span>
                    </div>

                    <h4 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                      {idx + 1}. {item.title}
                    </h4>

                    {/* Summary Bullet Points */}
                    <div className="mt-3 space-y-2">
                      {(Array.isArray(item.summary) ? item.summary : [item.summary]).map((point, pIdx) => (
                        <p key={pIdx} className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                          <span>{point}</span>
                        </p>
                      ))}
                    </div>

                    {/* Why Important for UPPCS (Exam Relevance) */}
                    {item.why_important_for_uppcs && (
                      <div className="mt-3.5 rounded-xl border border-indigo-200/90 bg-indigo-50/70 p-3.5 dark:bg-indigo-950/40 dark:border-indigo-800/60 text-xs">
                        <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-indigo-600 dark:text-indigo-400" />
                          <span>UPPCS परीक्षा दृष्टिकोण (Exam Significance):</span>
                        </div>
                        <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                          {item.why_important_for_uppcs}
                        </p>
                      </div>
                    )}

                    {/* Uttar Pradesh Specific Relevance */}
                    {item.uttar_pradesh_relevance && (
                      <div className="mt-2.5 rounded-xl border border-emerald-200/90 bg-emerald-50/70 p-3.5 dark:bg-emerald-950/40 dark:border-emerald-800/60 text-xs">
                        <div className="font-bold text-emerald-950 dark:text-emerald-200 flex items-center gap-1.5">
                          <MapPin size={13} className="text-emerald-600 dark:text-emerald-400" />
                          <span>उत्तर प्रदेश विशेष प्रासंगिकता (UP State Impact):</span>
                        </div>
                        <p className="mt-1 text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed text-xs sm:text-sm">
                          {item.uttar_pradesh_relevance}
                        </p>
                      </div>
                    )}

                    {/* UPPCS Pre Focus (परीक्षा दृष्टि) Box */}
                    {((item.uppcsPreFocus && item.uppcsPreFocus.length > 0) || (item.prelims_facts && item.prelims_facts.length > 0)) && (
                      <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50/70 p-4 dark:bg-amber-950/30 dark:border-amber-800/60">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
                          <Sparkles size={14} className="text-amber-600" />
                          परीक्षा दृष्टि (UPPCS Pre Focus Pointers):
                        </div>
                        <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-amber-950 dark:text-amber-100">
                          {(item.uppcsPreFocus || item.prelims_facts || []).map((focus, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <span className="font-bold text-amber-700">▸</span>
                              <span>{focus}</span>
                            </li>
                          ))}
                        </ul>
                        {item.staticLinkage && (
                          <p className="mt-2.5 text-[11px] font-semibold text-amber-800/90 dark:text-amber-300/80 border-t border-amber-200 dark:border-amber-800/40 pt-1.5">
                            <span className="font-bold">विषय जुड़ाव:</span> {item.staticLinkage}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Authoritative Source Badge & Link */}
                    {item.source && (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-indigo-100 dark:border-indigo-950/80 pt-2.5 text-[11px] text-slate-500">
                        <span className="font-medium flex items-center gap-1">
                          आधिकारिक स्रोत: <strong className="text-slate-700 dark:text-slate-300">{item.source}</strong>
                        </span>
                        {item.source_url && (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                          >
                            <span>विज्ञप्ति / स्रोत लिंक</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span key={tag} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}

            {/* 2. WEEKLY ROUNDUP NOTES */}
            {activeTab === 'weekly' && (
              <div className="space-y-6">
                <div className="rounded-2xl border-2 border-indigo-200/80 bg-[#f4f2ff] dark:bg-[#16133b] p-6">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                    साप्ताहिक सारांश (Weekly Capsule)
                  </span>
                  <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                    {currentWeekly.weekLabel} ({currentWeekly.dateRange})
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-indigo-900/80 dark:text-indigo-200">
                    {currentWeekly.theme}
                  </p>
                </div>

                <div className="grid gap-5">
                  {currentWeekly.highlights.map((sec, sIdx) => (
                    <div
                      key={sIdx}
                      className="rounded-xl border border-indigo-100 bg-white dark:bg-slate-900 dark:border-indigo-900/60 p-5 shadow-xs"
                    >
                      <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-900 dark:text-indigo-200 border-b border-indigo-100 dark:border-indigo-900 pb-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 text-[11px] font-black text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          {sIdx + 1}
                        </span>
                        {sec.category}
                      </h4>
                      <ul className="mt-3 space-y-2.5">
                        {sec.points.map((p, pIdx) => (
                          <li key={pIdx} className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. MONTHLY DOSSIER NOTES */}
            {activeTab === 'monthly' && (
              <div className="space-y-6">
                <div className="rounded-2xl border-2 border-indigo-200/90 bg-[#f4f2ff] dark:bg-[#16133b] p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-violet-700 dark:text-violet-300">
                        मासिक समसामयिकी विशेषांक (Monthly Dossier)
                      </span>
                      <h3 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {currentMonthly.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => alert('मासिक ई-पत्रिका नोट्स ऑफलाइन रिवीजन हेतु सुरक्षित हो गए हैं।')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                    >
                      <BookOpen size={14} /> ई-पत्रिका डाउनलोड / सेव
                    </button>
                  </div>
                </div>

                <div className="space-y-5">
                  {currentMonthly.sections.map((sec, secIdx) => (
                    <div
                      key={secIdx}
                      className="rounded-2xl border border-indigo-100 bg-white dark:bg-slate-900 dark:border-indigo-900/60 p-6 shadow-xs"
                    >
                      <h4 className="text-base font-bold text-indigo-950 dark:text-white border-b border-indigo-100 pb-2">
                        {sec.title}
                      </h4>
                      <div className="mt-4 space-y-2">
                        {sec.content.map((para, pIdx) => (
                          <p key={pIdx} className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                            {para}
                          </p>
                        ))}
                      </div>

                      {/* Key Facts Box */}
                      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/30 dark:border-emerald-800/60 p-4">
                        <p className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                          महत्वपूर्ण तथ्य (Fast Facts for Prelims):
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-emerald-950 dark:text-emerald-100">
                          {sec.keyFacts.map((fact, fIdx) => (
                            <li key={fIdx} className="flex items-center gap-1.5">
                              <span className="font-bold text-emerald-600">✓</span> {fact}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. YEARLY COMPILATIONS & UP SPECIAL NOTES */}
            {activeTab === 'yearly' && (
              <div className="space-y-6">
                <div className="rounded-2xl border-2 border-indigo-200/90 bg-[#f4f2ff] dark:bg-[#16133b] p-6">
                  <span className="inline-block rounded-md bg-indigo-600 px-2.5 py-0.5 text-[11px] font-black text-white">
                    {currentYearly.badge}
                  </span>
                  <h3 className="mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {currentYearly.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {currentYearly.subtitle}
                  </p>
                </div>

                <div className="space-y-5">
                  {currentYearly.topics.map((t, tIdx) => (
                    <div
                      key={tIdx}
                      className="rounded-2xl border border-indigo-100 bg-white dark:bg-slate-900 dark:border-indigo-900/60 p-6 shadow-xs"
                    >
                      <h4 className="text-base font-bold text-indigo-950 dark:text-white border-b border-indigo-100 pb-2">
                        {t.heading}
                      </h4>
                      <ul className="mt-4 space-y-2">
                        {t.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 flex items-start gap-2">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>

                      {t.prelimsCaution && (
                        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-950 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-100">
                          <span className="font-bold text-rose-700">⚠️ परीक्षा सावधानी (Prelims Trap):</span>{' '}
                          {t.prelimsCaution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* B. INTERACTIVE QUIZ VIEW */}
        {/* ========================================================= */}
        {activeMode === 'quiz' && (
          <div className="space-y-6">
            {/* Quiz Progress & Score Header */}
            <div className="rounded-2xl border-2 border-indigo-200/90 bg-[#f4f2ff] dark:bg-[#16133b] p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      {activeTab === 'daily' && `दैनिक समसामयिकी क्विज़ — ${currentDaily.formattedDate.split('(')[0].trim()}`}
                      {activeTab === 'weekly' && 'साप्ताहिक रिवीजन टेस्ट'}
                      {activeTab === 'monthly' && 'मासिक करेंट अफेयर्स मॉक'}
                      {activeTab === 'yearly' && 'वार्षिकी मेगा टेस्ट'}
                    </span>
                    {activeTab === 'daily' && (
                      <span className="rounded-md bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-300">
                        {currentDaily.date}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                    UPPCS Pre पैटर्न बहुविकल्पीय प्रश्नोत्तरी (MCQ Drill)
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    प्रत्येक प्रश्न के बाद तुरंत सही उत्तर और विस्तृत ‘परीक्षा दृष्टि’ व्याख्या देखें।
                  </p>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-indigo-300 bg-white dark:bg-slate-800 px-4 py-2.5 text-center shadow-2xs">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">स्कोर (Score)</p>
                    <p className="text-lg font-black text-indigo-700 dark:text-indigo-300">
                      {quizScore.correct} / {quizScore.total}
                    </p>
                  </div>
                  <button
                    onClick={handleResetQuiz}
                    className="flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-indigo-900 dark:text-indigo-200 hover:bg-indigo-50 shadow-2xs transition"
                  >
                    <RotateCcw size={13} /> रीसेट (Reset)
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {activeQuizQuestions.map((q, qIndex) => {
                const selectedOpt = userAnswers[q.id];
                const isAnswered = Boolean(selectedOpt);
                const isCorrect = selectedOpt === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    id={`ca-question-${q.id}`}
                    className={`rounded-2xl border-2 p-6 transition-all duration-200 ${
                      !isAnswered
                        ? 'border-indigo-100 bg-white dark:bg-slate-900'
                        : isCorrect
                        ? 'border-emerald-300 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20'
                        : 'border-rose-300 bg-rose-50/30 dark:border-rose-800 dark:bg-rose-950/20'
                    }`}
                  >
                    {/* Header badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 text-xs font-black text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200">
                        प्रश्न {qIndex + 1} of {activeQuizQuestions.length}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {q.category}
                      </span>
                    </div>

                    {/* Question Text */}
                    <h4 className="mt-3 text-base font-bold text-slate-900 dark:text-white whitespace-pre-line leading-relaxed">
                      {q.question}
                    </h4>

                    {/* Options (A, B, C, D) */}
                    <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                        const optText = Array.isArray(q.options)
                          ? q.options[['A', 'B', 'C', 'D'].indexOf(optKey)]
                          : q.options[optKey];
                        const isThisSelected = selectedOpt === optKey;
                        const isThisCorrect = q.correctAnswer === optKey;

                        let optStyle =
                          'border-indigo-100 bg-[#faf9ff] hover:bg-indigo-50/80 hover:border-indigo-300 text-slate-800 dark:bg-slate-800 dark:border-indigo-900/60 dark:text-slate-200';

                        if (isAnswered) {
                          if (isThisCorrect) {
                            optStyle =
                              'border-emerald-500 bg-emerald-100/90 text-emerald-950 font-bold dark:bg-emerald-900/80 dark:text-emerald-100 shadow-2xs';
                          } else if (isThisSelected && !isThisCorrect) {
                            optStyle =
                              'border-rose-500 bg-rose-100/90 text-rose-950 font-bold dark:bg-rose-900/80 dark:text-rose-100 shadow-2xs';
                          } else {
                            optStyle =
                              'opacity-60 border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400';
                          }
                        }

                        return (
                          <button
                            key={optKey}
                            disabled={isAnswered}
                            onClick={() => handleSelectAnswer(q.id, optKey)}
                            className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left text-xs sm:text-sm transition-all duration-150 ${optStyle}`}
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white dark:bg-slate-700 text-xs font-black shadow-2xs">
                              {optKey}
                            </span>
                            <span className="mt-0.5">{optText}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Box (Visible after answering) */}
                    {isAnswered && (
                      <div className="mt-5 rounded-xl border border-indigo-200/90 bg-[#f4f2ff] dark:bg-[#16133b] p-4 text-xs sm:text-sm">
                        <div className="flex items-center gap-2 font-black text-indigo-950 dark:text-indigo-100">
                          {isCorrect ? (
                            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                              <CheckCircle2 size={16} /> सही उत्तर: विकल्प ({q.correctAnswer})
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400">
                              <XCircle size={16} /> गलत उत्तर! सही उत्तर है: विकल्प ({q.correctAnswer})
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-slate-700 dark:text-slate-200 leading-relaxed">
                          <span className="font-bold">व्याख्या:</span> {q.explanation}
                        </p>

                        <div className="mt-2.5 border-t border-indigo-200/70 pt-2 text-amber-900 dark:text-amber-300 font-semibold flex items-center gap-1 text-xs">
                          <Sparkles size={13} /> <span className="font-bold">परीक्षा टिप:</span> {q.prelimsTip}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
