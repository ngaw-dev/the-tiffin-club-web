"use client";
/* Hallmark · theme: brand (kept) · redesign: full · scope: app
 * the docket: the order's journey is the visual head, set at title scale, with the existing FulfilmentStepper beneath
 * critique: weakest S, the docket is set apart by being a tinted ruled sheet, not another bordered card */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import type { Fulfilment, Order, OrderStatus } from "@/lib/types";
import { FulfilmentStepper } from "@/app/(home)/fulfilment-stepper";

const stepTitles: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
};

/** Compact "step X of N" summary; shared with the /orders ledger rows. */
export function stepSummary(status: OrderStatus, fulfilment: Fulfilment) {
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

/** Shared order docket used by /order (manage) and /orders (account history). */
export function OrderCard({
  order,
  cutoffTime = null,
  storePhone = null,
  pickupAddress = null,
  pickupMapUrl = null,
  onCancel,
  className = "mt-8",
}: {
  order: Order;
  cutoffTime?: string | null;
  storePhone?: string | null;
  pickupAddress?: string | null;
  pickupMapUrl?: string | null;
  onCancel?: () => void;
  className?: string;
}) {
  const cancelled = order.status === "cancelled";
  const cancellable = order.status !== "cancelled" && order.status !== "completed";
  // Orders past expiry (23:59:59 order day) can no longer be managed.
  // Expiry is checked at click time (Date.now() is impure during render).
  // The button is hidden for cancelled/completed orders only; expired orders
  // surface a "too late" toast if clicked after the deadline.
  const summary = stepSummary(order.status, order.fulfilment);

  return (
    // A tinted well, not a card: the docket is paper of a different rung than the ruled ledger beside it.
    <section className={`bg-secondary p-6 sm:p-8 ${className}`}>
      {/* The status word below is the head; the badge stays only where it
          carries a warning (CANCELLED). */}
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted-foreground">Your order</p>
        {cancelled && <Badge variant="destructive">CANCELLED</Badge>}
      </div>
      {/* The journey is the head: status at title scale, its step count beneath. */}
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight">
        {cancelled ? "Cancelled" : summary.label}
      </p>
      {!cancelled && (
        <p className="mt-1 ttc-num text-sm text-muted-foreground">
          Step {summary.step} of {summary.total}
        </p>
      )}

      {cancelled && (
        <div className="mt-4 border-l-2 border-destructive px-4 py-3 text-sm text-destructive">
          This order was cancelled.
        </div>
      )}
      <div className="mt-5">
        <FulfilmentStepper status={order.status} fulfilment={order.fulfilment} />
      </div>

      <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Fulfilment</dt>
          <dd className="capitalize">{order.fulfilment}</dd>
        </div>
        {order.fulfilment === "pickup" ? (
          pickupAddress ? (
            <div className="flex justify-between gap-3">
              <dt className="shrink-0 text-muted-foreground">Pickup address</dt>
              <dd className="min-w-0 break-words text-right">
                {pickupMapUrl ? (
                  <a
                    href={pickupMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    {pickupAddress}
                  </a>
                ) : (
                  pickupAddress
                )}
              </dd>
            </div>
          ) : null
        ) : order.customer?.address ? (
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">Delivery address</dt>
            <dd className="min-w-0 break-words text-right">
              {[order.customer.address, order.customer.suburb].filter(Boolean).join(", ")}
            </dd>
          </div>
        ) : null}
      </dl>

      <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
        {order.items.map((it, i) => (
          <li key={i} className="flex justify-between gap-3">
            <span className="min-w-0 break-words">
              {it.quantity} × {it.name}
            </span>
            <span className="ttc-num shrink-0">{formatMoney(it.unit_price * it.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-border pt-4">
        <span className="min-w-0 font-display text-lg">Total (pay in person)</span>
        <span className="ttc-num shrink-0 font-display text-xl font-semibold">
          {formatMoney(order.total)}
        </span>
      </div>

      {cancellable && onCancel && (
        <Button
          variant="link"
          onClick={() => {
            // Re-check at click time — expiry may have passed since render.
            if (new Date(order.expires_at).getTime() > Date.now()) onCancel();
          }}
          className="mt-5 min-h-11 px-0 text-sm font-normal text-muted-foreground underline-offset-4 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:opacity-80 disabled:cursor-not-allowed disabled:opacity-55"
        >
          Cancel order
          {cutoffTime ? ` (until ${cutoffTime})` : ""}
        </Button>
      )}
      {!cancellable && !cancelled && storePhone && (
        <a
          href={`tel:${storePhone.replace(/\s+/g, "")}`}
          className="mt-5 inline-block text-sm font-normal text-muted-foreground underline underline-offset-4 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:text-primary"
        >
          Need to change this order? Contact us ({storePhone})
        </a>
      )}
    </section>
  );
}
