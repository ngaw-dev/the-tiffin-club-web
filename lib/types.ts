// Types mirroring api.md — the single source of truth for API shapes.

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | { error: string };
}

export interface MenuItem {
  /** Server-assigned id (from GET /menu/today); sent as items.*.id when ordering. */
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

export interface TodayMenu {
  status: "open" | "coming_soon";
  date: string | null;
  main: MenuItem | null;
  extras: MenuItem[];
  ordering: OrderingWindow;
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
