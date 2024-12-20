import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Loader2, Plus, X } from "lucide-react";
import { Form, useActionData, useNavigation } from "react-router";

import type { action } from "../BatchDetailsPage";

import { Ingredient } from "db/schema";
import { Field } from "~/components/Form";
import { Button } from "~/components/ui/button";
import { useIsPending } from "~/lib/useIsPending";
import { cn } from "~/lib/utils";

import {
  deleteIngredientIntent,
  postIngredientIntent,
  PostIngredientSchema,
  putIngredientIntent,
  PutIngredientSchema,
} from "../actions/batch.schema";

type Props = {
  ingredient?: Ingredient;
  amountUnit: "kg" | "g" | "stk";
  type: Ingredient["type"];
  showLabel: boolean;
  readOnly: boolean;
  namePlaceholder?: string;
};

export const IngredientForm = ({
  ingredient,
  amountUnit,
  type,
  showLabel,
  readOnly,
  namePlaceholder,
}: Props) => {
  const lastResult = useActionData<typeof action>();
  const isPending = useIsPending({ formMethod: ingredient ? "PUT" : "POST" });
  const isDeletePending = useIsPending({ formMethod: "DELETE" });
  const navigation = useNavigation();
  const [form, fields] = useForm({
    lastResult: navigation.state === "idle" ? lastResult?.result : null,
    defaultValue: {
      amount: ingredient?.amount,
      name: ingredient?.name,
      type: ingredient?.type,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: ingredient ? PutIngredientSchema : PostIngredientSchema,
      });
    },
  });
  return (
    <div
      className={cn(
        "flex gap-1 p-2",
        showLabel ? "items-center" : "items-start",
      )}
    >
      <Form
        method={ingredient ? "PUT" : "POST"}
        className="contents"
        {...getFormProps(form)}
      >
        <Field
          labelProps={{
            children: "Navn",
            className: cn(!showLabel && "sr-only"),
          }}
          inputProps={{
            readOnly,
            autoComplete: "off",
            placeholder: namePlaceholder,
            ...getInputProps(fields.name, { type: "text" }),
          }}
          errors={fields.name.errors}
        />
        <Field
          labelProps={{
            children: `Mengde (${amountUnit})`,
            className: cn(!showLabel && "sr-only"),
          }}
          inputProps={{
            readOnly,
            autoComplete: "off",
            step: amountUnit === "kg" ? 0.01 : 1,
            ...getInputProps(fields.amount, { type: "number" }),
          }}
          errors={fields.amount.errors}
        />
        <input hidden readOnly value={ingredient?.id ?? ""} name="id" />
        <input hidden readOnly value={type} name="type" />

        <Button
          type="submit"
          variant="ghost"
          size="icon"
          name="intent"
          value={ingredient ? putIngredientIntent : postIngredientIntent}
          className={cn(ingredient && "hidden")}
          disabled={readOnly}
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Plus />}
          <span className="sr-only">
            {ingredient ? "Oppdater ingredient" : "Legg til ingredient"}
          </span>
        </Button>
      </Form>
      {ingredient ? (
        <Form method="DELETE" className="contents">
          <input hidden readOnly value={ingredient.id} name="id" />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            name="intent"
            value={deleteIngredientIntent}
            disabled={readOnly}
          >
            {isDeletePending ? <Loader2 className="animate-spin" /> : <X />}
            <span className="sr-only">Slett ingredient</span>
          </Button>
        </Form>
      ) : null}
    </div>
  );
};
