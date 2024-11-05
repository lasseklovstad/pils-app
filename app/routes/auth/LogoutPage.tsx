import { redirect } from "react-router";

import type { Route } from "./+types.LogoutPage";

import { logout } from "~/lib/auth.server";

export function loader() {
  return redirect("/");
}

export function action({ request }: Route.ActionArgs) {
  return logout(request);
}
