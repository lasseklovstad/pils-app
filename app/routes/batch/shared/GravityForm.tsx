import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Loader2, Save } from "lucide-react";
import { Form, useActionData } from "react-router";

import type { action } from "../BatchDetailsPage";

import { Batch } from "db/schema";
import { Field } from "~/components/Form";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { useIsPending } from "~/lib/useIsPending";

import { putGravityIntent, PutGravitySchema } from "../actions/batch.schema";

type Props = {
  batch: Batch;
  readOnly: boolean;
};

export const GravityForm = ({ batch, readOnly }: Props) => {
  const lastResult = useActionData<typeof action>();
  const isPending = useIsPending();
  const [form, fields] = useForm({
    lastResult: lastResult?.result,
    defaultValue: {
      finalGravity: batch.finalGravity,
      originalGravity: batch.originalGravity,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: PutGravitySchema });
    },
  });
  const abv =
    batch.finalGravity && batch.originalGravity
      ? ((batch.originalGravity - batch.finalGravity) / 7.169).toFixed(1)
      : null;
  return (
    <>
      <AccordionTrigger>
        Alkoholprosent {abv ? `${abv}%` : null}
      </AccordionTrigger>
      <AccordionContent>
        <Form method="PUT" className="space-y-2 p-2" {...getFormProps(form)}>
          <h2 className="text-xl">Alkoholprosent</h2>
          {abv ? (
            <div className="text-base">
              <span className="font-medium">ABV:</span> {abv}%
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Fyll ut begge for å se alkoholprosent
            </div>
          )}
          <div className="flex items-end gap-2">
            <Field
              labelProps={{ children: "Original gravity" }}
              inputProps={{
                readOnly,
                ...getInputProps(fields.originalGravity, { type: "number" }),
              }}
              errors={fields.originalGravity.errors}
            />
            <Field
              labelProps={{ children: "Final gravity" }}
              inputProps={{
                readOnly,
                ...getInputProps(fields.finalGravity, { type: "number" }),
              }}
              errors={fields.finalGravity.errors}
            />
          </div>
          <Button
            name="intent"
            value={putGravityIntent}
            size="sm"
            disabled={readOnly}
          >
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            Lagre
          </Button>
        </Form>
      </AccordionContent>
    </>
  );
};
