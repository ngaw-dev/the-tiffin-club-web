"use client";

import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, MapPin, Phone, Mail, ChefHat } from "lucide-react";
import { OrderingStatusBanner } from "@/components/ordering-status-banner";
import { MenuItemCard } from "@/components/menu-item-card";
import { CheckoutSheet } from "@/components/checkout-sheet";
import { FindOrderButton, OrderStatusDialog } from "@/components/order-status";
import { SignInButton, getToken } from "@/components/sign-in";
import { getPrefill } from "@/lib/api";
import { formatMoney, formatTime } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import type { AccountPrefill, MenuItem, Order, StoreSettings, TodayMenu } from "@/lib/types";

interface HomeClientProps {
  menu: TodayMenu | null;
  settings: StoreSettings | null;
}

export function HomeClient({ menu, settings }: HomeClientProps) {
  const { count } = useCart();
  const [prefill, setPrefill] = useState<AccountPrefill | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getPrefill(token)
      .then(setPrefill)
      .catch(() => localStorage.removeItem("tiffin-club-token"));
  }, []);

  const orderingOpen = menu?.ordering.state === "open" || menu?.ordering.state === "closing_soon";

  const dishes = useMemo(() => {
    const withId = (menu?.main ? [menu.main, ...menu.extras] : menu?.extras ?? []) as MenuItem[];
    return withId.map((item, i) => ({ ...item, id: i + 1 })); // positional ids per order API
  }, [menu]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <a href="#" className="flex items-center gap-2 font-semibold tracking-tight">
            <ChefHat className="h-5 w-5 text-primary" aria-hidden />
            The Tiffin Club
          </a>
          <nav className="flex items-center gap-1" aria-label="Account and orders">
            <FindOrderButton />
            <SignInButton onSignedIn={setPrefill} />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b bg-gradient-to-b from-primary/10 to-background">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
            <h1 className="mx-auto max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Home-style tiffin, fresh daily
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Order before the cutoff, pay in person. Pickup and delivery
              available.
            </p>
            <div className="mt-6 flex justify-center">
              <Button size="lg" asChild>
                <a href="#menu">See today&apos;s menu</a>
              </Button>
            </div>
            {menu ? (
              <div className="mt-6 flex justify-center">
                <OrderingStatusBanner ordering={menu.ordering} />
              </div>
            ) : null}
          </div>
        </section>

        {/* Menu */}
        <section id="menu" className="mx-auto w-full max-w-3xl px-4 py-12" aria-labelledby="menu-heading">
          <h2 id="menu-heading" className="text-2xl font-semibold tracking-tight">
            {menu?.date ? `Today · ${menu.date}` : "Today's menu"}
          </h2>

          {!menu || menu.status === "coming_soon" ? (
            <p className="mt-4 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              Today&apos;s menu is being prepared — check back soon.
            </p>
          ) : dishes.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              No dishes published for today yet.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {dishes.map((item, i) => (
                <div key={item.id}>
                  {i === 0 && menu.main ? (
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-primary">
                      Today&apos;s main
                    </p>
                  ) : i === (menu.main ? 1 : 0) && menu.extras.length ? (
                    <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Extras
                    </p>
                  ) : null}
                  <MenuItemCard item={item} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Info */}
        {settings ? (
          <section aria-labelledby="info-heading" className="border-t bg-muted/40">
            <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:grid-cols-3">
              <div>
                <h2 id="info-heading" className="sr-only">Store information</h2>
                <h3 className="flex items-center gap-2 font-medium"><Clock className="h-4 w-4 text-primary" aria-hidden /> Pickup</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {settings.pickup_start_time && settings.pickup_end_time
                    ? `${formatTime(settings.pickup_start_time)} – ${formatTime(settings.pickup_end_time)}`
                    : "Call us for pickup times."}
                </p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-medium"><MapPin className="h-4 w-4 text-primary" aria-hidden /> Delivery</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {settings.delivery_suburbs.length
                    ? settings.delivery_suburbs.join(" · ")
                    : "Contact us about delivery."}
                </p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 font-medium"><Phone className="h-4 w-4 text-primary" aria-hidden /> Contact</h3>
                <p className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <span className="block">{settings.store_phone}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" aria-hidden /> {settings.store_email}</span>
                </p>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      {/* Sticky cart bar (mobile) / checkout */}
      {menu && settings ? (
        <div className="sticky bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto max-w-3xl">
            <CheckoutSheet
              settings={settings}
              orderingOpen={!!orderingOpen}
              prefill={prefill ?? undefined}
              onPlaced={setPlacedOrder}
            />
          </div>
        </div>
      ) : null}

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>The Tiffin Club · Home-style meals, made daily</p>
      </footer>

      <OrderStatusDialog order={placedOrder} onClose={() => setPlacedOrder(null)} />
      <Toaster richColors position="top-center" />
    </div>
  );
}
