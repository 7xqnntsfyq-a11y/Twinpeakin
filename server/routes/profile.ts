import { Router } from "express";
import { db } from "../db/index";
import { userProfiles } from "../db/schema";
import { eq } from "drizzle-orm";
import { MBTIDetector } from "../services/mbti-detector";
import { TwinPeakingConfig } from "../config/twinpeaking";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, req.user.id))
      .limit(1);

    if (profile.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ profile: profile[0] });
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
      .where(eq(userProfiles.userId, req.user.id));

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
      .where(eq(userProfiles.userId, req.user.id));

    res.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
