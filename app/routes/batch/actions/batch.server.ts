import { redirect } from "react-router";

import { deleteBatch, putBatch } from "~/.server/data-layer/batches";
import { deleteFile, getBatchFiles } from "~/.server/data-layer/batchFiles";
import { getBatchFileStorage } from "~/lib/batchFileStorage";

export async function deleteBatchAction(batchId: number) {
  const files = await getBatchFiles(batchId);
  const batchFilesStorage = getBatchFileStorage(batchId);
  for (const file of files) {
    await batchFilesStorage.remove(file.id);
    await deleteFile(file.id);
  }
  await deleteBatch(batchId);
  return redirect("/");
}

export async function editBatchNameAction({
  batchId,
  formData,
}: {
  batchId: number;
  formData: FormData;
}) {
  await putBatch(batchId, { name: String(formData.get("name")) });

  return { status: "success" };
}
