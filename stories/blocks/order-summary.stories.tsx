import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OrderSummary } from "@/components/checkout/order-summary";
import { cartLines } from "../fixtures/menu";

const meta: Meta<typeof OrderSummary> = {
  title: "Blocks/Checkout/Order Summary",
  component: OrderSummary,
};

export default meta;
type Story = StoryObj<typeof OrderSummary>;

const total = cartLines[0].item.price + cartLines[1].item.price * cartLines[1].quantity;

export const Pickup: Story = {
  render: () => <OrderSummary lines={cartLines} total={total} fulfilment="pickup" />,
};

export const Delivery: Story = {
  render: () => <OrderSummary lines={cartLines} total={total} fulfilment="delivery" />,
};

export const Submitting: Story = {
  render: () => <OrderSummary lines={cartLines} total={total} fulfilment="pickup" submitting />,
};
