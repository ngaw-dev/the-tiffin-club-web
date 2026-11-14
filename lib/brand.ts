import type { OrderingState, StoreSettings } from "./types";

export const RESTAURANT = {
  name: "The Tiffin Club",
  area: "Wellington",
};

/** Contact + hours derived from the public settings API (no hardcoded fallback). */
export interface ContactInfo {
  phone: string | null;
  phoneHref: string | null;
  altPhone: string | null;
  altPhoneHref: string | null;
  pickupWindow: string | null;
}

function telHref(number: string): string {
  return `tel:${number.replace(/[^+\d]/g, "")}`;
}

/** "18:00" → "6:00 PM"; null if missing. */
export function time12h(hhmm: string | null): string | null {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  const suffix = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${hr}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
}

export function contactFromSettings(s: StoreSettings | null): ContactInfo {
  return {
    phone: s?.store_phone ?? null,
    phoneHref: s?.store_phone ? telHref(s.store_phone) : null,
    altPhone: s?.store_phone_alternate ?? null,
    altPhoneHref: s?.store_phone_alternate ? telHref(s.store_phone_alternate) : null,
    pickupWindow:
      s?.pickup_start_time && s?.pickup_end_time
        ? `${time12h(s.pickup_start_time)}-${time12h(s.pickup_end_time)}`
        : null,
  };
}

export const STATE_LABEL: Record<string, string> = {
  open: "Ordering open",
  closing_soon: "Closing soon",
  closed: "Ordering closed",
};

/** Tailwind classes per ordering state (text label always shown alongside). */
export const STATE_CLASSES: Record<string, string> = {
  open: "bg-accent/10 text-accent border-accent/30",
  closing_soon: "bg-primary/10 text-primary border-primary/30",
  closed: "bg-muted text-muted-foreground border-border",
};
