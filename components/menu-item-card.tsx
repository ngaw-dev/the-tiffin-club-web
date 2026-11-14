"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { MenuItem } from "@/lib/types";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const { addItem, setQuantity, lines } = useCart();
  const line = lines.find((l) => l.item.id === item.id);

  return (
    <article
      className="flex items-start justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm"
      aria-label={item.name}
    >
      <div className="min-w-0">
        <h3 className="font-medium leading-tight">{item.name}</h3>
        {item.description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {line ? (
          <div className="flex items-center gap-1" role="group" aria-label={`Quantity for ${item.name}`}>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label={`Remove one ${item.name}`}
              onClick={() => setQuantity(item.id, line.quantity - 1)}
            >
              <Minus className="h-4 w-4" aria-hidden />
            </Button>
            <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
              {line.quantity}
            </span>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label={`Add one ${item.name}`}
              disabled={line.quantity >= 20}
              onClick={() => setQuantity(item.id, line.quantity + 1)}
            >
              <Plus className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={() => addItem(item)} disabled={item.price < 0}>
            Add
          </Button>
        )}
      </div>
    </article>
  );
}
