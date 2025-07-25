import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/components/language-provider";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Wallet from "@/pages/wallet";
import Bookings from "@/pages/bookings";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import MobileNavigation from "@/components/MobileNavigation";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="main-content">
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/wallet" component={Wallet} />
            <Route path="/bookings" component={Bookings} />
            <Route path="/profile" component={Profile} />
            <Route path="/admin" component={Admin} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      <MobileNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
