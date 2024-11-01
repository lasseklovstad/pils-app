import { Loader2, Plus } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { Link, useFetcher } from "react-router";

import type {
  ActionArgs,
  ActionData,
  ComponentProps,
  LoaderArgs,
} from "./+types.HomePage";

import { getBatches, postBatch } from "~/.server/data-layer/batches";
import { Main } from "~/components/Main";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getUser, requireUser } from "~/lib/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  const [user, batches] = await Promise.all([getUser(request), getBatches()]);
  return { batches, user };
};

export const action = async ({ request }: ActionArgs) => {
  if (request.method === "POST") {
    const user = await requireUser(request);
    const formdata = await request.formData();
    const name = String(formdata.get("name"));
    await postBatch({ name, userId: user.id });
  }
  return { ok: true };
};

export default function Home({
  loaderData: { batches, user },
}: ComponentProps) {
  return (
    <Main className="flex flex-col gap-2">
      {user ? <BatchForm /> : null}
      <h2 className="text-4xl">Brygg</h2>
      {batches.length > 0 ? (
        <ul className="divide-y">
          {batches.map((batch) => (
            <li key={batch.id}>
              <Link
                to={`/batch/${batch.id}`}
                className="flex gap-2 p-2 hover:bg-slate-50"
              >
                <img
                  src={
                    batch.picture
                      ? batch.picture + "?w=200"
                      : "/android-chrome-192x192.png"
                  }
                  className="aspect-square w-24 rounded object-cover"
                ></img>
                <div className="flex flex-col">
                  <span className="text-lg">{batch.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {batch.createdTimestamp.toLocaleDateString("nb")}{" "}
                    {batch.createdTimestamp.toLocaleTimeString("nb")}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-muted-foreground">Ingen brygg funnet.</div>
      )}
    </Main>
  );
}

const BatchForm = () => {
  const id = useId();
  const fetcher = useFetcher<ActionData>();
  const $form = useRef<HTMLFormElement>(null);

  useEffect(
    function resetFormOnSuccess() {
      if (fetcher.state === "idle" && fetcher.data?.ok) {
        $form.current?.reset();
      }
    },
    [fetcher.state, fetcher.data],
  );
  return (
    <fetcher.Form
      className="flex flex-wrap items-end gap-2 rounded border p-4"
      method="POST"
      ref={$form}
    >
      <div>
        <Label htmlFor={id}>Navn på brygg</Label>
        <Input
          placeholder="Eks: Winter IPA"
          id={id}
          required
          autoComplete="off"
          name="name"
        />
      </div>
      <Button type="submit">
        {fetcher.state !== "idle" ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Plus />
        )}
        Nytt brygg
      </Button>
    </fetcher.Form>
  );
};
