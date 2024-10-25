import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Loader2, LogIn } from "lucide-react";
import { Form, Link, useActionData, useSearchParams } from "react-router";
import { z } from "zod";

import type { ActionData, ActionArgs, LoaderArgs } from "./+types.LoginPage";

import { CheckboxField, ErrorList, Field } from "~/components/Form";
import { Main } from "~/components/Main";
import { Button } from "~/components/ui/button";
import { useIsPending } from "~/lib/useIsPending";
import { EmailSchema, PasswordSchema } from "~/routes/auth/user-validation";
import { login, requireAnonymous } from "~/lib/auth.server";
import { handleNewSession } from "~/lib/login.server";

const LoginFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  redirectTo: z.string().optional(),
  remember: z.boolean().optional(),
});

export async function loader({ request }: LoaderArgs) {
  await requireAnonymous(request);
  return {};
}

export async function action({ request }: ActionArgs) {
  await requireAnonymous(request);
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      LoginFormSchema.transform(async (data, ctx) => {
        if (intent !== null) return { ...data, session: null };

        const session = await login(data);
        if (!session) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Feil e-post eller brukernavn",
          });
          return z.NEVER;
        }

        return { ...data, session };
      }),
    async: true,
  });

  if (submission.status !== "success" || !submission.value.session) {
    return submission.reply({ hideFields: ["password"] });
  }

  const { session, remember, redirectTo } = submission.value;

  handleNewSession({
    request,
    session,
    remember: remember ?? false,
    redirectTo,
  });
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<ActionData>();
  const isPending = useIsPending();
  const [form, fields] = useForm({
    id: "login-form",
    constraint: getZodConstraint(LoginFormSchema),
    lastResult: actionData,
    defaultValue: { redirectTo: searchParams.get("redirectTo") },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginFormSchema });
    },
    shouldRevalidate: "onBlur",
  });
  return (
    <Main className="flex flex-col items-start justify-start gap-4">
      <h2 className="text-2xl">Logg inn til din bruker</h2>
      <Form method="POST" {...getFormProps(form)}>
        <Field
          labelProps={{ children: "E-post" }}
          inputProps={{
            ...getInputProps(fields.email, { type: "email" }),
            className: "lowercase",
            autoComplete: "username",
            placeholder: "din.bruker@gmail.com",
          }}
          errors={fields.email.errors}
        />

        <Field
          labelProps={{ children: "Passord" }}
          inputProps={{
            ...getInputProps(fields.password, {
              type: "password",
            }),
            autoComplete: "current-password",
          }}
          errors={fields.password.errors}
        />
        <CheckboxField
          labelProps={{
            htmlFor: fields.remember.id,
            children: "Husk meg",
          }}
          buttonProps={getInputProps(fields.remember, {
            type: "checkbox",
          })}
          errors={fields.remember.errors}
        />
        <input {...getInputProps(fields.redirectTo, { type: "hidden" })} />
        <ErrorList errors={form.errors} id={form.errorId} className="mb-2" />
        <Button type="submit">
          {isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
          Logg inn
        </Button>
      </Form>
      <div className="text-sm">
        Har du ikke konto ?{" "}
        <Button variant="link" asChild>
          <Link to="/sign-up">Registrer deg her</Link>
        </Button>
      </div>
    </Main>
  );
}
