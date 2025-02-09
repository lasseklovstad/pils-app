import type { Route } from "./+types/sitemap";

import { getDomainUrl } from "~/lib/utils";

export const loader = ({ request }: Route.LoaderArgs) => {
  const domain = getDomainUrl(request);
  const urls = [
    "",
    "batches",
    "batch/1",
    "docs",
    "docs/gear",
    "docs/architecture",
    "docs/coding",
    "docs/about",
    "docs/feedback",
    "privacy",
    "login",
    "sign-up",
  ]
    .map(
      (url) =>
        `<url>
    <loc>${domain}/${url}</loc>
  </url>`,
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  const bytes = new TextEncoder().encode(sitemap).byteLength;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Content-Length": String(bytes),
    },
  });
};
