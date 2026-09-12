import { ArrowRight, BookOpen, Check, LogOut, Menu, Search, Sparkles, User, X } from 'lucide-react';
import { type ButtonHTMLAttributes, type MouseEventHandler, type ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import type { Exam } from '@/data/exams';
import { getInitials, useAuth } from '@/lib/auth';
import { GlobalSearchBar } from '@/components/global-search-bar';
import { ThemeToggle } from '@/components/theme-toggle';

// Re-export standardized callout components for site-wide consistency
export {
  ImportantPoint,
  ExamTip,
  QuickRevision,
  WarningCallout,
  SuccessCallout,
  ProgressCallout,
} from '@/components/ui/info-callout';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: 'primary' | 'secondary' | 'cta' | 'destructive' | 'outline' | 'text';
  'data-testid'?: string;
  children: ReactNode;
};

export function Container({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  return <div id={id} className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function Button({ children, href, variant = 'primary', className = '', ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-blue-700 text-white hover:bg-blue-800 shadow-2xs active:bg-blue-900 border border-blue-700',
    secondary: 'border border-[hsl(var(--border))] bg-white dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700/60 text-[hsl(var(--foreground))] hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 dark:hover:text-blue-400 shadow-2xs active:bg-blue-100/60',
    cta: 'bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white shadow-xs hover:from-indigo-800 hover:to-violet-700 hover:shadow-md border border-indigo-600 active:from-indigo-900 active:to-violet-800',
    destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs border border-rose-600 active:bg-rose-800',
    outline: 'border border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100/70 hover:border-blue-300 shadow-2xs',
    text: 'text-blue-700 hover:text-blue-800 hover:underline bg-transparent p-0 min-h-0',
  }[variant];

  const classNames = `focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-150 ${styles} ${className}`;
  if (href) return <Link href={href} onClick={props.onClick as unknown as MouseEventHandler<HTMLAnchorElement>} className={classNames} data-testid={props['data-testid']}>{children}</Link>;
  return <button {...props} className={classNames}>{children}</button>;
}

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Exams', href: '/exams' },
  { label: 'Current Affairs', href: '/exams/uppcs-pre/current-affairs' },
  { label: 'Study Planner', href: '/study-planner' },
  { label: 'Study Material', href: '/study-material' },
  { label: 'PYQ', href: '/pyq' },
  { label: 'Quiz', href: '/quiz' },
  { label: 'Mock Tests', href: '/mock-tests' },
  { label: 'Mistakes', href: '/mistakes' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, profile, user, logout } = useAuth();

  const displayName = profile?.name || user?.name || 'User';
  const initials = getInitials(displayName);

  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-white/95 dark:bg-slate-900/95 dark:border-slate-800 backdrop-blur-md shadow-2xs">
      <Container className="flex min-h-[64px] items-center justify-between gap-3 sm:gap-4">
        <Link href="/" className="focus-ring flex shrink-0 items-center gap-2.5 rounded-xl py-1" onClick={() => setOpen(false)} data-testid="link-brand">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white shadow-2xs">
            <BookOpen size={18} strokeWidth={2.4} />
          </span>
          <span className="text-[16px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            ExamSetu<span className="text-blue-600 dark:text-blue-400">4U</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`focus-ring rounded-lg px-2.5 py-1.5 text-[13px] font-bold transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
                data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/dashboard"
            className={`focus-ring rounded-lg px-2.5 py-1.5 text-[13px] font-bold transition-colors ${
              location === '/dashboard'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
            data-testid="link-nav-dashboard"
          >
            Dashboard
          </Link>
          <Link
            href="/admin"
            className={`focus-ring rounded-lg px-2 py-1.5 text-[12px] font-bold transition-colors ${
              location.startsWith('/admin')
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-slate-500 hover:bg-slate-100/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            }`}
            data-testid="link-nav-admin"
          >
            Admin
          </Link>
          
          <div className="w-40 xl:w-52 ml-1">
            <GlobalSearchBar />
          </div>

          <div className="ml-1">
            <ThemeToggle />
          </div>
          
          {isAuthenticated ? (
            <div className="ml-2 flex items-center gap-1.5">
              <Link
                href="/profile"
                className="focus-ring flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-white dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-400 shadow-2xs"
                data-testid="link-header-profile"
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white shadow-2xs"
                  style={{ backgroundColor: profile?.avatarColor || '#4338ca' }}
                >
                  {initials}
                </span>
                <span className="max-w-[85px] truncate">{displayName.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                title="लॉगआउट"
                className="focus-ring rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                data-testid="button-header-logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="focus-ring ml-1 rounded-xl bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-800 shadow-2xs transition"
              data-testid="link-nav-login"
            >
              Login
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1.5 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setSearchOpen((current) => !current)}
            className="focus-ring rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Search"
            data-testid="button-mobile-search-toggle"
          >
            <Search size={19} />
          </button>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="focus-ring rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            data-testid="button-mobile-menu"
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </Container>

      {searchOpen && (
        <div className="border-t border-[hsl(var(--border))] bg-white dark:bg-slate-900 px-4 py-3 shadow-sm lg:hidden">
          <div className="mx-auto max-w-xl">
            <GlobalSearchBar autoFocus onClose={() => setSearchOpen(false)} isMobileDrawer />
          </div>
        </div>
      )}

      {open && (
        <nav className="border-t border-[hsl(var(--border))] bg-white dark:bg-slate-900 px-4 py-3 shadow-lg lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {[...navItems, { label: 'Weak Topics', href: '/practice/weak-topics' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'Search', href: '/search' }, { label: 'Admin Portal', href: '/admin' }].map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`focus-ring rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                  data-testid={`link-mobile-${item.label.toLowerCase().replaceAll(' ', '-')}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 flex items-center justify-between border-t border-[hsl(var(--border))] pt-3 px-1">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Theme Preference</span>
              <ThemeToggle showLabel />
            </div>
            {isAuthenticated ? (
              <div className="mt-2 border-t border-[hsl(var(--border))] pt-2">
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="focus-ring block rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  प्रोफ़ाइल ({displayName})
                </Link>
                <button
                  type="button"
                  onClick={() => { logout(); setOpen(false); }}
                  className="focus-ring w-full text-left rounded-lg px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  लॉगआउट
                </button>
              </div>
            ) : (
              <div className="mt-2 border-t border-[hsl(var(--border))] pt-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="focus-ring block rounded-xl bg-blue-700 py-2.5 text-center text-sm font-bold text-white hover:bg-blue-800"
                >
                  Login / Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

const footerLinks = [
  { label: 'Home', href: '/' }, { label: 'Study Planner', href: '/study-planner' }, { label: 'Exams', href: '/exams' }, { label: 'Study Material', href: '/study-material' },
  { label: 'PYQ', href: '/pyq' }, { label: 'Quiz', href: '/quiz' }, { label: 'Mock Tests', href: '/mock-tests' }, { label: 'Mistake Book', href: '/mistakes' },
  { label: 'Weak Topics', href: '/practice/weak-topics' }, { label: 'Smart Search', href: '/search' },
  { label: 'Analytics', href: '/analytics' }, { label: 'Achievements', href: '/achievements' }, { label: 'Dashboard', href: '/dashboard' },
  { label: 'Admin Portal', href: '/admin' },
];

export function Footer() {
  return (
    <footer id="footer" className="mt-20 border-t border-indigo-950 bg-[#0c0a24] text-white">
      <Container className="grid gap-10 py-12 sm:grid-cols-[1.4fr_1fr_1fr] sm:py-16">
        <div>
          <Link href="/" className="focus-ring inline-flex items-center gap-2.5 rounded-lg" data-testid="link-footer-brand">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
              <BookOpen size={18} strokeWidth={2.4} />
            </span>
            <span className="text-xl font-extrabold tracking-tight">ExamSetu<span className="text-violet-400">4U</span></span>
          </Link>
          <p className="mt-4 max-w-xs text-xs sm:text-sm leading-relaxed text-indigo-100/75">
            Free exam preparation platform for Indian students with high-yield study material, previous year questions, MCQ drills, and analytics.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-700/60 bg-violet-950/60 px-3 py-1 text-[11px] font-bold text-violet-300">
            <Sparkles size={13} /> 100% Free Educational Platform
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-violet-300">Quick Links</h2>
          <nav className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:text-sm" aria-label="Footer quick links">
            {footerLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="focus-ring w-fit rounded text-indigo-100/75 hover:text-white transition"
                data-testid={`link-footer-${item.label.toLowerCase().replaceAll(' ', '-')}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-violet-300">Information</h2>
          <nav className="mt-4 grid gap-2.5 text-xs sm:text-sm" aria-label="Footer information links">
            {['About Us', 'Contact', 'Privacy Policy', 'Terms & Conditions'].map((label) => (
              <a
                key={label}
                href="#footer"
                className="focus-ring w-fit rounded text-indigo-100/75 hover:text-white transition"
                data-testid={`link-footer-${label.toLowerCase().replaceAll(' ', '-')}`}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </Container>
      <div className="border-t border-indigo-950/80 bg-[#070518]">
        <Container className="flex flex-wrap items-center justify-between py-4 text-xs text-indigo-200/60">
          <span>© 2026 ExamSetu4U · Made for Indian Aspirants</span>
          <span>Ad-Free · Non-Profit Educational Mission</span>
        </Container>
      </div>
    </footer>
  );
}

export function Card({
  children,
  className = '',
  id,
  variant = 'default',
  'data-testid': testId,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  variant?: 'default' | 'subtle' | 'highlight' | 'feature';
  'data-testid'?: string;
}) {
  const hasCustomBg = className.includes('bg-') || className.includes('bg-[#');
  const variantStyles = {
    default: `${hasCustomBg ? '' : 'bg-white dark:bg-slate-900'} border-[hsl(var(--border))] text-[hsl(var(--card-foreground))] shadow-xs`,
    subtle: 'bg-indigo-100/70 border-indigo-200 text-[hsl(var(--card-foreground))] shadow-2xs dark:bg-indigo-950/50 dark:border-indigo-900',
    highlight: 'bg-gradient-to-br from-indigo-100/80 to-violet-100/60 border-indigo-300 text-indigo-950 shadow-xs dark:from-indigo-950/60 dark:to-slate-900',
    feature: 'bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 border-indigo-800/60 text-white shadow-md',
  }[variant];

  return (
    <article
      id={id}
      data-testid={testId}
      className={`rounded-xl border transition-all duration-200 ${variantStyles} ${className}`}
    >
      {children}
    </article>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  as = 'h2',
  className = '',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  const Heading = as;
  return (
    <div className={`max-w-2xl ${className}`}>
      {eyebrow && (
        <p className="eyebrow inline-flex items-center gap-1.5 font-bold tracking-wider text-blue-700">
          {eyebrow}
        </p>
      )}
      <Heading className="font-display mt-2 text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-3xl lg:text-4xl">
        {title}
      </Heading>
      {description && (
        <p className="mt-2.5 text-xs leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-sm sm:leading-6">
          {description}
        </p>
      )}
    </div>
  );
}

export function SectionHeading(props: {
  eyebrow?: string;
  title: string;
  description?: string;
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  return <SectionTitle {...props} />;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search exams',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-white px-3.5 shadow-xs transition hover:border-blue-300 focus-within:border-blue-500">
      <Search size={17} className="shrink-0 text-slate-400" />
      <span className="sr-only">Search</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="focus-ring min-w-0 flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400 text-slate-900"
        data-testid="input-search-exams"
      />
    </label>
  );
}

export function ExamCard({ exam }: { exam: Exam }) {
  return (
    <Card
      id={`exam-card-${exam.id}`}
      data-testid={`card-exam-${exam.id}`}
      className="group flex h-full flex-col justify-between p-5 sm:p-6 transition-all duration-200 rounded-2xl border-2 border-indigo-200/90 bg-[#f4f2ff] dark:bg-[#16133b] dark:border-indigo-800/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg hover:-translate-y-1"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300/90 bg-indigo-200/90 px-3 py-1.5 text-xs font-black tracking-wide text-indigo-950 shadow-2xs dark:border-indigo-700 dark:bg-indigo-900/90 dark:text-indigo-100">
            {exam.name}
          </span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-200/90 text-indigo-800 shadow-2xs dark:bg-indigo-900 dark:text-indigo-200">
            <Check size={13} strokeWidth={2.8} />
          </span>
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
          {exam.subjects}
        </p>
        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 line-clamp-3 font-medium">
          {exam.shortDescription}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-indigo-200/80 dark:border-indigo-800/60">
        <Button
          href={`/exams/${exam.id}`}
          variant="secondary"
          className="w-full text-xs font-bold bg-white dark:bg-slate-800 hover:bg-indigo-100/90 dark:hover:bg-indigo-950/80 border border-indigo-300/80 dark:border-indigo-700 text-indigo-950 dark:text-indigo-100 shadow-2xs"
          data-testid={`button-view-exam-${exam.id}`}
        >
          View Exam Path <ArrowRight size={14} />
        </Button>
      </div>
    </Card>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}