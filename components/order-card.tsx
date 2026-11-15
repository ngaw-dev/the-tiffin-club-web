"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";
import { FulfilmentStepper } from "@/app/(home)/fulfilment-stepper";

/** Shared order card used by /order (manage) and /orders (account history). */
export function OrderCard({
  order,
  cutoffTime = null,
  pickupAddress = null,
  pickupMapUrl = null,
  onCancel,
  className = "mt-8",
}: {
  order: Order;
  cutoffTime?: string | null;
  pickupAddress?: string | null;
  pickupMapUrl?: string | null;
  onCancel?: () => void;
  className?: string;
}) {
  const cancelled = order.status === "cancelled";
  // Orders past expiry (23:59:59 order day) can no longer be managed.
  // Expiry is checked at click time (Date.now() is impure during render).
  // The button is hidden for cancelled orders only; expired orders surface
  // a "too late" toast if clicked after the deadline.

  return (
    <Card className={`rounded-lg ${className}`}>
      <CardHeader className="p-6 pb-0">
        <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold">
          Your order
          <Badge variant={cancelled ? "destructive" : "secondary"}>
            {order.status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        {cancelled && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            This order was cancelled.
          </div>
        )}
        <FulfilmentStepper status={order.status} fulfilment={order.fulfilment} />
        <dl className="mt-6 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Fulfilment</dt>
            <dd className="capitalize">{order.fulfilment}</dd>
          </div>
          {order.fulfilment === "pickup" ? (
            pickupAddress ? (
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-muted-foreground">Pickup address</dt>
                <dd className="text-right">
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
              <dd className="text-right">
                {[order.customer.address, order.customer.suburb]
                  .filter(Boolean)
                  .join(", ")}
              </dd>
            </div>
          ) : null}
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

        {!cancelled && onCancel && (
          <Button
            variant="link"
            onClick={() => {
              // Re-check at click time — expiry may have passed since render.
              if (new Date(order.expires_at).getTime() > Date.now()) onCancel();
            }}
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
