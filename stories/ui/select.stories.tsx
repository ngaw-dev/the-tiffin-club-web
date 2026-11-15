import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectStoryArgs {
  disabled: boolean;
  placeholder: string;
}

const meta: Meta<SelectStoryArgs> = {
  title: "UI/Select",
  component: SelectTrigger,
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<SelectStoryArgs>;

const meals = ["Breakfast", "Lunch", "Dinner", "Snack"];

export const Default: Story = {
  args: { disabled: false, placeholder: "Choose a meal" },
  render: ({ disabled, placeholder }) => (
    <Select defaultValue="Lunch">
      <SelectTrigger className="w-[180px]" disabled={disabled}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {meals.map((meal) => (
          <SelectItem key={meal} value={meal}>
            {meal}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState<string>();
    return (
      <div className="grid max-w-xs gap-2">
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a meal" />
          </SelectTrigger>
          <SelectContent>
            {meals.map((meal) => (
              <SelectItem key={meal} value={meal}>
                {meal}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">Selected: {value ?? "none"}</p>
      </div>
    );
  },
};
