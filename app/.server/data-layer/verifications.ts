import { and, eq, gt, isNull, or } from "drizzle-orm";

import { db } from "db/config.server";
import { verifications, type Verification } from "db/schema";

export const getVerification = async (
  target: string,
  type: Verification["type"],
) => {
  return (
    await db
      .select()
      .from(verifications)
      .where(
        and(
          eq(verifications.type, type),
          eq(verifications.target, target),
          or(
            gt(verifications.expiresAt, new Date()),
            isNull(verifications.expiresAt),
          ),
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

export const deleteVerification = async (
  target: string,
  type: Verification["type"],
) => {
  await db
    .delete(verifications)
    .where(and(eq(verifications.target, target), eq(verifications.type, type)));
};
