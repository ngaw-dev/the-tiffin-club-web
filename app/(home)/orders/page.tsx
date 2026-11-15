"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { ArrowLeft, ChevronRight, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrder, getSettings, lookupOrder } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { getMyOrders } from "@/lib/account";
import { todayOrders } from "@/lib/order-store";
import { CancelOrderDialog } from "@/app/(home)/cancel-order-dialog";
import { useAuth } from "@clerk/nextjs";
import type { Fulfilment, Order, OrderStatus } from "@/lib/types";
import { OrderCard as SharedOrderCard } from "@/components/order-card";

export default function OrderPage() {
  return (
    <Suspense fallback={null}>
      <OrderClient />
    </Suspense>
  );
}

const stepTitles: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
};

/** Compact "step X of N — Current" summary for list rows. */
function stepSummary(status: OrderStatus, fulfilment: Fulfilment) {
  const steps =
    fulfilment === "pickup"
      ? ["placed", "confirmed", "ready_for_pickup", "completed"]
      : ["placed", "confirmed", "out_for_delivery", "completed"];
  const index = steps.indexOf(status);
  const current = index >= 0 ? status : "placed";
  return {
    label: stepTitles[current] ?? String(current),
    step: (index >= 0 ? index : 0) + 1,
    total: steps.length,
    pct: ((index >= 0 ? index : 0) / (steps.length - 1)) * 100,
  };
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
  // Client-side selection for the master-detail split; null only when the
  // list is empty (first order auto-selected once data arrives).
  const [selectedToken, setSelectedToken] = useState<string | null>(urlToken);

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
  // A disabled query stays pending forever (guests), so gate on isSignedIn.
  const loadingAccountOrders = isSignedIn === true && myOrdersQuery.isPending;
  if (!mounted || ordersQuery.isLoading || loadingAccountOrders) {
    return (
      <PageShell>
        <PageHeading count={null} />
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-[86px] w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </PageShell>
    );
  }

  const allOrders = [
    ...(isSignedIn ? accountOrders : []),
    ...lookupOrders,
    ...(!isSignedIn ? orders : []),
  ]
    .filter((o, i, arr) => arr.findIndex((x) => x.manage_token === o.manage_token) === i)
    .sort((a, b) => b.placed_at.localeCompare(a.placed_at));

  if (!allOrders.length) {
    return (
      <PageShell>
        <PageHeading count={0} />
        <div className="mx-auto max-w-md py-14 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary">
            <UtensilsCrossed className="size-6 text-muted-foreground" />
          </div>
          <h2 className="mt-5 font-display text-xl font-semibold">No order found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isSignedIn
              ? "You haven't placed any orders yet — today's menu is waiting."
              : "We couldn't find an order on this device. Use the lookup below with your manage token and contact details."}
          </p>
          <Button asChild className="mt-6 min-h-11">
            <Link href="/#todays-menu">Browse today&apos;s menu</Link>
          </Button>
          {isSignedIn !== true && (
            <LookupSection
              onFound={(o) => {
                setLookupOrders((prev) => [o, ...prev]);
                setSelectedToken(o.manage_token);
              }}
            />
          )}
        </div>
        <Toaster richColors position="top-center" />
      </PageShell>
    );
  }

  const selected = allOrders.find((o) => o.manage_token === selectedToken) ?? allOrders[0];

  return (
    <PageShell>
      <PageHeading count={allOrders.length} />

      {placed && (
        <div className="mb-6 rounded-lg border border-primary/25 bg-primary/5 p-5 text-center">
          <h2 className="font-display text-xl font-semibold sm:text-2xl">Order placed!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll see you soon
            {selected.customer?.name ? `, ${selected.customer.name}` : ""}. Pay in person at{" "}
            {selected.fulfilment === "pickup" ? "pickup" : "delivery"}.
          </p>
        </div>
      )}

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Left: order list (hidden on mobile once a detail is open) */}
        <div className={selectedToken ? "hidden md:block" : "block"}>
          <ul className="space-y-3">
            {allOrders.map((order) => {
              const done = order.status === "completed" || order.status === "cancelled";
              const summary = stepSummary(order.status, order.fulfilment);
              const active = order.manage_token === selected.manage_token;
              return (
                <li key={order.manage_token}>
                  <button
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() => setSelectedToken(order.manage_token)}
                    className={`group w-full rounded-lg border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0 ${
                      active
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-card hover:border-foreground/25 hover:bg-accent/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium">
                        {new Date(order.placed_at).toLocaleDateString(undefined, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="ttc-num font-semibold">{formatMoney(order.total)}</span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {order.fulfilment}
                      </Badge>
                      {done ? (
                        <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>
                          {order.status === "cancelled" ? "CANCELLED" : "COMPLETED"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1.5 capitalize">
                          <span className="relative flex size-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-primary" />
                          </span>
                          {summary.label}
                        </Badge>
                      )}
                      <ChevronRight
                        className={`ml-auto size-4 shrink-0 transition-transform duration-200 ${
                          active
                            ? "text-primary"
                            : "text-muted-foreground/50 group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                        }`}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {isSignedIn !== true && (
            <LookupSection
              onFound={(o) => {
                setLookupOrders((prev) => [o, ...prev]);
                setSelectedToken(o.manage_token);
              }}
            />
          )}
        </div>

        {/* Right: selected order details */}
        <div className={selectedToken ? "block" : "hidden md:block md:sticky md:top-24"}>
          {/* Mobile back-to-list affordance */}
          <Button
            variant="ghost"
            className="mb-2 min-h-11 px-2 md:hidden"
            onClick={() => setSelectedToken(null)}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to orders
          </Button>
          <SharedOrderCard
            key={selected.manage_token}
            order={selected}
            cutoffTime={cutoffTime}
            pickupAddress={settingsQuery.data?.pickup_address ?? null}
            onCancel={() => setCancelToken(selected.manage_token)}
            className=""
          />
        </div>
      </div>

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

      <div className="mt-8">
        <Button asChild variant="link">
          <Link href="/">Back to today&apos;s menu</Link>
        </Button>
      </div>
      <Toaster richColors position="top-center" />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">{children}</div>;
}

function PageHeading({ count }: { count: number | null }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        Your orders
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {count === null
          ? "Checking this device for your orders…"
          : count === 0
            ? "Nothing here yet."
            : "Track each tiffin from kitchen to doorstep."}
      </p>
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
