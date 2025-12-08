import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useSearchParams } from "react-router";

import type { Route } from "./+types/batch-fermentation-page";

import { getBatch } from "~/.server/data-layer/batches";
import { Main } from "~/components/Main";
import { getControllerTemperaturesFromBatchIdByDay } from "~/.server/data-layer/controllerTemperatures";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { Field } from "~/components/Form";

import { BatchPreviewImage } from "./shared/BatchPreviewImage";

export const loader = async ({
  request,
  params: { batchId: batchIdParam },
}: Route.LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams;
  const day = parseInt(searchParams.get("day") ?? "0");
  const window = parseInt(searchParams.get("window") ?? "5");
  const batchId = parseInt(batchIdParam);
  const [batch, controllerTemperatures] = await Promise.all([
    getBatch(batchId),
    getControllerTemperaturesFromBatchIdByDay(batchId, day, 0),
  ]);
  if (!batch) {
    throw new Response("Fant ikke brygg med id " + batchId, { status: 404 });
  }
  const data = smoothWithRobustHybridFilter(controllerTemperatures, window)
  const { cyclePeriodMinutes, extrema } =
    calculateAverageTemperatureCyclePeriodMinutes(data);

  // Add extrema markers to the data
  const dataWithMarkers = data.map(d => {
    const extremum = extrema.find(e => e.timestamp.getTime() === d.timestamp.getTime());
    return {
      ...d,
      maxPoint: extremum?.type === "max" ? extremum.value : null,
      minPoint: extremum?.type === "min" ? extremum.value : null,
    };
  });

  return { batch, controllerTemperatures: dataWithMarkers, cyclePeriodMinutes };
};

