import type { z } from "zod";

import { deleteAndInsertBatchTemperatures } from "~/.server/data-layer/batchTemperatures";

import { BatchTemperaturesSchema } from "./batchTemperatures.schema";

export async function batchTemperaturesAction({
  batchId,
  formData: { batchTemperatures },
}: {
  batchId: number;
  formData: z.infer<typeof BatchTemperaturesSchema>;
}) {
  await deleteAndInsertBatchTemperatures(batchId, batchTemperatures);
  return { status: 200, result: undefined };
}
