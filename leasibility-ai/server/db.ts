import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, scenarios, brokerProfiles, InsertProject, InsertScenario, InsertBrokerProfile } from "../drizzle/schema";
import { ENV } from './_core/env';

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

// ─── User Usage Helpers ──────────────────────────────────────
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function incrementAnalysisCount(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  const now = new Date();
  // Reset counter if we're in a new calendar month
  const resetDate = user.analysisResetDate;
  const needsReset = !resetDate ||
    resetDate.getFullYear() !== now.getFullYear() ||
    resetDate.getMonth() !== now.getMonth();

  await db.update(users).set({
    analysisCount: needsReset ? 1 : (user.analysisCount ?? 0) + 1,
    analysisResetDate: needsReset ? now : resetDate,
  }).where(eq(users.id, userId));
}

export async function getMonthlyAnalysisCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const user = await getUserById(userId);
  if (!user) return 0;

  const now = new Date();
  const resetDate = user.analysisResetDate;
  const isSameMonth = resetDate &&
    resetDate.getFullYear() === now.getFullYear() &&
    resetDate.getMonth() === now.getMonth();

  return isSameMonth ? (user.analysisCount ?? 0) : 0;
}

// ─── Broker Profiles ──────────────────────────────────────────
export async function getBrokerProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(brokerProfiles).where(eq(brokerProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertBrokerProfile(data: InsertBrokerProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(brokerProfiles).values(data).onDuplicateKeyUpdate({
    set: {
      brokerName: data.brokerName,
      brokerTitle: data.brokerTitle,
      brokerPhone: data.brokerPhone,
      brokerCompany: data.brokerCompany,
      brokerLogoUrl: data.brokerLogoUrl,
      brokerPhotoUrl: data.brokerPhotoUrl,
    }
  });
}

// ─── Projects ─────────────────────────────────────────────────
export async function getProjectsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(and(eq(projects.id, id), eq(projects.userId, userId))).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data);
  return (result[0] as any).insertId as number;
}

export async function updateProject(id: number, userId: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set(data).where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

export async function deleteProject(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(scenarios).where(eq(scenarios.projectId, id));
  await db.delete(projects).where(and(eq(projects.id, id), eq(projects.userId, userId)));
}

// ─── Scenarios ────────────────────────────────────────────────
export async function getScenariosByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scenarios).where(eq(scenarios.projectId, projectId)).orderBy(scenarios.scenarioNumber);
}

export async function createScenario(data: InsertScenario) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(scenarios).values(data);
  return (result[0] as any).insertId as number;
}

export async function deleteScenariosByProject(projectId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(scenarios).where(eq(scenarios.projectId, projectId));
}
