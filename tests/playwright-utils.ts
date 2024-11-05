import { test as base } from "@playwright/test";
import { eq } from "drizzle-orm";
import * as setCookieParser from "set-cookie-parser";

import { db } from "db/config.server";
import { users } from "db/schema";
import { authSessionStorage } from "~/lib/session.server";
import { getSessionExpirationDate, sessionKey } from "~/lib/auth.server";
import { insertSession } from "~/.server/data-layer/sessions";

import { insertNewUser, type InsertUser, type CreatedUser } from "./db-utils";

const deleteUserIfExists = async (userId: string | undefined) => {
  if (userId) {
    await db
      .delete(users)
      .where(eq(users.id, userId))
      .catch(() => {});
  }
};

export const test = base.extend<{
  insertNewUser(this: void, options?: InsertUser): Promise<CreatedUser>;
  login(this: void, options?: InsertUser): Promise<CreatedUser>;
}>({
  // eslint-disable-next-line no-empty-pattern
  insertNewUser: async ({}, use) => {
    let userId: string | undefined = undefined;
    await use(async (options) => {
      const user = await insertNewUser(options);
      userId = user.id;
      return user;
    });
    await deleteUserIfExists(userId);
  },
  login: async ({ page }, use) => {
    let userId: string | undefined = undefined;
    await use(async (options) => {
      const user = await insertNewUser(options);
      userId = user.id;
      const session = await insertSession({
        expirationDate: getSessionExpirationDate(),
        userId: user.id,
      });

      if (!session) {
        throw new Error("Could not create session in database");
      }

      const authSession = await authSessionStorage.getSession();
      authSession.set(sessionKey, session.id);
      const cookieConfig = setCookieParser.parseString(
        await authSessionStorage.commitSession(authSession),
      );
      const newConfig = {
        ...cookieConfig,
        domain: "localhost",
        expires: cookieConfig.expires?.getTime(),
        sameSite: cookieConfig.sameSite as "Strict" | "Lax" | "None",
      };
      await page.context().addCookies([newConfig]);
      return user;
    });
    await deleteUserIfExists(userId);
  },
});
export const { expect } = test;
