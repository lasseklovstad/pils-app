import { z } from "zod";

export const batchControllerStatusIntent = "update-controller-status";

export const BatchControllerStatusSchema = z.object({
  status: z.enum(["inactive", "prepare", "active"]),
  controllerId: z.number().int(),
  intent: z.literal(batchControllerStatusIntent),
});
export const putBatchControllerIntent = "put-batch-controller";

export const PutBatchControllerSchema = z.object({
  controllerMode: z.enum(["warm", "cold"]).optional(),
  controllerId: z.number().int().optional(),
  intent: z.literal(putBatchControllerIntent),
});
