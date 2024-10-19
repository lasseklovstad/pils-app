import { generateTOTP, verifyTOTP } from "@epic-web/totp";
import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { redirect } from "react-router";

import type { Submission } from "@conform-to/react";

import { getDomainUrl } from "~/lib/utils";
import {
  deleteVerification,
  getVerification,
  insertVerification,
} from "~/.server/data-layer/verifications";
import { verifySessionStorage } from "~/lib/verification.server";

import { codeQueryParam, targetQueryParam, VerifySchema } from "./VerifyPage";
import { onboardingEmailSessionKey } from "./OnBoardingPage";

export type VerifyFunctionArgs = {
  request: Request;
  submission: Submission<
    z.input<typeof VerifySchema>,
    string[],
    z.output<typeof VerifySchema>
  >;
  body: FormData | URLSearchParams;
};

export function getRedirectToUrl({
  request,
  target,
}: {
  request: Request;
  target: string;
}) {
  const redirectToUrl = new URL(`${getDomainUrl(request)}/verify`);
  redirectToUrl.searchParams.set("type", "onboarding");
  redirectToUrl.searchParams.set(targetQueryParam, target);
  return redirectToUrl;
}

export async function prepareVerification({
  period,
  request,
  target,
}: {
  period: number;
  request: Request;
  target: string;
}) {
  const verifyUrl = getRedirectToUrl({ request, target });
  const redirectTo = new URL(verifyUrl.toString());

  const verificationConfig = await generateTOTP({
    algorithm: "SHA-256",
    // Leaving off 0, O, and I on purpose to avoid confusing users.
    charSet: "ABCDEFGHJKLMNPQRSTUVWXYZ123456789",
    period,
  });
  await insertVerification({
    secret: verificationConfig.secret,
    target,
    type: "onboarding",
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
  });

  // add the otp to the url we'll email the user.
  verifyUrl.searchParams.set(codeQueryParam, verificationConfig.otp);

  return { otp: verificationConfig.otp, redirectTo, verifyUrl };
}

export async function isCodeValid({
  code,
  target,
}: {
  code: string;
  target: string;
}) {
  const verification = await getVerification(target, "onboarding");
  if (!verification) return false;
  const result = verifyTOTP({
    otp: code,
    ...verification,
  });
  if (!result) return false;

  return true;
}

export async function validateRequest(
  request: Request,
  body: URLSearchParams | FormData,
) {
  const submission = await parseWithZod(body, {
    schema: VerifySchema.superRefine(async (data, ctx) => {
      const codeIsValid = await isCodeValid({
        code: data[codeQueryParam],
        target: data[targetQueryParam],
      });
      if (!codeIsValid) {
        ctx.addIssue({
          path: ["code"],
          code: z.ZodIssueCode.custom,
          message: `Invalid code`,
        });
        return;
      }
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { value: submissionValue } = submission;

  await deleteVerification(submissionValue[targetQueryParam], "onboarding");
  const verifySession = await verifySessionStorage.getSession();
  verifySession.set(onboardingEmailSessionKey, submission.value.target);
  return redirect("/on-boarding", {
    headers: {
      "set-cookie": await verifySessionStorage.commitSession(verifySession),
    },
  });
}
