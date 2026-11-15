import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "@/components/ui/textarea";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Empty: Story = { args: { placeholder: "Delivery notes (optional)" } };

export const Filled: Story = {
  args: { defaultValue: "Leave at the door, please ring the bell twice." },
};

export const Disabled: Story = {
  args: { placeholder: "Delivery notes", disabled: true },
};
