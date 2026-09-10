import { ArrowLeft, BookOpen, FileQuestion, HelpCircle, Home, LayoutDashboard } from 'lucide-react';
import { Button, Container, Layout } from '@/components/site';

interface NotFoundPageProps {
  title?: string;
  message?: string;
  showBack?: boolean;
}

export default function NotFoundPage({
  title = 'Page नहीं मिला',
  message = 'यह content अभी उपलब्ध नहीं है या यह पृष्ठ हटा दिया गया है। कृपया नीचे दिए गए विकल्पों से अपनी पढ़ाई जारी रखें।',
  showBack = true,
}: NotFoundPageProps) {
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <Layout>
      <section className="paper-grid flex min-h-[65vh] items-center py-12 sm:py-20" aria-label="Not Found Section">
        <Container>
          <div
            className="mx-auto max-w-xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 text-center shadow-[var(--shadow-md)] sm:p-10"
            data-testid="panel-404-error"
          >
            {/* 404 Badge & Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <HelpCircle size={36} />
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[hsl(var(--accent-foreground))]">
              त्रुटि 404 • Page Not Found
            </p>

            <h1 className="font-display mt-2 text-2xl font-black text-[hsl(var(--primary))] sm:text-3xl">
              {title}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-base">
              {message}
            </p>

            {/* Recommended Navigation Buttons - Requirement 4 */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button href="/" variant="primary" className="w-full sm:w-auto" data-testid="button-404-home">
                <Home size={15} />
                <span>होम (Home)</span>
              </Button>

              <Button href="/exams" variant="secondary" className="w-full sm:w-auto" data-testid="button-404-exams">
                <BookOpen size={15} />
                <span>परीक्षाएं (Exams)</span>
              </Button>

              <Button href="/dashboard" variant="secondary" className="w-full sm:w-auto" data-testid="button-404-dashboard">
                <LayoutDashboard size={15} />
                <span>डैशबोर्ड (Dashboard)</span>
              </Button>
            </div>

            {/* Secondary Back Action */}
            {showBack && (
              <div className="mt-6 border-t border-[hsl(var(--border))] pt-4">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--primary))] focus-ring rounded p-1"
                  data-testid="button-404-back"
                >
                  <ArrowLeft size={13} />
                  <span>पिछले पृष्ठ पर वापस जाएं (Go Back)</span>
                </button>
              </div>
            )}
          </div>
        </Container>
      </section>
    </Layout>
  );
}
