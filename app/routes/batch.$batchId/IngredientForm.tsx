import { useFetcher } from "@remix-run/react";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { Ingredient } from "db/schema";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

import { action } from "./route";

type Props = {
  ingredient?: Ingredient;
  amountUnit: string;
  type: Ingredient["type"];
  showLabel: boolean;
};

export const IngredientForm = ({
  ingredient,
  amountUnit,
  type,
  showLabel,
}: Props) => {
  const nameId = useId();
  const amountId = useId();
  const fetcher = useFetcher<typeof action>({
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
      if (fetcher.state === "idle" && fetcher.data?.ok && !ingredient) {
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
            step={0.01}
            autoComplete="off"
            required
            defaultValue={ingredient?.amount ?? ""}
          />
        </div>
        <input hidden readOnly value={ingredient?.id ?? ""} name="id" />
        <input hidden readOnly value={"ingredient"} name="intent" />
        <input hidden readOnly value={type} name="type" />

        {ingredient ? null : (
          <Button type="submit" variant="ghost" size="icon">
            {fetcher.state !== "idle" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus />
            )}
            <span className="sr-only">Legg til ingredient</span>
          </Button>
        )}
      </fetcher.Form>
      {ingredient ? (
        <deleteFetcher.Form method="DELETE" className="contents">
          <input hidden readOnly value={ingredient.id} name="id" />
          <input hidden readOnly value={"ingredient"} name="intent" />
          <Button type="submit" variant="ghost" size="icon">
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
