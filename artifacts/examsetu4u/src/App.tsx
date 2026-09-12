import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Router as WouterRouter, Switch } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { ScrollToTop } from '@/components/scroll-to-top';
import { ThemeProvider } from '@/context/theme-context';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import ExamsPage from '@/pages/exams';
import Home from '@/pages/home';
import NotFoundPage from '@/pages/not-found';
import PlaceholderPage from '@/pages/placeholder';
import ExamDetailPage from '@/pages/exam-detail';
import SubjectDetailPage from '@/pages/subject-detail';
import TopicDetailPage from '@/pages/topic-detail';
import StudyMaterialPage from '@/pages/study-material';
import StudyMaterialDirectoryPage from '@/pages/study-material-directory';
import TheoryGuidePage from '@/pages/theory';
import QuizPage from '@/pages/quiz';
import LoginPage from '@/pages/login';
import SignupPage from '@/pages/signup';
import ProfilePage from '@/pages/profile';
import DashboardPage from '@/pages/dashboard';
import AnalyticsPage from '@/pages/analytics';
import AchievementsPage from '@/pages/achievements';
import SearchPage from '@/pages/search';
import MistakesPage from '@/pages/mistakes';
import MistakesPracticePage from '@/pages/mistakes-practice';
import WeakTopicsPage from '@/pages/weak-topics';
import MockTestsListPage from '@/pages/mock-tests';
import ExamMockTestsPage from '@/pages/mock-tests/exam';
import MockTestStartPage from '@/pages/mock-tests/start';
import MockTestLiveExamPage from '@/pages/mock-tests/live';
import MockTestResultPage from '@/pages/mock-tests/result';
import MockTestHistoryPage from '@/pages/mock-tests/history';
import AdminPage from '@/pages/admin';
import CurrentAffairsPage from '@/pages/current-affairs';
import StudyPlannerPage from '@/pages/study-planner';
import StudyPlannerHistoryPage from '@/pages/study-planner-history';
import { PYQDashboardPage, PYQExamPage, PYQPracticePage, PYQSubjectPage } from '@/pages/pyq';

const queryClient = new QueryClient();

function PlaceholderRoute({ path }: { path: string }) {
  return <PlaceholderPage path={path} />;
}

function Router() {
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={SearchPage} />
        <Route path="/exams" component={ExamsPage} />
        <Route path="/exams/uppcs-pre/current-affairs" component={CurrentAffairsPage} />
        <Route path="/exams/uppcs-pre/uppcs-pre-current-affairs" component={CurrentAffairsPage} />
        <Route path="/current-affairs" component={CurrentAffairsPage} />
        <Route path="/exams/:examId/:subjectId/:topicId" component={TopicDetailPage} />
        <Route path="/exams/:examId/:subjectId" component={SubjectDetailPage} />
        <Route path="/exams/:examId" component={ExamDetailPage} />
        <Route path="/study-material/:examId/:subjectId/:topicId" component={StudyMaterialPage} />
        <Route path="/study-material" component={StudyMaterialDirectoryPage} />
        <Route path="/pyq" component={PYQDashboardPage} />
        <Route path="/pyq/:examId/:subjectId/:topicId" component={PYQPracticePage} />
        <Route path="/pyq/:examId/:subjectId" component={PYQSubjectPage} />
        <Route path="/pyq/:examId" component={PYQExamPage} />
        <Route path="/quiz/:examId/:subjectId/:topicId" component={QuizPage} />
        <Route path="/quiz/:examId/:subjectId" component={QuizPage} />
        <Route path="/quiz/:examId" component={QuizPage} />
        <Route path="/quiz" component={QuizPage} />
        <Route path="/mock-tests/history" component={MockTestHistoryPage} />
        <Route path="/mock-tests/result/:attemptId" component={MockTestResultPage} />
        <Route path="/mock-tests/live/:testId" component={MockTestLiveExamPage} />
        <Route path="/mock-tests/start/:testId" component={MockTestStartPage} />
        <Route path="/mock-tests/:examId" component={ExamMockTestsPage} />
        <Route path="/mock-tests" component={MockTestsListPage} />
        <Route path="/mistakes/practice" component={MistakesPracticePage} />
        <Route path="/mistakes" component={MistakesPage} />
        <Route path="/practice/weak-topics" component={WeakTopicsPage} />
        <Route path="/theory" component={TheoryGuidePage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/profile" component={ProfilePage} />
        <Route path="/study-planner/history" component={StudyPlannerHistoryPage} />
        <Route path="/study-planner" component={StudyPlannerPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/achievements" component={AchievementsPage} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <ScrollToTop />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;