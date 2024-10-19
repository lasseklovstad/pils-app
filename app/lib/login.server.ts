import { redirect } from "react-router";

import type { Session } from "db/schema";

import { sessionKey } from "./auth.server";
import { authSessionStorage } from "./session.server";

export async function handleNewSession(
  {
    request,
    remember,
    session,
  }: {
    request: Request;
    remember: boolean;
    session: Session;
  },
  responseInit?: ResponseInit,
) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  authSession.set(sessionKey, session.id);

  return redirect("/", {
    ...responseInit,
    headers: {
      "set-cookie": await authSessionStorage.commitSession(authSession, {
        expires: remember ? session.expirationDate : undefined,
      }),
    },
  });
}
