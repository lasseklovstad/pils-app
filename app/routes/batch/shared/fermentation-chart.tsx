import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";

import { type BatchTemperature, type ControllerTemperature } from "db/schema";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { DualRangeSlider } from "~/components/ui/dual-slider";

type Props = {
  batchTemperatures: BatchTemperature[];
  controllerTemperatures: ControllerTemperature[];
  fermentationStartDate: Date | null;
};

const chartConfig = {
  temperature: {
    label: "Mål-Temperatur °C",
    color: "hsl(var(--chart-1))",
  },
  controllerTemperature: {
    label: "Fakitsk Temperatur °C",
    color: "hsl(var(--chart-2))",
  },
  referenceLine: {
    label: "Nå",
    color: "hsl(var(--primary))",
  },
  dayIndex: {
    label: "Dag",
  },
} satisfies ChartConfig;

const dayInMillis = 1000 * 60 * 60 * 24;

export const FermentationChart = ({
  fermentationStartDate,
  batchTemperatures,
  controllerTemperatures,
}: Props) => {
  const dayTicks = batchTemperatures.map((bt) => bt.dayIndex);

  const startDate = fermentationStartDate ?? Date.now();
  const controllerDayTicks = controllerTemperatures.map((ct) => {
    return (ct.timestamp.valueOf() - startDate.valueOf()) / dayInMillis;
  });
  const maxDays = Math.ceil(
    Math.max(Math.max(...dayTicks), ...controllerDayTicks),
  );
  const minDays = Math.floor(
    Math.min(Math.min(...dayTicks), ...controllerDayTicks),
  );
  const [values, setValues] = useState([minDays, maxDays]);

  const referenceLineNowInDays = fermentationStartDate
    ? (Date.now() - fermentationStartDate.valueOf()) / dayInMillis
    : undefined;
  const filteredControllerTemperatures = controllerTemperatures
    .map((ct) => {
      return {
        controllerTemperature: ct.temperature,
        dayIndex: (ct.timestamp.valueOf() - startDate.valueOf()) / dayInMillis,
      };
    })
    .filter((ct) => {
      return ct.dayIndex >= values[0]! && ct.dayIndex <= values[1]!;
    });
  const batchTemperaturesInControllerTemperature =
    filteredControllerTemperatures
      .map((fct) => {
        const batchTemperature = batchTemperatures.find((bt, index) => {
          const next = batchTemperatures[index + 1];
          if (next) {
            return bt.dayIndex <= fct.dayIndex && next.dayIndex > fct.dayIndex;
          }
          return bt.dayIndex >= fct.dayIndex;
        });
        if (!batchTemperature) return undefined;
        return { ...batchTemperature, dayIndex: fct.dayIndex };
      })
      .filter((bt) => bt !== undefined);

  const transformedBatchTemperatures = [
    ...batchTemperaturesInControllerTemperature,
    ...batchTemperatures,
  ].sort((a, b) => {
    if (a.dayIndex === b.dayIndex) return 0;
    return a.dayIndex < b.dayIndex ? -1 : 1;
  });

  const maxTemp = Math.max(
    ...[
      ...transformedBatchTemperatures.map((bt) => bt.temperature),
      ...filteredControllerTemperatures.map((ct) => ct.controllerTemperature),
    ],
  );
  const minTemp = Math.min(
    ...[
      ...transformedBatchTemperatures.map((bt) => bt.temperature),
      ...filteredControllerTemperatures.map((ct) => ct.controllerTemperature),
    ],
  );
  return (
    <>
      <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
        <AreaChart accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis
            type="number"
            dataKey="dayIndex"
            tickCount={Math.max(...dayTicks) + 1}
            tickFormatter={(tick: number) => tick.toFixed(0)}
            domain={[values[0] || "dataMin", values[1] || "dataMax"]}
            allowDataOverflow
          >
            <Label value="Dag" offset={0} position="insideBottom" />
          </XAxis>
          <YAxis
            dataKey="controllerTemperature"
            domain={[minTemp - 0.5, maxTemp + 0.5]}
            width={0}
          />
          <defs>
            <linearGradient
              id="fillControllerTemperature"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="var(--color-controllerTemperature)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-controllerTemperature)"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="fillTemperature" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-temperature)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-temperature)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <Area
            dataKey="temperature"
            stroke="var(--color-temperature)"
            strokeWidth={2}
            fill="url(#fillTemperature)"
            data={transformedBatchTemperatures}
            stackId="a"
            type={"stepAfter"}
          />
          <Area
            dataKey="controllerTemperature"
            stroke="var(--color-controllerTemperature)"
            fill="url(#fillControllerTemperature)"
            strokeWidth={2}
            data={filteredControllerTemperatures}
            stackId="b"
          />
          {referenceLineNowInDays &&
          referenceLineNowInDays <= Math.max(...dayTicks) ? (
            <ReferenceLine
              x={referenceLineNowInDays}
              stroke="var(--color-referenceLine)"
              label="Nå"
            />
          ) : null}
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payloads) => {
                  const firstPayload = payloads[0]?.payload as
                    | (typeof filteredControllerTemperatures)[number]
                    | undefined;
                  const dayIndex = firstPayload?.dayIndex;
                  if (dayIndex === undefined) return "";
                  const date = new Date(
                    dayInMillis * dayIndex + startDate.valueOf(),
                  );
                  return `${date.toLocaleDateString("nb")} ${date.toLocaleTimeString("nb")}`;
                }}
              />
            }
          />
        </AreaChart>
      </ChartContainer>
      <DualRangeSlider
        label={(value) => value}
        labelPosition="bottom"
        value={values}
        onValueChange={setValues}
        min={minDays}
        max={maxDays}
        step={0.01}
        className="mb-4"
      />
    </>
  );
};
