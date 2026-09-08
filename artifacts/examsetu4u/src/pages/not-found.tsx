import { Button, Container, Layout } from '@/components/site';

export default function NotFoundPage() {
  return <Layout><section className="paper-grid flex min-h-[58vh] items-center py-16"><Container><div className="mx-auto max-w-lg text-center"><p className="font-display text-8xl leading-none text-[hsl(var(--accent-foreground))]">404</p><h1 className="font-display mt-5 text-4xl text-[hsl(var(--primary))]">Page Not Found</h1><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">The page you are looking for does not exist or has moved.</p><Button href="/" className="mt-8" data-testid="button-return-home">Return Home</Button></div></Container></section></Layout>;
}
