import { Outlet } from "react-router";

import { Main } from "~/components/Main";

export default function MdxLayout() {
  return (
    <Main>
      <div className="prose mb-20 max-w-full py-2 [&>code]:p-1">
        <Outlet />
      </div>
    </Main>
  );
}
