// Types mirroring api.md — the single source of truth for API shapes.

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]> | { error: string };
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
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

export type OrderStatus = "placed" | "cancelled" | string;

export interface Order {
  manage_token: string;
  status: OrderStatus;
  fulfilment: Fulfilment;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  suburb: string | null;
  items: OrderItem[];
  total: number; // cents
  payment: string;
  placed_at: string; // ISO-8601
  expires_at: string; // ISO-8601
}

export interface PlaceOrderInput {
  fulfilment: Fulfilment;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  suburb?: string; // required for delivery
  items: { id: number; quantity: number }[]; // quantity 1–20
}

export interface AccountPrefill {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  suburb: string | null;
}
