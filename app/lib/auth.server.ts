import { redirect } from "react-router";
import bcrypt from "bcryptjs";

import type { User } from "db/schema";

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

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 days
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME);

export const sessionKey = "sessionId";

export async function getUser(request: Request) {
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
  return user;
}

export async function requireUser(
  request: Request,
  {
    redirectTo,
    role,
  }: { redirectTo?: string | null; role?: User["role"] } = {},
) {
  const user = await getUser(request);
  if (!user) {
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
  if (role && user.role !== role) {
    throw redirect("/");
  }
  return user;
}

export async function requireAnonymous(request: Request) {
  const user = await getUser(request);
  if (user) {
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
    {
      email: email.toLowerCase(),
      name,
      role: email === "lasse.klovstad@gmail.com" ? "admin" : "user",
    },
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

async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

async function verifyUserPassword(email: string, password: string) {
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
