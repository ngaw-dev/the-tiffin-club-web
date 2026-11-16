"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { shadcn } from "@clerk/ui/themes";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            // Don't retry 429s — each retry feeds the backend rate limiter
            // and turns one failed request into four. (ApiError carries
            // .status; lib/api.ts normalizes axios errors to it.)
            retry: (failureCount, error) => {
              const status = (error as { status?: number })?.status;
              if (status === 429) return false;
              return failureCount < 3;
            },
          },
        },
      }),
  );

  return (
    <ClerkProvider appearance={{ theme: shadcn }} dynamic>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ClerkProvider>
  );
}
