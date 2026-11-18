"use client";

// components/todays-menu.tsx

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

// Stand-in photograph (to be replaced with the kitchen's own photos). Shows
// a dal in copper handis — the closest match to a typical main meal; keep it
// honest by swapping it when the menu is a visibly different dish.
export const MENU_IMG =
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=70";

/**
 * The "Today's Menu" section of the home page: heading, ordering states
 * (loading / error / not published / closed), the menu card (main + extras),
 * and the tiffin summary. Presentational — data and cart actions come in as
 * props. The card is one surface: dish photograph, the meal and its extras,
 * and the summary band with checkout — no card inside a card.
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
    <section aria-labelledby="todays-menu">
      <div className="flex flex-wrap items-baseline justify-between gap-[var(--space-xs)]">
        <h2 id="todays-menu" className="font-display text-title font-semibold">
          Today&apos;s menu
        </h2>
        {windowLabel && (
          <span className="text-sm text-muted-foreground ttc-num">Ordering {windowLabel} NZ</span>
        )}
      </div>

      {loading ? (
        <div className="mt-[var(--space-lg)] space-y-3" aria-busy="true" aria-label="Loading menu">
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      ) : loadError ? (
        <div className="mt-[var(--space-lg)] rounded-lg border border-border bg-card p-[var(--space-xl)] text-sm text-muted-foreground">
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
        <div className="mt-[var(--space-lg)] rounded-lg border border-border bg-card p-[var(--space-xl)] text-center">
          <OrderingStateBadge ordering={ordering ?? closedWindow} />
          <p className="mt-[var(--space-md)] font-medium">No menu published for today yet.</p>
          <p className="mt-[var(--space-2xs)] text-sm text-muted-foreground">
            Today&apos;s menu will be published soon — check back later.
          </p>
        </div>
      ) : ordering?.state === "closed" ? (
        <div className="mt-[var(--space-lg)] rounded-lg border border-border bg-card p-[var(--space-xl)] text-center">
          <OrderingStateBadge ordering={ordering} />
          <p className="mt-[var(--space-md)] font-medium">Today&apos;s ordering is closed.</p>
          <p className="mt-[var(--space-2xs)] text-sm text-muted-foreground">
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
        <article className="mt-[var(--space-lg)] overflow-hidden rounded-[var(--radius-card)] border border-border bg-card shadow-card">
          <div className="aspect-[21/9] w-full overflow-hidden max-sm:aspect-[4/3]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={MENU_IMG}
              alt={mainItem?.name ?? "Today's meal"}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>

          <div className="p-[var(--space-lg)] sm:p-[var(--space-xl)]">
            {ordering && <OrderingStateBadge ordering={ordering} />}
            {mainItem ? (
              <>
                <h3 className="mt-[var(--space-md)] font-display text-2xl font-semibold sm:text-3xl">
                  {mainItem.name}
                </h3>
                {mainItem.description ? (
                  <p className="mt-[var(--space-2xs)] max-w-[45ch] text-muted-foreground">
                    {mainItem.description}
                  </p>
                ) : null}

                {/* The price is the offer — set at the item-title scale beside
                    its stepper. */}
                <div className="mt-[var(--space-lg)] flex flex-wrap items-center justify-between gap-[var(--space-md)] border-t border-border pt-[var(--space-lg)]">
                  <div>
                    <p className="text-sm text-muted-foreground">Main meal</p>
                    <p className="font-display text-title font-semibold ttc-num">
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
              <div className="mt-[var(--space-lg)]">
                <h4 className="text-sm text-muted-foreground">Extras</h4>
                <ul className="mt-[var(--space-xs)] divide-y divide-border">
                  {extras.map((extra) => (
                    <li
                      key={extra.id}
                      className="flex flex-wrap items-center justify-between gap-[var(--space-sm)] py-[var(--space-sm)]"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{extra.name}</p>
                        {extra.description ? (
                          <p className="text-sm text-muted-foreground">{extra.description}</p>
                        ) : null}
                        <p className="mt-[var(--space-3xs)] text-sm font-semibold ttc-num">
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

          {/* Summary band: the cart lives at the foot of the same card. */}
          <div className="border-t border-border bg-secondary px-[var(--space-lg)] py-[var(--space-lg)] sm:px-[var(--space-xl)]">
            <h3 className="font-display text-lg font-semibold">Your tiffin</h3>
            {lines.length === 0 && (
              <p className="mt-[var(--space-xs)] text-sm text-muted-foreground">
                Add the main meal and any extras to get started.
              </p>
            )}
            {lines.length > 0 && (
              <ul className="mt-[var(--space-xs)] space-y-[var(--space-2xs)] text-sm">
                {lines.map((line) => (
                  <li key={line.item.id} className="flex justify-between gap-[var(--space-sm)]">
                    <span>
                      {line.quantity} × {line.item.name}
                    </span>
                    <span className="ttc-num">{formatMoney(line.item.price * line.quantity)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-[var(--space-md)] flex justify-between border-t border-border pt-[var(--space-md)] font-semibold">
              <span>Total</span>
              <span className="ttc-num">{formatMoney(total)}</span>
            </div>
            <p className="mt-[var(--space-2xs)] text-xs text-muted-foreground">
              Pay in person at pickup or delivery.
            </p>

            {ordering?.state === "closing_soon" && ordering.closes_at && (
              <div className="mt-[var(--space-md)]">
                <ClosingSoonCountdown closesAt={ordering.closes_at} />
              </div>
            )}

            {lines.length && orderable ? (
              <div className="mt-[var(--space-lg)]">
                <Button asChild size="lg" className="w-full">
                  <Link href="/checkout">Checkout · {formatMoney(total)}</Link>
                </Button>
              </div>
            ) : (
              <div className="mt-[var(--space-lg)]">
                <Button size="lg" className="w-full" disabled>
                  {orderable ? "Cart is empty" : "Ordering closed"}
                </Button>
              </div>
            )}
            {!orderable && lines.length > 0 && (
              <p className="mt-[var(--space-2xs)] text-xs text-muted-foreground">
                Checkout is available while ordering is open
                {windowLabel ? ` (${windowLabel} NZ)` : ""}.
              </p>
            )}
          </div>
        </article>
      )}
    </section>
  );
}
