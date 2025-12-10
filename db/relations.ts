import { defineRelations } from "drizzle-orm";

import { batches, batchTemperatures } from "./schema";

export const relations = defineRelations(
  { batches, batchTemperatures },
  (r) => ({
    batches: {
      batchTemperatures: r.many.batchTemperatures(),
    },
    batchTemperatures: {
      batch: r.one.batches({
        from: r.batchTemperatures.batchId,
        to: r.batches.id,
      }),
    },
  }),
);
