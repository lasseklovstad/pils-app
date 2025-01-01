import { index, layout, prefix, route } from "@react-router/dev/routes";

import type { RouteConfig } from "@react-router/dev/routes";

const routes: RouteConfig = [
  index("routes/HomePage.tsx"),
  route("batches", "routes/batch/BatchesPage.tsx"),
  route("batch/:batchId", "routes/batch/BatchDetailsPage.tsx"),
  route("login", "routes/auth/LoginPage.tsx"),
  route("sign-up", "routes/auth/SignUpPage.tsx"),
  route("logout", "routes/auth/LogoutPage.tsx"),
  route("verify", "routes/auth/VerifyPage.tsx"),
  route("on-boarding", "routes/auth/OnBoardingPage.tsx"),
  route("health", "routes/HealthApi.ts"),
  route("docs", "routes/docs/DocsLayout.tsx", [index("routes/docs/About.mdx")]),
  ...prefix("controller", [
    index("routes/controller/IndexPage.tsx"),
    route(":controllerId", "routes/controller/ControllerDetailsPage.tsx"),
  ]),
  ...prefix("api", [
    route("controller/:controllerId", "routes/api/controllerApi.ts"),
    route("files/image/:fileId", "routes/api/batchImageApi.ts"),
    route("files/video/:fileId", "routes/api/batchVideoApi.ts"),
  ]),
];

export default routes;
