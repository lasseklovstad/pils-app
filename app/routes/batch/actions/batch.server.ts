import { redirect } from "react-router";
import { z } from "zod";

import type {
  EditBatchNameSchema,
  PostIngredientSchema,
  PutGravitySchema,
  PutIngredientSchema,
  PutMashingSchema,
} from "./batch.schema";

import { deleteBatch, putBatch } from "~/.server/data-layer/batches";
import { deleteFile, getBatchFiles } from "~/.server/data-layer/batchFiles";
import { getBatchFileStorage } from "~/lib/batchFileStorage";
import {
  deleteIngredient,
  postIngredient,
  putIngredient,
} from "~/.server/data-layer/ingredients";
import { createBlobSas } from "~/lib/azure.server";

export async function deleteBatchAction(batchId: number) {
  const files = await getBatchFiles(batchId);
  const batchFilesStorage = getBatchFileStorage(batchId);
  for (const file of files) {
    await batchFilesStorage.remove(file.id);
    await deleteFile(file.id);
  }
  await deleteBatch(batchId);
  throw redirect("/");
}



export async function migrateBatchFilesAction(batchId: number) {
  const token = await createBlobSas({
    accountKey: process.env.AZURE_BLOB_KEY!,
    accountName: process.env.AZURE_BLOB_NAME!,
    containerName: "pils",
    permissions: "c", // create, no overwrite
    expiresOn: new Date(new Date().valueOf() + 1000000),
    protocol: "https",
  })
  async function uploadNewBlob(file: File, fileId: string) {
    const [base, qs] = token.split("?");
    // Optional prefix folder
    const blobName = `batch/${batchId}/${fileId}`;
    const target = `${base}/${blobName}?${qs}`;
    const res = await fetch(target, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });
    if (res.status === 409) {
      throw new Error("Blob already exists (conflict).");
    }
    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
    }
    console.log(target.split("?")[0] + " uploaded")
  }

  const files = await getBatchFiles(batchId);
  const batchFilesStorage = getBatchFileStorage(batchId);
  console.log("Uploading " + files.length + " files to azure")
  for (const file of files) {
    const actualFile = await batchFilesStorage.get(file.id);
    if (actualFile) {
      await uploadNewBlob(actualFile, file.id)
    } else {
      console.warn("Could not find file")
    }
  }
  return { status: 200, result: undefined };
}

export async function editBatchNameAction({
  batchId,
  formData: { name },
}: {
  batchId: number;
  formData: z.infer<typeof EditBatchNameSchema>;
}) {
  await putBatch(batchId, { name });
}

export async function putMashingAction({
  batch: {
    mashingMaltTemperature,
    mashingStrikeWaterVolume,
    mashingTemperature,
  },
  batchId,
}: {
  batch: z.infer<typeof PutMashingSchema>;
  batchId: number;
}) {
  await putBatch(batchId, {
    mashingStrikeWaterVolume,
    mashingTemperature,
    mashingMaltTemperature,
  });
  return { status: 200, result: undefined };
}

export async function putGravityAction({
  formData: { originalGravity, finalGravity },
  batchId,
}: {
  formData: z.infer<typeof PutGravitySchema>;
  batchId: number;
}) {
  await putBatch(batchId, { originalGravity, finalGravity });
  return { status: 200, result: undefined };
}

export async function putIngredientAction({
  formData: { id, amount, name, type },
}: {
  formData: z.infer<typeof PutIngredientSchema>;
}) {
  await putIngredient({ name, type, amount, id });
  return { status: 200, result: undefined };
}
export async function postIngredientAction({
  formData: { amount, name, type },
  batchId,
}: {
  formData: z.infer<typeof PostIngredientSchema>;
  batchId: number;
}) {
  await postIngredient({ name, type, batchId, amount });
  return { status: 200, result: undefined };
}

export async function deleteIngredientAction(ingredientId: number) {
  await deleteIngredient(ingredientId);
  return { status: 200, result: undefined };
}
