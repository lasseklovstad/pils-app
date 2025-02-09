import { index, layout, prefix, route } from "@react-router/dev/routes";

import type { RouteConfig } from "@react-router/dev/routes";

const routes: RouteConfig = [
  index("routes/HomePage.tsx"),
  route("batches", "routes/batch/BatchesPage.tsx"),
  route("users", "routes/users/users.tsx"),
  route("batch/:batchId", "routes/batch/BatchDetailsPage.tsx"),
  route("login", "routes/auth/LoginPage.tsx"),
  route("sign-up", "routes/auth/SignUpPage.tsx"),
  route("logout", "routes/auth/LogoutPage.tsx"),
  route("verify", "routes/auth/VerifyPage.tsx"),
  route("on-boarding", "routes/auth/OnBoardingPage.tsx"),
  route("health", "routes/HealthApi.ts"),
  route("docs", "routes/docs/DocsLayout.tsx", [
    index("routes/docs/getting-started.mdx"),
    route("gear", "routes/docs/gear.mdx"),
    route("feedback", "routes/docs/feedback.mdx"),
    route("about", "routes/docs/about-us.mdx"),
    route("architecture", "routes/docs/architecture.mdx"),
    route("coding", "routes/docs/coding.mdx"),
  ]),
  ...prefix("controller", [
    index("routes/controller/IndexPage.tsx"),
    route(":controllerId", "routes/controller/ControllerDetailsPage.tsx"),
  ]),
  ...prefix("api", [
    route("controller/:controllerId", "routes/api/controllerApi.ts"),
    route("files/image/:fileId", "routes/api/batchImageApi.ts"),
    route("files/video/:fileId", "routes/api/batchVideoApi.ts"),
  ]),
  layout("routes/mdx-layout.tsx", [route("privacy", "routes/privacy.mdx")]),
  route("sitemap.xml", "routes/sitemap.ts"),
];

export default routes;
