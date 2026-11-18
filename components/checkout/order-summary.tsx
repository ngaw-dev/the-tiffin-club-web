"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import type { CartLine } from "@/components/checkout/checkout-items";

/** Checkout aside: line totals, pay-in-person note, and the place-order action. */
export function OrderSummary({
  lines,
  total,
  fulfilment,
  address,
  mapUrl,
  submitting,
}: {
  lines: CartLine[];
  total: number;
  fulfilment: "pickup" | "delivery";
  address?: string | null;
  mapUrl?: string | null;
  submitting?: boolean;
}) {
  return (
    <aside className="h-fit rounded-lg bg-secondary p-6 lg:sticky lg:top-24">
      <h2 className="font-display text-title">Order summary</h2>
      <ul className="mt-4 space-y-2.5 text-sm">
        {lines.map((line) => (
          <li key={line.item.id} className="flex justify-between gap-3">
            <span>
              {line.quantity} × {line.item.name}
            </span>
            <span className="ttc-num">{formatMoney(line.item.price * line.quantity)}</span>
          </li>
        ))}
      </ul>
      {/* The total is the offer: set big in the display face, on its own rule. */}
      <div className="mt-5 flex items-baseline justify-between border-t border-border pt-5">
        <span className="font-display text-lg">Total</span>
        <span className="font-display text-2xl ttc-num">{formatMoney(total)}</span>
      </div>
      {address ? (
        <p className="mt-4 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {fulfilment === "pickup" ? "Pickup" : "Delivery"}:
          </span>{" "}
          {mapUrl ? (
            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-primary"
            >
              {address}
            </a>
          ) : (
            address
          )}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-muted-foreground">
        Pay in person at {fulfilment === "pickup" ? "pickup" : "delivery"}.
      </p>

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="mt-6 min-h-11 w-full rounded-lg font-semibold"
      >
        {submitting ? "Placing order…" : `Place ${fulfilment} order · ${formatMoney(total)}`}
      </Button>
      <p className="mt-3 text-xs text-muted-foreground">
        Need to change something?{" "}
        <Link href="/" className="text-primary underline underline-offset-4">
          Back to today&apos;s menu
        </Link>
        .
      </p>
    </aside>
  );
}
