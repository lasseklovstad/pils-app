import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Loader2, Save } from "lucide-react";
import { Form, useActionData } from "react-router";

import type { action } from "../BatchDetailsPage";

import { Batch, Ingredient } from "db/schema";
import { ErrorList, Field } from "~/components/Form";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { useIsPending } from "~/lib/useIsPending";
import {
  calculateTotalAmount,
  calculateWaterTemperature,
  filterIngredients,
} from "~/lib/utils";

import {
  putMashingNameIntent,
  PutMashingSchema,
} from "../actions/batch.schema";

type Props = {
  ingredients: Ingredient[];
  batch: Batch;
  readOnly: boolean;
};

export const MashingForm = ({ batch, ingredients, readOnly }: Props) => {
  const maltIngredients = filterIngredients(ingredients, "malt");
  const totalAmount = calculateTotalAmount(maltIngredients);

  const lastResult = useActionData<typeof action>();
  const isPending = useIsPending();
  const [form, fields] = useForm({
    lastResult: lastResult?.result,
    defaultValue: {
      mashingMaltTemperature: batch.mashingMaltTemperature,
      mashingStrikeWaterVolume: batch.mashingStrikeWaterVolume,
      mashingTemperature: batch.mashingTemperature,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: PutMashingSchema,
      });
    },
  });

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
          <Form method="PUT" className="space-y-2" {...getFormProps(form)}>
            <div className="flex flex-wrap items-end gap-2">
              <Field
                labelProps={{ children: "Antall liter vann" }}
                inputProps={{
                  readOnly,
                  ...getInputProps(fields.mashingStrikeWaterVolume, {
                    type: "number",
                  }),
                }}
                errors={fields.mashingStrikeWaterVolume.errors}
              />
              <Field
                labelProps={{ children: "Mesketemperatur °C" }}
                inputProps={{
                  readOnly,
                  ...getInputProps(fields.mashingTemperature, {
                    type: "number",
                  }),
                }}
                errors={fields.mashingTemperature.errors}
              />
              <Field
                labelProps={{ children: "Malttemperatur °C" }}
                inputProps={{
                  readOnly,
                  ...getInputProps(fields.mashingMaltTemperature, {
                    type: "number",
                  }),
                }}
                errors={fields.mashingMaltTemperature.errors}
              />
            </div>
            {totalAmount === 0 ? (
              <ErrorList errors={["Du har ikke lagt til malt!"]} />
            ) : null}

            <Button
              name="intent"
              value={putMashingNameIntent}
              size="sm"
              disabled={readOnly}
            >
              {isPending ? <Loader2 className="animate-spin" /> : <Save />}
              Lagre
            </Button>
          </Form>
        </div>
      </AccordionContent>
    </>
  );
};
