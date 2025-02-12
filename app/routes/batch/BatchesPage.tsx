import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { AlertTriangle, Loader2, Plus } from "lucide-react";
import { Form, Link, useActionData } from "react-router";

import type { Route } from "./+types/BatchesPage";

import { deleteAndInsertBatchTemperatures } from "~/.server/data-layer/batchTemperatures";
import { getBatches, postBatch } from "~/.server/data-layer/batches";
import { Field } from "~/components/Form";
import { Main } from "~/components/Main";
import { Button } from "~/components/ui/button";
import { getUser, requireUser } from "~/lib/auth.server";
import { useIsPending } from "~/lib/useIsPending";
import { Separator } from "~/components/ui/separator";

import { createBatchIntent, CreateBatchSchema } from "./actions/batch.schema";
import { BatchPreviewImage } from "./shared/BatchPreviewImage";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Batcher - Pils" }];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [user, batches] = await Promise.all([getUser(request), getBatches()]);
  return { batches, user };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const user = await requireUser(request);
  const formdata = await request.formData();
  const result = parseWithZod(formdata, { schema: CreateBatchSchema });
  if (result.status !== "success") {
    return { result: result.reply(), status: 400 };
  }
  const { id } = await postBatch({
    name: result.value.name,
    userId: user.id,
  });
  await deleteAndInsertBatchTemperatures(id, [
    { dayIndex: 0, temperature: 18 },
    { dayIndex: 14, temperature: 18 },
  ]);
  return { status: 200, result: result.reply({ resetForm: true }) };
};

export default function BatchesPage({
  loaderData: { batches, user },
}: Route.ComponentProps) {
  return (
    <Main className="flex min-h-full flex-col items-start gap-2 py-4">
      {user ? (
        <>
          <BatchForm /> <Separator />
        </>
      ) : (
        <div className="flex items-center gap-2 rounded bg-yellow-100 px-8 py-4">
          <AlertTriangle />
          <Button asChild variant="link" className="px-0">
            <Link to="/login">
              Du må logge inn for å opprette dine egne brygg
            </Link>
          </Button>
        </div>
      )}

      <h2 className="text-4xl">Brygg</h2>
      {batches.length > 0 ? (
        <ul className="w-full divide-y">
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
  const lastResult = useActionData<typeof action>();
  const isPending = useIsPending();
  const [form, fields] = useForm({
    lastResult: lastResult?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CreateBatchSchema });
    },
  });
  return (
    <Form
      className="flex flex-wrap items-center gap-2"
      method="POST"
      {...getFormProps(form)}
    >
      <Field
        labelProps={{ children: "Navn på brygg" }}
        inputProps={{
          placeholder: "Eks: Winter IPA",
          autoComplete: "off",
          ...getInputProps(fields.name, { type: "text" }),
        }}
        errors={fields.name.errors}
      />
      <Button type="submit" name="intent" value={createBatchIntent}>
        {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
        Nytt brygg
      </Button>
    </Form>
  );
};
