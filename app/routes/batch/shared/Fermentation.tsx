import {
  type Batch,
  type BatchTemperature,
  type ControllerTemperature,
  type Ingredient,
} from "db/schema";
import { BatchStatus } from "~/components/BatchStatus";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { filterIngredients } from "~/lib/utils";

import { BatchTemperaturesForm } from "./BatchTemperaturesForm";
import { ControllerForm } from "./ControllerForm";
import { IngredientForm } from "./IngredientForm";
import { FermentationChart } from "./fermentation-chart";

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

export const Fermentation = ({
  ingredients,
  readOnly,
  controllers,
  batchTemperatures,
  batch,
  controllerTemperatures,
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
            <FermentationChart
              batchTemperatures={batchTemperatures}
              controllerTemperatures={controllerTemperatures}
              fermentationStartDate={batch.fermentationStartDate}
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
