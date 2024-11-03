import { useFetcher } from "react-router";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import type { ActionData } from "../+types.BatchDetailsPage";

import { Ingredient } from "db/schema";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

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
  const nameId = useId();
  const amountId = useId();
  const fetcher = useFetcher<ActionData>({
    key: ingredient ? `put-ingredient-${ingredient.id}` : "create-ingredient",
  });
  const deleteFetcher = useFetcher({
    key: ingredient
      ? `delete-ingredient-${ingredient.id}`
      : "delete-ingredient",
  });
  const $form = useRef<HTMLFormElement>(null);

  useEffect(
    function resetFormOnSuccess() {
      if (
        fetcher.state === "idle" &&
        fetcher.data?.status === "success" &&
        !ingredient
      ) {
        $form.current?.reset();
      }
    },
    [fetcher.state, fetcher.data],
  );
  return (
    <div className="flex items-end gap-1 p-2">
      <fetcher.Form
        ref={$form}
        method={ingredient ? "PUT" : "POST"}
        className="contents"
      >
        <div>
          <Label htmlFor={nameId} className={cn(!showLabel && "sr-only")}>
            Navn
          </Label>
          <Input
            id={nameId}
            name="name"
            type="text"
            autoComplete="off"
            required
            defaultValue={ingredient?.name ?? ""}
            readOnly={readOnly}
            placeholder={namePlaceholder}
          />
        </div>
        <div>
          <Label htmlFor={amountId} className={cn(!showLabel && "sr-only")}>
            Mengde ({amountUnit})
          </Label>
          <Input
            id={amountId}
            name="amount"
            type="number"
            step={amountUnit === "kg" ? 0.01 : 1}
            autoComplete="off"
            required
            defaultValue={ingredient?.amount ?? ""}
            readOnly={readOnly}
          />
        </div>
        <input hidden readOnly value={ingredient?.id ?? ""} name="id" />
        <input hidden readOnly value={"ingredient"} name="intent" />
        <input hidden readOnly value={type} name="type" />

        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className={cn(ingredient && "hidden")}
          disabled={readOnly}
        >
          {fetcher.state !== "idle" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Plus />
          )}
          <span className="sr-only">
            {ingredient ? "Oppdater ingredient" : "Legg til ingredient"}
          </span>
        </Button>
      </fetcher.Form>
      {ingredient ? (
        <deleteFetcher.Form method="DELETE" className="contents">
          <input hidden readOnly value={ingredient.id} name="id" />
          <input hidden readOnly value={"ingredient"} name="intent" />
          <Button type="submit" variant="ghost" size="icon" disabled={readOnly}>
            {deleteFetcher.state !== "idle" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <X />
            )}
            <span className="sr-only">Slett ingredient</span>
          </Button>
        </deleteFetcher.Form>
      ) : null}
    </div>
  );
};
