import express from "express";
import session from "express-session";
import passport from "./auth/passport-config";
import authRoutes from "./routes/auth";
import profileRoutes from "./routes/profile";
import chatRoutes from "./routes/chat";
import { TelemetryService } from "./services/telemetry";
import MemoryStore from "memorystore";

const app = express();
const PORT = process.env.PORT || 3000;

const MemoryStoreSession = MemoryStore(session);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "twinpeaking-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000,
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", version: "1.3" });
});

app.get("/api/config", (_req, res) => {
  res.json({
    mbtiQuestions: require("./config/twinpeaking").TwinPeakingConfig.mbtiQuestions,
    archetypes: require("./config/twinpeaking").TwinPeakingConfig.archetypes,
  });
});

app.get("/api/telemetry", async (_req, res) => {
  const count = await TelemetryService.getInstanceCount();
  res.json({ instanceCount: count });
});

app.listen(PORT, async () => {
  console.log(`TwinPeakingOS server running on port ${PORT}`);
  await TelemetryService.incrementRuntimeStart();
  console.log("Telemetry: Runtime start recorded");
});
