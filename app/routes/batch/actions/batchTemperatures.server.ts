import { parseWithZod } from "@conform-to/zod";

import { deleteAndInsertBatchTemperatures } from "~/.server/data-layer/batchTemperatures";

import { BatchTemperaturesSchema } from "./batchTemperatures.schema";

export async function batchTemperaturesAction({
  batchId,
  formData,
}: {
  batchId: number;
  formData: FormData;
}) {
  const submission = parseWithZod(formData, {
    schema: BatchTemperaturesSchema,
  });
  if (submission.status !== "success") {
    return submission.reply();
  }
  await deleteAndInsertBatchTemperatures(
    batchId,
    submission.value.batchTemperatures,
  );

  return { status: "success" };
}
