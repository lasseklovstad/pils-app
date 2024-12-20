import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";

import {
  getBatchesFromControllerId,
  putBatch,
  setBatchControllerStatus,
} from "~/.server/data-layer/batches";

import {
  BatchControllerStatusSchema,
  type PutBatchControllerSchema,
} from "./batchController.schema";

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
    return { status: 400, result: submission.reply() };
  }
  await setBatchControllerStatus(batchId, submission.value.status);
  return { status: 200, result: undefined };
}

export async function putBatchControllerAction({
  formData: { controllerId, controllerMode },
  batchId,
}: {
  formData: z.infer<typeof PutBatchControllerSchema>;
  batchId: number;
}) {
  await putBatch(batchId, {
    controllerId: controllerId || null,
    mode: controllerMode || null,
  });
  return { status: 200, result: undefined };
}
