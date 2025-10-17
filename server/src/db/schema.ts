import {
  pgTable,
  varchar,
  timestamp,
  decimal,
  integer,
  uuid,
} from "drizzle-orm/pg-core";

// ----------------------
// USERS
// ----------------------
export const users = pgTable("users", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  accountType: varchar("account_type", { length: 30 }).default("Personal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActive: timestamp("last_active"),
});

// ----------------------
// TRANSACTIONS
// ----------------------
export const transactions = pgTable("transactions", {
  id: uuid().defaultRandom().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  type: varchar("type", { length: 30 }).notNull(), // deposit / withdrawal / transfer / investment
  status: varchar("status", { length: 20 }).default("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ----------------------
// ASSETS
// ----------------------
export const assets = pgTable("assets", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  symbol: varchar("symbol", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 50 }).notNull(),
  category: varchar("category", { length: 30 }).notNull(), // Stock / Crypto / Fund / etc.
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
});

// ----------------------
// PORTFOLIO HOLDINGS
// ----------------------
export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: uuid().defaultRandom().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assetId: integer("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  quantity: decimal("quantity", { precision: 12, scale: 4 }).notNull(),
  avgPrice: decimal("avg_price", { precision: 10, scale: 2 }).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});
