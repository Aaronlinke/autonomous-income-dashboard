import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const affiliateDrafts = mysqlTable("affiliateDrafts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  programName: varchar("programName", { length: 160 }).notNull(),
  programCategory: varchar("programCategory", { length: 160 }).notNull(),
  website: varchar("website", { length: 500 }).notNull(),
  audience: text("audience").notNull(),
  promotionChannels: text("promotionChannels").notNull(),
  contentPlan: text("contentPlan").notNull(),
  generatedDraft: text("generatedDraft").notNull(),
  disclosure: text("disclosure").notNull(),
  riskNotes: text("riskNotes").notNull(),
  nextSteps: text("nextSteps").notNull(),
  status: mysqlEnum("status", ["draft", "approved", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AffiliateDraft = typeof affiliateDrafts.$inferSelect;
export type InsertAffiliateDraft = typeof affiliateDrafts.$inferInsert;
