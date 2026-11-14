"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSettings, getTodayMenu } from "@/lib/api";
import { ApiError, placeOrder } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { formatMoney, formatTime } from "@/lib/format";
import { usePrefill } from "@/app/(home)/sign-in";
import { rememberOrder } from "@/lib/order-store";
import type { Fulfilment } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, total, setQuantity, clear, toPayload } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [fulfilment, setFulfilment] = useState<Fulfilment>("pickup");

  const settingsQuery = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const settings = settingsQuery.data ?? null;
  const menuQuery = useQuery({ queryKey: ["menu", "today"], queryFn: getTodayMenu });
  const ordering = menuQuery.data?.ordering ?? null;
  const orderable = ordering?.state === "open" || ordering?.state === "closing_soon";

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
      rememberOrder(order.manage_token);
      router.push(`/order?token=${order.manage_token}&placed=1`);
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
    fieldErrors[k] ? <p className="mt-1 text-sm text-destructive">{fieldErrors[k]}</p> : null;

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-display text-3xl font-semibold">Your tiffin is empty</h1>
        <p className="mt-3 text-muted-foreground">
          Head back to today&apos;s menu to add the main meal and any extras.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
        >
          View today&apos;s menu
        </Link>        <Toaster richColors position="top-center" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        No online payment. You&apos;ll pay in person at pickup or delivery.
      </p>

      {!orderable && ordering && (
        <div className="mt-6 border border-border bg-card p-5 text-sm">
          {ordering.opens_at && ordering.closes_at
            ? `Ordering is currently closed. Ordering is open ${formatTime(ordering.opens_at)}-${formatTime(ordering.closes_at)} NZ.`
            : "We couldn't confirm the ordering window. Please try again shortly."}
        </div>
      )}

      <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* Fulfilment */}
          <section className="border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Pickup or delivery?</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FulfilmentOption
                selected={fulfilment === "pickup"}
                onSelect={() => setFulfilment("pickup")}
                icon="bag"
                title="Pickup"
                detail={
                  settings?.pickup_start_time
                    ? `Any time ${settings.pickup_start_time}–${settings.pickup_end_time}. Pay in person.`
                    : "Pay in person."
                }
              />
              <FulfilmentOption
                selected={fulfilment === "delivery"}
                onSelect={() => setFulfilment("delivery")}
                icon="scooter"
                title="Delivery"
                detail="We time the run. No delivery fees. Pay in person."
              />
            </div>
          </section>

          {/* Your details */}
          <section className="border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold">Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Name" required htmlFor="name">
                <Input
                  id="name"
                  required
                  autoComplete="name"
                  className="mt-1.5 min-h-11 rounded-lg px-3.5"
                  value={form.name}
                  onChange={(e) => set("name")(e.target.value)}
                />
                {err("name")}
              </Field>
              <Field
                label="Phone"
                htmlFor="phone"
                hint="Email or phone — at least one is required."
              >
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  className="mt-1.5 min-h-11 rounded-lg px-3.5"
                  value={form.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                />
                {err("phone")}
              </Field>
              <Field label="Email (optional)" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="mt-1.5 min-h-11 rounded-lg px-3.5"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                />
                {err("email")}
              </Field>
            </div>

            {fulfilment === "delivery" && (
              <div className="mt-4 grid gap-4">
                <Field label="Delivery address" required htmlFor="address">
                  <Textarea
                    id="address"
                    required
                    rows={2}
                    className="mt-1.5 min-h-11 rounded-lg px-3.5 resize-y"
                    value={form.address}
                    onChange={(e) => set("address")(e.target.value)}
                  />
                  {err("address")}
                </Field>
                <Field label="Suburb" required htmlFor="suburb">
                  <Select
                    required
                    value={form.suburb || undefined}
                    onValueChange={(v) => set("suburb")(v)}
                  >
                    <SelectTrigger
                      id="suburb"
                      className="mt-1.5 min-h-11 w-full rounded-lg px-3.5"
                    >
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
                </Field>
              </div>
            )}
          </section>

          {/* Items */}
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
                    onChange={(q) => setQuantity(item, q)}
                    label={`Quantity of ${item.name}`}
                  />
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {lines.map((line) => (
              <li key={line.item.id} className="flex justify-between gap-3">
                <span>
                  {line.quantity} × {line.item.name}
                </span>
                <span className="ttc-num">{formatMoney(line.item.price * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-semibold">
            <span>Total</span>
            <span className="ttc-num">{formatMoney(total)}</span>
          </div>
          <p className="mt-2 rounded-lg bg-secondary px-3 py-2.5 text-xs text-secondary-foreground">
            Pay in person at {fulfilment === "pickup" ? "pickup" : "delivery"}.
          </p>

          <Button
            type="submit"
            size="lg"
            disabled={submitting}
            className="mt-5 min-h-11 w-full rounded-lg font-semibold"
          >
            {submitting ? "Placing order…" : `Place order · ${formatMoney(total)}`}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Need to change something?{" "}
            <Link href="/" className="text-primary underline underline-offset-4">
              Back to today&apos;s menu
            </Link>
            .
          </p>
        </aside>
      </form>

      <Toaster richColors position="top-center" />
    </div>
  );
}

function FulfilmentOption({
  selected,
  onSelect,
  icon,
  title,
  detail,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: "bag" | "scooter";
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`border p-4 text-left transition hover:-translate-y-0.5 ${
        selected
          ? "border-primary bg-primary/5 ring-2 ring-ring"
          : "border-border bg-background hover:bg-secondary/60"
      }`}
    >
      <OptionIcon name={icon} />
      <p className="mt-1.5 font-semibold">{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
    </button>
  );
}

/** Simple geometric icons so the page never leans on emoji. */
function OptionIcon({ name }: { name: "bag" | "scooter" }) {
  const cls = "h-5 w-5 text-primary";
  if (name === "scooter") {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={cls}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="5.5" cy="17.5" r="2.5" />
        <circle cx="18.5" cy="17.5" r="2.5" />
        <path d="M8 17.5h8M12 17.5 9 8H6.5" />
        <path d="M12 17.5l3-6h3.5" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cls}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 8h14l-1 12H6L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function Field({
  label,
  required,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && (
          <span className="text-primary" aria-hidden>
            {" "}
            *
          </span>
        )}
      </Label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function QuantityStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-background">
      <Button
        type="button"
        variant="ghost"
        aria-label={`Decrease ${label}`}
        disabled={value === 0}
        onClick={() => onChange(value - 1)}
        className="h-11 w-11 rounded-l-lg rounded-r-none border-0 text-lg font-semibold text-secondary-foreground hover:bg-secondary disabled:opacity-40"
      >
        −
      </Button>
      <span aria-live="polite" className="w-10 text-center font-semibold ttc-num">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        aria-label={`Increase ${label}`}
        disabled={value >= 20}
        onClick={() => onChange(value + 1)}
        className="h-11 w-11 rounded-r-lg rounded-l-none border-0 text-lg font-semibold text-secondary-foreground hover:bg-secondary disabled:opacity-40"
      >
        +
      </Button>
    </div>
  );
}
