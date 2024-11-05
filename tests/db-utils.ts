import { getTableColumns } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

import { db } from "db/config.server";
import { passwords, users } from "db/schema";

export type InsertUser = Omit<typeof users.$inferInsert, "id" | "createdAt"> & {
  password: string;
};

export type CreatedUser = InsertUser & { id: string };

export const createUser = (user?: Partial<InsertUser>): InsertUser => ({
  email: faker.internet.email(),
  name: faker.person.fullName(),
  role: "user",
  password: faker.internet.password(),
  ...user,
});

export const insertNewUser = async (
  partialUser?: Partial<InsertUser>,
): Promise<CreatedUser> => {
  const user = createUser(partialUser);
  const hashedPassword = createHashedPassword(user.password);

  const id = await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(users)
      .values({
        name: user.name,
        role: user.role,
        email: user.email.toLowerCase(),
      })
      .returning(getTableColumns(users));
    if (!newUser) {
      throw new Error("Could not create user");
    }
    await tx
      .insert(passwords)
      .values({ ...hashedPassword, userId: newUser.id });
    return newUser.id;
  });
  return { ...user, id };
};

function createHashedPassword(password: string) {
  return {
    hash: bcrypt.hashSync(password, 10),
  };
}
