"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { formatTime } from "@/lib/format";
import { getSettings, getTodayMenu } from "@/lib/api";
import { contactFromSettings } from "@/lib/brand";
import { useCart } from "@/lib/cart-context";
import { Hero } from "@/app/(home)/blocks/hero";
import { HowItWorks } from "@/app/(home)/blocks/how-it-works";
import { Faq } from "@/app/(home)/blocks/faq";
import { TodayMenuSection } from "@/components/todays-menu";
import type { MenuItem } from "@/lib/types";

export function HomeClient() {
  const { lines, total, setQuantity, addItem } = useCart();

  const menuQuery = useQuery({
    queryKey: ["menu", "today"],
    queryFn: getTodayMenu,
  });
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });
  const menu = menuQuery.data ?? null;
  const settings = settingsQuery.data ?? null;
  const contact = contactFromSettings(settings);

  const ordering = menu?.ordering ?? null;
  const orderable = ordering?.state === "open" || ordering?.state === "closing_soon";
  const windowLabel =
    ordering?.opens_at && ordering?.closes_at
      ? `${formatTime(ordering.opens_at)}-${formatTime(ordering.closes_at)}`
      : null;

  // Memoized so `mainItem` keeps a stable identity across renders — the
  // pre-seed effect below depends on it and would re-fire every render
  // if the array/object were rebuilt each time (addItem is a no-op then,
  // but React still warns on unstable effect deps).
  const dishes: MenuItem[] = useMemo(
    () =>
      (menu?.main ? [menu.main, ...menu.extras] : (menu?.extras ?? [])).map(
        (item, i) => ({ ...item, id: i + 1 }), // positional ids per order API
      ),
    [menu],
  );
  const [mainItem, ...extras] = dishes;

  // The main meal is the default — pre-seed one into the cart once today's
  // menu loads (no-op if it's already there or the user changed the quantity).
  useEffect(() => {
    if (mainItem) addItem(mainItem, 1);
  }, [mainItem, addItem]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      {/* Hero */}
      <Hero windowLabel={windowLabel} />

      <TodayMenuSection
        loading={menuQuery.isPending}
        loadError={menuQuery.isError}
        menuPublished={!!menu && menu.status !== "coming_soon"}
        ordering={ordering}
        windowLabel={windowLabel}
        mainItem={mainItem ?? null}
        extras={extras}
        lines={lines}
        total={total}
        orderable={orderable}
        contact={{ phone: contact.phone, phoneHref: contact.phoneHref }}
        onQuantityChange={setQuantity}
      />

      {/* How it works */}
      <HowItWorks windowLabel={windowLabel} contact={contact} />

      {/* FAQ */}
      <Faq windowLabel={windowLabel} />

      <Toaster richColors position="top-center" />
    </div>
  );
}
