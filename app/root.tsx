import { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import stylesheet from "~/tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "manifest", href: "/manifest.json" },
  { rel: "icon", href: "/favicon.ico" },
];

export const meta: MetaFunction = () => [{ title: "🍺Pils" }];

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

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return <h1>Loading...</h1>;
}
