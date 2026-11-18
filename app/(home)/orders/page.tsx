"use client";
/* Hallmark · theme: brand (kept) · redesign: full · scope: app · genre: editorial
 * shape: Ledger · the orders list is dated receipt rows ruled by hairlines, the detail pane is the day's docket
 * signature: the order's journey as the docket's visual head, the stepper beneath it
 * critique: weakest S, an order-tracking screen could serve any shop; it reads as this one through the tiffin copy and the pay-in-person rule */
/* Hallmark · dismissed 49 · the lookup line is the kept copy and may wrap to two lines in its ruled row */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { ArrowLeft, ChevronRight, UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrder, getSettings, lookupOrder } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { getMyOrders } from "@/lib/account";
import { todayOrders } from "@/lib/order-store";
import { CancelOrderDialog } from "@/app/(home)/cancel-order-dialog";
import { useAuth } from "@clerk/nextjs";
import type { Order } from "@/lib/types";
import { OrderCard as SharedOrderCard, stepSummary } from "@/components/order-card";

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
        {/* Loading reads as the ledger itself: ruled rows, then the docket. */}
        <div aria-hidden className="mt-10 border-t border-border">
          {[0, 1].map((i) => (
            <div key={i} className="border-b border-border py-4">
              <Skeleton className="h-5 w-2/5 rounded-none" />
              <Skeleton className="mt-2 h-4 w-1/4 rounded-none" />
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Skeleton className="h-72 w-full rounded-none" />
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
        {/* The empty state is a ruled section of the ledger, not a centred card. */}
        <section className="mt-10 border-t border-border pt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-title">No order found</h2>
            <UtensilsCrossed aria-hidden className="size-5 shrink-0 text-muted-foreground" />
          </div>
          <p className="mt-3 max-w-[45ch] text-sm text-muted-foreground">
            {isSignedIn
              ? "You haven't placed any orders yet — today's menu is waiting."
              : "We couldn't find an order on this device. Use the lookup below with your manage token and contact details."}
          </p>
          <Button asChild className="mt-6 min-h-11">
            <Link href="/#todays-menu">Browse today&apos;s menu</Link>
          </Button>
          {/* The empty ledger keeps its ruled-lines motif (as in loading) so
              the section reads as an empty page of the ledger, not a bare
              heading and button. */}
          <div aria-hidden className="mt-10 border-t border-border">
            <div className="border-b border-border py-7" />
            <div className="border-b border-border py-7" />
          </div>
        </section>
        {isSignedIn !== true && (
          <LookupSection
            onFound={(o) => {
              setLookupOrders((prev) => [o, ...prev]);
              setSelectedToken(o.manage_token);
            }}
          />
        )}
        <Toaster richColors position="top-center" />
      </PageShell>
    );
  }

  const selected = allOrders.find((o) => o.manage_token === selectedToken) ?? allOrders[0];

  return (
    <PageShell>
      <PageHeading count={allOrders.length} />

      {placed && (
        <div className="mt-8 border-l-2 border-primary bg-secondary px-5 py-4">
          <h2 className="font-display text-title">Order placed!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll see you soon
            {selected.customer?.name ? `, ${selected.customer.name}` : ""}. Pay in person at{" "}
            {selected.fulfilment === "pickup" ? "pickup" : "delivery"}.
          </p>
        </div>
      )}

      <div className="mt-10 grid items-start gap-x-12 gap-y-10 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Left: the ledger — dated receipt rows under hairlines (hidden on mobile once a detail is open) */}
        <div className={selectedToken ? "hidden md:block" : "block"}>
          <ul className="border-t border-border">
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
                    className={`group -mx-3 w-[calc(100%+1.5rem)] border-b border-border px-3 py-4 text-left outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:bg-secondary ${
                      active ? "bg-secondary" : "hover:bg-secondary/60"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-md">
                        {new Date(order.placed_at).toLocaleDateString(undefined, {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="ttc-num text-sm font-semibold">
                        {formatMoney(order.total)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
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
                            <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex size-2 rounded-full bg-primary" />
                          </span>
                          {summary.label}
                        </Badge>
                      )}
                      <ChevronRight
                        aria-hidden
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

          {/* The lookup continues the ledger: its collapsed row reads as one
              more ruled entry, not a dangling link. */}
          {isSignedIn !== true && (
            <LookupSection
              onFound={(o) => {
                setLookupOrders((prev) => [o, ...prev]);
                setSelectedToken(o.manage_token);
              }}
            />
          )}
        </div>

        {/* Right: the day's docket — the selected order */}
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
            storePhone={settingsQuery.data?.store_phone ?? null}
            pickupAddress={settingsQuery.data?.pickup_address ?? null}
            pickupMapUrl={settingsQuery.data?.pickup_map_url ?? null}
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

      <div className="mt-12 border-t border-border pt-6">
        <Button asChild variant="link" className="min-h-11 px-0">
          <Link href="/">Back to today&apos;s menu</Link>
        </Button>
      </div>
      <Toaster richColors position="top-center" />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell pb-24 pt-12">
      <div className="mx-auto max-w-5xl">{children}</div>
    </div>
  );
}

function PageHeading({ count }: { count: number | null }) {
  return (
    <div>
      <h1 className="max-w-[20ch] font-display text-section tracking-tight">Your orders</h1>
      <p className="mt-3 text-muted-foreground">
        {count === null
          ? "Checking this device for your orders…"
          : count === 0
            ? "Nothing here yet."
            : "Track each tiffin from kitchen to doorstep."}
      </p>
    </div>
  );
}

/** Manual token+contact lookup for orders placed on another device. A ruled
    section of the ledger, collapsed by default. */
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
    <section>
      {open ? (
        <form onSubmit={submit} className="max-w-md space-y-5 border-b border-border py-6">
          <div>
            <h2 className="font-display text-title">Ordered on another device?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the manage token from your confirmation plus the email or phone you used.
            </p>
          </div>
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
            <Button
              type="submit"
              className="min-h-11 disabled:cursor-not-allowed disabled:opacity-55"
              disabled={busy}
            >
              {busy ? "Looking up…" : "Find order"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-11 disabled:cursor-not-allowed disabled:opacity-55"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Close
            </Button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between gap-3 border-b border-border py-4 text-left text-sm text-ink-2 outline-none transition-colors duration-200 hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:bg-secondary"
        >
          Ordered on another device? Find your order
          <ChevronRight aria-hidden className="size-4 shrink-0 text-muted-foreground/50" />
        </button>
      )}
    </section>
  );
}
