import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import ProjectDetail from "./pages/ProjectDetail";
import Billing from "./pages/Billing";
import BrokerProfile from "./pages/BrokerProfile";
import SharedReport from "./pages/SharedReport";
import Onboarding from "./pages/Onboarding";
import CompareProperties from "./pages/CompareProperties";
import Referrals from "./pages/Referrals";
import Join from "./pages/Join";
import ReferralTerms from "./pages/ReferralTerms";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Security from "./pages/Security";
import Start from "./pages/Start";
import Demo from "./pages/Demo";
import PWAInstallPrompt from "./components/PWAInstallPrompt";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/new" component={NewProject} />
      <Route path="/project/:id" component={ProjectDetail} />
      <Route path="/billing" component={Billing} />
      <Route path="/profile" component={BrokerProfile} />
      <Route path="/report/:token" component={SharedReport} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/compare" component={CompareProperties} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/referrals/terms" component={ReferralTerms} />
      <Route path="/join" component={Join} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/contact" component={Contact} />
      <Route path="/security" component={Security} />
      <Route path="/start" component={Start} />
      <Route path="/demo" component={Demo} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <PWAInstallPrompt />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
