import { Ellipsis, Eye, Trash } from "lucide-react";
import { useSubmit } from "react-router";

import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { Media } from "./Media";

type Props = {
  files: {
    publicUrl: string;
    id: string;
    createdAt: Date;
    type: "video" | "image" | "unknown";
    batchId: number;
  }[];
  showMenu: boolean;
};

export const MediaCarousel = ({ files, showMenu }: Props) => {
  const submit = useSubmit();
  return (
    <Carousel>
      <CarouselContent>
        {files.map((file) => (
          <CarouselItem
            key={file.id}
            className="relative md:basis-1/2 lg:basis-1/3"
          >
            <Media
              file={file}
              className="h-96 w-full rounded-sm object-cover object-center"
            />
            {showMenu ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" className="absolute right-2 top-1">
                    <Ellipsis className="size-6" />
                    <span className="sr-only">Åpne meny</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onSelect={() =>
                      submit(
                        { fileId: file.id, intent: "set-preview-file" },
                        { preventScrollReset: true, method: "POST" },
                      )
                    }
                    disabled={file.type !== "image"}
                  >
                    <Eye />
                    Velg som forsidebilde
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onSelect={() =>
                      submit(
                        { fileId: file.id, intent: "delete-file" },
                        { preventScrollReset: true, method: "DELETE" },
                      )
                    }
                  >
                    <Trash />
                    Slett
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
