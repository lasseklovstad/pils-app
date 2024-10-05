import { ActionFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { getBatches, postBatch } from "~/.server/data-layer/batches";
import { Main } from "~/components/Main";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export const loader = async () => {
  const batches = await getBatches();
  return { batches };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    const formdata = await request.formData();
    const name = String(formdata.get("name"));
    await postBatch(name);
  }
  return { ok: true };
};

export default function Home() {
  const { batches } = useLoaderData<typeof loader>();

  return (
    <Main>
      <BatchForm />
      <h2 className="text-4xl">Brygg</h2>
      <ul className="divide-y">
        {batches.map((batch) => (
          <li key={batch.id}>
            <Link
              to={`/batch/${batch.id}`}
              className="flex flex-col p-2 hover:bg-slate-50"
            >
              <span className="text-lg">{batch.name}</span>
              <span className="text-sm text-muted-foreground">
                {batch.createdTimestamp.toLocaleDateString("nb")}{" "}
                {batch.createdTimestamp.toLocaleTimeString("nb")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Main>
  );
}

const BatchForm = () => {
  const id = useId();
  const fetcher = useFetcher<typeof action>();
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
      className="flex items-end gap-2 rounded border p-4"
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
