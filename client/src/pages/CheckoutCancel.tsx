import { useLocation } from "wouter";
import { XCircle, ArrowRight, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createCheckoutSession } from "../lib/api";
import { STRIPE_CONFIG } from "../config/stripe";

export default function CheckoutCancel() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleTryAgain = async () => {
    setIsLoading(true);
    try {
      const data = await createCheckoutSession(STRIPE_CONFIG.proPriceId);
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-gray-900 via-black to-blue-950 border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-500/20 p-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full">
              <XCircle className="w-16 h-16 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Payment Cancelled
          </h1>

          <p className="text-xl text-gray-300 mb-2">
            Your payment was not completed
          </p>

          <p className="text-gray-400 mb-8">
            No charges were made to your account. You can try again anytime to unlock Pro features.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={20} />
              {isLoading ? "Processing..." : "Try Again"}
            </button>

            <button
              onClick={() => setLocation("/chat")}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold rounded-lg transition-all duration-200"
            >
              Return to Chat
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
