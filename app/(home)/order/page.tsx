"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getOrder, getSettings, lookupOrder } from "@/lib/api";
import { getMyOrders } from "@/lib/account";
import { todayOrders } from "@/lib/order-store";
import { CancelOrderDialog } from "@/app/(home)/cancel-order-dialog";
import { useAuth } from "@clerk/nextjs";
import type { Order } from "@/lib/types";
import { OrderCard as SharedOrderCard } from "@/components/order-card";

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
  // Signed-in users see their full account history (/my-orders); guests keep
  // the manage-token view (localStorage + URL token + manual lookup).
  const { isSignedIn, getToken } = useAuth();
  const myOrdersQuery = useQuery({
    queryKey: ["account", "orders"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not signed in");
      return getMyOrders(token);
    },
    enabled: isSignedIn === true,
  });

  // Stored tokens for today; URL token (share/refresh fallback) takes priority.
  // localStorage is browser-only, so storage is read after mount — reading it
  // during render would make SSR output (no tokens) mismatch the client.
  const [tokens, setTokens] = useState<string[]>(urlToken ? [urlToken] : []);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const stored = todayOrders().map((o) => o.token);
    setTokens((prev) => {
      const merged = [...prev, ...stored];
      return [...new Set(merged)];
    });
    setMounted(true);
  }, []);
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

  const accountOrders = myOrdersQuery.data ?? [];

  // mounted=false means localStorage hasn't been read yet — show the same
  // loading state SSR rendered, so server and client agree on first paint.
  if (!mounted || ordersQuery.isLoading || myOrdersQuery.isPending) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center text-sm text-muted-foreground sm:px-6">
        Loading your order…
      </div>
    );
  }

  const allOrders = [
    ...(isSignedIn ? accountOrders : []),
    ...lookupOrders,
    ...(!isSignedIn ? orders : []),
  ].filter((o, i, arr) => arr.findIndex((x) => x.manage_token === o.manage_token) === i);

  if (!allOrders.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">No order found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {isSignedIn
            ? "You haven't placed any orders yet — today's menu is waiting."
            : "We couldn't find an order on this device. Use the lookup below with your manage token and contact details."}
        </p>
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6">
      {placed && (
        <div className="rounded-lg border border-border bg-primary/5 p-5 text-center">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Order placed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll see you soon
            {allOrders[0].customer?.name ? `, ${allOrders[0].customer.name}` : ""}. Pay in person at{" "}
            {allOrders[0].fulfilment === "pickup" ? "pickup" : "delivery"}.
          </p>
        </div>
      )}

      {allOrders.map((order) => (
        <SharedOrderCard
          key={order.manage_token}
          order={order}
          cutoffTime={cutoffTime}
          onCancel={() => setCancelToken(order.manage_token)}
        />
      ))}

      {isSignedIn !== true && (
        <LookupSection onFound={(o) => setLookupOrders((prev) => [o, ...prev])} />
      )}

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
            myOrdersQuery.refetch();
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
