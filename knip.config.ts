import { KnipConfig } from "knip";

export default {
  entry: [
    "app/root.tsx",
    "app/entry.{client,server}.{js,jsx,ts,tsx}",
    "app/routes/**/*{Page,Api,Layout}.{js,ts,tsx}",
    "app/routes/**/*.mdx",
    "app/routes.ts",
  ],
} as KnipConfig;
