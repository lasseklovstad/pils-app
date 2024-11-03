import { desc, eq, getTableColumns } from "drizzle-orm";

import { db } from "db/config.server";
import { batches, batchFiles } from "db/schema";

import { publicFileUrlSql } from "./batchFiles";

export const getBatches = async () => {
  return await db
    .select({
      ...getTableColumns(batches),
      previewFilePublicUrl: publicFileUrlSql,
    })
    .from(batches)
    .leftJoin(batchFiles, eq(batchFiles.id, batches.previewFileId))
    .orderBy(desc(batches.createdTimestamp));
};

export const getBatch = async (batchId: number) => {
  return (
    await db
      .select({
        ...getTableColumns(batches),
        previewFilePublicUrl: publicFileUrlSql,
      })
      .from(batches)
      .leftJoin(batchFiles, eq(batchFiles.id, batches.previewFileId))
      .where(eq(batches.id, batchId))
      .limit(1)
  )[0];
};

export const postBatch = async ({
  name,
  userId,
}: {
  name: string;
  userId: string;
}) => {
  const result = (
    await db
      .insert(batches)
      .values({ name, userId })
      .returning({ id: batches.id })
  )[0];
  if (!result) {
    throw new Error("Something went wrong when saving batch");
  }
  return result;
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
      | "previewFileId"
      | "controllerId"
      | "mode"
    >
  >,
) => {
  return await db.update(batches).set(batch).where(eq(batches.id, batchId));
};

export const deleteBatch = async (batchId: number) => {
  await db.delete(batches).where(eq(batches.id, batchId));
};

export const setBatchControllerStatus = async (
  batchId: number,
  controllerStatus: (typeof batches.$inferInsert)["controllerStatus"],
) => {
  await db
    .update(batches)
    .set(
      controllerStatus === "active"
        ? { controllerStatus, fermentationStartDate: new Date() }
        : { controllerStatus },
    )
    .where(eq(batches.id, batchId));
};

export const getBatchesFromControllerId = async (controllerId: number) => {
  return await db
    .select()
    .from(batches)
    .where(eq(batches.controllerId, controllerId));
};
