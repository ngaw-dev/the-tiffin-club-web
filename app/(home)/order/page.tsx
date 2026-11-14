"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cancelOrder } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function OrderPage() {
  return (
    <Suspense fallback={null}>
      <OrderClient />
    </Suspense>
  );
}

function OrderClient() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const name = params.get("name") ?? "";
  const fulfilment = params.get("fulfilment") ?? "pickup";
  const suburb = params.get("suburb") ?? "";
  const total = Number(params.get("total") ?? "0");
  const items = params.get("items") ?? "";
  const placed = params.get("placed") === "1";

  const [status, setStatus] = useState("placed");
  const [busy, setBusy] = useState(false);

  const lines: { quantity: number; name: string; lineTotal: number }[] = items
    ? items.split(";").map((s) => {
        const [quantity, itemName, lineTotal] = s.split("~");
        return { quantity: Number(quantity), name: itemName, lineTotal: Number(lineTotal) };
      })
    : [];

  async function doCancel() {
    setBusy(true);
    try {
      await cancelOrder(token);
      setStatus("cancelled");
      toast.success("Order cancelled.");
    } catch {
      toast.error("Could not cancel — the cutoff may have passed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-16 pt-10 sm:px-6">
      {placed && (
        <div className="rounded-lg border border-border bg-primary/5 p-5 text-center">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Order placed!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll see you soon{name ? `, ${name}` : ""}. Pay in person at{" "}
            {fulfilment === "pickup" ? "pickup" : "delivery"}.
          </p>
        </div>
      )}

      <section className="mt-8 border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          Your order
          <Badge variant={status === "cancelled" ? "destructive" : "secondary"}>{status}</Badge>
        </h2>

        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Fulfilment</dt>
            <dd className="capitalize">{fulfilment}</dd>
          </div>
          {suburb ? (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Suburb</dt>
              <dd>{suburb}</dd>
            </div>
          ) : null}
          {token ? (
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Manage token</dt>
              <dd className="font-mono">{token}</dd>
            </div>
          ) : null}
        </dl>

        {lines.length > 0 && (
          <>
            <Separator className="my-4" />
            <ul className="space-y-2 text-sm">
              {lines.map((it, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {it.quantity} × {it.name}
                  </span>
                  <span className="ttc-num">{formatMoney(it.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="flex justify-between font-semibold">
              <span>Total (pay in person)</span>
              <span className="ttc-num">{formatMoney(total)}</span>
            </div>
          </>
        )}

        {status !== "cancelled" && token && (
          <Button variant="outline" className="mt-5" onClick={doCancel} disabled={busy}>
            {busy ? "Cancelling…" : "Cancel order"}
          </Button>
        )}
      </section>

      <div className="mt-6">
        <Button asChild variant="link">
          <Link href="/">Back to today&apos;s menu</Link>
        </Button>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  );
}
