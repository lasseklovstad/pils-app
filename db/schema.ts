import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  unique,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

const sqlTimestampNow = sql`(unixepoch())`;

export const batches = sqliteTable("batches", {
  id: integer().primaryKey(),
  name: text().notNull(),
  mashingTemperature: integer(),
  mashingStrikeWaterVolume: integer().default(20),
  mashingMaltTemperature: integer().default(18),
  originalGravity: integer(),
  finalGravity: integer(),
  createdTimestamp: integer({
    mode: "timestamp",
  })
    .notNull()
    .default(sqlTimestampNow),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  previewFileId: text().references((): AnySQLiteColumn => batchFiles.id, {
    onDelete: "set null",
  }),
  controllerId: integer().references(() => controllers.id, {
    onDelete: "set null",
  }),
  mode: text({ enum: ["warm", "cold"] }),
  controllerStatus: text({ enum: ["inactive", "active", "prepare"] })
    .default("inactive")
    .notNull(),
  fermentationStartDate: integer({ mode: "timestamp" }),
  isDeleted: integer({ mode: "boolean" }).default(false).notNull(),
});

export type Batch = typeof batches.$inferSelect;

export const ingredients = sqliteTable("ingredients", {
  id: integer().primaryKey(),
  name: text().notNull(),
  amount: real().notNull(),
  type: text({ enum: ["hops", "malt", "yeast", "other"] }).notNull(),
  time: integer(), // Relevent for hops (cooking time)
  batchId: integer()
    .notNull()
    .references(() => batches.id, { onDelete: "cascade" }),
});

export type Ingredient = typeof ingredients.$inferSelect;

export const controllers = sqliteTable("controllers", {
  id: integer().primaryKey(),
  name: text().notNull(),
  isRelayOn: integer({ mode: "boolean" }).notNull().default(false),
  hysteresis: real().notNull().default(0.0),
  minDelayInSeconds: integer().notNull().default(30),
  avgTemperatureBufferSize: integer().notNull().default(5),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const controllerTemperatures = sqliteTable("controller_temperatures", {
  id: integer().primaryKey(),
  controllerId: integer()
    .notNull()
    .references(() => controllers.id, { onDelete: "cascade" }),
  temperature: real().notNull(),
  timestamp: integer({
    mode: "timestamp",
  })
    .notNull()
    .default(sqlTimestampNow),
  batchId: integer().references(() => batches.id, { onDelete: "cascade" }),
});

export type ControllerTemperature = typeof controllerTemperatures.$inferSelect;

export const verifications = sqliteTable(
  "verifications",
  {
    id: integer().primaryKey(),
    createdAt: integer({ mode: "timestamp" })
      .notNull()
      .default(sqlTimestampNow),
    expiresAt: integer({ mode: "timestamp" }),
    secret: text().notNull(),
    type: text({ enum: ["controller", "onboarding"] }).notNull(),
    target: text().notNull(),
  },
  (table) => ({ uniqueTargetAndType: unique().on(table.type, table.target) }),
);

export type Verification = typeof verifications.$inferSelect;

export const users = sqliteTable("users", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text().notNull().unique(),
  createdAt: integer({
    mode: "timestamp",
  })
    .notNull()
    .default(sqlTimestampNow),
  name: text().notNull(),
  role: text({ enum: ["admin", "user"] }).notNull(),
});

export type User = typeof users.$inferSelect;

export const passwords = sqliteTable("passwords", {
  hash: text().notNull(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
});

export const sessions = sqliteTable("sessions", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: integer({
    mode: "timestamp",
  })
    .notNull()
    .default(sqlTimestampNow),
  updatedAt: integer({
    mode: "timestamp",
  })
    .notNull()
    .default(sqlTimestampNow),
  expirationDate: integer({
    mode: "timestamp",
  }).notNull(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export type Session = typeof sessions.$inferSelect;

export const batchFiles = sqliteTable("batch_files", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: integer({
    mode: "timestamp",
  })
    .notNull()
    .default(sqlTimestampNow),
  type: text({ enum: ["image", "video", "unknown"] }).notNull(),
  batchId: integer()
    .notNull()
    .references(() => batches.id),
  isDeleted: integer({ mode: "boolean" }).default(false).notNull(),
});

export const batchTemperatures = sqliteTable("batch_temperatures", {
  id: integer().primaryKey(),
  dayIndex: real().notNull(),
  temperature: real().notNull(),
  batchId: integer()
    .references(() => batches.id, { onDelete: "cascade" })
    .notNull(),
});

export type BatchTemperature = typeof batchTemperatures.$inferSelect;
