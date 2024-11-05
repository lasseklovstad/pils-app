import { Loader2, Plus } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { Link, useFetcher } from "react-router";

import type { Route } from "./+types.HomePage";

import { deleteAndInsertBatchTemperatures } from "~/.server/data-layer/batchTemperatures";
import { getBatches, postBatch } from "~/.server/data-layer/batches";
import { Main } from "~/components/Main";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getUser, requireUser } from "~/lib/auth.server";

import { BatchPreviewImage } from "./shared/BatchPreviewImage";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [user, batches] = await Promise.all([getUser(request), getBatches()]);
  return { batches, user };
};

export const action = async ({ request }: Route.ActionArgs) => {
  if (request.method === "POST") {
    const user = await requireUser(request);
    const formdata = await request.formData();
    const name = String(formdata.get("name"));
    const { id } = await postBatch({ name, userId: user.id });
    await deleteAndInsertBatchTemperatures(id, [
      { dayIndex: 0, temperature: 18 },
      { dayIndex: 14, temperature: 18 },
    ]);
  }
  return { ok: true };
};

export default function Home({
  loaderData: { batches, user },
}: Route.ComponentProps) {
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
                <BatchPreviewImage publicUrl={batch.previewFilePublicUrl} />
                <div className="flex flex-col">
                  <span className="text-lg">{batch.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {batch.createdTimestamp.toLocaleDateString("nb", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
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
  const fetcher = useFetcher<Route.ActionData>();
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
