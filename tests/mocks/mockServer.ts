import { setupServer } from "msw/node";
import { HttpResponse, http } from "msw";

import { writeEmail } from "./utils";

export const server = setupServer(
  http.post("https://api.sendgrid.com/v3/mail/send", async ({ request }) => {
    const body = await request.json();
    console.info("🔶 mocked email contents:", body);

    await writeEmail(body);

    return HttpResponse.json({});
  }),
);
