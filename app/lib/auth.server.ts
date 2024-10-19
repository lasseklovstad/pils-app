import { redirect } from "react-router";
import bcrypt from "bcryptjs";

import {
  deleteSession,
  getUserBySessionId,
  insertSession,
} from "~/.server/data-layer/sessions";
import {
  getUserPasswordByEmail,
  insertUserAndSession,
} from "~/.server/data-layer/users";

import { authSessionStorage } from "./session.server";

export type ProviderUser = {
  id: string;
  email: string;
  name: string;
};

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30;
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME);

export const sessionKey = "sessionId";

export async function getUserId(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const sessionId = authSession.get(sessionKey);
  if (!sessionId) return null;
  const user = await getUserBySessionId(sessionId);
  if (!user) {
    throw redirect("/", {
      headers: {
        "set-cookie": await authSessionStorage.destroySession(authSession),
      },
    });
  }
  return user.id;
}

export async function requireUserId(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {},
) {
  const userId = await getUserId(request);
  if (!userId) {
    const requestUrl = new URL(request.url);
    redirectTo =
      redirectTo === null
        ? null
        : (redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`);
    const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null;
    const loginRedirect = ["/login", loginParams?.toString()]
      .filter(Boolean)
      .join("?");
    throw redirect(loginRedirect);
  }
  return userId;
}

export async function requireAnonymous(request: Request) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/");
  }
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await verifyUserPassword(email, password);
  if (!user) return null;
  const session = await insertSession({
    expirationDate: getSessionExpirationDate(),
    userId: user.id,
  });
  return session;
}

export async function signup({
  email,
  password,
  name,
}: {
  email: string;
  name: string;
  password: string;
}) {
  const hashedPassword = await getPasswordHash(password);

  const session = await insertUserAndSession(
    {
      expirationDate: getSessionExpirationDate(),
    },
    { email: email.toLowerCase(), name, role: "user" },
    {
      hash: hashedPassword,
    },
  );

  return session;
}

export async function logout(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const sessionId = authSession.get(sessionKey);
  // if this fails, we still need to delete the session from the user's browser
  // and it doesn't do any harm staying in the db anyway.
  if (sessionId) {
    await deleteSession(sessionId);
  }
  throw redirect("/", {
    headers: {
      "set-cookie": await authSessionStorage.destroySession(authSession),
    },
  });
}

export async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

export async function verifyUserPassword(email: string, password: string) {
  const userPassword = await getUserPasswordByEmail(email);
  if (!userPassword) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userPassword.hash);

  if (!isValid) {
    return null;
  }

  return { id: userPassword.userId };
}
