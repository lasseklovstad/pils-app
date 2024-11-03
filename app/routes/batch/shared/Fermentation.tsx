import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis } from "recharts";

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

import { ControllerForm } from "./ControllerForm";
import { IngredientForm } from "./IngredientForm";
import { BatchTemperaturesForm } from "./BatchTemperaturesForm";

type Props = {
  ingredients: Ingredient[];
  readOnly: boolean;
  controllers: {
    id: number;
    name: string;
  }[];
  batchTemperatures: BatchTemperature[];
  controllerTemperatures: ControllerTemperature[];
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
    color: "hsl(var(--chart-3))",
  },
  dayIndex: {
    label: "Dag",
  },
} satisfies ChartConfig;

export const Fermentation = ({
  ingredients,
  readOnly,
  controllers,
  batchTemperatures,
  batch,
  controllerTemperatures,
}: Props) => {
  const yeastIngredients = filterIngredients(ingredients, type);
  const dayInMillis = 1000 * 60 * 60 * 24;
  const referenceLineNowInDays = batch.fermentationStartDate
    ? (Date.now() - batch.fermentationStartDate.valueOf()) / dayInMillis
    : undefined;
  const dayTicks = batchTemperatures.map((bt) => bt.dayIndex);
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
          Antall målinger: {controllerTemperatures.length}
        </p>

        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart">Graf</TabsTrigger>
            <TabsTrigger value="temps">Temperaturer</TabsTrigger>
            <TabsTrigger value="controller">Kontroller</TabsTrigger>
          </TabsList>
          <TabsContent value="chart">
            <ChartContainer config={chartConfig}>
              <LineChart accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  label="Dag"
                  type="number"
                  dataKey="dayIndex"
                  tickLine={false}
                  ticks={dayTicks}
                  domain={[0, "dataMax"]}
                />
                <Line
                  dataKey="temperature"
                  stroke="var(--color-temperature)"
                  strokeWidth={2}
                  type="stepAfter"
                  data={batchTemperatures}
                />
                <Line
                  dataKey="controllerTemperature"
                  stroke="var(--color-controllerTemperature)"
                  strokeWidth={2}
                  dot={false}
                  type="natural"
                  data={controllerTemperatures.map((ct) => {
                    return {
                      controllerTemperature: ct.temperature,
                      dayIndex:
                        (ct.timestamp.valueOf() - startDate.valueOf()) /
                        dayInMillis,
                    };
                  })}
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
              </LineChart>
            </ChartContainer>
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
