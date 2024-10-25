import { redirect } from "react-router";

import type { Session } from "db/schema";

import { sessionKey } from "./auth.server";
import { authSessionStorage } from "./session.server";
import { safeRedirect } from "./safeRedirect";

export async function handleNewSession({
  request,
  remember,
  session,
  redirectTo,
}: {
  request: Request;
  remember: boolean;
  session: Session;
  redirectTo?: string;
}) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  authSession.set(sessionKey, session.id);

  throw redirect(safeRedirect(redirectTo), {
    headers: {
      "set-cookie": await authSessionStorage.commitSession(authSession, {
        expires: remember ? session.expirationDate : undefined,
      }),
    },
  });
}
