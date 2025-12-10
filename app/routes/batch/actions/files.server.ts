import type { z } from "zod";
import type {
  DeleteFileSchema,
  SetPreviewFileSchema,
  UploadFilesSchema,
} from "./file.schema";

import { deleteFile, insertFile } from "~/.server/data-layer/batchFiles";
import { putBatch } from "~/.server/data-layer/batches";

export async function uploadFilesAction({
  formData: { files },
  batchId,
}: {
  formData: z.infer<typeof UploadFilesSchema>;
  batchId: number;
}) {
  await insertFile(files.map(file => ({ ...file, batchId })));
  return { status: 200, result: undefined };
}

export async function setPreviewFileAction({
  formData: { fileId },
  batchId,
}: {
  formData: z.infer<typeof SetPreviewFileSchema>;
  batchId: number;
}) {
  await putBatch(batchId, { previewFileId: fileId });
  return { status: 200, result: undefined };
}

export async function deleteFileAction({
  formData: { fileId },
}: {
  formData: z.infer<typeof DeleteFileSchema>;
}) {
  await deleteFile(fileId);
  return { status: 200, result: undefined };
}
