"use client";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";

/** Dev-only: TanStack Query devtools. Never rendered in production or
 *  during prerendering of global-error (no provider context). */
export function Devtools() {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <TanStackDevtools
      config={{
        // Next.js has no Vite middleware serving __tsd/open-source, so clicks
        // 404 silently. Route them to Next's own dev-overlay editor endpoint.
        openSourceUrl: (source) => {
          const [, file, line, column] = /^(.*):(\d+):(\d+)$/.exec(source) ?? [];
          const params = new URLSearchParams(
            file ? { file, line1: line, column1: column } : { file: source },
          );
          return `/__nextjs_launch-editor?${params.toString()}`;
        },
      }}
      plugins={[
        {
          name: "TanStack Query",
          render: <ReactQueryDevtoolsPanel />,
        },
      ]}
    />
  );
}
