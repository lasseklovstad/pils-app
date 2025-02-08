import { NavLink, Outlet } from "react-router";

import type { ComponentPropsWithRef } from "react";

import { Main } from "~/components/Main";
import { buttonVariants } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export default function DocsLayout() {
  return (
    <Main className="min-h-[400px]">
      <div className="flex gap-2">
        <div className="hidden bg-gray-50 py-2 md:block">
          <nav className="flex flex-col items-start">
            <CustomNavLink to="/docs" end>
              Kom i gang
            </CustomNavLink>
            <CustomNavLink to="gear">Utstyr</CustomNavLink>
            <CustomNavLink to="architecture">Arkitektur</CustomNavLink>
            <CustomNavLink to="coding">Koding</CustomNavLink>
            <CustomNavLink to="about">Om</CustomNavLink>
            <CustomNavLink to="feedback">Tilbakemeldinger</CustomNavLink>
          </nav>
        </div>
        <div className="prose mb-20 max-w-full py-2 [&>code]:p-1">
          <Outlet />
        </div>
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
