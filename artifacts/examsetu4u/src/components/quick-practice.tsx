import { ArrowRight, BookOpen, Brain, FileQuestion, FileText, Zap } from 'lucide-react';
import { Card, Button } from '@/components/site';

interface QuickPracticeProps {
  examId: string;
  subjectId?: string;
  examName: string;
  subjectName?: string;
  className?: string;
}

export function QuickPractice({
  examId,
  subjectId,
  examName,
  subjectName,
  className = '',
}: QuickPracticeProps) {
  // Routes to existing functionality
  const studyUrl = subjectId
    ? `/study-material/${examId}/${subjectId}/super-tet-teaching-skills-1`
    : `/study-material/${examId}/super-tet-teaching-skills/super-tet-teaching-skills-1`;

  const pyqUrl = subjectId
    ? `/pyq/${examId}/${subjectId}`
    : `/pyq/${examId}`;

  const quizUrl = subjectId
    ? `/quiz/${examId}/${subjectId}`
    : `/quiz/${examId}`;

  return (
    <Card className={`p-5 sm:p-6 ${className}`} id="card-quick-practice">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[hsl(var(--border))] pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
            <Zap size={16} />
          </span>
          <div>
            <h3 className="text-base font-bold text-[hsl(var(--primary))]">
              त्वरित अभ्यास (Quick Practice)
            </h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {subjectName ? `${examName} · ${subjectName}` : examName} के सीधे अभ्यास मोड
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
          सीधे अभ्यास प्रारंभ करें
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Button
          href={studyUrl}
          variant="secondary"
          className="flex-col items-start gap-1 p-4 h-auto text-left hover:border-[hsl(var(--accent))]"
        >
          <div className="flex items-center justify-between w-full">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--card))] text-[hsl(var(--primary))]">
              <FileText size={15} />
            </span>
            <ArrowRight size={13} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <span className="font-bold text-xs text-[hsl(var(--primary))] mt-2">
            Study Material
          </span>
          <span className="text-[11px] font-normal text-[hsl(var(--muted-foreground))]">
            अवधारणात्मक नोट्स व रिवीजन
          </span>
        </Button>

        <Button
          href={pyqUrl}
          variant="secondary"
          className="flex-col items-start gap-1 p-4 h-auto text-left hover:border-[hsl(var(--accent))]"
        >
          <div className="flex items-center justify-between w-full">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--card))] text-[hsl(var(--primary))]">
              <FileQuestion size={15} />
            </span>
            <ArrowRight size={13} className="text-[hsl(var(--muted-foreground))]" />
          </div>
          <span className="font-bold text-xs text-[hsl(var(--primary))] mt-2">
            Practice PYQ
          </span>
          <span className="text-[11px] font-normal text-[hsl(var(--muted-foreground))]">
            पूर्व वर्षों के वास्तविक प्रश्न
          </span>
        </Button>

        <Button
          href={quizUrl}
          variant="primary"
          className="flex-col items-start gap-1 p-4 h-auto text-left shadow-xs"
        >
          <div className="flex items-center justify-between w-full">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--accent))] text-[hsl(var(--primary))]">
              <Brain size={15} />
            </span>
            <ArrowRight size={13} className="text-[hsl(var(--primary-foreground))]" />
          </div>
          <span className="font-bold text-xs text-[hsl(var(--primary-foreground))] mt-2">
            Take Quiz
          </span>
          <span className="text-[11px] font-normal text-[hsl(var(--primary-foreground)/.8)]">
            समयबद्ध बहुविकल्पीय टेस्ट
          </span>
        </Button>
      </div>
    </Card>
  );
}
