import { Router } from "express";
import bcrypt from "bcrypt";
import passport from "../auth/passport-config";
import { db } from "../db/index";
import { users, userProfiles } from "../db/schema";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await db
      .insert(users)
      .values({ username, passwordHash })
      .returning();

    await db.insert(userProfiles).values({
      userId: newUser[0].id,
      onboardingComplete: false,
    });

    req.login(newUser[0], (err) => {
      if (err) {
        return res.status(500).json({ error: "Login failed after registration" });
      }
      res.json({ user: { id: newUser[0].id, username: newUser[0].username } });
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.json({ user: { id: req.user.id, username: req.user.username } });
});

router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ success: true });
  });
});

router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: { id: req.user.id, username: req.user.username } });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

export default router;
