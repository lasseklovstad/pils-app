import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

const sqlTimestampNow = sql`(unixepoch())`;

export const batches = sqliteTable("batches", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  mashingTemperature: integer("mashing_temperature"),
  mashingStrikeWaterVolume: integer("mashing_strike_water_volume").default(20),
  mashingMaltTemperature: integer("mashing_malt_temperature").default(18),
  originalGravity: integer("original_gravity"),
  finalGravity: integer("final_gravity"),
  createdTimestamp: integer("created_timestamp", {
    mode: "timestamp",
  })
    .notNull()
    .default(sqlTimestampNow),
});

export type Batch = typeof batches.$inferSelect;

export const ingredients = sqliteTable("ingredients", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  type: text("type", { enum: ["hops", "malt", "yeast", "other"] }).notNull(),
  time: integer("time"), // Relevent for hops (cooking time)
  batchId: integer("batch_id")
    .notNull()
    .references(() => batches.id),
});

export type Ingredient = typeof ingredients.$inferSelect;

export const controllers = sqliteTable("controllers", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  isRelayOn: integer("is_relay_on", { mode: "boolean" })
    .notNull()
    .default(false),
});

export const controllerTemperatures = sqliteTable("controller_temperatures", {
  id: integer("id").primaryKey(),
  controllerId: integer("controller_id")
    .notNull()
    .references(() => controllers.id),
  temperature: real("temperature").notNull(),
  timestamp: integer("timestamp", {
    mode: "timestamp",
  })
    .notNull()
    .default(sqlTimestampNow),
});

export const verifications = sqliteTable(
  "verifications",
  {
    id: integer("id").primaryKey(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sqlTimestampNow),
    secret: text("secret").notNull(),
    type: text("type", { enum: ["controller"] }).notNull(),
    target: text("target").notNull(),
  },
  (table) => ({ uniqueTargetAndType: unique().on(table.type, table.target) }),
);
