import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FulfilmentSelector } from "@/components/checkout/fulfilment-selector";
import { settings } from "../fixtures/menu";

const meta: Meta<typeof FulfilmentSelector> = {
  title: "Blocks/Checkout/Fulfilment Selector",
  component: FulfilmentSelector,
};

export default meta;
type Story = StoryObj<typeof FulfilmentSelector>;

export const PickupSelected: Story = {
  render: () => (
    <FulfilmentSelector
      fulfilment="pickup"
      onSelect={() => {}}
      pickupDetail={`Any time ${settings.pickup_start_time}–${settings.pickup_end_time}. Pay in person.`}
    />
  ),
};

export const DeliverySelected: Story = {
  render: () => (
    <FulfilmentSelector
      fulfilment="delivery"
      onSelect={() => {}}
      pickupDetail={`Any time ${settings.pickup_start_time}–${settings.pickup_end_time}. Pay in person.`}
    />
  ),
};

export const NoPickupTimes: Story = {
  render: () => <FulfilmentSelector fulfilment="pickup" onSelect={() => {}} pickupDetail={null} />,
};
