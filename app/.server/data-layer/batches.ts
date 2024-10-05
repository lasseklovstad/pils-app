import { desc, eq } from "drizzle-orm";

import { db } from "db/config.server";
import { batchesTable } from "db/schema";

export const getBatches = async () => {
  return await db
    .select()
    .from(batchesTable)
    .orderBy(desc(batchesTable.createdTimestamp));
};

export const getBatch = async (batchId: number) => {
  return (
    await db
      .select()
      .from(batchesTable)
      .where(eq(batchesTable.id, batchId))
      .limit(1)
  )[0];
};

export const postBatch = async (name: string) => {
  return await db.insert(batchesTable).values({ name });
};

export const putBatch = async (
  batchId: number,
  batch: Partial<
    Pick<
      typeof batchesTable.$inferInsert,
      | "finalGravity"
      | "originalGravity"
      | "name"
      | "mashingStrikeWaterVolume"
      | "mashingTemperature"
      | "mashingMaltTemperature"
    >
  >,
) => {
  return await db
    .update(batchesTable)
    .set(batch)
    .where(eq(batchesTable.id, batchId));
};
