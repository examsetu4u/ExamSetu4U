import { type LucideIcon, ArrowRight, BarChart3, Bell, BookOpen, CalendarDays, Check, ChevronDown, Circle, ClipboardCheck, Clock3, Flame, LayoutDashboard, Menu, Play, Search, Settings, SlidersHorizontal, Target, Trophy, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

type ExamKey = 'upsc' | 'ssc' | 'neet';
type Section = 'dashboard' | 'study' | 'tests' | 'calendar' | 'progress';

type Task = {
  id: number;
  title: string;
  subject: string;
  duration: string;
  done: boolean;
  accent: string;
};

const exams: Record<ExamKey, { name: string; short: string; date: string; days: number; progress: number; color: string }> = {
  upsc: { name: 'UPSC Civil Services', short: 'UPSC CSE', date: '26 मई 2025', days: 74, progress: 38, color: 'hsl(41 90% 60%)' },
  ssc: { name: 'SSC CGL Tier 1', short: 'SSC CGL', date: '14 जून 2025', days: 93, progress: 52, color: 'hsl(165 42% 40%)' },
  neet: { name: 'NEET UG 2025', short: 'NEET UG', date: '4 मई 2025', days: 52, progress: 64, color: 'hsl(4 67% 53%)' },
};

const navItems: { id: Section; label: string; hint: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'आज का डैशबोर्ड', hint: 'Overview', icon: LayoutDashboard },
  { id: 'study', label: 'मेरी पढ़ाई', hint: 'Study plan', icon: BookOpen },
  { id: 'tests', label: 'मॉक टेस्ट', hint: 'Practice', icon: ClipboardCheck },
  { id: 'calendar', label: 'एग्ज़ाम कैलेंडर', hint: 'Important dates', icon: CalendarDays },
  { id: 'progress', label: 'मेरी प्रगति', hint: 'Insights', icon: BarChart3 },
];

const seedTasks: Task[] = [
  { id: 1, title: 'मौलिक अधिकार — अनुच्छेद 12 से 35', subject: 'भारतीय राजव्यवस्था', duration: '35 min', done: true, accent: 'bg-[#dcefe9] text-[#27715f]' },
  { id: 2, title: 'मुद्रास्फीति और मौद्रिक नीति', subject: 'अर्थव्यवस्था', duration: '40 min', done: false, accent: 'bg-[#fff0c9] text-[#9a690c]' },
  { id: 3, title: 'मानचित्र अभ्यास: नदियाँ और दर्रे', subject: 'भूगोल', duration: '25 min', done: false, accent: 'bg-[#f6ddd8] text-[#ad4e46]' },
];

const upcoming = [
  { month: 'APR', day: '21', title: 'UPSC Prelims application', type: 'Form deadline', tone: 'amber' },
  { month: 'MAY', day: '04', title: 'NEET UG 2025', type: 'Exam day', tone: 'coral' },
  { month: 'MAY', day: '26', title: 'UPSC Civil Services', type: 'Exam day', tone: 'teal' },
];

