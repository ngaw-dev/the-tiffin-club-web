"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { ApiError, placeOrder } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Fulfilment, Order, StoreSettings } from "@/lib/types";

interface CheckoutSheetProps {
  settings: StoreSettings;
  orderingOpen: boolean;
  prefill?: {
    name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    suburb: string | null;
  };
  onPlaced: (order: Order) => void;
}

export function CheckoutSheet({ settings, orderingOpen, prefill, onPlaced }: CheckoutSheetProps) {
  const { lines, total, setQuantity, clear, toPayload } = useCart();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fulfilment, setFulfilment] = useState<Fulfilment>("pickup");
  const [form, setForm] = useState({
    name: prefill?.name ?? "",
    email: prefill?.email ?? "",
    phone: prefill?.phone ?? "",
    address: prefill?.address ?? "",
    suburb:
      prefill?.suburb && settings.delivery_suburbs.includes(prefill.suburb) ? prefill.suburb : "",
  });
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
      setOpen(false);
      onPlaced(order);
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="lg" className="w-full gap-2" disabled={!lines.length || !orderingOpen}>
          <ShoppingBag className="h-4 w-4" aria-hidden />
          {orderingOpen
            ? lines.length
              ? `Checkout · ${formatMoney(total)}`
              : "Cart is empty"
            : "Ordering closed"}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Checkout</SheetTitle>
          <SheetDescription>Pay in person when you collect or receive your order.</SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="flex flex-1 flex-col gap-4 px-4">
          {/* Cart lines */}
          <ul className="space-y-3">
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
                    onClick={() => setQuantity(item.id, quantity - 1)}
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
                    onClick={() => setQuantity(item.id, quantity + 1)}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <Separator />

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
            {fulfilment === "pickup" && settings.pickup_start_time ? (
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
                    {settings.delivery_suburbs.map((s) => (
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

          <div className="mt-auto" />
        </form>

        <SheetFooter className="mt-4">
          <div className="flex w-full items-center justify-between text-sm font-medium">
            <span>Total (pay in person)</span>
            <span className="tabular-nums">{formatMoney(total)}</span>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting || !lines.length}
            onClick={submit as unknown as React.MouseEventHandler}
          >
            {submitting ? "Placing order…" : `Place order · ${formatMoney(total)}`}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
