import { ActionFunctionArgs } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useId, useRef } from "react";
import { getBatches, postBatch } from "~/.server/data-layer/batches";
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
    <main className="p-2">
      <h1 className="text-6xl mb-4">🍺Pils</h1>
      <BatchForm />
      <h2 className="text-4xl">Brygg</h2>
      <ul className="divide-y">
        {batches.map((batch) => (
          <li key={batch.id} className="p-2 flex flex-col">
            <span>{batch.name}</span>
            <span>
              {batch.createdTimestamp.toLocaleDateString()}{" "}
              {batch.createdTimestamp.toLocaleTimeString()}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}

const BatchForm = () => {
  const id = useId();
  const $form = useRef<HTMLFormElement>(null);
  const fetcher = useFetcher<typeof action>();

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
      className="flex gap-2 items-end border rounded p-4"
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
