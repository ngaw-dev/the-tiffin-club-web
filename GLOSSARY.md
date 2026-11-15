# The Tiffin Club

A same-day tiffin storefront: guests order from today's menu before the cutoff, then pick up or receive delivery, paying in person.

## Language

### Ordering

**Order**:
A guest's request for items from a single day's menu, identified by its Manage Token.
_Avoid_: Purchase, booking, cart (the cart is pre-order and becomes an Order only when placed)

**Manage Token**:
The secret 64-hex string that authorizes viewing and changing (or cancelling) a single Order. Expires at end of the order day.
_Avoid_: Order ID, session, order link

**Ordering Window**:
The period on a given day — opening 09:00 and closing at the Cutoff — during which new Orders may be placed. Server-computed; clients never derive it from a local clock.
_Avoid_: Opening hours, business hours

**Cutoff**:
The time after which an Order can no longer be modified or cancelled. Comes from the menu's cutoff, falling back to the store's order cutoff time.
_Avoid_: Deadline, closing time

**Guest**:
A person who orders without an account, identified only by email or phone. All orders are currently guest orders.
_Avoid_: Customer, user, account holder

**Fulfilment**:
How a Guest receives an Order: pickup or delivery.
_Avoid_: Shipping, dispatch

### Menu

**Today's Menu**:
The single day's offering — one Main Meal plus any Extras — shown on the storefront and identified only by date; there is no multi-day catalogue.
_Avoid_: Menu (unqualified), catalogue, dishes

**Main Meal**:
The primary dish of Today's Menu, the default item pre-seeded into the cart.
_Avoid_: Special, combo, thali (implementation detail)

**Extra**:
An optional item on Today's Menu added alongside the Main Meal.
_Avoid_: Add-on, side

**Tiffin**:
The guest's in-progress selection of items before it becomes an Order. Shown as "Your tiffin" in the storefront summary.
_Avoid_: Cart, basket

### Status

**Placed**:
The state of an Order from the moment it is accepted until it is Cancelled or handed over.
_Avoid_: Confirmed, pending, processing

**Cancelled**:
The terminal state of an Order withdrawn by its Guest before the Cutoff.
_Avoid_: Refunded, void, deleted
