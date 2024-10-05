import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const batchesTable = sqliteTable("batches", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  createdTimestamp: integer("created_timestamp", {
    mode: "timestamp",
  })
    .notNull()
    .default(sql`(unixepoch())`),
});
