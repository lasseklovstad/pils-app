import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { getController } from "~/.server/data-layer/controllers";
import { getControllerTemperatures } from "~/.server/data-layer/controllerTemperatures";
import { Main } from "~/components/Main";
import { Button } from "~/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const controllerId = parseInt(params.controllerId!);
  const controller = await getController(controllerId);
  const controllerTemperatures = await getControllerTemperatures(controllerId);
  if (!controller) {
    throw new Response(`Fant ingen kontroller med id ${params.controllerId}`, {
      status: 404,
    });
  }
  return { controller, controllerTemperatures };
};

const chartConfig = {
  temperature: {
    label: "Temperatur",
  },
} satisfies ChartConfig;

export default function ControllerPage() {
  const { controller, controllerTemperatures } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  return (
    <Main className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl">{controller.name}</h2>
        <Button onClick={revalidator.revalidate}>Refresh</Button>
      </div>
      <div>Identifikator: {controller.id}</div>
      <h3 className="text-2xl">
        Målinger ({controllerTemperatures[0]?.totalCount ?? 0})
      </h3>
      <ChartContainer config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={controllerTemperatures
            .map((data) => ({
              timestamp: data.timestamp,
              temperature: data.temperature,
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
          <YAxis axisLine={false} tickLine={false} />
          <Line
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
        </LineChart>
      </ChartContainer>
      <table>
        <thead>
          <tr>
            <th className="border p-2 text-left font-semibold">Tidspunkt</th>
            <th className="border p-2 text-left font-semibold">Temperatur</th>
          </tr>
        </thead>
        <tbody>
          {controllerTemperatures.map((temperature) => {
            return (
              <tr key={temperature.id}>
                <td className="border p-2">
                  {temperature.timestamp.toLocaleDateString("nb")}{" "}
                  {temperature.timestamp.toLocaleTimeString("nb")}
                </td>
                <td className="border p-2">{temperature.temperature}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Main>
  );
}
