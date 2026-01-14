import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { LanguageProvider } from "@/hooks/use-language";
import { Navbar } from "@/components/Navbar";
import NotFound from "@/pages/not-found";

// Pages
import Landing from "@/pages/Landing";
import Services from "@/pages/Services";
import Providers from "@/pages/Providers";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/services" component={Services} />
      <Route path="/providers" component={Providers} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen font-body">
            <Navbar />
            <main className="flex-1">
              <Router />
            </main>
            <Toaster />
            <footer className="border-t py-8 bg-background text-center text-muted-foreground text-sm">
              <div className="container mx-auto">
                &copy; {new Date().getFullYear()} ServiceHub. All rights reserved.
              </div>
            </footer>
          </div>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
