import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HomeClient } from "@/app/(home)/home-client";
import { getSettings, getTodayMenu } from "@/lib/api";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

async function HydratedHome() {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({ queryKey: ["menu", "today"], queryFn: getTodayMenu }),
    queryClient.prefetchQuery({ queryKey: ["settings"], queryFn: getSettings }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeClient />
    </HydrationBoundary>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="mt-4 h-5 w-1/3" />
          <Skeleton className="mt-10 h-64 w-full" />
        </div>
      }
    >
      <HydratedHome />
    </Suspense>
  );
}
