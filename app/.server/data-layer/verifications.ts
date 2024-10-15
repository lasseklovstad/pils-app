import { and, eq } from "drizzle-orm";

import { db } from "db/config.server";
import { verifications } from "db/schema";

export const getControllerVerification = async (controllerId: string) => {
  return (
    await db
      .select()
      .from(verifications)
      .where(
        and(
          eq(verifications.type, "controller"),
          eq(verifications.target, controllerId),
        ),
      )
  )[0];
};

export const insertVerification = async (
  value: typeof verifications.$inferInsert,
) => {
  await db
    .insert(verifications)
    .values(value)
    .onConflictDoUpdate({
      target: [verifications.type, verifications.target],
      set: { createdAt: new Date(), secret: value.secret },
    });
};
