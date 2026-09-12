import { useMemo } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Calendar,
  Clock,
  BookOpen,
  Award,
  ArrowRight,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/curriculum-ui';
import { CurrentAffairsHub } from '@/components/current-affairs-hub';
import { Button, Card, Container, Layout, SectionTitle } from '@/components/site';
import { getExam, getSubject, getTopicsForSubject } from '@/data/curriculum';

export default function CurrentAffairsPage() {
  const [, setLocation] = useLocation();
  const exam = getExam('uppcs-pre');
  const subject = getSubject('uppcs-pre-current-affairs');
  const topics = subject ? getTopicsForSubject(subject.id) : [];

  return (
    <Layout>
      {/* 1. Header Banner */}
      <section className="hero-wash text-white border-b-2 border-indigo-200/40">
        <Container className="py-10 sm:py-14">
          <div className="text-indigo-200">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'UPPCS Pre', href: '/exams/uppcs-pre' },
                { label: 'समसामयिकी एवं करेंट अफेयर्स' },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-indigo-200 backdrop-blur-xs">
                  UPPCS Prelims 2025-26
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/20 border border-amber-300/40 px-3 py-1 text-xs font-bold text-amber-200">
                  <Sparkles size={13} /> 30-35 Questions Weightage
                </span>
              </div>
              <h1 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white">
                समसामयिकी एवं करेंट अफेयर्स केंद्र
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-indigo-100/90 sm:text-base sm:leading-7">
                दैनिक, साप्ताहिक, मासिक व वार्षिकी समसामयिकी — उत्तर प्रदेश विशेषांक, परीक्षा उपयोगी उच्च-सटीक नोट्स एवं UPPCS प्रीलिम्स पैटर्न MCQ क्विज़।
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/quiz/uppcs-pre/uppcs-pre-current-affairs"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-violet-600 transition"
              >
                <HelpCircle size={17} /> संपूर्ण क्विज़ टेस्ट दें
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Topic Cards (Daily, Weekly, Monthly, Yearly) */}
      <section className="py-8 border-b-2 border-indigo-200/90 bg-[#f4f2ff] dark:bg-[#0f0c29]">
        <Container>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border-2 border-indigo-200/80 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-indigo-400 transition">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <Calendar size={20} />
                </span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
                  Daily Update
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                दैनिक समसामयिकी (Daily)
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                आज के प्रमुख राष्ट्रीय, अंतर्राष्ट्रीय व यूपी घटनाक्रम और 5-क्वेश्चन डेली ड्रिल।
              </p>
              <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between">
                <Link
                  href="/study-material/uppcs-pre/uppcs-pre-current-affairs/uppcs-pre-current-affairs-1"
                  className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1"
                >
                  <FileText size={13} /> नोट्स पढ़ें
                </Link>
                <Link
                  href="/quiz/uppcs-pre/uppcs-pre-current-affairs/uppcs-pre-current-affairs-1"
                  className="text-xs font-bold text-violet-700 dark:text-violet-300 hover:underline flex items-center gap-1"
                >
                  <HelpCircle size={13} /> क्विज़
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-indigo-200/80 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-indigo-400 transition">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  <Clock size={20} />
                </span>
                <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-black text-violet-700 dark:bg-violet-950 dark:text-violet-300 border border-violet-200">
                  Weekly Capsule
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                साप्ताहिक राउंडअप (Weekly)
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                सप्ताह-वार वर्गीकरण, एक्सप्रेसवे, बुनियादी ढांचा और आर्थिक नीतियां।
              </p>
              <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between">
                <Link
                  href="/study-material/uppcs-pre/uppcs-pre-current-affairs/uppcs-pre-current-affairs-2"
                  className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1"
                >
                  <FileText size={13} /> नोट्स पढ़ें
                </Link>
                <Link
                  href="/quiz/uppcs-pre/uppcs-pre-current-affairs/uppcs-pre-current-affairs-2"
                  className="text-xs font-bold text-violet-700 dark:text-violet-300 hover:underline flex items-center gap-1"
                >
                  <HelpCircle size={13} /> क्विज़
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-indigo-200/80 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-indigo-400 transition">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <BookOpen size={20} />
                </span>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200">
                  Monthly Dossier
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                मासिक करेंट अफेयर्स (Monthly)
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                माह-वार विस्तृत विश्लेषण, नीतियां, समझौते और 20 प्रश्नों का मासिक मॉक टेस्ट।
              </p>
              <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between">
                <Link
                  href="/study-material/uppcs-pre/uppcs-pre-current-affairs/uppcs-pre-current-affairs-3"
                  className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1"
                >
                  <FileText size={13} /> नोट्स पढ़ें
                </Link>
                <Link
                  href="/quiz/uppcs-pre/uppcs-pre-current-affairs/uppcs-pre-current-affairs-3"
                  className="text-xs font-bold text-violet-700 dark:text-violet-300 hover:underline flex items-center gap-1"
                >
                  <HelpCircle size={13} /> क्विज़
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-indigo-200/80 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-indigo-400 transition">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <Award size={20} />
                </span>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-black text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
                  Yearly Mega
                </span>
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                वार्षिकी व यूपी स्पेशल (Yearly)
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                यूपी बजट 2025-26, 10 रामसर स्थल, 4 टाइगर रिजर्व, जीआई टैग और वार्षिक मेगा क्विज़।
              </p>
              <div className="mt-4 pt-3 border-t border-indigo-100 flex items-center justify-between">
                <Link
                  href="/study-material/uppcs-pre/uppcs-pre-current-affairs/uppcs-pre-current-affairs-4"
                  className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:underline flex items-center gap-1"
                >
                  <FileText size={13} /> नोट्स पढ़ें
                </Link>
                <Link
                  href="/quiz/uppcs-pre/uppcs-pre-current-affairs/uppcs-pre-current-affairs-4"
                  className="text-xs font-bold text-violet-700 dark:text-violet-300 hover:underline flex items-center gap-1"
                >
                  <HelpCircle size={13} /> क्विज़
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 3. Interactive Hub with Tabs & Quiz */}
      <section className="py-10 sm:py-14 bg-white dark:bg-slate-950">
        <Container>
          <CurrentAffairsHub />
        </Container>
      </section>
    </Layout>
  );
}
