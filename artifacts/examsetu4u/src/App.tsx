import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Router as WouterRouter, Switch } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import ExamsPage from '@/pages/exams';
import Home from '@/pages/home';
import NotFoundPage from '@/pages/not-found';
import PlaceholderPage from '@/pages/placeholder';

const queryClient = new QueryClient();

function PlaceholderRoute({ path }: { path: string }) {
  return <PlaceholderPage path={path} />;
}

function Router() {
  return <ErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/exams" component={ExamsPage} /><Route path="/study-material"><PlaceholderRoute path="/study-material" /></Route><Route path="/pyq"><PlaceholderRoute path="/pyq" /></Route><Route path="/quiz"><PlaceholderRoute path="/quiz" /></Route><Route path="/theory"><PlaceholderRoute path="/theory" /></Route><Route path="/login"><PlaceholderRoute path="/login" /></Route><Route path="/dashboard"><PlaceholderRoute path="/dashboard" /></Route><Route path="/admin"><PlaceholderRoute path="/admin" /></Route><Route component={NotFoundPage} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;