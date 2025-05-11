import { parseWithZod } from "@conform-to/zod";
import { redirect } from "react-router";
import { z } from "zod";
import { sub } from "date-fns";
import { Check, RefreshCw, X } from "lucide-react";

import type { Route } from "./+types/ControllerDetailsPage";

import { getBatchesFromControllerId } from "~/.server/data-layer/batches";
import {
  deleteController,
  getControllerByUser,
  putController,
} from "~/.server/data-layer/controllers";
import {
  getControllerTemperatures,
  getControllerTemperaturesErrorTotalCount,
  getControllerTemperaturesTotalCount,
  getLatestControllerTemperature,
  insertControllerTemperature,
} from "~/.server/data-layer/controllerTemperatures";
import { insertVerification } from "~/.server/data-layer/verifications";
import { Main } from "~/components/Main";
import { requireUser } from "~/lib/auth.server";
import { useRevalidateOnFocus } from "~/lib/useRevalidateOnFocus";
import { cn, createControllerSecret, encryptSecret } from "~/lib/utils";
import { Button } from "~/components/ui/button";

import { ControllerMenu } from "./shared/ControllerMenu";
import { TemperatureChart } from "./shared/TemperatureChart";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const currentUser = await requireUser(request);
  const interval =
    new URL(request.url).searchParams.get("interval") ?? "timestamp";
  const controllerId = parseInt(params.controllerId);
  const [
    controller,
    controllerTemperatures,
    latestTemperature,
    totalCount,
    totalErrorCount,
    batches,
  ] = await Promise.all([
    getControllerByUser(controllerId, currentUser),
    getControllerTemperatures(controllerId, interval),
    getLatestControllerTemperature(controllerId),
    getControllerTemperaturesTotalCount(controllerId),
    getControllerTemperaturesErrorTotalCount(controllerId),
    getBatchesFromControllerId(controllerId),
  ]);
  if (!controller) {
    throw new Response(`Fant ingen kontroller med id ${params.controllerId}`, {
      status: 404,
    });
  }
  return {
    controller,
    controllerTemperatures,
    latestTemperature,
    totalCount,
    totalErrorCount,
    batches,
  };
};

const requireUserOwnerOfController = async (
  request: Request,
  controllerId: number,
) => {
  const currentUser = await requireUser(request);
  const controller = await getControllerByUser(controllerId, currentUser);
  if (controller?.userId !== currentUser.id) {
    throw new Response("Unauthorized", { status: 403 });
  }
};
export const editControllerIntent = "edit-controller";
export const EditNameSchema = z.object({
  intent: z.literal(editControllerIntent),
  name: z.string().trim().min(1),
  minDelayInSeconds: z.number().int().min(0),
  avgTemperatureBufferSize: z.number().int().min(0),
  hysteresis: z.number().min(0),
});
const testTemperatureIntent = "test-temperature";
const TestTemperatureSchema = z.object({
  intent: z.literal(testTemperatureIntent),
  temperature: z.number(),
});
const editSecretIntent = "edit-secret";
const EditSecretSchema = z.object({
  intent: z.literal(editSecretIntent),
});
export const deleteControllerIntent = "delete-controller";
const DeleteControllerSchema = z.object({
  intent: z.literal(deleteControllerIntent),
});

export const action = async ({ request, params }: Route.ActionArgs) => {
  const controllerId = parseInt(params.controllerId);
  await requireUserOwnerOfController(request, controllerId);
  const formData = await request.formData();
  const schema = z.union([
    EditNameSchema,
    TestTemperatureSchema,
    EditSecretSchema,
    DeleteControllerSchema,
  ]);
  const result = parseWithZod(formData, { schema });
  if (result.status !== "success") {
    return { result: result.reply(), status: 400 };
  }
  switch (result.value.intent) {
    case editControllerIntent:
      await putController(controllerId, result.value);
      return { status: 200, result: result.reply({ resetForm: true }) };
    case testTemperatureIntent:
      await insertControllerTemperature({
        temperature: result.value.temperature,
        controllerId,
      });
      return { status: 200, result: result.reply({ resetForm: true }) };
    case editSecretIntent: {
      const secret = createControllerSecret();
      await insertVerification({
        secret: encryptSecret(secret, process.env.ENCRYPTION_KEY!),
        target: controllerId.toString(),
        type: "controller",
      });
      return { status: 200, secret };
    }
    case deleteControllerIntent:
      await deleteController(controllerId);
      throw redirect("/controller");
  }
};

export default function ControllerPage({
  loaderData: {
    controller,
    controllerTemperatures,
    latestTemperature,
    totalErrorCount,
    totalCount,
    batches,
  },
}: Route.ComponentProps) {
  const revalidator = useRevalidateOnFocus();

  const isActive = latestTemperature
    ? latestTemperature.timestamp.valueOf() >=
      sub(new Date(), { minutes: 15 }).valueOf()
    : false;
  return (
    <Main className="flex w-full flex-col items-start gap-2">
      <div className="flex w-full items-center justify-between">
        <h2 className="flex items-center gap-2 text-4xl">
          {controller.name}{" "}
          {isActive ? (
            <Check className="size-8 text-green-500" />
          ) : (
            <X className="size-8 text-red-500" />
          )}
        </h2>
        <ControllerMenu controller={controller} />
      </div>
      <Button
        onClick={() => {
          void revalidator.revalidate();
        }}
      >
        <RefreshCw
          className={cn(revalidator.state !== "idle" && "animate-spin")}
        />
        Refresh
      </Button>
      <div>Identifikator: {controller.id}</div>
      {latestTemperature ? (
        <>
          <div>
            Siste målingstidspunkt:{" "}
            {latestTemperature.timestamp.toLocaleDateString("nb")}{" "}
            {latestTemperature.timestamp.toLocaleTimeString("nb", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
          </div>
          <div>Siste måling temperatur: {latestTemperature.temperature}°C</div>
        </>
      ) : null}

      <div>Antall feilmålinger: {totalErrorCount}</div>
      <TemperatureChart
        controllerTemperatures={controllerTemperatures}
        totalCount={totalCount}
        batches={batches}
      />
    </Main>
  );
}
