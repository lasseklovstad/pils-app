import { useSearchParams } from "@remix-run/react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

type Props = {
  controllerTemperatures: {
    timestamp: Date;
    avgTemp: number;
    maxTemp: number;
    minTemp: number;
  }[];
  totalCount: number;
};

const chartConfig = {
  temperature: {
    label: "Temperatur",
  },
} satisfies ChartConfig;

export const TemperatureChart = ({
  controllerTemperatures,
  totalCount,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const interval = searchParams.get("interval") ?? "timestamp";
  return (
    <>
      <h3 className="text-2xl">Målinger ({totalCount})</h3>
      {controllerTemperatures.length > 0 ? (
        <>
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
                      const date = item?.payload.timestamp;
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
            <ToggleGroupItem value="timestamp" aria-label="Toggle timestamp">
              Timestamp
            </ToggleGroupItem>
            <ToggleGroupItem value="minutes" aria-label="Toggle minutes">
              Minutes
            </ToggleGroupItem>
            <ToggleGroupItem value="hours" aria-label="Toggle hours">
              Hours
            </ToggleGroupItem>
          </ToggleGroup>
          <table>
            <thead>
              <tr>
                <th className="border p-2 text-left font-semibold">
                  Tidspunkt
                </th>
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
        </>
      ) : (
        <div>Ingen målinger registrert enda!</div>
      )}
    </>
  );
};
