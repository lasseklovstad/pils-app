import { Plus } from "lucide-react";
import { useId } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function Home() {
  const id = useId();
  return (
    <main className="p-2">
      <h1 className="text-2xl">🍺Pils</h1>
      <div className="flex gap-2 items-end">
        <div>
          <Label htmlFor={id}>Navn på brygg</Label>
          <Input
            placeholder="Eks: Winter IPA"
            id={id}
            required
            autoComplete="off"
          />
        </div>
        <Button>
          <Plus />
          Start nytt brygg
        </Button>
      </div>
    </main>
  );
}
