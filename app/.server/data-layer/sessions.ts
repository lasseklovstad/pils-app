import { and, eq, getTableColumns, gt } from "drizzle-orm";

import { db } from "db/config.server";
import { sessions, users } from "db/schema";

export const getUserBySessionId = async (sessionId: string) => {
  return (
    await db
      .select(getTableColumns(users))
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.id, sessionId),
          gt(sessions.expirationDate, new Date()),
        ),
      )
      .limit(1)
  )[0];
};

export const insertSession = async (value: typeof sessions.$inferInsert) => {
  return (
    await db.insert(sessions).values(value).returning(getTableColumns(sessions))
  )[0];
};

export const deleteSession = async (sessionId: string) => {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
};
