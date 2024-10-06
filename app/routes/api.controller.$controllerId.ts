import * as crypto from "node:crypto";

import { ActionFunctionArgs } from "@remix-run/node";

import { getControllerWithHash } from "~/.server/data-layer/controllers";
import { postControllerTemperature } from "~/.server/data-layer/controllerTemperatures";

export const loader = () => new Response("Hei", { status: 200 });

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const controllerId = parseInt(params.controllerId!);
  const secret = request.headers.get("API-X");
  if (!secret) {
    return new Response("No API-X header provided.", { status: 401 });
  }
  const controller = await getControllerWithHash(controllerId);
  if (!controller) {
    return new Response(
      "Could not find controller with id " + params.controllerId,
      { status: 404 },
    );
  }
  const hashedSecret = crypto.createHash("sha256").update(secret).digest("hex");
  if (hashedSecret !== controller.hashedSecret) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (request.method === "POST") {
    const text = await request.text();
    const temperature = parseFloat(text);
    await postControllerTemperature({ temperature, controllerId });
    return new Response(null, { status: 200 });
  }
  return new Response(null, { status: 400 });
};
