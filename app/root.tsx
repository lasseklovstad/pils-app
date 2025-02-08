import {
  Form,
  isRouteErrorResponse,
  Link,
  Links,
  LinksFunction,
  Meta,
  MetaFunction,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
  useRouteError,
} from "react-router";
import { Menu } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import type { Route } from "./+types/root";

import stylesheet from "~/tailwind.css?url";

import { Button } from "./components/ui/button";
import { getUser } from "./lib/auth.server";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "manifest", href: "/manifest.json" },
  { rel: "icon", href: "/favicon.ico" },
];

export const meta: MetaFunction = () => [{ title: "Pils" }];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const Header = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="sticky top-0 z-10 border-b bg-background py-2 md:static">
      <div className="container mx-auto flex max-w-[800px] items-center">
        <a className="mr-16 flex items-center gap-2" href="/">
          <img className="size-8" src="/favicon-32x32.png" alt="" />
          <h1 className="text-2xl">Pils</h1>
        </a>
        {children}
      </div>
    </div>
  );
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const user = await getUser(request);
  return { user };
};

export default function App({ loaderData: { user } }: Route.ComponentProps) {
  const [open, setOpen] = useState(false);
  const nav = useNavigation();

  console.log(nav);

  useEffect(() => {
    if (nav.state === "loading") {
      setOpen(false);
    }
  }, [nav.state]);

  const NavigationListItems = [
    { label: "Hjem", to: "/" },
    { label: "Brygg", to: "/batches" },
    {
      label: "Lær",
      to: "/docs",
      children: [
        { label: "Kom i gang", to: "/docs" },
        { label: "Utstyr", to: "/docs/gear" },
        { label: "Arkitektur", to: "/docs/architecture" },
        { label: "Koding", to: "/docs/coding" },
        { label: "Om", to: "/docs/about" },
        { label: "Tilbakemeldinger", to: "/docs/feedback" },
      ],
    },
    user && { label: "Kontrollere", to: "/controller" },
  ]
    .filter((link) => link !== null)
    .map(({ label, to, children }) => (
      <li key={label} className="py-1">
        <Button asChild variant="link">
          <Link to={to}>{label}</Link>
        </Button>
        {children ? (
          <ul className="md:hidden">
            {children.map((child) => (
              <li key={child.to} className="ml-4">
                <Button asChild variant="link">
                  <Link to={child.to}>{child.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
      </li>
    ));

  const AccountButton = user ? (
    <Form method="POST" action="/logout" className="py-1">
      <Button variant="outline" type="submit">
        Logg ut
      </Button>
    </Form>
  ) : (
    <Button asChild variant="outline" className="py-1">
      <Link to="/login">Logg inn</Link>
    </Button>
  );
  return (
    <>
      <Header>
        <div className="flex w-full justify-end md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
              <span className="sr-only">Meny</span>
              <Menu />
            </SheetTrigger>
            <SheetContent className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Navigasjonsmeny</SheetTitle>
                <SheetDescription>Hvor ønsker du å navigere?</SheetDescription>
              </SheetHeader>
              <nav className="my-4">
                <ul className="flex w-full flex-col divide-y-2">
                  {NavigationListItems}
                </ul>
              </nav>
              {AccountButton}
            </SheetContent>
          </Sheet>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
          <ul className="flex">{NavigationListItems}</ul>

          {AccountButton}
        </nav>
      </Header>
      <Outlet />
    </>
  );
}

export function HydrateFallback() {
  return <h1>Loading...</h1>;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <>
        <Header />
        <main className="container mx-auto">
          <h1 className="text-2xl font-medium">
            {error.status} {error.statusText}
          </h1>
          <p>{error.data}</p>
        </main>
      </>
    );
  } else if (error instanceof Error) {
    return (
      <>
        <Header />
        <main className="container mx-auto">
          <h1 className="text-2xl font-medium">Error</h1>
          <p>{error.message}</p>
          <pre className="bg-slate-50 p-2 text-xs">{error.stack}</pre>
        </main>
      </>
    );
  } else {
    return (
      <>
        <Header />
        <main className="container mx-auto">
          <h1 className="text-2xl font-medium">Unknown Error</h1>
        </main>
      </>
    );
  }
}
