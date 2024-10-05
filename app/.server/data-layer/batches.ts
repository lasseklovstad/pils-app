import { db } from "db/config.server";
import { batchesTable } from "db/schema";
import { desc } from "drizzle-orm";

export const getBatches = async () => {
  return await db
    .select()
    .from(batchesTable)
    .orderBy(desc(batchesTable.createdTimestamp));
};

export const postBatch = async (name: string) => {
  return await db.insert(batchesTable).values({ name });
};
