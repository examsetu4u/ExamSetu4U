import { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileText,
  HelpCircle,
  Layers,
  Terminal,
  Calendar,
  Zap,
} from 'lucide-react';
import defaultStatusData from '@/data/current-affairs/automation-status.json';

interface AutomationStatusShape {
  lastSuccessfulUpdate: string | null;
  lastRunTimestamp: string;
  status: 'success' | 'warning' | 'error' | 'idle';
  newItemsAdded: number;
  duplicatesRejected: number;
  mcqsGenerated: number;
  failedItems: number;
  sourceUrls: string[];
  lastAutomationError: string | null;
  executionSummary: string;
  runHistory: Array<{
    timestamp: string;
    date: string;
    itemsCount: number;
    mcqsCount: number;
    status: string;
    sources: string[];
    error?: string;
  }>;
}

export function CurrentAffairsPipelineManager() {
  const [statusData, setStatusData] = useState<AutomationStatusShape>(defaultStatusData as any);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // In React SPA, reload status or local state
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return 'Not yet executed';
    try {
      const d = new Date(iso);
      return d.toLocaleString('hi-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short',
      }) + ' IST';
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[hsl(var(--border))] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 text-xs font-bold text-indigo-900 dark:text-indigo-200">
              <Zap size={13} className="text-indigo-600 dark:text-indigo-400" />
              GitHub Actions + Gemini Pipeline
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 size={12} />
              प्रतिदिन सुबह 6:00 AM IST
            </span>
          </div>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight text-[hsl(var(--foreground))]">
            UPPCS Current Affairs Automation Pipeline
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">
            स्वचालित दैनिक समसामयिकी पाइपलाइन — पीआईबी (PIB), यूपी सूचना विभाग एवं आधिकारिक पोर्टल्स से तथ्य निष्कर्षण, जेमिनी एआई द्वारा हिंदी रूपांतरण एवं प्रीलिम्स MCQs सृजन।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] shadow-2xs transition"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            स्थिति रिफ्रेश करें
          </button>
        </div>
      </div>

      {/* Primary Metrics Bento Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Last Successful Update */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
            <span className="text-xs font-semibold">अंतिम सफल अपडेट</span>
            <Clock size={16} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="mt-2 text-sm font-black text-[hsl(var(--foreground))]">
            {formatDate(statusData.lastSuccessfulUpdate)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck size={12} />
            <span>डेटा सुरक्षा: Append-Only सक्रिय</span>
          </div>
        </div>

        {/* Card 2: New Current Affairs Added */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
            <span className="text-xs font-semibold">नए विषय जोड़े गए (New Items)</span>
            <FileText size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-[hsl(var(--foreground))]">
            {statusData.newItemsAdded}
          </p>
          <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
            यूपी विशेष, राष्ट्रीय, आर्थिकी व विज्ञान
          </p>
        </div>

        {/* Card 3: Duplicates Rejected */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
            <span className="text-xs font-semibold">डुप्लिकेट अस्वीकृत (Rejected)</span>
            <Layers size={16} className="text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {statusData.duplicatesRejected}
          </p>
          <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
            शीर्षक, यूआरएल व टोकन मिलान द्वारा फिल्टर
          </p>
        </div>

        {/* Card 4: MCQs Generated */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
            <span className="text-xs font-semibold">MCQs निर्मित (Prelims Drill)</span>
            <HelpCircle size={16} className="text-violet-600 dark:text-violet-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-violet-600 dark:text-violet-400">
            {statusData.mcqsGenerated}
          </p>
          <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
            4-विकल्प UPPCS प्री मानक प्रश्नोत्तरी
          </p>
        </div>
      </div>

      {/* Last Automation Error / Health Banner */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-2xs">
        <div className="flex items-start gap-3">
          {statusData.lastAutomationError ? (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="text-sm font-bold text-[hsl(var(--foreground))]">
              {statusData.lastAutomationError
                ? 'पाइपलाइन निष्पादन चेतावनी (Last Automation Error)'
                : 'पाइपलाइन स्वास्थ्य स्थिति (Operational Health): सामान्य'}
            </h4>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
              {statusData.lastAutomationError
                ? statusData.lastAutomationError
                : statusData.executionSummary || 'कोई सक्रिय त्रुटि नहीं पाई गई। ऐतिहासिक समसामयिकी सुरक्षित है और किसी भी अप्रत्याशित विफलता पर पुराना डेटा अप्रभावित रहता है।'}
            </p>
            {statusData.failedItems > 0 && (
              <p className="mt-1 text-xs font-semibold text-rose-600">
                गुणवत्ता नियंत्रण द्वारा अस्वीकृत अपूर्ण विषय: {statusData.failedItems}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Crawled Official Source URLs */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-2xs">
        <h4 className="text-sm font-bold text-[hsl(var(--foreground))] flex items-center gap-2">
          <ExternalLink size={15} className="text-indigo-600" />
          <span>प्राधिकृत सरकारी स्रोत (Authoritative Government Sources)</span>
        </h4>
        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
          पाइपलाइन केवल भारत सरकार व उत्तर प्रदेश सरकार के आधिकारिक एवं विश्वसनीय सूचना तंत्रों से ही तथ्य एकत्र करती है:
        </p>

        <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
          {statusData.sourceUrls && statusData.sourceUrls.length > 0 ? (
            statusData.sourceUrls.map((url, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)] p-2.5 text-xs"
              >
                <div className="truncate font-mono text-[11px] text-[hsl(var(--foreground))]">
                  {url}
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  title="स्रोत पोर्टल खोलें"
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            ))
          ) : (
            <div className="text-xs text-[hsl(var(--muted-foreground))]">
              कोई यूआरएल उपलब्ध नहीं।
            </div>
          )}
        </div>
      </div>

      {/* GitHub Actions Setup & Security Blueprint */}
      <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-900/60 p-5">
        <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
          <Terminal size={16} className="text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-sm font-bold">GitHub Actions ऑटोमेशन विनिर्देशन</h4>
        </div>

        <div className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            <strong className="text-slate-900 dark:text-white">कार्यप्रवाह फ़ाइल:</strong>{' '}
            <code className="rounded bg-white dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] border border-indigo-200 dark:border-indigo-900">
              .github/workflows/uppcs-current-affairs.yml
            </code>
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white">शेड्यूल (Cron):</strong>{' '}
            <code className="rounded bg-white dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] border border-indigo-200 dark:border-indigo-900">
              30 0 * * *
            </code>{' '}
            (प्रत्येक दिन 00:30 UTC = भारतीय मानक समयानुसार 6:00 AM IST)
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white">सुरक्षित GitHub सीक्रेट:</strong>{' '}
            <code className="rounded bg-white dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] border border-indigo-200 dark:border-indigo-900">
              GEMINI_API_KEY
            </code>{' '}
            (रिपोजिटरी सेटिंग्स &rarr; Secrets and variables &rarr; Actions &rarr; Repository secrets में दर्ज करें)
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white">मैनुअल निष्पादन:</strong>{' '}
            GitHub Actions टैब से <code className="font-mono text-[11px]">workflow_dispatch</code> द्वारा कभी भी एक क्लिक में टेस्ट रन कर सकते हैं।
          </p>
        </div>
      </div>
    </div>
  );
}
