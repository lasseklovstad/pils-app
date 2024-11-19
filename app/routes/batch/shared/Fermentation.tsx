import {
  Area,
  CartesianGrid,
  AreaChart,
  ReferenceLine,
  XAxis,
  Label,
} from "recharts";
import { useState } from "react";

import {
  type Ingredient,
  type BatchTemperature,
  type Batch,
  type ControllerTemperature,
} from "db/schema";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { filterIngredients } from "~/lib/utils";
import { BatchStatus } from "~/components/BatchStatus";
import { Toggle } from "~/components/ui/toggle";

import { ControllerForm } from "./ControllerForm";
import { IngredientForm } from "./IngredientForm";
import { BatchTemperaturesForm } from "./BatchTemperaturesForm";
import { DualRangeSlider } from "~/components/ui/dual-slider";

type Props = {
  ingredients: Ingredient[];
  readOnly: boolean;
  controllers: {
    id: number;
    name: string;
  }[];
  batchTemperatures: BatchTemperature[];
  controllerTemperatures: (ControllerTemperature & { count: number })[];
  batch: Batch;
};

const type = "yeast";
const amountUnit = "stk";
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

export const Fermentation = ({
  ingredients,
  readOnly,
  controllers,
  batchTemperatures,
  batch,
  controllerTemperatures,
}: Props) => {
  const dayTicks = batchTemperatures.map((bt) => bt.dayIndex);
  const controllerDayTicks = controllerTemperatures.map((ct) => {
    if (batch.fermentationStartDate) {
      return (
        (ct.timestamp.valueOf() - batch.fermentationStartDate?.valueOf()) /
        dayInMillis
      );
    }
    return 0;
  });
  const maxDays = Math.ceil(
    Math.max(Math.max(...dayTicks), ...controllerDayTicks),
  );
  const [values, setValues] = useState([0, maxDays]);
  const yeastIngredients = filterIngredients(ingredients, type);

  const referenceLineNowInDays = batch.fermentationStartDate
    ? (Date.now() - batch.fermentationStartDate.valueOf()) / dayInMillis
    : undefined;
  const startDate = batch.fermentationStartDate ?? Date.now();
  return (
    <>
      <AccordionTrigger>
        <span className="flex items-center gap-2">
          Gjæring
          <BatchStatus status={batch.controllerStatus} />
        </span>
      </AccordionTrigger>
      <AccordionContent>
        <IngredientForm
          type={type}
          amountUnit={amountUnit}
          showLabel={true}
          readOnly={readOnly}
          ingredient={yeastIngredients[0]}
          namePlaceholder="Gjærtype"
        />
        <div className="p-2">
          {batch.fermentationStartDate ? (
            <p className="my-2 text-muted-foreground">
              Startet å gjære{" "}
              {batch.fermentationStartDate.toLocaleDateString("nb", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}{" "}
              {batch.fermentationStartDate.toLocaleTimeString("nb")}
            </p>
          ) : null}
          {referenceLineNowInDays ? (
            <p className="my-2 text-muted-foreground">
              Dager gjæret: {referenceLineNowInDays.toFixed(2)}
            </p>
          ) : null}
          <p className="my-2 text-muted-foreground">
            Antall målinger: {controllerTemperatures[0]?.count}
          </p>
        </div>

        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart">Graf</TabsTrigger>
            <TabsTrigger value="temps">Temperaturer</TabsTrigger>
            <TabsTrigger value="controller">Kontroller</TabsTrigger>
          </TabsList>
          <TabsContent value="chart">
            <ChartContainer
              config={chartConfig}
              className="min-h-[400px] w-full"
            >
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
                  <linearGradient
                    id="fillTemperature"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
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
                  type="stepAfter"
                  data={batchTemperatures}
                  stackId="a"
                />
                <Area
                  dataKey="controllerTemperature"
                  stroke="var(--color-controllerTemperature)"
                  fill="url(#fillControllerTemperature)"
                  strokeWidth={2}
                  dot={false}
                  data={controllerTemperatures.map((ct) => {
                    return {
                      controllerTemperature: ct.temperature,
                      dayIndex:
                        (ct.timestamp.valueOf() - startDate.valueOf()) /
                        dayInMillis,
                    };
                  })}
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
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </AreaChart>
            </ChartContainer>
            <DualRangeSlider
              label={(value) => value}
              labelPosition="bottom"
              value={values}
              onValueChange={setValues}
              min={0}
              max={maxDays}
              step={0.1}
              className="mb-4"
            />
          </TabsContent>
          <TabsContent value="temps">
            <h2 className="text-lg">Temperaturforløp under gjæringsprosess</h2>
            <BatchTemperaturesForm batchTemperatures={batchTemperatures} />
          </TabsContent>
          <TabsContent value="controller">
            <ControllerForm
              batch={batch}
              controllers={controllers}
              readOnly={readOnly}
            />
          </TabsContent>
        </Tabs>
      </AccordionContent>
    </>
  );
};
