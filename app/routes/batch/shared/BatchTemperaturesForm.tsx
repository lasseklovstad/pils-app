import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ArrowUp, Loader2, Plus, Save, Trash } from "lucide-react";
import React from "react";
import { Form } from "react-router";

import type { BatchTemperature } from "db/schema";

import { ErrorList, Field } from "~/components/Form";
import { Button } from "~/components/ui/button";
import { useIsPending } from "~/lib/useIsPending";

import {
  batchTemperaturesIntent,
  BatchTemperaturesSchema,
} from "../actions/batchTemperatures.schema";

type Props = {
  batchTemperatures: BatchTemperature[];
};
export const BatchTemperaturesForm = ({ batchTemperatures }: Props) => {
  const [form, fields] = useForm({
    defaultValue: {
      batchTemperatures,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: BatchTemperaturesSchema });
    },
  });
  const isPending = useIsPending();
  const temperatures = fields.batchTemperatures.getFieldList();
  return (
    <Form {...getFormProps(form)} method="POST">
      <div className="grid max-w-[300px] grid-cols-3 gap-x-2 p-1">
        {temperatures.map((batchTemp, index) => {
          const batchTempFields = batchTemp.getFieldset();
          return (
            <React.Fragment key={batchTemp.key}>
              <Field
                labelProps={{ children: "Dag" }}
                inputProps={{
                  placeholder: "0, 1, 2...",
                  ...getInputProps(batchTempFields.dayIndex, {
                    type: "number",
                  }),
                }}
                errors={batchTempFields.dayIndex.errors}
              />
              <Field
                labelProps={{ children: "Temp °C" }}
                inputProps={{
                  placeholder: "18",
                  ...getInputProps(batchTempFields.temperature, {
                    type: "number",
                  }),
                }}
                errors={batchTempFields.temperature.errors}
              />
              <div className="mt-5">
                <Button
                  variant="ghost"
                  size="icon"
                  {...form.remove.getButtonProps({
                    name: "batchTemperatures",
                    index,
                  })}
                >
                  <Trash />
                  <span className="sr-only">Fjern rad</span>
                </Button>
                <Button
                  variant="ghost"
                  disabled={index === 0}
                  size="icon"
                  {...form.reorder.getButtonProps({
                    name: "batchTemperatures",
                    from: index,
                    to: index - 1,
                  })}
                >
                  <ArrowUp />
                  <span className="sr-only">Flytt opp</span>
                </Button>
              </div>
            </React.Fragment>
          );
        })}
        {form.errors ? (
          <ErrorList className="col-span-3 py-2" errors={form.errors} />
        ) : null}
        <Button
          variant="ghost"
          type="button"
          onClick={() => form.insert({ name: "batchTemperatures" })}
        >
          <Plus />
          Legg til rad
        </Button>
        <Button type="submit" name="intent" value={batchTemperaturesIntent}>
          {isPending ? <Loader2 className="animate-spin" /> : <Save />}
          Lagre
        </Button>
      </div>
    </Form>
  );
};
