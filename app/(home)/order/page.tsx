"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { getOrder, getSettings } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { todayOrders } from "@/lib/order-store";
import { CancelOrderDialog } from "@/app/(home)/cancel-order-dialog";
import type { Order } from "@/lib/types";

export default function OrderPage() {
  return (
    <Suspense fallback={null}>
      <OrderClient />
    </Suspense>
  );
}

function OrderClient() {
  const params = useSearchParams();
  const urlToken = params.get("token");
  const placed = params.get("placed") === "1";

  // Stored tokens for today; URL token (share/refresh fallback) takes priority.
  const [tokens, setTokens] = useState<string[]>(() => {
    const stored = todayOrders().map((o) => o.token);
    return urlToken ? [urlToken, ...stored.filter((t) => t !== urlToken)] : stored;
  });
  const [cancelToken, setCancelToken] = useState<string | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["orders", tokens],
    queryFn: async () => {
      const results = await Promise.allSettled(tokens.map((t) => getOrder(t)));
      return results
        .filter((r): r is PromiseFulfilledResult<Order> => r.status === "fulfilled")
        .map((r) => r.value)
        .sort((a, b) => b.placed_at.localeCompare(a.placed_at));
    },
  });

  const settingsQuery = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const cutoffTime = settingsQuery.data?.order_cutoff_time ?? null;
  const orders = ordersQuery.data ?? [];

  if (ordersQuery.isLoading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center text-sm text-muted-foreground sm:px-6">
        Loading your order…
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">No order found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn&apos;t find an order on this device. Use{" "}
          <Link href="/" className="text-primary underline underline-offset-4">
            find my order
          </Link>{" "}
          with your manage token and contact details.
        </p>
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-16 pt-10 sm:px-6">
      {placed && (
        <div className="rounded-lg border border-border bg-primary/5 p-5 text-center">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Order placed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll see you soon{orders[0].name ? `, ${orders[0].name}` : ""}. Pay in person at{" "}
            {orders[0].fulfilment === "pickup" ? "pickup" : "delivery"}.
          </p>
        </div>
      )}

      {orders.map((order) => (
        <OrderCard
          key={order.manage_token}
          order={order}
          cutoffTime={cutoffTime}
          onCancel={() => setCancelToken(order.manage_token)}
        />
      ))}

      {cancelToken && (
        <CancelOrderDialog
          token={cancelToken}
          open={true}
          onOpenChange={() => setCancelToken(null)}
          cutoffTime={cutoffTime}
          onCancelled={() => {
            const next = tokens.filter((t) => t !== cancelToken);
            setTokens(next);
            ordersQuery.refetch();
          }}
        />
      )}

      <div className="mt-6">
        <Button asChild variant="link">
          <Link href="/">Back to today&apos;s menu</Link>
        </Button>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}

function OrderCard({
  order,
  cutoffTime,
  onCancel,
}: {
  order: Order;
  cutoffTime: string | null;
  onCancel: () => void;
}) {
  const cancelled = order.status === "cancelled";
  // Orders past expiry (23:59:59 order day) can no longer be managed.
  const expired = new Date(order.expires_at).getTime() <= Date.now();

  return (
    <section className="mt-8 border border-border bg-card p-6">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
        Your order
        <Badge variant={cancelled ? "destructive" : "secondary"}>{order.status}</Badge>
      </h2>

      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Fulfilment</dt>
          <dd className="capitalize">{order.fulfilment}</dd>
        </div>
        {order.suburb ? (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Suburb</dt>
            <dd>{order.suburb}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Manage token</dt>
          <dd className="font-mono">{order.manage_token}</dd>
        </div>
      </dl>

      <Separator className="my-4" />
      <ul className="space-y-2 text-sm">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between">
            <span>
              {it.quantity} × {it.name}
            </span>
            <span className="ttc-num">{formatMoney(it.unit_price * it.quantity)}</span>
          </li>
        ))}
      </ul>
      <Separator className="my-4" />
      <div className="flex justify-between font-semibold">
        <span>Total (pay in person)</span>
        <span className="ttc-num">{formatMoney(order.total)}</span>
      </div>

      {!cancelled && !expired && (
        <button
          type="button"
          onClick={onCancel}
          className="mt-5 text-sm text-muted-foreground underline-offset-4 hover:text-destructive hover:underline"
        >
          Cancel order
          {cutoffTime ? ` (until ${cutoffTime})` : ""}
        </button>
      )}
    </section>
  );
}
