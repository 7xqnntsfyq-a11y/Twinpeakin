import { Router, Request, Response, NextFunction } from "express";
import { db } from "../db/index";
import { conversations, messages } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const userConversations = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, req.user!.id))
      .orderBy(desc(conversations.updatedAt));

    res.json({ conversations: userConversations });
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }

    const newConversation = await db
      .insert(conversations)
      .values({
        userId: req.user!.id,
        title,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    res.json({ conversation: newConversation[0] });
  } catch (error) {
    console.error("Create conversation error:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, req.user!.id)
        )
      )
      .limit(1);

    if (conversation.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json({ conversation: conversation[0] });
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    
    if (isNaN(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    const result = await db
      .delete(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, req.user!.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete conversation error:", error);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const { title, isArchived } = req.body;

    if (isNaN(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const result = await db
      .update(conversations)
      .set(updateData)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, req.user!.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json({ conversation: result[0] });
  } catch (error) {
    console.error("Update conversation error:", error);
    res.status(500).json({ error: "Failed to update conversation" });
  }
});

router.get("/:id/messages", requireAuth, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);

    if (isNaN(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    const conversation = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, req.user!.id)
        )
      )
      .limit(1);

    if (conversation.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const conversationMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);

    res.json({ messages: conversationMessages });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
