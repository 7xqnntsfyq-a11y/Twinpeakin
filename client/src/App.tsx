import { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import ChatPage from "./pages/ChatPage";

const queryClient = new QueryClient();

function App() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
          return res.json();
        }
        throw new Error("Not authenticated");
      })
      .then(() => {
        fetch("/api/profile")
          .then((res) => res.json())
          .then((data) => {
            if (!data.profile.onboardingComplete) {
              setLocation("/onboarding");
            } else {
              setLocation("/chat");
            }
          });
      })
      .catch(() => {
        setIsAuthenticated(false);
        setLocation("/");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading TwinPeakingOS...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={LoginPage} />
        <Route path="/onboarding" component={OnboardingPage} />
        <Route path="/chat" component={ChatPage} />
      </Switch>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
