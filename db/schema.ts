import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const batchesTable = sqliteTable("batches", {
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
    .default(sql`(unixepoch())`),
});

export type Batch = typeof batchesTable.$inferSelect;

export const ingredientsTable = sqliteTable("ingredients", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  type: text("type", { enum: ["hops", "malt", "yeast", "other"] }).notNull(),
  time: integer("time"), // Relevent for hops (cooking time)
  batchId: integer("batch_id")
    .notNull()
    .references(() => batchesTable.id),
});

export type Ingredient = typeof ingredientsTable.$inferSelect;
