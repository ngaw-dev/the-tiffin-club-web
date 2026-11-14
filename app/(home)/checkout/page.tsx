"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus } from "lucide-react";
import { getSettings, ApiError, placeOrder } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { formatMoney } from "@/lib/format";
import { usePrefill } from "@/app/(home)/sign-in";
import { OrderStatusDialog } from "@/app/(home)/order-status";
import type { Fulfilment, Order } from "@/lib/types";

export default function CheckoutPage() {
  const { lines, total, setQuantity, clear, toPayload } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [fulfilment, setFulfilment] = useState<Fulfilment>("pickup");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  const settingsQuery = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const settings = settingsQuery.data ?? null;
  const { data: prefill } = usePrefill();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    suburb: "",
  });
  const [prefilled, setPrefilled] = useState(false);
  if (prefill && !prefilled) {
    setPrefilled(true);
    setForm((f) => ({
      ...f,
      name: prefill.name ?? f.name,
      email: prefill.email ?? f.email,
      phone: prefill.phone ?? f.phone,
      address: prefill.address ?? f.address,
      suburb:
        settings && prefill.suburb && settings.delivery_suburbs.includes(prefill.suburb)
          ? prefill.suburb
          : f.suburb,
    }));
  }
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setFieldErrors((e) => ({ ...e, [k]: "" }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    try {
      const order = await placeOrder({
        fulfilment,
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: fulfilment === "delivery" ? form.address : undefined,
        suburb: fulfilment === "delivery" ? form.suburb : undefined,
        items: toPayload(),
      });
      toast.success("Order placed! We'll see you soon.");
      clear();
      setPlacedOrder(order);
      setStatusOpen(true);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.status === 422 && apiErr.ordering) {
        toast.error("Ordering is closed for today.");
      } else if (apiErr && Object.keys(apiErr.fieldErrors).length) {
        setFieldErrors(apiErr.fieldErrors);
        toast.error(apiErr.message || "Please fix the highlighted fields.");
      } else {
        toast.error(apiErr?.message ?? "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const err = (k: string) =>
    fieldErrors[k] ? <p className="text-sm text-destructive">{fieldErrors[k]}</p> : null;

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold">Your tiffin is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add the main meal and any extras from today&apos;s menu.
        </p>
        <Button asChild size="lg" className="mt-6">
          <Link href="/">Back to today&apos;s menu</Link>
        </Button>
        <OrderStatusDialog order={placedOrder} open={statusOpen} onOpenChange={setStatusOpen} />
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <div className="flex items-baseline justify-between gap-4 py-8">
        <h1 className="font-display text-3xl font-semibold">Checkout</h1>
        <Link
          href="/"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          ← Back to menu
        </Link>
      </div>

      <div className="grid gap-8 pb-16 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="space-y-6" id="checkout-form">
          {/* Fulfilment */}
          <div className="space-y-2">
            <Label>Fulfilment</Label>
            <RadioGroup
              value={fulfilment}
              onValueChange={(v) => setFulfilment(v as Fulfilment)}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <RadioGroupItem value="pickup" id="fulfilment-pickup" />
                <Label htmlFor="fulfilment-pickup" className="font-normal">
                  Pickup
                </Label>
              </div>
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <RadioGroupItem value="delivery" id="fulfilment-delivery" />
                <Label htmlFor="fulfilment-delivery" className="font-normal">
                  Delivery
                </Label>
              </div>
            </RadioGroup>
            {fulfilment === "pickup" && settings?.pickup_start_time ? (
              <p className="text-sm text-muted-foreground">
                Pickup window: {settings.pickup_start_time}–{settings.pickup_end_time}
              </p>
            ) : null}
          </div>

          {/* Contact */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              autoComplete="name"
            />
            {err("name")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              autoComplete="email"
            />
            {err("email")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone")(e.target.value)}
              autoComplete="tel"
            />
            {err("phone")}
            <p className="text-xs text-muted-foreground">
              Email or phone — at least one is required.
            </p>
          </div>

          {/* Delivery details */}
          {fulfilment === "delivery" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => set("address")(e.target.value)}
                  autoComplete="street-address"
                />
                {err("address")}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="suburb">Suburb</Label>
                <Select value={form.suburb} onValueChange={set("suburb")}>
                  <SelectTrigger id="suburb">
                    <SelectValue placeholder="Choose your suburb" />
                  </SelectTrigger>
                  <SelectContent>
                    {settings?.delivery_suburbs.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {err("suburb")}
              </div>
            </>
          ) : null}
        </form>

        {/* Order summary */}
        <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Your tiffin</h2>
          <ul className="mt-3 space-y-3">
            {lines.map(({ item, quantity }) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">{formatMoney(item.price)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    aria-label={`Remove one ${item.name}`}
                    onClick={() => setQuantity(item, quantity - 1)}
                  >
                    <Minus className="h-4 w-4" aria-hidden />
                  </Button>
                  <span className="w-8 text-center tabular-nums">{quantity}</span>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    aria-label={`Add one ${item.name}`}
                    disabled={quantity >= 20}
                    onClick={() => setQuantity(item, quantity + 1)}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <Separator className="my-4" />

          <div className="flex items-center justify-between text-sm font-medium">
            <span>Total (pay in person)</span>
            <span className="tabular-nums">{formatMoney(total)}</span>
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-4 w-full"
            form="checkout-form"
            disabled={submitting}
          >
            {submitting ? "Placing order…" : `Place order · ${formatMoney(total)}`}
          </Button>
        </aside>
      </div>

      <OrderStatusDialog order={placedOrder} open={statusOpen} onOpenChange={setStatusOpen} />
      <Toaster richColors position="top-center" />
    </div>
  );
}
