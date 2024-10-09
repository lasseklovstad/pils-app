import { eq } from "drizzle-orm";

import { db } from "db/config.server";
import { controllersTable } from "db/schema";

export const getControllers = async () => {
  return await db
    .select({ id: controllersTable.id, name: controllersTable.name })
    .from(controllersTable);
};

export const getController = async (controllerId: number) => {
  return (
    await db
      .select({
        id: controllersTable.id,
        name: controllersTable.name,
        isRelayOn: controllersTable.isRelayOn,
      })
      .from(controllersTable)
      .where(eq(controllersTable.id, controllerId))
      .limit(1)
  )[0];
};

export const getControllerWithHash = async (controllerId: number) => {
  return (
    await db
      .select({
        id: controllersTable.id,
        hashedSecret: controllersTable.hashedSecret,
      })
      .from(controllersTable)
      .where(eq(controllersTable.id, controllerId))
      .limit(1)
  )[0];
};

export const postController = async (
  controller: typeof controllersTable.$inferInsert,
) => {
  return await db
    .insert(controllersTable)
    .values(controller)
    .returning({ id: controllersTable.id });
};

export const putController = async (
  controllerId: number,
  controller: Pick<typeof controllersTable.$inferInsert, "isRelayOn">,
) => {
  return await db
    .update(controllersTable)
    .set(controller)
    .where(eq(controllersTable.id, controllerId));
};
