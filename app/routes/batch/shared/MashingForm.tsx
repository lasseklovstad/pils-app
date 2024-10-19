import { useFetcher } from "react-router";
import { Loader2, Save } from "lucide-react";

import type { ActionData } from "../+types.BatchDetailsPage";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Batch, Ingredient } from "db/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  calculateTotalAmount,
  calculateWaterTemperature,
  filterIngredients,
} from "~/lib/utils";

type Props = {
  ingredients: Ingredient[];
  batch: Batch;
};

export const MashingForm = ({ batch, ingredients }: Props) => {
  const fetcher = useFetcher<ActionData>();
  const maltIngredients = filterIngredients(ingredients, "malt");
  const totalAmount = calculateTotalAmount(maltIngredients);
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Mesking</AccordionTrigger>
        <AccordionContent>
          <div className="p-2">
            <div className="mb-2">
              {batch.mashingStrikeWaterVolume &&
              batch.mashingTemperature &&
              batch.mashingMaltTemperature ? (
                <>
                  Temperatur før tilsetting av malt:{" "}
                  {calculateWaterTemperature({
                    finalTemp: batch.mashingTemperature,
                    maltMass: totalAmount,
                    maltTemp: batch.mashingMaltTemperature,
                    waterMass: batch.mashingStrikeWaterVolume,
                  }).toFixed(2)}
                </>
              ) : (
                "Fyll ut verdiene for å se temperatur før mesking"
              )}
            </div>
            <fetcher.Form method="PUT" className="space-y-2">
              <div className="flex flex-wrap items-end gap-2">
                <div>
                  <Label htmlFor="mashing-strike-water-volume-input">
                    Antall liter vann
                  </Label>
                  <Input
                    id="mashing-strike-water-volume-input"
                    name="mashing-strike-water-volume"
                    type="number"
                    pattern="\d+"
                    autoComplete="off"
                    defaultValue={batch.mashingStrikeWaterVolume ?? ""}
                  />
                </div>
                <div>
                  <Label htmlFor="mashing-temperature-input">
                    Mesketemperatur °C
                  </Label>
                  <Input
                    id="mashing-temperature-input"
                    name="mashing-temperature"
                    type="number"
                    pattern="\d+"
                    autoComplete="off"
                    defaultValue={batch.mashingTemperature ?? ""}
                  />
                </div>
                <div>
                  <Label htmlFor="mashing-malt-temperature-input">
                    Malttemperatur °C
                  </Label>
                  <Input
                    id="mashing-malt-temperature-input"
                    name="mashing-malt-temperature"
                    type="number"
                    pattern="\d+"
                    autoComplete="off"
                    defaultValue={batch.mashingMaltTemperature ?? ""}
                  />
                </div>
              </div>
              <Button name="intent" value="put-mashing" size="sm">
                {fetcher.state !== "idle" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save />
                )}
                Lagre
              </Button>
            </fetcher.Form>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
