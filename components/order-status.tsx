"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cancelOrder, getOrder, lookupOrder } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrderStatusDialog({
  order: initialOrder,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [token, setToken] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);

  const open = order !== null;

  async function doLookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const isEmail = contact.includes("@");
      const found = await lookupOrder({
        token,
        email: isEmail ? contact : undefined,
        phone: isEmail ? undefined : contact,
      });
      setOrder(found);
    } catch {
      toast.error("No order found for those details.");
    } finally {
      setBusy(false);
    }
  }

  async function doCancel() {
    if (!order || busy) return;
    setBusy(true);
    try {
      const updated = await cancelOrder(order.manage_token);
      setOrder(updated);
      toast.success("Order cancelled.");
    } catch {
      toast.error("Could not cancel — the cutoff may have passed.");
    } finally {
      setBusy(false);
    }
  }

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Your order
            <Badge variant={order.status === "cancelled" ? "destructive" : "default"}>
              {order.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Save this link to manage your order until the cutoff — pay in person.
          </DialogDescription>
        </DialogHeader>

        <dl className="space-y-1 text-sm">
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
        </dl>

        <Separator />

        <ul className="space-y-2 text-sm">
          {order.items.map((it, i) => (
            <li key={i} className="flex justify-between">
              <span>
                {it.quantity} × {it.name}
              </span>
              <span className="tabular-nums">
                {formatMoney(it.unit_price * it.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="flex justify-between font-medium">
          <span>Total (pay in person)</span>
          <span className="tabular-nums">{formatMoney(order.total)}</span>
        </div>

        {order.status !== "cancelled" ? (
          <Button variant="outline" onClick={doCancel} disabled={busy}>
            Cancel order
          </Button>
        ) : null}

        <p className="break-all text-xs text-muted-foreground">
          Manage token: {order.manage_token}
        </p>
      </DialogContent>
    </Dialog>
  );
}

export function FindOrderButton() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

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
      setOrder(found);
      setOpen(false);
    } catch {
      toast.error("No order found for those details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Find my order
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Find my order</DialogTitle>
            <DialogDescription>
              Enter the manage token from your confirmation plus the email or
              phone you used.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lookup-token">Manage token</Label>
              <Input id="lookup-token" required value={token} onChange={(e) => setToken(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lookup-contact">Email or phone</Label>
              <Input id="lookup-contact" required value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Looking up…" : "Find order"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <OrderStatusDialog order={order} onClose={() => setOrder(null)} />
    </>
  );
}

export async function fetchOrder(token: string): Promise<Order | null> {
  try {
    return await getOrder(token);
  } catch {
    return null;
  }
}
