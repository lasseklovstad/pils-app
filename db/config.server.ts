import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import * as schema from "./schema";
import { relations } from "./relations";

const queryClient = new Database(process.env.APP_DATABASE_URL);
queryClient.pragma("journal_mode = WAL");
export const db = drizzle({
  client: queryClient,
  schema,
  relations,
  casing: "snake_case",
});
queryClient.pragma("foreign_keys=OFF;");
migrate(db, { migrationsFolder: "migrations" });
queryClient.pragma("foreign_keys=ON;");
