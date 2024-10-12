import { useFetcher } from "@remix-run/react";
import { Edit, Menu, Plus, Trash } from "lucide-react";
import { useId } from "react";

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

type Props = {
  controller: { name: string };
};

export const ControllerMenu = ({ controller }: Props) => {
  const nameInputId = useId();
  const editNameFetcher = useFetcher();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Menu className="size-6" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Dialog>
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
                <Button variant="ghost">Ja, slett</Button>
                <Button>Avbryt</Button>
              </DialogFooter>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
