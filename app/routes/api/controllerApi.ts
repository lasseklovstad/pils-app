import * as crypto from "node:crypto";

import type { ActionArgs, LoaderArgs } from "./+types.controllerApi";

import { getController } from "~/.server/data-layer/controllers";
import { postControllerTemperature } from "~/.server/data-layer/controllerTemperatures";
import { getVerification } from "~/.server/data-layer/verifications";
import { decryptSecret } from "~/lib/utils";

const authorizeRequest = async (controllerId: string, request: Request) => {
  const hmac = request.headers.get("HMAC");
  const timestamp = request.headers.get("Timestamp");
  const nonce = request.headers.get("Nonce");

  if (!hmac || !timestamp || !nonce) {
    throw new Response("Incorrect headers provided.", { status: 401 });
  }
  const verification = await getVerification(controllerId);
  if (!verification) {
    throw new Response("Could not find controller with id " + controllerId, {
      status: 404,
    });
  }
  const secret = decryptSecret(
    verification.secret,
    process.env.ENCRYPTION_KEY!,
  );
  const serverHmac = crypto
    .createHmac("sha256", secret)
    .update(timestamp + ":" + nonce)
    .digest("hex");
  if (serverHmac !== hmac) {
    throw new Response("Unauthorized", { status: 401 });
  }
  // Verify timestamp
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const timeDifference = currentTimestamp - parseInt(timestamp);

  if (timeDifference > 60 || timeDifference < -60) {
    throw new Response("Unauthorized, invalid timestamp", { status: 401 });
  }
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const controllerId = parseInt(params.controllerId);
  await authorizeRequest(params.controllerId, request);
  const controller = await getController(controllerId);
  if (!controller) throw new Response(null, { status: 404 });
  return new Response(controller.isRelayOn.toString(), { status: 200 });
};

export const action = async ({ request, params }: ActionArgs) => {
  const controllerId = parseInt(params.controllerId);
  await authorizeRequest(params.controllerId, request);
  if (request.method === "POST") {
    const text = await request.text();
    const temperature = parseFloat(text);
    await postControllerTemperature({ temperature, controllerId });
    return new Response(null, { status: 200 });
  }
  return new Response(null, { status: 400 });
};
