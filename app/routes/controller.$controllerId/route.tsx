import { LoaderFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "@remix-run/react";
import { sub } from "date-fns";
import { Check, RefreshCw, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { getController } from "~/.server/data-layer/controllers";
import {
  getControllerTemperatures,
  getControllerTemperaturesErrorTotalCount,
  getControllerTemperaturesTotalCount,
  getLatestControllerTemperature,
} from "~/.server/data-layer/controllerTemperatures";
import { Main } from "~/components/Main";
import { Button } from "~/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { cn } from "~/lib/utils";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const interval = new URL(request.url).searchParams.get("interval") ?? "1h";
  const now = new Date();
  const fromDate =
    interval === "max"
      ? new Date(0)
      : sub(now, {
          hours: interval === "1h" ? 1 : interval === "6h" ? 6 : 0,
          days: interval === "1d" ? 1 : interval === "7d" ? 7 : 0,
        });
  const controllerId = parseInt(params.controllerId!);
  const [
    controller,
    controllerTemperatures,
    latestTemperature,
    { totalCount },
    { totalCount: totalErrorCount },
  ] = await Promise.all([
    getController(controllerId),
    getControllerTemperatures(
      controllerId,
      fromDate,
      interval === "max" || interval === "7d"
        ? "hours"
        : interval === "6h" || interval === "1d"
          ? "minutes"
          : "timestamp",
    ),
    getLatestControllerTemperature(controllerId),
    getControllerTemperaturesTotalCount(controllerId),
    getControllerTemperaturesErrorTotalCount(controllerId, fromDate),
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

const chartConfig = {
  temperature: {
    label: "Temperatur",
  },
} satisfies ChartConfig;

export default function ControllerPage() {
  const {
    controller,
    controllerTemperatures,
    latestTemperature,
    totalErrorCount,
    totalCount,
  } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [searchParams, setSearchParams] = useSearchParams();
  const interval = searchParams.get("interval") ?? "1h";
  const isActive = latestTemperature
    ? latestTemperature.timestamp.valueOf() >=
      sub(new Date(), { minutes: 15 }).valueOf()
    : false;
  return (
    <Main className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-4xl">
          {controller.name}{" "}
          {isActive ? (
            <Check className="size-8 text-green-500" />
          ) : (
            <X className="size-8 text-red-500" />
          )}
        </h2>
        <Button onClick={revalidator.revalidate}>
          <RefreshCw
            className={cn(revalidator.state !== "idle" && "animate-spin")}
          />
          Refresh
        </Button>
      </div>
      <div>Identifikator: {controller.id}</div>
      <div>
        Siste målingstidspunkt:{" "}
        {latestTemperature.timestamp.toLocaleDateString("nb")}{" "}
        {latestTemperature.timestamp.toLocaleTimeString("nb", {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
      </div>
      <div>Siste måling temperatur: {latestTemperature.temperature}°C</div>
      <div>Antall feilmålinger: {totalErrorCount}</div>
      <h3 className="text-2xl">Målinger ({totalCount})</h3>
      <ChartContainer config={chartConfig}>
        <AreaChart
          accessibilityLayer
          data={controllerTemperatures
            .map((data) => ({
              timestamp: data.timestamp,
              temperature: data.avgTemp,
            }))
            .reverse()}
        >
          <CartesianGrid />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(date) => {
              return `${date.toLocaleDateString("nb", {
                month: "short",
                day: "numeric",
              })} ${date.toLocaleTimeString("nb", { hour: "2-digit", minute: "2-digit" })}`;
            }}
          />
          <Area
            dataKey="temperature"
            type="natural"
            stroke="black"
            strokeWidth={2}
            dot={false}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(label, [item]) => {
                  const date = item.payload.timestamp;
                  return `${label} ${date.toLocaleDateString("nb", {
                    month: "short",
                    day: "numeric",
                  })} ${date.toLocaleTimeString("nb")}`;
                }}
              />
            }
          />
        </AreaChart>
      </ChartContainer>
      <ToggleGroup
        type="single"
        value={interval}
        onValueChange={(value) =>
          value &&
          setSearchParams({ interval: value }, { preventScrollReset: true })
        }
      >
        <ToggleGroupItem value="1h" aria-label="Toggle 1h">
          1h
        </ToggleGroupItem>
        <ToggleGroupItem value="6h" aria-label="Toggle 6h">
          6h
        </ToggleGroupItem>
        <ToggleGroupItem value="1d" aria-label="Toggle 1 døgn">
          1d
        </ToggleGroupItem>
        <ToggleGroupItem value="7d" aria-label="Toggle 7 døgn">
          7d
        </ToggleGroupItem>
        <ToggleGroupItem value="max" aria-label="Toggle maks">
          Maks
        </ToggleGroupItem>
      </ToggleGroup>
      <table>
        <thead>
          <tr>
            <th className="border p-2 text-left font-semibold">Tidspunkt</th>
            <th className="border p-2 text-left font-semibold">
              Avg. temperatur
            </th>
            <th className="border p-2 text-left font-semibold">
              Min. temperatur
            </th>
            <th className="border p-2 text-left font-semibold">
              Max. temperatur
            </th>
          </tr>
        </thead>
        <tbody>
          {controllerTemperatures.map((temperature) => {
            return (
              <tr key={temperature.timestamp.valueOf()}>
                <td className="border p-2">
                  {temperature.timestamp.toLocaleDateString("nb")}{" "}
                  {temperature.timestamp.toLocaleTimeString("nb")}
                </td>
                <td className="border p-2">{temperature.avgTemp}</td>
                <td className="border p-2">{temperature.minTemp}</td>
                <td className="border p-2">{temperature.maxTemp}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Main>
  );
}
