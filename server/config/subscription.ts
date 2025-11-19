export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro'
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

export const TIER_FEATURES = {
  [SUBSCRIPTION_TIERS.FREE]: {
    name: 'Free',
    price: 0,
    features: [
      'Basic dual-mode AI chat',
      'MBTI type codes only',
      'Limited conversation history',
      'Anonymous telemetry only'
    ],
    limits: {
      showFullMBTI: false,
      showArchetypes: false,
      showDetailedInsights: false,
      maxConversations: 10
    }
  },
  [SUBSCRIPTION_TIERS.PRO]: {
    name: 'Pro',
    price: 10.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID, // Will be set after creating Stripe product
    features: [
      'Unlimited dual-mode AI chat',
      'Full Myers-Briggs personality insights',
      'Detailed MBTI archetype information',
      'Unlimited conversation history',
      'Priority support'
    ],
    limits: {
      showFullMBTI: true,
      showArchetypes: true,
      showDetailedInsights: true,
      maxConversations: Infinity
    }
  }
} as const;

export function canAccessFeature(tier: SubscriptionTier, feature: keyof typeof TIER_FEATURES['free']['limits']): boolean | number {
  return TIER_FEATURES[tier].limits[feature];
}
