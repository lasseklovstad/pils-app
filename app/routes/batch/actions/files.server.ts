import type { z } from "zod";
import type {
  DeleteFileSchema,
  SetPreviewFileSchema,
  UploadFilesSchema,
} from "./file.schema";

import { deleteFile, insertFile } from "~/.server/data-layer/batchFiles";
import { getBatchFileStorage } from "~/lib/batchFileStorage";
import { putBatch } from "~/.server/data-layer/batches";

export async function uploadFilesAction({
  formData: { media },
  batchId,
}: {
  formData: z.infer<typeof UploadFilesSchema>;
  batchId: number;
}) {
  const fileStorage = getBatchFileStorage(batchId);
  for (const file of media) {
    const type = file.type.startsWith("video")
      ? "video"
      : file.type.startsWith("image")
        ? "image"
        : "unknown";
    if (type === "unknown") {
      console.warn("Unknown file tried to upload");
      return;
    }
    const fileId = await insertFile({
      batchId,
      type,
    });
    await fileStorage.set(fileId, file);
  }

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
  batchId,
}: {
  formData: z.infer<typeof DeleteFileSchema>;
  batchId: number;
}) {
  const fileStorage = getBatchFileStorage(batchId);
  await fileStorage.remove(fileId);
  await deleteFile(fileId);
  return { status: 200, result: undefined };
}
