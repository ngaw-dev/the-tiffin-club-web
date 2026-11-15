import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CheckoutItems } from "@/components/checkout/checkout-items";
import { cartLines } from "../fixtures/menu";

const meta: Meta<typeof CheckoutItems> = {
  title: "Blocks/Checkout/Checkout Items",
  component: CheckoutItems,
};

export default meta;
type Story = StoryObj<typeof CheckoutItems>;

export const TypicalCart: Story = {
  render: () => <CheckoutItems lines={cartLines} onQuantityChange={() => {}} />,
};

export const SingleMain: Story = {
  render: () => (
    <CheckoutItems lines={[{ item: cartLines[0].item, quantity: 2 }]} onQuantityChange={() => {}} />
  ),
};
