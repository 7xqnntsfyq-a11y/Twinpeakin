import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db/index";
import { userPreferences } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const preferences = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, req.user!.id))
      .limit(1);

    if (preferences.length === 0) {
      const defaultPreferences = await db
        .insert(userPreferences)
        .values({
          userId: req.user!.id,
          theme: "dark",
          sidebarCollapsed: false,
          customSettings: {},
          updatedAt: new Date(),
        })
        .returning();

      return res.json({ preferences: defaultPreferences[0] });
    }

    res.json({ preferences: preferences[0] });
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

router.put("/", requireAuth, async (req, res) => {
  try {
    const { theme, sidebarCollapsed, customSettings } = req.body;

    const updateData: any = { updatedAt: new Date() };
    if (theme !== undefined) updateData.theme = theme;
    if (sidebarCollapsed !== undefined) updateData.sidebarCollapsed = sidebarCollapsed;
    if (customSettings !== undefined) updateData.customSettings = customSettings;

    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, req.user!.id))
      .limit(1);

    let result;
    if (existing.length === 0) {
      result = await db
        .insert(userPreferences)
        .values({
          userId: req.user!.id,
          theme: theme || "dark",
          sidebarCollapsed: sidebarCollapsed || false,
          customSettings: customSettings || {},
          updatedAt: new Date(),
        })
        .returning();
    } else {
      result = await db
        .update(userPreferences)
        .set(updateData)
        .where(eq(userPreferences.userId, req.user!.id))
        .returning();
    }

    res.json({ preferences: result[0] });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

export default router;
