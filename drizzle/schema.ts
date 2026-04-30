import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar, float, json } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Stripe
  stripeCustomerId: varchar("stripeCustomerId", { length: 64 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 64 }),
  stripePlan: mysqlEnum("stripePlan", ["starter", "professional", "team"]),
  stripeStatus: varchar("stripeStatus", { length: 32 }), // active, trialing, past_due, canceled
  trialEndsAt: timestamp("trialEndsAt"),
  subscriptionEndsAt: timestamp("subscriptionEndsAt"),
  // Usage tracking for plan enforcement
  analysisCount: int("analysisCount").default(0).notNull(),
  analysisResetDate: timestamp("analysisResetDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Broker profile — branding data embedded in every exported report
export const brokerProfiles = mysqlTable("brokerProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  brokerName: text("brokerName"),
  brokerTitle: text("brokerTitle"),
  brokerPhone: varchar("brokerPhone", { length: 32 }),
  brokerEmail: varchar("brokerEmail", { length: 320 }),
  brokerCompany: text("brokerCompany"),
  brokerLogoUrl: text("brokerLogoUrl"),
  brokerLogoKey: text("brokerLogoKey"),
  brokerPhotoUrl: text("brokerPhotoUrl"),
  brokerPhotoKey: text("brokerPhotoKey"),
  profileComplete: boolean("profileComplete").default(false),
  onboardingCompleted: boolean("onboardingCompleted").default(false),
  onboardingRole: varchar("onboardingRole", { length: 64 }),
  onboardingDealVolume: varchar("onboardingDealVolume", { length: 32 }),
  onboardingMarket: varchar("onboardingMarket", { length: 100 }),
  onboardingPainPoints: text("onboardingPainPoints"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrokerProfile = typeof brokerProfiles.$inferSelect;
export type InsertBrokerProfile = typeof brokerProfiles.$inferInsert;

// A project = one property being evaluated for a tenant
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  propertyName: text("propertyName").notNull(),
  propertyAddress: text("propertyAddress"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  market: varchar("market", { length: 100 }),
  totalSqFt: int("totalSqFt"),
  floorNumber: varchar("floorNumber", { length: 20 }),
  floorPlanUrl: text("floorPlanUrl"),
  floorPlanKey: text("floorPlanKey"),
  inputMethod: mysqlEnum("inputMethod", ["upload", "scan"]).default("upload"),
  status: mysqlEnum("status", ["draft", "analyzing", "complete", "error"]).default("draft").notNull(),
  tenantName: text("tenantName"),
  headcount: int("headcount"),
  industry: varchar("industry", { length: 100 }),
  programNotes: text("programNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// Each project gets 3 AI-generated scenarios
export const scenarios = mysqlTable("scenarios", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  scenarioNumber: int("scenarioNumber").notNull(), // 1, 2, 3
  impactLevel: mysqlEnum("impactLevel", ["low", "medium", "high"]).notNull(),
  label: varchar("label", { length: 100 }),
  efficiencyScore: int("efficiencyScore"),
  usableSqFt: int("usableSqFt"),
  totalSqFt: int("totalSqFt"),
  roomBreakdown: json("roomBreakdown"),
  layoutDescription: text("layoutDescription"),
  layoutSvg: text("layoutSvg"),
  layoutImageUrl: text("layoutImageUrl"),
  budgetLow: float("budgetLow"),
  budgetMid: float("budgetMid"),
  budgetHigh: float("budgetHigh"),
  costPerSqFtLow: float("costPerSqFtLow"),
  costPerSqFtMid: float("costPerSqFtMid"),
  costPerSqFtHigh: float("costPerSqFtHigh"),
  budgetBreakdown: json("budgetBreakdown"),
  scheduleWeeksLow: int("scheduleWeeksLow"),
  scheduleWeeksMid: int("scheduleWeeksMid"),
  scheduleWeeksHigh: int("scheduleWeeksHigh"),
  schedulePhases: json("schedulePhases"),
  aiSummary: text("aiSummary"),
  existingConditionsInventory: json("existingConditionsInventory"),
  programFit: json("programFit"),
  scopeSummary: json("scopeSummary"),
  renderingStatus: json("renderingStatus"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Scenario = typeof scenarios.$inferSelect;
export type InsertScenario = typeof scenarios.$inferInsert;

// Share tokens — each project can have one active public share link
export const shareTokens = mysqlTable("shareTokens", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(), // broker who created it
  viewCount: int("viewCount").default(0).notNull(),
  lastViewedAt: timestamp("lastViewedAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShareToken = typeof shareTokens.$inferSelect;
export type InsertShareToken = typeof shareTokens.$inferInsert;

// Individual view events — one row per open
export const reportViews = mysqlTable("reportViews", {
  id: int("id").autoincrement().primaryKey(),
  tokenId: int("tokenId").notNull(),
  projectId: int("projectId").notNull(),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  ipHash: varchar("ipHash", { length: 64 }), // hashed for privacy
  userAgent: text("userAgent"),
  country: varchar("country", { length: 64 }),
});

export type ReportView = typeof reportViews.$inferSelect;
export type InsertReportView = typeof reportViews.$inferInsert;

// Referrals — each user gets a unique referral code; tracks who referred whom
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerId: int("referrerId").notNull(),       // user who shared the link
  referredUserId: int("referredUserId").unique(), // user who signed up via the link (null until they sign up)
  referralCode: varchar("referralCode", { length: 32 }).notNull().unique(), // e.g. "BROKER-A1B2"
  status: mysqlEnum("status", ["pending", "signed_up", "subscribed", "credited"]).default("pending").notNull(),
  creditApplied: boolean("creditApplied").default(false).notNull(),
  creditMonths: int("creditMonths").default(0).notNull(),
  referredAt: timestamp("referredAt"),           // when referred user signed up
  subscribedAt: timestamp("subscribedAt"),       // when referred user started paying
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

// Changelog seen log — tracks which version each user has seen
export const changelogSeen = mysqlTable("changelogSeen", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  version: varchar("version", { length: 32 }).notNull(), // e.g. "1.2.0"
  seenAt: timestamp("seenAt").defaultNow().notNull(),
});

export type ChangelogSeen = typeof changelogSeen.$inferSelect;
export type InsertChangelogSeen = typeof changelogSeen.$inferInsert;
