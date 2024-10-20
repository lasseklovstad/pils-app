import { getTableColumns } from "drizzle-orm";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

import { db } from "db/config.server";
import { passwords, users } from "db/schema";

export const insertNewUser = async () => {
  const user: typeof users.$inferInsert = {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: "user",
  };
  const realPassword = faker.internet.password();
  const password = createPassword(realPassword);
  await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(users)
      .values({ ...user, email: user.email.toLowerCase() })
      .returning(getTableColumns(users));
    if (!newUser) {
      throw new Error("Could not create user");
    }
    await tx.insert(passwords).values({ ...password, userId: newUser.id });
  });
  return { ...user, password: realPassword };
};

function createPassword(password: string) {
  return {
    hash: bcrypt.hashSync(password, 10),
  };
}
