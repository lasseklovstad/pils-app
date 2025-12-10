import { eq, getTableColumns } from "drizzle-orm";

import { db } from "db/config.server";
import { passwords, sessions, users } from "db/schema";

export const getUsers = async () => {
  return await db.select().from(users);
};

export const getUserByEmail = async (email: string) => {
  return (await db.select().from(users).where(eq(users.email, email)))[0];
};

export const insertUserAndSession = async (
  session: Omit<typeof sessions.$inferInsert, "userId">,
  user: typeof users.$inferInsert,
  password: Omit<typeof passwords.$inferInsert, "userId">,
) => {
  const [newUser] = await db
    .insert(users)
    .values(user)
    .returning(getTableColumns(users));
  if (!newUser) {
    throw new Error("Could not create user");
  }
  await db.insert(passwords).values({ ...password, userId: newUser.id });
  const [newSession] = await db
    .insert(sessions)
    .values({ ...session, userId: newUser.id })
    .returning(getTableColumns(sessions));
  if (!newSession) {
    throw new Error("Could not create session");
  }
  return newSession;
};

export const getUserPasswordByEmail = async (email: string) => {
  return (
    await db
      .select(getTableColumns(passwords))
      .from(passwords)
      .innerJoin(users, eq(users.id, passwords.userId))
      .where(eq(users.email, email))
      .limit(1)
  )[0];
};
