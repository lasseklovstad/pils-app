import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { type Ingredient, type BatchTemperature, type Batch } from "db/schema";
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
  batch: Batch;
};

const type = "yeast";
const amountUnit = "stk";
const chartConfig = {
  temperature: {
    label: "Temperatur °C",
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
}: Props) => {
  const yeastIngredients = filterIngredients(ingredients, type);

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
        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart">Graf</TabsTrigger>
            <TabsTrigger value="temps">Temperaturer</TabsTrigger>
            <TabsTrigger value="controller">Kontroller</TabsTrigger>
          </TabsList>
          <TabsContent value="chart">
            <ChartContainer config={chartConfig}>
              <LineChart accessibilityLayer data={batchTemperatures}>
                <CartesianGrid vertical={false} />
                <XAxis
                  label="Dag"
                  type="number"
                  dataKey="dayIndex"
                  tickLine={false}
                  ticks={batchTemperatures.map((bt) => bt.dayIndex)}
                  domain={[0, "dataMax"]}
                />
                <Line dataKey="temperature" strokeWidth={2} type="stepAfter" />
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
