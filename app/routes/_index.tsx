import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function Home() {
  return (
    <main className="p-2">
      <div className="flex gap-2 items-end">
        <div>
          <Label>Navn på brygg</Label>
          <Input placeholder="Eks: Winter IPA" />
        </div>
        <Button>Start nytt brygg</Button>
      </div>
    </main>
  );
}
