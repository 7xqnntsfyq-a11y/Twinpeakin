import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db/index";
import { userProfiles, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { MBTIDetector } from "../services/mbti-detector";
import { TwinPeakingConfig } from "../config/twinpeaking";
import { SubscriptionTiers } from "../config/subscriptionTiers";

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, req.user!.id))
      .limit(1);

    if (profile.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    // Get user's subscription tier
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    const tier = user?.subscriptionTier || 'free';
    const tierFeatures = SubscriptionTiers[tier as keyof typeof SubscriptionTiers];

    // Filter profile data based on subscription tier
    const fullProfile = profile[0];
    const restrictedProfile: any = {
      id: fullProfile.id,
      userId: fullProfile.userId,
      onboardingComplete: fullProfile.onboardingComplete,
      updatedAt: fullProfile.updatedAt,
    };

    // Free tier: Only show MBTI type codes (4 letters)
    if (tierFeatures.features.mbtiBasicInfo) {
      restrictedProfile.coreMbti = fullProfile.coreMbti;
      restrictedProfile.fieldMbti = fullProfile.fieldMbti;
    }

    // Pro tier: Show full insights and labels
    if (tierFeatures.features.mbtiFullInsights) {
      restrictedProfile.coreSelfLabel = fullProfile.coreSelfLabel;
      restrictedProfile.fieldSelfLabel = fullProfile.fieldSelfLabel;
    }

    // Pro tier: Show archetype information
    if (tierFeatures.features.mbtiArchetypes) {
      restrictedProfile.tonePrefs = fullProfile.tonePrefs;
      restrictedProfile.learnedPatterns = fullProfile.learnedPatterns;
    }

    res.json({ 
      profile: restrictedProfile,
      subscriptionTier: tier,
      features: tierFeatures.features
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.post("/complete-onboarding", requireAuth, async (req, res) => {
  try {
    const { responses, coreSelfLabel, fieldSelfLabel } = req.body;

    const mbtiResult = MBTIDetector.inferMBTI(responses);

    const coreArchetype = TwinPeakingConfig.archetypes[mbtiResult.coreMbti as keyof typeof TwinPeakingConfig.archetypes];
    const fieldArchetype = TwinPeakingConfig.archetypes[mbtiResult.fieldMbti as keyof typeof TwinPeakingConfig.archetypes];

    await db
      .update(userProfiles)
      .set({
        coreSelfLabel: coreSelfLabel || `${mbtiResult.coreMbti} (${coreArchetype})`,
        fieldSelfLabel: fieldSelfLabel || `${mbtiResult.fieldMbti} (${fieldArchetype})`,
        coreMbti: mbtiResult.coreMbti,
        fieldMbti: mbtiResult.fieldMbti,
        onboardingComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, req.user!.id));

    res.json({
      success: true,
      result: {
        core: `${mbtiResult.coreMbti} (${coreArchetype})`,
        field: `${mbtiResult.fieldMbti} (${fieldArchetype})`,
        confidence: mbtiResult.confidence,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ error: "Failed to complete onboarding" });
  }
});

router.post("/update", requireAuth, async (req, res) => {
  try {
    const { coreSelfLabel, fieldSelfLabel } = req.body;

    await db
      .update(userProfiles)
      .set({
        coreSelfLabel,
        fieldSelfLabel,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, req.user!.id));

    res.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
