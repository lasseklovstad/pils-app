import * as crypto from "node:crypto";

import type { Route } from "./+types/controllerApi";

import { getController } from "~/.server/data-layer/controllers";
import { insertControllerTemperature } from "~/.server/data-layer/controllerTemperatures";
import { getVerification } from "~/.server/data-layer/verifications";
import { decryptSecret } from "~/lib/utils";
import { getActiveBatchFromControllerId } from "~/.server/data-layer/batches";

const authorizeRequest = async (controllerId: string, request: Request) => {
  const hmac = request.headers.get("HMAC");
  const timestamp = request.headers.get("Timestamp");
  const nonce = request.headers.get("Nonce");

  if (!hmac || !timestamp || !nonce) {
    throw new Response("Incorrect headers provided.", { status: 401 });
  }
  const verification = await getVerification(controllerId, "controller");
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

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const controllerId = parseInt(params.controllerId);
  await authorizeRequest(params.controllerId, request);
  const [controller, activeBatch] = await Promise.all([
    getController(controllerId),
    getActiveBatchFromControllerId(controllerId),
  ]);
  if (!controller || !activeBatch) throw new Response(null, { status: 404 });

  const dayInMillis = 1000 * 60 * 60 * 24;
  const temperatures = activeBatch.batchTemperatures
    .map((batchTemperature) => {
      const startDate = activeBatch.fermentationStartDate ?? new Date();
      const timestamp =
        batchTemperature.dayIndex * dayInMillis + startDate.valueOf();
      // Convert time to seconds
      return `${timestamp.valueOf() / 1000}-${batchTemperature.temperature}`;
    })
    .join(";");

  // TODO: Add Hmac headers
  return new Response(temperatures, {
    status: 200,
    headers: {
      "x-batch-status": activeBatch.controllerStatus,
      "x-batch-mode": activeBatch.mode ?? "",
    },
  });
};

export const action = async ({ request, params }: Route.ActionArgs) => {
  const controllerId = parseInt(params.controllerId);
  await authorizeRequest(params.controllerId, request);
  if (request.method === "POST") {
    const text = await request.text();
    const temperature = parseFloat(text);
    await insertControllerTemperature({ temperature, controllerId });
    return new Response(null, { status: 200 });
  }
  return new Response(null, { status: 400 });
};
