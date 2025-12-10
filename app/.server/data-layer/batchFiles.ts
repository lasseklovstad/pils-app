import { and, eq, getTableColumns, sql } from "drizzle-orm";

import { db } from "db/config.server";
import { batches, batchFiles } from "db/schema";

export const insertFile = async (value: (typeof batchFiles.$inferInsert)[]) => {
  await db.insert(batchFiles).values(value);
};

export const publicFileUrlSql = () =>
  sql<string>`${sql.raw(`'https://${process.env.AZURE_BLOB_NAME}.blob.core.windows.net/pils/batch/'`)}||${batchFiles.batchId}||'/'||${batchFiles.id}`;

export const getBatchFiles = async (batchId: number) => {
  return await db
    .select({
      ...getTableColumns(batchFiles),
      publicUrl: publicFileUrlSql(),
    })
    .from(batchFiles)
    .where(
      and(eq(batchFiles.batchId, batchId), eq(batchFiles.isDeleted, false)),
    );
};

export const getBatchFile = async (fileId: string) => {
  return (
    await db
      .select()
      .from(batchFiles)
      .where(and(eq(batchFiles.id, fileId), eq(batchFiles.isDeleted, false)))
  )[0];
};

export const deleteFile = async (fileId: string) => {
  await db
    .update(batches)
    .set({ previewFileId: null })
    .where(eq(batches.previewFileId, fileId));
  await db
    .update(batchFiles)
    .set({ isDeleted: true })
    .where(eq(batchFiles.id, fileId));
};
