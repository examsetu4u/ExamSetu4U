import { AlertCircle, BookOpen, FileQuestion, HelpCircle, History, RefreshCw, Search, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/site';

export type EmptyStateType =
  | 'search'
  | 'pyq'
  | 'quiz'
  | 'study-material'
  | 'activity'
  | 'recommendation'
  | 'generic';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  children?: ReactNode;
  className?: string;
  id?: string;
}

const DEFAULT_CONFIGS: Record<
  EmptyStateType,
  {
    icon: typeof Search;
    title: string;
    description: string;
    actionText: string;
    actionHref: string;
  }
> = {
  search: {
    icon: Search,
    title: 'कोई परिणाम नहीं मिला (No Results Found)',
    description: 'कृपया दूसरे कीवर्ड, स्पेलिंग या विषय का नाम लिखकर पुनः प्रयास करें। आप हिंदी या अंग्रेजी दोनों में टाइप कर सकते हैं।',
    actionText: 'सभी परीक्षाएं देखें',
    actionHref: '/exams',
  },
  pyq: {
    icon: FileQuestion,
    title: 'अभी इस टॉपिक के लिए PYQ उपलब्ध नहीं हैं',
    description: 'अभी इस topic के लिए previous year questions तैयार किए जा रहे हैं। आप तब तक थ्योरी नोट्स या संबंधित विषयों के प्रश्न हल कर सकते हैं।',
    actionText: 'अन्य PYQ एक्सप्लोर करें',
    actionHref: '/pyq',
  },
  quiz: {
    icon: HelpCircle,
    title: 'इस विषय के लिए क्विज़ शीघ्र उपलब्ध होगा',
    description: 'इस अध्याय के लिए वस्तुनिष्ठ प्रश्नोत्तरी जल्द ही जोड़ी जाएगी। अपनी तैयारी जारी रखने के लिए दूसरे विषयों की MCQ प्रैक्टिस करें।',
    actionText: 'अन्य क्विज़ देखें',
    actionHref: '/quiz',
  },
  'study-material': {
    icon: BookOpen,
    title: 'अध्ययन सामग्री तैयार की जा रही है',
    description: 'अभी इस topic के लिए content उपलब्ध नहीं है। दूसरे topic को explore करें या अन्य उपलब्ध विषयों के नोट्स पढ़ें।',
    actionText: 'उपलब्ध नोट्स देखें',
    actionHref: '/study-material',
  },
  activity: {
    icon: History,
    title: 'अभी तक कोई गतिविधि दर्ज नहीं है',
    description: 'जब आप क्विज़ देंगे, PYQ हल करेंगे या नोट्स पढ़ेंगे, तो आपकी हालिया प्रगति यहाँ दिखाई देगी।',
    actionText: 'पहला क्विज़ प्रारंभ करें',
    actionHref: '/quiz',
  },
  recommendation: {
    icon: Sparkles,
    title: 'सिफारिशें तैयार हो रही हैं',
    description: 'कुछ प्रश्नों का अभ्यास करें या किसी अध्याय का अध्ययन शुरू करें ताकि हम आपके लिए व्यक्तिगत सुझाव बना सकें।',
    actionText: 'पाठ्यक्रम देखें',
    actionHref: '/exams',
  },
  generic: {
    icon: AlertCircle,
    title: 'सामग्री उपलब्ध नहीं है',
    description: 'यह भाग अभी निर्माणाधीन है या जानकारी उपलब्ध नहीं है। कृपया मुख्य पृष्ठ पर वापस जाएँ।',
    actionText: 'मुख्य पृष्ठ पर जाएँ',
    actionHref: '/',
  },
};

export function EmptyState({
  type = 'generic',
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
  secondaryActionText,
  secondaryActionHref,
  children,
  className = '',
  id,
}: EmptyStateProps) {
  const config = DEFAULT_CONFIGS[type];
  const Icon = config.icon;

  const resolvedTitle = title || config.title;
  const resolvedDescription = description || config.description;
  const resolvedActionText = actionText || config.actionText;
  const resolvedActionHref = actionHref || config.actionHref;

  return (
    <div
      id={id}
      className={`rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.5)] p-8 text-center sm:p-12 ${className}`}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] shadow-xs">
        <Icon size={26} strokeWidth={1.8} />
      </div>

      <h3 className="mt-4 text-lg font-bold text-[hsl(var(--primary))] sm:text-xl">
        {resolvedTitle}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
        {resolvedDescription}
      </p>

      {children && <div className="mt-4">{children}</div>}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onActionClick ? (
          <Button onClick={onActionClick} variant="primary" className="text-xs sm:text-sm">
            {resolvedActionText}
          </Button>
        ) : (
          <Button href={resolvedActionHref} variant="primary" className="text-xs sm:text-sm">
            {resolvedActionText}
          </Button>
        )}

        {secondaryActionText && secondaryActionHref && (
          <Button href={secondaryActionHref} variant="secondary" className="text-xs sm:text-sm">
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
}
