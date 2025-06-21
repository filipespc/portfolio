import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Portfolio from "@/pages/portfolio";
import Playground from "@/pages/playground";
import CaseStudyPage from "@/pages/case-study";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center texture-overlay">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sollo-red"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Portfolio} />
      <Route path="/case-study/:slug" component={CaseStudyPage} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        {isAuthenticated ? <AdminDashboard /> : <AdminLogin />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="texture-overlay">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
