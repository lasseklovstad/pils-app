import { Link, useSearchParams } from "react-router";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import type { Batch } from "db/schema";

import { BatchStatus } from "~/components/BatchStatus";
import { Button } from "~/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

type Props = {
  controllerTemperatures: {
    timestamp: Date;
    avgTemp: number;
    maxTemp: number;
    minTemp: number;
  }[];
  totalCount: number;
  batches: Batch[];
};

const chartConfig = {
  temperature: {
    label: "Temperatur",
  },
} satisfies ChartConfig;

export const TemperatureChart = ({
  controllerTemperatures,
  totalCount,
  batches,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const interval = searchParams.get("interval") ?? "timestamp";
  return (
    <div className="w-full">
      <h3 className="text-2xl">Målinger ({totalCount})</h3>
      <Tabs defaultValue="chart">
        <TabsList>
          <TabsTrigger value="chart">Graf</TabsTrigger>
          <TabsTrigger value="temps">Temperaturer</TabsTrigger>
          <TabsTrigger value="batches">Batcher</TabsTrigger>
        </TabsList>
        <TabsContent value="chart">
          {controllerTemperatures.length === 0 ? (
            <div>Ingen målinger enda!</div>
          ) : (
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
                  <YAxis
                    dataKey="temperature"
                    domain={[
                      0,
                      Math.max(
                        ...controllerTemperatures.map((t) => t.avgTemp),
                      ) + 10,
                    ]}
                    width={0}
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
                  setSearchParams(
                    { interval: value },
                    { preventScrollReset: true },
                  )
                }
                className="my-4"
              >
                <ToggleGroupItem
                  value="timestamp"
                  aria-label="Toggle timestamp"
                >
                  Timestamp
                </ToggleGroupItem>
                <ToggleGroupItem value="minutes" aria-label="Toggle minutes">
                  Minutes
                </ToggleGroupItem>
                <ToggleGroupItem value="hours" aria-label="Toggle hours">
                  Hours
                </ToggleGroupItem>
              </ToggleGroup>
            </>
          )}
        </TabsContent>
        <TabsContent value="temps">
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full">
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
          </div>
        </TabsContent>
        <TabsContent value="batches">
          {batches.length > 0 ? (
            <ul className="flex flex-col divide-y">
              {batches.map((batch) => (
                <li key={batch.id} className="p-2">
                  <Button
                    variant="link"
                    asChild
                    className="flex w-full justify-start"
                  >
                    <Link to={`/batch/${batch.id}`}>
                      <BatchStatus status={batch.controllerStatus} />
                      <span className="text-lg">{batch.name}</span>
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            "Ingen batcher koblet til denne kontrolleren"
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
