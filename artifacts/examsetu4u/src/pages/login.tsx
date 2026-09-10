import { ArrowRight, BookOpen, CheckCircle2, Eye, EyeOff, Info, Lock, LogIn, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button, Card, Container, Layout } from '@/components/site';
import { DEMO_USER, useAuth } from '@/lib/auth';
import { seedDemoProgress } from '@/lib/user-progress';

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, loginDemo } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('कृपया अपना ईमेल पता दर्ज करें।');
      return;
    }
    if (!password) {
      setError('कृपया अपना पासवर्ड दर्ज करें।');
      return;
    }

    setLoading(true);
    const result = login(email, password, rememberMe);
    setLoading(false);

    if (result.success) {
      setLocation('/dashboard');
    } else {
      setError(result.message || 'लॉगिन विफल रहा। कृपया विवरण जांचें।');
    }
  };

  const handleDemoLogin = () => {
    setError(null);
    setLoading(true);
    // Seed demo progress so user immediately gets rich data
    seedDemoProgress();
    const result = loginDemo();
    setLoading(false);
    if (result.success) {
      setLocation('/dashboard');
    }
  };

  return (
    <Layout>
      <section className="paper-grid border-b border-[hsl(var(--border))] py-10 sm:py-14">
        <Container className="max-w-xl">
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--accent))] shadow-md">
              <BookOpen size={24} />
            </span>
            <p className="eyebrow mt-4">Demo Authentication</p>
            <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-[hsl(var(--primary))] sm:text-4xl">
              ExamSetu4U में लॉगिन करें
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              अपनी अध्ययन प्रगति, PYQ अभ्यास और Intelligent Score ट्रैक करें।
            </p>
          </div>

          <Card className="mt-8 p-6 sm:p-8" data-testid="card-login">
            {/* Disclaimer notice */}
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--accent)/.1)] p-3.5 text-xs text-[hsl(var(--accent-foreground))]">
              <Info size={16} className="mt-0.5 shrink-0" />
              <div>
                <strong>Frontend Demo System:</strong> यह एक स्थानीय डेमो प्रमाणीकरण प्रणाली है जो ब्राउज़र के लोकल स्टोरेज पर आधारित है। प्रगति प्रदर्शन के लिए नीचे दिए गए डेमो खाते का उपयोग करें।
              </div>
            </div>

            {/* Quick Demo Button */}
            <div className="mb-6 rounded-xl border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--secondary))] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--primary))]">
                    <Sparkles size={14} className="text-[hsl(var(--accent-foreground))]" /> त्वरित परीक्षण (Quick Test)
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    पूर्व-लोड प्रगति और Intelligent Score के साथ डेमो खाता खोलें
                  </p>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleDemoLogin}
                  className="min-h-9 px-3.5 py-1.5 text-xs font-bold shrink-0"
                  data-testid="button-quick-demo-login"
                >
                  डेमो खाता लॉगिन <ArrowRight size={14} />
                </Button>
              </div>
            </div>

            {error && (
              <div
                className="mb-5 rounded-lg border border-[#bb685c] bg-[#f8e9e5] p-3 text-xs text-[#a34f46]"
                role="alert"
                data-testid="alert-login-error"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">
                  ईमेल पता (Email)
                </label>
                <div className="relative mt-1.5">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@examsetu4u.com"
                    autoComplete="email"
                    className="focus-ring min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-10 pr-3 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]"
                    data-testid="input-login-email"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">
                    पासवर्ड (Password)
                  </label>
                  <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                    डेमो: Password123
                  </span>
                </div>
                <div className="relative mt-1.5">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="focus-ring min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-10 pr-10 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]"
                    data-testid="input-login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))]"
                  />
                  मुझे याद रखें (Remember me)
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full mt-2"
                data-testid="button-submit-login"
              >
                <LogIn size={16} /> {loading ? 'सत्यापित किया जा रहा है...' : 'लॉगिन करें'}
              </Button>
            </form>

            <div className="mt-6 border-t border-[hsl(var(--border))] pt-5 text-center text-xs text-[hsl(var(--muted-foreground))]">
              क्या आपके पास खाता नहीं है?{' '}
              <Link
                href="/signup"
                className="font-bold text-[hsl(var(--primary))] hover:underline"
                data-testid="link-go-to-signup"
              >
                नया खाता बनाएँ (Sign Up)
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    </Layout>
  );
}

export default LoginPage;
