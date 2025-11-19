export const SubscriptionTiers = {
  free: {
    name: "Free",
    price: 0,
    features: {
      mbtiBasicInfo: true,
      mbtiFullInsights: false,
      mbtiArchetypes: false,
      chatMessages: true,
      conversationHistory: true,
    }
  },
  pro: {
    name: "Pro",
    price: 10.99,
    features: {
      mbtiBasicInfo: true,
      mbtiFullInsights: true,
      mbtiArchetypes: true,
      chatMessages: true,
      conversationHistory: true,
    }
  }
};

export type SubscriptionTier = "free" | "pro";

export function getSubscriptionFeatures(tier: SubscriptionTier = "free") {
  return SubscriptionTiers[tier].features;
}
