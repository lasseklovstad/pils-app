import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Loader2, Plus } from "lucide-react";
import { Form, Link, useActionData } from "react-router";
import { z } from "zod";

import type { Route } from "./+types/IndexPage";

import {
  getControllers,
  postController,
} from "~/.server/data-layer/controllers";
import { insertVerification } from "~/.server/data-layer/verifications";
import { ControllerSecretSuccessMessage } from "~/components/ControllerSecretSuccessMessage";
import { Field } from "~/components/Form";
import { Main } from "~/components/Main";
import { Button } from "~/components/ui/button";
import { requireUser } from "~/lib/auth.server";
import { useIsPending } from "~/lib/useIsPending";
import { createControllerSecret, encryptSecret } from "~/lib/utils";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await requireUser(request);
  const controllers = await getControllers(user);
  return { controllers };
};

const PostControllerSchema = z.object({
  name: z.string().trim().min(1),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const user = await requireUser(request);
  const formdata = await request.formData();
  const result = parseWithZod(formdata, { schema: PostControllerSchema });
  if (result.status !== "success") {
    return { status: 400, result: result.reply() };
  }
  const name = result.value.name;
  const secret = createControllerSecret();
  const id = await postController({ name, userId: user.id });
  await insertVerification({
    secret: encryptSecret(secret, process.env.ENCRYPTION_KEY!),
    target: id.toString(),
    type: "controller",
  });
  return {
    status: 200,
    controller: { secret, name, id },
    result: result.reply({ resetForm: true }),
  };
};

export default function ControllersPage({
  loaderData: { controllers },
}: Route.ComponentProps) {
  return (
    <Main className="flex flex-col gap-2">
      <ControllerForm />
      <h2 className="text-4xl">Kontrollere</h2>
      {controllers.length > 0 ? (
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
      ) : (
        <div className="text-muted-foreground">Ingen kontrollere funnet.</div>
      )}
    </Main>
  );
}

const ControllerForm = () => {
  const lastResult = useActionData<typeof action>();
  const isPending = useIsPending();
  const [form, fields] = useForm({
    lastResult: lastResult?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PostControllerSchema });
    },
  });
  return (
    <div className="flex flex-col gap-2 rounded border p-4">
      <Form
        className="flex flex-wrap items-center gap-2"
        method="POST"
        {...getFormProps(form)}
      >
        <Field
          labelProps={{ children: "Navn på kontroller" }}
          inputProps={{
            placeholder: "Eks: Min kontroller",
            autoComplete: "off",
            ...getInputProps(fields.name, { type: "text" }),
          }}
          errors={fields.name.errors}
        />
        <Button type="submit">
          {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
          Opprett
        </Button>
      </Form>
      {lastResult?.status === 200 && lastResult.controller ? (
        <ControllerSecretSuccessMessage controller={lastResult.controller} />
      ) : null}
    </div>
  );
};
