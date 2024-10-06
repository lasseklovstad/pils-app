import * as crypto from "node:crypto";

import { ActionFunctionArgs } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { Check, Copy, Loader2, Plus } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import {
  getControllers,
  postController,
} from "~/.server/data-layer/controllers";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Main } from "~/components/Main";

export const loader = async () => {
  const controllers = await getControllers();
  return { controllers };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    const formdata = await request.formData();
    const name = String(formdata.get("name"));
    const secret = crypto.randomBytes(32).toString("hex");
    const hashedSecret = crypto
      .createHash("sha256")
      .update(secret)
      .digest("hex");

    const [{ id }] = await postController({ name, hashedSecret });
    return { ok: true, controller: { secret, name, id } };
  }
  return { ok: true };
};

export default function ControllersPage() {
  const { controllers } = useLoaderData<typeof loader>();
  return (
    <Main className="flex flex-col gap-2">
      <ControllerForm />
      <h2 className="text-4xl">Kontrollere</h2>
      <ul className="divide-y">
        {controllers.map((controller) => (
          <li key={controller.id}>
            <Link
              to={`/controller/${controller.id}`}
              className="flex p-2 text-lg hover:bg-slate-50"
            >
              {controller.name}
            </Link>
          </li>
        ))}
      </ul>
    </Main>
  );
}

const ControllerForm = () => {
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
    <div className="flex flex-col gap-2 rounded border p-4">
      <fetcher.Form className="flex items-end gap-2" method="POST" ref={$form}>
        <div>
          <Label htmlFor={id}>Navn på kontroller</Label>
          <Input
            placeholder="Eks: Min kontroller"
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
          Opprett
        </Button>
      </fetcher.Form>
      {fetcher.data?.ok && fetcher.data.controller ? (
        <div className="flex flex-col gap-2 rounded border border-green-800 bg-green-100 p-2">
          <div className="flex gap-2 font-semibold">
            <Check /> Suksess
          </div>
          <div className="text-sm">
            Ny kontroller med navn {fetcher.data.controller.name} opprettet.
            Lagre koden under, den vises kun en gang.
          </div>
          <div className="break-all">
            Kode: {fetcher.data.controller.secret}
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => {
                if (fetcher.data?.controller?.secret) {
                  navigator.clipboard.writeText(fetcher.data.controller.secret);
                }
              }}
            >
              <Copy />
            </Button>
          </div>
          <div>Id: {fetcher.data.controller.id}</div>
        </div>
      ) : null}
    </div>
  );
};
