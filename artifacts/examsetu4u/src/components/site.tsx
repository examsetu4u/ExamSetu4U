import { ArrowRight, BookOpen, Check, LogOut, Menu, Search, Sparkles, User, X } from 'lucide-react';
import { type ButtonHTMLAttributes, type MouseEventHandler, type ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import type { Exam } from '@/data/exams';
import { getInitials, useAuth } from '@/lib/auth';
import { GlobalSearchBar } from '@/components/global-search-bar';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: 'primary' | 'secondary' | 'text';
  'data-testid'?: string;
  children: ReactNode;
};

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10 ${className}`}>{children}</div>;
}

export function Button({ children, href, variant = 'primary', className = '', ...props }: ButtonProps) {
  const styles = variant === 'primary'
    ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:bg-[hsl(36_79%_61%)]'
    : variant === 'secondary'
      ? 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--secondary))]'
      : 'text-[hsl(var(--primary))] hover:text-[hsl(var(--accent-foreground))]';
  const classNames = `focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${styles} ${className}`;
  if (href) return <Link href={href} onClick={props.onClick as unknown as MouseEventHandler<HTMLAnchorElement>} className={classNames} data-testid={props['data-testid']}>{children}</Link>;
  return <button {...props} className={classNames}>{children}</button>;
}

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Exams', href: '/exams' },
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
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border)/.8)] bg-[hsl(var(--background)/.94)] backdrop-blur-sm">
      <Container className="flex min-h-[68px] items-center justify-between gap-4">
        <Link href="/" className="focus-ring flex shrink-0 items-center gap-2.5 rounded-lg" onClick={() => setOpen(false)} data-testid="link-brand">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--accent))]"><BookOpen size={18} strokeWidth={2.4} /></span>
          <span className="text-[15px] font-bold tracking-[-.03em] text-[hsl(var(--primary))]">ExamSetu<span className="text-[hsl(var(--accent-foreground))]">4U</span></span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`focus-ring rounded-md px-2.5 py-2 text-[13px] font-semibold transition hover:bg-[hsl(var(--secondary))] ${location === item.href ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}>{item.label}</Link>
          ))}
          <Link href="/dashboard" className={`focus-ring rounded-md px-2.5 py-2 text-[13px] font-semibold transition hover:bg-[hsl(var(--secondary))] ${location === '/dashboard' ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid="link-nav-dashboard">Dashboard</Link>
          <Link href="/admin" className={`focus-ring rounded-md px-2.5 py-2 text-[13px] font-semibold transition hover:bg-[hsl(var(--secondary))] ${location.startsWith('/admin') ? 'text-[hsl(var(--primary))] font-bold' : 'text-[hsl(var(--muted-foreground))]'}`} data-testid="link-nav-admin">Admin</Link>
          
          <div className="w-44 xl:w-60 ml-1">
            <GlobalSearchBar />
          </div>
          
          {isAuthenticated ? (
            <div className="ml-2 flex items-center gap-2">
              <Link
                href="/profile"
                className="focus-ring flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1.5 text-xs font-bold text-[hsl(var(--primary))] hover:border-[hsl(var(--accent))] shadow-sm"
                data-testid="link-header-profile"
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white"
                  style={{ backgroundColor: profile?.avatarColor || '#1e3a8a' }}
                >
                  {initials}
                </span>
                <span className="max-w-[100px] truncate">{displayName.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                title="लॉगआउट"
                className="focus-ring rounded-lg p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[#a34f46]"
                data-testid="button-header-logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="focus-ring ml-1 rounded-md bg-[hsl(var(--primary))] px-3.5 py-2 text-[13px] font-bold text-[hsl(var(--primary-foreground))] hover:bg-[hsl(224_44%_34%)]" data-testid="link-nav-login">Login</Link>
          )}
        </nav>
        <div className="flex items-center gap-1.5 lg:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen((current) => !current)}
            className="focus-ring rounded-md p-2 text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]"
            aria-label="Search"
            data-testid="button-mobile-search-toggle"
          >
            <Search size={20} />
          </button>
          <button type="button" onClick={() => setOpen((current) => !current)} className="focus-ring rounded-md p-2 text-[hsl(var(--primary))]" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} data-testid="button-mobile-menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>
      {searchOpen && (
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 shadow-sm lg:hidden">
          <div className="mx-auto max-w-xl">
            <GlobalSearchBar autoFocus onClose={() => setSearchOpen(false)} isMobileDrawer />
          </div>
        </div>
      )}
      {open && (
        <nav className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 sm:px-3">
            {[...navItems, { label: 'Weak Topics', href: '/practice/weak-topics' }, { label: 'Dashboard', href: '/dashboard' }, { label: 'Search', href: '/search' }, { label: 'Admin Portal', href: '/admin' }].map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setOpen(false)} className="focus-ring rounded-md px-3 py-3 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]" data-testid={`link-mobile-${item.label.toLowerCase().replaceAll(' ', '-')}`}>{item.label}</Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link href="/profile" onClick={() => setOpen(false)} className="focus-ring rounded-md px-3 py-3 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]">प्रोफ़ाइल ({displayName})</Link>
                <button type="button" onClick={() => { logout(); setOpen(false); }} className="focus-ring text-left rounded-md px-3 py-3 text-sm font-semibold text-[#a34f46] hover:bg-[#f8e9e5]">लॉगआउट</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="focus-ring rounded-md px-3 py-3 text-sm font-semibold text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]">Login / Sign Up</Link>
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
    <footer id="footer" className="mt-20 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
      <Container className="grid gap-10 py-12 sm:grid-cols-[1.4fr_1fr_1fr] sm:py-16">
        <div>
          <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-lg" data-testid="link-footer-brand"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><BookOpen size={18} /></span><span className="text-lg font-bold">ExamSetu4U</span></Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-[hsl(var(--primary-foreground)/.7)]">Study Smart. Practice Free. Succeed.</p>
        </div>
        <div><h2 className="text-sm font-bold text-[hsl(var(--accent))]">Quick Links</h2><nav className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3" aria-label="Footer quick links">{footerLinks.map((item) => <Link key={item.label} href={item.href} className="focus-ring w-fit rounded text-sm text-[hsl(var(--primary-foreground)/.72)] hover:text-[hsl(var(--primary-foreground))]" data-testid={`link-footer-${item.label.toLowerCase().replaceAll(' ', '-')}`}>{item.label}</Link>)}</nav></div>
        <div><h2 className="text-sm font-bold text-[hsl(var(--accent))]">Information</h2><nav className="mt-4 grid gap-3" aria-label="Footer information links">{['About Us', 'Contact', 'Privacy Policy', 'Terms & Conditions'].map((label) => <a key={label} href="#footer" className="focus-ring w-fit rounded text-sm text-[hsl(var(--primary-foreground)/.72)] hover:text-[hsl(var(--primary-foreground))]" data-testid={`link-footer-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</a>)}</nav></div>
      </Container>
      <div className="border-t border-[hsl(var(--primary-foreground)/.14)]"><Container className="py-5 text-xs text-[hsl(var(--primary-foreground)/.56)]">© 2026 ExamSetu4U</Container></div>
    </footer>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <article className={`rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow)] ${className}`}>{children}</article>;
}

