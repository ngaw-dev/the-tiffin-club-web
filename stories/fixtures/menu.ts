import type { MenuItem, OrderingWindow, StoreSettings, TodayMenu } from "@/lib/types";

export const orderingWindows: Record<string, OrderingWindow> = {
  open: {
    state: "open",
    open: true,
    closing_soon: false,
    opens_at: "09:00",
    closes_at: "13:00",
  },
  closing_soon: {
    state: "closing_soon",
    open: true,
    closing_soon: true,
    opens_at: "09:00",
    closes_at: "13:00",
  },
  closed: {
    state: "closed",
    open: false,
    closing_soon: false,
    opens_at: "09:00",
    closes_at: "13:00",
  },
};

export const menuMain: MenuItem = {
  id: 1,
  name: "Butter Chicken Thali",
  description: "Slow-cooked butter chicken with jeera rice, dal tadka, and two rotis.",
  price: 1600,
};

export const menuExtras: MenuItem[] = [
  {
    id: 2,
    name: "Extra Rotis (2)",
    description: "Two fresh tandoor rotis.",
    price: 300,
  },
  {
    id: 3,
    name: "Gulab Jamun",
    description: "Two warm gulab jamun.",
    price: 400,
  },
];

/** Menu-shaped fixture with positional ids already assigned. */
export const todaysMenu: { main: MenuItem; extras: MenuItem[] } & Omit<
  TodayMenu,
  "main" | "extras"
> = {
  status: "open",
  date: "2026-11-15",
  main: menuMain,
  extras: menuExtras,
  ordering: orderingWindows.open,
};

export const settings: StoreSettings = {
  delivery_suburbs: ["Te Aro", "Mount Cook", "Brooklyn", "Thorndon"],
  order_cutoff_time: "13:00",
  pickup_start_time: "16:30",
  pickup_end_time: "19:00",
  store_phone: "+64 4 555 0123",
  store_phone_alternate: "",
  store_email: "hello@thetiffinclub.nz",
};

export const contact = {
  phone: settings.store_phone,
  phoneHref: `tel:${settings.store_phone.replace(/\s/g, "")}`,
};

export const cartLines = [
  { item: menuMain, quantity: 1 },
  { item: menuExtras[0], quantity: 2 },
];
