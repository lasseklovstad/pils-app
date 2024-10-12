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
import { createControllerSecret } from "~/lib/utils";
import { ControllerSecretSuccessMessage } from "~/components/ControllerSecretSuccessMessage";

export const loader = async () => {
  const controllers = await getControllers();
  return { controllers };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method === "POST") {
    const formdata = await request.formData();
    const name = String(formdata.get("name"));
    const { secret, hashedSecret } = createControllerSecret();

    const id = await postController({ name, hashedSecret });
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
        <ControllerSecretSuccessMessage controller={fetcher.data.controller} />
      ) : null}
    </div>
  );
};
