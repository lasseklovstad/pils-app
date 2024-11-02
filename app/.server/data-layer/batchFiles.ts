import { eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "db/config.server";
import { batches, batchFiles } from "db/schema";

export const insertFile = async (value: typeof batchFiles.$inferInsert) => {
  const result = await db
    .insert(batchFiles)
    .values(value)
    .returning({ id: batchFiles.id });
  if (!result[0]) {
    throw new Error("No gikk galt ved lagring av fil til db");
  }
  return result[0].id;
};

export const publicFileUrlSql = sql<string>`'/api/files/'||${batchFiles.type}||'/'||${batchFiles.id}`;

export const getBatchFiles = async (batchId: number) => {
  return await db
    .select({
      ...getTableColumns(batchFiles),
      publicUrl: publicFileUrlSql,
    })
    .from(batchFiles)
    .where(eq(batchFiles.batchId, batchId));
};

export const getBatchFile = async (fileId: string) => {
  return (
    await db.select().from(batchFiles).where(eq(batchFiles.id, fileId))
  )[0];
};

export const deleteFile = async (fileId: string) => {
  await db.transaction(async (tx) => {
    await tx
      .update(batches)
      .set({ previewFileId: null })
      .where(eq(batches.previewFileId, fileId));
    await tx.delete(batchFiles).where(eq(batchFiles.id, fileId));
  });
};
