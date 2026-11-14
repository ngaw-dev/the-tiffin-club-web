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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cancelOrder, lookupOrder } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";

/** Compact header link + dialog for finding an existing order. */
export function FindOrderLink() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);

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
      setStatusOpen(true);
    } catch {
      toast.error("No order found for those details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg px-3 py-2 text-sm font-medium underline-offset-4 hover:underline"
      >
        Find my order
      </button>
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
      <OrderStatusDialog
        order={order}
        open={statusOpen}
        onOpenChange={setStatusOpen}
      />
    </>
  );
}

export function OrderStatusDialog({
  order,
  open,
  onOpenChange,
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [current, setCurrent] = useState<Order | null>(order);
  const [busy, setBusy] = useState(false);

  const shown = current ?? order;
  if (!shown) return null;

  async function doCancel() {
    setBusy(true);
    try {
      const updated = await cancelOrder(shown!.manage_token);
      setCurrent(updated);
      toast.success("Order cancelled.");
    } catch {
      toast.error("Could not cancel — the cutoff may have passed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Your order
            <Badge variant={shown.status === "cancelled" ? "destructive" : "secondary"}>
              {shown.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Pay in person — this link manages your order until the cutoff.
          </DialogDescription>
        </DialogHeader>

        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Fulfilment</dt>
            <dd className="capitalize">{shown.fulfilment}</dd>
          </div>
          {shown.suburb ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Suburb</dt>
              <dd>{shown.suburb}</dd>
            </div>
          ) : null}
        </dl>

        <Separator />

        <ul className="space-y-2 text-sm">
          {shown.items.map((it, i) => (
            <li key={i} className="flex justify-between">
              <span>
                {it.quantity} × {it.name}
              </span>
              <span className="ttc-num">
                {formatMoney(it.unit_price * it.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="flex justify-between font-semibold">
          <span>Total (pay in person)</span>
          <span className="ttc-num">{formatMoney(shown.total)}</span>
        </div>

        {shown.status !== "cancelled" ? (
          <Button variant="outline" onClick={doCancel} disabled={busy}>
            Cancel order
          </Button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
