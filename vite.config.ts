import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import rehypePrettyCode from "rehype-pretty-code";
import tsconfigPaths from "vite-tsconfig-paths";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";

import type { Options as PrettyOptions } from "rehype-pretty-code";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    mdx({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        [
          rehypePrettyCode,
          { theme: "github-light-default" } satisfies PrettyOptions,
        ],
        [rehypeExternalLinks, { target: "_blank" }],
      ],
    }),
    reactRouter(),
    tsconfigPaths(),
  ],
});
