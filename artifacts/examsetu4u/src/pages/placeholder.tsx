import { BookOpen, FileText, LayoutDashboard, LockKeyhole, Shield, Sparkles } from 'lucide-react';
import { Button, Container, Layout, SectionTitle } from '@/components/site';

const pageContent: Record<string, { eyebrow: string; title: string; description: string; icon: typeof BookOpen }> = {
  '/study-material': { eyebrow: 'Study material', title: 'Your study space is being prepared.', description: 'Exam-wise notes and subject resources will live here in a future module.', icon: BookOpen },
  '/pyq': { eyebrow: 'Previous year questions', title: 'Past questions, coming soon.', description: 'This page is reserved for a focused PYQ experience. For now, keep building your foundation.', icon: FileText },
  '/quiz': { eyebrow: 'MCQ practice', title: 'Practice mode is on the way.', description: 'A future module will bring question practice here. No quiz engine is included in this foundation.', icon: Sparkles },
  '/theory': { eyebrow: 'Theory questions', title: 'A place for deeper answers.', description: 'Theory prompts and revision support will be added in a later module.', icon: BookOpen },
  '/login': { eyebrow: 'Account access', title: 'Accounts are not part of Module 1.', description: 'ExamSetu4U is currently a frontend foundation. No authentication or user data is being collected.', icon: LockKeyhole },
  '/dashboard': { eyebrow: 'Student dashboard', title: 'Your dashboard will come later.', description: 'Progress tracking and personal study plans are future functionality, intentionally not included yet.', icon: LayoutDashboard },
  '/admin': { eyebrow: 'Admin', title: 'Content management is not enabled.', description: 'There is no admin backend in Module 1. This route is here as a clean placeholder only.', icon: Shield },
};

export default function PlaceholderPage({ path }: { path: string }) {
  const content = pageContent[path] ?? pageContent['/study-material'];
  const Icon = content.icon;
  return <Layout><section className="paper-grid min-h-[58vh] py-16 sm:py-24"><Container><div className="mx-auto max-w-2xl rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/.92)] p-7 text-center shadow-[var(--shadow)] sm:p-12"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Icon size={25} /></span><SectionTitle as="h1" eyebrow={content.eyebrow} title={content.title} description={content.description} /><Button href="/" variant="secondary" className="mt-8" data-testid={`button-placeholder-home-${path.slice(1)}`}>Return home</Button></div></Container></section></Layout>;
}