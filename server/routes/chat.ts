import { Router } from "express";
import { ModeClassifier } from "../services/mode-classifier";
import { TwinPeakingConfig } from "../config/twinpeaking";

const router = Router();
const classifiers = new Map<number, ModeClassifier>();

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
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
    const classifier = getClassifier(req.user.id);
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
    const classifier = getClassifier(req.user.id);
    classifier.setManualOverride(mode, duration);

    res.json({ success: true, mode });
  } catch (error) {
    console.error("Mode override error:", error);
    res.status(500).json({ error: "Failed to set mode" });
  }
});

router.post("/clear-mode", requireAuth, (req, res) => {
  try {
    const classifier = getClassifier(req.user.id);
    classifier.clearManualOverride();

    res.json({ success: true });
  } catch (error) {
    console.error("Clear mode error:", error);
    res.status(500).json({ error: "Failed to clear mode" });
  }
});

router.get("/mode", requireAuth, (req, res) => {
  try {
    const classifier = getClassifier(req.user.id);
    const currentMode = classifier.getCurrentMode();

    res.json({ mode: currentMode });
  } catch (error) {
    console.error("Get mode error:", error);
    res.status(500).json({ error: "Failed to get mode" });
  }
});

export default router;
