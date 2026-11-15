"use client";

import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/quantity-stepper";
import { OrderingStateBadge } from "@/app/(home)/ordering-state-badge";
import { ClosingSoonCountdown } from "@/app/(home)/closing-soon-countdown";
import { formatMoney } from "@/lib/format";
import type { MenuItem, OrderingWindow } from "@/lib/types";

/** A line in the cart as consumed by presentational components. */
export interface CartLine {
  item: MenuItem;
  quantity: number;
}

// Stand-in photograph (to be replaced with the kitchen's own photos)
export const MENU_IMG =
  "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=70";

/**
 * The "Today's Menu" section of the home page: heading, ordering states
 * (loading / error / not published / closed), the menu card (main + extras),
 * and the tiffin summary aside. Presentational — data and cart actions come
 * in as props.
 */
export function TodayMenuSection({
  loading,
  loadError,
  menuPublished,
  ordering,
  windowLabel,
  mainItem,
  extras,
  lines,
  total,
  orderable,
  contact,
  onQuantityChange,
}: {
  loading: boolean;
  loadError: boolean;
  /** A menu exists for today and is not `coming_soon`. */
  menuPublished: boolean;
  ordering: OrderingWindow | null;
  windowLabel: string | null;
  mainItem: MenuItem | null;
  extras: MenuItem[];
  lines: CartLine[];
  total: number;
  orderable: boolean;
  contact: { phone: string | null; phoneHref: string | null };
  onQuantityChange: (item: MenuItem, next: number) => void;
}) {
  const closedWindow: OrderingWindow = {
    state: "closed",
    open: false,
    closing_soon: false,
    opens_at: null,
    closes_at: null,
  };

  return (
    <section aria-labelledby="todays-menu" className="pb-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="todays-menu" className="font-display text-2xl font-semibold sm:text-3xl">
          Today&apos;s Menu
        </h2>
        {windowLabel && (
          <span className="text-sm text-muted-foreground ttc-num">Ordering {windowLabel} NZ</span>
        )}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3" aria-busy="true" aria-label="Loading menu">
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      ) : loadError ? (
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
      ) : !menuPublished ? (
        <div className="mt-6 border border-border bg-card p-8 text-center">
          <OrderingStateBadge ordering={ordering ?? closedWindow} />
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
                      onChange={(q) => onQuantityChange(mainItem, q)}
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
                          onChange={(q) => onQuantityChange(extra, q)}
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
                    <span className="ttc-num">{formatMoney(line.item.price * line.quantity)}</span>
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

            {lines.length && orderable ? (
              <div className="mt-5">
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Checkout · {formatMoney(total)}</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-5">
                <Button size="lg" className="w-full" disabled>
                  {orderable ? "Cart is empty" : "Ordering closed"}
                </Button>
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
  );
}
