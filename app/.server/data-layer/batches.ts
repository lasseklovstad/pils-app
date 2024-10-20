import { desc, eq } from "drizzle-orm";

import { db } from "db/config.server";
import { batches } from "db/schema";

export const getBatches = async () => {
  return await db
    .select()
    .from(batches)
    .orderBy(desc(batches.createdTimestamp));
};

export const getBatch = async (batchId: number) => {
  return (
    await db.select().from(batches).where(eq(batches.id, batchId)).limit(1)
  )[0];
};

export const postBatch = async ({
  name,
  userId,
}: {
  name: string;
  userId: string;
}) => {
  return await db.insert(batches).values({ name, userId });
};

export const putBatch = async (
  batchId: number,
  batch: Partial<
    Pick<
      typeof batches.$inferInsert,
      | "finalGravity"
      | "originalGravity"
      | "name"
      | "mashingStrikeWaterVolume"
      | "mashingTemperature"
      | "mashingMaltTemperature"
    >
  >,
) => {
  return await db.update(batches).set(batch).where(eq(batches.id, batchId));
};