function Home() {
  const [section, setSection] = useState<Section>('dashboard');
  const [examKey, setExamKey] = useState<ExamKey>('upsc');
  const [tasks, setTasks] = useState(seedTasks);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState('');
  const [showExamMenu, setShowExamMenu] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const exam = exams[examKey];

  const completed = useMemo(() => tasks.filter((task) => task.done).length, [tasks]);
  const toggleTask = (id: number) => {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));
    setNotice('टास्क अपडेट हो गया');
    window.setTimeout(() => setNotice(''), 2200);
  };
  const startTest = () => {
    setTestStarted(true);
    setNotice('मॉक टेस्ट तैयार है — 20 प्रश्न आपका इंतज़ार कर रहे हैं');
    window.setTimeout(() => setNotice(''), 3200);
  };

  return (
    <div className="app-shell flex min-h-[100dvh] text-[hsl(var(--foreground))]">
      <aside className={`${mobileNav ? 'translate-x-0' : '-translate-x-full'} sidebar-grid fixed inset-y-0 left-0 z-40 flex w-[278px] flex-col bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 md:relative md:translate-x-0`}>
        <div className="mb-10 flex items-center justify-between px-2">
          <button className="focus-ring flex items-center gap-3 text-left" onClick={() => { setSection('dashboard'); setMobileNav(false); }} data-testid="button-brand-home">
            <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[hsl(var(--accent))] text-[hsl(var(--sidebar))] shadow-[0_8px_18px_hsl(41_90%_60%_/_0.2)]"><Target size={22} strokeWidth={2.5} /></span>
            <span><span className="block text-[17px] font-extrabold tracking-[-0.04em]">ExamSetu<span className="text-[hsl(var(--accent))]">4U</span></span><span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.22em] text-white/45">study with direction</span></span>
          </button>
          <button onClick={() => setMobileNav(false)} className="focus-ring rounded-lg p-1 text-white/55 hover:text-white md:hidden" data-testid="button-close-navigation"><X size={18} /></button>
        </div>
        <div className="mb-3 px-2 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-white/35">Workspace</div>
        <nav className="space-y-1" aria-label="मुख्य मेन्यू">
          {navItems.map(({ id, label, hint, icon: Icon }) => (
            <button key={id} onClick={() => { setSection(id); setMobileNav(false); }} className={`focus-ring group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${section === id ? 'bg-[hsl(var(--sidebar-accent))] text-white shadow-[inset_3px_0_0_hsl(var(--accent))]' : 'text-white/60 hover:bg-white/[.06] hover:text-white'}`} data-testid={`nav-${id}`}>
              <Icon size={18} strokeWidth={section === id ? 2.3 : 1.8} />
              <span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-semibold">{label}</span><span className="mt-0.5 block text-[10px] text-white/35">{hint}</span></span>
              {id === 'tests' && <span className="rounded-md bg-[hsl(var(--accent))] px-1.5 py-0.5 font-mono text-[9px] font-medium text-[hsl(var(--sidebar))]">3</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto">
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[.05] p-4">
            <div className="mb-3 flex items-start justify-between"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--accent)/.18)] text-[hsl(var(--accent))]"><Flame size={16} fill="currentColor" /></span><span className="font-mono text-[10px] text-white/40">DAY 07</span></div>
            <p className="text-[12px] font-semibold">आपकी लय बन रही है।</p><p className="mt-1 text-[11px] leading-relaxed text-white/45">आज का लक्ष्य पूरा करें और streak जारी रखें।</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[71%] rounded-full bg-[hsl(var(--accent))]" /></div>
          </div>
          <button onClick={() => { setNotice('सेटिंग्स जल्द आ रही हैं'); window.setTimeout(() => setNotice(''), 2200); }} className="focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-white/50 hover:bg-white/[.06] hover:text-white" data-testid="button-settings"><Settings size={18} /><span className="text-[13px] font-semibold">सेटिंग्स</span></button>
          <div className="mt-3 flex items-center gap-3 border-t border-white/10 px-3 pt-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9b34c] text-[12px] font-extrabold text-[hsl(var(--sidebar))]">AK</div><div className="min-w-0"><p className="truncate text-[12px] font-bold">आदित्य कुमार</p><p className="text-[10px] text-white/40">UPSC Aspirant</p></div><button onClick={() => setNotice('प्रोफ़ाइल मेन्यू जल्द आएगा')} className="ml-auto text-white/35 hover:text-white" data-testid="button-profile-menu"><ChevronDown size={16} /></button></div>
        </div>
      </aside>
      {mobileNav && <button className="fixed inset-0 z-30 bg-[hsl(198_35%_16%_/.45)] md:hidden" onClick={() => setMobileNav(false)} aria-label="मेन्यू बंद करें" data-testid="button-navigation-backdrop" />}
      <main className="min-w-0 flex-1">
        <header className="flex h-[76px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.82)] px-5 backdrop-blur-xl sm:px-8 lg:px-11">
          <div className="flex items-center gap-3"><button className="focus-ring rounded-xl p-2 hover:bg-[hsl(var(--secondary))] md:hidden" onClick={() => setMobileNav(true)} data-testid="button-open-navigation"><Menu size={21} /></button><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">Wednesday, 12 March 2025</p><h1 className="mt-1 text-[19px] font-extrabold tracking-[-.04em]">नमस्ते, आदित्य <span className="text-[hsl(var(--muted-foreground))]">—</span> आज क्या पढ़ेंगे?</h1></div></div>
          <div className="flex items-center gap-2 sm:gap-4"><button className="focus-ring rounded-xl p-2.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]" onClick={() => setNotice('अभी कोई नया अपडेट नहीं है')} data-testid="button-notifications"><Bell size={19} /></button><button className="focus-ring hidden items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold shadow-sm sm:flex" onClick={() => setNotice('सर्च जल्द उपलब्ध होगा')} data-testid="button-search"><Search size={15} className="text-[hsl(var(--muted-foreground))]" /> कुछ खोजें <span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">⌘K</span></button></div>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 lg:px-11">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]"><span className="h-1.5 w-1.5 rounded-full bg-[#4aab89]" />Your daily study desk</div><h2 className="text-[28px] font-extrabold tracking-[-.06em] sm:text-[34px]">{section === 'dashboard' ? 'आज की दिशा' : navItems.find((item) => item.id === section)?.label}</h2><p className="mt-1 text-[13px] text-[hsl(var(--muted-foreground))]">{section === 'dashboard' ? 'छोटे कदम, साफ़ तैयारी। एक बार में एक लक्ष्य।' : 'आपके लिए चुना हुआ focused study space.'}</p></div>
            <div className="relative"><button onClick={() => setShowExamMenu(!showExamMenu)} className="focus-ring flex min-w-[206px] items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5 text-left shadow-sm transition hover:border-[hsl(var(--accent))]" data-testid="button-exam-selector"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--accent)/.2)] text-[hsl(var(--accent-foreground))]"><BookOpen size={16} /></span><span className="flex-1"><span className="block text-[12px] font-bold">{exam.short}</span><span className="block text-[10px] text-[hsl(var(--muted-foreground))]">Focus exam</span></span><ChevronDown size={15} className={`text-[hsl(var(--muted-foreground))] transition ${showExamMenu ? 'rotate-180' : ''}`} /></button>{showExamMenu && <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[240px] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1.5 shadow-[var(--shadow-md)]">{(Object.keys(exams) as ExamKey[]).map((key) => <button key={key} onClick={() => { setExamKey(key); setShowExamMenu(false); }} className={`focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-[hsl(var(--secondary))] ${key === examKey ? 'bg-[hsl(var(--secondary))]' : ''}`} data-testid={`exam-option-${key}`}><span className="h-2 w-2 rounded-full" style={{ background: exams[key].color }} /><span className="text-[12px] font-semibold">{exams[key].name}</span>{key === examKey && <Check size={14} className="ml-auto text-[#27715f]" />}</button>)}</div>}</div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.8fr)]">
            <section className="rise-in relative overflow-hidden rounded-[22px] bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-md)] sm:p-8" data-testid="card-focus-summary">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[38px] border-[hsl(var(--accent)/.12)]" /><div className="absolute -bottom-20 right-24 h-44 w-44 rounded-full border-[20px] border-[hsl(var(--accent)/.08)]" />
              <div className="relative flex h-full flex-col justify-between gap-8"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-white/50">Your north star</p><h3 className="mt-3 max-w-[420px] text-[25px] font-extrabold leading-[1.15] tracking-[-.055em] sm:text-[32px]">इस हफ्ते का लक्ष्य:<br /><span className="text-[hsl(var(--accent))]">Polity के 4 chapters</span></h3></div><div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[.07] sm:flex"><Trophy size={23} className="text-[hsl(var(--accent))]" /></div></div><div><div className="mb-2 flex items-center justify-between text-[11px]"><span className="text-white/60">Week 3 of 4</span><span className="font-mono text-[hsl(var(--accent))]">{exam.progress}% complete</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="progress-sweep h-full rounded-full bg-[hsl(var(--accent))]" style={{ width: `${exam.progress}%` }} /></div><div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-white/55"><span className="flex items-center gap-1.5"><Clock3 size={14} /> 2h 15m planned today</span><span className="flex items-center gap-1.5"><Flame size={14} /> 7 day streak</span></div></div></div>
            </section>
            <section className="rise-in delay-1 paper-dots rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow)]" data-testid="card-next-exam"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Next milestone</p><h3 className="mt-2 text-[17px] font-extrabold tracking-[-.04em]">आपका अगला एग्ज़ाम</h3></div><CalendarDays size={20} className="text-[hsl(var(--muted-foreground))]" /></div><div className="mt-7 flex items-end gap-3"><span className="font-mono text-[55px] font-medium leading-none tracking-[-.1em] text-[hsl(var(--primary))]">{exam.days}</span><span className="pb-1 text-[12px] font-semibold text-[hsl(var(--muted-foreground))]">days<br />to go</span></div><div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4"><div><p className="text-[13px] font-bold">{exam.name}</p><p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">{exam.date} · Prelims</p></div><button onClick={() => setSection('calendar')} className="focus-ring rounded-lg p-2 text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]" data-testid="button-view-calendar"><ArrowRight size={17} /></button></div></section>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.8fr)]">
            <section className="rise-in delay-2 rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow)] sm:p-7" data-testid="section-today-tasks"><div className="mb-6 flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Daily rhythm</p><h3 className="mt-2 text-[19px] font-extrabold tracking-[-.04em]">आज की पढ़ाई <span className="ml-1 text-[12px] font-medium text-[hsl(var(--muted-foreground))]">({completed}/{tasks.length} done)</span></h3></div><button onClick={() => setNotice('आपकी पूरी study plan खुल रही है')} className="focus-ring flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]" data-testid="button-view-study-plan">पूरा प्लान <ArrowRight size={14} /></button></div><div className="space-y-2">{tasks.map((task) => <div key={task.id} className={`group flex items-center gap-3 rounded-2xl border px-3 py-3 transition ${task.done ? 'border-transparent bg-[hsl(var(--secondary)/.55)] opacity-70' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:border-[hsl(var(--accent))] hover:shadow-sm'}`} data-testid={`task-row-${task.id}`}><button onClick={() => toggleTask(task.id)} className={`focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${task.done ? 'border-[#4aab89] bg-[#4aab89] text-white' : 'border-[hsl(var(--border))] text-transparent hover:border-[hsl(var(--accent))]'}`} data-testid={`button-toggle-task-${task.id}`} aria-label={task.done ? 'टास्क अधूरा करें' : 'टास्क पूरा करें'}>{task.done ? <Check size={14} strokeWidth={3} /> : <Circle size={13} />}</button><div className="min-w-0 flex-1"><p className={`truncate text-[12px] font-bold ${task.done ? 'line-through' : ''}`}>{task.title}</p><p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">{task.subject} <span className="mx-1">·</span> {task.duration}</p></div><span className={`hidden rounded-md px-2 py-1 font-mono text-[9px] font-medium sm:block ${task.accent}`}>{task.done ? 'DONE' : 'UP NEXT'}</span><button onClick={() => setNotice(`${task.subject} खोल रहा है`)} className="focus-ring rounded-lg p-2 text-[hsl(var(--muted-foreground))] opacity-0 transition group-hover:opacity-100 hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))]" data-testid={`button-open-task-${task.id}`}><ArrowRight size={15} /></button></div>)}</div><div className="mt-5 flex items-center gap-3 rounded-xl bg-[hsl(var(--secondary)/.5)] px-4 py-3 text-[11px] text-[hsl(var(--muted-foreground))]"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-[hsl(var(--accent)/.25)] text-[hsl(var(--accent-foreground))]"><Flame size={13} /></span><span>आज का एक और deep-work session पूरा करें — आपका score बेहतर होगा।</span></div></section>
            <section className="rise-in delay-3 rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow)]" data-testid="section-mock-test"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Quick practice</p><h3 className="mt-2 text-[19px] font-extrabold tracking-[-.04em]">आज का मॉक</h3></div><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--accent))]"><ClipboardCheck size={17} /></span></div><div className="my-6 rounded-2xl bg-[hsl(var(--secondary)/.65)] p-4"><div className="mb-3 flex items-center justify-between"><span className="rounded-md bg-[hsl(var(--card))] px-2 py-1 font-mono text-[9px] font-medium text-[hsl(var(--muted-foreground))]">POLITY · EASY</span><span className="flex items-center gap-1 font-mono text-[10px] text-[hsl(var(--muted-foreground))]"><Clock3 size={12} /> 18 min</span></div><p className="text-[13px] font-extrabold">Fundamental Rights</p><p className="mt-1 text-[11px] leading-relaxed text-[hsl(var(--muted-foreground))]">20 questions to warm up your recall.</p></div><button onClick={startTest} className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-[12px] font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-testid="button-start-mock-test"><Play size={14} fill="currentColor" /> {testStarted ? 'टेस्ट शुरू हो गया' : 'मॉक टेस्ट शुरू करें'}</button><p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{testStarted ? 'Your practice space is ready' : 'No pressure · just practice'}</p></section>
          </div>

          <section className="mt-5 rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow)] sm:p-7" data-testid="section-upcoming-exams"><div className="mb-5 flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">Keep an eye on</p><h3 className="mt-2 text-[19px] font-extrabold tracking-[-.04em]">आने वाले milestones</h3></div><button onClick={() => setSection('calendar')} className="focus-ring hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))] sm:flex" data-testid="button-all-exams">सभी dates <ArrowRight size={14} /></button></div><div className="mobile-scroll -mx-1 flex gap-3 pb-1">{upcoming.map((item) => <button key={item.day} onClick={() => setNotice(`${item.title} — ${item.type}`)} className="focus-ring min-w-[240px] flex-1 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/.42)] p-3 text-left transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:shadow-sm" data-testid={`exam-event-${item.day}`}><div className="flex gap-3"><div className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl ${item.tone === 'amber' ? 'bg-[#fff0c9] text-[#9a690c]' : item.tone === 'coral' ? 'bg-[#f6ddd8] text-[#ad4e46]' : 'bg-[#dcefe9] text-[#27715f]'}`}><span className="font-mono text-[8px] font-bold tracking-widest">{item.month}</span><span className="font-mono text-[17px] font-medium leading-none">{item.day}</span></div><div className="min-w-0 pt-1"><p className="truncate text-[12px] font-bold">{item.title}</p><p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">{item.type}</p></div></div></button>)}</div></section>
        </div>
      </main>
      {notice && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-[12px] font-semibold text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-md)]" role="status" data-testid="status-notice"><Check size={15} className="text-[hsl(var(--accent))]" /> {notice}</div>}
    </div>
  );
}

function Router() {
  return <ErrorBoundary><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;