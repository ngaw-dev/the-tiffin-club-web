// Types mirroring api.md — the single source of truth for API shapes.

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | { error: string };
}

export interface MenuItem {
  /**
   * The API's menu response omits ids; the order endpoint requires integer
   * ids matching the 1-based position on today's menu (main=1, then extras).
   */
  id: number;
  name: string;
  description: string | null;
  price: number; // cents
}

export type OrderingState = "open" | "closed" | "closing_soon";

export interface OrderingWindow {
  state: OrderingState;
  open: boolean;
  closing_soon: boolean;
  opens_at: string | null; // HH:MM
  closes_at: string | null; // HH:MM
}

export interface RawMenuItem {
  name: string;
  description: string | null;
  price: number; // cents
}

export interface TodayMenu {
  status: "open" | "coming_soon";
  date: string | null;
  main: RawMenuItem | null;
  extras: RawMenuItem[];
  ordering: OrderingWindow;
}

/** Assign positional ids (main=1, then extras) as the order API expects. */
export function withIds(
  menu: TodayMenu,
): TodayMenu & { main: MenuItem | null; extras: MenuItem[] } {
  let next = 1;
  return {
    ...menu,
    main: menu.main ? { ...menu.main, id: next++ } : null,
    extras: menu.extras.map((e) => ({ ...e, id: next++ })),
  };
}

export interface StoreSettings {
  delivery_suburbs: string[];
  order_cutoff_time: string; // HH:MM
  pickup_start_time: string | null;
  pickup_end_time: string | null;
  pickup_address: string | null;
  pickup_map_url: string | null;
  store_phone: string;
  store_phone_alternate: string;
  store_email: string;
}

export type Fulfilment = "pickup" | "delivery";

export interface OrderItem {
  name: string;
  description: string;
  price: number; // cents
  quantity: number;
  unit_price: number; // cents
}

// Literal statuses known from API.md; the API is the source of truth and may
// return values we don't know about yet, so unknown strings stay assignable.
export type OrderStatus =
  | ("placed" | "confirmed" | "ready_for_pickup" | "out_for_delivery" | "completed" | "cancelled")
  | (string & {});

export interface OrderCustomer {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  suburb: string | null;
}

export interface Order {
  manage_token: string;
  status: OrderStatus;
  fulfilment: Fulfilment;
  /** Live customer details at read time; absent if not eager-loaded. */
  customer?: OrderCustomer;
  delivery_notes: string | null;
  items: OrderItem[];
  total: number; // cents
  payment: string;
  placed_at: string; // ISO-8601
  expires_at: string; // ISO-8601
}

/** Flat convenience accessor — customer fields may be absent entirely. */
export function orderContact(order: Order): {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  suburb: string | null;
} {
  return {
    name: order.customer?.name ?? null,
    email: order.customer?.email ?? null,
    phone: order.customer?.phone ?? null,
    address: order.customer?.address ?? null,
    suburb: order.customer?.suburb ?? null,
  };
}

export interface PlaceOrderInput {
  fulfilment: Fulfilment;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  suburb?: string; // required for delivery
  delivery_notes?: string;
  items: { id: number; quantity: number }[]; // quantity 1–20
}

export interface AccountPrefill {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  suburb: string | null;
}
