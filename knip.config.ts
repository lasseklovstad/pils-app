import type { RouteConfigEntry } from "@react-router/dev/routes";
import type { KnipConfig } from "knip";

const routeConfig = await (await import("./app/routes")).default;

const mapRoute = (route: RouteConfigEntry): string[] => {
  return [
    `app/${route.file}`,
    ...(route.children ? route.children.flatMap(mapRoute) : []),
  ];
};
const routeEntryFiles = routeConfig.flatMap(mapRoute);

export default {
  entry: [
    ...routeEntryFiles,
    "app/root.tsx",
    "app/routes.ts",
    "app/entry.{server,client}.tsx",
  ],
} as KnipConfig;
