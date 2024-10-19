import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, useActionData, useSearchParams } from "react-router";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";

import type { ActionArgs, ActionData } from "./+types.VerifyPage";

import { ErrorList, OTPField } from "~/components/Form";
import { useIsPending } from "~/lib/useIsPending";
import { Button } from "~/components/ui/button";

import { validateRequest } from "./verify.server";

export const codeQueryParam = "code";
export const targetQueryParam = "target";

export const VerifySchema = z.object({
  [codeQueryParam]: z.string().min(6).max(6),
  [targetQueryParam]: z.string(),
});

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  return validateRequest(request, formData);
}

export default function VerifyRoute() {
  const [searchParams] = useSearchParams();
  const isPending = useIsPending();
  const actionData = useActionData() as ActionData;

  const [form, fields] = useForm({
    id: "verify-form",
    constraint: getZodConstraint(VerifySchema),
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: VerifySchema });
    },
    defaultValue: {
      code: searchParams.get(codeQueryParam),
      target: searchParams.get(targetQueryParam),
    },
  });

  return (
    <main className="container flex flex-col justify-center pb-32 pt-20">
      <div className="mx-auto flex w-72 max-w-full flex-col justify-center gap-1">
        <div>
          <ErrorList errors={form.errors} id={form.errorId} />
        </div>
        <div className="flex w-full gap-2">
          <Form method="POST" {...getFormProps(form)} className="flex-1">
            <div className="flex items-center justify-center">
              <OTPField
                labelProps={{
                  htmlFor: fields[codeQueryParam].id,
                  children: "Kode",
                }}
                inputProps={{
                  ...getInputProps(fields[codeQueryParam], { type: "text" }),
                  autoComplete: "one-time-code",
                  autoFocus: true,
                }}
                errors={fields[codeQueryParam].errors}
              />
            </div>
            <input
              {...getInputProps(fields[targetQueryParam], { type: "hidden" })}
            />
            <Button type="submit">
              {isPending ? <Loader2 className="animate-spin" /> : <Send />}
              Send inn
            </Button>
          </Form>
        </div>
      </div>
    </main>
  );
}
