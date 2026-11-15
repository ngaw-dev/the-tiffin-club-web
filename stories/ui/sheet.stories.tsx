import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const meta: Meta<typeof Sheet> = {
  title: "UI/Sheet",
  component: Sheet,
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export default meta;
type Story = StoryObj<typeof Sheet>;

const render = (side: "top" | "bottom" | "left" | "right") => () => (
  <div className="p-8">
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open {side} sheet</Button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Your tiffin order</SheetTitle>
          <SheetDescription>Manage your order any time before Cutoff.</SheetDescription>
        </SheetHeader>
        <div className="px-4 text-sm text-muted-foreground">
          Butter Chicken × 1, Garlic Naan × 2
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
);

export const SideRight: Story = { render: render("right") };
export const SideLeft: Story = { render: render("left") };
export const SideTop: Story = { render: render("top") };
export const SideBottom: Story = { render: render("bottom") };
