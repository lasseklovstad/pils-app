import closeWithGrace from "close-with-grace";

import { server } from "tests/mocks/mockServer";
import "./server.mjs";

server.listen({ onUnhandledRequest: "warn" });

if (process.env.NODE_ENV !== "test") {
  console.info("🔶 Mock server installed");

  closeWithGrace(() => {
    server.close();
  });
}
