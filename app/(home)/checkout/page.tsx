"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { getSettings, getTodayMenu } from "@/lib/api";
import { ApiError, placeOrder } from "@/lib/api";
import { useCart } from "@/lib/cart-context";
import { formatTime } from "@/lib/format";
import { usePrefill } from "@/lib/account";
import { useAuth, useUser } from "@clerk/nextjs";
import { rememberOrder } from "@/lib/order-store";
import type { Fulfilment } from "@/lib/types";
import { FulfilmentSelector } from "@/components/checkout/fulfilment-selector";
import {
  GuestDetailsForm,
  emptyCheckoutForm,
  type CheckoutForm,
} from "@/components/checkout/guest-details-form";
import { CheckoutItems } from "@/components/checkout/checkout-items";
import { OrderSummary } from "@/components/checkout/order-summary";

export default function CheckoutPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();
  const { lines, total, setQuantity, clear, toPayload } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [fulfilment, setFulfilment] = useState<Fulfilment>("pickup");

  const settingsQuery = useQuery({ queryKey: ["settings"], queryFn: getSettings });
  const settings = settingsQuery.data ?? null;
  const menuQuery = useQuery({ queryKey: ["menu", "today"], queryFn: getTodayMenu });
  const ordering = menuQuery.data?.ordering ?? null;
  const orderable = ordering?.state === "open" || ordering?.state === "closing_soon";

  const { data: prefill } = usePrefill();

  const [form, setForm] = useState<CheckoutForm>(emptyCheckoutForm);
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

  const set = (k: keyof CheckoutForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setFieldErrors((e) => ({ ...e, [k]: "" }));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});
    try {
      const order = await placeOrder(
        {
          fulfilment,
          name: form.name,
          email: form.email || undefined,
          phone: form.phone || undefined,
          address: fulfilment === "delivery" ? form.address : undefined,
          suburb: fulfilment === "delivery" ? form.suburb : undefined,
          items: toPayload(),
        },
        (await getToken()) ?? undefined,
      );

      // Keep the Clerk profile in sync with the name given at checkout:
      // first token is the first name, the rest is the last name.
      if (user && form.name.trim()) {
        const [firstName, ...rest] = form.name.trim().split(/\s+/);
        try {
          await user.update({ firstName, lastName: rest.join(" ") || "" });
        } catch {
          // Non-blocking: order placement already succeeded.
        }
      }

      toast.success("Order placed! We'll see you soon.");
      clear();
      rememberOrder(order.manage_token);
      router.push(`/orders?token=${order.manage_token}&placed=1`);
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
        </Link>{" "}
        <Toaster richColors position="top-center" />
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
          <FulfilmentSelector
            fulfilment={fulfilment}
            onSelect={setFulfilment}
            pickupDetail={
              settings?.pickup_start_time
                ? `Any time ${settings.pickup_start_time}–${settings.pickup_end_time}. Pay in person.`
                : null
            }
          />

          <GuestDetailsForm
            form={form}
            fulfilment={fulfilment}
            deliverySuburbs={settings?.delivery_suburbs ?? []}
            fieldErrors={fieldErrors}
            onChange={set}
          />

          <CheckoutItems lines={lines} onQuantityChange={setQuantity} />
        </div>

        <OrderSummary lines={lines} total={total} fulfilment={fulfilment} submitting={submitting} />
      </form>

      <Toaster richColors position="top-center" />
    </div>
  );
}
