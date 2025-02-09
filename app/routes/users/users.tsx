import type { Route } from "./+types/users";

import { getUsers } from "~/.server/data-layer/users";
import { Main } from "~/components/Main";
import { requireUser } from "~/lib/auth.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUser(request);
  return { users: await getUsers() };
};

export default function Users({ loaderData: { users } }: Route.ComponentProps) {
  return (
    <Main className="py-2">
      <h2 className="text-2xl">Brukere</h2>
      <ul className="divide-y">
        {users.map((user) => (
          <li key={user.id} className="flex flex-col p-2">
            {user.name} {user.role === "admin" ? "(admin)" : null}
            <span className="text-sm">{user.email}</span>
            <span className="text-sm text-gray-500">
              Opprettet: {user.createdAt.toLocaleDateString()}
            </span>
          </li>
        ))}
      </ul>
    </Main>
  );
}
