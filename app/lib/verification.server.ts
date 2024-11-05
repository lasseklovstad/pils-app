import { createCookieSessionStorage } from "react-router";

import type { onboardingEmailSessionKey } from "~/routes/auth/OnBoardingPage";

export const verifySessionStorage = createCookieSessionStorage<{
  [onboardingEmailSessionKey]: string;
}>({
  cookie: {
    name: "en_verification",
    sameSite: "lax", // CSRF protection is advised if changing to 'none'
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 minutes
    secrets: process.env.SESSION_SECRET!.split(","),
    secure: process.env.NODE_ENV === "production",
  },
});
