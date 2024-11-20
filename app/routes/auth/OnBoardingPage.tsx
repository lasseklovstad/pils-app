import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Loader2, Plus } from "lucide-react";
import {
  Form,
  redirect,
  useActionData,
  useSearchParams,
  type MetaFunction,
} from "react-router";
import { z } from "zod";

import type { Route } from "./+types/OnBoardingPage";

import { CheckboxField, Field } from "~/components/Form";
import { useIsPending } from "~/lib/useIsPending";
import {
  NameSchema,
  PasswordAndConfirmPasswordSchema,
} from "~/routes/auth/user-validation";
import { verifySessionStorage } from "~/lib/verification.server";
import { requireAnonymous, sessionKey, signup } from "~/lib/auth.server";
import { authSessionStorage } from "~/lib/session.server";
import { safeRedirect } from "~/lib/safeRedirect";
import { Main } from "~/components/Main";
import { Button } from "~/components/ui/button";

export const onboardingEmailSessionKey = "onboardingEmail";

const SignupFormSchema = z
  .object({
    name: NameSchema,
    agreeToTermsOfServiceAndPrivacyPolicy: z.boolean({
      required_error: "Du må godta våre vilkår for bruk og personvernerklæring",
    }),
    remember: z.boolean().optional(),
    redirectTo: z.string().optional(),
  })
  .and(PasswordAndConfirmPasswordSchema);

async function requireOnboardingEmail(request: Request) {
  await requireAnonymous(request);
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const email = verifySession.get(onboardingEmailSessionKey);
  if (typeof email !== "string" || !email) {
    throw redirect("/sign-up");
  }
  return email;
}

export async function loader({ request }: Route.LoaderArgs) {
  const email = await requireOnboardingEmail(request);
  return { email };
}

export async function action({ request }: Route.ActionArgs) {
  const email = await requireOnboardingEmail(request);
  const formData = await request.formData();
  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      SignupFormSchema.transform(async (data) => {
        if (intent !== null) return { ...data, session: null };

        const session = await signup({ ...data, email });
        return { ...data, session };
      }),
    async: true,
  });

  if (submission.status !== "success" || !submission.value.session) {
    return submission.reply();
  }

  const { session, remember, redirectTo } = submission.value;

  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  authSession.set(sessionKey, session.id);
  const verifySession = await verifySessionStorage.getSession();
  const headers = new Headers();
  headers.append(
    "set-cookie",
    await authSessionStorage.commitSession(authSession, {
      expires: remember ? session.expirationDate : undefined,
    }),
  );
  headers.append(
    "set-cookie",
    await verifySessionStorage.destroySession(verifySession),
  );

  return redirect(safeRedirect(redirectTo), { headers });
}

export const meta: MetaFunction = () => {
  return [{ title: "Setup Epic Notes Account" }];
};

export default function OnboardingRoute({
  loaderData: { email },
}: Route.ComponentProps) {
  const actionData = useActionData<typeof action>();
  const isPending = useIsPending();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [form, fields] = useForm({
    id: "onboarding-form",
    constraint: getZodConstraint(SignupFormSchema),
    defaultValue: { redirectTo },
    lastResult: typeof actionData?.status !== "number" ? actionData : undefined,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignupFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <Main>
      <h2 className="text-2xl">Velkommen {email}!</h2>
      <p className="text-body-md text-muted-foreground">Fyll ut skjema</p>
      <Form method="POST" {...getFormProps(form)}>
        <Field
          labelProps={{ htmlFor: fields.name.id, children: "Navn" }}
          inputProps={{
            ...getInputProps(fields.name, { type: "text" }),
            autoComplete: "name",
          }}
          errors={fields.name.errors}
        />
        <Field
          labelProps={{ htmlFor: fields.password.id, children: "Passord" }}
          inputProps={{
            ...getInputProps(fields.password, { type: "password" }),
            autoComplete: "new-password",
          }}
          errors={fields.password.errors}
        />

        <Field
          labelProps={{
            htmlFor: fields.confirmPassword.id,
            children: "Bekreft Passord",
          }}
          inputProps={{
            ...getInputProps(fields.confirmPassword, { type: "password" }),
            autoComplete: "new-password",
          }}
          errors={fields.confirmPassword.errors}
        />

        <CheckboxField
          labelProps={{
            htmlFor: fields.agreeToTermsOfServiceAndPrivacyPolicy.id,
            children: "Godtar du våre vilkår for bruk og personvernerklæring?",
          }}
          buttonProps={getInputProps(
            fields.agreeToTermsOfServiceAndPrivacyPolicy,
            { type: "checkbox" },
          )}
          errors={fields.agreeToTermsOfServiceAndPrivacyPolicy.errors}
        />
        <CheckboxField
          labelProps={{
            htmlFor: fields.remember.id,
            children: "Husk meg",
          }}
          buttonProps={getInputProps(fields.remember, { type: "checkbox" })}
          errors={fields.remember.errors}
        />

        <div className="flex items-center justify-between gap-6">
          <Button type="submit">
            {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
            Opprett bruker
          </Button>
        </div>
      </Form>
    </Main>
  );
}
