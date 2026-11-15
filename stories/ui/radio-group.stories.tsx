import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof RadioGroup> = {
  title: "UI/Radio Group",
  component: RadioGroup,
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

const render = (defaultValue?: string) => () => (
  <RadioGroup defaultValue={defaultValue} className="gap-3">
    <div className="flex items-center gap-2">
      <RadioGroupItem value="pickup" id="r-pickup" />
      <Label htmlFor="r-pickup">Pickup</Label>
    </div>
    <div className="flex items-center gap-2">
      <RadioGroupItem value="delivery" id="r-delivery" />
      <Label htmlFor="r-delivery">Delivery</Label>
    </div>
  </RadioGroup>
);

export const Unselected: Story = { render: render() };
export const PickupSelected: Story = { render: render("pickup") };
export const DeliverySelected: Story = { render: render("delivery") };
