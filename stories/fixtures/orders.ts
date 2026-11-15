import type { Order, OrderingWindow } from "@/lib/types";

/** Orders in glossary language: statuses along the Fulfilment pipeline. */

const items = [
  { name: "Butter Chicken", description: "Main", price: 1500, quantity: 1, unit_price: 1500 },
  { name: "Garlic Naan", description: "Extra", price: 350, quantity: 2, unit_price: 350 },
];

const customer = {
  name: "Amol W.",
  email: "amol@example.com",
  phone: "+61 400 000 000",
  address: "12 Example St",
  suburb: "Newtown",
};

function base(overrides: Partial<Order>): Order {
  const today = new Date().toISOString().slice(0, 10);
  return {
    manage_token: "tok_fixture",
    status: "placed",
    fulfilment: "pickup",
    customer,
    delivery_notes: null,
    items,
    total: 2200,
    payment: "in_person",
    placed_at: `${today}T05:30:00Z`,
    expires_at: `${today}T23:59:59Z`,
    ...overrides,
  };
}

/** Placed, before Cutoff — cancel affordance visible. */
export const placedOrderBeforeCutoff = base({});

/** Confirmed by the kitchen, before Cutoff. */
export const confirmedOrder = base({
  status: "confirmed",
  fulfilment: "delivery",
  delivery_notes: "Leave at the door, please.",
});

/** Ready for pickup. */
export const readyForPickupOrder = base({ status: "ready_for_pickup" });

/** Out for delivery. */
export const outForDeliveryOrder = base({ status: "out_for_delivery", fulfilment: "delivery" });

/** Completed — picked up. */
export const completedPickupOrder = base({ status: "completed" });

/** Completed — delivered. */
export const completedDeliveryOrder = base({ status: "completed", fulfilment: "delivery" });

/** Cancelled — stepper dimmed, destructive banner, no cancel button. */
export const cancelledOrder = base({ status: "cancelled" });

/** Customer fields absent (not eager-loaded). */
export const orderWithoutCustomer = base({ customer: undefined });

export const orderingWindows: Record<OrderingWindow["state"], OrderingWindow> = {
  open: {
    state: "open",
    open: true,
    closing_soon: false,
    opens_at: "17:00",
    closes_at: "21:00",
  },
  closing_soon: {
    state: "closing_soon",
    open: true,
    closing_soon: true,
    opens_at: "17:00",
    closes_at: "20:45",
  },
  closed: {
    state: "closed",
    open: false,
    closing_soon: false,
    opens_at: "17:00",
    closes_at: "21:00",
  },
};
