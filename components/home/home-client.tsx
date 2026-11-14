"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { formatMoney, formatTime } from "@/lib/format";
import { getSettings, getTodayMenu } from "@/lib/api";
import { contactFromSettings } from "@/lib/brand";
import { useCart } from "@/lib/cart-context";
import { OrderingStateBadge } from "@/components/home/ordering-state-badge";
import { ClosingSoonCountdown } from "@/components/home/closing-soon-countdown";
import { CheckoutSheet } from "@/components/home/checkout-sheet";
import { OrderStatusDialog } from "@/components/home/order-status";
import { usePrefill } from "@/components/home/sign-in";
import { Skeleton } from "@/components/ui/skeleton";
import type { MenuItem, Order } from "@/lib/types";

// Stand-in photographs (to be replaced with the kitchen's own photos)
const HERO_IMG =
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=70";
const KITCHEN_IMG =
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=70";
const MENU_IMG =
  "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=70";

export function HomeClient() {
  const { lines, total, setQuantity } = useCart();
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [statusOpen, setStatusOpen] = useState(false);

  const menuQuery = useQuery({
    queryKey: ["menu", "today"],
    queryFn: getTodayMenu,
  });
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });
  const { data: prefill } = usePrefill();

  const menu = menuQuery.data ?? null;
  const settings = settingsQuery.data ?? null;
  const contact = contactFromSettings(settings);

  const ordering = menu?.ordering ?? null;
  const orderable = ordering?.state === "open" || ordering?.state === "closing_soon";
  const windowLabel =
    ordering?.opens_at && ordering?.closes_at
      ? `${formatTime(ordering.opens_at)}-${formatTime(ordering.closes_at)}`
      : null;

  const dishes: MenuItem[] = (menu?.main ? [menu.main, ...menu.extras] : (menu?.extras ?? [])).map(
    (item, i) => ({ ...item, id: i + 1 }), // positional ids per order API
  );
  const [mainItem, ...extras] = dishes;

  const onPlaced = (order: Order) => {
    setPlacedOrder(order);
    setStatusOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Today&apos;s meal, ordered simply.
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
            One kitchen, one honest home-style tiffin a day.
            {windowLabel ? ` Order by ${windowLabel.split("-")[1]},` : ""} pick up or get it
            delivered in Wellington.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href="#todays-menu"
              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-6 py-2.5 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98]"
            >
              Order today&apos;s meal
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              How it works
            </a>
          </div>
        </div>
        <div className="group overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMG}
            alt="A home-style Indian meal served in steel tiffin containers"
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </section>

      {/* Today's menu */}
      <section aria-labelledby="todays-menu" className="pb-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="todays-menu" className="font-display text-2xl font-semibold sm:text-3xl">
            Today&apos;s Menu
          </h2>
          {windowLabel && (
            <span className="text-sm text-muted-foreground ttc-num">Ordering {windowLabel} NZ</span>
          )}
        </div>

        {menuQuery.isPending ? (
          <div className="mt-6 space-y-3" aria-busy="true" aria-label="Loading menu">
            <Skeleton className="h-72 w-full rounded-lg" />
          </div>
        ) : menuQuery.isError ? (
          <div className="mt-6 border border-border bg-card p-6 text-sm text-muted-foreground">
            We couldn&apos;t load today&apos;s menu just now. Please refresh in a moment
            {contact.phoneHref ? (
              <>
                {" "}
                or call us at{" "}
                <a className="text-primary underline underline-offset-4" href={contact.phoneHref}>
                  {contact.phone}
                </a>
              </>
            ) : null}
            .
          </div>
        ) : !menu || menu.status === "coming_soon" ? (
          <div className="mt-6 border border-border bg-card p-8 text-center">
            <OrderingStateBadge
              ordering={
                ordering ?? {
                  state: "closed",
                  open: false,
                  closing_soon: false,
                  opens_at: null,
                  closes_at: null,
                }
              }
            />
            <p className="mt-4 font-medium">No menu published for today yet.</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Today&apos;s menu will be published soon — check back later.
            </p>
          </div>
        ) : ordering?.state === "closed" ? (
          <div className="mt-6 border border-border bg-card p-8 text-center">
            <OrderingStateBadge ordering={ordering} />
            <p className="mt-4 font-medium">Today&apos;s ordering is closed.</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Today&apos;s meals are already being prepared. Come back tomorrow to order. Need
              something today?
              {contact.phoneHref ? (
                <>
                  {" "}
                  Call{" "}
                  <a href={contact.phoneHref} className="text-primary underline underline-offset-4">
                    {contact.phone}
                  </a>
                  .
                </>
              ) : null}
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            {/* Menu card */}
            <article className="border border-border bg-card">
              <div className="group h-56 w-full overflow-hidden sm:h-72">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={MENU_IMG}
                  alt={mainItem?.name ?? "Today's meal"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-6">
                {ordering && <OrderingStateBadge ordering={ordering} />}
                {mainItem ? (
                  <>
                    <h3 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
                      {mainItem.name}
                    </h3>
                    {mainItem.description ? (
                      <p className="mt-2 text-sm sm:text-base">{mainItem.description}</p>
                    ) : null}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Main meal
                        </p>
                        <p className="font-display text-2xl font-semibold ttc-num">
                          {formatMoney(mainItem.price)}
                        </p>
                      </div>
                      <QuantityStepper
                        value={lines.find((l) => l.item.id === mainItem.id)?.quantity ?? 0}
                        onChange={(q) => setQuantity(mainItem.id, q)}
                        disabled={!orderable}
                        label={`Quantity of ${mainItem.name}`}
                      />
                    </div>
                  </>
                ) : null}

                {extras.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      Extras
                    </h4>
                    <ul className="mt-3 divide-y divide-border">
                      {extras.map((extra) => (
                        <li
                          key={extra.id}
                          className="flex flex-wrap items-center justify-between gap-3 py-3"
                        >
                          <div className="min-w-0">
                            <p className="font-medium">{extra.name}</p>
                            {extra.description ? (
                              <p className="text-sm text-muted-foreground">{extra.description}</p>
                            ) : null}
                            <p className="mt-0.5 text-sm font-semibold ttc-num">
                              {formatMoney(extra.price)}
                            </p>
                          </div>
                          <QuantityStepper
                            value={lines.find((l) => l.item.id === extra.id)?.quantity ?? 0}
                            onChange={(q) => setQuantity(extra.id, q)}
                            disabled={!orderable}
                            label={`Quantity of ${extra.name}`}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>

            {/* Summary */}
            <aside className="h-fit border border-border bg-card p-6 lg:sticky lg:top-24">
              <h3 className="font-display text-lg font-semibold">Your tiffin</h3>
              {lines.length === 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Add the main meal and any extras to get started.
                </p>
              )}
              {lines.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm">
                  {lines.map((line) => (
                    <li key={line.item.id} className="flex justify-between gap-3">
                      <span>
                        {line.quantity} × {line.item.name}
                      </span>
                      <span className="ttc-num">
                        {formatMoney(line.item.price * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex justify-between border-t border-border pt-4 font-semibold">
                <span>Total</span>
                <span className="ttc-num">{formatMoney(total)}</span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Pay in person at pickup or delivery.
              </p>

              {ordering?.state === "closing_soon" && ordering.closes_at && (
                <div className="mt-4">
                  <ClosingSoonCountdown closesAt={ordering.closes_at} />
                </div>
              )}

              {settings && (
                <div className="mt-5">
                  <CheckoutSheet
                    settings={settings}
                    orderingOpen={!!orderable}
                    prefill={prefill ?? undefined}
                    onPlaced={onPlaced}
                  />
                </div>
              )}
              {!orderable && lines.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Checkout is available while ordering is open
                  {windowLabel ? ` (${windowLabel} NZ)` : ""}.
                </p>
              )}
            </aside>
          </div>
        )}
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-24 py-14">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">How it works</h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
          <div className="group overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={KITCHEN_IMG}
              alt="Meals being prepared in the kitchen"
              className="aspect-[3/4] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <ol className="space-y-8">
            {[
              ...(windowLabel
                ? [
                    {
                      title: `Order by ${windowLabel.split("-")[1]}`,
                      body: `Today's menu goes live at ${windowLabel.split("-")[0]}. Order any time until ${windowLabel.split("-")[1]}, so decisions stay simple.`,
                    },
                  ]
                : [
                    {
                      title: "Place your order",
                      body: "Today's menu goes live each morning and ordering stays open all day, so decisions stay simple.",
                    },
                  ]),
              {
                title: "Pickup or delivery",
                body: `Collect from us${contact.pickupWindow ? ` between ${contact.pickupWindow}` : ""}, or get it delivered. No delivery fees.`,
              },
              {
                title: "Pay in person",
                body: "No cards online. Pay when you collect, or when we knock on your door.",
              },
            ].map((step, i) => (
              <li key={step.title} className="flex gap-5">
                <span
                  aria-hidden
                  className="font-display text-3xl font-semibold text-primary ttc-num"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 pb-16">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Common questions</h2>
        <div className="mt-6 divide-y divide-border border border-border bg-card">
          {[
            ...(windowLabel
              ? [
                  {
                    q: "What time can I order?",
                    a: `Ordering runs ${windowLabel}, every day. After ${windowLabel.split("-")[1]} the kitchen locks in the prep list.`,
                  },
                ]
              : []),
            {
              q: "Can I change or cancel my order?",
              a: `Yes. You can update any detail or cancel${windowLabel ? ` until the ${windowLabel.split("-")[1]} cutoff` : ""} from your manage-order link. After that, give us a call.`,
            },
            {
              q: "How do I pay?",
              a: "In person, at pickup or delivery. No online payment. What you see on your order total is what you pay.",
            },
            {
              q: "Where do you deliver?",
              a: "We deliver to selected suburbs — the list is in checkout. We time the delivery run, so there's no need to pick a slot.",
            },
          ].map((item) => (
            <details key={item.q} className="group px-6 py-4">
              <summary className="cursor-pointer list-none font-medium marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span
                    aria-hidden
                    className="text-muted-foreground transition group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <OrderStatusDialog order={placedOrder} open={statusOpen} onOpenChange={setStatusOpen} />
      <Toaster richColors position="top-center" />
    </div>
  );
}

function QuantityStepper({
  value,
  onChange,
  disabled,
  label,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-background">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={disabled || value === 0}
        onClick={() => onChange(value - 1)}
        className="flex h-11 w-11 items-center justify-center rounded-l-lg text-lg font-semibold text-secondary-foreground hover:bg-secondary disabled:opacity-40 cursor-pointer"
      >
        −
      </button>
      <span aria-live="polite" className="w-10 text-center font-semibold ttc-num">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        disabled={disabled || value >= 20}
        onClick={() => onChange(value + 1)}
        className="flex h-11 w-11 items-center justify-center rounded-r-lg text-lg font-semibold text-secondary-foreground hover:bg-secondary disabled:opacity-40 cursor-pointer"
      >
        +
      </button>
    </div>
  );
}
