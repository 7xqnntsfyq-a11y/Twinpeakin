import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { db } from "../db/index";
import { users, userProfiles } from "../db/schema";
import { eq } from "drizzle-orm";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user || user.length === 0) {
        return done(null, false, { message: "Incorrect username." });
      }

      const isValid = await bcrypt.compare(password, user[0].passwordHash);
      if (!isValid) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user[0]);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user && user.length > 0) {
      done(null, user[0]);
    } else {
      done(new Error("User not found"));
    }
  } catch (error) {
    done(error);
  }
});

export default passport;
