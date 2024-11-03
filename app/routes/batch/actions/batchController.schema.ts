import { z } from "zod";

export const batchControllerStatusIntent = "update-controller-status";

export const BatchControllerStatusSchema = z.object({
  status: z.enum(["inactive", "prepare", "active"]),
  controllerId: z.number().int(),
  intent: z.literal(batchControllerStatusIntent),
});
