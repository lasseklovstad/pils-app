import { Link, Outlet } from "react-router";

import { Main } from "~/components/Main";
import { Button } from "~/components/ui/button";

export default function DocsLayout() {
  return (
    <Main className="flex min-h-[400px] gap-4">
      <div className="bg-gray-50 py-2">
        <nav className="flex flex-col items-start">
          <Button asChild variant="link">
            <Link to="getting-started">Kom i gang</Link>
          </Button>
          <Button asChild variant="link">
            <Link to="gear">Utstyr</Link>
          </Button>
          <Button asChild variant="link">
            <Link to="about">Om</Link>
          </Button>
          <Button asChild variant="link">
            <Link to="feedback">Tilbakemeldinger</Link>
          </Button>
        </nav>
      </div>
      <div className="prose py-2">
        <Outlet />
      </div>
    </Main>
  );
}
