import { getFormProps, getSelectProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { DialogClose, DialogTitle } from "@radix-ui/react-dialog";
import { useState } from "react";
import { Form, Link, useActionData, useFetcher } from "react-router";

import type { Batch } from "db/schema";
import type { action } from "../BatchDetailsPage";

import { ErrorList, NativeSelectField } from "~/components/Form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "~/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";

import {
  batchControllerStatusIntent,
  putBatchControllerIntent,
  PutBatchControllerSchema,
} from "../actions/batchController.schema";

type Props = {
  readOnly: boolean;
  controllers: {
    id: number;
    name: string;
  }[];
  batch: Batch;
};

export const ControllerForm = ({ batch, controllers, readOnly }: Props) => {
  const [stopFermentationDialog, setStopFermentationDialog] =
    useState<string>();
  const statusFetcher = useFetcher<typeof action>();
  const formValid = batch.mode && batch.controllerId;

  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult: lastResult?.result,
    defaultValue: {
      controllerId: batch.controllerId,
      controllerMode: batch.mode,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: PutBatchControllerSchema,
      });
    },
  });

  const postControllerStatus = (value: string) => {
    void statusFetcher.submit(
      {
        intent: batchControllerStatusIntent,
        status: value,
        controllerId: batch.controllerId,
      },
      { method: "POST" },
    );
  };

  return (
    <div className="flex flex-col items-start justify-start gap-1">
      <Form method="PUT" className="flex gap-2" {...getFormProps(form)}>
        <NativeSelectField
          labelProps={{ children: "Velg kontroller" }}
          selectProps={{
            ...getSelectProps(fields.controllerId),
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
            ...getSelectProps(fields.controllerMode),
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

        <input hidden name="intent" value={putBatchControllerIntent} readOnly />
        {batch.controllerId ? (
          <Button variant="link" asChild className="mt-5">
            <Link to={`/controller/${batch.controllerId}`}>
              Gå til kontroller
            </Link>
          </Button>
        ) : null}
      </Form>

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
          if (batch.controllerStatus === "active") {
            setStopFermentationDialog(value);
          } else {
            postControllerStatus(value);
          }
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
      <Dialog
        open={!!stopFermentationDialog}
        onOpenChange={(open) => {
          if (!open) {
            setStopFermentationDialog(undefined);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bekreftelse</DialogTitle>
            <DialogDescription>
              Er du sikker du vil avslutte gjæring?
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  if (stopFermentationDialog) {
                    postControllerStatus(stopFermentationDialog);
                  }
                  setStopFermentationDialog(undefined);
                }}
              >
                Ja, stopp
              </Button>
              <DialogClose asChild>
                <Button>Avbryt</Button>
              </DialogClose>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {statusFetcher.data && statusFetcher.data.status !== 200 ? (
        <ErrorList errors={statusFetcher.data.result?.error?.["status"]} />
      ) : null}
      {!formValid ? (
        <div className="mb-1 font-semibold text-red-800">
          Du må velge kontroller og type før du kan styre status
        </div>
      ) : null}
    </div>
  );
};
