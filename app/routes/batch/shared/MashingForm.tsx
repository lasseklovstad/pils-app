import { Loader2, Save } from "lucide-react";
import { useFetcher } from "react-router";

import type { action } from "../BatchDetailsPage";

import { Batch, Ingredient } from "db/schema";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  calculateTotalAmount,
  calculateWaterTemperature,
  filterIngredients,
} from "~/lib/utils";

type Props = {
  ingredients: Ingredient[];
  batch: Batch;
  readOnly: boolean;
};

export const MashingForm = ({ batch, ingredients, readOnly }: Props) => {
  const fetcher = useFetcher<typeof action>();
  const maltIngredients = filterIngredients(ingredients, "malt");
  const totalAmount = calculateTotalAmount(maltIngredients);
  return (
    <>
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
                  readOnly={readOnly}
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
                  readOnly={readOnly}
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
                  readOnly={readOnly}
                />
              </div>
            </div>
            <Button
              name="intent"
              value="put-mashing"
              size="sm"
              disabled={readOnly}
            >
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
    </>
  );
};
