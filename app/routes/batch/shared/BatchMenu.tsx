import { DialogClose } from "@radix-ui/react-dialog";
import { Edit, Loader2, Menu, Save, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Form, useFetcher } from "react-router";

import type { Batch } from "db/schema";
import type { ActionData } from "../+types.BatchDetailsPage";

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

import {
  deleteBatchIntent,
  editBatchNameIntent,
} from "../actions/batch.schema";

type Props = {
  batch: Batch;
};

export const BatchMenu = ({ batch }: Props) => {
  const editNameFetcher = useFetcher<ActionData>();
  const [editNameDialogOpen, setEditNameDialogOpen] = useState(false);

  useEffect(() => {
    if (
      editNameFetcher.state === "idle" &&
      editNameFetcher.data?.status === "success"
    ) {
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
              <Field
                labelProps={{ children: "Navn på brygg" }}
                inputProps={{
                  placeholder: "Eks: Pilsner",
                  defaultValue: batch.name,
                  required: true,
                  autoComplete: "off",
                  name: "name",
                }}
              />
              <DialogFooter>
                <Button type="submit" name="intent" value={editBatchNameIntent}>
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
                    value={deleteBatchIntent}
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
