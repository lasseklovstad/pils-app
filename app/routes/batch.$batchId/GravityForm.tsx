import { useFetcher } from "@remix-run/react";
import { Loader2, Save } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Batch } from "db/schema";

import { action } from "./route";

type Props = {
  batch: Batch;
};

export const GravityForm = ({ batch }: Props) => {
  const fetcher = useFetcher<typeof action>();
  return (
    <fetcher.Form method="PUT" className="space-y-2 rounded border p-2">
      <h2 className="text-xl">Alkoholprosent</h2>
      {batch.finalGravity && batch.originalGravity ? (
        <div className="text-base">
          <span className="font-medium">ABV:</span>{" "}
          {((batch.originalGravity - batch.finalGravity) / 7.169).toFixed(1)}%
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          Fyll ut begge for å se alkoholprosent
        </div>
      )}
      <div className="flex items-end gap-2">
        <div>
          <Label htmlFor="original-gravity-input">Original gravity</Label>
          <Input
            id="original-gravity-input"
            name="original-gravity"
            type="number"
            pattern="\d+"
            autoComplete="off"
            defaultValue={batch.originalGravity ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="final-gravity-input">Final gravity</Label>
          <Input
            id="final-gravity-input"
            name="final-gravity"
            type="number"
            pattern="\d+"
            autoComplete="off"
            defaultValue={batch.finalGravity ?? ""}
          />
        </div>
      </div>
      <Button name="intent" value="put-gravity" size="sm">
        {fetcher.state !== "idle" ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Save />
        )}
        Lagre
      </Button>
    </fetcher.Form>
  );
};
