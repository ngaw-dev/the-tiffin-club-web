import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GuestDetailsForm, emptyCheckoutForm } from "@/components/checkout/guest-details-form";
import type { CheckoutForm } from "@/components/checkout/guest-details-form";
import { settings } from "../fixtures/menu";

const meta: Meta<typeof GuestDetailsForm> = {
  title: "Blocks/Checkout/Guest Details Form",
  component: GuestDetailsForm,
};

export default meta;
type Story = StoryObj<typeof GuestDetailsForm>;

const prefilled: CheckoutForm = {
  name: "Amol W",
  email: "amol@example.com",
  phone: "+64 21 555 0199",
  address: "12 Hopper Street, Apt 3",
  suburb: "Te Aro",
};

export const PickupEmpty: Story = {
  render: () => (
    <GuestDetailsForm
      form={emptyCheckoutForm}
      fulfilment="pickup"
      deliverySuburbs={settings.delivery_suburbs}
      onChange={() => {}}
    />
  ),
};

export const DeliveryPrefilled: Story = {
  render: () => (
    <GuestDetailsForm
      form={prefilled}
      fulfilment="delivery"
      deliverySuburbs={settings.delivery_suburbs}
      onChange={() => {}}
    />
  ),
};

export const DeliveryWithErrors: Story = {
  render: () => (
    <GuestDetailsForm
      form={emptyCheckoutForm}
      fulfilment="delivery"
      deliverySuburbs={settings.delivery_suburbs}
      fieldErrors={{
        name: "Name is required.",
        phone: "Email or phone is required.",
        address: "Delivery address is required.",
        suburb: "Choose your suburb.",
      }}
      onChange={() => {}}
    />
  ),
};
