import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(isLogin ? "Welcome back!" : "Account created!");
        
        if (!isLogin) {
          setLocation("/onboarding");
        } else {
          const profileRes = await fetch("/api/profile");
          const profileData = await profileRes.json();
          if (profileData.profile.onboardingComplete) {
            setLocation("/chat");
          } else {
            setLocation("/onboarding");
          }
        }
      } else {
        const error = await res.json();
        toast.error(error.error || "Authentication failed");
      }
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20">
      <div className="w-full max-w-md p-8 bg-secondary/50 rounded-lg border border-border backdrop-blur">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">TwinPeakingOS</h1>
          <p className="text-sm text-muted-foreground">v1.3 • Privacy-First AI Copilot</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {isLoading ? "..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-8 text-xs text-muted-foreground text-center space-y-1">
          <p>🔒 Privacy by design</p>
          <p>No chat logs • No tracking • Anonymous telemetry only</p>
        </div>
      </div>
    </div>
  );
}
