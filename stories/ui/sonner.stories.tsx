import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

const meta: Meta<typeof Toaster> = {
  title: "UI/Sonner (Toaster)",
  component: Toaster,
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <>
      <Toaster />
      <div className="flex gap-2">
        <Button onClick={() => toast("Order confirmed")}>Show toast</Button>
        <Button variant="outline" onClick={() => toast.success("Payment received")}>
          Success
        </Button>
        <Button variant="destructive" onClick={() => toast.error("Delivery failed")}>
          Error
        </Button>
      </div>
    </>
  ),
};
