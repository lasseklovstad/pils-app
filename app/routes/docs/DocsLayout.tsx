import { NavLink, Outlet } from "react-router";

import type { ComponentPropsWithRef } from "react";

import { Main } from "~/components/Main";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export default function DocsLayout() {
  return (
    <Main className="flex min-h-[400px] justify-center gap-4">
      <div className="bg-gray-50 py-2">
        <nav className="flex flex-col items-start">
          <CustomNavLink to="/docs" end>
            Kom i gang
          </CustomNavLink>
          <CustomNavLink to="gear">Utstyr</CustomNavLink>
          <CustomNavLink to="about">Om</CustomNavLink>
          <CustomNavLink to="feedback">Tilbakemeldinger</CustomNavLink>
        </nav>
      </div>
      <div className="prose py-2">
        <Outlet />
      </div>
    </Main>
  );
}

const CustomNavLink = (props: ComponentPropsWithRef<typeof NavLink>) => {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          buttonVariants({ variant: "link" }),
          isActive ? "font-bold underline" : "",
        )
      }
      {...props}
    />
  );
};
