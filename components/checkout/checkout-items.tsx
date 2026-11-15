"use client";

import { QuantityStepper } from "@/components/quantity-stepper";
import { formatMoney } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

/** A line in the cart as consumed by presentational components. */
export interface CartLine {
  item: MenuItem;
  quantity: number;
}

/** Checkout section: review items and tweak quantities before placing. */
export function CheckoutItems({
  lines,
  onQuantityChange,
}: {
  lines: CartLine[];
  onQuantityChange: (item: MenuItem, next: number) => void;
}) {
  return (
    <section className="border border-border bg-card p-6">
      <h2 className="font-display text-lg font-semibold">Your items</h2>
      <ul className="mt-4 divide-y divide-border">
        {lines.map(({ item, quantity }) => (
          <li key={item.id} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground ttc-num">
                {formatMoney(item.price)} each
              </p>
            </div>
            <QuantityStepper
              value={quantity}
              onChange={(q) => onQuantityChange(item, q)}
              label={`Quantity of ${item.name}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
