import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { Edit, Loader2, Menu, Plus, Save, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Form, useActionData, useFetcher, useNavigation } from "react-router";

import { ControllerSecretSuccessMessage } from "~/components/ControllerSecretSuccessMessage";
import { Field } from "~/components/Form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useIsPending } from "~/lib/useIsPending";

import {
  deleteControllerIntent,
  editControllerIntent,
  EditNameSchema,
  type action,
} from "../ControllerDetailsPage";

type Props = {
  controller: {
    name: string;
    id: number;
    minDelayInSeconds: number;
    avgTemperatureBufferSize: number;
    hysteresis: number;
  };
};

export const ControllerMenu = ({ controller }: Props) => {
  const lastResult = useActionData<typeof action>();
  const isPending = useIsPending();
  const navigation = useNavigation();
  const [form, fields] = useForm({
    // Sync the result of last submission only when the state is idle
    lastResult: navigation.state === "idle" ? lastResult?.result : null,
    defaultValue: {
      name: controller.name,
      avgTemperatureBufferSize: controller.avgTemperatureBufferSize,
      hysteresis: controller.hysteresis,
      minDelayInSeconds: controller.minDelayInSeconds,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EditNameSchema });
    },
  });
  const editSecretFetcher = useFetcher<typeof action>();
  const [editNameDialogOpen, setEditNameDialogOpen] = useState(false);

  useEffect(() => {
    if (navigation.state === "idle" && lastResult?.status === 200) {
      setEditNameDialogOpen(false);
    }
  }, [navigation.state, lastResult?.status]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Menu className="size-6" />
        <span className="sr-only">Åpne meny</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Dialog open={editNameDialogOpen} onOpenChange={setEditNameDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex justify-between"
            >
              Endre kontroller
              <Edit className="ml-2 size-4" />
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <Form method="PUT" {...getFormProps(form)}>
              <DialogHeader>
                <DialogTitle>Endre kontroller</DialogTitle>
              </DialogHeader>
              <Field
                labelProps={{ children: "Navn på kontroller" }}
                inputProps={{
                  placeholder: "Eks: Min kontroller",
                  autoComplete: "off",
                  ...getInputProps(fields.name, { type: "text" }),
                }}
                errors={fields.name.errors}
              />
              <Field
                labelProps={{ children: "Forsinkelse i sekunder" }}
                inputProps={{
                  autoComplete: "off",
                  ...getInputProps(fields.minDelayInSeconds, {
                    type: "number",
                  }),
                }}
                errors={fields.minDelayInSeconds.errors}
              />
              <Field
                labelProps={{ children: "Hysterese temp" }}
                inputProps={{
                  autoComplete: "off",
                  step: 0.1,
                  ...getInputProps(fields.hysteresis, {
                    type: "number",
                  }),
                }}
                errors={fields.hysteresis.errors}
              />
              <Field
                labelProps={{
                  children: "Antall punkter til glidende gjennomsnitt",
                }}
                inputProps={{
                  autoComplete: "off",
                  ...getInputProps(fields.avgTemperatureBufferSize, {
                    type: "number",
                  }),
                }}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  name="intent"
                  value={editControllerIntent}
                >
                  {isPending ? <Loader2 className="animate-spin" /> : <Save />}
                  Lagre
                </Button>
              </DialogFooter>
            </Form>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex justify-between"
            >
              Generer ny nøkkel
              <Plus className="ml-2 size-4" />
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generer ny nøkkel</DialogTitle>
            </DialogHeader>
            <Button
              onClick={() => {
                void editSecretFetcher.submit(
                  { intent: "edit-secret" },
                  { method: "PUT" },
                );
              }}
            >
              {editSecretFetcher.state !== "idle" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Plus />
              )}
              Generer ny nøkkel
            </Button>
            {editSecretFetcher.data?.status === 200 &&
            editSecretFetcher.data.secret ? (
              <ControllerSecretSuccessMessage
                controller={{
                  ...controller,
                  secret: editSecretFetcher.data.secret,
                }}
              />
            ) : null}
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex justify-between"
            >
              Slett
              <Trash className="ml-2 size-4" />
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Slett</DialogTitle>
              <DialogDescription>Er du sikker?</DialogDescription>
              <DialogFooter>
                <Form method="DELETE">
                  <Button
                    variant="ghost"
                    type="submit"
                    name="intent"
                    value={deleteControllerIntent}
                  >
                    Ja, slett
                  </Button>
                </Form>
                <DialogClose asChild>
                  <Button>Avbryt</Button>
                </DialogClose>
              </DialogFooter>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
