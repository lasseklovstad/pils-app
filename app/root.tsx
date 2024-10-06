import { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css?url";

import { Button } from "./components/ui/button";

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
        <div className="container mx-auto mb-2 flex flex-col items-center justify-center pt-4 shadow">
          <a className="flex items-center gap-2" href="/">
            <img className="size-8" src="/favicon-32x32.png" alt="" />
            <h1 className="mb-4 text-6xl">Pils</h1>
          </a>
          <nav className="flex gap-2 p-4">
            <Button asChild variant="secondary">
              <Link to="/">Brygging</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/controller">Kontrollere</Link>
            </Button>
          </nav>
        </div>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return <h1>Loading...</h1>;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <main className="container mx-auto">
        <h1 className="text-2xl font-medium">
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </main>
    );
  } else if (error instanceof Error) {
    return (
      <main className="container mx-auto">
        <h1 className="text-2xl font-medium">Error</h1>
        <p>{error.message}</p>
        <pre className="bg-slate-50 p-2 text-xs">{error.stack}</pre>
      </main>
    );
  } else {
    return (
      <main className="container mx-auto">
        <h1 className="text-2xl font-medium">Unknown Error</h1>
      </main>
    );
  }
}
