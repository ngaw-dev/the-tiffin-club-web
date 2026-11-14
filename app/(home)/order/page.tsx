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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrder, getSettings, lookupOrder } from "@/lib/api";
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
  // Orders recovered via manual lookup, shown below stored ones.
  const [lookupOrders, setLookupOrders] = useState<Order[]>([]);

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

  if (!orders.length && !lookupOrders.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">No order found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn&apos;t find an order on this device. Use the lookup below with
          your manage token and contact details.
        </p>
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  const allOrders = [...lookupOrders, ...orders].filter(
    (o, i, arr) => arr.findIndex((x) => x.manage_token === o.manage_token) === i,
  );

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6">
      {placed && (
        <div className="rounded-lg border border-border bg-primary/5 p-5 text-center">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Order placed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll see you soon{allOrders[0].name ? `, ${allOrders[0].name}` : ""}. Pay in
            person at {allOrders[0].fulfilment === "pickup" ? "pickup" : "delivery"}.
          </p>
        </div>
      )}

      {allOrders.map((order) => (
        <OrderCard
          key={order.manage_token}
          order={order}
          cutoffTime={cutoffTime}
          onCancel={() => setCancelToken(order.manage_token)}
        />
      ))}

      <LookupSection onFound={(o) => setLookupOrders((prev) => [o, ...prev])} />

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
    <Card className="mt-8 rounded-lg">
      <CardHeader className="p-6 pb-0">
        <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold">
          Your order
          <Badge variant={cancelled ? "destructive" : "secondary"}>{order.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-4">

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
          <dd className="font-mono text-xs text-wrap">{order.manage_token}</dd>
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
        <Button
          variant="link"
          onClick={onCancel}
          className="mt-5 min-h-11 px-0 text-sm font-normal text-muted-foreground underline-offset-4 hover:text-destructive"
        >
          Cancel order
          {cutoffTime ? ` (until ${cutoffTime})` : ""}
        </Button>
      )}
      </CardContent>
    </Card>
  );
}

/** Manual token+contact lookup for orders placed on another device. */
function LookupSection({ onFound }: { onFound: (o: Order) => void }) {
  const [token, setToken] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const isEmail = contact.includes("@");
      const found = await lookupOrder({
        token,
        email: isEmail ? contact : undefined,
        phone: isEmail ? undefined : contact,
      });
      onFound(found);
      setOpen(false);
      setToken("");
      setContact("");
    } catch {
      toast.error("No order found for those details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-10">
      {open ? (
        <form onSubmit={submit} className="space-y-4">
          <Card className="rounded-lg">
            <CardContent className="p-6">
          <h2 className="font-display text-lg font-semibold">Ordered on another device?</h2>
          <p className="text-sm text-muted-foreground">
            Enter the manage token from your confirmation plus the email or phone you used.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="lookup-token">Manage token</Label>
            <Input
              id="lookup-token"
              required
              className="min-h-11 rounded-lg px-3.5"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lookup-contact">Email or phone</Label>
            <Input
              id="lookup-contact"
              required
              className="min-h-11 rounded-lg px-3.5"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="min-h-11" disabled={busy}>
              {busy ? "Looking up…" : "Find order"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Close
            </Button>
          </div>
            </CardContent>
          </Card>
        </form>
      ) : (
        <Button
          variant="link"
          onClick={() => setOpen(true)}
          className="min-h-11 px-0 text-sm font-normal text-muted-foreground"
        >
          Ordered on another device? Find your order
        </Button>
      )}
    </section>
  );
}
