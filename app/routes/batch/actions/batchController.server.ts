import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";

import {
  getBatchesFromControllerId,
  setBatchControllerStatus,
} from "~/.server/data-layer/batches";

import { BatchControllerStatusSchema } from "./batchController.schema";

export async function batchControllerStatusAction({
  batchId,
  formData,
}: {
  batchId: number;
  formData: FormData;
}) {
  const submission = await parseWithZod(formData, {
    async: true,
    schema: BatchControllerStatusSchema.superRefine(
      async ({ status, controllerId }, ctx) => {
        if (status === "inactive") {
          return;
        }
        const activeBatches = (
          await getBatchesFromControllerId(controllerId)
        ).filter(
          (batch) =>
            batch.controllerStatus !== "inactive" && batch.id !== batchId,
        );
        if (activeBatches.length > 0) {
          return ctx.addIssue({
            path: ["status"],
            code: z.ZodIssueCode.custom,
            message: "Det finnes allerede en aktiv batch hos mikrokontrolleren",
          });
        }
      },
    ),
  });

  if (submission.status !== "success") {
    return submission.reply();
  }
  await setBatchControllerStatus(batchId, submission.value.status);
  return { status: "success" };
}
