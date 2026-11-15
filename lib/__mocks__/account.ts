// Storybook mock for lib/account.ts — fixture-backed, no network, no Clerk.
import type { Order } from "../lib/types";

let myOrders: Order[] = [];

export function __setMyOrders(next: Order[]) {
  myOrders = next;
}

export async function getMyOrders(_token: string): Promise<Order[]> {
  await new Promise((r) => setTimeout(r, 50));
  return structuredClone(myOrders);
}
