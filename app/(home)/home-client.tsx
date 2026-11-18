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
import { Visit } from "@/app/(home)/blocks/visit";
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
    () => (menu?.main ? [menu.main, ...menu.extras] : (menu?.extras ?? [])),
    [menu],
  );
  const [mainItem, ...extras] = dishes;

  // The main meal is the default — pre-seed one into the cart once today's
  // menu loads (no-op if it's already there or the user changed the quantity).
  useEffect(() => {
    if (mainItem) addItem(mainItem, 1);
  }, [mainItem, addItem]);

  return (
    <>
      <div className="shell">
        {/* Counter hero: the text block and the live menu card share the first
            screen — the card is the hero visual, not a photograph. */}
        <div className="grid gap-[var(--space-2xl)] py-[var(--space-xl)] lg:grid-cols-[5fr_7fr] lg:items-start lg:py-[var(--space-2xl)]">
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
        </div>

        {/* How it works */}
        <HowItWorks windowLabel={windowLabel} contact={contact} />

        {/* FAQ */}
        <Faq windowLabel={windowLabel} />
      </div>

      {/* Close: the order again, with hours and the address. Outside .shell so
          its bg-secondary band bleeds edge-to-edge; it carries its own .shell. */}
      <Visit windowLabel={windowLabel} contact={contact} />

      <Toaster richColors position="top-center" />
    </>
  );
}
