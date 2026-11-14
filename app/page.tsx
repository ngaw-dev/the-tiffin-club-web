import { Suspense } from "react";
import { HomeClient } from "@/components/home-client";
import { HomeData } from "@/components/home-data";
import { CartProvider } from "@/lib/cart-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  return (
    <CartProvider>
      <Suspense fallback={<HomeSkeleton />}>
        <HomeData />
      </Suspense>
    </CartProvider>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background" aria-busy="true" aria-label="Loading">
      <div className="h-14 border-b" />
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-16">
        <Skeleton className="mx-auto h-12 w-2/3" />
        <Skeleton className="mx-auto h-5 w-1/2" />
        <Skeleton className="mx-auto h-11 w-44 rounded-lg" />
      </div>
      <div className="mx-auto w-full max-w-3xl space-y-3 px-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}
