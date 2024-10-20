import { index, prefix, route } from "@react-router/dev/routes";

import type { RouteConfig } from "@react-router/dev/routes";

export const routes: RouteConfig = [
  index("routes/batch/HomePage.tsx"),
  route("batch/:batchId", "routes/batch/BatchDetailsPage.tsx"),
  route("login", "routes/auth/LoginPage.tsx"),
  route("sign-up", "routes/auth/SignUpPage.tsx"),
  route("logout", "routes/auth/LogoutPage.tsx"),
  route("verify", "routes/auth/VerifyPage.tsx"),
  route("on-boarding", "routes/auth/OnBoardingPage.tsx"),
  route("health", "routes/HealthApi.ts"),
  ...prefix("controller", [
    index("routes/controller/IndexPage.tsx"),
    route(":controllerId", "routes/controller/ControllerDetailsPage.tsx"),
  ]),
  ...prefix("api", [
    route("controller/:controllerId", "routes/api/controllerApi.ts"),
  ]),
];
