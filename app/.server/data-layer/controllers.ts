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
  const [result] = await db
    .insert(controllersTable)
    .values(controller)
    .returning({ id: controllersTable.id });
  if (!result) {
    throw new Error("Could not create controller i DB");
  }
  return result.id;
};

export const putController = async (
  controllerId: number,
  controller: Partial<
    Pick<
      typeof controllersTable.$inferInsert,
      "isRelayOn" | "name" | "hashedSecret"
    >
  >,
) => {
  return await db
    .update(controllersTable)
    .set(controller)
    .where(eq(controllersTable.id, controllerId));
};

export const deleteController = async (controllerId: number) => {
  return await db
    .delete(controllersTable)
    .where(eq(controllersTable.id, controllerId));
};
