import { and, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { affiliateDrafts, InsertAffiliateDraft, InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import { createLikePattern, DraftHistorySearch } from "./draftHistory";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createAffiliateDraft(draft: InsertAffiliateDraft) {
  const db = await getDb();
  if (!db) throw new Error("Entwurfsablage ist derzeit nicht verfügbar.");
  await db.insert(affiliateDrafts).values(draft);
  const rows = await db.select().from(affiliateDrafts)
    .where(and(eq(affiliateDrafts.userId, draft.userId), eq(affiliateDrafts.programName, draft.programName)))
    .orderBy(desc(affiliateDrafts.createdAt))
    .limit(1);
  return rows[0];
}

export async function listAffiliateDrafts(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Entwurfsablage ist derzeit nicht verfügbar.");
  return db.select().from(affiliateDrafts)
    .where(eq(affiliateDrafts.userId, userId))
    .orderBy(desc(affiliateDrafts.updatedAt))
    .limit(20);
}

export async function searchAffiliateDrafts(
  userId: number,
  search: DraftHistorySearch,
  dbOverride?: NonNullable<Awaited<ReturnType<typeof getDb>>>,
) {
  const db = dbOverride ?? await getDb();
  if (!db) throw new Error("Entwurfsablage ist derzeit nicht verfügbar.");

  const conditions = [eq(affiliateDrafts.userId, userId)];
  if (search.status !== "all") conditions.push(eq(affiliateDrafts.status, search.status));
  if (search.query) {
    const pattern = createLikePattern(search.query);
    const matchingFields = or(
      like(affiliateDrafts.programName, pattern),
      like(affiliateDrafts.programCategory, pattern),
      like(affiliateDrafts.website, pattern),
      like(affiliateDrafts.audience, pattern),
      like(affiliateDrafts.generatedDraft, pattern),
    );
    if (matchingFields) conditions.push(matchingFields);
  }

  return db.select().from(affiliateDrafts)
    .where(and(...conditions))
    .orderBy(desc(affiliateDrafts.updatedAt))
    .limit(100);
}

export async function setAffiliateDraftStatus(userId: number, draftId: number, status: "approved" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("Entwurfsablage ist derzeit nicht verfügbar.");
  await db.update(affiliateDrafts).set({ status })
    .where(and(eq(affiliateDrafts.id, draftId), eq(affiliateDrafts.userId, userId)));
  const rows = await db.select().from(affiliateDrafts)
    .where(and(eq(affiliateDrafts.id, draftId), eq(affiliateDrafts.userId, userId)))
    .limit(1);
  return rows[0];
}