export function SectionTitle({ eyebrow, title, description, as = 'h2' }: { eyebrow?: string; title: string; description?: string; as?: 'h1' | 'h2' }) {
  const Heading = as;
  return <div className="max-w-2xl"><>{eyebrow && <p className="eyebrow">{eyebrow}</p>}</><Heading className="font-display mt-2 text-3xl leading-tight tracking-[-.035em] text-[hsl(var(--primary))] sm:text-4xl">{title}</Heading>{description && <p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))] sm:text-base">{description}</p>}</div>;
}

export function SearchBar({ value, onChange, placeholder = 'Search exams' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="flex min-h-12 items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 shadow-[var(--shadow)]"><Search size={17} className="shrink-0 text-[hsl(var(--muted-foreground))]" /><span className="sr-only">Search</span><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="focus-ring min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-search-exams" /></label>;
}

export function ExamCard({ exam }: { exam: Exam }) {
  const tone = { saffron: 'bg-[#f7e3bb] text-[#825413]', teal: 'bg-[#d6ebe5] text-[#246556]', blue: 'bg-[#dce4f2] text-[#34547f]', coral: 'bg-[#f3dcd5] text-[#9a493e]' }[exam.tone];
  return <Card className="flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-[hsl(var(--accent))] hover:shadow-[var(--shadow-md)]"><div className="flex items-start justify-between gap-4"><span className={`rounded-md px-2 py-1 text-[11px] font-bold ${tone}`}>{exam.name}</span><Check size={17} className="text-[hsl(var(--accent-foreground)/.45)]" /></div><p className="mt-5 flex-1 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{exam.shortDescription}</p><p className="mt-5 text-xs font-semibold text-[hsl(var(--primary))]">{exam.subjects}</p><Button href={`/exams/${exam.id}`} variant="secondary" className="mt-5 w-full" data-testid={`button-view-exam-${exam.id}`}>View exam <ArrowRight size={15} /></Button></Card>;
}

export function Layout({ children }: { children: ReactNode }) {
  return <div className="site-shell"><Header /><main>{children}</main><Footer /></div>;
}