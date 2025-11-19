import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createCheckoutSession } from "../lib/api";

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradePrompt({ isOpen, onClose }: UpgradePromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const data = await createCheckoutSession();
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

  const features = {
    free: [
      "Core & Field personality labels",
      "Basic chat functionality",
      "Limited insights",
    ],
    pro: [
      "Full MBTI personality types",
      "Complete personality insights",
      "Detailed archetypes & analysis",
      "Advanced analytics dashboard",
      "Priority support",
      "Unlimited conversations",
    ],
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-blue-950 border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-500/20 z-50 animate-in fade-in zoom-in">
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <Dialog.Title className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Upgrade to Pro
                  </Dialog.Title>
                  <Dialog.Description className="text-gray-400 mt-1">
                    Unlock the full potential of Twinpeakin
                  </Dialog.Description>
                </div>
              </div>
              <Dialog.Close className="p-2 hover:bg-blue-900/20 rounded-lg transition-colors text-gray-400 hover:text-white">
                <X size={20} />
              </Dialog.Close>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="p-6 bg-gray-900/50 border border-gray-700/50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Free Plan</h3>
                <ul className="space-y-3">
                  {features.free.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-400">
                      <Check size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/50 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-bl-lg">
                  POPULAR
                </div>
                <h3 className="text-lg font-semibold text-white mb-4">Pro Plan</h3>
                <ul className="space-y-3">
                  {features.pro.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-200">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Pro Subscription</p>
                  <p className="text-3xl font-bold text-white">
                    $10.99
                    <span className="text-lg text-gray-400 font-normal">/month</span>
                  </p>
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Processing..." : "Upgrade Now"}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Secure payment powered by Stripe • Cancel anytime
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
