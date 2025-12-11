import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { Edit, Loader2, MoreHorizontal, Save, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Form, useActionData, useNavigation } from "react-router";

import type { Batch } from "db/schema";
import type { action } from "../BatchDetailsPage";

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
  deleteBatchIntent,
  editBatchNameIntent,
  EditBatchNameSchema,
} from "../actions/batch.schema";

type Props = {
  batch: Batch;
};

export const BatchMenu = ({ batch }: Props) => {
  const lastResult = useActionData<typeof action>();
  const isPending = useIsPending();
  const navigation = useNavigation();
  const [form, fields] = useForm({
    // Sync the result of last submission only when the state is idle
    lastResult: navigation.state === "idle" ? lastResult?.result : null,
    defaultValue: { name: batch.name },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EditBatchNameSchema });
    },
  });
  const [editNameDialogOpen, setEditNameDialogOpen] = useState(false);

  useEffect(() => {
    if (lastResult?.status === 200) {
      setEditNameDialogOpen(false);
    }
  }, [lastResult?.status]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon">
          <MoreHorizontal />
          <span className="sr-only">Åpne meny</span>
        </Button>
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
                labelProps={{ children: "Navn på brygg" }}
                inputProps={{
                  placeholder: "Eks: Pilsner",
                  autoComplete: "off",
                  ...getInputProps(fields.name, { type: "text" }),
                }}
              />
              <DialogFooter>
                <Button type="submit" name="intent" value={editBatchNameIntent}>
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
