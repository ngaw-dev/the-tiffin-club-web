import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OrderCard } from "@/components/order-card";
import { settings } from "../fixtures/menu";
import {
  cancelledOrder,
  completedDeliveryOrder,
  completedPickupOrder,
  confirmedOrder,
  orderWithoutCustomer,
  outForDeliveryOrder,
  placedOrderBeforeCutoff,
  readyForPickupOrder,
} from "../fixtures/orders";

const meta: Meta<typeof OrderCard> = {
  title: "Domain/Order Card",
  component: OrderCard,
};

export default meta;
type Story = StoryObj<typeof OrderCard>;

const render =
  (order: Parameters<typeof OrderCard>[0]["order"], withCancel = true) =>
  () => (
    <div className="">
      <OrderCard
        order={order}
        cutoffTime={withCancel ? "20:45" : null}
        pickupAddress={settings.pickup_address}
        onCancel={withCancel ? () => {} : undefined}
        className=""
      />
    </div>
  );

export const PlacedBeforeCutoff: Story = { render: render(placedOrderBeforeCutoff) };
export const ConfirmedDelivery: Story = { render: render(confirmedOrder) };
export const ReadyForPickup: Story = { render: render(readyForPickupOrder) };
export const OutForDelivery: Story = { render: render(outForDeliveryOrder) };
export const CompletedPickup: Story = { render: render(completedPickupOrder, false) };
export const CompletedDelivery: Story = { render: render(completedDeliveryOrder, false) };
export const Cancelled: Story = { render: render(cancelledOrder, false) };
export const WithoutCustomer: Story = { render: render(orderWithoutCustomer) };
