import { asc, eq } from "drizzle-orm";

import { db } from "db/config.server";
import { batchTemperatures } from "db/schema";

export const getBatchTemperatures = async (batchId: number) => {
  return await db
    .select()
    .from(batchTemperatures)
    .where(eq(batchTemperatures.batchId, batchId))
    .orderBy(asc(batchTemperatures.dayIndex));
};

export const deleteAndInsertBatchTemperatures = async (
  batchId: number,
  values: Omit<typeof batchTemperatures.$inferInsert, "batchId" | "id">[],
) => {
  await db.transaction(async (tx) => {
    await tx
      .delete(batchTemperatures)
      .where(eq(batchTemperatures.batchId, batchId));
    await tx
      .insert(batchTemperatures)
      .values(values.map((v) => ({ ...v, batchId })));
  });
};
