import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  coreSelfLabel: text("core_self_label"),
  fieldSelfLabel: text("field_self_label"),
  coreMbti: text("core_mbti"),
  fieldMbti: text("field_mbti"),
  tonePrefs: jsonb("tone_prefs").$type<Record<string, any>>(),
  learnedPatterns: jsonb("learned_patterns").$type<Record<string, any>>(),
  onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const telemetry = pgTable("telemetry", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  instanceCount: integer("instance_count").default(0).notNull(),
  lastIncrement: timestamp("last_increment").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type NewUserProfile = typeof userProfiles.$inferInsert;
