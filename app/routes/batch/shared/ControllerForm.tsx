import { Form, Link, useFetcher } from "react-router";

import type { Batch } from "db/schema";
import type { Route } from "../+types.BatchDetailsPage";

import { ErrorList, NativeSelectField } from "~/components/Form";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import { Button } from "~/components/ui/button";

import { batchControllerStatusIntent } from "../actions/batchController.schema";

type Props = {
  readOnly: boolean;
  controllers: {
    id: number;
    name: string;
  }[];
  batch: Batch;
};

export const ControllerForm = ({ batch, controllers, readOnly }: Props) => {
  const statusFetcher = useFetcher<Route.ActionData>();
  const formValid = batch.mode && batch.controllerId;
  return (
    <div className="flex flex-col items-start justify-start gap-1">
      <Form method="PUT" className="flex gap-2">
        <NativeSelectField
          labelProps={{ children: "Velg kontroller" }}
          selectProps={{
            value: batch.controllerId || "",
            name: "controllerId",
            onChange: (e) => {
              e.target.form?.requestSubmit();
            },
            disabled: readOnly || batch.controllerStatus !== "inactive",
            children: (
              <>
                <option value="">Ingen valgt</option>
                {controllers.map((controller) => (
                  <option key={controller.id} value={controller.id}>
                    {controller.name}
                  </option>
                ))}
              </>
            ),
          }}
        />
        <NativeSelectField
          labelProps={{ children: "Velg type" }}
          selectProps={{
            value: batch.mode || "",
            name: "controllerMode",
            onChange: (e) => {
              e.target.form?.requestSubmit();
            },
            disabled: readOnly || batch.controllerStatus !== "inactive",
            children: (
              <>
                <option value="">Ingen valgt</option>
                <option value="warm">Varmeovn</option>
                <option value="cold">Kjøleskap</option>
              </>
            ),
          }}
        />

        <input hidden name="intent" value="put-batch-controller" readOnly />
      </Form>

      {batch.controllerId ? (
        <Button variant="link" asChild>
          <Link to={`/controller/${batch.controllerId}`}>
            Gå til kontroller
          </Link>
        </Button>
      ) : null}

      <ToggleGroup
        type="single"
        variant="outline"
        value={batch.controllerStatus}
        disabled={readOnly || !formValid}
        size="lg"
        onValueChange={(value) => {
          if (!value) {
            return;
          }
          statusFetcher.submit(
            {
              intent: batchControllerStatusIntent,
              status: value,
              controllerId: batch.controllerId,
            },
            { method: "POST" },
          );
        }}
      >
        <ToggleGroupItem
          className="data-[state=on]:bg-red-200"
          value="inactive"
        >
          Inaktiv
        </ToggleGroupItem>
        <ToggleGroupItem
          className="data-[state=on]:bg-orange-200"
          value="prepare"
        >
          Forbered til gjæring
        </ToggleGroupItem>
        <ToggleGroupItem
          value="active"
          className="data-[state=on]:bg-green-200"
        >
          Aktiv
        </ToggleGroupItem>
      </ToggleGroup>
      {statusFetcher.data &&
      statusFetcher.data.status !== "success" &&
      "error" in statusFetcher.data &&
      statusFetcher.data.error ? (
        <ErrorList errors={statusFetcher.data.error["status"]} />
      ) : null}
      {!formValid ? (
        <div className="mb-1 font-semibold text-red-800">
          Du må velge kontroller og type før du kan styre status
        </div>
      ) : null}
    </div>
  );
};
