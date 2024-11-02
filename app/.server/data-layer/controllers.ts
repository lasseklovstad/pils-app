import { and, eq } from "drizzle-orm";

import { db } from "db/config.server";
import { batches, controllers, users, type User } from "db/schema";

export const getControllers = async (currentUser: User) => {
  return await db
    .select({ id: controllers.id, name: controllers.name })
    .from(controllers)
    .innerJoin(users, eq(users.id, currentUser.id))
    .where(eq(users.id, currentUser.id));
};

export const getControllersFromBatchId = async (batchId: number) => {
  return await db
    .select({ id: controllers.id, name: controllers.name })
    .from(controllers)
    .innerJoin(batches, eq(batches.userId, controllers.userId))
    .where(eq(batches.id, batchId));
};

export const getControllerByUser = async (
  controllerId: number,
  currentUser: User,
) => {
  return (
    await db
      .select({
        id: controllers.id,
        name: controllers.name,
        isRelayOn: controllers.isRelayOn,
        userId: controllers.userId,
      })
      .from(controllers)
      .innerJoin(users, eq(users.id, currentUser.id))
      .where(
        and(eq(controllers.id, controllerId), eq(users.id, currentUser.id)),
      )
      .limit(1)
  )[0];
};

export const getController = async (controllerId: number) => {
  return (
    await db
      .select({
        id: controllers.id,
        name: controllers.name,
        isRelayOn: controllers.isRelayOn,
        userId: controllers.userId,
      })
      .from(controllers)
      .where(eq(controllers.id, controllerId))
      .limit(1)
  )[0];
};

export const postController = async (
  controller: typeof controllers.$inferInsert,
) => {
  const [result] = await db
    .insert(controllers)
    .values(controller)
    .returning({ id: controllers.id });
  if (!result) {
    throw new Error("Could not create controller i DB");
  }
  return result.id;
};

export const putController = async (
  controllerId: number,
  controller: Partial<
    Pick<typeof controllers.$inferInsert, "isRelayOn" | "name">
  >,
) => {
  return await db
    .update(controllers)
    .set(controller)
    .where(eq(controllers.id, controllerId));
};

export const deleteController = async (controllerId: number) => {
  return await db.delete(controllers).where(eq(controllers.id, controllerId));
};
