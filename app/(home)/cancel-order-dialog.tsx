"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cancelOrder } from "@/lib/api";

/** Confirmation dialog for cancelling an order. Confirm runs the DELETE. */
export function CancelOrderDialog({
  token,
  open,
  onOpenChange,
  cutoffTime,
  onCancelled,
}: {
  token: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** e.g. "12:30" — shown in the warning copy, when known. */
  cutoffTime?: string | null;
  onCancelled: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await cancelOrder(token);
      toast.success("Order cancelled.");
      onOpenChange(false);
      onCancelled();
    } catch {
      toast.error("Could not cancel — the cutoff may have passed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={busy ? undefined : onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cancel this order?</DialogTitle>
          <DialogDescription>
            Your tiffin order will be cancelled and won&apos;t be prepared. You won&apos;t be
            charged anything (payment happens in person). This can&apos;t be undone, but you can
            always place a new order
            {cutoffTime ? ` before the ${cutoffTime} cutoff` : " while the ordering window is open"}
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Keep order
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={busy}>
            {busy ? "Cancelling…" : "Yes, cancel order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
