"use client";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";

/** Dev-only: TanStack Query devtools. Never rendered in production or
 *  during prerendering of global-error (no provider context). */
export function Devtools() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <TanStackDevtools
      plugins={[
        {
          name: "TanStack Query",
          render: <ReactQueryDevtoolsPanel />,
        },
      ]}
    />
  );
}
