import { ArrowRight, BookOpen, CheckCircle2, Eye, EyeOff, Info, Lock, Mail, User as UserIcon, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button, Card, Container, Layout } from '@/components/site';
import { exams } from '@/data/curriculum';
import { useAuth } from '@/lib/auth';

export function SignupPage() {
  const [, setLocation] = useLocation();
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredExamId, setPreferredExamId] = useState('super-tet');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('कृपया अपना पूरा नाम दर्ज करें।');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('कृपया एक वैध ईमेल पता दर्ज करें।');
      return;
    }
    if (password.length < 6) {
      setError('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }
    if (password !== confirmPassword) {
      setError('पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।');
      return;
    }

    setLoading(true);
    const result = signup(name, email, password, preferredExamId);
    setLoading(false);

    if (result.success) {
      setLocation('/dashboard');
    } else {
      setError(result.message || 'खाता बनाने में त्रुटि हुई।');
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
            <p className="eyebrow mt-4">Create Learner Account</p>
            <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-[hsl(var(--primary))] sm:text-4xl">
              नया खाता बनाएँ
            </h1>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              ExamSetu4U के साथ अपनी परीक्षा तैयारी को व्यवस्थित और परिणामोन्मुख बनाएँ।
            </p>
          </div>

          <Card className="mt-8 p-6 sm:p-8" data-testid="card-signup">
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--accent)/.1)] p-3.5 text-xs text-[hsl(var(--accent-foreground))]">
              <Info size={16} className="mt-0.5 shrink-0" />
              <div>
                <strong>Local Demo Storage:</strong> यह खाता केवल आपके इस ब्राउज़र में सुरक्षित रहता है। प्रगति, स्कोर और बुकमार्क सब यहीं सहेजे जाते हैं।
              </div>
            </div>

            {error && (
              <div
                className="mb-5 rounded-lg border border-[#bb685c] bg-[#f8e9e5] p-3 text-xs text-[#a34f46]"
                role="alert"
                data-testid="alert-signup-error"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">
                  पूरा नाम (Full Name)
                </label>
                <div className="relative mt-1.5">
                  <UserIcon
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="उदा. राहुल शर्मा"
                    required
                    className="focus-ring min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-10 pr-3 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]"
                    data-testid="input-signup-name"
                  />
                </div>
              </div>

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
                    placeholder="name@example.com"
                    required
                    className="focus-ring min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-10 pr-3 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]"
                    data-testid="input-signup-email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">
                  लक्ष्य परीक्षा (Target Exam)
                </label>
                <select
                  value={preferredExamId}
                  onChange={(e) => setPreferredExamId(e.target.value)}
                  className="focus-ring mt-1.5 min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 text-sm text-[hsl(var(--foreground))] outline-none"
                  data-testid="select-signup-exam"
                >
                  {exams.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.name} ({exam.targetAudience})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">
                  पासवर्ड (Password - कम से कम 6 अक्षर)
                </label>
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
                    required
                    minLength={6}
                    className="focus-ring min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-10 pr-10 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]"
                    data-testid="input-signup-password"
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]">
                  पासवर्ड पुनः दर्ज करें (Confirm Password)
                </label>
                <div className="relative mt-1.5">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="focus-ring min-h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] pl-10 pr-3 text-sm text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]"
                    data-testid="input-signup-confirm-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full mt-3"
                data-testid="button-submit-signup"
              >
                <UserPlus size={16} /> {loading ? 'खाता बन रहा है...' : 'खाता बनाएँ और शुरू करें'}
              </Button>
            </form>

            <div className="mt-6 border-t border-[hsl(var(--border))] pt-5 text-center text-xs text-[hsl(var(--muted-foreground))]">
              पहले से पंजीकृत हैं?{' '}
              <Link
                href="/login"
                className="font-bold text-[hsl(var(--primary))] hover:underline"
                data-testid="link-go-to-login"
              >
                लॉगिन करें (Sign In)
              </Link>
            </div>
          </Card>
        </Container>
      </section>
    </Layout>
  );
}

export default SignupPage;