const chartConfig = {
  temp: {
    label: "Temp",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function BatchFermentationPage({
  loaderData: { batch, controllerTemperatures, cyclePeriodMinutes },
}: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const day = searchParams.get("day") ?? "0";
  const window = searchParams.get("window") ?? "1";

  return (
    <Main>
      <div className="flex items-center gap-2">
        <BatchPreviewImage
          publicUrl={batch.previewFilePublicUrl}
          className="w-16"
        />
        <div>
          <h1 className="text-4xl">{batch.name}</h1>
          <div className="mb-4 text-sm">
            Opprettet:{" "}
            {batch.createdTimestamp.toLocaleDateString("nb", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </div>

        </div>
      </div>
      <div className="flex gap-2">
        <Field
          labelProps={{ children: "Dag" }}
          inputProps={{
            type: "number",
            step: 1,
            min: 0,
            max: 16,
            value: day,
            onChange: (e) =>
              setSearchParams({
                window,
                day: e.target.value,
              }),
          }}
        />
        <Field
          labelProps={{ children: "Smoothing window" }}
          inputProps={{
            type: "number",
            step: 1,
            min: 0,
            max: 100,
            value: window,
            onChange: (e) =>
              setSearchParams({
                day,
                window: e.target.value,
              }),
          }}
        />
      </div>
      {cyclePeriodMinutes != null && (
        <div className="mt-2 text-sm text-muted-foreground">
          Gjennomsnittlig temperatur-syklus:{" "}
          {cyclePeriodMinutes.toFixed(1)} min
        </div>
      )}
      <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
        <LineChart
          accessibilityLayer
          data={controllerTemperatures}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <YAxis
            dataKey="temp"
            domain={["dataMin", "dataMax+0.05"]}
            width={0}
          />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value: Date) => value.toLocaleTimeString(undefined, { timeStyle: "short" })}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent
              hideLabel={false}
              labelFormatter={(label: string, payload) => {
                const timestamp = payload[0]?.payload?.timestamp
                return timestamp?.toLocaleString(undefined, {
                  dateStyle: "short",
                  timeStyle: "medium"
                }) ?? label;
              }}
            />}
          />
          <Line
            dataKey="temp"
            type="natural"
            stroke="var(--color-temp)"
            strokeWidth={0.5}
            dot={false}
          />
          <Line
            dataKey="avgTemp"
            type="natural"
            stroke="hsl(var(--chart-2))"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="fitTemp"
            type="natural"
            stroke="blue"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="maxPoint"
            stroke="red"
            strokeWidth={0}
            dot={{ fill: "red", r: 6 }}
          />
          <Line
            dataKey="minPoint"
            stroke="green"
            strokeWidth={0}
            dot={{ fill: "green", r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </Main>
  );
}

/**
 * Estimate average temperature cycle period (in minutes) using smoothed data.
 * It finds local maxima/minima in avgTemp and averages the time between them.
 */
function calculateAverageTemperatureCyclePeriodMinutes(
  data: { avgTemp: number; temp: number; timestamp: Date }[],
): { cyclePeriodMinutes: number | null; extrema: Array<{ timestamp: Date; type: "max" | "min"; value: number }> } {
  if (data.length < 3) return { cyclePeriodMinutes: null, extrema: [] };

  type Extremum = { timestamp: Date; type: "max" | "min"; value: number };
  const extrema: Extremum[] = [];

  // Calculate temperature range for tolerance, removing outliers first
  const temps = data.map(d => d.avgTemp);
  const sortedTemps = [...temps].sort((a, b) => a - b);
  const tempQ1 = sortedTemps[Math.floor(sortedTemps.length * 0.25)]!;
  const tempQ3 = sortedTemps[Math.floor(sortedTemps.length * 0.75)]!;
  const tempIqr = tempQ3 - tempQ1;
  const tempLowerBound = tempQ1 - 1.5 * tempIqr;
  const tempUpperBound = tempQ3 + 1.5 * tempIqr;

  const filteredTemps = temps.filter(t => t >= tempLowerBound && t <= tempUpperBound);
  const minTemp = Math.min(...filteredTemps);
  const maxTemp = Math.max(...filteredTemps);
  const tolerance = (maxTemp - minTemp) * 0.15; // 5% of range

  // Find local extrema using tolerance-based approach
  let i = 0;
  while (i < data.length) {
    // Look for a local maximum region
    let peakStart = i;
    let peakValue = data[i]!.avgTemp;
    let peakIndex = i;
    let peakEnd = i;

    // Find all points in this peak region (within tolerance of max)
    while (peakEnd < data.length && data[peakEnd]!.avgTemp >= peakValue - tolerance) {
      if (data[peakEnd]!.avgTemp > peakValue) {
        peakValue = data[peakEnd]!.avgTemp;
        peakIndex = peakEnd;
      }
      peakEnd++;
    }

    // Check if this is a true local maximum (not just noise)
    const beforePeak = peakStart > 0 ? data[peakStart - 1]!.avgTemp : -Infinity;
    const afterPeak = peakEnd < data.length ? data[peakEnd]!.avgTemp : -Infinity;

    if (peakValue > beforePeak + tolerance && peakValue > afterPeak + tolerance) {
      // Find indices of all points at peak value
      const peakIndices = [];
      for (let j = peakStart; j < peakEnd; j++) {
        if (data[j]!.avgTemp === peakValue) {
          peakIndices.push(j);
        }
      }
      // Use the middle index of points at peak value
      const midIndex = peakIndices[Math.floor(peakIndices.length / 2)]!;
      extrema.push({
        timestamp: data[midIndex]!.timestamp,
        type: "max",
        value: peakValue
      });
      i = peakEnd;
    } else {
      i++;
    }
  }

  // Now find local minima
  const minima: Extremum[] = [];
  i = 0;
  while (i < data.length) {
    let valleyStart = i;
    let valleyValue = data[i]!.avgTemp;
    let valleyIndex = i;
    let valleyEnd = i;

    while (valleyEnd < data.length && data[valleyEnd]!.avgTemp <= valleyValue + tolerance) {
      if (data[valleyEnd]!.avgTemp < valleyValue) {
        valleyValue = data[valleyEnd]!.avgTemp;
        valleyIndex = valleyEnd;
      }
      valleyEnd++;
    }

    const beforeValley = valleyStart > 0 ? data[valleyStart - 1]!.avgTemp : Infinity;
    const afterValley = valleyEnd < data.length ? data[valleyEnd]!.avgTemp : Infinity;

    if (valleyValue < beforeValley - tolerance && valleyValue < afterValley - tolerance) {
      // Find indices of all points at valley value
      const valleyIndices = [];
      for (let j = valleyStart; j < valleyEnd; j++) {
        if (data[j]!.avgTemp === valleyValue) {
          valleyIndices.push(j);
        }
      }
      // Use the middle index of points at valley value
      const midIndex = valleyIndices[Math.floor(valleyIndices.length / 2)]!;
      minima.push({
        timestamp: data[midIndex]!.timestamp,
        type: "min",
        value: valleyValue
      });
      i = valleyEnd;
    } else {
      i++;
    }
  }

  extrema.push(...minima);
  extrema.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  if (extrema.length < 2) return { cyclePeriodMinutes: null, extrema };

  // Use max→max and min→min periods to be robust
  const maxTimes = extrema
    .filter(e => e.type === "max")
    .map(e => e.timestamp.getTime());
  const minTimes = extrema
    .filter(e => e.type === "min")
    .map(e => e.timestamp.getTime());

  const diffsMs: number[] = [];

  for (let i = 1; i < maxTimes.length; i++) {
    diffsMs.push(maxTimes[i]! - maxTimes[i - 1]!);
  }
  for (let i = 1; i < minTimes.length; i++) {
    diffsMs.push(minTimes[i]! - minTimes[i - 1]!);
  }

  if (diffsMs.length === 0) return { cyclePeriodMinutes: null, extrema };

  // Remove outliers using IQR method
  const sortedDiffs = [...diffsMs].sort((a, b) => a - b);
  const q1 = sortedDiffs[Math.floor(sortedDiffs.length * 0.25)]!;
  const q3 = sortedDiffs[Math.floor(sortedDiffs.length * 0.75)]!;
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const filteredDiffs = diffsMs.filter(d => d >= lowerBound && d <= upperBound);

  if (filteredDiffs.length === 0) return { cyclePeriodMinutes: null, extrema };

  const avgMs = filteredDiffs.reduce((s, d) => s + d, 0) / filteredDiffs.length;
  const avgMinutes = avgMs / 1000 / 60;
  return { cyclePeriodMinutes: avgMinutes, extrema };
}

function smoothWithMedianFilter(
  temperatures: { temperature: number; timestamp: Date }[],
  windowSize: number,
) {
  if (windowSize === 0) {
    return temperatures.map(t => ({
      avgTemp: t.temperature,
      temp: t.temperature,
      timestamp: t.timestamp,
    }));
  }

  return temperatures.map((temperature, i) => {
    const halfWindow = Math.floor(windowSize / 2);
    const start = Math.max(0, i - halfWindow);
    const end = Math.min(temperatures.length, i + halfWindow + 1);

    const window = temperatures
      .slice(start, end)
      .map(d => d.temperature)
      .sort((a, b) => a - b);

    const median = window[Math.floor(window.length / 2)]!;

    return {
      avgTemp: parseFloat(median.toFixed(2)),
      temp: temperature.temperature,
      timestamp: temperature.timestamp,
    };
  });
}

function smoothWithLowPassFilter(
  temperatures: { temperature: number; timestamp: Date }[],
  alpha: number, // 0-1, derived from window size
) {
  if (temperatures.length === 0) return [];

  const result = [];
  let smoothed = temperatures[0]!.temperature;

  for (let i = 0; i < temperatures.length; i++) {
    smoothed = alpha * temperatures[i]!.temperature + (1 - alpha) * smoothed;
    result.push({
      avgTemp: parseFloat(smoothed.toFixed(2)),
      temp: temperatures[i]!.temperature,
      timestamp: temperatures[i]!.timestamp,
    });
  }

  return result;
}

function smoothWithRobustHybridFilter(
  temperatures: { temperature: number; timestamp: Date }[],
  windowSize: number,
) {
  if (windowSize === 0) {
    return temperatures.map(t => ({
      avgTemp: t.temperature,
      temp: t.temperature,
      timestamp: t.timestamp,
    }));
  }

  // 1) Small median filter to remove spikes
  const medianPreFiltered = smoothWithMedianFilter(temperatures, windowSize);

  // 2) Then exponential smoothing based on window size
  const alpha = Math.min(1, 2 / (windowSize + 1));
  const smoothed = smoothWithLowPassFilter(
    medianPreFiltered.map(t => ({
      temperature: t.avgTemp,
      timestamp: t.timestamp,
    })),
    alpha,
  );

  // 3) Combine raw data with smoothed data
  return temperatures.map((t, i) => ({
    temp: t.temperature,
    avgTemp: smoothed[i]!.avgTemp,
    timestamp: t.timestamp,
  }));
}
