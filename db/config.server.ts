import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";

const queryClient = new Database(process.env.APP_DATABASE_URL);
queryClient.pragma("journal_mode = WAL");
export const db = drizzle(queryClient, {
  schema,
  casing: "snake_case",
});

migrate(db, { migrationsFolder: "migrations" });
