import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/chat");
    }, 5000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-gray-900 via-black to-blue-950 border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-500/20 p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Welcome to Pro!
          </h1>

          <p className="text-xl text-gray-300 mb-2">
            Your Pro subscription is now active!
          </p>

          <p className="text-gray-400 mb-8">
            You now have access to full MBTI insights, detailed archetypes, and advanced analytics.
          </p>

          <button
            onClick={() => setLocation("/chat")}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            Go to Chat
            <ArrowRight size={20} />
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Redirecting automatically in 5 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
