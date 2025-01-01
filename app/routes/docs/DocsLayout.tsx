import { Outlet } from "react-router";

import { Main } from "~/components/Main";

export default function DocsLayout() {
  return (
    <Main>
      <div className="prose w-full">
        <Outlet />
      </div>
    </Main>
  );
}
