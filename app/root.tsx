import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import styles from "~/tailwind.css"
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { ClerkApp , ClerkErrorBoundary} from "@clerk/remix";



export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
];

export const loader: LoaderFunction = (args) => rootAuthLoader(args);
export const ErrorBoundary = ClerkErrorBoundary();



function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
export default ClerkApp(App);

