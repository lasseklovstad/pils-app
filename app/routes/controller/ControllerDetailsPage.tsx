import { sub } from "date-fns";
import { Check, RefreshCw, X } from "lucide-react";
import { redirect, useSubmit } from "react-router";

import type {
  ActionArgs,
  ComponentProps,
  LoaderArgs,
} from "./+types.ControllerDetailsPage";

import {
  deleteController,
  getController,
  putController,
} from "~/.server/data-layer/controllers";
import {
  getControllerTemperatures,
  getControllerTemperaturesErrorTotalCount,
  getControllerTemperaturesTotalCount,
  getLatestControllerTemperature,
} from "~/.server/data-layer/controllerTemperatures";
import { Main } from "~/components/Main";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { useRevalidateOnFocus } from "~/lib/useRevalidateOnFocus";
import { cn, createControllerSecret, encryptSecret } from "~/lib/utils";
import { insertVerification } from "~/.server/data-layer/verifications";

import { ControllerMenu } from "./shared/ControllerMenu";
import { TemperatureChart } from "./shared/TemperatureChart";

export const loader = async ({ params, request }: LoaderArgs) => {
  const interval =
    new URL(request.url).searchParams.get("interval") ?? "timestamp";
  const controllerId = parseInt(params.controllerId);
  const [
    controller,
    controllerTemperatures,
    latestTemperature,
    totalCount,
    totalErrorCount,
  ] = await Promise.all([
    getController(controllerId),
    getControllerTemperatures(controllerId, interval),
    getLatestControllerTemperature(controllerId),
    getControllerTemperaturesTotalCount(controllerId),
    getControllerTemperaturesErrorTotalCount(controllerId),
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
  };
};

export const action = async ({ request, params }: ActionArgs) => {
  const controllerId = parseInt(params.controllerId);
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (request.method === "PUT" && intent === "edit-name") {
    const name = String(formData.get("name"));
    await putController(controllerId, { name });
  }
  if (request.method === "PUT" && intent === "edit-secret") {
    const secret = createControllerSecret();
    await insertVerification({
      secret: encryptSecret(secret, process.env.ENCRYPTION_KEY!),
      target: controllerId.toString(),
      type: "controller",
    });
    return { ok: true, secret };
  }
  if (request.method === "DELETE") {
    await deleteController(controllerId);
    return redirect("/controller");
  }
  if (request.method === "PUT") {
    const isRelayOn = formData.get("checked") === "true";
    await putController(controllerId, { isRelayOn });
  }
  return { ok: true };
};

export default function ControllerPage({
  loaderData: {
    controller,
    controllerTemperatures,
    latestTemperature,
    totalErrorCount,
    totalCount,
  },
}: ComponentProps) {
  const revalidator = useRevalidateOnFocus();
  const submit = useSubmit();

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
      <Button onClick={revalidator.revalidate}>
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
      <label className="flex items-center gap-1">
        <Switch
          checked={controller.isRelayOn}
          onCheckedChange={(checked) => submit({ checked }, { method: "PUT" })}
        />
        Relay on
      </label>
      <TemperatureChart
        controllerTemperatures={controllerTemperatures}
        totalCount={totalCount}
      />
    </Main>
  );
}
