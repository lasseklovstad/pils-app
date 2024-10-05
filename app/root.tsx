import { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";

import stylesheet from "~/tailwind.css?url";

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
        <header className="container mx-auto">
          <a className="flex items-center gap-2" href="/">
            <img className="size-8" src="/favicon-32x32.png" alt="" />
            <h1 className="mb-4 text-6xl">Pils</h1>
          </a>
        </header>
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
