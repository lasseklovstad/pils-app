import { Loader2, Save } from "lucide-react";
import { useFetcher } from "react-router";

import type { action } from "../BatchDetailsPage";

import { Batch } from "db/schema";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type Props = {
  batch: Batch;
  readOnly: boolean;
};

export const GravityForm = ({ batch, readOnly }: Props) => {
  const fetcher = useFetcher<typeof action>();
  const abv =
    batch.finalGravity && batch.originalGravity
      ? ((batch.originalGravity - batch.finalGravity) / 7.169).toFixed(1)
      : null;
  return (
    <>
      <AccordionTrigger>
        Alkoholprosent {abv ? `${abv}%` : null}
      </AccordionTrigger>
      <AccordionContent>
        <fetcher.Form method="PUT" className="space-y-2 p-2">
          <h2 className="text-xl">Alkoholprosent</h2>
          {abv ? (
            <div className="text-base">
              <span className="font-medium">ABV:</span> {abv}%
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
                readOnly={readOnly}
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
                readOnly={readOnly}
              />
            </div>
          </div>
          <Button
            name="intent"
            value="put-gravity"
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
      </AccordionContent>
    </>
  );
};
