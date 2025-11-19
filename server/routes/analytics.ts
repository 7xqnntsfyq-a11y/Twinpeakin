import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db/index";
import { conversations, messages } from "../db/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

router.get("/summary", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;

    const totalConversationsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(conversations)
      .where(eq(conversations.userId, userId));

    const totalConversations = totalConversationsResult[0]?.count || 0;

    const totalMessagesResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(eq(conversations.userId, userId));

    const totalMessages = totalMessagesResult[0]?.count || 0;

    const modeUsageResult = await db
      .select({
        mode: messages.mode,
        count: sql<number>`count(*)::int`,
      })
      .from(messages)
      .innerJoin(conversations, eq(messages.conversationId, conversations.id))
      .where(eq(conversations.userId, userId))
      .groupBy(messages.mode);

    const modeUsage = modeUsageResult.reduce((acc, row) => {
      acc[row.mode] = row.count;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      totalConversations,
      totalMessages,
      modeUsage,
    });
  } catch (error) {
    console.error("Analytics summary error:", error);
    res.status(500).json({ error: "Failed to fetch analytics summary" });
  }
});

export default router;
