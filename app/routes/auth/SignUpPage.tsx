import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Loader2, Send } from "lucide-react";
import { Form, redirect, useActionData, type MetaFunction } from "react-router";
import { z } from "zod";
import * as E from "@react-email/components";

import type { ActionArgs, ActionData, LoaderArgs } from "./+types.SignUpPage";

import { Field } from "~/components/Form";
import { Main } from "~/components/Main";
import { Button } from "~/components/ui/button";
import { useIsPending } from "~/lib/useIsPending";
import { EmailSchema } from "~/routes/auth/user-validation";
import { sendMail } from "~/.server/emailService";
import { getUserByEmail } from "~/.server/data-layer/users";
import { requireAnonymous } from "~/lib/auth.server";

import { prepareVerification } from "./verify.server";

const SignUpFormSchema = z.object({
  email: EmailSchema,
});

export const loader = async ({ request }: LoaderArgs) => {
  await requireAnonymous(request);
};

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    schema: SignUpFormSchema.superRefine(async (data, ctx) => {
      const existingUser = await getUserByEmail(data.email);
      if (existingUser) {
        ctx.addIssue({
          path: ["email"],
          code: z.ZodIssueCode.custom,
          message: "En bruker eksisterer allerede med denne e-posten",
        });
        return;
      }
    }),
    async: true,
  });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const { email } = submission.value;
  const { verifyUrl, redirectTo, otp } = await prepareVerification({
    period: 10 * 60,
    request,
    target: email,
  });

  const response = await sendMail({
    to: email,
    subject: "Velkommen til Pils!",
    html: <SignupEmail onboardingUrl={verifyUrl.toString()} otp={otp} />,
  });

  if (response.status === "success") {
    return redirect(redirectTo.toString());
  } else {
    return submission.reply({ formErrors: [response.message] });
  }
}

export function SignupEmail({
  onboardingUrl,
  otp,
}: {
  onboardingUrl: string;
  otp: string;
}) {
  return (
    <E.Html lang="nb" dir="ltr">
      <E.Container>
        <h1>
          <E.Text>Velkommen til Pils!</E.Text>
        </h1>
        <p>
          <E.Text>
            Her er koden: <strong>{otp}</strong>
          </E.Text>
        </p>
        <p>
          <E.Text>Eller trykk på lenken for å komme i gang:</E.Text>
        </p>
        <E.Link href={onboardingUrl}>{onboardingUrl}</E.Link>
      </E.Container>
    </E.Html>
  );
}

export const meta: MetaFunction = () => {
  return [{ title: "Registrer deg" }];
};

export default function SignUpPage() {
  const actionData = useActionData<ActionData>();
  const isPending = useIsPending();
  const [form, fields] = useForm({
    id: "login-form",
    constraint: getZodConstraint(SignUpFormSchema),
    lastResult: typeof actionData?.status !== "number" ? actionData : undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignUpFormSchema });
    },
    shouldRevalidate: "onBlur",
  });
  return (
    <Main className="flex flex-col items-start justify-start gap-4">
      <h2 className="text-2xl">Lag ny bruker</h2>
      <Form method="POST" {...getFormProps(form)}>
        <Field
          labelProps={{ children: "E-post" }}
          inputProps={{
            ...getInputProps(fields.email, { type: "email" }),
            autoFocus: true,
            className: "lowercase",
            autoComplete: "username",
            placeholder: "din.bruker@gmail.com",
          }}
          errors={fields.email.errors}
        />
        <Button type="submit">
          {isPending ? <Loader2 className="animate-spin" /> : <Send />}
          Send inn
        </Button>
      </Form>
    </Main>
  );
}
