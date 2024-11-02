import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Ingredient } from "db/schema";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { filterIngredients } from "~/lib/utils";

import { ControllerForm } from "./ControllerForm";
import { IngredientForm } from "./IngredientForm";

type Props = {
  ingredients: Ingredient[];
  readOnly: boolean;
  controllers: {
    id: number;
    name: string;
  }[];
  controllerId: string | null;
  mode: string | null;
};
const type = "yeast";
const amountUnit = "stk";
export const Fermentation = ({
  ingredients,
  readOnly,
  controllers,
  controllerId,
  mode,
}: Props) => {
  const yeastIngredients = filterIngredients(ingredients, type);
  const chartData = [
    { days: 0, temp: 10 },
    { days: 5, temp: 10 },
    { days: 7, temp: 14 },
    { days: 9, temp: 18 },
    { days: 10, temp: 18 },
    { days: 11, temp: 2 },
    { days: 14, temp: 2 },
  ];
  //   https://blogg.bryggselv.no/beste-metoden-gjaering-lager/
  return (
    <>
      <AccordionTrigger>Gjæring</AccordionTrigger>
      <AccordionContent>
        <IngredientForm
          type={type}
          amountUnit={amountUnit}
          showLabel={true}
          readOnly={readOnly}
          ingredient={yeastIngredients[0]}
          namePlaceholder="Gjærtype"
        />
        <Tabs defaultValue="chart">
          <TabsList>
            <TabsTrigger value="chart">Graf</TabsTrigger>
            <TabsTrigger value="temps">Temperaturer</TabsTrigger>
            <TabsTrigger value="controller">Kontroller</TabsTrigger>
          </TabsList>
          <TabsContent value="chart">
            <ChartContainer config={{}}>
              <LineChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="days" tickLine={false} axisLine={false} />
                <Line dataKey="temp" strokeWidth={2} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
              </LineChart>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="temps">
            <h2 className="text-lg">Temperaturforløp under gjæringsprosess</h2>
          </TabsContent>
          <TabsContent value="controller">
            <ControllerForm
              controllerId={controllerId}
              controllers={controllers}
              mode={mode}
              readOnly={readOnly}
            />
          </TabsContent>
        </Tabs>
      </AccordionContent>
    </>
  );
};
