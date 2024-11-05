import { Check, Copy } from "lucide-react";

import { Button } from "./ui/button";

type Props = {
  controller: { name: string; secret: string; id: number };
};

export const ControllerSecretSuccessMessage = ({ controller }: Props) => {
  return (
    <div className="flex flex-col gap-2 rounded border border-green-800 bg-green-100 p-2">
      <div className="flex gap-2 font-semibold">
        <Check /> Suksess
      </div>
      <div className="text-sm">
        Ny kontroller med navn {controller.name} opprettet. Lagre koden under,
        den vises kun en gang.
      </div>
      <div className="break-all">
        Kode: {controller.secret}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => {
            if (controller.secret) {
              void navigator.clipboard.writeText(controller.secret);
            }
          }}
        >
          <Copy />
        </Button>
      </div>
      <div>Id: {controller.id}</div>
    </div>
  );
};
