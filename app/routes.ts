import { index, prefix, route } from "@react-router/dev/routes";

import type { RouteConfig } from "@react-router/dev/routes";

export const routes: RouteConfig = [
  index("routes/batch/HomePage.tsx"),
  route("batch/:batchId", "routes/batch/BatchDetailsPage.tsx"),
  route("health", "routes/HealthApi.ts"),
  ...prefix("controller", [
    index("routes/controller/IndexPage.tsx"),
    route(":controllerId", "routes/controller/ControllerDetailsPage.tsx"),
  ]),
  ...prefix("api", [
    route("controller/:controllerId", "routes/api/controllerApi.ts"),
  ]),
];
