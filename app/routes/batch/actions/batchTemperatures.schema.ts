import { z } from "zod";

export const batchTemperaturesIntent = "batch-temperatures";

export const BatchTemperaturesSchema = z
  .object({
    batchTemperatures: z.array(
      z.object({ dayIndex: z.number(), temperature: z.number() }),
    ),
    intent: z.literal(batchTemperaturesIntent),
  })
  .superRefine(({ batchTemperatures }, ctx) => {
    if (batchTemperatures.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Antall rader må være større enn 0",
      });
      return;
    }
  });
