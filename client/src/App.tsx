import { useState, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import ChatPage from "./pages/ChatPage";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";

const queryClient = new QueryClient();

function App() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Not authenticated");
      })
      .then(() => {
        setIsAuthenticated(true);
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-lg bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Loading Twinpeakin...
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/" component={LoginPage} />
        <Route path="/checkout/success" component={CheckoutSuccess} />
        <Route path="/checkout/cancel" component={CheckoutCancel} />
        {isAuthenticated && (
          <>
            <Route path="/onboarding" component={OnboardingPage} />
            <Route path="/chat" component={ChatPage} />
          </>
        )}
      </Switch>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
