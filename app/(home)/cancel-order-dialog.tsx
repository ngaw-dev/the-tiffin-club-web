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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cancel this order?</DialogTitle>
          <DialogDescription>
            This can&apos;t be undone.
            {cutoffTime ? ` You can cancel until ${cutoffTime}.` : ""}
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
