import * as crypto from "node:crypto";

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import {
  getController,
  getControllerWithHash,
} from "~/.server/data-layer/controllers";
import { postControllerTemperature } from "~/.server/data-layer/controllerTemperatures";

const authorizeRequest = async (controllerId: number, request: Request) => {
  const secret = request.headers.get("API-X");
  if (!secret) {
    throw new Response("No API-X header provided.", { status: 401 });
  }
  const controller = await getControllerWithHash(controllerId);
  if (!controller) {
    throw new Response("Could not find controller with id " + controllerId, {
      status: 404,
    });
  }
  const hashedSecret = crypto.createHash("sha256").update(secret).digest("hex");
  if (hashedSecret !== controller.hashedSecret) {
    throw new Response("Unauthorized", { status: 401 });
  }
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const controllerId = parseInt(params.controllerId!);
  await authorizeRequest(controllerId, request);
  const controller = await getController(controllerId);
  return new Response(controller.isRelayOn.toString(), { status: 200 });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const controllerId = parseInt(params.controllerId!);
  await authorizeRequest(controllerId, request);
  if (request.method === "POST") {
    const text = await request.text();
    const temperature = parseFloat(text);
    await postControllerTemperature({ temperature, controllerId });
    return new Response(null, { status: 200 });
  }
  return new Response(null, { status: 400 });
};
