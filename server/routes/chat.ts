import { Router, Request, Response, NextFunction } from "express";
import { ModeClassifier } from "../services/mode-classifier";
import { TwinPeakingConfig } from "../config/twinpeaking";
import { aiAssistant } from "../services/ai-assistant";

const router = Router();
const classifiers = new Map<number, ModeClassifier>();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

function getClassifier(userId: number): ModeClassifier {
  if (!classifiers.has(userId)) {
    classifiers.set(userId, new ModeClassifier());
  }
  return classifiers.get(userId)!;
}

router.post("/classify", requireAuth, (req, res) => {
  try {
    const { message } = req.body;
    const classifier = getClassifier(req.user!.id);
    const mode = classifier.classifyMessage(message);
    const modeConfig = TwinPeakingConfig.modes[mode];

    res.json({
      mode,
      config: modeConfig,
    });
  } catch (error) {
    console.error("Classification error:", error);
    res.status(500).json({ error: "Failed to classify message" });
  }
});

router.post("/set-mode", requireAuth, (req, res) => {
  try {
    const { mode, duration } = req.body;
    const classifier = getClassifier(req.user!.id);
    classifier.setManualOverride(mode, duration);

    res.json({ success: true, mode });
  } catch (error) {
    console.error("Mode override error:", error);
    res.status(500).json({ error: "Failed to set mode" });
  }
});

router.post("/clear-mode", requireAuth, (req, res) => {
  try {
    const classifier = getClassifier(req.user!.id);
    classifier.clearManualOverride();

    res.json({ success: true });
  } catch (error) {
    console.error("Clear mode error:", error);
    res.status(500).json({ error: "Failed to clear mode" });
  }
});

router.get("/mode", requireAuth, (req, res) => {
  try {
    const classifier = getClassifier(req.user!.id);
    const currentMode = classifier.getCurrentMode();

    res.json({ mode: currentMode });
  } catch (error) {
    console.error("Get mode error:", error);
    res.status(500).json({ error: "Failed to get mode" });
  }
});

router.post("/message", requireAuth, async (req, res) => {
  try {
    const { message, userProfile } = req.body;
    const userId = req.user!.id;
    
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Classify the message to determine the mode
    const classifier = getClassifier(userId);
    const mode = classifier.classifyMessage(message);
    const modeConfig = TwinPeakingConfig.modes[mode];

    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send initial mode information
    res.write(`data: ${JSON.stringify({ type: "mode", mode, config: modeConfig })}\n\n`);

    // Generate AI response stream
    const stream = await aiAssistant.generateResponse(userId, message, mode, userProfile);
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        res.write(`data: ${JSON.stringify({ type: "content", content: text })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    } catch (streamError) {
      console.error("Streaming error:", streamError);
      res.write(`data: ${JSON.stringify({ type: "error", error: "Stream interrupted" })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error("Chat error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to process message" });
    } else {
      res.write(`data: ${JSON.stringify({ type: "error", error: "Failed to generate response" })}\n\n`);
      res.end();
    }
  }
});

router.post("/clear-history", requireAuth, (req, res) => {
  try {
    const userId = req.user!.id;
    aiAssistant.clearHistory(userId);
    res.json({ success: true });
  } catch (error) {
    console.error("Clear history error:", error);
    res.status(500).json({ error: "Failed to clear history" });
  }
});

export default router;
