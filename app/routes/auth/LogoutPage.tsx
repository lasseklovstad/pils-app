import { redirect } from "react-router";

import type { ActionArgs } from "./+types.LogoutPage";

import { logout } from "~/lib/auth.server";

export async function loader() {
  return redirect("/");
}

export async function action({ request }: ActionArgs) {
  return logout(request);
}
