// Storybook mock for lib/api.ts — fixture-backed, no network.
import type { Order, StoreSettings, TodayMenu } from "../lib/types";

let orders: Order[] = [];
let settings: StoreSettings = {
  delivery_suburbs: ["Newtown", "Enmore", "Stanmore"],
  order_cutoff_time: "20:45",
  pickup_start_time: "17:30",
  pickup_end_time: "19:00",
  pickup_address: "12 Cuba St, Te Aro, Wellington",
  store_phone: "+61 400 000 000",
  store_phone_alternate: "+61 400 000 001",
  store_email: "hello@tiffinclub.example",
};

/** Set the orders the mock serves (used from story decorators). */
export function __setOrders(next: Order[]) {
  orders = next;
}

export function __setSettings(next: StoreSettings) {
  settings = next;
}

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;
  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export async function getOrder(token: string): Promise<Order> {
  await delay();
  const found = orders.find((o) => o.manage_token === token);
  if (!found) throw new ApiError(404, "Order not found");
  return structuredClone(found);
}

export async function lookupOrder(input: {
  token: string;
  email?: string;
  phone?: string;
}): Promise<Order> {
  await delay();
  const found = orders.find((o) => o.manage_token === input.token);
  if (!found) throw new ApiError(404, "No order found for those details.");
  return structuredClone(found);
}

export async function cancelOrder(token: string): Promise<void> {
  await delay();
  const found = orders.find((o) => o.manage_token === token);
  if (!found) throw new ApiError(404, "Order not found");
  found.status = "cancelled";
}

export async function getSettings(): Promise<StoreSettings> {
  await delay();
  return settings;
}

export async function getTodayMenu(): Promise<TodayMenu> {
  throw new ApiError(500, "not used in stories");
}

const delay = () => new Promise((r) => setTimeout(r, 50));
