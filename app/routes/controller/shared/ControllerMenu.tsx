import { Form, useFetcher } from "react-router";
import { Edit, Loader2, Menu, Plus, Save, Trash } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { DialogClose } from "@radix-ui/react-dialog";

import type { ActionData } from "../+types.ControllerDetailsPage";

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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ControllerSecretSuccessMessage } from "~/components/ControllerSecretSuccessMessage";

type Props = {
  controller: { name: string; id: number };
};

export const ControllerMenu = ({ controller }: Props) => {
  const nameInputId = useId();
  const editNameFetcher = useFetcher<ActionData>();
  const editSecretFetcher = useFetcher<ActionData>();
  const [editNameDialogOpen, setEditNameDialogOpen] = useState(false);

  useEffect(() => {
    if (editNameFetcher.state === "idle" && editNameFetcher.data?.ok) {
      setEditNameDialogOpen(false);
    }
  }, [editNameFetcher.state, editNameFetcher.data]);

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
            <editNameFetcher.Form method="PUT">
              <DialogHeader>
                <DialogTitle>Endre navn</DialogTitle>
              </DialogHeader>
              <Label htmlFor={nameInputId}>Navn på kontroller</Label>
              <Input
                placeholder="Eks: Min kontroller"
                id={nameInputId}
                defaultValue={controller.name}
                required
                autoComplete="off"
                name="name"
              />
              <DialogFooter>
                <Button type="submit" name="intent" value="edit-name">
                  {editNameFetcher.state !== "idle" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Save />
                  )}
                  Lagre
                </Button>
              </DialogFooter>
            </editNameFetcher.Form>
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
              onClick={() =>
                editSecretFetcher.submit(
                  { intent: "edit-secret" },
                  { method: "PUT" },
                )
              }
            >
              {editSecretFetcher.state !== "idle" ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Plus />
              )}
              Generer ny nøkkel
            </Button>
            {editSecretFetcher.data?.ok && editSecretFetcher.data.secret ? (
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
