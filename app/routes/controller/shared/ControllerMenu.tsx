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
  editNameIntent,
  EditNameSchema,
  type action,
} from "../ControllerDetailsPage";

type Props = {
  controller: { name: string; id: number };
};

export const ControllerMenu = ({ controller }: Props) => {
  const lastResult = useActionData<typeof action>();
  const isPending = useIsPending();
  const navigation = useNavigation();
  const [form, fields] = useForm({
    // Sync the result of last submission only when the state is idle
    lastResult: navigation.state === "idle" ? lastResult?.result : null,
    defaultValue: { name: controller.name },
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
              Endre navn
              <Edit className="ml-2 size-4" />
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <Form method="PUT" {...getFormProps(form)}>
              <DialogHeader>
                <DialogTitle>Endre navn</DialogTitle>
              </DialogHeader>
              <Field
                labelProps={{ children: "Navn på kontroller" }}
                inputProps={{
                  placeholder: "Eks: Min kontroller",
                  autoComplete: "off",
                  ...getInputProps(fields.name, { type: "text" }),
                }}
              />
              <DialogFooter>
                <Button type="submit" name="intent" value={editNameIntent}>
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
                  <Button variant="ghost" type="submit">
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
